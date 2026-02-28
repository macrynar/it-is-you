import { useState } from 'react';
import AlchemeLogo from '../AlchemeLogo';
import { supabase } from '../../lib/supabaseClient.js';

const NAV_LINKS = [
  { label: 'Baza Wiedzy',   href: '/baza-wiedzy/',        key: 'baza-wiedzy' },
  { label: 'Metodologia',   href: '/methodology',          key: 'methodology' },
  { label: 'Cennik',        href: '/pricing',              key: 'pricing' },
  { label: 'Karta Postaci', href: '/character',            key: 'character' },
  { label: 'Testy',         href: '/user-profile-tests',   key: 'tests' },
] as const;

type NavKey = (typeof NAV_LINKS)[number]['key'] | (string & {});

interface MainNavProps {
  /** Which link to mark as active */
  activeLink?: NavKey;
  /** Current theme — show toggle only when provided */
  theme?: 'dark' | 'light';
  onThemeToggle?: () => void;
}

const SettingsIcon = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const MoonIcon = () => (
  <svg className="theme-icon theme-icon-moon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const SunIcon = () => (
  <svg className="theme-icon theme-icon-sun" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default function MainNav({ activeLink, theme, onThemeToggle }: MainNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const iconBtn = 'flex items-center justify-center w-9 h-9 rounded-lg text-white/45 hover:text-white hover:bg-white/8 border border-transparent hover:border-white/10 transition-all';
  const iconBtnDanger = 'flex items-center justify-center w-9 h-9 rounded-lg text-white/45 hover:text-red-400 hover:bg-red-500/8 border border-transparent hover:border-red-500/20 transition-all';

  return (
    <nav className="border-b border-white/5 bg-bg-surface/80 backdrop-blur-xl sticky top-0 z-50 nav-neural">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <AlchemeLogo href="/" size={32} />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href, key }) => (
              <a
                key={key}
                href={href}
                className={`iiy-nav-link${activeLink === key ? ' active' : ''}`}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2">
            {theme !== undefined && onThemeToggle && (
              <button
                type="button"
                className={`theme-toggle${theme === 'light' ? ' light' : ''}`}
                onClick={onThemeToggle}
                title="Przełącz motyw"
              >
                <div className="theme-toggle-slider" />
                <MoonIcon />
                <SunIcon />
              </button>
            )}
            <a href="/settings" className={iconBtn} title="Ustawienia">
              <SettingsIcon />
            </a>
            <button type="button" onClick={handleLogout} className={iconBtnDanger} title="Wyloguj">
              <LogoutIcon />
            </button>
          </div>

          {/* Hamburger — mobile */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,15,43,0.97)', backdropFilter: 'blur(20px)' }}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href, key }) => (
              <a
                key={key}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/5 ${activeLink === key ? 'text-white' : 'text-white/80 hover:text-white'}`}
                style={{ textDecoration: 'none' }}
              >
                {label}
              </a>
            ))}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
            <a
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all"
              style={{ textDecoration: 'none' }}
            >
              Ustawienia
            </a>
            {theme !== undefined && onThemeToggle && (
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs text-white/30 uppercase tracking-widest font-semibold">Motyw</span>
                <button
                  type="button"
                  className={`theme-toggle${theme === 'light' ? ' light' : ''}`}
                  onClick={onThemeToggle}
                  title="Przełącz motyw"
                >
                  <div className="theme-toggle-slider" />
                  <MoonIcon />
                  <SunIcon />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-all text-left"
            >
              <LogoutIcon />
              Wyloguj
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
