import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Video, Music, FileText, Image as ImageIcon, 
  ArrowLeft, Download, Trash2,
  Calendar, BarChart2, CheckCircle2,
  AlertCircle, XCircle, Loader2, Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import SEO from '../common/SEO';
import apiClient from '../../api/client';
import i18n from '../../i18n';
import { HistoryCard, type HistoryItem } from './HistoryCard';


type MediaType = 'all' | 'video' | 'audio' | 'text' | 'image' | 'account' | 'multimodal';

export function AnalysisHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState<MediaType>('all');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const fetchHistory = async (page: number, currentFilter: MediaType) => {
    setIsLoading(true);
    try {
      const limit = currentFilter === 'all' ? 10 : 5;
      const endpoint = currentFilter === 'all' 
        ? `/api/history?page=${page}&limit=${limit}`
        : `/api/history/feature/${currentFilter}?page=${page}&limit=${limit}`;
      
      const response = await apiClient.get(endpoint);
      
      // Backend may return totalPages or we calculate it
      const { data, count } = response.data;
      const tPages = response.data.totalPages || Math.ceil(count / limit);
      
      setHistory(data || []);
      setTotalPages(tPages || 1);
      setCount(count || 0);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error(t('errors.generic', 'Failed to load history'));
      setHistory([]);
      setCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage, filter);
  }, [currentPage, filter]);


  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm(t('history.confirm_delete', 'Are you sure you want to delete this record?'))) return;

    setDeletingId(id);
    try {
      await apiClient.delete(`/api/history/${id}`);
      toast.success(t('history.delete_success', 'Record deleted successfully'));
      fetchHistory(currentPage, filter);
    } catch (error) {
      toast.error(t('errors.generic', 'Failed to delete record'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(t('history.confirm_clear_all', 'Are you sure you want to clear your entire history? This action cannot be undone.'))) return;

    setIsClearingAll(true);
    try {
      await apiClient.delete('/api/history/all');
      toast.success(t('history.clear_success', 'History cleared successfully'));
      setHistory([]);
      setCount(0);
      setTotalPages(1);
    } catch (error) {
      toast.error(t('errors.generic', 'Failed to clear history'));
    } finally {
      setIsClearingAll(false);
    }
  };

  const handlePreview = (item: HistoryItem) => {
    const routes = {
      video: '/detector',
      audio: '/audio-detector',
      text: '/text-detector',
      image: '/image-detector'
    };
    navigate(routes[item.featureType], { state: { historyItem: item } });
  };


  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-[var(--color-surface-main)] p-5 rounded-3xl border border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full sm:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-soft)]" />
            <div className="space-y-2 flex-1 sm:w-48">
              <div className="h-4 bg-[var(--color-surface-soft)] rounded w-3/4" />
              <div className="h-3 bg-[var(--color-surface-soft)] rounded w-1/2" />
            </div>
          </div>
          <div className="flex items-center gap-8 w-full sm:w-auto">
            <div className="space-y-2">
              <div className="h-3 bg-[var(--color-surface-soft)] rounded w-12 ml-auto" />
              <div className="h-6 bg-[var(--color-surface-soft)] rounded w-24" />
            </div>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-soft)]" />
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-soft)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] py-12 px-6 transition-colors duration-300">
      <SEO 
        title={t('seo.history.title')} 
        description={t('seo.history.description')} 
      />
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-[var(--color-content-muted)] hover:text-brand-primary transition-colors mb-10 font-bold group"
        >
          <ArrowLeft size={18} className="rtl:-scale-x-100 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
          {t('nav.back_to_home', 'Back to Home')}
        </Link>

        {/* Header */}
        <div className="mb-12">
           <h1 className="text-3xl font-bold text-[var(--color-content-main)] mb-2">
             {t('nav.history', 'Analysis History')}
           </h1>
           <p className="text-[var(--color-content-muted)] font-medium">
             {t('history.subtitle', 'View all your previous media verification results')}
           </p>
        </div>



         {/* Filter & Actions Bar */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 overflow-hidden">
          <div className="bg-[var(--color-surface-main)] p-2 rounded-2xl border border-[var(--color-border-subtle)] flex overflow-x-auto flex-nowrap md:flex-wrap items-center gap-1 shadow-sm flex-1 scrollbar-hide">
            {(['all', 'video', 'audio', 'text', 'image', 'account', 'multimodal'] as MediaType[]).map((tType) => (
              <button
                key={tType}
                onClick={() => {
                  setFilter(tType);
                  setCurrentPage(1);
                }}
                 className={`relative px-4 sm:px-8 py-2.5 text-xs sm:text-sm font-bold transition-all rounded-xl whitespace-nowrap ${
                  filter === tType ? 'text-brand-primary' : 'text-[var(--color-content-muted)] hover:text-[var(--color-content-main)]'
                }`}
              >
                {filter === tType && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-brand-primary/5 border border-brand-primary/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 capitalize">{tType === 'all' ? t('history.filter_all', 'All') : t(`tools.${tType}.title`)}</span>
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isClearingAll}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-status-error/10 text-status-error border border-status-error/20 rounded-2xl font-bold text-sm hover:bg-status-error/20 transition-all disabled:opacity-50"
            >
              {isClearingAll ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              {t('history.clear_all', 'Clear All')}
            </button>
          )}
        </div>

        {/* History List */}
        <div className="space-y-4">
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <AnimatePresence mode="popLayout">
              {history.map((item, index) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  index={index}
                  onDelete={handleDelete}
                  onPreview={handlePreview}
                  deletingId={deletingId}
                />
              ))}
            </AnimatePresence>
          )}

          {!isLoading && history.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center bg-[var(--color-surface-main)] rounded-[3rem] border border-[var(--color-border-subtle)] shadow-soft-xl"
            >
               <div className="w-24 h-24 rounded-full bg-[var(--color-surface-soft)] flex items-center justify-center mx-auto mb-6 text-[var(--color-content-muted)] opacity-50">
                  <BarChart2 size={48} />
               </div>
               <h3 className="text-xl font-bold text-[var(--color-content-main)] mb-2">
                 {filter === 'all' ? t('history.empty_title', 'No Analysis Records Found') : t('history.no_records', 'No records found for this category')}
               </h3>
               <p className="text-[var(--color-content-muted)] font-medium mb-8 max-w-xs mx-auto">
                 {filter === 'all' 
                   ? t('history.empty_subtitle', 'Start your first forensic analysis to see results here.')
                   : t('history.no_records_subtitle', 'Try selecting another category or start a new analysis.')}
               </p>
               <button 
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-brand-gradient text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-lg"
               >
                 {t('nav.detection_tools', 'Start Analyzing')}
               </button>
            </motion.div>
          )}
        </div>

        {/* Pagination Bar */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] text-[var(--color-content-main)] font-bold disabled:opacity-50 hover:bg-[var(--color-surface-soft)] transition-all"
            >
              {t('common.prev', 'Previous')}
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${
                    currentPage === i + 1 
                      ? 'bg-brand-primary text-white shadow-lg' 
                      : 'bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] text-[var(--color-content-main)] hover:bg-[var(--color-surface-soft)]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-xl bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] text-[var(--color-content-main)] font-bold disabled:opacity-50 hover:bg-[var(--color-surface-soft)] transition-all"
            >
              {t('common.next', 'Next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
