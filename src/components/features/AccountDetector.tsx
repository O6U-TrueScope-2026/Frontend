import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  UserX, ArrowLeft, 
  RotateCcw, Search, User,
  Link as LinkIcon, Info, Globe, ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import SEO from '../common/SEO';
import apiClient from '../../api/client';

type DetectorState = 'idle' | 'scanning' | 'results';

export function AccountDetector() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [state, setState] = useState<DetectorState>('idle');
  const [formData, setFormData] = useState({
    username: ""
  });
  const [analysisTime, setAnalysisTime] = useState("");
  const [result, setResult] = useState<{
    confidenceScore: number;
    verdict: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const startAnalysis = async () => {
    if (!formData.username.trim()) {
      toast.error(t('errors.validation_failed', 'Please enter a username'));
      return;
    }
    
    setState('scanning');
    
    try {
      const response = await apiClient.post('/api/accounts/check-account', { 
        username: formData.username.trim()
      });
      
      const { verdict, confidenceScore } = response.data;
      
      setResult({
        confidenceScore: confidenceScore ?? 95,
        verdict: verdict?.toLowerCase() === 'real' ? 'real' : 'fake'
      });
      
      setAnalysisTime(new Date().toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US'));
      setState('results');
    } catch (error: any) {
      console.error('Account analysis error:', error);
      setState('idle');
      
      if (error.response?.status === 401) {
        toast.error(t('errors.unauthorized', 'Session expired. Please login again.'));
      } else if (error.response?.status === 404 || error.response?.data?.message === 'Account not found') {
        toast.error(t('errors.account_not_found', 'Account not found, please check the username.'));
      } else {
        toast.error(t('errors.generic', 'An error occurred during analysis. Please try again.'));
      }
    }
  };

  const resetDetector = () => {
    setState('idle');
    setFormData({ username: "" });
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] py-12 px-4 transition-colors duration-300">
      <SEO 
        title={t('seo.account.title')} 
        description={t('seo.account.description')} 
      />
      <div className="max-w-[1000px] mx-auto">
        
        {/* Navigation */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-[var(--color-content-muted)] hover:text-brand-indigo transition-colors mb-12 font-bold group"
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
                <div className="w-20 h-20 rounded-2xl bg-brand-indigo flex items-center justify-center text-white shadow-[0_8px_30px_rgb(99,102,241,0.3)] mb-6">
                  <UserX size={40} />
                </div>
                <h1 className="text-3xl font-bold text-[var(--color-content-main)] mb-2">
                  {t('detector.account.title', 'Fake Accounts Detector')}
                </h1>
                <p className="text-[var(--color-content-muted)] font-medium max-w-md">
                  {t('detector.account.subtitle', 'Analyze social media accounts to detect bots and fake profiles')}
                </p>
              </div>

              <div className="w-full max-w-3xl bg-[var(--color-surface-main)] rounded-[2.5rem] shadow-soft-xl border border-[var(--color-border-subtle)] p-6 md:p-10 flex flex-col items-stretch">
                
                <h3 className="text-base font-bold text-[var(--color-content-main)] mb-8">
                  {t('detector.account.form_title', 'Account Information')}
                </h3>

                <div className="space-y-6 mb-10 max-w-xl mx-auto w-full">
                  {/* Username Field */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[var(--color-content-main)]">
                      {t('detector.account.username_label', 'Username')}
                    </label>
                    <input 
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="@username"
                      className="w-full h-14 bg-[var(--color-surface-soft)]/50 border border-[var(--color-border-subtle)] rounded-2xl px-6 text-[var(--color-content-main)] placeholder:text-[var(--color-content-muted)] focus:ring-2 focus:ring-brand-indigo/20 focus:border-brand-indigo outline-none transition-all font-medium"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Live Preview Card */}
                <AnimatePresence>
                  {formData.username && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mb-10 p-6 bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] rounded-3xl flex items-center gap-6 shadow-inner"
                    >
                      <div className="w-16 h-16 rounded-full bg-brand-indigo/10 flex items-center justify-center text-brand-indigo shrink-0">
                         <User size={32} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-[var(--color-content-main)] truncate" dir="ltr">
                          {formData.username.startsWith('@') ? formData.username : `@${formData.username}`}
                        </h4>
                        <p className="text-sm text-[var(--color-content-muted)] font-medium line-clamp-1">
                           {t('detector.account.ready', 'Ready for behavioral analysis')}
                        </p>
                      </div>
                      <div className="hidden sm:flex flex-col items-end shrink-0">
                         <span className="text-[10px] font-black text-brand-indigo uppercase tracking-widest">Live Preview</span>
                         <div className="flex gap-1 mt-1">
                            <div className="w-1 h-1 rounded-full bg-brand-indigo animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1 h-1 rounded-full bg-brand-indigo animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1 h-1 rounded-full bg-brand-indigo animate-bounce" style={{ animationDelay: '300ms' }} />
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2 mb-8 px-2">
                   <Info size={14} className="text-brand-indigo" />
                   <p className="text-xs text-[var(--color-content-muted)] font-medium">
                     {t('detector.account.hint', 'Providing additional context helps improve detection accuracy')}
                   </p>
                </div>

                <button 
                  onClick={startAnalysis}
                  disabled={!formData.username.trim()}
                  className={`w-full h-16 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 ${
                    !formData.username.trim() 
                      ? 'bg-[var(--color-surface-soft)] text-[var(--color-content-muted)] border border-[var(--color-border-subtle)] cursor-not-allowed opacity-60' 
                      : 'bg-brand-gradient text-white hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  <Search size={20} />
                  {t('detector.account.analyze', 'Analyze Account')}
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
                  className="absolute inset-0 rounded-full border-4 border-dashed border-brand-indigo/30"
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-4 rounded-full bg-brand-indigo/10 flex items-center justify-center"
                >
                  <Globe size={40} className="text-brand-indigo" />
                </motion.div>
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-2">
                {t('detector.scanning.account_title', 'Scanning Network Graph...')}
              </h2>
              <p className="text-[var(--color-content-muted)] font-medium">
                {t('detector.scanning.account_subtitle', 'Analyzing followers, engagement patterns, and behavioral anomalies')}
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
                    result?.verdict === 'real' ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20'
                  }`}>
                    {result?.verdict === 'real' ? <Globe size={24} /> : <ShieldAlert size={24} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-content-main)]">
                      {result?.verdict === 'real' ? t('verdict.real', 'Real') : t('verdict.fake', 'Fake')}
                    </h2>
                    <p className={`text-xs font-bold ${
                      result?.verdict === 'real' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {t('detector.results.confidence', 'Confidence Score')}: {result?.confidenceScore}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="flex-1 md:w-48 h-2 bg-[var(--color-surface-soft)] rounded-full overflow-hidden border border-[var(--color-border-subtle)]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result?.confidenceScore}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      className={`h-full ${
                        result?.verdict === 'real' ? 'bg-green-500' : 'bg-red-500'
                      }`} 
                    />
                  </div>
                  <span className={`shrink-0 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                    result?.verdict === 'real' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {result?.verdict === 'real' ? t('dashboard.status.pass', 'Pass') : t('dashboard.status.fail', 'Fail')}
                  </span>
                </div>
              </div>

              {/* Account Card (Forensic Mode) */}
              <div className="w-full bg-[var(--color-surface-main)] rounded-[2rem] border border-[var(--color-border-subtle)] overflow-hidden shadow-soft-xl">
                 <div className="p-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-soft)]/30 flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-[0.2em]">
                       {t('detector.results.account_preview', 'Target Profile Analysis')}
                    </h4>
                    <span className="text-[10px] font-bold text-brand-indigo px-3 py-1 bg-brand-indigo/10 rounded-full border border-brand-indigo/20">
                       READ-ONLY FORENSIC MODE
                    </span>
                 </div>
                 <div className="p-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 rounded-full bg-brand-indigo/5 flex items-center justify-center text-brand-indigo border-4 border-[var(--color-surface-soft)] shadow-lg">
                       <User size={48} />
                    </div>
                    <div className="flex-1 text-center md:text-start">
                       <h2 className="text-3xl font-bold text-[var(--color-content-main)] mb-2" dir="ltr">
                          {formData.username.startsWith('@') ? formData.username : `@${formData.username}`}
                       </h2>
                       <p className="text-lg text-[var(--color-content-muted)] font-medium max-w-2xl">
                          {t('detector.account.forensic_desc', 'Behavioral forensic analysis completed for the target profile.')}
                       </p>
                    </div>
                 </div>
              </div>

              {/* Metadata Footer */}
              <div className="w-full bg-[var(--color-surface-main)] rounded-[2rem] border border-[var(--color-border-subtle)] p-8 flex flex-col md:flex-row justify-between gap-8 shadow-soft-xl">
                <div className="flex flex-col gap-1">
                  <h4 className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-[0.2em] mb-1">
                    {t('detector.results.target_id', 'Target Identifier')}
                  </h4>
                  <p className="text-sm font-bold text-[var(--color-content-main)]">
                    {formData.username}
                  </p>
                  <p className="text-[10px] text-[var(--color-content-muted)] font-medium">
                    Analysis Type: Cross-Platform Behavioral Scan
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
                className="group relative flex items-center gap-3 px-10 py-4 bg-brand-gradient text-white font-bold rounded-2xl shadow-xl shadow-brand-indigo/20 hover:scale-[1.05] active:scale-95 transition-all mt-4"
              >
                <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                <span className="text-sm">
                  {t('common.start_over', 'Analyze Another Profile')}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
