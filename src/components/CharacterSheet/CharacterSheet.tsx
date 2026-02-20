import { useEffect, useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabaseClient.js';
import { generateCareerReport } from '../../utils/scoring.js';

/* ─── LORE ───────────────────────────────────────────────────── */
const ENN_LORE: Record<number, { rpg: string; epithet: string; pop: string[]; charges: string[]; drains: string[] }> = {
  1: { rpg: 'Praworządny Paladin',     epithet: 'Architekt Porządku',   pop: ['Hermiona Granger','Ned Stark','Chidi'],           charges: ['Precyzja i perfekcja','Wdrażanie standardów'],              drains: ['Niedokładność innych','Chaos i brak struktury'] },
  2: { rpg: 'Kapłan Wsparcia',         epithet: 'Strażnik Serc',        pop: ['Leslie Knope','Samwise Gamgee','Ted Lasso'],       charges: ['Pomaganie i dawanie','Głębokie relacje'],                   drains: ['Bycie ignorowanym','Praca w izolacji'] },
  3: { rpg: 'Bard Ambicji',            epithet: 'Architekt Sukcesu',    pop: ['Tony Stark','Harvey Specter','Jay Gatsby'],        charges: ['Osiąganie celów','Uznanie i sukces'],                       drains: ['Brak postępów','Anonimowość'] },
  4: { rpg: 'Mroczny Artysta',         epithet: 'Dziecko Cienia',       pop: ['Joker (2019)','Severus Snape','Don Draper'],       charges: ['Autentyczność i ekspresja','Twórczość bez ograniczeń'],     drains: ['Bycie niezrozumianym','Szablonowe zadania'] },
  5: { rpg: 'Mistrz Wiedzy Zakazanej', epithet: 'Architekt Cienia',     pop: ['Sherlock Holmes','Dr House','Walter White'],       charges: ['Głęboka analiza wiedzy','Praca w skupieniu'],              drains: ['Natłok ludzi','Małomówność wymuszona'] },
  6: { rpg: 'Strażnik Bractwa',        epithet: 'Bastion Lojalności',   pop: ['Captain America','Ron Weasley','Frodo'],           charges: ['Praca w zaufanym zespole','Jasne zasady i bezpieczeństwo'],drains: ['Niepewność i ryzyko','Brak wsparcia'] },
  7: { rpg: 'Chaotyczny Awanturnik',   epithet: 'Wirtuoz Możliwości',   pop: ['Jack Sparrow','Tyrion Lannister','The Mandalorian'],charges: ['Nowe przygody i możliwości','Wolność i spontaniczność'],   drains: ['Rutyna i powtarzalność','Ograniczenia i przymus'] },
  8: { rpg: 'Warlord Wojenny',         epithet: 'Inkwizytor Woli',      pop: ['Walter White','Tony Soprano','Daenerys'],          charges: ['Kontrola i decyzyjność','Wyzwania i konfrontacja'],        drains: ['Zależność od innych','Słabość i niezdecydowanie'] },
  9: { rpg: 'Mnich Harmonii',          epithet: 'Spokój w Oku Cyklonu', pop: ['Frodo Baggins','Ted Lasso','The Dude'],            charges: ['Spokój i harmonia','Mediacja konfliktów'],                 drains: ['Konflikt i spory','Presja i pośpiech'] },
};

const HEX_FULL: Record<string, string> = {
  honesty_humility:  'Uczciwość',
  emotionality:      'Emocjonalność',
  extraversion:      'Ekstrawersja',
  agreeableness:     'Ugodowość',
  conscientiousness: 'Sumienność',
  openness:          'Otwartość',
};
const HEX_COLOR: Record<string, string> = {
  honesty_humility:  '#a78bfa',
  emotionality:      '#f472b6',
  extraversion:      '#fb923c',
  agreeableness:     '#34d399',
  conscientiousness: '#60a5fa',
  openness:          '#fbbf24',
};
const DT_LABEL: Record<string, string> = { machiavellianism: 'Makiawelizm', narcissism: 'Narcyzm', psychopathy: 'Psychopatia' };
const DT_COLOR: Record<string, string> = { machiavellianism: '#f97316', narcissism: '#fbbf24', psychopathy: '#ef4444' };

/* ─── NAV CSS (iiy-logo + iiy-nav-tabs verbatim) ─────────────── */
const NAV_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Space+Grotesk:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box}
  .iiy-logo,.iiy-logo *{box-sizing:border-box;margin:0;padding:0}
  .iiy-logo{display:inline-flex;align-items:center;gap:20px;text-decoration:none;user-select:none}
  .iiy-logo .iiy-signet svg{display:block;width:80px;height:80px}
  .iiy-logo .iiy-wordmark{display:flex;flex-direction:column}
  .iiy-logo .iiy-title{font-family:'Orbitron',monospace;font-weight:900;font-size:34px;letter-spacing:12px;line-height:1;text-transform:uppercase;background:linear-gradient(160deg,#ffffff 0%,#a8c8ff 35%,#38b6ff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 16px rgba(56,182,255,.45));animation:iiy-glitch 9s infinite}
  @keyframes iiy-glitch{0%,87%,100%{transform:none;filter:drop-shadow(0 0 16px rgba(56,182,255,.45))}88%{transform:translate(-2px,0) skewX(-2deg);filter:drop-shadow(-3px 0 #7b5ea7) drop-shadow(3px 0 #38b6ff)}89%{transform:translate(2px,0);filter:drop-shadow(3px 0 #7b5ea7) drop-shadow(-3px 0 #38b6ff)}90%{transform:none}}
  .iiy-logo .iiy-divider{height:1px;margin:6px 0 5px;background:linear-gradient(90deg,#38b6ff,#7b5ea7 55%,transparent);opacity:.8}
  .iiy-logo .iiy-sub{font-family:'Share Tech Mono',monospace;font-size:8.5px;letter-spacing:3.5px;color:rgba(100,160,230,.5);text-transform:uppercase}
  .iiy-ring-ticks{animation:iiy-spin 20s linear infinite;transform-origin:48px 48px}
  @keyframes iiy-spin{to{transform:rotate(360deg)}}
  .iiy-eye-l{animation:iiy-eye 3.5s ease-in-out infinite}
  .iiy-eye-r{animation:iiy-eye 3.5s ease-in-out infinite .2s}
  @keyframes iiy-eye{0%,70%,100%{opacity:1}76%{opacity:.05}}
  .iiy-scan{animation:iiy-scan 2.8s ease-in-out infinite}
  @keyframes iiy-scan{0%{transform:translateY(-22px);opacity:0}8%{opacity:.55}92%{opacity:.55}100%{transform:translateY(22px);opacity:0}}
  .iiy-core{animation:iiy-pulse 2.2s ease-in-out infinite;transform-origin:48px 61px}
  @keyframes iiy-pulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.9);opacity:1}}
  .iiy-logo.iiy-sm{gap:14px}
  .iiy-logo.iiy-sm .iiy-signet svg{width:44px;height:44px}
  .iiy-logo.iiy-sm .iiy-title{font-size:19px;letter-spacing:7px}
  .iiy-logo.iiy-sm .iiy-sub{font-size:7px;letter-spacing:2.5px}
  .iiy-logo.iiy-sm .iiy-divider{margin:4px 0 3px}
  .iiy-nav-tabs{display:flex;align-items:center;gap:2px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:4px}
  .iiy-tab-btn{padding:8px 20px;border-radius:9px;border:none;background:transparent;color:rgba(255,255,255,.45);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;letter-spacing:.2px;font-family:'Space Grotesk',-apple-system,sans-serif;white-space:nowrap}
  .iiy-tab-btn:hover{color:rgba(255,255,255,.8);background:rgba(255,255,255,.05)}
  .iiy-tab-btn.active{background:linear-gradient(135deg,rgba(99,102,241,.3),rgba(56,182,255,.2));color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 0 0 1px rgba(99,102,241,.3)}
  .cs-radar .recharts-polar-grid line,.cs-radar .recharts-polar-grid polygon{stroke:rgba(56,182,255,.07)!important}
  .bipolar-slider{position:relative;height:6px;background:#1e293b;border-radius:3px}
  .bipolar-thumb{position:absolute;top:50%;width:13px;height:13px;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 12px currentColor}
  .card-section{background:rgba(15,23,42,.55);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.07);border-radius:20px;overflow:hidden}
  .stat-bar-bg{background:rgba(15,23,42,.8);border-radius:4px;height:10px;overflow:hidden}
  .stat-bar-fill{height:100%;border-radius:4px;transition:width 1.2s ease-out}
`;

/* ─── RAW ROW TYPE ───────────────────────────────────────────── */
interface RawRow { test_type: string; raw_scores: any; percentile_scores: any; report: any; }

/* ─── HELPERS ────────────────────────────────────────────────── */
function Slab({ label, value, color = '#a78bfa' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(15,23,42,.6)', padding:'9px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,.05)', cursor:'default' }}>
      <span style={{ fontSize:10, fontWeight:700, color:'rgba(148,163,184,.7)', textTransform:'uppercase', letterSpacing:'1.5px', fontFamily:'Space Grotesk,sans-serif' }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:700, color:'#fff', fontFamily:'Space Grotesk,sans-serif' }}>{value}</span>
    </div>
  );
}
function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ padding:'3px 8px', borderRadius:6, fontSize:10, fontWeight:700, border:`1px solid ${color}30`, color, background:`${color}10`, fontFamily:'Space Grotesk,sans-serif' }}>
      {children}
    </span>
  );
}
function SecLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:10, fontWeight:700, color:'rgba(148,163,184,.5)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:16, fontFamily:'Space Grotesk,sans-serif', display:'flex', alignItems:'center', gap:8 }}>{children}<span style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(255,255,255,.06),transparent)' }}/></div>;
}
function BipolarSlider({ left, right, label, pct, color }: { left: string; right: string; label: string; pct: number; color: string }) {
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, fontWeight:700, color:'rgba(203,213,225,.7)', marginBottom:6, fontFamily:'Space Grotesk,sans-serif' }}>
        <span>{left}</span>
        <span style={{ color:'#818cf8' }}>{label}</span>
        <span>{right}</span>
      </div>
      <div className="bipolar-slider">
        <div className="bipolar-thumb" style={{ left:`${pct}%`, background:color, color }} />
      </div>
    </div>
  );
}
function StatBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:700, color:'#fff', marginBottom:4, fontFamily:'Space Grotesk,sans-serif' }}>
        <span style={{ color: `${color}` }}>{label}</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="stat-bar-bg"><div className="stat-bar-fill" style={{ width:`${pct}%`, background:color }} /></div>
    </div>
  );
}
function Lock({ text, href, color }: { text: string; href: string; color: string }) {
  return (
    <div style={{ padding:'24px 0', textAlign:'center', opacity:.45 }}>
      <div style={{ fontSize:11, color:'rgba(255,255,255,.3)', marginBottom:12, letterSpacing:'2px', fontFamily:'Space Grotesk,sans-serif' }}>{text}</div>
      <a href={href} style={{ padding:'6px 16px', borderRadius:8, border:`1px solid ${color}30`, color:`${color}88`, background:`${color}09`, fontSize:11, fontWeight:600, textDecoration:'none', fontFamily:'Space Grotesk,sans-serif' }}>Rozpocznij →</a>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
export default function CharacterSheet() {
  const [loading, setLoading]   = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [raw, setRaw] = useState<Record<string, RawRow | null>>({
    HEXACO: null, ENNEAGRAM: null, STRENGTHS: null, CAREER: null, DARK_TRIAD: null, VALUES: null,
  });

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = '/auth'; return; }
      setAuthUser(u);

      const { data: rows, error } = await supabase
        .from('user_psychometrics')
        .select('test_type, raw_scores, percentile_scores, report')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });

      if (error) console.error('[CS] supabase error:', error);
      console.log('[CS] raw rows:', rows);

      if (rows?.length) {
        const m: Record<string, RawRow | null> = { HEXACO: null, ENNEAGRAM: null, STRENGTHS: null, CAREER: null, DARK_TRIAD: null, VALUES: null };
        for (const r of rows) if (m[r.test_type] === null) m[r.test_type] = r;
        setRaw(m);
      }
      setLoading(false);
    })();
  }, []);

  /* ── derived values ── */
  const userName  = authUser?.user_metadata?.full_name ?? authUser?.email?.split('@')[0] ?? 'Użytkownik';
  const avatarUrl = authUser?.user_metadata?.avatar_url ?? '';
  const initials  = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const done = Object.values(raw).filter(Boolean).length;

  /* HEXACO */
  const hexPct: Record<string, number> = raw.HEXACO?.percentile_scores ?? {};
  const hexDims = ['honesty_humility','emotionality','extraversion','agreeableness','conscientiousness','openness'] as const;
  const hexBars = hexDims.map(k => ({ k, label: HEX_FULL[k], pct: Math.round(hexPct[k] ?? 0), color: HEX_COLOR[k] }));
  const hexRadar = hexBars.map(h => ({ trait: h.label.slice(0,6), full: h.label, value: h.pct }));
  const hexTop3  = [...hexBars].sort((a,b) => b.pct - a.pct).slice(0,3);

  /* ENNEAGRAM */
  const ennR  = raw.ENNEAGRAM?.report;
  const ennP  = ennR?.primary_type;
  const ennN: number | null = ennP?.id ?? null;
  const ennL  = ennN ? ENN_LORE[ennN] : null;

  /* STRENGTHS */
  const top5: any[] = raw.STRENGTHS?.raw_scores?.top_5 ?? [];

  /* DARK TRIAD */
  const dtDims = raw.DARK_TRIAD?.raw_scores?.dimensions ?? {};
  const dtTraits = ['machiavellianism','narcissism','psychopathy'].map(k => {
    const v = dtDims[k]?.raw_score ?? 0;
    const pct = v <= 5 ? Math.round(((v-1)/4)*100) : Math.round(v);
    return { k, label: DT_LABEL[k], pct, color: DT_COLOR[k] };
  }).sort((a,b) => b.pct - a.pct);

  /* CAREER */
  const careerRep = raw.CAREER ? (raw.CAREER.report ?? generateCareerReport(raw.CAREER.raw_scores)) : null;
  const holland   = careerRep?.holland_code ?? '';
  const topJobs: any[] = careerRep?.top_careers ?? careerRep?.career_clusters ?? [];

  /* VALUES */
  const topVals: any[] = (raw.VALUES?.raw_scores?.top_values ?? raw.VALUES?.report?.top_values ?? []).slice(0,5);

  /* BIPOLAR SLIDERS (derived from HEXACO) */
  const H = hexPct;
  const sliders = [
    { left:'Ostrożny',   right:'Ryzykant',      label:'Tolerancja Ryzyka',  pct: Math.round(((H.openness??50)+(100-(H.conscientiousness??50)))/2), color:'#fbbf24' },
    { left:'Ufny',       right:'Sceptyczny',    label:'Zaufanie',           pct: Math.round(H.agreeableness??50), color:'#34d399' },
    { left:'Rozważny',   right:'Szybki',        label:'Tempo Decyzji',      pct: Math.round(100-(H.conscientiousness??50)), color:'#f472b6' },
    { left:'Powściągliwy',right:'Ekspresyjny',  label:'Ekspresja',          pct: Math.round(H.extraversion??50), color:'#fb923c' },
    { left:'Niezależny', right:'Kooperatywny',  label:'Styl Pracy',         pct: Math.round(H.agreeableness??50), color:'#60a5fa' },
    { left:'Wspierający',right:'Dominujący',    label:'Wpływ',              pct: Math.round(Math.max(0,100-(H.agreeableness??50)+((H.extraversion??50)-50)/2)), color:'#ef4444' },
  ];

  /* ─── LOADING ──────────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#020617', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{NAV_CSS}</style>
      <style>{`@keyframes spin_{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40,height:40,borderRadius:'50%',border:'3px solid rgba(99,102,241,.2)',borderTopColor:'#6366f1',animation:'spin_ .8s linear infinite',margin:'0 auto 16px' }}/>
        <div style={{ fontFamily:'Share Tech Mono,monospace', color:'rgba(148,163,184,.4)', fontSize:12, letterSpacing:'3px' }}>ŁADOWANIE PROFILU...</div>
      </div>
    </div>
  );

  /* ─── RENDER ───────────────────────────────────────────── */
  const bg = { background:'#020617', backgroundImage:'radial-gradient(circle at 50% 0%,rgba(79,70,229,.12) 0%,transparent 50%)', fontFamily:'Inter,system-ui,sans-serif', minHeight:'100vh', color:'#e2e8f0' };

  return (
    <div style={bg}>
      <style>{NAV_CSS}</style>

      {/* ── NAV ── */}
      <nav style={{ background:'rgba(2,6,23,.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,.05)', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:72 }}>
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
                    <clipPath id="iiy-clip-cs"><polygon points="48,5 87,27 87,69 48,91 9,69 9,27"/></clipPath>
                  </defs>
                  <polygon points="48,5 87,27 87,69 48,91 9,69 9,27" fill="#11143a"/>
                  <g className="iiy-ring-ticks" filter="url(#iiy-glow-cs)">
                    <line x1="48" y1="5" x2="48" y2="12" stroke="#38b6ff" strokeWidth="1.8"/>
                    <line x1="87" y1="27" x2="81" y2="30" stroke="#38b6ff" strokeWidth="1.8"/>
                    <line x1="87" y1="69" x2="81" y2="66" stroke="#38b6ff" strokeWidth="1.8"/>
                    <line x1="48" y1="91" x2="48" y2="84" stroke="#38b6ff" strokeWidth="1.8"/>
                    <line x1="9" y1="69" x2="15" y2="66" stroke="#38b6ff" strokeWidth="1.8"/>
                    <line x1="9" y1="27" x2="15" y2="30" stroke="#38b6ff" strokeWidth="1.8"/>
                    <line x1="68" y1="8" x2="66" y2="12" stroke="#7b5ea7" strokeWidth="1" opacity="0.6"/>
                    <line x1="28" y1="8" x2="30" y2="12" stroke="#7b5ea7" strokeWidth="1" opacity="0.6"/>
                    <line x1="90" y1="48" x2="84" y2="48" stroke="#7b5ea7" strokeWidth="1" opacity="0.6"/>
                    <line x1="6" y1="48" x2="12" y2="48" stroke="#7b5ea7" strokeWidth="1" opacity="0.6"/>
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
            <div className="iiy-nav-tabs">
              <button className="iiy-tab-btn" onClick={() => { window.location.href='/user-profile-tests.html'; }}>🧪 Testy</button>
              <button className="iiy-tab-btn active">🃏 Karta Postaci</button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ display:'flex', gap:5 }}>
                {['HEXACO','ENNEAGRAM','STRENGTHS','CAREER','DARK_TRIAD','VALUES'].map(k => (
                  <div key={k} style={{ width:8,height:8,borderRadius:'50%', background:raw[k]?'#6366f1':'rgba(255,255,255,.1)', boxShadow:raw[k]?'0 0 6px #6366f1':'none', transition:'all .3s' }}/>
                ))}
              </div>
              <button onClick={async()=>{await supabase.auth.signOut();window.location.href='/';}} style={{ padding:'7px 16px', borderRadius:8, border:'1px solid rgba(255,255,255,.1)', background:'rgba(255,255,255,.04)', color:'#e2e8f0', fontSize:13, cursor:'pointer', fontFamily:'Space Grotesk,sans-serif' }}>Wyloguj</button>
              <a href="/settings" style={{ padding:'7px 16px', borderRadius:8, border:'1px solid rgba(255,255,255,.1)', background:'rgba(255,255,255,.04)', color:'#e2e8f0', fontSize:13, textDecoration:'none', fontFamily:'Space Grotesk,sans-serif' }}>⚙️</a>
            </div>
          </div>
        </div>
      </nav>

      {/* ── PAGE ── */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'32px 24px' }}>

        {/* XP Meter */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32 }}>
          <div style={{ flex:1, height:4, background:'rgba(255,255,255,.05)', borderRadius:999, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${(done/6)*100}%`, background:'linear-gradient(90deg,#6366f1,#a855f7)', borderRadius:999, transition:'width 1s ease' }}/>
          </div>
          <span style={{ fontSize:11, color:'rgba(148,163,184,.5)', fontFamily:'Share Tech Mono,monospace', letterSpacing:'2px' }}>{done}/6 TESTÓW</span>
        </div>

        {/* ══════════════════════════════════════
            GŁÓWNA KARTA RPG (3 kolumny)
        ══════════════════════════════════════ */}
        <div className="card-section" style={{ marginBottom:24, boxShadow:'0 0 60px rgba(79,70,229,.12)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:0 }}>

            {/* ─ KOLUMNA 1: Tożsamość i klasa ─ */}
            <div style={{ background:'rgba(15,23,42,.7)', padding:28, borderRight:'1px solid rgba(255,255,255,.05)', display:'flex', flexDirection:'column', gap:0 }}>

              {/* Avatar + Imię */}
              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
                <div style={{ width:80,height:80, borderRadius:'50%', padding:2, background:'linear-gradient(135deg,#6366f1,#a855f7,#ec4899)', flexShrink:0, position:'relative' }}>
                  <div style={{ width:'100%',height:'100%',borderRadius:'50%',overflow:'hidden',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt="avatar" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                      : <span style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:24, color:'#a5b4fc' }}>{initials}</span>
                    }
                  </div>
                  <div style={{ position:'absolute',bottom:2,right:2,width:14,height:14,borderRadius:'50%',background:done>=4?'#34d399':'#f97316',border:'2px solid #0f172a',boxShadow:`0 0 8px ${done>=4?'#34d399':'#f97316'}` }}/>
                </div>
                <div>
                  <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:18, color:'#fff', marginBottom:4 }}>{userName}</div>
                  {ennL
                    ? <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:11, color:'#818cf8', textTransform:'uppercase', letterSpacing:'1px', marginBottom:6 }}>{ennL.rpg}</div>
                    : <div style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:'Share Tech Mono,monospace', letterSpacing:'2px' }}>ARCHETYP NIEZDEFINIOWANY</div>
                  }
                  <div style={{ display:'inline-block', background:'rgba(30,41,59,.8)', color:'rgba(203,213,225,.7)', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:6, border:'1px solid rgba(255,255,255,.08)', fontFamily:'Space Grotesk,sans-serif' }}>Level {done}</div>
                </div>
              </div>

              {/* Cechy dominujące */}
              {hexTop3.length > 0 && (
                <div style={{ marginBottom:20 }}>
                  <SecLabel>Cechy Dominujące</SecLabel>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {hexTop3.map(h => <Tag key={h.k} color={h.color}>{h.label}</Tag>)}
                    {ennP?.name && <Tag color="#818cf8">{ennP.name.split(' ')[0]}</Tag>}
                  </div>
                </div>
              )}

              {/* Enneagram + Holland slab badges */}
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                {ennN && <Slab label="Enneagram" value={`Typ ${ennN}${ennR?.wing ? ` w${ennR.wing}` : ''} · ${ennP?.name ?? ''}`}/>}
                {holland && <Slab label="RIASEC (Holland)" value={holland}/>}
                {raw.HEXACO && hexTop3[0] && <Slab label="Dominanta HEXACO" value={`${hexTop3[0].label} (${hexTop3[0].pct}%)`}/>}
              </div>

              {/* Archetyp operacyjny */}
              {ennL && (
                <div style={{ background:'rgba(79,70,229,.1)', border:'1px solid rgba(99,102,241,.3)', borderRadius:12, padding:16, marginBottom:20 }}>
                  <div style={{ fontSize:9, fontWeight:700, color:'#a5b4fc', textTransform:'uppercase', letterSpacing:'2px', marginBottom:8, fontFamily:'Space Grotesk,sans-serif' }}>Archetyp Operacyjny</div>
                  <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:15, color:'#fff', marginBottom:8 }}>✦ {ennL.rpg}</div>
                  <div style={{ fontSize:10, color:'rgba(148,163,184,.6)', lineHeight:1.7, fontFamily:'Inter,sans-serif' }}>
                    &ldquo;{ennL.epithet}&rdquo; — Twój profil psychometryczny łączy cechy {hexTop3.map(h=>h.label).join(', ')}.
                  </div>
                </div>
              )}

              {/* Wartości */}
              {topVals.length > 0 && (
                <div style={{ marginTop:'auto' }}>
                  <SecLabel>Kompas Wartości</SecLabel>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {topVals.map((v:any) => <Tag key={v.name??v.value_name??v} color="#fbbf24">{v.name??v.value_name??String(v)}</Tag>)}
                  </div>
                </div>
              )}
            </div>

            {/* ─ KOLUMNA 2: Statystyki i spektrum ─ */}
            <div style={{ padding:28, borderRight:'1px solid rgba(255,255,255,.05)', background:'rgba(15,23,42,.5)' }}>
              <SecLabel>Statystyki HEXACO</SecLabel>

              {raw.HEXACO ? (
                <>
                  {/* Radar mini */}
                  <div className="cs-radar" style={{ height:200, marginBottom:20 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={hexRadar} outerRadius="75%" margin={{ top:4,right:10,bottom:4,left:10 }}>
                        <PolarGrid stroke="rgba(56,182,255,.07)" gridType="polygon"/>
                        <PolarAngleAxis dataKey="full" tick={{ fill:'rgba(148,163,184,.55)', fontSize:10, fontFamily:'Space Grotesk,sans-serif' }} tickLine={false}/>
                        <Radar dataKey="value" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.15} dot={{ fill:'#6366f1', r:3, strokeWidth:0 } as any}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bars */}
                  {hexBars.map(h => <StatBar key={h.k} label={h.label} pct={h.pct} color={h.color}/>)}
                </>
              ) : (
                <Lock text="WYKONAJ TEST HEXACO-60" href="/test?type=hexaco" color="#6366f1"/>
              )}

              {/* Spektrum osobowości */}
              {raw.HEXACO && (
                <div style={{ marginTop:24, paddingTop:24, borderTop:'1px solid rgba(99,102,241,.15)' }}>
                  <SecLabel>Spektrum Osobowości</SecLabel>
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {sliders.map(s => <BipolarSlider key={s.label} left={s.left} right={s.right} label={s.label} pct={s.pct} color={s.color}/>)}
                  </div>
                </div>
              )}
            </div>

            {/* ─ KOLUMNA 3: Talenty, energia, pop culture ─ */}
            <div style={{ padding:28, background:'rgba(15,23,42,.3)', display:'flex', flexDirection:'column', gap:24 }}>

              {/* Talenty */}
              <div>
                <SecLabel>Talenty (Strengths)</SecLabel>
                {top5.length > 0 ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {top5.slice(0,5).map((t:any, i:number) => (
                      <div key={t.name??t.name_en??i} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                        <div style={{ width:32,height:32,borderRadius:8,background:'rgba(30,41,59,.9)',border:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:['#fbbf24','#a78bfa','#34d399','#60a5fa','#f472b6'][i%5],fontSize:14 }}>✦</div>
                        <div>
                          <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:13, color:'#fff', marginBottom:2 }}>{t.name ?? t.name_en}</div>
                          {t.description && <div style={{ fontSize:10, color:'rgba(148,163,184,.5)', lineHeight:1.5 }}>{String(t.description).slice(0,70)}{t.description?.length>70?'…':''}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <Lock text="WYKONAJ TEST STRENGTHS" href="/test?type=strengths" color="#fbbf24"/>}
              </div>

              {/* Energia – zasilacze / dreny */}
              {ennL && (
                <div>
                  <SecLabel>Zarządzanie Energią</SecLabel>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div style={{ background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.18)', borderRadius:10, padding:12 }}>
                      <div style={{ fontSize:9, fontWeight:700, color:'#34d399', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:8, fontFamily:'Space Grotesk,sans-serif' }}>⚡ Co Cię Ładuje</div>
                      {ennL.charges.map(c => <div key={c} style={{ fontSize:10, color:'rgba(203,213,225,.7)', marginBottom:4, paddingLeft:12, position:'relative', fontFamily:'Inter,sans-serif' }}><span style={{ position:'absolute',left:0,color:'#34d399' }}>·</span>{c}</div>)}
                    </div>
                    <div style={{ background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.18)', borderRadius:10, padding:12 }}>
                      <div style={{ fontSize:9, fontWeight:700, color:'#f87171', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:8, fontFamily:'Space Grotesk,sans-serif' }}>⬇ Co Cię Drenuje</div>
                      {ennL.drains.map(d => <div key={d} style={{ fontSize:10, color:'rgba(203,213,225,.7)', marginBottom:4, paddingLeft:12, position:'relative', fontFamily:'Inter,sans-serif' }}><span style={{ position:'absolute',left:0,color:'#f87171' }}>·</span>{d}</div>)}
                    </div>
                  </div>
                </div>
              )}

              {/* Pop culture */}
              {ennL && (
                <div style={{ paddingTop:16, borderTop:'1px solid rgba(255,255,255,.05)' }}>
                  <SecLabel>Kompatybilne Jednostki</SecLabel>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {ennL.pop.map((p,i) => (
                      <div key={p} style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:36,height:36,borderRadius:'50%',background:`linear-gradient(135deg,${['#6366f1','#f472b6','#34d399'][i%3]}22,rgba(15,23,42,.8))`,border:`1px solid ${['#6366f1','#f472b6','#34d399'][i%3]}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0 }}>✦</div>
                        <div>
                          <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:12, color:i===0?'#a5b4fc':'rgba(203,213,225,.7)' }}>{p}</div>
                          <div style={{ fontSize:10, color:'rgba(100,116,139,.7)', fontFamily:'Inter,sans-serif' }}>Neural Match {[95,82,71][i]??60}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── ROW 2: Kariera + Dark Triad ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:'1px solid rgba(255,255,255,.05)' }}>

            {/* KARIERA */}
            <div style={{ padding:28, background:'rgba(79,70,229,.06)', borderRight:'1px solid rgba(255,255,255,.05)' }}>
              <SecLabel>Optymalne Ścieżki Kariery</SecLabel>
              {careerRep ? (
                <>
                  {holland && (
                    <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
                      {holland.split('').map((c:string) => (
                        <span key={c} style={{ padding:'4px 14px', borderRadius:8, background:'rgba(99,102,241,.12)', border:'1px solid rgba(99,102,241,.25)', color:'#a5b4fc', fontSize:13, fontWeight:700, fontFamily:'Share Tech Mono,monospace' }}>{c}</span>
                      ))}
                      <span style={{ fontSize:11, color:'rgba(148,163,184,.5)', alignSelf:'center', fontFamily:'Space Grotesk,sans-serif' }}>kod Holland</span>
                    </div>
                  )}
                  {topJobs.length > 0 ? (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      {topJobs.slice(0,4).map((j:any,i:number) => (
                        <div key={j.title??j.name??i} style={{ padding:12, background:'rgba(30,41,59,.8)', borderRadius:10, border:'1px solid rgba(255,255,255,.07)', transition:'border-color .2s' }}>
                          <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:13, color:'#fff', marginBottom:4 }}>{j.title??j.name}</div>
                          {j.description && <div style={{ fontSize:10, color:'rgba(148,163,184,.5)' }}>{String(j.description).slice(0,50)}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize:11, color:'rgba(148,163,184,.4)', fontFamily:'Space Grotesk,sans-serif' }}>Brak danych o zawodach. Kod Holland: {holland || '—'}</div>
                  )}
                </>
              ) : <Lock text="WYKONAJ TEST KARIERY (O*NET)" href="/test?type=career" color="#6366f1"/>}
            </div>

            {/* DARK TRIAD */}
            <div style={{ padding:28, background:'rgba(239,68,68,.04)', position:'relative' }}>
              <div style={{ position:'absolute', top:16, right:16, padding:'3px 10px', borderRadius:99, background:'rgba(245,158,11,.12)', border:'1px solid rgba(245,158,11,.35)', fontSize:10, fontWeight:700, color:'#fcd34d', fontFamily:'Space Grotesk,sans-serif' }}>PRO Insight</div>
              <SecLabel>Cień · Ryzyka Dark Triad</SecLabel>
              {raw.DARK_TRIAD ? (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {dtTraits.map(t => (
                    <div key={t.k}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                        <span style={{ fontSize:12, color:'rgba(203,213,225,.8)', fontFamily:'Space Grotesk,sans-serif', fontWeight:600 }}>{t.label}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:t.color, fontFamily:'Share Tech Mono,monospace' }}>{t.pct}%</span>
                      </div>
                      <div style={{ background:'rgba(15,23,42,.8)', borderRadius:4, height:8, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${t.pct}%`, background:`linear-gradient(90deg,${t.color}55,${t.color})`, borderRadius:4, transition:'width 1s ease' }}/>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <Lock text="ODBLOKUJ TEST DARK TRIAD" href="/test?type=dark_triad" color="#ef4444"/>}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            SEKCJE ROZSZERZONE
        ══════════════════════════════════════ */}

        {/* Talenty (rozszerzone) */}
        {top5.length > 0 && (
          <div className="card-section" style={{ marginBottom:24, padding:32 }}>
            <div style={{ fontSize:20, fontWeight:700, color:'#fff', fontFamily:'Space Grotesk,sans-serif', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ color:'#fbbf24' }}>⚡</span> Zdolności (Strengths)
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {top5.map((t:any, i:number) => (
                <div key={t.name??t.name_en??i} style={{ padding:16, background:'rgba(16,185,129,.08)', borderRadius:12, border:'1px solid rgba(16,185,129,.2)' }}>
                  <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:14, color:'#6ee7b7', marginBottom:6 }}>{t.name ?? t.name_en}</div>
                  <div style={{ fontSize:11, color:'rgba(203,213,225,.65)', lineHeight:1.7, fontFamily:'Inter,sans-serif' }}>{t.description ?? t.desc ?? `Talent #${i+1} — pełny opis dostępny w raporcie.`}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enneagram (rozszerzony) */}
        {ennN && ennL && (
          <div className="card-section" style={{ marginBottom:24, padding:32 }}>
            <div style={{ fontSize:20, fontWeight:700, color:'#fff', fontFamily:'Space Grotesk,sans-serif', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ color:'#a78bfa' }}>★</span> Archetyp Enneagram
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ padding:16, background:'rgba(99,102,241,.1)', borderRadius:12, border:'1px solid rgba(99,102,241,.25)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:'#a5b4fc', textTransform:'uppercase', letterSpacing:'2px', fontFamily:'Space Grotesk,sans-serif' }}>Enneagram</span>
                  <span style={{ fontSize:32, fontWeight:900, color:'#818cf8', fontFamily:'Space Grotesk,sans-serif' }}>{ennN}</span>
                </div>
                <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:14, color:'#fff', marginBottom:6 }}>{ennP?.name ?? ''}</div>
                <div style={{ fontSize:11, color:'rgba(203,213,225,.6)', lineHeight:1.7, fontFamily:'Inter,sans-serif' }}>{ennP?.description ?? ennP?.core_motivation ?? 'Kompletny opis dostępny po raportowaniu.'}</div>
              </div>
              <div style={{ padding:16, background:'rgba(168,85,247,.07)', borderRadius:12, border:'1px solid rgba(168,85,247,.2)' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#c4b5fd', textTransform:'uppercase', letterSpacing:'2px', marginBottom:8, fontFamily:'Space Grotesk,sans-serif' }}>Klasa RPG</div>
                <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:15, color:'#fff', marginBottom:8 }}>✦ {ennL.rpg}</div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(196,181,253,.5)', fontStyle:'italic', marginBottom:10, fontFamily:'Space Grotesk,sans-serif' }}>&ldquo;{ennL.epithet}&rdquo;</div>
                <div style={{ fontSize:9, fontWeight:700, color:'rgba(148,163,184,.4)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:6, fontFamily:'Space Grotesk,sans-serif' }}>Postacie podobne:</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {ennL.pop.map(p => <Tag key={p} color="#a78bfa">{p}</Tag>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wartości (rozszerzone) */}
        {topVals.length > 0 && (
          <div className="card-section" style={{ marginBottom:24, padding:32 }}>
            <div style={{ fontSize:20, fontWeight:700, color:'#fff', fontFamily:'Space Grotesk,sans-serif', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ color:'#fbbf24' }}>🧭</span> Kompas Wartości (Schwartz PVQ)
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {topVals.map((v:any) => (
                <div key={v.name??v.value_name??v} style={{ padding:'10px 18px', borderRadius:10, background:'rgba(245,158,11,.08)', border:'1px solid rgba(245,158,11,.2)', fontFamily:'Space Grotesk,sans-serif', fontWeight:600, fontSize:13, color:'#fcd34d' }}>
                  {v.name ?? v.value_name ?? String(v)}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}