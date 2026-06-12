import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FileText, ArrowLeft, CheckCircle2, 
  RotateCcw, Search, Zap,
  MessageSquare, AlertCircle, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import SEO from '../common/SEO';
import apiClient from '../../api/client';

type DetectorState = 'idle' | 'scanning' | 'results';

export function TextDetector() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [state, setState] = useState<DetectorState>('idle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [analysisTime, setAnalysisTime] = useState("");
  const [result, setResult] = useState<{
    confidence: number;
    status: 'real' | 'fake'|'ai';
  } | null>(null);
  
  const wordCount = useMemo(() => {
    return inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [inputText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const startAnalysis = async () => {
    // Strict Validation: Minimum 20 words
    if (wordCount < 20) {
      toast.error(t('errors.text_length_requirement'));
      return;
    }
    
    setIsAnalyzing(true);
    setState('scanning');
    
    try {
      const response = await apiClient.post('/api/text/upload-text', { 
        text: inputText 
      });
      
      const { verdict, confidenceScore } = response.data;
      
      setResult({
        confidence: confidenceScore ,
        status: verdict?.toLowerCase() === 'real' ? 'real' : 'fake'
      });
      
      setAnalysisTime(new Date().toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US'));
      setState('results');
    } catch (error: any) {
      console.error('Text analysis error:', error);
      setState('idle');
      
      if (error.response?.status === 401) {
        toast.error(t('errors.unauthorized', 'Session expired. Please login again.'));
      } else {
        toast.error(t('errors.generic', 'An error occurred during analysis. Please try again.'));
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetDetector = () => {
    setState('idle');
    setInputText("");
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] py-12 px-4 transition-colors duration-300">
      <SEO 
        title={t('seo.text.title')} 
        description={t('seo.text.description')} 
      />
      <div className="max-w-[1000px] mx-auto">
        
        {/* Navigation */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-[var(--color-content-muted)] hover:text-orange-500 transition-colors mb-12 font-bold group"
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
                <div className="w-20 h-20 rounded-2xl bg-gradient-orange-red flex items-center justify-center text-white shadow-[0_8px_30px_rgb(251,146,60,0.3)] mb-6">
                  <FileText size={40} />
                </div>
                <h1 className="text-3xl font-bold text-[var(--color-content-main)] mb-2">
                  {t('detector.text.title', 'Fake News Detection')}
                </h1>
                <p className="text-[var(--color-content-muted)] font-medium max-w-md">
                  {t('detector.text.subtitle', 'Analyze text to identify fake or misleading information')}
                </p>
              </div>

              <div className="w-full max-w-3xl bg-[var(--color-surface-main)] rounded-[2.5rem] shadow-soft-xl border border-[var(--color-border-subtle)] p-6 md:p-10 flex flex-col items-stretch">
                
                <div className="mb-6">
                   <h3 className="text-base font-bold text-[var(--color-content-main)] mb-4">
                     {t('detector.text.input_label', 'Paste or type the text you want to analyze')}
                   </h3>
                   <div className="relative group">
                     <textarea 
                        value={inputText}
                        onChange={handleTextChange}
                        placeholder={t('detector.text.placeholder', 'Enter news article, social media post, or any text content...')}
                        className="w-full h-64 bg-[var(--color-surface-soft)]/50 border border-[var(--color-border-subtle)] rounded-3xl p-8 text-[var(--color-content-main)] placeholder:text-[var(--color-content-muted)] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none font-medium leading-relaxed"
                        dir={isRTL ? 'rtl' : 'ltr'}
                     />
                     <div className={`absolute bottom-6 ${isRTL ? 'left-8' : 'right-8'} pointer-events-none`}>
                        <MessageSquare size={20} className="text-[var(--color-content-muted)] opacity-20 group-focus-within:opacity-40 transition-opacity" />
                     </div>
                   </div>
                   
                   <div className={`mt-4 px-2 flex items-center justify-between`}>
                      <span className={`text-sm font-bold ${wordCount < 20 ? 'text-red-500/70' : 'text-green-500'}`}>
                        {wordCount} / 20 {t('detector.text.words', 'words')}
                      </span>
                      <span className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-widest">
                        {inputText.length} {t('detector.text.char_count', 'characters')}
                      </span>
                   </div>
                </div>

                <button 
                  onClick={startAnalysis}
                  disabled={wordCount < 20 || isAnalyzing}
                  className={`w-full h-16 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 ${
                    wordCount < 20 || isAnalyzing
                      ? 'bg-[var(--color-surface-soft)] text-[var(--color-content-muted)] border border-[var(--color-border-subtle)] cursor-not-allowed opacity-60' 
                      : 'bg-gradient-orange-red text-white hover:scale-[1.02] active:scale-95'
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
                      {t('detector.text.analyze', 'Analyze Text')}
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
                  className="absolute inset-0 rounded-full border-4 border-dashed border-orange-500/30"
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-4 rounded-full bg-orange-500/10 flex items-center justify-center"
                >
                  <Zap size={40} className="text-orange-500" />
                </motion.div>
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-2">
                {t('detector.scanning.text_title', 'Analyzing Semantic Integrity...')}
              </h2>
              <p className="text-[var(--color-content-muted)] font-medium">
                {t('detector.scanning.text_subtitle', 'Scanning for misinformation patterns and linguistic inconsistencies')}
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
              {/* Verdict Bar */}
              <div className="w-full bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between shadow-soft-xl">
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${
                    result?.status === 'real' ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20'
                  }`}>
                    {result?.status === 'real' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
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

              {/* Text Preview Box */}
              <div className="w-full bg-[var(--color-surface-main)] rounded-[2rem] border border-[var(--color-border-subtle)] overflow-hidden shadow-soft-xl">
                 <div className="p-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-soft)]/30">
                    <h4 className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-[0.2em]">
                       {t('detector.results.text_preview', 'Submitted Evidence')}
                    </h4>
                 </div>
                 <div className="p-8 max-h-[400px] overflow-y-auto">
                    <p className="text-base text-[var(--color-content-main)] leading-relaxed font-medium" dir={isRTL ? 'rtl' : 'ltr'}>
                       {inputText}
                    </p>
                 </div>
              </div>

              {/* Metadata Footer */}
              <div className="w-full bg-[var(--color-surface-main)] rounded-[2rem] border border-[var(--color-border-subtle)] p-8 flex flex-col md:flex-row justify-between gap-8 shadow-soft-xl">
                <div className="flex flex-col gap-1">
                  <h4 className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-[0.2em] mb-1">
                    {t('detector.results.word_count', 'Word Count')}
                  </h4>
                  <p className="text-sm font-bold text-[var(--color-content-main)]">
                    {wordCount} {t('detector.text.words', 'words')}
                  </p>
                  <p className="text-[10px] text-[var(--color-content-muted)] font-medium">
                    {inputText.length} {t('detector.text.char_count', 'characters')}
                  </p>
                </div>
                <div className="md:text-end flex flex-col gap-1">
                  <h4 className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-[0.2em] mb-1">
                    {t('detector.results.timestamp', 'Analysis Timestamp')}
                  </h4>
                  <p className="text-sm font-bold text-[var(--color-content-main)]">
                    {analysisTime}
                  </p>
                  <p className="text-[10px] text-green-500 font-black uppercase tracking-widest flex items-center md:justify-end gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {t('detector.results.completed', 'Process Completed')}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={resetDetector}
                className="group relative flex items-center gap-3 px-8 py-3.5 bg-gradient-orange-red text-white font-bold rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.05] active:scale-95 transition-all mt-4"
              >
                <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                <span className="text-sm">
                  {t('common.start_over', 'Analyze Another Article')}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
