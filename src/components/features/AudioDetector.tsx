import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Upload, Mic, ArrowLeft, Play, Pause, 
  Volume2, CheckCircle2, RotateCcw, 
  BarChart3, FileAudio
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import SEO from '../common/SEO';
import apiClient from '../../api/client';
import { MAX_AUDIO_SIZE, ALLOWED_AUDIO_TYPES, ALLOWED_AUDIO_EXTENSIONS } from '../../constants';

type DetectorState = 'idle' | 'scanning' | 'results';

export function AudioDetector() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [state, setState] = useState<DetectorState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [analysisTime, setAnalysisTime] = useState("");
  const [result, setResult] = useState<{
    confidence: number;
    status: 'real' | 'fake';
  } | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const audioSrc = useMemo(() => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    return null;
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (audioSrc) URL.revokeObjectURL(audioSrc);
    };
  }, [audioSrc]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Format Validation
      const isAllowedType = ALLOWED_AUDIO_TYPES.includes(file.type);
      const isAllowedExtension = ALLOWED_AUDIO_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
      if (!isAllowedType && !isAllowedExtension) {
        toast.error(t('errors.invalid_audio_format', 'Only WAV, MP3 and FLAC audio files are allowed'));
        return;
      }

      // 2. Size Validation (50MB)
      if (file.size > MAX_AUDIO_SIZE) {
        toast.error(t('errors.audio_size_limit', 'Audio file size must not exceed 50 MB'));
        return;
      }

      setSelectedFile(file);
      setAnalysisTime(new Date().toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US'));
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;

    setState('scanning');
    
    const formData = new FormData();
    formData.append('audio', selectedFile);

    try {
      const response = await apiClient.post('/api/audios/upload-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      const { verdict, confidenceScore } = response.data;
      
      setResult({
        confidence: confidenceScore ?? 98.4,
        status: verdict?.toLowerCase() === 'real' ? 'real' : 'fake'
      });
      
      setAnalysisTime(new Date().toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US'));
      setState('results');
    } catch (error: any) {
      console.error('Audio analysis error:', error);
      setState('idle');
      
      const backendMessage = error.response?.data?.message;
      if (backendMessage) {
        toast.error(backendMessage);
      } else if (error.response?.status === 401) {
        toast.error(t('errors.unauthorized', 'Session expired. Please login again.'));
      } else {
        toast.error(t('errors.generic', 'An error occurred during analysis. Please try again.'));
      }
    }
  };

  const resetDetector = () => {
    setState('idle');
    setSelectedFile(null);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] py-12 px-4 transition-colors duration-300">
      <SEO 
        title={t('seo.audio.title')} 
        description={t('seo.audio.description')} 
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
          {/* IDLE / PREVIEW STATE */}
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
                <div className="w-20 h-20 rounded-2xl bg-gradient-pink flex items-center justify-center text-white shadow-lg mb-6">
                  <Mic size={40} />
                </div>
                <h1 className="text-3xl font-bold text-[var(--color-content-main)] mb-2">
                  {t('detector.audio.title', 'Audio Forgery Detection')}
                </h1>
                <p className="text-[var(--color-content-muted)] font-medium max-w-md">
                  {t('detector.audio.subtitle', 'Upload audio to detect AI-generated or cloned voices')}
                </p>
              </div>

              <div className="w-full max-w-3xl bg-[var(--color-surface-main)] rounded-[2.5rem] shadow-soft-xl border border-[var(--color-border-subtle)] p-6 md:p-10 flex flex-col items-center">
                
                <div className="w-full relative min-h-[300px] border-2 border-dashed border-[var(--color-border-subtle)] rounded-3xl flex flex-col items-center justify-center transition-all overflow-hidden mb-8">
                  
                  {!selectedFile ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-12 group cursor-pointer">
                      <input 
                        type="file" 
                        accept=".wav,.mp3,.flac,audio/wav,audio/mpeg,audio/flac" 
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        ref={fileInputRef}
                      />
                      <div className="w-16 h-16 rounded-full bg-[var(--color-surface-soft)] text-[var(--color-content-muted)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-brand-indigo transition-all duration-300">
                        <Upload size={32} strokeWidth={1.5} />
                      </div>
                      <p className="text-lg font-bold text-[var(--color-content-main)] mb-1 text-center">
                        {t('detector.upload.box_title', 'Click to upload or drag and drop')}
                      </p>
                      <p className="text-sm text-[var(--color-content-muted)] font-medium text-center">
                        {t('detector.upload.box_audio_formats', 'WAV, MP3, FLAC (max 50MB)')}
                      </p>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full px-8 py-12 flex flex-col items-center"
                    >
                      {/* Audio Visualizer Effect */}
                      <div className="w-full flex items-center justify-center gap-1.5 h-24 mb-10">
                        {[...Array(30)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ 
                              height: isPlaying ? [10, 30 + Math.random() * 50, 10] : 10,
                            }}
                            transition={{ 
                              duration: 0.4 + Math.random() * 0.4, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="w-1.5 rounded-full bg-gradient-pink"
                            style={{ height: '10px' }}
                          />
                        ))}
                      </div>

                      <audio
                        ref={audioRef}
                        src={audioSrc || ""}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                      />

                      {/* Custom Audio Player UI */}
                      <div className="w-full max-w-xl bg-[var(--color-surface-soft)] rounded-3xl p-8 flex flex-col gap-6 border border-[var(--color-border-subtle)] shadow-inner">
                        <div className="flex items-center gap-6">
                          {/* Play/Pause */}
                          <button 
                            onClick={togglePlay}
                            className="w-14 h-14 rounded-full bg-gradient-pink text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
                          >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className={isRTL ? "mr-1" : "ml-1"} />}
                          </button>

                          {/* Seek Bar */}
                          <div className="flex-1 flex flex-col gap-3">
                            <div className="relative w-full h-1.5 bg-[var(--color-surface-main)] rounded-full overflow-hidden">
                              <motion.div 
                                className="absolute h-full bg-brand-indigo rounded-full"
                                style={{ 
                                  width: `${(currentTime / (duration || 1)) * 100}%`,
                                  left: isRTL ? 'auto' : 0,
                                  right: isRTL ? 0 : 'auto'
                                }}
                              />
                              <input 
                                type="range"
                                min="0"
                                max={duration || 100}
                                step="0.1"
                                value={currentTime}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                            </div>
                            <div className="flex justify-between text-[10px] font-mono font-bold text-[var(--color-content-muted)] tracking-wider">
                              <span>{formatTime(currentTime)}</span>
                              <span>{formatTime(duration)}</span>
                            </div>
                          </div>

                          {/* Volume Control */}
                          <div className="group relative flex items-center gap-2">
                             <Volume2 size={20} className="text-[var(--color-content-muted)]" />
                             <input 
                               type="range"
                               min="0"
                               max="1"
                               step="0.05"
                               value={isMuted ? 0 : volume}
                               onChange={handleVolumeChange}
                               className="w-0 group-hover:w-20 transition-all duration-300 accent-brand-indigo h-1 cursor-pointer"
                             />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center gap-3 px-4 py-2 bg-[var(--color-surface-main)] rounded-xl border border-[var(--color-border-subtle)]">
                           <FileAudio size={16} className="text-brand-indigo" />
                           <span className="text-sm font-bold text-[var(--color-content-main)] truncate">{selectedFile?.name}</span>
                           <button 
                            onClick={resetDetector}
                            className="ml-auto text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                           >
                             Remove
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <button 
                  onClick={startAnalysis}
                  disabled={!selectedFile}
                  className={`w-full h-16 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 ${
                    !selectedFile 
                      ? 'bg-[var(--color-surface-soft)] text-[var(--color-content-muted)] border border-[var(--color-border-subtle)] cursor-not-allowed opacity-60' 
                      : 'bg-brand-gradient text-white hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {t('detector.audio.analyze', 'Analyze Audio')}
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
                  <BarChart3 size={40} className="text-brand-indigo" />
                </motion.div>
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-2">
                {t('detector.scanning.audio_title', 'Scanning Audio Waveforms...')}
              </h2>
              <p className="text-[var(--color-content-muted)] font-medium">
                {t('detector.scanning.audio_subtitle', 'Scanning for spectral inconsistencies and biometric cloning')}
              </p>
            </motion.div>
          )}

          {/* RESULTS STATE */}
          {state === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 gap-10 w-full max-w-4xl mx-auto"
            >
              {/* Verdict Bar */}
              <div className="w-full bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-soft-xl">
                 <div className="flex items-center gap-6 mb-6 md:mb-0">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg ${
                      result?.status === 'real' ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20'
                    }`}>
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[var(--color-content-main)]">
                        {result?.status === 'real' ? t('verdict.real', 'Real') : t('verdict.fake', 'Fake')}
                      </h2>
                      <p className={`text-sm font-bold ${
                        result?.status === 'real' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {t('detector.results.confidence', 'Confidence Score')}: {result?.confidence}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 w-full md:w-auto">
                    <div className="flex-1 md:w-64 h-2.5 bg-[var(--color-surface-soft)] rounded-full overflow-hidden border border-[var(--color-border-subtle)]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result?.confidence}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        className={`h-full ${
                          result?.status === 'real' ? 'bg-green-500' : 'bg-red-500'
                        }`} 
                      />
                    </div>
                    <span className={`shrink-0 px-6 py-2 text-xs font-black uppercase tracking-widest rounded-full border ${
                      result?.status === 'real' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {result?.status === 'real' ? t('dashboard.status.pass', 'Pass') : t('dashboard.status.fail', 'Fail')}
                    </span>
                 </div>
               </div>

              {/* Metadata Box */}
              <div className="w-full bg-[var(--color-surface-main)] rounded-[2rem] border border-[var(--color-border-subtle)] p-10 flex flex-col md:flex-row justify-between gap-10 shadow-soft-xl">
                <div className="flex flex-col gap-1">
                  <h4 className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-[0.2em] mb-2">Original File Name</h4>
                  <p className="text-base font-bold text-[var(--color-content-main)] truncate max-w-[300px]">{selectedFile?.name}</p>
                  <p className="text-xs text-[var(--color-content-muted)] font-medium">Format: {selectedFile?.type.split('/')[1].toUpperCase()} | Size: {((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB</p>
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

              <button 
                onClick={resetDetector}
                className="group relative flex items-center gap-3 px-10 py-4 bg-brand-gradient text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.05] active:scale-95 transition-all"
              >
                <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                <span className="text-sm">Analyze Another Clip</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
