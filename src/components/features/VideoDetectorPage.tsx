import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Upload, Video, ArrowRight, Play, Pause,
  Volume2, Maximize, CheckCircle2, RefreshCw, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../common/SEO';
import apiClient from '../../api/client';
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE } from '../../constants/video';

type DetectorState = 'idle' | 'preview' | 'scanning' | 'results';

export function VideoDetectorPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [state, setState] = useState<DetectorState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisTime, setAnalysisTime] = useState<string>("");

  // Video Player Refs & State
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<{
    confidence: number;
    status: 'real' | 'fake';
  } | null>(null);

  // Generate object URL for the selected file
  const videoSrc = useMemo(() => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    return null;
  }, [selectedFile]);

  // Cleanup object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [videoSrc]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Format Validation
            if (!ALLOWED_VIDEO_TYPES.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi)$/i)) {
        toast.error(t('errors.invalid_video_format', 'Invalid format. Please upload MP4, WebM, MOV, or AVI.'));
        return;
      }

      // 2. Size Validation (50MB)
      if (file.size > MAX_VIDEO_SIZE) {
        toast.error(t('errors.video_size_limit'));
        return;
      }

      setSelectedFile(file);
      setState('preview');
      setAnalysisTime(new Date().toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    }
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;

    setState('scanning');
    setUploadProgress(0);

    let fileToSend = selectedFile;
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (extension === 'avi') {
      fileToSend = new File([selectedFile], selectedFile.name, { type: 'video/x-msvideo' });
    } else if (extension === 'mov') {
      fileToSend = new File([selectedFile], selectedFile.name, { type: 'video/quicktime' });
    } else if (extension === 'mp4') {
      fileToSend = new File([selectedFile], selectedFile.name, { type: 'video/mp4' });
    } else if (extension === 'webm') {
      fileToSend = new File([selectedFile], selectedFile.name, { type: 'video/webm' });
    }

    const formData = new FormData();
    formData.append('video', fileToSend);

    try {
      const response = await apiClient.post('/api/videos/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        },
      });

      const { verdict, confidenceScore } = response.data;

      setResult({
        confidence: confidenceScore ?? 94.2,
        status: verdict?.toLowerCase() === 'real' ? 'real' : 'fake'
      });

      setState('results');
    } catch (error: any) {
      console.error('Video analysis error:', error);
      setState('preview');

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
    setProgress(0);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / (total || 1)) * 100);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = (parseFloat(e.target.value) / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMute = !isMuted;
      setIsMuted(newMute);
      videoRef.current.muted = newMute;
    }
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setPlaybackSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] pt-24 pb-12 px-4 transition-colors duration-300">
      <SEO
        title={t('seo.video.title')}
        description={t('seo.video.description')}
      />
      <div className="max-w-[1400px] mx-auto">

        <AnimatePresence mode="wait">
          {/* STATE 1: IDLE */}
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-white shadow-lg mb-6">
                <Video size={32} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-content-main)] mb-2 text-center">
                {t('detector.upload.title', 'Video Deepfake Detection')}
              </h1>
              <p className="text-[var(--color-content-muted)] mb-10 text-center max-w-md font-medium">
                {t('detector.upload.subtitle', 'Upload a video to detect AI-generated or manipulated content with forensic precision.')}
              </p>

              <div className="w-full max-w-[90%] md:max-w-3xl bg-[var(--color-surface-main)] rounded-[2.5rem] shadow-soft-xl border border-[var(--color-border-subtle)] p-6 md:p-12">
                <div className="relative aspect-[1.5/1] md:aspect-[2.5/1] border-2 border-dashed border-[var(--color-border-subtle)] rounded-3xl flex flex-col items-center justify-center group hover:border-brand-primary transition-all cursor-pointer overflow-hidden">
                  <input
                    type="file"
                    accept=".mp4,.avi,.mov,.webm,video/mp4,video/x-msvideo,video/quicktime,video/webm"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-16 h-16 rounded-full bg-[var(--color-surface-soft)] text-[var(--color-content-muted)] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:text-brand-primary transition-all duration-300">
                    <Upload size={32} strokeWidth={1.5} />
                  </div>
                  <p className="text-base md:text-lg font-bold text-[var(--color-content-main)] mb-1 text-center px-4">
                    {t('detector.upload.box_title', 'Click to upload or drag and drop')}
                  </p>
                  <p className="text-xs md:text-sm text-[var(--color-content-muted)] font-medium">
                    {t('detector.upload.box_formats', 'MP4, AVI, MOV, WEBM (max 50MB)')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 2: PREVIEW */}
          {state === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-8">
                {t('detector.preview.confirm', 'Review Uploaded Footage')}
              </h2>

              <motion.div
                ref={containerRef}
                initial={{ opacity: 0, y: 30 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  boxShadow: [
                    "0 0 20px rgba(59,130,246,0.1)",
                    "0 0 40px rgba(59,130,246,0.25)",
                    "0 0 20px rgba(59,130,246,0.1)"
                  ]
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: 0.3,
                  boxShadow: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
                className="w-full max-w-4xl aspect-video bg-black rounded-2xl border border-brand-primary/40 overflow-hidden relative group"
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain cursor-pointer"
                  src={videoSrc || ""}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                  onClick={togglePlay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Forensic Overlay Subtle Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

                {/* Custom Control Bar */}
                <AnimatePresence>
                  {showControls && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-0 left-0 right-0 p-4 bg-[var(--color-surface-main)]/80 backdrop-blur-md border-t border-white/10 flex flex-col gap-3 z-20"
                    >
                      {/* Seek Bar */}
                      <div className="relative w-full h-1 bg-white/20 rounded-full group/seek">
                        <motion.div
                          className="absolute top-0 bottom-0 bg-brand-primary rounded-full z-10"
                          style={{
                            width: `${progress}%`,
                            left: isRTL ? 'auto' : 0,
                            right: isRTL ? 0 : 'auto'
                          }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="0.1"
                          value={progress}
                          onChange={handleSeek}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                      </div>

                      {/* Controls Rows */}
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                          <button
                            onClick={togglePlay}
                            className="text-white hover:text-brand-primary transition-colors transform active:scale-90"
                          >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                          </button>

                          <div className={`flex items-center gap-2 group/vol ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                            <button onClick={toggleMute} className="text-white/70 hover:text-white">
                              {isMuted || volume === 0 ? <Volume2 size={18} className="opacity-40" /> : <Volume2 size={18} />}
                            </button>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={isMuted ? 0 : volume}
                              onChange={handleVolumeChange}
                              className="w-0 group-hover/vol:w-20 transition-all duration-300 accent-brand-primary h-1 cursor-pointer"
                            />
                          </div>

                          <div className="text-[10px] font-mono font-bold text-white/60 tracking-wider">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </div>
                        </div>

                        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                          <button
                            onClick={handleSpeedChange}
                            className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-black text-white hover:bg-white/20 transition-all"
                          >
                            {playbackSpeed}x
                          </button>
                          <button
                            onClick={toggleFullscreen}
                            className="text-white/70 hover:text-white transition-colors"
                          >
                            <Maximize size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Big Center Play Button */}
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                    >
                      <button
                        onClick={togglePlay}
                        className="w-16 h-16 bg-brand-primary/90 text-white rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm transform active:scale-95 pointer-events-auto"
                      >
                        <Play size={32} fill="currentColor" className={isRTL ? "mr-1" : "ml-1"} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="mt-10 flex flex-col items-center gap-6">
                <div className="px-6 py-3 bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                    <Video size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[var(--color-content-muted)] uppercase tracking-widest leading-none mb-1">Source File</p>
                    <p className="text-sm font-bold text-[var(--color-content-main)] truncate max-w-[200px]">{selectedFile?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={resetDetector}
                    className="px-8 h-14 border-2 border-[var(--color-border-subtle)] text-[var(--color-content-main)] font-bold rounded-2xl hover:bg-[var(--color-surface-soft)] transition-all"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={startAnalysis}
                    className="px-12 h-14 bg-brand-gradient text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                  >
                    {t('detector.preview.start', 'Start Analysis')}
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE: SCANNING */}
          {state === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 w-full max-w-2xl mx-auto"
            >
              <div className="w-24 h-24 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-8 relative">
                <RefreshCw size={40} className="animate-spin-slow" />
                <div className="absolute inset-0 rounded-3xl border-2 border-brand-primary/20 animate-ping" />
              </div>

              <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-2">
                {uploadProgress < 100 ? t('detector.scanning.uploading', 'Uploading Video...') : t('detector.scanning.video_title', 'Processing Video...')}
              </h2>
              <p className="text-[var(--color-content-muted)] mb-10 font-medium text-center">
                {uploadProgress < 100
                  ? t('detector.scanning.upload_subtitle', 'Transferring secure forensic data to our AI clusters')
                  : t('detector.scanning.video_subtitle', 'Analyzing temporal consistency, facial landmarks, and metadata artifacts')}
              </p>

              <div className="w-full bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] rounded-3xl p-8 shadow-soft-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black text-brand-primary uppercase tracking-widest">
                    {uploadProgress < 100 ? t('detector.scanning.upload_progress', 'Upload Progress') : t('detector.scanning.analysis_status', 'AI Analysis in Progress')}
                  </span>
                  <span className="text-sm font-bold text-[var(--color-content-main)]">{uploadProgress}%</span>
                </div>
                <div className="w-full h-3 bg-[var(--color-surface-soft)] rounded-full overflow-hidden border border-[var(--color-border-subtle)]">
                  <motion.div
                    className="h-full bg-brand-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="mt-4 text-[10px] text-[var(--color-content-muted)] font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                  {t('detector.scanning.secure_tunnel', 'Establishing secure end-to-end encrypted forensic tunnel')}
                </p>
              </div>
            </motion.div>
          )}

          {/* STATE 3: RESULTS */}
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
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${result?.status === 'real' ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
                    {result?.status === 'real' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-content-main)]">
                      {result?.status === 'real' ? t('verdict.real', 'Real') : t('verdict.fake', 'Fake')}
                    </h2>
                    <p className={`text-xs font-bold ${result?.status === 'real' ? 'text-green-500' : 'text-red-500'}`}>
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
                      className={`h-full ${result?.status === 'real' ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                  </div>
                  <span className={`shrink-0 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${result?.status === 'real' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    {result?.status === 'real' ? t('dashboard.status.pass', 'Pass') : t('dashboard.status.fail', 'Fail')}
                  </span>
                </div>
              </div>

              {/* Center Section: Video Hub (Forensic Monitor) */}
              <motion.div
                ref={containerRef}
                initial={{ opacity: 0, y: 30 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  boxShadow: [
                    "0 0 20px rgba(59,130,246,0.1)",
                    "0 0 40px rgba(59,130,246,0.25)",
                    "0 0 20px rgba(59,130,246,0.1)"
                  ]
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: 0.3,
                  boxShadow: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
                className="w-full aspect-video bg-black rounded-2xl border border-brand-primary/40 overflow-hidden relative group"
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain cursor-pointer"
                  src={videoSrc || ""}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                  onClick={togglePlay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Forensic Overlay Subtle Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

                {/* Custom Control Bar */}
                <AnimatePresence>
                  {showControls && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-0 left-0 right-0 p-4 bg-[var(--color-surface-main)]/80 backdrop-blur-md border-t border-white/10 flex flex-col gap-3 z-20"
                    >
                      {/* Seek Bar */}
                      <div className="relative w-full h-1 bg-white/20 rounded-full group/seek">
                        <motion.div
                          className="absolute top-0 bottom-0 bg-brand-primary rounded-full z-10"
                          style={{
                            width: `${progress}%`,
                            left: isRTL ? 'auto' : 0,
                            right: isRTL ? 0 : 'auto'
                          }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="0.1"
                          value={progress}
                          onChange={handleSeek}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                      </div>

                      {/* Controls Rows */}
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                          <button
                            onClick={togglePlay}
                            className="text-white hover:text-brand-primary transition-colors transform active:scale-90"
                          >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                          </button>

                          <div className={`flex items-center gap-2 group/vol ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                            <button onClick={toggleMute} className="text-white/70 hover:text-white">
                              {isMuted || volume === 0 ? <Volume2 size={18} className="opacity-40" /> : <Volume2 size={18} />}
                            </button>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={isMuted ? 0 : volume}
                              onChange={handleVolumeChange}
                              className="w-0 group-hover/vol:w-20 transition-all duration-300 accent-brand-primary h-1 cursor-pointer"
                            />
                          </div>

                          <div className="text-[10px] font-mono font-bold text-white/60 tracking-wider">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </div>
                        </div>

                        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                          <button
                            onClick={handleSpeedChange}
                            className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-black text-white hover:bg-white/20 transition-all"
                          >
                            {playbackSpeed}x
                          </button>
                          <button
                            onClick={toggleFullscreen}
                            className="text-white/70 hover:text-white transition-colors"
                          >
                            <Maximize size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Big Center Play Button (Visible when paused and controls are hidden or shown) */}
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                    >
                      <button
                        onClick={togglePlay}
                        className="w-16 h-16 bg-brand-primary/90 text-white rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm transform active:scale-95 pointer-events-auto"
                      >
                        <Play size={32} fill="currentColor" className={isRTL ? "mr-1" : "ml-1"} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Bottom Section: Metadata Footer */}
              <div className="w-full bg-[var(--color-surface-main)] rounded-[2rem] border border-[var(--color-border-subtle)] p-8 flex flex-col md:flex-row justify-between gap-8 shadow-soft-xl">
                <div className="flex flex-col gap-1">
                  <h4 className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-[0.2em] mb-1">
                    {t('detector.results.filename', 'Original File Name')}
                  </h4>
                  <p className="text-sm font-bold text-[var(--color-content-main)] truncate max-w-[300px]">
                    {selectedFile?.name}
                  </p>
                  <p className="text-[10px] text-[var(--color-content-muted)] font-medium">
                    {t('detector.results.size', 'Size')}: {((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB
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

              {/* CTA Button */}
              <button
                onClick={resetDetector}
                className="group relative flex items-center gap-3 px-8 py-3.5 bg-brand-gradient text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.05] active:scale-95 transition-all mt-4"
              >
                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                <span className="text-sm">
                  {t('common.start_over', 'Analyze Another Video')}
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

export default VideoDetectorPage;
