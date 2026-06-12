/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3B82F6',
          indigo: '#6366F1',
        },
        surface: {
          main: 'var(--bg-main)',
          soft: 'var(--bg-soft)',
        },
        border: {
          subtle: 'var(--border-subtle)',
        },
        content: {
          main: 'var(--text-bold)',
          muted: 'var(--text-muted)',
        },
      },
      backgroundImage: {
        'gradient-cyan-blue': 'linear-gradient(to right, #22D3EE, #3B82F6)',
        'gradient-pink-purple': 'linear-gradient(to right, #F472B6, #A855F7)',
        'gradient-orange-red': 'linear-gradient(to right, #FB923C, #EF4444)',
        'brand-gradient': 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
      },
      boxShadow: {
        'soft-xl': 'var(--shadow-soft)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
