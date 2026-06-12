import { useEffect, useState } from 'react';

/**
 * Hook for managing Dark Mode
 * Toggles the .dark class on the html element
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return { isDark, setIsDark, toggle: () => setIsDark(!isDark) };
}

// Example usage in a component:
/*
function ThemeToggle() {
  const { isDark, toggle } = useDarkMode();
  return (
    <button onClick={toggle}>
      {isDark ? 'Switch to Light' : 'Switch to Dark'}
    </button>
  );
}
*/
