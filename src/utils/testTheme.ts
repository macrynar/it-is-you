/**
 * Central color theme map for test results pages.
 * Maps testId → theme tokens used in both UI (inline styles) and Recharts.
 *
 * Tailwind class prefix (e.g. `text-${theme.tw}-400`) is safe to use
 * in inline class strings; add to safelist if purge removes them.
 */

export interface TestTheme {
  /** Tailwind colour name, e.g. 'cyan' */
  tw: string;
  /** Primary hex – use for strokes/fills in Recharts */
  hex: string;
  /** Lighter hex for labels / active dots */
  hexLight: string;
  /** Dark base for gradients */
  hexDark: string;
  /** CSS rgba with 50 % opacity – hover glows */
  glow: string;
  /** CSS rgba with 15 % opacity – card backgrounds */
  bg15: string;
  /** CSS rgba with 12 % opacity – badge / pill background */
  bg12: string;
  /** CSS rgba with 35 % opacity – border accents */
  border35: string;
  /** CSS rgba with 20 % opacity – subtle border */
  border20: string;
  /** Gradient string for CTA buttons (dark → hex) */
  btnGradient: string;
  /** SVG / CSS drop-shadow string for neon glow */
  dropShadow: string;
  /** Page background radial-gradient tint (two stops) */
  bgTint: string;
  /** Glass border gradient (for ::before pseudo-element) */
  glassBorder: string;
  /** Box-shadow for hover state on cards */
  hoverShadow: string;
  /** Glow-line boxShadow string */
  glowLine: string;
}

const THEMES: Record<string, TestTheme> = {
  hexaco: {
    tw: 'cyan',
    hex: '#22d3ee',
    hexLight: '#67e8f9',
    hexDark: '#0e7490',
    glow: 'rgba(34,211,238,.5)',
    bg15: 'rgba(34,211,238,.15)',
    bg12: 'rgba(34,211,238,.12)',
    border35: 'rgba(34,211,238,.35)',
    border20: 'rgba(34,211,238,.20)',
    btnGradient: 'linear-gradient(135deg,#0e7490,#22d3ee)',
    dropShadow: 'drop-shadow(0 0 12px rgba(34,211,238,.55))',
    bgTint:
      'radial-gradient(ellipse 60% 40% at 15% 20%,rgba(34,211,238,.1) 0%,transparent 65%),' +
      'radial-gradient(ellipse 50% 50% at 85% 75%,rgba(14,116,144,.12) 0%,transparent 65%)',
    glassBorder:
      'linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(34,211,238,.2) 35%,rgba(14,116,144,.12) 70%,rgba(255,255,255,.04) 100%)',
    hoverShadow:
      'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(34,211,238,.35),0 0 30px -4px rgba(34,211,238,.3),0 16px 48px -6px rgba(0,0,0,.7)',
    glowLine: '0 0 10px 2px rgba(34,211,238,.55)',
  },

  enneagram: {
    tw: 'fuchsia',
    hex: '#d946ef',
    hexLight: '#e879f9',
    hexDark: '#7b1fa2',
    glow: 'rgba(217,70,239,.5)',
    bg15: 'rgba(217,70,239,.15)',
    bg12: 'rgba(217,70,239,.12)',
    border35: 'rgba(217,70,239,.35)',
    border20: 'rgba(217,70,239,.20)',
    btnGradient: 'linear-gradient(135deg,#7b1fa2,#d946ef)',
    dropShadow: 'drop-shadow(0 0 12px rgba(217,70,239,.55))',
    bgTint:
      'radial-gradient(ellipse 60% 40% at 20% 15%,rgba(217,70,239,.12) 0%,transparent 65%),' +
      'radial-gradient(ellipse 50% 45% at 80% 80%,rgba(217,70,239,.07) 0%,transparent 65%)',
    glassBorder:
      'linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(217,70,239,.2) 35%,rgba(217,70,239,.1) 65%,rgba(255,255,255,.04) 100%)',
    hoverShadow:
      'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(217,70,239,.4),0 0 30px -4px rgba(217,70,239,.3),0 16px 48px -6px rgba(0,0,0,.7)',
    glowLine: '0 0 10px 2px rgba(217,70,239,.55)',
  },

  dark_triad: {
    tw: 'rose',
    hex: '#fb7185',
    hexLight: '#fda4af',
    hexDark: '#9f1239',
    glow: 'rgba(251,113,133,.5)',
    bg15: 'rgba(251,113,133,.15)',
    bg12: 'rgba(251,113,133,.12)',
    border35: 'rgba(251,113,133,.35)',
    border20: 'rgba(251,113,133,.20)',
    btnGradient: 'linear-gradient(135deg,#9f1239,#fb7185)',
    dropShadow: 'drop-shadow(0 0 12px rgba(251,113,133,.55))',
    bgTint:
      'radial-gradient(ellipse 55% 40% at 10% 15%,rgba(251,113,133,.12) 0%,transparent 60%),' +
      'radial-gradient(ellipse 45% 50% at 88% 70%,rgba(159,18,57,.14) 0%,transparent 60%)',
    glassBorder:
      'linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(251,113,133,.2) 35%,rgba(159,18,57,.12) 70%,rgba(255,255,255,.04) 100%)',
    hoverShadow:
      'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(251,113,133,.4),0 0 30px -4px rgba(251,113,133,.3),0 16px 48px -6px rgba(0,0,0,.7)',
    glowLine: '0 0 10px 2px rgba(251,113,133,.55)',
  },

  strengths: {
    tw: 'amber',
    hex: '#fbbf24',
    hexLight: '#fcd34d',
    hexDark: '#92400e',
    glow: 'rgba(251,191,36,.5)',
    bg15: 'rgba(251,191,36,.15)',
    bg12: 'rgba(251,191,36,.12)',
    border35: 'rgba(251,191,36,.35)',
    border20: 'rgba(251,191,36,.20)',
    btnGradient: 'linear-gradient(135deg,#92400e,#fbbf24)',
    dropShadow: 'drop-shadow(0 0 12px rgba(251,191,36,.55))',
    bgTint:
      'radial-gradient(ellipse 60% 40% at 15% 20%,rgba(251,191,36,.09) 0%,transparent 65%),' +
      'radial-gradient(ellipse 50% 50% at 85% 75%,rgba(146,64,14,.12) 0%,transparent 65%)',
    glassBorder:
      'linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(251,191,36,.18) 35%,rgba(146,64,14,.1) 70%,rgba(255,255,255,.04) 100%)',
    hoverShadow:
      'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(251,191,36,.35),0 0 30px -4px rgba(251,191,36,.25),0 16px 48px -6px rgba(0,0,0,.7)',
    glowLine: '0 0 10px 2px rgba(251,191,36,.55)',
  },

  career: {
    tw: 'emerald',
    hex: '#34d399',
    hexLight: '#6ee7b7',
    hexDark: '#065f46',
    glow: 'rgba(52,211,153,.5)',
    bg15: 'rgba(52,211,153,.15)',
    bg12: 'rgba(52,211,153,.12)',
    border35: 'rgba(52,211,153,.35)',
    border20: 'rgba(52,211,153,.20)',
    btnGradient: 'linear-gradient(135deg,#065f46,#34d399)',
    dropShadow: 'drop-shadow(0 0 12px rgba(52,211,153,.55))',
    bgTint:
      'radial-gradient(ellipse 60% 40% at 15% 20%,rgba(52,211,153,.09) 0%,transparent 65%),' +
      'radial-gradient(ellipse 50% 50% at 85% 75%,rgba(6,95,70,.14) 0%,transparent 65%)',
    glassBorder:
      'linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(52,211,153,.18) 35%,rgba(6,95,70,.12) 70%,rgba(255,255,255,.04) 100%)',
    hoverShadow:
      'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(52,211,153,.35),0 0 30px -4px rgba(52,211,153,.3),0 16px 48px -6px rgba(0,0,0,.7)',
    glowLine: '0 0 10px 2px rgba(52,211,153,.55)',
  },

  values: {
    tw: 'teal',
    hex: '#2dd4bf',
    hexLight: '#5eead4',
    hexDark: '#134e4a',
    glow: 'rgba(45,212,191,.5)',
    bg15: 'rgba(45,212,191,.15)',
    bg12: 'rgba(45,212,191,.12)',
    border35: 'rgba(45,212,191,.35)',
    border20: 'rgba(45,212,191,.20)',
    btnGradient: 'linear-gradient(135deg,#134e4a,#2dd4bf)',
    dropShadow: 'drop-shadow(0 0 12px rgba(45,212,191,.55))',
    bgTint:
      'radial-gradient(ellipse 60% 40% at 15% 20%,rgba(45,212,191,.09) 0%,transparent 65%),' +
      'radial-gradient(ellipse 50% 50% at 85% 75%,rgba(19,78,74,.12) 0%,transparent 65%)',
    glassBorder:
      'linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(45,212,191,.18) 35%,rgba(19,78,74,.1) 70%,rgba(255,255,255,.04) 100%)',
    hoverShadow:
      'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(45,212,191,.35),0 0 30px -4px rgba(45,212,191,.3),0 16px 48px -6px rgba(0,0,0,.7)',
    glowLine: '0 0 10px 2px rgba(45,212,191,.55)',
  },
};

/**
 * Returns the colour theme for a given testId.
 * Falls back to hexaco if the id is unknown.
 *
 * @example
 * const TH = getTestTheme('enneagram');
 * // use TH.hex in Recharts `stroke={TH.hex}` or TH.bg12 for card backgrounds
 */
export function getTestTheme(testId: string): TestTheme {
  return THEMES[testId.toLowerCase()] ?? THEMES.hexaco;
}

export default THEMES;
