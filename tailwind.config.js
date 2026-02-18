/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        // Neural Glass - Semantic Color System
        'bg-main':           '#020617', // Slate 950 - Absolute Dark
        'bg-surface':        '#0F172A', // Slate 900 - Card Base
        'brand-primary':     '#6366f1', // Indigo 500 - Główny akcent
        'brand-secondary':   '#0ea5e9', // Sky 500 - Dane/Nauka
        'brand-accent':      '#d946ef', // Fuchsia 500 - Wyróżnienia
        'status-success':    '#10b981', // Emerald 500
        'status-danger':     '#f43f5e', // Rose 500
        'text-main':         '#f8fafc', // Slate 50 - Nagłówki
        'text-muted':        '#94a3b8', // Slate 400 - Opisy
        // Keep existing slate additions
        'slate': {
          '950': '#020617',
          '900': '#0f172a',
        }
      },
      boxShadow: {
        'glow-primary': '0 0 20px -5px rgba(99, 102, 241, 0.4)',
        'glow-primary-lg': '0 0 40px -5px rgba(99, 102, 241, 0.5)',
        'glow-secondary': '0 0 20px -5px rgba(14, 165, 233, 0.4)',
        'glow-accent': '0 0 20px -5px rgba(217, 70, 239, 0.4)',
        'glow-danger': '0 0 20px -5px rgba(244, 63, 94, 0.4)',
        'glow-success': '0 0 20px -5px rgba(16, 185, 129, 0.35)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'glass-panel': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), inset 0 1px 0 0 rgba(255,255,255,0.1)',
      },
      backgroundImage: {
        'neural-gradient': 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 70%)',
        'neural-gradient-subtle': 'radial-gradient(circle at 50% -20%, #1e1b4b22 0%, #020617 60%)',
        'brand-gradient': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'brand': ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px -3px rgba(99,102,241,0.4)' },
          '50%':       { boxShadow: '0 0 30px -3px rgba(99,102,241,0.7)' },
        },
      },
    },
  },
  plugins: [],
}
