import { useTranslation } from 'react-i18next';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'full';
  className?: string;
}

export function Logo({ size = 'md', variant = 'icon', className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' },
  };

  const iconSize = sizes[size].icon;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* TrueScope Logo - Eye with Circuit Pattern */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>

        {/* Outer Circuit Ring */}
        <circle
          cx="24"
          cy="24"
          r="22"
          stroke="url(#logoGradient)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />

        {/* Circuit Nodes */}
        <circle cx="24" cy="2" r="2" fill="url(#accentGradient)" />
        <circle cx="46" cy="24" r="2" fill="url(#accentGradient)" />
        <circle cx="24" cy="46" r="2" fill="url(#accentGradient)" />
        <circle cx="2" cy="24" r="2" fill="url(#accentGradient)" />

        {/* Data Wave Lines */}
        <path
          d="M 12 12 Q 18 8, 24 12 T 36 12"
          stroke="url(#logoGradient)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M 12 36 Q 18 40, 24 36 T 36 36"
          stroke="url(#logoGradient)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />

        {/* Eye Shape */}
        <ellipse
          cx="24"
          cy="24"
          rx="18"
          ry="12"
          fill="url(#logoGradient)"
          opacity="0.1"
        />
        <path
          d="M 6 24 Q 14 14, 24 14 T 42 24 Q 34 34, 24 34 T 6 24"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          fill="none"
        />

        {/* Iris - Outer Circle */}
        <circle
          cx="24"
          cy="24"
          r="8"
          fill="url(#accentGradient)"
          opacity="0.2"
        />

        {/* Iris - Inner Details */}
        <circle
          cx="24"
          cy="24"
          r="6"
          stroke="url(#logoGradient)"
          strokeWidth="1.5"
          fill="url(#accentGradient)"
          opacity="0.3"
        />

        {/* Pupil with Scan Line */}
        <circle cx="24" cy="24" r="4" fill="url(#logoGradient)" />
        <line
          x1="20"
          y1="24"
          x2="28"
          y2="24"
          stroke="#3B82F6"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* Light Reflection */}
        <circle cx="22" cy="22" r="1.5" fill="white" opacity="0.8" />
      </svg>

      {variant === 'full' && (
        <div className="flex flex-col">
          <span className={`${sizes[size].text} font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
            TrueScope
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoWithTagline({ 
  size = 'lg',
  className = ''
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <Logo size={size} variant="full" />
      <p className="text-sm font-medium text-content-muted">
        {t('auth.tagline')}
      </p>
    </div>
  );
}

