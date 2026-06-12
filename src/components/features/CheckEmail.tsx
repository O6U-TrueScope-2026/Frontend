import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { LogoWithTagline } from '../common/Logo';
import SEO from '../common/SEO';

export function CheckEmail() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isRTL = i18n.language === 'ar';
  
  // Get email from location state, fallback to placeholder for preview
  const email = location.state?.email || "user@example.com";

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <SEO 
        title={t('auth.check_email_reset_title')} 
        description={t('auth.check_email_instruction_1')} 
      />

      {/* Header Logo & Slogan */}
      <LogoWithTagline size="lg" className="mb-8" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-[var(--color-surface-main)] rounded-[2.5rem] shadow-soft-xl border border-[var(--color-border-subtle)] p-8 md:p-12 text-center"
      >
        {/* Success Icon */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-status-success/10 rounded-full flex items-center justify-center text-status-success mx-auto mb-8 shadow-inner"
        >
          <CheckCircle2 size={40} />
        </motion.div>

        <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-2">
          {t('auth.check_email_reset_title')}
        </h2>
        
        <p className="text-sm text-[var(--color-content-muted)] font-medium mb-1">
          {t('auth.check_email_reset_subtitle')}
        </p>
        <p className="text-base font-bold text-[var(--color-content-main)] mb-10" dir="ltr">
          {email}
        </p>

        {/* Instruction Alert Box */}
        <div className="bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/10 rounded-3xl p-8 mb-10 text-start leading-relaxed">
          <p className="text-sm text-brand-primary font-medium mb-4">
            {t('auth.check_email_instruction_1')}
          </p>
          <p className="text-sm text-brand-primary font-medium">
            {t('auth.check_email_instruction_2')}
          </p>
        </div>

        {/* Retry Section */}
        <p className="text-sm font-medium text-[var(--color-content-muted)] mb-10">
          {t('auth.didnt_receive_email')}{' '}
          <button className="text-brand-primary font-bold hover:underline transition-all active:scale-95">
            {t('auth.try_again')}
          </button>
        </p>

        {/* Back to Login Button */}
        <Link 
          to="/login"
          className="w-full h-14 bg-brand-gradient text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group/btn"
        >
          <ArrowLeft size={20} className="transition-transform duration-300 group-hover/btn:-translate-x-1 rtl:rotate-180 rtl:group-hover/btn:translate-x-1" />
          {t('auth.back_to_login')}
        </Link>
      </motion.div>

      {/* Page Footer Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-8 text-xs text-[var(--color-content-muted)] font-bold opacity-80"
      >
        {t('auth.footer_text')}
      </motion.p>
    </div>
  );
}
