import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/common/Header';
import { HeroSection } from './components/features/HeroSection';
import { DetectionTools } from './components/features/DetectionTools';
import { FeaturesSection } from './components/features/FeaturesSection';
import { LoginPage } from './components/features/LoginPage';
import { SignUp } from './components/features/SignUp';
import { VerifyEmail } from './components/features/VerifyEmail';
import { ForgetPassword } from './components/features/ForgetPassword';
import { CheckEmail } from './components/features/CheckEmail';
import { ResetPasswordForm } from './components/features/ResetPasswordForm';
import { VideoDetectorPage } from './components/features/VideoDetectorPage';
import { AudioDetector } from './components/features/AudioDetector';
import { ImageDetector } from './components/features/ImageDetector';
import { TextDetector } from './components/features/TextDetector';
import { AccountDetector } from './components/features/AccountDetector';
import { MultimodalDetector } from './components/features/MultimodalDetector';
import { AnalysisHistory } from './components/features/AnalysisHistory';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

import { SEO } from './components/common/SEO';
import { useTranslation } from 'react-i18next';

function HomePage({ user, isFetchingProfile }: { user: any, isFetchingProfile: boolean }) {
  const { t } = useTranslation();
  return (
    <>
      <SEO
        title={t('seo.home.title')}
        description={t('seo.home.description')}
      />
      <HeroSection user={user} isFetchingProfile={isFetchingProfile} />
      <DetectionTools />
      <FeaturesSection />
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = localStorage.getItem('accessToken');

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const { user, checkAuth, fetchUserProfile, isAuthenticated, isFetchingProfile } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, fetchUserProfile]);

  return (
    <div className="min-h-screen bg-surface-main transition-colors duration-300">
      <Header />
      <Toaster position="top-right" />

      <main>
        <Routes>
          <Route path="/" element={<HomePage user={user} isFetchingProfile={isFetchingProfile} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/reset/:token" element={<ResetPasswordForm />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />

          {/* Protected Routes */}
          <Route path="/detector" element={<ProtectedRoute><VideoDetectorPage /></ProtectedRoute>} />
          <Route path="/audio-detector" element={<ProtectedRoute><AudioDetector /></ProtectedRoute>} />
          <Route path="/image-detector" element={<ProtectedRoute><ImageDetector /></ProtectedRoute>} />
          <Route path="/text-detector" element={<ProtectedRoute><TextDetector /></ProtectedRoute>} />
          <Route path="/account-detector" element={<ProtectedRoute><AccountDetector /></ProtectedRoute>} />
          <Route path="/multimodal-detector" element={<ProtectedRoute><MultimodalDetector /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><AnalysisHistory /></ProtectedRoute>} />
        </Routes>
      </main>

      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 dark:bg-blue-900/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/50 dark:bg-indigo-900/5 rounded-full blur-3xl opacity-50" />
      </div>

      <footer className="w-full py-12 text-center text-content-muted text-sm border-t border-border-subtle bg-surface-main/80 backdrop-blur-md">
        <p className="mb-2">© 2026 TrueScope AI. All rights reserved.</p>
        <p className="opacity-50">Empowering authenticity in the digital age.</p>
      </footer>
    </div>
  );
}

export default App;
