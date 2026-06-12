import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useDarkMode } from '../../utils/useDarkMode';
import { useAuthStore } from '../../store/authStore';
import { 
  History, 
  ChevronDown, 
  Moon, 
  Sun, 
  LogOut,
  Languages,
  Check,
  ArrowRight
} from 'lucide-react';

export function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isDark, setIsDark } = useDarkMode();
  const { user, logout, isFetchingProfile } = useAuthStore();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync document attributes with current language
  useEffect(() => {
    const currentLang = i18n.language;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLng);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-main border-b border-border-subtle px-6 py-3 flex justify-between items-center shadow-sm transition-colors duration-300">
      {/* Left Side: Logo */}
      <Link to="/" className="flex items-center">
        <Logo variant="full" size="md" />
      </Link>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {user ? (
          <div className="flex items-center gap-4 relative">
            {/* User Greeting with Skeleton */}
            <span className="hidden md:inline-block text-sm font-bold text-content-main px-2">
              {isFetchingProfile ? (
                <div className="h-4 w-32 bg-surface-soft animate-pulse rounded" />
              ) : (
                <>{t('nav.welcome')}, {user.name}</>
              )}
            </span>

            {/* History Button */}
            <NavLink 
              to="/history" 
              className={({ isActive }) => `
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-bold text-sm
                ${isActive 
                  ? 'bg-brand-primary/10 text-brand-primary shadow-sm' 
                  : 'text-[var(--color-content-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-content-main)]'
                }
              `}
            >
              <History size={18} />
              <span className="hidden sm:inline">{t('nav.history')}</span>
            </NavLink>

            {/* Avatar & Dropdown Trigger */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={toggleMenu}
                disabled={isFetchingProfile}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-soft transition-all duration-200 group disabled:opacity-50"
              >
                {isFetchingProfile ? (
                  <div className="w-9 h-9 rounded-full bg-surface-soft animate-pulse" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-indigo flex items-center justify-center text-white font-semibold text-lg shadow-inner group-hover:ring-2 group-hover:ring-brand-primary/20 transition-all relative">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : user?.email?.charAt(0).toUpperCase() || 'U'}
                    {user?.isVerified && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-status-success rounded-full border-2 border-surface-main flex items-center justify-center">
                        <Check size={8} className="text-white stroke-[4]" />
                      </div>
                    )}
                  </div>
                )}
                <ChevronDown 
                  size={16} 
                  className={`text-content-muted transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* Custom Dropdown Menu */}
              {isMenuOpen && (
                <div className={`absolute ${i18n.language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-64 bg-surface-main border border-border-subtle rounded-xl shadow-soft-xl py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right`}>
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-border-subtle mb-1">
                    <p className="text-sm font-semibold text-content-main flex items-center gap-2">
                      {t('nav.welcome_back', { name: user.name })}
                      {user.isVerified && <Check size={14} className="text-status-success" />}
                    </p>
                    <p className="text-xs text-content-muted truncate">{user.email}</p>
                  </div>

                  {/* Theme Option */}
                  <div className="px-2">
                    <div className="flex items-center justify-between px-3 py-2 text-sm text-content-main rounded-lg">
                      <div className="flex items-center gap-3">
                        {!isDark ? <Sun size={16} /> : <Moon size={16} />}
                        <span>{t('nav.theme')}</span>
                      </div>
                      <div className="flex bg-surface-soft p-1 rounded-md border border-border-subtle">
                        <button 
                          onClick={() => setIsDark(false)}
                          title={t('nav.light_mode')}
                          className={`p-1.5 rounded transition-all ${!isDark ? 'bg-surface-main shadow-sm text-brand-primary' : 'text-content-muted'}`}
                        >
                          <Sun size={14} />
                        </button>
                        <button 
                          onClick={() => setIsDark(true)}
                          title={t('nav.dark_mode')}
                          className={`p-1.5 rounded transition-all ${isDark ? 'bg-surface-main shadow-sm text-brand-primary' : 'text-content-muted'}`}
                        >
                          <Moon size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Language Option */}
                  <button 
                    onClick={toggleLanguage}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-content-main hover:bg-surface-soft transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Languages size={16} className="text-content-muted group-hover:text-brand-primary" />
                      <span>{t('nav.language')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-brand-primary">
                      <span>{i18n.language === 'en' ? 'English' : 'العربية'}</span>
                      <Check size={14} />
                    </div>
                  </button>

                  <div className="h-px bg-border-subtle my-1 mx-2" />

                  {/* Logout Button */}
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group"
                  >
                    <LogOut size={16} className="text-red-400 group-hover:text-red-500 rtl:-scale-x-100" />
                    <span className="font-medium">{t('nav.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
              to="/login"
              className="px-3 md:px-4 py-2 text-content-main font-bold hover:bg-surface-soft rounded-lg transition-all duration-200 text-sm"
            >
              {t('nav.login')}
            </Link>
            <Link 
              to="/register"
              className="px-3 md:px-6 py-2 bg-brand-gradient text-white font-bold rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 group/signup text-xs md:text-sm"
            >
              {t('nav.signup')}
              <ArrowRight size={16} className="hidden sm:inline-block transition-transform duration-300 group-hover/signup:translate-x-1 rtl:-scale-x-100 rtl:group-hover/signup:-translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
