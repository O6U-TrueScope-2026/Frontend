import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Upload, Image as ImageIcon, ArrowLeft, 
  CheckCircle2, RotateCcw, Search, Zap,
  FileText, X, AlertTriangle, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import SEO from '../common/SEO';
import apiClient from '../../api/client';
import i18n from '../../i18n';
import { useAuthStore } from '../../store/authStore';

type DetectorState = 'idle' | 'scanning' | 'results';

interface AnalysisResult {
  confidenceScore: number;
  verdict: 'real' | 'fake';
}

export function MultimodalDetector() {
  const { t } = useTranslation();
  const { accessToken } = useAuthStore();
  
  const [state, setState] = useState<DetectorState>('idle');
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisTime, setAnalysisTime] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imagePreviewUrl = useMemo(() => {
    if (selectedImage) {
      return URL.createObjectURL(selectedImage);
    }
    return null;
  }, [selectedImage]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Image Format Validation
      const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedFormats.includes(file.type)) {
        toast.error(t('errors.invalid_image_format'));
        return;
      }

      // 2. Image Size Validation (10MB Limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(t('errors.file_too_large'));
        return;
      }

      setSelectedImage(file);
    }
  };

  const startAnalysis = async () => {
    // 1. Text Validation: Minimum 10 words
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;

    if (wordCount < 10) {
      toast.error(t('errors.multimodal_text_criteria'));
      return;
    }

    if (!selectedImage) {
      toast.error(t('errors.no_file_selected'));
      return;
    }

    setIsAnalyzing(true);
    setState('scanning');
    
    const formData = new FormData();
    formData.append('text', text);
    formData.append('image', selectedImage);

    try {
      // API Endpoint: /api/imageText/analyze-image-text
      const response = await apiClient.post('/api/imageText/analyze-image-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      const { confidenceScore, verdict } = response.data;
      
      setResult({
        confidenceScore: confidenceScore ?? 0,
        verdict: verdict?.toLowerCase() === 'real' ? 'real' : 'fake'
      });
      
      setAnalysisTime(new Date().toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US'));
      setState('results');
    } catch (error: any) {
      console.error('Multimodal analysis error:', error);
      setState('idle');
      
      if (error.response?.status === 400 || error.response?.status === 500) {
        toast.error(error.response?.data?.message || t('errors.generic'));
      } else {
        toast.error(t('errors.generic'));
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetDetector = () => {
    setState('idle');
    setText('');
    setSelectedImage(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] py-12 px-4 transition-colors duration-300">
      <SEO 
        title={t('multimodal.title')} 
        description={t('multimodal.subtitle')} 
      />
      <div className="max-w-[1000px] mx-auto">
        
        {/* Navigation */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-[var(--color-content-muted)] hover:text-brand-primary transition-colors mb-12 font-bold group"
        >
          <ArrowLeft size={18} className="rtl:-scale-x-100 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
          {t('nav.back_to_home')}
        </Link>

        <AnimatePresence mode="wait">
          {/* IDLE STATE */}
          {state === 'idle' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-[0_8px_30px_rgb(99,102,241,0.3)] mb-6">
                  <Zap size={40} />
                </div>
                <h1 className="text-3xl font-bold text-[var(--color-content-main)] mb-2">
                  {t('multimodal.title')}
                </h1>
                <p className="text-[var(--color-content-muted)] font-medium max-w-md">
                  {t('multimodal.subtitle')}
                </p>
              </div>

              <div className="w-full max-w-3xl bg-[var(--color-surface-main)] rounded-[2.5rem] shadow-soft-xl border border-[var(--color-border-subtle)] p-6 md:p-10 flex flex-col gap-8">
                
                {/* Text Input Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-[var(--color-content-main)] flex items-center gap-2">
                      <FileText size={18} className="text-indigo-500" />
                      {t('multimodal.input_label')}
                    </label>
                  </div>
                  <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t('multimodal.placeholder')}
                    className="w-full min-h-[150px] p-6 rounded-2xl bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] text-[var(--color-content-main)] placeholder-[var(--color-content-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none font-medium"
                  />
                  <div className="flex justify-between items-center px-2 text-[10px] font-black uppercase tracking-widest mt-1">
                    <span className={text.trim() === '' ? 'text-red-500' : (text.trim().split(/\s+/).filter(word => word.length > 0).length < 10 ? 'text-red-500' : 'text-green-500')}>
                      {text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(word => word.length > 0).length} / 10 {t('detector.text.words')}
                    </span>
                    <span className="text-[var(--color-content-muted)]">
                      {text.length} {t('detector.text.char_count')}
                    </span>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="flex flex-col gap-4">
                  <label className="text-sm font-bold text-[var(--color-content-main)] flex items-center gap-2">
                    <ImageIcon size={18} className="text-indigo-500" />
                    {t('multimodal.upload_label')}
                  </label>
                  
                  <div className="relative group">
                    <AnimatePresence mode="wait">
                      {!selectedImage ? (
                        <motion.div 
                          key="upload-zone"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full aspect-video border-2 border-dashed border-[var(--color-border-subtle)] rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group"
                        >
                          <div className="w-16 h-16 rounded-full bg-[var(--color-surface-soft)] text-[var(--color-content-muted)] flex items-center justify-center group-hover:scale-110 group-hover:text-indigo-500 transition-all duration-300">
                            <Upload size={32} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-[var(--color-content-main)]">
                              {t('multimodal.upload_box')}
                            </p>
                            <p className="text-[10px] text-[var(--color-content-muted)] font-black uppercase tracking-widest mt-1">
                              {t('detector.upload.box_image_formats')}
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="preview-zone"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative w-full aspect-video rounded-3xl overflow-hidden border border-[var(--color-border-subtle)] shadow-lg bg-[var(--color-surface-soft)]"
                        >
                          <img src={imagePreviewUrl!} alt="Preview" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                            <button 
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-6 py-2 bg-white text-black font-bold rounded-xl text-sm hover:scale-105 transition-all shadow-xl"
                            >
                              {t('multimodal.change_image')}
                            </button>
                            <button 
                              type="button"
                              onClick={() => setSelectedImage(null)}
                              className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl text-sm hover:scale-105 transition-all shadow-xl"
                            >
                              {t('multimodal.remove_image')}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/jpg" 
                    onChange={handleFileChange}
                    className="hidden" 
                    ref={fileInputRef}
                  />
                </div>

                <button 
                  onClick={startAnalysis}
                  disabled={!text.trim() || !selectedImage || isAnalyzing}
                  className={`w-full h-16 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 ${
                    !text.trim() || !selectedImage || isAnalyzing
                      ? 'bg-[var(--color-surface-soft)] text-[var(--color-content-muted)] border border-[var(--color-border-subtle)] cursor-not-allowed opacity-60' 
                      : 'bg-brand-gradient text-white hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {t('multimodal.analyzing')}
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      {t('multimodal.analyze')}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* SCANNING STATE */}
          {state === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative w-32 h-32 mb-10">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-dashed border-indigo-500/30"
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-4 rounded-full bg-indigo-500/10 flex items-center justify-center"
                >
                  <Search size={40} className="text-indigo-500" />
                </motion.div>
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-2">
                {t('detector.scanning.text_title')}
              </h2>
              <p className="text-[var(--color-content-muted)] font-medium text-center max-w-md">
                {t('detector.scanning.text_subtitle')}
              </p>
            </motion.div>
          )}

          {/* RESULTS STATE */}
          {state === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-8 w-full max-w-4xl mx-auto py-10"
            >
              {/* Verdict Bar */}
              <div className="w-full bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-soft-xl">
                 <div className="flex items-center gap-6 mb-6 md:mb-0">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg ${
                      result?.verdict === 'real' ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20'
                    }`}>
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[var(--color-content-main)]">
                        {result?.verdict === 'real' ? t('verdict.real', 'Real') : t('verdict.fake', 'Fake')}
                      </h2>
                      <p className={`text-sm font-bold ${
                        result?.verdict === 'real' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {t('detector.results.confidence', 'Confidence Score')}: {result?.confidenceScore}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 w-full md:w-auto">
                    <div className="flex-1 md:w-64 h-2.5 bg-[var(--color-surface-soft)] rounded-full overflow-hidden border border-[var(--color-border-subtle)]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result?.confidenceScore}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        className={`h-full ${
                          result?.verdict === 'real' ? 'bg-green-500' : 'bg-red-500'
                        }`} 
                      />
                    </div>
                    <span className={`shrink-0 px-6 py-2 text-xs font-black uppercase tracking-widest rounded-full border ${
                      result?.verdict === 'real' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {result?.verdict === 'real' ? t('dashboard.status.pass', 'Pass') : t('dashboard.status.fail', 'Fail')}
                    </span>
                 </div>
               </div>

              {/* Metadata Box */}
              <div className="w-full bg-[var(--color-surface-main)] rounded-[2rem] border border-[var(--color-border-subtle)] p-10 flex flex-col md:flex-row justify-between gap-10 shadow-soft-xl">
                <div className="flex flex-col gap-1">
                  <h4 className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-[0.2em] mb-2">Original File Name</h4>
                  <p className="text-base font-bold text-[var(--color-content-main)] truncate max-w-[300px]">{selectedImage?.name}</p>
                  <p className="text-xs text-[var(--color-content-muted)] font-medium">Format: {selectedImage?.type.split('/')[1].toUpperCase()} | Size: {((selectedImage?.size || 0) / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <div className="md:text-end flex flex-col gap-1">
                  <h4 className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-[0.2em] mb-2">Analysis Timestamp</h4>
                  <p className="text-base font-bold text-[var(--color-content-main)]">{analysisTime}</p>
                  <p className="text-xs font-black uppercase text-green-500 tracking-widest flex items-center md:justify-end gap-2">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-green-500" />
                    {t('detector.results.completed', 'Process Completed')}
                  </p>
                </div>
              </div>

              {/* Context Reference */}
              <div className="bg-[var(--color-surface-main)] rounded-[2.5rem] border border-[var(--color-border-subtle)] p-8 shadow-soft-xl">
                <h3 className="text-xl font-bold text-[var(--color-content-main)] mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Search size={20} />
                  </div>
                  {t('multimodal.results.context_reference')}
                </h3>
                
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Image Part */}
                  <div className="lg:w-1/2 flex flex-col gap-4">
                    <span className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-widest">
                      {t('multimodal.results.submitted_image')}
                    </span>
                    <div className="rounded-3xl overflow-hidden border border-[var(--color-border-subtle)] shadow-lg aspect-video bg-[var(--color-surface-soft)]">
                      <img src={imagePreviewUrl!} alt="Original" className="w-full h-full object-contain" />
                    </div>
                  </div>

                  {/* Text Part */}
                  <div className="lg:w-1/2 flex flex-col gap-4">
                    <span className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-widest">
                      {t('multimodal.results.submitted_text')}
                    </span>
                    <div className="p-8 rounded-3xl bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] min-h-[200px] h-full">
                      <p className="text-sm font-medium text-[var(--color-content-main)] leading-relaxed whitespace-pre-wrap italic opacity-80">
                        "{text}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={resetDetector}
                  className="w-full sm:w-auto px-10 py-4 bg-brand-gradient text-white font-bold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  {t('multimodal.back_to_analysis')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
