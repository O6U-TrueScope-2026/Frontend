import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Video, Music, FileText, Image as ImageIcon, 
  Trash2, Calendar, BarChart2, CheckCircle2,
  AlertCircle, XCircle, Loader2, Zap
} from 'lucide-react';
import i18n from '../../i18n';

export interface HistoryItem {
  id: string;
  featureType: 'video' | 'audio' | 'text' | 'image' | 'account' | 'multimodal' | 'image_text';
  input?: Array<{
    originalname?: string;
    key?: string;
    metadata?: {
      originalname?: string;
      type?: string;
    };
  }>;
  metadata: {
    originalname?: string;
    text?: string;
    type?: string;
  };
  aiResult: {
    verdict: 'real' | 'fake' | 'suspicious' | 'ai' | 'bot' | 'human';
    confidenceScore?: number;
  };
  confidenceScore: number;
  createdAt: string;
  key?: string;
}

interface HistoryCardProps {
  item: HistoryItem;
  index: number;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onPreview: (item: HistoryItem) => void;
  deletingId: string | null;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ 
  item, 
  index, 
  onDelete, 
  onPreview, 
  deletingId 
}) => {
  const { t } = useTranslation();

  const getDisplayName = (item: HistoryItem) => {
    // 1. Extract potential names using optional chaining approach
    const input = item.input?.[0];
    
    // Case: Images -> input[0].originalname
    // Case: Audio/Video -> input[0].metadata.originalname
    // Case: Text/Account -> input[0].key or item.key
    let rawTitle = input?.originalname || 
                   input?.metadata?.originalname || 
                   item.metadata?.originalname;

    // Handle Text/Account specific fallbacks
    if (!rawTitle) {
      if (item.featureType === 'text') {
        rawTitle = item.metadata?.text || input?.key || item.key;
      } else if (item.featureType === 'account') {
        rawTitle = input?.key || item.key || item.metadata?.type;
      }
    }

    // General fallback to key
    if (!rawTitle) {
      rawTitle = input?.key || item.key;
    }

    // Absolute fallback to localized tool type if no identifier found
    if (!rawTitle) {
      return t(`history.toolType.${item.featureType}`);
    }

    // 2. Clean folder prefix (e.g., "images/photo.jpg" -> "photo.jpg")
    let finalTitle = rawTitle.split('/').pop() || rawTitle;

    // 3. Prepend localized tool name for generic system paths or hashes
    // We consider it generic if it has an extension or is a long string with no spaces
    const isGenericPath = finalTitle.includes('.') || (!finalTitle.includes(' ') && finalTitle.length > 15);
    
    if (isGenericPath && !['text', 'account'].includes(item.featureType)) {
      // Get the first word of the tool type (e.g., "Image" from "Image Analysis")
      const toolLabel = t(`history.toolType.${item.featureType}`).split(' ')[0];
      finalTitle = `${toolLabel}: ${finalTitle}`;
    }

    // 4. Final trim and return
    return finalTitle.trim();
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={20} />;
      case 'audio': return <Music size={20} />;
      case 'text': return <FileText size={20} />;
      case 'image': return <ImageIcon size={20} />;
      case 'account': return <BarChart2 size={20} />;
      case 'multimodal':
      case 'image_text': return <Zap size={20} />;
      default: return <BarChart2 size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'real':
      case 'authentic':
      case 'human':
        return (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-success/10 text-status-success text-[10px] font-black uppercase tracking-widest border border-status-success/20">
              <CheckCircle2 size={12} />
              {t('dashboard.status.pass', 'Pass')}
            </span>
          </div>
        );
      case 'fake':
      case 'suspicious':
      case 'ai':
      case 'bot':
        return (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-error/10 text-status-error text-[10px] font-black uppercase tracking-widest border border-status-error/20">
              <XCircle size={12} />
              {t('dashboard.status.fail', 'Fail')}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onPreview(item)}
      className="group bg-[var(--color-surface-main)] p-5 rounded-3xl border border-[var(--color-border-subtle)] hover:border-brand-primary/30 hover:shadow-lg transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-6"
    >
      <div className="flex items-center gap-5 w-full sm:flex-1 min-w-0">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
          item.featureType === 'video' ? 'bg-cyan-500/10 text-cyan-500' :
          item.featureType === 'audio' ? 'bg-purple-500/10 text-purple-500' :
          item.featureType === 'text' ? 'bg-orange-500/10 text-orange-500' :
          item.featureType === 'account' ? 'bg-indigo-500/10 text-indigo-500' :
          (item.featureType === 'multimodal' || item.featureType === 'image_text') ? 'bg-pink-500/10 text-pink-500' :
          'bg-teal-500/10 text-teal-500'
        }`}>
          {getMediaIcon(item.featureType)}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-bold text-[var(--color-content-main)] truncate group-hover:text-brand-primary transition-colors mb-0.5">
            {getDisplayName(item)}
          </h4>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold text-brand-primary/80 uppercase tracking-wider flex items-center gap-1.5">
              {getMediaIcon(item.featureType)}
              {t(`history.toolType.${item.featureType}`)}
            </p>
            <p className="text-[10px] font-medium text-[var(--color-content-muted)] flex items-center gap-2 opacity-70">
              <Calendar size={12} />
              {new Date(item.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto shrink-0">
        <div className="text-end">
          <p className="text-[10px] font-black text-[var(--color-content-muted)] uppercase tracking-widest mb-1">
            {t('detector.results.confidence', 'Confidence')}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-brand-primary">
              {item.aiResult?.confidenceScore ?? item.confidenceScore ?? 0}%
            </span>
            {getStatusBadge(item.aiResult?.verdict)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => onDelete(e, item.id)}
            disabled={deletingId === item.id}
            className="p-2.5 rounded-xl bg-[var(--color-surface-soft)] text-[var(--color-content-muted)] hover:text-status-error hover:bg-status-error/10 transition-all disabled:opacity-50"
          >
            {deletingId === item.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
