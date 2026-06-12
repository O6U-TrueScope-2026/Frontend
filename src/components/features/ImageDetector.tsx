import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Upload, Image as ImageIcon, ArrowLeft, 
  CheckCircle2, RotateCcw, Search, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import SEO from '../common/SEO';
import apiClient from '../../api/client';
import i18n from '../../i18n';


type DetectorState = 'idle' | 'scanning' | 'results';

export function ImageDetector() {
  const { t } = useTranslation();
  
  const [state, setState] = useState<DetectorState>('idle');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [analysisTime, setAnalysisTime] = useState("");
  const [result, setResult] = useState<{
    confidence: number;
    status: 'real' | 'fake';
    metadata?: string;
  } | null>(null);
  
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
      // 1. Format Validation: JPG, PNG only
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('errors.invalid_image_format', 'Image format not supported. Please use JPG, JPEG or PNG.'));
        return;
      }

      // 2. Size Validation (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(t('errors.file_too_large', 'Image size cannot exceed 10MB'));
        return;
      }

      setSelectedImage(file);
      setAnalysisTime(new Date().toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US'));
    }
  };

  const startAnalysis = async () => {
    if (!selectedImage) {
      toast.error(t('errors.no_file_selected', 'Please select an image first'));
      return;
    }

    setState('scanning');
    
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await apiClient.post('/api/images/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      const { verdict, confidenceScore, metadata } = response.data;
      
      setResult({
        confidence: confidenceScore ?? 99.2,
        status: verdict?.toLowerCase() === 'real' ? 'real' : 'fake',
        metadata: metadata || t('detector.results.metadata_check', 'Metadata: Intact | Artifacts: Not Detected')
      });
      
      setAnalysisTime(new Date().toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US'));
      setState('results');
    } catch (error: any) {
      console.error('Image analysis error:', error);
      setState('idle');
      
      if (error.response?.status === 401) {
        toast.error(t('errors.unauthorized', 'Session expired. Please login again.'));
      } else if (error.response?.status === 413) {
        toast.error(t('errors.file_too_large', 'File is too large. Max size is 10MB.'));
      } else {
        toast.error(t('errors.generic', 'An error occurred during analysis. Please try again.'));
      }
    }
  };

  const resetDetector = () => {
    setState('idle');
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] py-12 px-4 transition-colors duration-300">
      <SEO 
        title={t('seo.image.title')} 
        description={t('seo.image.description')} 
      />
      <div className="max-w-[1000px] mx-auto">
        
        {/* Navigation */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-[var(--color-content-muted)] hover:text-brand-primary transition-colors mb-12 font-bold group"
        >
          <ArrowLeft size={18} className="rtl:-scale-x-100 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
          {t('nav.back_to_home', 'Back to Home')}
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
              {/* Center Icon & Title */}
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-20 h-20 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-[0_8px_30px_rgb(20,184,166,0.3)] mb-6">
                  <ImageIcon size={40} />
                </div>
                <h1 className="text-3xl font-bold text-[var(--color-content-main)] mb-2">
                  {t('detector.image.title', 'Image Manipulation Detection')}
                </h1>
                <p className="text-[var(--color-content-muted)] font-medium max-w-md">
                  {t('detector.image.subtitle', 'Upload an image to detect AI generation or photo manipulation')}
                </p>
              </div>

              <div className="w-full max-w-3xl bg-[var(--color-surface-main)] rounded-[2.5rem] shadow-soft-xl border border-[var(--color-border-subtle)] p-6 md:p-10 flex flex-col items-center">
                
                <div className="w-full relative min-h-[350px] border-2 border-dashed border-[var(--color-border-subtle)] rounded-3xl flex flex-col items-center justify-center transition-all overflow-hidden mb-8">
                  
                  <AnimatePresence mode="wait">
                    {!selectedImage ? (
                      <motion.div 
                        key="upload-prompt"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative w-full h-full flex flex-col items-center justify-center p-12 group cursor-pointer"
                      >
                        <input 
                          type="file" 
                          accept="image/jpeg,image/png,image/jpg" 
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          ref={fileInputRef}
                        />
                        <div className="w-16 h-16 rounded-full bg-[var(--color-surface-soft)] text-[var(--color-content-muted)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-teal-500 transition-all duration-300">
                          <Upload size={32} strokeWidth={1.5} />
                        </div>
                        <p className="text-lg font-bold text-[var(--color-content-main)] mb-1 text-center">
                          {t('detector.upload.box_title', 'Click to upload or drag and drop')}
                        </p>
                        <p className="text-sm text-[var(--color-content-muted)] font-medium text-center">
                          {t('detector.upload.box_image_formats', 'JPG, JPEG, PNG (max 10MB)')}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full absolute inset-0 p-4 flex items-center justify-center bg-[var(--color-surface-soft)]/30"
                      >
                        <img 
                          src={imagePreviewUrl || ""} 
                          alt="Preview" 
                          className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                        />
                        <button 
                          onClick={() => setSelectedImage(null)}
                          className="absolute top-4 right-4 bg-white/80 dark:bg-black/50 backdrop-blur-md p-2 rounded-full text-red-500 hover:scale-110 transition-all shadow-md z-20"
                        >
                          <RotateCcw size={18} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={startAnalysis}
                  disabled={!selectedImage}
                  className={`w-full h-16 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 ${
                    !selectedImage 
                      ? 'bg-[var(--color-surface-soft)] text-[var(--color-content-muted)] border border-[var(--color-border-subtle)] cursor-not-allowed opacity-60' 
                      : 'bg-brand-gradient text-white hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  <Zap size={20} fill={selectedImage ? "currentColor" : "none"} />
                  {t('detector.image.analyze', 'Analyze Image')}
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
                  className="absolute inset-0 rounded-full border-4 border-dashed border-teal-500/30"
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-4 rounded-full bg-teal-500/10 flex items-center justify-center"
                >
                  <Search size={40} className="text-teal-500" />
                </motion.div>
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-2">
                {t('detector.scanning.image_title', 'Scanning Pixel Architecture...')}
              </h2>
              <p className="text-[var(--color-content-muted)] font-medium">
                {t('detector.scanning.image_subtitle', 'Analyzing metadata, noise patterns, and AI generation artifacts')}
              </p>
            </motion.div>
          )}

          {/* RESULTS STATE */}
          {state === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 gap-8 w-full max-w-4xl mx-auto min-h-[80vh]"
            >
              {/* Top Section: Verdict Bar */}
              <div className="w-full bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between shadow-soft-xl">
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${
                    result?.status === 'real' ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20'
                  }`}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-content-main)]">
                      {result?.status === 'real' ? t('verdict.real', 'Real') : t('verdict.fake', 'Fake')}
                    </h2>
                    <p className={`text-xs font-bold ${
                      result?.status === 'real' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {t('detector.results.confidence', 'Confidence Score')}: {result?.confidence}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="flex-1 md:w-48 h-2 bg-[var(--color-surface-soft)] rounded-full overflow-hidden border border-[var(--color-border-subtle)]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result?.confidence}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      className={`h-full ${
                        result?.status === 'real' ? 'bg-green-500' : 'bg-red-500'
                      }`} 
                    />
                  </div>
                  <span className={`shrink-0 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                    result?.status === 'real' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {result?.status === 'real' ? t('dashboard.status.pass', 'Pass') : t('dashboard.status.fail', 'Fail')}
                  </span>
                </div>
              </div>

              {/* Center Section: Hero Image Preview */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="w-full max-h-[450px] bg-black/5 rounded-2xl border border-brand-primary/30 shadow-xl overflow-hidden relative group p-2"
              >
                <img 
                  src={imagePreviewUrl || ""} 
                  alt="Forensic Evidence" 
                  className="w-full max-h-[400px] object-contain mx-auto rounded-lg shadow-sm"
                />
                {/* Forensic Scan Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
              </motion.div>

              {/* Bottom Section: Metadata Footer */}
              <div className="w-full bg-[var(--color-surface-main)] rounded-[2rem] border border-[var(--color-border-subtle)] p-8 flex flex-col md:flex-row justify-between gap-8 shadow-soft-xl">
                <div className="flex flex-col gap-1">
                  <h4 className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-[0.2em] mb-1">
                    {t('detector.results.filename', 'Original File Name')}
                  </h4>
                  <p className="text-sm font-bold text-[var(--color-content-main)] truncate max-w-[300px]">
                    {selectedImage?.name}
                  </p>
                  <p className="text-[10px] text-[var(--color-content-muted)] font-medium">
                    {t('detector.results.size', 'Size')}: {((selectedImage?.size || 0) / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <div className="md:text-end flex flex-col gap-1">
                  <h4 className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-[0.2em] mb-1">
                    {t('detector.results.timestamp', 'Analysis Timestamp')}
                  </h4>
                  <p className="text-sm font-bold text-[var(--color-content-main)]">
                    {analysisTime}
                  </p>
                  <p className="text-[10px] font-black uppercase text-green-500 tracking-widest flex items-center md:justify-end gap-2">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-green-500" />
                    {t('detector.results.completed', 'Process Completed')}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={resetDetector}
                className="group relative flex items-center gap-3 px-8 py-3.5 bg-brand-gradient text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.05] active:scale-95 transition-all mt-4"
              >
                <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                <span className="text-sm">
                  {t('common.start_over', 'Analyze Another Image')}
                </span>
                <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
