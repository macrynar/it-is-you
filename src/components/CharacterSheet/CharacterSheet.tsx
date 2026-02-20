import { ArrowLeft, Lock, Zap, Brain, Star, Briefcase, Flame, Heart, Sparkles, User, ChevronRight, Shield } from 'lucide-react';

// ─── INTERFACES ───────────────────────────────────────────────────────────────

interface CharacterProfile {
  user: {
    name: string;
    avatarUrl: string;
    level: number;
  };
  aiSynthesis: {
    epithet: string;
    rpgClass: string;
    popCultureMatches: string[];
    executiveSummary: string;
  };
  hardStats: {
    enneagram: string;
    topTalents: string[];
    hollandCode: string;
    darkTriadWarning: { trait: string; score: number };
    coreValues: string[];
  };
}

interface TestModule {
  key: string;
  label: string;
  sublabel: string;
  route: string;
  accent: string;
  accentDim: string;
  icon: React.ReactNode;
  summary: React.ReactNode;
}

interface CompletedTests {
  hexaco: boolean;
  enneagram: boolean;
  strengths: boolean;
  career: boolean;
  darkTriad: boolean;
  values: boolean;
}

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────

const MOCK_PROFILE: CharacterProfile = {
  user: {
    name: 'Maciej R.',
    avatarUrl: '',
    level: 4,
  },
  aiSynthesis: {
    epithet: 'Architekt Cienia',
    rpgClass: 'Praworządny Neutralny Strateg',
    popCultureMatches: ['Dr. House', 'Thomas Shelby', 'Tyrion Lannister'],
    executiveSummary:
      'Łączysz analityczną precyzję z intuicją taktyczną, co czyni Cię naturalnym architektem systemów i strategii. Twoja siła leży w dostrzeganiu wzorców tam, gdzie inni widzą chaos – ale uważaj: skłonność do nadmiernej kontroli może izolować Cię od sojuszników.',
  },
  hardStats: {
    enneagram: 'Typ 5w6 (Badacz)',
    topTalents: ['Intelekt', 'Strategia', 'Ukierunkowanie'],
    hollandCode: 'INT (Badawczy-Artystyczny)',
    darkTriadWarning: { trait: 'Makiawelizm', score: 82 },
    coreValues: ['Niezależność', 'Osiągnięcia', 'Władza'],
  },
};

// Which tests are completed (mock – some locked for demo)
const MOCK_COMPLETED: CompletedTests = {
  hexaco: true,
  enneagram: true,
  strengths: true,
  career: true,
  darkTriad: false,
  values: false,
};

const TOTAL_TESTS = 6;
const completedCount = Object.values(MOCK_COMPLETED).filter(Boolean).length;

// ─── COLORS ────────────────────────────────────────────────────────────────────

const C = {
  violet:     '#7000ff',
  violetDim:  'rgba(112,0,255,0.12)',
  fuchsia:    '#d946ef',
  fuchsiaDim: 'rgba(217,70,239,0.12)',
  cyan:       '#00f0ff',
  cyanDim:    'rgba(0,240,255,0.10)',
  amber:      '#fbbf24',
  amberDim:   'rgba(251,191,36,0.12)',
  emerald:    '#34d399',
  emeraldDim: 'rgba(52,211,153,0.12)',
  rose:       '#fb7185',
  roseDim:    'rgba(251,113,133,0.12)',
  teal:       '#14b8a6',
  tealDim:    'rgba(20,184,166,0.12)',
};

// ─── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

  .cs-root {
    min-height: 100vh;
    background: #030014;
    background-image:
      radial-gradient(circle at 50% 0%, #2a1b5e 0%, transparent 55%),
      radial-gradient(circle at 100% 0%, #1a0b38 0%, transparent 40%);
    color: #e2e8f0;
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* NAV */
  .cs-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(3,0,20,.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(112,0,255,.15);
  }
  .cs-nav-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 14px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .cs-nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,.1);
    background: rgba(255,255,255,.04);
    color: #94a3b8;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all .2s ease;
    text-decoration: none;
  }
  .cs-nav-btn:hover { border-color: rgba(112,0,255,.5); color: #fff; background: rgba(112,0,255,.1); }
  .cs-nav-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #7c6fcd;
    letter-spacing: .5px;
    text-transform: uppercase;
  }
  .cs-nav-ai-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    border-radius: 10px;
    border: 1px solid rgba(112,0,255,.4);
    background: rgba(112,0,255,.12);
    color: #a78bfa;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s ease;
  }
  .cs-nav-ai-btn:hover { background: rgba(112,0,255,.22); border-color: rgba(112,0,255,.7); color: #fff; }

  /* LAYOUT */
  .cs-body {
    max-width: 1100px;
    margin: 0 auto;
    padding: 36px 32px 80px;
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 24px;
    align-items: start;
  }
  @media (max-width: 860px) {
    .cs-body { grid-template-columns: 1fr; padding: 24px 16px 60px; }
    .cs-nav-inner { padding: 12px 16px; }
  }

  /* GLASS CARD base */
  .cs-glass {
    background: linear-gradient(180deg, rgba(20,10,40,.75) 0%, rgba(10,5,20,.45) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 16px;
    position: relative;
    overflow: hidden;
  }
  .cs-glass::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(112,0,255,.04) 0%, transparent 60%);
    pointer-events: none;
  }

  /* IDENTITY CARD */
  .cs-identity { padding: 28px; }
  .cs-avatar-wrap { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 24px; }
  .cs-avatar {
    width: 80px; height: 80px; border-radius: 50%;
    border: 2px solid rgba(112,0,255,.5);
    box-shadow: 0 0 24px rgba(112,0,255,.35);
    background: linear-gradient(135deg, #2a1b5e, #1a0b38);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 28px; font-weight: 700; color: #a78bfa;
    margin-bottom: 14px; overflow: hidden;
  }
  .cs-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .cs-level-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 700; letter-spacing: .6px;
    color: #7000ff; background: rgba(112,0,255,.12);
    border: 1px solid rgba(112,0,255,.3);
    padding: 3px 10px; border-radius: 999px; margin-bottom: 8px;
    text-transform: uppercase;
  }
  .cs-name { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: #f8fafc; margin-bottom: 4px; }
  .cs-epithet { font-size: 12px; color: #a78bfa; font-weight: 500; margin-bottom: 12px; }
  .cs-rpg-class {
    display: inline-block;
    font-size: 11px; font-weight: 600; letter-spacing: .4px;
    color: #00f0ff; background: rgba(0,240,255,.08);
    border: 1px solid rgba(0,240,255,.2);
    padding: 4px 12px; border-radius: 8px;
  }

  /* Progress bar */
  .cs-progress-wrap { margin: 20px 0 24px; }
  .cs-progress-label {
    display: flex; justify-content: space-between;
    font-size: 11px; color: #64748b; margin-bottom: 6px;
  }
  .cs-progress-track {
    height: 5px; border-radius: 999px;
    background: rgba(255,255,255,.06); overflow: hidden;
  }
  .cs-progress-fill {
    height: 100%; border-radius: 999px;
    background: linear-gradient(90deg, #7000ff, #00f0ff);
    transition: width .8s ease;
  }

  /* Pop culture */
  .cs-section-label {
    font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
    color: #4a4070; text-transform: uppercase; margin-bottom: 10px;
  }
  .cs-pop-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 22px; }
  .cs-pop-chip {
    font-size: 12px; font-weight: 500;
    color: #c4b5fd; background: rgba(112,0,255,.1);
    border: 1px solid rgba(112,0,255,.2);
    padding: 4px 10px; border-radius: 8px;
  }

  /* Executive summary */
  .cs-summary-text {
    font-size: 13px; line-height: 1.65; color: #94a3b8;
    border-left: 2px solid rgba(112,0,255,.3);
    padding-left: 12px;
  }

  /* MODULES AREA ── right column */
  .cs-modules-wrap { display: flex; flex-direction: column; gap: 16px; }

  /* AI SYNTHESIS banner */
  .cs-ai-banner {
    border-radius: 16px;
    padding: 20px 24px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    background: linear-gradient(135deg, rgba(112,0,255,.15), rgba(0,240,255,.08));
    border: 1px solid rgba(112,0,255,.25);
  }
  .cs-ai-banner.locked {
    background: rgba(255,255,255,.03);
    border-color: rgba(255,255,255,.07);
  }
  .cs-ai-banner-text h3 { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: #f8fafc; margin-bottom: 4px; }
  .cs-ai-banner-text p  { font-size: 12px; color: #64748b; }
  .cs-ai-banner-cta {
    flex-shrink: 0;
    padding: 9px 20px;
    border-radius: 10px;
    font-size: 13px; font-weight: 700;
    border: 1px solid rgba(112,0,255,.45);
    background: rgba(112,0,255,.18);
    color: #c4b5fd; cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px;
    transition: all .2s;
    white-space: nowrap;
  }
  .cs-ai-banner-cta:hover { background: rgba(112,0,255,.3); color: #fff; }
  .cs-ai-banner-cta.disabled { opacity: .4; cursor: not-allowed; pointer-events: none; }

  /* MODULE GRID */
  .cs-module-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  @media (max-width: 600px) { .cs-module-grid { grid-template-columns: 1fr; } }

  /* MODULE CARD */
  .cs-mod {
    border-radius: 14px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.07);
    background: linear-gradient(180deg, rgba(20,10,40,.75) 0%, rgba(10,5,20,.45) 100%);
    transition: border-color .25s;
    min-height: 140px;
  }
  .cs-mod-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .cs-mod-icon {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .cs-mod-label { font-size: 10px; font-weight: 700; letter-spacing: .8px; color: #4a4070; text-transform: uppercase; margin-bottom: 2px; }
  .cs-mod-name  { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; color: #f1f5f9; }

  .cs-mod-stat  { font-size: 20px; font-weight: 800; font-family: 'Space Grotesk', sans-serif; margin-bottom: 4px; }
  .cs-mod-sub   { font-size: 12px; color: #64748b; line-height: 1.5; }

  .cs-mod-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
  .cs-mod-chip  { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 6px; }

  /* WARNING chip */
  .cs-warning-chip {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 700;
    background: rgba(255,0,92,.1); border: 1px solid rgba(255,0,92,.3);
    color: #fb7185; padding: 3px 10px; border-radius: 7px; margin-top: 8px;
  }

  /* LOCKED state */
  .cs-mod-locked-overlay {
    position: absolute; inset: 0;
    background: rgba(3,0,20,.78);
    backdrop-filter: blur(3px);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 10px; padding: 20px; text-align: center;
    border-radius: 14px;
  }
  .cs-lock-icon { color: #4a4070; margin-bottom: 4px; }
  .cs-lock-label { font-size: 11px; color: #4a4070; }
  .cs-lock-cta {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; font-weight: 600;
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid rgba(112,0,255,.35);
    background: rgba(112,0,255,.1);
    color: #a78bfa; cursor: pointer; text-decoration: none;
    transition: all .2s;
  }
  .cs-lock-cta:hover { background: rgba(112,0,255,.2); color: #fff; }
`;

// ─── MODULE META ───────────────────────────────────────────────────────────────

function buildModules(profile: CharacterProfile, done: CompletedTests): TestModule[] {
  const { hardStats } = profile;
  return [
    {
      key: 'enneagram',
      label: 'Enneagram',
      sublabel: 'Archetyp Osobowości',
      route: '/test?type=enneagram',
      accent: C.fuchsia,
      accentDim: C.fuchsiaDim,
      icon: <Brain size={18} />,
      summary: (
        <>
          <div className="cs-mod-stat" style={{ color: C.fuchsia }}>{hardStats.enneagram}</div>
          <div className="cs-mod-sub">Dominujący system motywacyjny</div>
        </>
      ),
    },
    {
      key: 'hexaco',
      label: 'HEXACO',
      sublabel: 'Cechy Osobowości',
      route: '/test?type=hexaco',
      accent: C.cyan,
      accentDim: C.cyanDim,
      icon: <Zap size={18} />,
      summary: (
        <>
          <div className="cs-mod-sub" style={{ color: '#94a3b8' }}>Wysoka: Otwartość, Sumienność</div>
          <div className="cs-mod-sub" style={{ marginTop: 4 }}>Niska: Ugodowość</div>
          <div className="cs-mod-chips">
            {['O+', 'C+', 'A−'].map(t => (
              <span key={t} className="cs-mod-chip" style={{ background: C.cyanDim, color: C.cyan, border: `1px solid rgba(0,240,255,.2)` }}>{t}</span>
            ))}
          </div>
        </>
      ),
    },
    {
      key: 'strengths',
      label: 'High5 Talenty',
      sublabel: 'Mocne Strony',
      route: '/test?type=strengths',
      accent: C.amber,
      accentDim: C.amberDim,
      icon: <Star size={18} />,
      summary: (
        <>
          <div className="cs-mod-sub" style={{ color: '#94a3b8', marginBottom: 8 }}>Top 3 talenty:</div>
          <div className="cs-mod-chips">
            {hardStats.topTalents.map(t => (
              <span key={t} className="cs-mod-chip" style={{ background: C.amberDim, color: C.amber, border: `1px solid rgba(251,191,36,.2)` }}>{t}</span>
            ))}
          </div>
        </>
      ),
    },
    {
      key: 'career',
      label: 'Profil Zawodowy',
      sublabel: 'Kod Hollanda',
      route: '/test?type=career',
      accent: C.emerald,
      accentDim: C.emeraldDim,
      icon: <Briefcase size={18} />,
      summary: (
        <>
          <div className="cs-mod-stat" style={{ color: C.emerald }}>{hardStats.hollandCode}</div>
          <div className="cs-mod-sub">Dominujące zainteresowania zawodowe</div>
        </>
      ),
    },
    {
      key: 'darkTriad',
      label: 'Analiza Cienia',
      sublabel: 'Dark Triad',
      route: '/test?type=dark-triad',
      accent: C.rose,
      accentDim: C.roseDim,
      icon: <Flame size={18} />,
      summary: (
        <>
          <div className="cs-mod-sub" style={{ color: '#94a3b8' }}>Wykryte ryzyko:</div>
          <div className="cs-warning-chip">
            <Shield size={11} /> {hardStats.darkTriadWarning.trait}: {hardStats.darkTriadWarning.score}/100
          </div>
        </>
      ),
    },
    {
      key: 'values',
      label: 'Wartości',
      sublabel: 'Schwartz PVQ',
      route: '/test?type=values',
      accent: C.teal,
      accentDim: C.tealDim,
      icon: <Heart size={18} />,
      summary: (
        <>
          <div className="cs-mod-sub" style={{ color: '#94a3b8', marginBottom: 8 }}>Kluczowe wartości:</div>
          <div className="cs-mod-chips">
            {hardStats.coreValues.map(v => (
              <span key={v} className="cs-mod-chip" style={{ background: C.tealDim, color: C.teal, border: `1px solid rgba(20,184,166,.2)` }}>{v}</span>
            ))}
          </div>
        </>
      ),
    },
  ];
}

// ─── SUBCOMPONENTS ─────────────────────────────────────────────────────────────

function ModuleCard({ mod, completed }: { mod: TestModule; completed: boolean }) {
  return (
    <div
      className="cs-mod"
      style={completed ? { borderColor: `${mod.accent}22` } : undefined}
    >
      {/* Background glow dot */}
      {completed && (
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 120, height: 120, borderRadius: '50%',
          background: mod.accent, opacity: .04, filter: 'blur(24px)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Header */}
      <div className="cs-mod-header">
        <div className="cs-mod-icon" style={{ background: mod.accentDim, color: mod.accent }}>
          {mod.icon}
        </div>
        <div>
          <div className="cs-mod-label">{mod.label}</div>
          <div className="cs-mod-name">{mod.sublabel}</div>
        </div>
      </div>

      {/* Content */}
      {completed ? (
        <div>{mod.summary}</div>
      ) : (
        <div className="cs-mod-locked-overlay">
          <Lock size={22} className="cs-lock-icon" style={{ color: '#4a4070' }} />
          <div className="cs-lock-label">
            Ukończ <strong style={{ color: '#6d5fa6' }}>{mod.label}</strong>, aby odblokować ten moduł
          </div>
          <a href={mod.route} className="cs-lock-cta">
            Rozpocznij test <ChevronRight size={13} />
          </a>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function CharacterSheet() {
  const profile = MOCK_PROFILE;
  const done    = MOCK_COMPLETED;
  const modules = buildModules(profile, done);
  const progressPct = Math.round((completedCount / TOTAL_TESTS) * 100);
  const allDone = completedCount === TOTAL_TESTS;

  const initials = profile.user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <style>{CSS}</style>
      <div className="cs-root">

        {/* ── NAV ── */}
        <nav className="cs-nav">
          <div className="cs-nav-inner">
            <button className="cs-nav-btn" onClick={() => window.location.href = '/user-profile-tests.html'}>
              <ArrowLeft size={15} /> Dashboard
            </button>
            <span className="cs-nav-title">Karta Postaci</span>
            <button
              className={`cs-nav-ai-btn${allDone ? '' : ' disabled'}`}
              style={allDone ? {} : { opacity: .35, cursor: 'not-allowed' }}
              title={allDone ? 'Uruchom analizę AI' : `Ukończ wszystkie ${TOTAL_TESTS} testy aby odblokować`}
            >
              <Sparkles size={14} /> Neural Engine Analysis
            </button>
          </div>
        </nav>

        {/* ── BODY ── */}
        <div className="cs-body">

          {/* ─ LEFT: Identity ─ */}
          <aside>
            <div className="cs-glass cs-identity">
              <div className="cs-avatar-wrap">
                <div className="cs-avatar">
                  {profile.user.avatarUrl
                    ? <img src={profile.user.avatarUrl} alt={profile.user.name} />
                    : initials}
                </div>
                <div className="cs-level-badge">
                  <Zap size={10} /> Poziom {profile.user.level}
                </div>
                <div className="cs-name">{profile.user.name}</div>
                <div className="cs-epithet">„{profile.aiSynthesis.epithet}"</div>
                <div className="cs-rpg-class">{profile.aiSynthesis.rpgClass}</div>
              </div>

              {/* Progress */}
              <div className="cs-progress-wrap">
                <div className="cs-progress-label">
                  <span>Postęp profilowania</span>
                  <span style={{ color: completedCount === TOTAL_TESTS ? C.emerald : '#64748b' }}>
                    {completedCount}/{TOTAL_TESTS} modułów
                  </span>
                </div>
                <div className="cs-progress-track">
                  <div className="cs-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              {/* Pop culture */}
              {allDone && (
                <>
                  <div className="cs-section-label">Najbliższe dopasowania</div>
                  <div className="cs-pop-chips">
                    {profile.aiSynthesis.popCultureMatches.map(m => (
                      <span key={m} className="cs-pop-chip">{m}</span>
                    ))}
                  </div>
                </>
              )}

              {/* Executive summary */}
              {allDone ? (
                <>
                  <div className="cs-section-label">Synteza AI</div>
                  <p className="cs-summary-text">{profile.aiSynthesis.executiveSummary}</p>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#4a4070', fontSize: 12 }}>
                    <Lock size={13} />
                    Synteza AI odblokuje się po ukończeniu wszystkich {TOTAL_TESTS} modułów
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ─ RIGHT: Modules ─ */}
          <main>
            <div className="cs-modules-wrap">

              {/* AI Synthesis banner */}
              <div className={`cs-ai-banner${allDone ? '' : ' locked'}`}>
                <div className="cs-ai-banner-text">
                  <h3>
                    {allDone
                      ? '✦ Neural Engine Analysis — Gotowy'
                      : '✦ Neural Engine Analysis — Zablokowany'}
                  </h3>
                  <p>
                    {allDone
                      ? 'Wszystkie moduły ukończone. Uruchom pełną syntezę AI swojego profilu.'
                      : `Ukończ ${TOTAL_TESTS - completedCount} pozostałe ${TOTAL_TESTS - completedCount === 1 ? 'moduł' : 'moduły'}, aby odblokować generatywną analizę AI.`}
                  </p>
                </div>
                <button
                  className={`cs-ai-banner-cta${allDone ? '' : ' disabled'}`}
                  disabled={!allDone}
                >
                  <Sparkles size={14} />
                  {allDone ? 'Uruchom NEA' : `${completedCount}/${TOTAL_TESTS} modułów`}
                </button>
              </div>

              {/* Module cards grid */}
              <div className="cs-module-grid">
                {modules.map(mod => (
                  <ModuleCard
                    key={mod.key}
                    mod={mod}
                    completed={done[mod.key as keyof CompletedTests]}
                  />
                ))}
              </div>

            </div>
          </main>

        </div>
      </div>
    </>
  );
}
