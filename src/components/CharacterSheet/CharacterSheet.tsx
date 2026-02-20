import { useEffect, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { Sparkles, AlertTriangle, Zap, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.js';
import { generateCareerReport } from '../../utils/scoring.js';

/* ─── LORE TABLES ────────────────────────────────────────────────────────────── */

const HEXACO_LABELS: Record<string, string> = {
  honesty_humility:  'Uczciw',
  emotionality:      'Emocje',
  extraversion:      'Ekstra',
  agreeableness:     'Ugodow',
  conscientiousness: 'Sumien',
  openness:          'Otwart',
};

const HEXACO_FULL: Record<string, string> = {
  honesty_humility:  'Uczciwość',
  emotionality:      'Emocjonalność',
  extraversion:      'Ekstrawersja',
  agreeableness:     'Ugodowość',
  conscientiousness: 'Sumienność',
  openness:          'Otwartość',
};

const ENNEAGRAM_LORE: Record<number, { rpg: string; epithet: string; pop: string[] }> = {
  1: { rpg: 'Praworządny Paladin',     epithet: 'Architekt Porządku',    pop: ['Hermiona Granger', 'Ned Stark', 'Chidi'] },
  2: { rpg: 'Kapłan Wsparcia',         epithet: 'Strażnik Serc',         pop: ['Leslie Knope', 'Samwise Gamgee', 'Ted Lasso'] },
  3: { rpg: 'Bard Ambicji',            epithet: 'Architekt Sukcesu',     pop: ['Tony Stark', 'Harvey Specter', 'Jay Gatsby'] },
  4: { rpg: 'Mroczny Artysta',         epithet: 'Dziecko Cienia',        pop: ['Joker (2019)', 'Severus Snape', 'Don Draper'] },
  5: { rpg: 'Mistrz Wiedzy Zakazanej', epithet: 'Architekt Cienia',      pop: ['Sherlock Holmes', 'Dr House', 'Walter White'] },
  6: { rpg: 'Strażnik Bractwa',        epithet: 'Bastion Lojalności',    pop: ['Captain America', 'Ron Weasley', 'Samwise'] },
  7: { rpg: 'Chaotyczny Awanturnik',   epithet: 'Wirtuoz Możliwości',    pop: ['Jack Sparrow', 'Tyrion Lannister', 'The Mandalorian'] },
  8: { rpg: 'Warlord Wojenny',         epithet: 'Inkwizytor Woli',       pop: ['Walter White', 'Tony Soprano', 'Daenerys'] },
  9: { rpg: 'Mnich Harmonii',          epithet: 'Spokój w Oku Cyklonu',  pop: ['Frodo Baggins', 'Ted Lasso', 'The Dude'] },
};

const DT_NAMES: Record<string, string> = {
  machiavellianism: 'Makiawelizm',
  narcissism:       'Narcyzm',
  psychopathy:      'Psychopatia',
};

const DT_COLORS: Record<string, string> = {
  machiavellianism: '#f97316',
  narcissism:       '#fbbf24',
  psychopathy:      '#ef4444',
};

/* ─── ENNEAGRAM SVG STAR ─────────────────────────────────────────────────────── */

function EnneagramStar({ activeType, color }: { activeType: number | null; color: string }) {
  const N = 9;
  const cx = 100; const cy = 100; const R = 76;
  const pts = Array.from({ length: N }, (_, i) => {
    const a = (i * Math.PI * 2) / N - Math.PI / 2;
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), type: i + 1 };
  });
  const innerLines: [number, number][] = [[1,4],[4,2],[2,8],[8,5],[5,7],[7,1],[3,6],[6,9],[9,3]];
  const getP = (n: number) => pts[n - 1];

  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <defs>
        <filter id="enn-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      {innerLines.map(([a, b], i) => {
        const pa = getP(a); const pb = getP(b);
        return <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="rgba(168,85,247,0.2)" strokeWidth="1" />;
      })}
      <polygon
        points={pts.map(p => `${p.x},${p.y}`).join(' ')}
        fill={`${color}06`}
        stroke={`${color}35`}
        strokeWidth="1"
      />
      {pts.map((p) => (
        <circle
          key={p.type}
          cx={p.x} cy={p.y}
          r={p.type === activeType ? 7 : 3.5}
          fill={p.type === activeType ? color : 'rgba(255,255,255,0.1)'}
          filter={p.type === activeType ? 'url(#enn-glow)' : undefined}
          style={{ transition: 'all .3s' }}
        />
      ))}
      {pts.map((p) => {
        const dx = p.x - cx; const dy = p.y - cy;
        const len = Math.sqrt(dx * dx + dy * dy);
        const lx = cx + (dx / len) * (R + 13);
        const ly = cy + (dy / len) * (R + 13);
        return (
          <text
            key={p.type} x={lx} y={ly}
            textAnchor="middle" dominantBaseline="central"
            fontSize={p.type === activeType ? 9 : 7.5}
            fill={p.type === activeType ? color : 'rgba(255,255,255,0.22)'}
            fontWeight={p.type === activeType ? '700' : '400'}
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            {p.type}
          </text>
        );
      })}
      {activeType && (
        <>
          <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="central"
            fontSize="46" fontWeight="900" fill={color}
            style={{ fontFamily: 'Orbitron, monospace', filter: `drop-shadow(0 0 20px ${color})` }}>
            {activeType}
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" dominantBaseline="central"
            fontSize="7" fill="rgba(255,255,255,0.25)"
            style={{ fontFamily: 'Share Tech Mono, monospace', letterSpacing: 2 }}>
            ENNEAGRAM
          </text>
        </>
      )}
    </svg>
  );
}

/* ─── SHARED HELPERS ─────────────────────────────────────────────────────────── */

function TileLabel({ children, color = 'text-cyan-500/40' }: { children: React.ReactNode; color?: string }) {
  return (
    <div className={`font-mono text-[9px] tracking-[2.5px] uppercase mb-3 flex items-center gap-2 ${color}`}>
      {children}
      <span className="flex-1 h-px bg-gradient-to-r from-current to-transparent opacity-20" />
    </div>
  );
}

function LockedTile({ icon, text, href, color }: {
  icon: React.ReactNode; text: string; href: string; color: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4 opacity-40">
      <div style={{ color }}>{icon}</div>
      <p className="font-mono text-[9px] tracking-widest text-white/30 text-center">{text}</p>
      <a href={href} style={{ borderColor: `${color}30`, color: `${color}88`, background: `${color}09` }}
        className="px-3 py-1.5 rounded-lg border text-[11px] font-semibold no-underline transition-all hover:opacity-80">
        Rozpocznij →
      </a>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────────── */

interface RawRow { test_type: string; raw_scores: any; percentile_scores: any; report: any; }
interface ParsedData {
  hexaco: RawRow | null; enneagram: RawRow | null; strengths: RawRow | null;
  career: RawRow | null; darkTriad: RawRow | null; values: RawRow | null;
}

export default function CharacterSheet() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [raw, setRaw] = useState<ParsedData>({
    hexaco: null, enneagram: null, strengths: null,
    career: null, darkTriad: null, values: null,
  });

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = '/auth'; return; }
      setUser(u);
      const { data: rows } = await supabase
        .from('user_psychometrics')
        .select('test_type, raw_scores, percentile_scores, report')
        .eq('user_id', u.id)
        .in('test_type', ['HEXACO', 'ENNEAGRAM', 'STRENGTHS', 'CAREER', 'DARK_TRIAD', 'VALUES'])
        .order('created_at', { ascending: false });
      if (rows) {
        const m: any = {};
        for (const r of rows) if (!m[r.test_type]) m[r.test_type] = r;
        setRaw({
          hexaco:    m['HEXACO']     ?? null,
          enneagram: m['ENNEAGRAM']  ?? null,
          strengths: m['STRENGTHS']  ?? null,
          career:    m['CAREER']     ?? null,
          darkTriad: m['DARK_TRIAD'] ?? null,
          values:    m['VALUES']     ?? null,
        });
      }
      setLoading(false);
    })();
  }, []);

  /* ── derived ── */
  const userName  = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Użytkownik';
  const avatarUrl = user?.user_metadata?.avatar_url ?? '';
  const initials  = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const ennReport  = raw.enneagram?.report;
  const ennPrimary = ennReport?.primary_type;
  const ennTypeNum: number | null = ennPrimary?.id ?? null;
  const ennLore    = ennTypeNum ? ENNEAGRAM_LORE[ennTypeNum] : null;

  const hexPct: Record<string, number> = raw.hexaco?.percentile_scores ?? {};
  const hexDims = ['honesty_humility', 'emotionality', 'extraversion', 'agreeableness', 'conscientiousness', 'openness'];
  const radarData = hexDims.map(k => ({
    trait: HEXACO_LABELS[k] ?? k,
    full:  HEXACO_FULL[k]   ?? k,
    value: Math.round(hexPct[k] ?? 0),
  }));
  const hexTopDim = [...radarData].sort((a, b) => b.value - a.value)[0];

  const top5: any[] = raw.strengths?.raw_scores?.top_5 ?? [];

  const dtDims = raw.darkTriad?.raw_scores?.dimensions ?? {};
  const dtTraits = ['machiavellianism', 'narcissism', 'psychopathy'].map(k => {
    const v = dtDims[k]?.raw_score ?? 0;
    const pct = v <= 5 ? Math.round(((v - 1) / 4) * 100) : Math.round(v);
    return { k, name: DT_NAMES[k], pct, color: DT_COLORS[k] };
  }).sort((a, b) => b.pct - a.pct);
  const dtTop = dtTraits[0];

  const careerReport = raw.career
    ? (raw.career.report ?? generateCareerReport(raw.career.raw_scores))
    : null;
  const hollandCode = careerReport?.holland_code ?? null;

  const completedCount = [raw.hexaco, raw.enneagram, raw.strengths, raw.career, raw.darkTriad, raw.values].filter(Boolean).length;

  /* ── AI synthesis ── */
  function buildAiSummary(): string {
    if (completedCount < 2) return 'Uzupełnij przynajmniej 2 testy, aby odblokować syntezę AI.';
    const parts: string[] = [];
    if (ennLore && ennPrimary)
      parts.push(`Twój profil Enneagram (Typ ${ennTypeNum} · ${ennPrimary.name}) identyfikuje Cię jako ${ennLore.rpg} — ${ennLore.epithet}.`);
    const hexSorted = Object.entries(hexPct).sort(([, a], [, b]) => b - a);
    if (hexSorted.length)
      parts.push(`Dominanta HEXACO w ${HEXACO_FULL[hexSorted[0][0]]} (${Math.round(hexSorted[0][1])}%) tworzy spójną kombinację z profilem silnych stron.`);
    if (dtTop && dtTop.pct > 45)
      parts.push(`Podwyższony wskaźnik ${dtTop.name} (${dtTop.pct}%) sugeruje skłonność do strategicznego myślenia — zarządzaj tym świadomie.`);
    if (parts.length === 0)
      parts.push('Profil psychometryczny w budowie. Ukończ kolejne testy, aby odblokować pełną syntezę AI.');
    return parts.join(' ');
  }

  /* ── loading state ── */
  if (loading) return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center">
      <style>{`@keyframes _cs_spin{to{transform:rotate(360deg)}}`}</style>
      <div className="text-center">
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(112,0,255,.25)', borderTopColor: '#7000ff', animation: '_cs_spin .8s linear infinite', margin: '0 auto 16px' }} />
        <div className="font-mono text-white/30 text-[13px] tracking-[3px]">ŁADOWANIE...</div>
      </div>
    </div>
  );

  /* ─── RENDER ─────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen text-slate-200" style={{ background: '#030014', backgroundImage: 'radial-gradient(circle at 50% 0%,#1a0b4e 0%,transparent 55%),radial-gradient(circle at 90% 10%,#0d1a3a 0%,transparent 40%)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Space+Grotesk:wght@500;700&display=swap');
        *{box-sizing:border-box}
        .cs-radar .recharts-polar-grid line,
        .cs-radar .recharts-polar-grid polygon{stroke:rgba(0,240,255,0.07)!important}
        .iiy-logo,.iiy-logo *{box-sizing:border-box;margin:0;padding:0}
        .iiy-logo{display:inline-flex;align-items:center;gap:20px;text-decoration:none;user-select:none}
        .iiy-logo .iiy-signet svg{display:block;width:80px;height:80px}
        .iiy-logo .iiy-wordmark{display:flex;flex-direction:column}
        .iiy-logo .iiy-title{font-family:'Orbitron',monospace;font-weight:900;font-size:34px;letter-spacing:12px;line-height:1;text-transform:uppercase;background:linear-gradient(160deg,#ffffff 0%,#a8c8ff 35%,#38b6ff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 16px rgba(56,182,255,0.45));animation:iiy-glitch 9s infinite}
        @keyframes iiy-glitch{0%,87%,100%{transform:none;filter:drop-shadow(0 0 16px rgba(56,182,255,0.45))}88%{transform:translate(-2px,0) skewX(-2deg);filter:drop-shadow(-3px 0 #7b5ea7) drop-shadow(3px 0 #38b6ff)}89%{transform:translate(2px,0);filter:drop-shadow(3px 0 #7b5ea7) drop-shadow(-3px 0 #38b6ff)}90%{transform:none;filter:drop-shadow(0 0 16px rgba(56,182,255,0.45))}}
        .iiy-logo .iiy-divider{height:1px;margin:6px 0 5px;background:linear-gradient(90deg,#38b6ff 0%,#7b5ea7 55%,transparent 100%);opacity:0.8}
        .iiy-logo .iiy-sub{font-family:'Share Tech Mono',monospace;font-size:8.5px;letter-spacing:3.5px;color:rgba(100,160,230,0.5);text-transform:uppercase}
        .iiy-ring-ticks{animation:iiy-spin 20s linear infinite;transform-origin:48px 48px}
        @keyframes iiy-spin{to{transform:rotate(360deg)}}
        .iiy-eye-l{animation:iiy-eye 3.5s ease-in-out infinite}
        .iiy-eye-r{animation:iiy-eye 3.5s ease-in-out infinite 0.2s}
        @keyframes iiy-eye{0%,70%,100%{opacity:1}76%{opacity:0.05}}
        .iiy-scan{animation:iiy-scan 2.8s ease-in-out infinite}
        @keyframes iiy-scan{0%{transform:translateY(-22px);opacity:0}8%{opacity:0.55}92%{opacity:0.55}100%{transform:translateY(22px);opacity:0}}
        .iiy-core{animation:iiy-pulse 2.2s ease-in-out infinite;transform-origin:48px 61px}
        @keyframes iiy-pulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.9);opacity:1}}
        .iiy-logo.iiy-sm{gap:14px}
        .iiy-logo.iiy-sm .iiy-signet svg{width:44px;height:44px}
        .iiy-logo.iiy-sm .iiy-title{font-size:19px;letter-spacing:7px}
        .iiy-logo.iiy-sm .iiy-sub{font-size:7px;letter-spacing:2.5px}
        .iiy-logo.iiy-sm .iiy-divider{margin:4px 0 3px}
        .iiy-nav-tabs{display:flex;align-items:center;gap:2px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:4px}
        .iiy-tab-btn{padding:8px 20px;border-radius:9px;border:none;background:transparent;color:rgba(255,255,255,.45);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;letter-spacing:.2px;font-family:'Space Grotesk',-apple-system,sans-serif;white-space:nowrap}
        .iiy-tab-btn:hover{color:rgba(255,255,255,.8);background:rgba(255,255,255,.05)}
        .iiy-tab-btn.active{background:linear-gradient(135deg,rgba(99,102,241,.3),rgba(56,182,255,.2));color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 0 0 1px rgba(99,102,241,.3)}
      `}</style>

      {/* NAV — exact iiy-logo iiy-sm + iiy-nav-tabs from user-profile-tests.html */}
      <nav className="border-b border-white/5 sticky top-0 z-50"
        style={{ background: 'rgba(3,0,20,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* iiy-logo iiy-sm */}
            <a href="/user-profile-tests.html" className="iiy-logo iiy-sm">
              <div className="iiy-signet">
                <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="iiy-hg-cs" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38b6ff"/><stop offset="50%" stopColor="#7b5ea7"/><stop offset="100%" stopColor="#38b6ff"/>
                    </linearGradient>
                    <linearGradient id="iiy-bg-cs" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#38b6ff" stopOpacity="0.45"/>
                      <stop offset="100%" stopColor="#1a1d4a" stopOpacity="0.08"/>
                    </linearGradient>
                    <filter id="iiy-glow-cs" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="2" result="b"/>
                      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <clipPath id="iiy-clip-cs">
                      <polygon points="48,5 87,27 87,69 48,91 9,69 9,27"/>
                    </clipPath>
                  </defs>
                  <polygon points="48,5 87,27 87,69 48,91 9,69 9,27" fill="#11143a"/>
                  <g className="iiy-ring-ticks" filter="url(#iiy-glow-cs)">
                    <line x1="48" y1="5"  x2="48" y2="12" stroke="#38b6ff" strokeWidth="1.8"/>
                    <line x1="87" y1="27" x2="81" y2="30" stroke="#38b6ff" strokeWidth="1.8"/>
                    <line x1="87" y1="69" x2="81" y2="66" stroke="#38b6ff" strokeWidth="1.8"/>
                    <line x1="48" y1="91" x2="48" y2="84" stroke="#38b6ff" strokeWidth="1.8"/>
                    <line x1="9"  y1="69" x2="15" y2="66" stroke="#38b6ff" strokeWidth="1.8"/>
                    <line x1="9"  y1="27" x2="15" y2="30" stroke="#38b6ff" strokeWidth="1.8"/>
                    <line x1="68" y1="8"  x2="66" y2="12" stroke="#7b5ea7" strokeWidth="1" opacity="0.6"/>
                    <line x1="28" y1="8"  x2="30" y2="12" stroke="#7b5ea7" strokeWidth="1" opacity="0.6"/>
                    <line x1="90" y1="48" x2="84" y2="48" stroke="#7b5ea7" strokeWidth="1" opacity="0.6"/>
                    <line x1="6"  y1="48" x2="12" y2="48" stroke="#7b5ea7" strokeWidth="1" opacity="0.6"/>
                    <line x1="68" y1="88" x2="66" y2="84" stroke="#7b5ea7" strokeWidth="1" opacity="0.6"/>
                    <line x1="28" y1="88" x2="30" y2="84" stroke="#7b5ea7" strokeWidth="1" opacity="0.6"/>
                  </g>
                  <polygon points="48,5 87,27 87,69 48,91 9,69 9,27" fill="none" stroke="url(#iiy-hg-cs)" strokeWidth="1.8"/>
                  <g clipPath="url(#iiy-clip-cs)">
                    <line className="iiy-scan" x1="12" y1="48" x2="84" y2="48" stroke="#38b6ff" strokeWidth="1.2" opacity="0.5"/>
                    <circle cx="48" cy="30" r="12" fill="#11143a" stroke="#38b6ff" strokeWidth="1.2"/>
                    <rect x="37" y="26.5" width="22" height="6" rx="3" fill="#0d0f2b" stroke="#38b6ff" strokeWidth="0.7"/>
                    <ellipse className="iiy-eye-l" cx="43" cy="29.5" rx="3.5" ry="1.8" fill="#7b5ea7" filter="url(#iiy-glow-cs)"/>
                    <ellipse className="iiy-eye-r" cx="53" cy="29.5" rx="3.5" ry="1.8" fill="#7b5ea7" filter="url(#iiy-glow-cs)"/>
                    <rect x="44.5" y="42" width="7" height="6" rx="1" fill="#11143a" stroke="#38b6ff" strokeWidth="0.8"/>
                    <path d="M28 90 L31 50 Q48 44 65 50 L68 90 Z" fill="url(#iiy-bg-cs)" stroke="#38b6ff" strokeWidth="0.9"/>
                    <line x1="48" y1="50" x2="48" y2="74" stroke="#38b6ff" strokeWidth="0.5" opacity="0.35"/>
                    <rect x="39" y="55" width="18" height="12" rx="1.5" fill="none" stroke="#38b6ff" strokeWidth="0.6" opacity="0.5"/>
                    <line x1="31" y1="52" x2="31" y2="65" stroke="#7b5ea7" strokeWidth="1.4" opacity="0.9"/>
                    <line x1="65" y1="52" x2="65" y2="65" stroke="#7b5ea7" strokeWidth="1.4" opacity="0.9"/>
                    <circle className="iiy-core" cx="48" cy="61" r="2.8" fill="#38b6ff" filter="url(#iiy-glow-cs)"/>
                  </g>
                </svg>
              </div>
              <div className="iiy-wordmark">
                <div className="iiy-title">PSYCHER</div>
                <div className="iiy-divider"/>
                <div className="iiy-sub">Psychometric AI Engine</div>
              </div>
            </a>

            {/* iiy-nav-tabs */}
            <div className="iiy-nav-tabs">
              <button className="iiy-tab-btn" onClick={() => { window.location.href = '/user-profile-tests.html'; }}>🧪 Testy</button>
              <button className="iiy-tab-btn active">🃏 Karta Postaci</button>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5">
                {([raw.hexaco, raw.enneagram, raw.strengths, raw.career, raw.darkTriad, raw.values] as any[]).map((r, i) => (
                  <div key={i} className="w-2 h-2 rounded-full transition-all"
                    style={{ background: r ? '#7000ff' : 'rgba(255,255,255,0.1)', boxShadow: r ? '0 0 6px #7000ff' : 'none' }} />
                ))}
              </div>
              <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
                className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm bg-white/5 hover:bg-white/10 transition-all">
                Wyloguj
              </button>
              <a href="/settings"
                className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm bg-white/5 hover:bg-white/10 transition-all no-underline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                ⚙️ Ustawienia
              </a>
            </div>

          </div>
        </div>
      </nav>

      {/* ── BENTO GRID ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {/* ── T1: HERO CORE — col-span-full lg:col-span-2 row-span-2 ── */}
          <div className="card-neural col-span-full md:col-span-1 lg:col-span-2 lg:row-span-2 p-6 flex flex-col relative overflow-hidden">
            {/* ambient glow */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle,rgba(112,0,255,0.15) 0%,transparent 70%)' }} />

            <TileLabel color="text-violet-400/45">// PROFIL GŁÓWNY · HERO CORE</TileLabel>

            {/* Avatar – centered */}
            <div className="flex flex-col items-center text-center mb-4">
              <div className="relative flex-shrink-0 mb-3">
                <div className="w-28 h-28 rounded-full p-0.5"
                  style={{ background: 'linear-gradient(135deg,#7000ff,#d946ef,#00f0ff)', boxShadow: '0 0 30px rgba(112,0,255,0.5)' }}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#150830] flex items-center justify-center">
                    {avatarUrl
                      ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      : <span className="text-3xl font-bold text-violet-400" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{initials}</span>
                    }
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#030014]"
                  style={{ background: completedCount >= 4 ? '#34d399' : '#f97316', boxShadow: `0 0 8px ${completedCount >= 4 ? '#34d399' : '#f97316'}` }} />
              </div>

              <div className="w-full">
                <div className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {userName.toUpperCase()}
                </div>
                {ennLore ? (
                  <>
                    <div className="text-base font-black leading-tight mb-1" style={{ fontFamily: 'Orbitron, monospace', color: '#7000ff', textShadow: '0 0 22px rgba(112,0,255,0.7)' }}>
                      {ennLore.rpg}
                    </div>
                    <div className="font-mono text-[9px] tracking-[2px] text-white/25 uppercase mb-3">
                      &ldquo;{ennLore.epithet}&rdquo;
                    </div>
                  </>
                ) : (
                  <div className="font-mono text-[11px] text-white/18 tracking-widest mb-3">ARCHETYP NIEZDEFINIOWANY</div>
                )}
                {hollandCode && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[11px]"
                    style={{ background: 'rgba(0,240,255,0.06)', borderColor: 'rgba(0,240,255,0.18)' }}>
                    <span className="font-mono text-[8px] tracking-[2px] text-cyan-300/50">RIASEC</span>
                    <span className="font-mono font-bold text-[13px] text-cyan-300 tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>{hollandCode}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Pop-culture pills */}
            {ennLore && (
              <div className="mb-5">
                <div className="font-mono text-[8px] tracking-[2px] text-white/18 mb-2">🎬 POSTACIE PODOBNE DO CIEBIE</div>
                <div className="flex flex-wrap gap-2">
                  {ennLore.pop.map((p, i) => (
                    <span key={p} className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
                      style={{
                        background: i === 0 ? 'rgba(112,0,255,0.16)' : 'rgba(255,255,255,0.04)',
                        border: i === 0 ? '1px solid rgba(112,0,255,0.4)' : '1px solid rgba(255,255,255,0.07)',
                        color: i === 0 ? '#c4b5fd' : 'rgba(255,255,255,0.42)',
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* XP bar */}
            <div className="mt-auto">
              <div className="flex justify-between mb-1.5">
                <span className="font-mono text-[8px] tracking-[2px] text-white/20">PROFIL XP</span>
                <span className="font-mono text-[9px] text-violet-400" style={{ fontFamily: 'Orbitron, monospace' }}>{completedCount}/6</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(completedCount / 6) * 100}%`, background: 'linear-gradient(90deg,#7000ff,#d946ef)', boxShadow: '0 0 8px rgba(112,0,255,0.7)' }} />
              </div>
            </div>
          </div>

          {/* ── T2: HARDWARE / HEXACO — col-span-1 row-span-2 ── */}
          <div className="card-neural col-span-1 lg:col-span-1 lg:row-span-2 p-6 flex flex-col relative overflow-hidden" style={{ minHeight: 400 }}>
            <div className="absolute -top-8 -left-8 w-36 h-36 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle,rgba(0,240,255,0.08) 0%,transparent 70%)' }} />
            <TileLabel color="text-cyan-400/45">// MATRYCA OSOBOWOŚCI · HEXACO-60</TileLabel>

            {raw.hexaco ? (
              <>
                {/* Radar — fills all available flex space */}
                <div className="flex-1 min-h-0 cs-radar">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="80%" margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
                      <PolarGrid stroke="rgba(0,240,255,0.07)" gridType="polygon" />
                      <PolarAngleAxis dataKey="trait" tick={{ fill: 'rgba(0,240,255,0.55)', fontSize: 11, fontFamily: 'Share Tech Mono, monospace' }} tickLine={false} />
                      <Radar dataKey="value" stroke="#22d3ee" strokeWidth={2} fill="#22d3ee" fillOpacity={0.13}
                        dot={{ fill: '#22d3ee', r: 4, strokeWidth: 0 } as any} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Minimalist 2-col bars — bottom ~30% */}
                <div className="flex-shrink-0 grid grid-cols-2 gap-x-6 gap-y-2 mt-3 pt-3 border-t border-white/[0.04]">
                  {radarData.map((d) => (
                    <div key={d.trait}>
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-mono text-[8px] text-white/30 tracking-wide truncate pr-2">{d.full.toUpperCase()}</span>
                        <span className="font-mono text-[9px] font-bold text-cyan-300 flex-shrink-0" style={{ fontFamily: 'Orbitron, monospace' }}>{d.value}%</span>
                      </div>
                      <div className="h-[2px] rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${d.value}%`, background: 'linear-gradient(90deg,rgba(0,240,255,0.4),#22d3ee)', boxShadow: '0 0 4px rgba(0,240,255,0.3)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <LockedTile icon={<Zap size={22} />} text="Wykonaj test HEXACO-60" href="/test?type=hexaco" color="#00f0ff" />
            )}
          </div>

          {/* ── T3: ENGINE / ENNEAGRAM — col-span-1 row-span-2 ── */}
          <div className="card-neural col-span-1 lg:col-span-1 lg:row-span-2 p-6 flex flex-col items-center" style={{ minHeight: 400 }}>
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle,rgba(217,70,239,0.1) 0%,transparent 70%)' }} />
            <TileLabel color="text-fuchsia-400/45">// ENGINE · ENNEAGRAM</TileLabel>

            {/* Star fills most of the tile */}
            <div className="flex-1 min-h-0 w-full flex items-center justify-center py-1">
              <EnneagramStar activeType={ennTypeNum} color="#d946ef" />
            </div>

            {ennPrimary ? (
              <div className="flex-shrink-0 text-center pb-1 space-y-0.5">
                <div className="text-sm font-bold text-fuchsia-400" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{ennPrimary.name}</div>
                {ennPrimary.core_motivation && (
                  <div className="font-mono text-[7px] text-fuchsia-400/28 tracking-[1.5px]">{ennPrimary.core_motivation.toUpperCase()}</div>
                )}
              </div>
            ) : (
              <LockedTile icon={<span className="text-xl">★</span>} text="Wykonaj test Enneagram" href="/test?type=enneagram" color="#d946ef" />
            )}
          </div>

          {/* ── T4: ARSENAL / TALENTY ── */}
          <div className="card-neural col-span-1 md:col-span-2 lg:col-span-2 p-6 flex flex-col justify-center">
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle,rgba(251,191,36,0.08) 0%,transparent 70%)' }} />
            <TileLabel color="text-amber-400/45">// ⚡ ARSENAL · TOP TALENTY · STRENGTHS</TileLabel>

            {top5.length > 0 ? (
              <div className="flex flex-col gap-3">
                {top5.slice(0, 4).map((t: any, i: number) => {
                  const barW = 96 - i * 10;
                  return (
                    <div key={t.name ?? t.name_en ?? i} className="flex items-center gap-3">
                      <span className="font-mono text-[9px] text-amber-400/40 w-5 text-right" style={{ fontFamily: 'Orbitron, monospace' }}>0{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold mb-1 truncate"
                          style={{ color: i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.62)', fontFamily: 'Space Grotesk, sans-serif' }}>
                          {t.name ?? t.name_en}
                        </div>
                        <div className="h-[3px] rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${barW}%`, background: i === 0 ? 'linear-gradient(90deg,#f97316,#fbbf24)' : 'rgba(251,191,36,0.28)', boxShadow: i === 0 ? '0 0 8px rgba(251,191,36,0.5)' : 'none' }} />
                        </div>
                      </div>
                      <span className="font-mono text-[8px] text-amber-400/35 w-8 text-right">{barW}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <LockedTile icon={<span className="text-xl">⭐</span>} text="Wykonaj test Strengths" href="/test?type=strengths" color="#fbbf24" />
            )}
          </div>

          {/* ── T5: SHADOW / DARK TRIAD ── */}
          <div className="card-neural col-span-1 md:col-span-2 lg:col-span-2 p-6 flex flex-col justify-center !bg-rose-950/20 !border-rose-500/30 shadow-[0_0_30px_-10px_rgba(244,63,94,0.15)]">
            <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle,rgba(239,68,68,0.1) 0%,transparent 70%)' }} />

            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={12} className="text-rose-400/65" />
              <TileLabel color="text-rose-400/45">// ⚠ WYKRYTE RYZYKA · DARK TRIAD</TileLabel>
            </div>

            {raw.darkTriad && dtTop ? (
              <>
                {/* Top risk */}
                <div className="rounded-xl p-4 mb-3" style={{ background: `${dtTop.color}0b`, border: `1px solid ${dtTop.color}22` }}>
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-sm font-bold" style={{ color: dtTop.color, fontFamily: 'Space Grotesk, sans-serif' }}>{dtTop.name}</div>
                    <div className="text-[28px] font-black leading-none" style={{ fontFamily: 'Orbitron, monospace', color: dtTop.color, textShadow: `0 0 16px ${dtTop.color}70` }}>{dtTop.pct}%</div>
                  </div>
                  <div className="h-[3px] rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${dtTop.pct}%`, background: `linear-gradient(90deg,${dtTop.color}70,${dtTop.color})`, boxShadow: `0 0 8px ${dtTop.color}55` }} />
                  </div>
                </div>
                {/* Secondary risks */}
                <div className="flex gap-2">
                  {dtTraits.slice(1).map(t => (
                    <div key={t.k} className="flex-1 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="font-mono text-[8px] text-white/28 tracking-wide">{t.name}</div>
                      <div className="text-lg font-bold mt-0.5" style={{ fontFamily: 'Orbitron, monospace', color: t.color }}>{t.pct}%</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <LockedTile icon={<Shield size={22} />} text="Odblokuj test Dark Triad Premium" href="/test?type=dark_triad" color="#ef4444" />
            )}
          </div>

          {/* ── T6: AI SYNTHESIS — col-span-full ── */}
          <div className="card-neural col-span-full p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(112,0,255,0.14)', border: '1px solid rgba(112,0,255,0.3)' }}>
                <Sparkles size={18} className="text-violet-400" />
              </div>
              <div>
                <div className="font-mono font-bold text-[11px] tracking-[1.5px] text-violet-400" style={{ fontFamily: 'Orbitron, monospace' }}>
                  PSYCHER AI SYNTHESIS
                </div>
                <div className="font-mono text-[8px] tracking-[2px] text-white/20 mt-0.5">NEURAL PROFILE ANALYSIS · AUTO-GENERATED</div>
              </div>
              <div className="flex-1 h-px ml-2" style={{ background: 'linear-gradient(90deg,rgba(112,0,255,0.3),transparent)' }} />
            </div>
            <p className="text-slate-300 leading-relaxed text-lg font-light">
              {buildAiSummary()}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
