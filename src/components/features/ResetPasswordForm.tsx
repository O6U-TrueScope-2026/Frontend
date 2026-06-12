import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { LogoWithTagline } from '../common/Logo';
import apiClient from '../../api/client';
import SEO from '../common/SEO';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'errors.password_too_short')
    .regex(/[a-zA-Z]/, 'errors.password_requirement')
    .regex(/[0-9]/, 'errors.password_requirement'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'errors.confirm_password_mismatch',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const { t, i18n } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await apiClient.patch(`/auth/reset-password/${token}`, {
        password: data.password,
        confirmedPassword: data.confirmPassword,
      });
      setIsSuccess(true);
      toast.success(t('auth.reset_password_success'));
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error.response?.data || error.message);
      setApiError(t('auth.reset_password_error'));
      toast.error(t('auth.reset_password_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <SEO 
        title={t('auth.reset_password_title')} 
        description={t('auth.reset_password_subtitle')} 
      />

      {/* Header Logo & Slogan */}
      <LogoWithTagline size="lg" className="mb-8" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-[var(--color-surface-main)] rounded-[2.5rem] shadow-soft-xl border border-[var(--color-border-subtle)] overflow-hidden"
      >
        <div className="p-8 md:p-12 text-center">
          {isSuccess ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8"
            >
              <div className="w-20 h-20 bg-status-success/10 rounded-full flex items-center justify-center text-status-success mx-auto mb-8 shadow-inner">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-4">
                {t('auth.reset_password_success')}
              </h2>
            </motion.div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-2 text-start">
                {t('auth.reset_password_title')}
              </h2>
              <p className="text-sm text-[var(--color-content-muted)] font-medium mb-10 text-start leading-relaxed">
                {t('auth.reset_password_subtitle')}
              </p>

              {apiError && (
                <div className="bg-status-error/10 border border-status-error/20 rounded-2xl p-4 mb-8 flex items-center gap-3 text-status-error text-start">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold">{apiError}</p>
                    <Link to="/forget-password" className="text-xs underline hover:opacity-80">
                      {t('auth.request_new_link')}
                    </Link>
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* New Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-content-main)] block px-1 text-start">
                    {t('auth.password_label')}
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.password_placeholder')}
                      className={`w-full h-14 bg-[var(--color-surface-soft)] border rounded-2xl px-5 ps-12 pe-12 text-sm text-[var(--color-content-main)] placeholder:text-[var(--color-content-muted)] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all ${errors.password ? 'border-[var(--color-content-error)]' : 'border-[var(--color-border-subtle)]'}`}
                    />
                    <Lock 
                      size={20} 
                      className="absolute start-4 top-1/2 -translate-y-1/2 text-[var(--color-content-muted)] opacity-50" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-4 top-1/2 -translate-y-1/2 text-[var(--color-content-muted)] hover:text-brand-primary transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="h-4 px-1 flex" dir={isRTL ? 'rtl' : 'ltr'}>
                    {errors.password && (
                      <p className="text-[10px] text-[var(--color-content-error)] font-bold uppercase tracking-wider w-full text-start leading-tight">
                        {t(errors.password.message as string)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-content-main)] block px-1 text-start">
                    {t('auth.confirm_password_label')}
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('auth.confirm_password_placeholder')}
                      className={`w-full h-14 bg-[var(--color-surface-soft)] border rounded-2xl px-5 ps-12 pe-12 text-sm text-[var(--color-content-main)] placeholder:text-[var(--color-content-muted)] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all ${errors.confirmPassword ? 'border-[var(--color-content-error)]' : 'border-[var(--color-border-subtle)]'}`}
                    />
                    <Lock 
                      size={20} 
                      className="absolute start-4 top-1/2 -translate-y-1/2 text-[var(--color-content-muted)] opacity-50" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute end-4 top-1/2 -translate-y-1/2 text-[var(--color-content-muted)] hover:text-brand-primary transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="h-4 px-1 flex" dir={isRTL ? 'rtl' : 'ltr'}>
                    {errors.confirmPassword && (
                      <p className="text-[10px] text-[var(--color-content-error)] font-bold uppercase tracking-wider w-full text-start">
                        {t(errors.confirmPassword.message as string)}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-brand-gradient text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all duration-300 mt-4 flex items-center justify-center gap-2 group/btn disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : t('auth.reset_password_button')}
                </button>
              </form>
            </>
          )}
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
