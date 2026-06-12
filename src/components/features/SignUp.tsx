import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import apiClient from '../../api/client';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { LogoWithTagline } from '../common/Logo';

import SEO from '../common/SEO';

const signupSchema = z.object({
  name: z.string().min(1, 'errors.name_required'),
  email: z.string().email('errors.invalid_email'),
  password: z.string()
    .min(8, 'errors.password_too_short')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/, 'errors.password_requirement'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "errors.confirm_password_mismatch",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignUp() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange'
  });

  // Mapper function to translate backend messages
  const getLocalizedError = (msg: string) => {
    const errorMap: Record<string, string> = {
      'Password must be at least 8 characters long and contain at least one letter and one number': 'errors.password_requirement',
      'Validation failed': 'errors.validation_failed',
      'Email already exists': 'errors.email_exists',
      'Passwords don\'t match': 'errors.confirm_password_mismatch'
    };

    const key = errorMap[msg] || 'errors.generic';
    return t(key);
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/signup', {
        name: data.name.trim(),
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      });
      
      toast.success(t('auth.signup_success', 'Account created successfully!'));
      setIsSuccess(true);
    } catch (error: any) {
      if (error.response?.status === 422) {
        const backendErrors = error.response?.data?.data;
        if (Array.isArray(backendErrors)) {
          backendErrors.forEach((err: any) => {
            if (err.path) {
              setError(err.path as keyof SignupFormData, {
                type: 'manual',
                message: getLocalizedError(err.msg)
              });
            }
          });
          return;
        }
      }

      const message = error.response?.data?.message 
        ? getLocalizedError(error.response.data.message)
        : t('errors.generic');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-soft)] flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <SEO 
          title={t('seo.signup.title')} 
          description={t('seo.signup.description')} 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-[var(--color-surface-main)] rounded-[2.5rem] shadow-soft-xl border border-[var(--color-border-subtle)] p-12 text-center"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
            <Mail size={40} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-4">
            {t('auth.check_email_title', 'Check your email')}
          </h2>
          <p className="text-[var(--color-content-muted)] font-medium mb-10 leading-relaxed">
            {t('auth.check_email_desc', 'We have sent a verification link to your email address. Please click the link to verify your account.')}
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full h-14 bg-brand-gradient text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
          >
            {t('auth.go_to_login', 'Go to Login')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <SEO 
        title={t('seo.signup.title')} 
        description={t('seo.signup.description')} 
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
          <Link
            to="/login"
            className="flex-1 py-3 text-sm font-bold rounded-xl text-center text-[var(--color-content-muted)] hover:text-[var(--color-content-main)] transition-all"
          >
            {t('auth.login_tab')}
          </Link>
          <button
            className="flex-1 py-3 text-sm font-bold rounded-xl bg-[var(--color-surface-main)] text-[var(--color-content-main)] shadow-sm transition-all"
          >
            {t('auth.signup_tab')}
          </button>
        </div>

        <h2 className="text-xl font-bold text-[var(--color-content-main)] mb-8 text-start">
          {t('auth.create_account')}
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--color-content-main)] block px-1">
              {t('auth.name_label')}
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder={t('auth.name_placeholder')}
              className={`w-full h-14 bg-[var(--color-surface-soft)] border rounded-2xl px-5 text-sm text-[var(--color-content-main)] placeholder:text-[var(--color-content-muted)] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all ${errors.name ? 'border-[var(--color-content-error)]' : 'border-[var(--color-border-subtle)]'}`}
            />
            <div className="min-h-[1.25rem] px-1 flex" dir={isRTL ? 'rtl' : 'ltr'}>
              {errors.name && <p className="text-[10px] text-[var(--color-content-error)] font-bold uppercase tracking-wider w-full text-start">{t(errors.name.message as string)}</p>}
            </div>
          </div>

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
            <div className="min-h-[1.25rem] px-1 flex" dir={isRTL ? 'rtl' : 'ltr'}>
              {errors.email && <p className="text-[10px] text-[var(--color-content-error)] font-bold uppercase tracking-wider w-full text-start">{t(errors.email.message as string)}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--color-content-main)] block px-1">
              {t('auth.password_label')}
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password_signup_placeholder')}
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
            <div className="min-h-[1.25rem] px-1 flex" dir={isRTL ? 'rtl' : 'ltr'}>
              {errors.password && <p className="text-[10px] text-[var(--color-content-error)] font-bold uppercase tracking-wider w-full text-start leading-tight">{t(errors.password.message as string)}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--color-content-main)] block px-1">
              {t('auth.confirm_password_label')}
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('auth.confirm_password_placeholder')}
                className={`w-full h-14 bg-[var(--color-surface-soft)] border rounded-2xl px-5 pe-12 text-sm text-[var(--color-content-main)] placeholder:text-[var(--color-content-muted)] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all ${errors.confirmPassword ? 'border-[var(--color-content-error)]' : 'border-[var(--color-border-subtle)]'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[var(--color-content-muted)] hover:text-[var(--color-content-main)] p-1`}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="min-h-[1.25rem] px-1 flex" dir={isRTL ? 'rtl' : 'ltr'}>
              {errors.confirmPassword && <p className="text-[10px] text-[var(--color-content-error)] font-bold uppercase tracking-wider w-full text-start">{t(errors.confirmPassword.message as string)}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-brand-gradient text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all duration-300 mt-6 flex items-center justify-center gap-2 group/btn disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
              <>
                {t('auth.signup_button')}
                <ArrowRight size={20} className="transition-transform duration-300 group-hover/btn:translate-x-1 rtl:-scale-x-100 rtl:group-hover/btn:-translate-x-1" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--color-content-muted)]">
          {t('auth.already_have_account', 'Already have an account?')}{' '}
          <Link to="/login" className="text-brand-primary font-bold hover:underline">
            {t('auth.login_tab')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
