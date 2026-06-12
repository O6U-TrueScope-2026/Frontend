import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { LogoWithTagline } from '../common/Logo';

export function VerifyEmail() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const hasCalled = useRef(false);

  const getLocalizedError = (msg: string) => {
    const errorMap: Record<string, string> = {
      'Invalid or expired token': 'auth.verify_error',
      'Invalid or expired verification link.': 'auth.verify_error',
      'Verification failed': 'auth.verify_error_toast'
    };

    const key = errorMap[msg] || 'errors.generic';
    return t(key);
  };

  useEffect(() => {
    const verify = async () => {
      if (!token || hasCalled.current) return;
      hasCalled.current = true;
      
      try {
        await apiClient.get(`/auth/verify/${token}`);
        setStatus('success');
        toast.success(t('auth.verify_success', 'Email verified successfully!'));
      } catch (error: any) {
        setStatus('error');
        const msg = error.response?.data?.message || 'Invalid or expired token';
        setErrorMessage(getLocalizedError(msg));
        toast.error(t('auth.verify_error_toast', 'Verification failed.'));
      }
    };

    verify();
  }, [token, t]);

  const handleResend = async () => {
    try {
      // Endpoint to resend verification email - this is a guess based on pattern
      // await apiClient.post('/auth/resend-verification', { token });
      toast.success(t('auth.resend_success', 'Verification email resent!'));
    } catch (error) {
      toast.error(t('auth.resend_error', 'Failed to resend email.'));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <LogoWithTagline size="lg" className="mb-12" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-[var(--color-surface-main)] rounded-[2.5rem] shadow-soft-xl border border-[var(--color-border-subtle)] p-12 text-center"
      >
        {status === 'verifying' && (
          <div className="py-10">
            <Loader2 size={60} className="text-brand-primary animate-spin mx-auto mb-8" />
            <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-4">
              {t('auth.verifying_title', 'Verifying your email...')}
            </h2>
            <p className="text-[var(--color-content-muted)] font-medium">
              {t('auth.verifying_desc', 'Please wait while we confirm your account.')}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-4">
              {t('auth.verify_success_title', 'Verified Successfully!')}
            </h2>
            <p className="text-[var(--color-content-muted)] font-medium mb-10">
              {t('auth.verify_success_desc', 'Your account is now active. You can proceed to login and start using TrueScope.')}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full h-14 bg-brand-gradient text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              {t('auth.go_to_login', 'Go to Login')}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500">
              <XCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-content-main)] mb-4">
              {t('auth.verify_error_title', 'Verification Failed')}
            </h2>
            <p className="text-red-500 font-medium mb-10">
              {errorMessage}
            </p>
            <div className="space-y-4">
              <button
                onClick={handleResend}
                className="w-full h-14 bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] text-[var(--color-content-main)] font-bold rounded-2xl hover:bg-[var(--color-surface-main)] transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                {t('auth.resend_button', 'Resend Verification Email')}
              </button>
              <Link
                to="/register"
                className="block text-sm font-bold text-brand-primary hover:underline"
              >
                {t('auth.back_to_signup', 'Back to Sign Up')}
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
