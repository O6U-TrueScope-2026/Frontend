import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { LogoWithTagline } from '../common/Logo';
import apiClient from '../../api/client';
import SEO from '../common/SEO';

const forgetPasswordSchema = z.object({
  email: z.string().email('errors.invalid_email'),
});

type ForgetPasswordFormData = z.infer<typeof forgetPasswordSchema>;

export function ForgetPassword() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPasswordFormData>({
    resolver: zodResolver(forgetPasswordSchema),
  });

  const onSubmit = async (data: ForgetPasswordFormData) => {
    setIsLoading(true);
    try {
      await apiClient.patch('/auth/forget-password', {
        email: data.email,
      });
      toast.success(t('auth.check_email_title'));
      navigate('/check-email', { state: { email: data.email } });
    } catch (error: any) {
      console.error('Forget password error:', error.response?.data || error.message);
      toast.error(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <SEO 
        title={t('auth.forget_password_title')} 
        description={t('auth.forget_password_desc')} 
      />

      {/* Header Logo & Slogan */}
      <LogoWithTagline size="lg" className="mb-8" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-[var(--color-surface-main)] rounded-[2.5rem] shadow-soft-xl border border-[var(--color-border-subtle)] overflow-hidden"
      >
        <div className="p-8 md:p-12">
          {/* Back to Login Link */}
          <Link 
            to="/login"
            className="flex items-center gap-2 text-sm font-bold text-[var(--color-content-muted)] hover:text-brand-primary transition-colors mb-8 group/back"
          >
            <ArrowLeft size={18} className="transition-transform duration-300 group-hover/back:-translate-x-1 rtl:rotate-180 rtl:group-hover/back:translate-x-1" />
            {t('auth.back_to_login')}
          </Link>

          <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-2 text-start">
            {t('auth.forget_password_title')}
          </h2>
          <p className="text-sm text-[var(--color-content-muted)] font-medium mb-10 text-start leading-relaxed">
            {t('auth.forget_password_desc')}
          </p>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-content-main)] block px-1 text-start">
                {t('auth.email_label')}
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  placeholder={t('auth.email_placeholder')}
                  className={`w-full h-14 bg-[var(--color-surface-soft)] border rounded-2xl px-5 ps-12 text-sm text-[var(--color-content-main)] placeholder:text-[var(--color-content-muted)] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all ${errors.email ? 'border-[var(--color-content-error)]' : 'border-[var(--color-border-subtle)]'}`}
                />
                <Mail 
                  size={20} 
                  className="absolute start-4 top-1/2 -translate-y-1/2 text-[var(--color-content-muted)] opacity-50" 
                />
              </div>
              <div className="h-4 px-1 flex" dir={isRTL ? 'rtl' : 'ltr'}>
                {errors.email && (
                  <p className="text-[10px] text-[var(--color-content-error)] font-bold uppercase tracking-wider w-full text-start">
                    {t(errors.email.message as string)}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-brand-gradient text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all duration-300 mt-2 flex items-center justify-center gap-2 group/btn disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : t('auth.send_instructions')}
            </button>
          </form>

          {/* Bottom Card Footer section with different shade */}
          <div className="mt-10 pt-10 border-t border-[var(--color-border-subtle)] text-center">
            <div className="bg-[var(--color-surface-soft)]/50 -mx-8 md:-mx-12 -mb-8 md:-mb-12 p-8 border-t border-[var(--color-border-subtle)]">
                <p className="text-sm font-medium text-[var(--color-content-muted)]">
                {t('auth.remember_password')}{' '}
                <Link to="/login" className="text-brand-primary font-bold hover:underline">
                  {t('auth.sign_in_here')}
                </Link>
              </p>
            </div>
          </div>
        </div>
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
