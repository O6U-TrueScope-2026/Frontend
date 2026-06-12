import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity, TrendingUp, Users } from 'lucide-react';

interface HeroSectionProps {
  user?: { name: string } | null;
  isFetchingProfile?: boolean;
}

export function HeroSection({ user, isFetchingProfile }: HeroSectionProps) {
  const { t } = useTranslation();
  const isScanning = true;

  return (
    <section className="relative pt-20 pb-28 px-6 max-w-7xl mx-auto overflow-hidden bg-surface-main">
      <div className="text-center mb-20 relative">
        {/* Animated Eye Logo */}
        <motion.div 
          className="flex justify-center mb-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            {/* Outer Glow Rings */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: isScanning 
                  ? ['0 0 0 0 rgba(37, 99, 235, 0.7)', '0 0 0 40px rgba(37, 99, 235, 0)', '0 0 0 0 rgba(37, 99, 235, 0)']
                  : '0 0 0 0 rgba(37, 99, 235, 0)',
              }}
              transition={{
                duration: 2,
                repeat: isScanning ? Infinity : 0,
                repeatDelay: 0.5,
              }}
            />
            
            {/* Eye SVG */}
            <svg
              width={120}
              height={120}
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10"
            >
              <defs>
                <linearGradient id="heroLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
                <linearGradient id="heroAccentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
                  <stop offset="50%" stopColor="rgba(59, 130, 246, 0.8)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                </linearGradient>
              </defs>

              <motion.circle
                cx="24" cy="24" r="22"
                stroke="url(#heroLogoGradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.3"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ originX: '24px', originY: '24px' }}
              />

              <motion.circle cx="24" cy="2" r="2.5" fill="url(#heroAccentGradient)" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }} />
              <motion.circle cx="46" cy="24" r="2.5" fill="url(#heroAccentGradient)" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
              <motion.circle cx="24" cy="46" r="2.5" fill="url(#heroAccentGradient)" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
              <motion.circle cx="2" cy="24" r="2.5" fill="url(#heroAccentGradient)" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }} />

              <motion.path
                d="M 12 12 Q 18 8, 24 12 T 36 12"
                stroke="url(#heroLogoGradient)" strokeWidth="2" fill="none" opacity="0.5"
                animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.path
                d="M 12 36 Q 18 40, 24 36 T 36 36"
                stroke="url(#heroLogoGradient)" strokeWidth="2" fill="none" opacity="0.5"
                animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              />

              <ellipse cx="24" cy="24" rx="18" ry="12" fill="url(#heroLogoGradient)" opacity="0.15" />
              <path d="M 6 24 Q 14 14, 24 14 T 42 24 Q 34 34, 24 34 T 6 24" stroke="url(#heroLogoGradient)" strokeWidth="2.5" fill="none" />
              <circle cx="24" cy="24" r="8" fill="url(#heroAccentGradient)" opacity="0.25" />
              <circle cx="24" cy="24" r="6" stroke="url(#heroLogoGradient)" strokeWidth="2" fill="url(#heroAccentGradient)" opacity="0.4" />
              <circle cx="24" cy="24" r="4" fill="url(#heroLogoGradient)" />

              {isScanning && (
                <motion.line
                  x1="6" y1="24" x2="42" y2="24"
                  stroke="url(#scanGradient)" strokeWidth="3"
                  initial={{ y1: 10, y2: 10 }}
                  animate={{ y1: 38, y2: 38 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {isScanning && (
                <>
                  <motion.line
                    x1="20" y1="14" x2="20" y2="34"
                    stroke="#3B82F6" strokeWidth="0.5" opacity="0.3"
                    animate={{ opacity: [0.1, 0.5, 0.1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.line
                    x1="28" y1="14" x2="28" y2="34"
                    stroke="#3B82F6" strokeWidth="0.5" opacity="0.3"
                    animate={{ opacity: [0.1, 0.5, 0.1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  />
                </>
              )}

              <circle cx="22" cy="22" r="2" fill="white" opacity="0.9" />
            </svg>
          </div>
        </motion.div>

        {/* Hero Text */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-content-main tracking-tight min-h-[40px] flex items-center justify-center">
            {isFetchingProfile ? (
              <div className="h-10 w-64 bg-surface-soft animate-pulse rounded-xl" />
            ) : (
              user ? t('hero.welcome_back', { name: user.name }) : t('hero.guest_headline')
            )}
          </h1>
          <p className="text-lg text-content-muted max-w-2xl mx-auto leading-relaxed px-4">
            {t('hero.description')}
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
        <StatCard 
          icon={<Activity size={24} />} 
          value="2.4M+" 
          label={t('hero.stats.verified')}
          gradient="from-blue-600 to-indigo-600"
        />
        <StatCard 
          icon={<TrendingUp size={24} />} 
          value="98.7%" 
          label={t('hero.stats.accuracy')}
          gradient="from-indigo-600 to-purple-600"
        />
        <StatCard 
          icon={<Users size={24} />} 
          value="50K+" 
          label={t('hero.stats.users')}
          gradient="from-blue-500 to-blue-700"
        />
      </div>
    </section>
  );
}

function StatCard({ icon, value, label, gradient }: { icon: React.ReactNode, value: string, label: string, gradient: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: 'var(--shadow-soft-xl)' }}
      className="bg-surface-main p-8 rounded-2xl shadow-soft-xl border border-border-subtle flex items-center gap-6"
    >
      <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shadow-blue-500/10`}>
        {icon}
      </div>
      <div className="text-start">
        <div className="text-2xl font-bold text-content-main leading-tight mb-0.5 tracking-tight">
          {value}
        </div>
        <div className="text-sm font-medium text-content-muted whitespace-nowrap">
          {label}
        </div>
      </div>
    </motion.div>
  );
}
