import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { LogoWithTagline } from '../common/Logo';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';

import SEO from '../common/SEO';

const loginSchema = z.object({
  email: z.string().email('errors.invalid_email'),
  password: z.string().min(1, 'auth.password_required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isRTL = i18n.language === 'ar';
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { accessToken, refreshToken, user } = response.data;
      
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      setAuth(user, accessToken);
      
      toast.success(t('auth.login_success', 'Login successful!'));
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      const message = error.response?.data?.message === 'Invalid credentials' || error.response?.status === 401
        ? t('auth.login_error', 'Email or password is incorrect')
        : t('errors.generic');
      
      setApiError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <SEO 
        title={t('seo.login.title')} 
        description={t('seo.login.description')} 
      />
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-8 left-8"
      >
        <Link 
          to="/"
          className="flex items-center gap-2 text-sm font-bold text-content-muted hover:text-brand-primary transition-colors group/back"
        >
          <ArrowLeft size={18} className="transition-transform duration-300 group-hover/back:-translate-x-1 rtl:rotate-180 rtl:group-hover/back:translate-x-1" />
          {t('nav.back_to_home')}
        </Link>
      </motion.div>

      <LogoWithTagline size="lg" className="mb-8" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-[var(--color-surface-main)] rounded-[2.5rem] shadow-soft-xl border border-[var(--color-border-subtle)] p-8 md:p-12"
      >
        <div className="flex bg-[var(--color-surface-soft)] p-1.5 rounded-2xl mb-10 border border-[var(--color-border-subtle)]">
          <button
            className="flex-1 py-3 text-sm font-bold rounded-xl bg-[var(--color-surface-main)] text-[var(--color-content-main)] shadow-sm transition-all"
          >
            {t('auth.login_tab')}
          </button>
          <Link
            to="/register"
            className="flex-1 py-3 text-sm font-bold rounded-xl text-center text-[var(--color-content-muted)] hover:text-[var(--color-content-main)] transition-all"
          >
            {t('auth.signup_tab')}
          </Link>
        </div>

        <h2 className="text-xl font-bold text-[var(--color-content-main)] mb-8 text-start">
          {t('auth.welcome_back')}
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {apiError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[var(--color-content-error)]/10 border border-[var(--color-content-error)]/20 rounded-xl p-4 mb-4"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <p className="text-sm font-bold text-[var(--color-content-error)] text-start">
                {apiError}
              </p>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--color-content-main)] block px-1">
              {t('auth.email_label')}
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder={t('auth.email_placeholder')}
              className={`w-full h-14 bg-[var(--color-surface-soft)] border rounded-2xl px-5 text-sm text-[var(--color-content-main)] placeholder:text-[var(--color-content-muted)] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all ${errors.email ? 'border-[var(--color-content-error)]' : 'border-[var(--color-border-subtle)]'}`}
            />
            <div className="h-4 px-1 flex" dir={isRTL ? 'rtl' : 'ltr'}>
              {errors.email && <p className="text-[10px] text-[var(--color-content-error)] font-bold uppercase tracking-wider w-full text-start">{t(errors.email.message as string)}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-bold text-[var(--color-content-main)]">
                {t('auth.password_label')}
              </label>
              <Link to="/forget-password" title={t('auth.forgot_password')} className="text-xs font-bold text-brand-primary hover:underline">
                {t('auth.forgot_password')}
              </Link>
            </div>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password_placeholder')}
                className={`w-full h-14 bg-[var(--color-surface-soft)] border rounded-2xl px-5 pe-12 text-sm text-[var(--color-content-main)] placeholder:text-[var(--color-content-muted)] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all ${errors.password ? 'border-[var(--color-content-error)]' : 'border-[var(--color-border-subtle)]'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[var(--color-content-muted)] hover:text-[var(--color-content-main)] p-1`}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="h-4 px-1 flex" dir={isRTL ? 'rtl' : 'ltr'}>
              {errors.password && <p className="text-[10px] text-[var(--color-content-error)] font-bold uppercase tracking-wider w-full text-start">{t(errors.password.message as string)}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-brand-gradient text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all duration-300 mt-2 flex items-center justify-center gap-2 group/btn disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
              <>
                {t('auth.login_button')}
                <ArrowRight size={20} className="transition-transform duration-300 group-hover/btn:translate-x-1 rtl:-scale-x-100 rtl:group-hover/btn:-translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border-subtle)]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--color-surface-main)] px-4 text-[var(--color-content-muted)] font-bold italic tracking-widest">
              {t('auth.or_continue')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-3 h-14 bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] rounded-2xl text-sm font-bold text-[var(--color-content-main)] hover:bg-[var(--color-surface-soft)] transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.6z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.3 7.4 24 12 24z" />
              <path fill="#FBBC05" d="M5.3 14.3c-.2-.6-.4-1.3-.4-2.3s.2-1.7.4-2.3V6.6H1.3C.5 8.2 0 10.1 0 12s.5 3.8 1.3 5.4l4-3.1z" />
              <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.3 2.7 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
            </svg>
            {t('auth.google')}
          </button>
          <button className="flex items-center justify-center gap-3 h-14 bg-[var(--color-surface-main)] border border-[var(--color-border-subtle)] rounded-2xl text-sm font-bold text-[var(--color-content-main)] hover:bg-[var(--color-surface-soft)] transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {t('auth.github')}
          </button>
        </div> */}
      </motion.div>

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
