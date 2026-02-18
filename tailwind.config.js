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
        // Neural Glass 2.0 - Deep Space Neon Palette
        'bg-deep':         '#030014', // Absolute Void
        'bg-surface':      '#0f0728', // Purple-tinted surface
        'neon-primary':    '#7000ff', // Electric Violet - main action
        'neon-cyan':       '#00f0ff', // Cyan - data/intellect
        'neon-pink':       '#ff005c', // Pink - danger/shadow
        // Keep legacy brand tokens
        'brand-primary':   '#7000ff', // aliased to neon-primary
        'brand-secondary': '#00f0ff', // aliased to neon-cyan
        'brand-accent':    '#ff005c', // aliased to neon-pink
        'bg-main':         '#030014', // alias
        'status-success':  '#10b981',
        'status-danger':   '#ff005c',
        'text-main':       '#f8fafc',
        'text-muted':      '#94a3b8',
        'slate': {
          '950': '#030014',
          '900': '#0f0728',
        }
      },
      boxShadow: {
        'glow-primary':    '0 0 20px -5px rgba(112, 0, 255, 0.5)',
        'glow-primary-lg': '0 0 40px -5px rgba(112, 0, 255, 0.6)',
        'glow-cyan':       '0 0 20px -5px rgba(0, 240, 255, 0.5)',
        'glow-pink':       '0 0 20px -5px rgba(255, 0, 92, 0.5)',
        'glow-success':    '0 0 20px -5px rgba(16, 185, 129, 0.35)',
        'glass-inset':     'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'card-neural':     '0 4px 24px -1px rgba(0,0,0,0.35), inset 0 1px 0 0 rgba(255,255,255,0.1)',
      },
      backgroundImage: {
        'neural-gradient':  'radial-gradient(circle at 50% 0%, #2a1b5e 0%, transparent 60%), radial-gradient(circle at 100% 0%, #1a0b38 0%, transparent 40%)',
        'brand-gradient':   'linear-gradient(90deg, #5b21b6 0%, #7c3aed 100%)',
        'brand-gradient-hover': 'linear-gradient(90deg, #6d28d9 0%, #8b5cf6 100%)',
        'neon-bar-gradient': 'linear-gradient(90deg, #7000ff, #00f0ff)',
      },
      fontFamily: {
        'sans':  ['Inter', 'system-ui', 'sans-serif'],
        'brand': ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':    'spin 3s linear infinite',
        'glow-pulse':   'glow-pulse 2.5s ease-in-out infinite',
        'fade-up':      'fadeUp 0.7s ease-out forwards',
        'neural-scan':  'neural-scan 3s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px -3px rgba(112,0,255,0.45)' },
          '50%':       { boxShadow: '0 0 35px -3px rgba(112,0,255,0.75)' },
        },
        'fadeUp': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        'neural-scan': {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '20%':  { opacity: '1' },
          '80%':  { opacity: '1' },
          '100%': { transform: 'translateY(400%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
