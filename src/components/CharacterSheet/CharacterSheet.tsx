import { useEffect, useState } from 'react';
import {
  ArrowLeft, Lock, Zap, Brain, Star, Briefcase, Flame, Heart,
  Sparkles, ChevronRight, Shield, Eye, Hexagon,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.js';
import { generateCareerReport, generateValuesReport } from '../../utils/scoring.js';

// ─── TYPES ──────────────────────────────────────────────────────────────────────

interface RawRow { test_type: string; raw_scores: any; percentile_scores: any; report: any; }

interface ParsedData {
  hexaco:    RawRow | null;
  enneagram: RawRow | null;
  strengths: RawRow | null;
  career:    RawRow | null;
  darkTriad: RawRow | null;
  values:    RawRow | null;
}

// ─── DERIVATION TABLES ──────────────────────────────────────────────────────────

const HEXACO_LABELS: Record<string, string> = {
  honesty_humility:  'Uczciwo\u015b\u0107',
  emotionality:      'Emocjonalno\u015b\u0107',
  extraversion:      'Ekstrawersja',
  agreeableness:     'Ugodowo\u015b\u0107',
  conscientiousness: 'Sumienno\u015b\u0107',
  openness:          'Otwarto\u015b\u0107',
};

const ENNEAGRAM_LORE: Record<number, { rpg: string; epithet: string; pop: string[] }> = {
  1: { rpg: 'Praworzadny Dobry Paladin',    epithet: 'Architekt Porzadku',    pop: ['Hermiona Granger', 'Ned Stark', 'Chidi (The Good Place)'] },
  2: { rpg: 'Kaplan Wsparcia',              epithet: 'Straznik Serc',         pop: ['Leslie Knope', 'Samwise Gamgee', 'Ted Lasso'] },
  3: { rpg: 'Bard Ambicji',                 epithet: 'Architekt Sukcesu',     pop: ['Tony Stark', 'Harvey Specter', 'Jay Gatsby'] },
  4: { rpg: 'Mroczny Artysta',              epithet: 'Dziecko Cienia',        pop: ['Joker (2019)', 'Severus Snape', 'Don Draper'] },
  5: { rpg: 'Mistrz Wiedzy Zakazanej',      epithet: 'Architekt Cienia',      pop: ['Sherlock Holmes', 'Dr. House', 'Walter White'] },
  6: { rpg: 'Straznik Bractwa',             epithet: 'Bastion Lojalnosci',    pop: ['Captain America', 'Ron Weasley', 'Samwise Gamgee'] },
  7: { rpg: 'Chaotyczny Dobry Awanturnik',  epithet: 'Wirtuoz Mozliwosci',    pop: ['Jack Sparrow', 'Tyrion Lannister', 'The Mandalorian'] },
  8: { rpg: 'Wojenny Warlord',              epithet: 'Inkwizytor Woli',       pop: ['Walter White', 'Tony Soprano', 'Daenerys Targaryen'] },
  9: { rpg: 'Mnich Harmonii',               epithet: 'Spokoj w Oku Cyklonu',  pop: ['Frodo Baggins', 'Ted Lasso', 'The Dude (Big Lebowski)'] },
};

const DT_NAMES: Record<string, string> = {
  machiavellianism: 'Makiawelizm',
  narcissism:       'Narcyzm',
  psychopathy:      'Psychopatia',
};

// ─── COLORS ─────────────────────────────────────────────────────────────────────

const C = {
  violet:   '#7000ff', violetDim:  'rgba(112,0,255,0.13)',
  fuchsia:  '#d946ef', fuchsiaDim: 'rgba(217,70,239,0.13)',
  cyan:     '#00f0ff', cyanDim:    'rgba(0,240,255,0.10)',
  amber:    '#fbbf24', amberDim:   'rgba(251,191,36,0.12)',
  emerald:  '#34d399', emeraldDim: 'rgba(52,211,153,0.12)',
  rose:     '#fb7185', roseDim:    'rgba(251,113,133,0.12)',
  teal:     '#14b8a6', tealDim:    'rgba(20,184,166,0.12)',
};

// ─── CSS ─────────────────────────────────────────────────────────────────────────

const CSS = `
  .cs-root { min-height:100vh; background:#030014;
    background-image: radial-gradient(circle at 50% 0%, #2a1b5e 0%, transparent 55%),
      radial-gradient(circle at 100% 0%, #1a0b38 0%, transparent 40%);
    color:#e2e8f0; font-family:'Inter',system-ui,sans-serif; -webkit-font-smoothing:antialiased; }
  .cs-nav { position:sticky; top:0; z-index:100; background:rgba(3,0,20,.88);
    backdrop-filter:blur(18px); border-bottom:1px solid rgba(112,0,255,.15); }
  .cs-nav-inner { max-width:1140px; margin:0 auto; padding:13px 28px;
    display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .cs-nav-btn { display:inline-flex; align-items:center; gap:7px; padding:7px 16px;
    border-radius:10px; border:1px solid rgba(255,255,255,.09); background:rgba(255,255,255,.04);
    color:#94a3b8; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s;
    text-decoration:none; }
  .cs-nav-btn:hover { border-color:rgba(112,0,255,.45); color:#fff; background:rgba(112,0,255,.1); }
  .cs-nav-title { font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:700;
    color:#5b4b8a; letter-spacing:.8px; text-transform:uppercase; }
  .cs-nav-ai-btn { display:inline-flex; align-items:center; gap:7px; padding:7px 16px;
    border-radius:10px; border:1px solid rgba(112,0,255,.4); background:rgba(112,0,255,.12);
    color:#a78bfa; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; }
  .cs-nav-ai-btn:hover:not([disabled]) { background:rgba(112,0,255,.22); border-color:rgba(112,0,255,.7); color:#fff; }
  .cs-nav-ai-btn[disabled] { opacity:.3; cursor:not-allowed; }
  .cs-body { max-width:1140px; margin:0 auto; padding:26px 28px 80px;
    display:grid; grid-template-columns:272px 1fr; gap:20px; align-items:start; }
  @media(max-width:860px){ .cs-body{grid-template-columns:1fr;padding:18px 14px 60px;}
    .cs-nav-inner{padding:12px 16px;} }
  .cs-glass { background:linear-gradient(180deg,rgba(18,9,38,.82) 0%,rgba(8,4,18,.52) 100%);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    border:1px solid rgba(255,255,255,.07); border-radius:16px; position:relative; overflow:hidden; }
  .cs-glass::before { content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(112,0,255,.05) 0%,transparent 60%); pointer-events:none; }
  .cs-identity { padding:22px; }
  .cs-avatar-wrap { display:flex; flex-direction:column; align-items:center;
    text-align:center; margin-bottom:16px; }
  .cs-avatar { width:72px; height:72px; border-radius:50%; border:2px solid rgba(112,0,255,.5);
    box-shadow:0 0 20px rgba(112,0,255,.28); background:linear-gradient(135deg,#2a1b5e,#1a0b38);
    display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif;
    font-size:24px; font-weight:700; color:#a78bfa; margin-bottom:10px; overflow:hidden; flex-shrink:0; }
  .cs-avatar img { width:100%; height:100%; object-fit:cover; }
  .cs-level-badge { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:700;
    letter-spacing:.7px; color:#7000ff; background:rgba(112,0,255,.12); border:1px solid rgba(112,0,255,.3);
    padding:3px 10px; border-radius:999px; margin-bottom:6px; text-transform:uppercase; }
  .cs-name { font-family:'Space Grotesk',sans-serif; font-size:18px; font-weight:700; color:#f8fafc; margin-bottom:3px; }
  .cs-epithet { font-size:12px; color:#a78bfa; font-weight:500; font-style:italic; margin-bottom:8px; }
  .cs-rpg-class { display:inline-block; font-size:11px; font-weight:600; color:#00f0ff;
    background:rgba(0,240,255,.08); border:1px solid rgba(0,240,255,.2); padding:4px 11px;
    border-radius:8px; letter-spacing:.2px; }
  .cs-progress-wrap { margin:14px 0 16px; }
  .cs-progress-label { display:flex; justify-content:space-between; font-size:11px; color:#4a4070; margin-bottom:5px; }
  .cs-progress-track { height:4px; border-radius:999px; background:rgba(255,255,255,.07); overflow:hidden; }
  .cs-progress-fill { height:100%; border-radius:999px; background:linear-gradient(90deg,#7000ff,#00f0ff); transition:width .8s ease; }
  .cs-stat-row { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 0; border-bottom:1px solid rgba(255,255,255,.04); }
  .cs-stat-row:last-child { border-bottom:none; }
  .cs-stat-label { font-size:10px; font-weight:700; letter-spacing:.8px; color:#4a4070; text-transform:uppercase; display:flex; align-items:center; gap:4px; flex-shrink:0; }
  .cs-stat-value { font-size:11px; font-weight:600; color:#c4b5fd; text-align:right; }
  .cs-section-label { font-size:10px; font-weight:700; letter-spacing:1.1px; color:#4a4070; text-transform:uppercase; margin-bottom:7px; }
  .cs-pop-chips { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:14px; }
  .cs-pop-chip { font-size:11px; font-weight:500; color:#c4b5fd; background:rgba(112,0,255,.1); border:1px solid rgba(112,0,255,.2); padding:3px 9px; border-radius:7px; }
  .cs-main-wrap { display:flex; flex-direction:column; gap:14px; }
  .cs-ai-banner { border-radius:14px; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:14px; background:linear-gradient(135deg,rgba(112,0,255,.15),rgba(0,240,255,.07)); border:1px solid rgba(112,0,255,.22); }
  .cs-ai-banner.locked { background:rgba(255,255,255,.025); border-color:rgba(255,255,255,.06); }
  .cs-ai-banner-text h3 { font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:700; color:#f8fafc; margin-bottom:3px; }
  .cs-ai-banner-text p { font-size:11px; color:#64748b; }
  .cs-ai-cta { flex-shrink:0; padding:7px 16px; border-radius:10px; font-size:12px; font-weight:700; border:1px solid rgba(112,0,255,.4); background:rgba(112,0,255,.16); color:#c4b5fd; cursor:pointer; display:inline-flex; align-items:center; gap:5px; white-space:nowrap; transition:all .2s; }
  .cs-ai-cta:hover:not([disabled]) { background:rgba(112,0,255,.3); color:#fff; }
  .cs-ai-cta[disabled] { opacity:.35; cursor:not-allowed; }
  .cs-mod-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:13px; }
  @media(max-width:980px){ .cs-mod-grid{grid-template-columns:repeat(2,1fr);} }
  @media(max-width:540px){ .cs-mod-grid{grid-template-columns:1fr;} }
  .cs-mod { border-radius:13px; padding:17px; min-height:152px; position:relative; overflow:hidden; border:1px solid rgba(255,255,255,.06); background:linear-gradient(180deg,rgba(18,9,38,.82) 0%,rgba(8,4,18,.52) 100%); transition:border-color .25s; }
  .cs-mod-glow { position:absolute; top:-50px; right:-50px; width:130px; height:130px; border-radius:50%; filter:blur(28px); opacity:.05; pointer-events:none; }
  .cs-mod-header { display:flex; align-items:center; gap:8px; margin-bottom:11px; }
  .cs-mod-icon { width:32px; height:32px; border-radius:9px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
  .cs-mod-meta-label { font-size:9px; font-weight:700; letter-spacing:.8px; color:#4a4070; text-transform:uppercase; margin-bottom:1px; }
  .cs-mod-meta-name { font-family:'Space Grotesk',sans-serif; font-size:12px; font-weight:700; color:#f1f5f9; }
  .cs-mod-big { font-size:17px; font-weight:800; font-family:'Space Grotesk',sans-serif; margin-bottom:3px; line-height:1.2; }
  .cs-mod-sub { font-size:11px; color:#64748b; line-height:1.5; }
  .cs-chips { display:flex; flex-wrap:wrap; gap:4px; margin-top:6px; }
  .cs-chip { font-size:10px; font-weight:500; padding:2px 8px; border-radius:6px; }
  .cs-hx-row { display:flex; align-items:center; gap:6px; margin-top:5px; }
  .cs-hx-label { font-size:10px; color:#64748b; width:76px; flex-shrink:0; }
  .cs-hx-track { flex:1; height:4px; background:rgba(255,255,255,.07); border-radius:99px; overflow:hidden; }
  .cs-hx-fill { height:100%; border-radius:99px; }
  .cs-hx-pct { font-size:10px; font-weight:700; width:26px; text-align:right; }
  .cs-dt-row { display:flex; align-items:center; justify-content:space-between; margin-top:6px; }
  .cs-dt-label { font-size:10px; color:#94a3b8; }
  .cs-dt-score { font-size:12px; font-weight:700; }
  .cs-warn { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; background:rgba(255,0,92,.1); border:1px solid rgba(255,0,92,.28); color:#fb7185; padding:3px 9px; border-radius:6px; margin-top:7px; }
  .cs-locked { position:absolute; inset:0; border-radius:13px; background:rgba(3,0,20,.82); backdrop-filter:blur(4px); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:16px; text-align:center; }
  .cs-lock-msg { font-size:11px; color:#4a4070; line-height:1.45; }
  .cs-lock-cta { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:600; padding:5px 12px; border-radius:8px; border:1px solid rgba(112,0,255,.35); background:rgba(112,0,255,.1); color:#a78bfa; cursor:pointer; text-decoration:none; transition:all .2s; }
  .cs-lock-cta:hover { background:rgba(112,0,255,.22); color:#fff; }
  .cs-spin { animation:cs-s 1s linear infinite; }
  @keyframes cs-s { to { transform:rotate(360deg); } }
`;

// ─── CHIP ────────────────────────────────────────────────────────────────────────

function Chip({ label, color, dim, border }: { label: string; color: string; dim: string; border: string }) {
  return <span className="cs-chip" style={{ background: dim, color, border: `1px solid ${border}` }}>{label}</span>;
}

// ─── MODULE CARD ─────────────────────────────────────────────────────────────────

interface ModCard {
  key: string; label: string; sublabel: string; route: string;
  accent: string; accentDim: string; icon: React.ReactNode;
  content: React.ReactNode; done: boolean;
}

function ModuleCard({ m }: { m: ModCard }) {
  return (
    <div className="cs-mod" style={m.done ? { borderColor: `${m.accent}28` } : undefined}>
      <div className="cs-mod-glow" style={{ background: m.accent }} />
      <div className="cs-mod-header">
        <div className="cs-mod-icon" style={{ background: m.accentDim, color: m.accent }}>{m.icon}</div>
        <div>
          <div className="cs-mod-meta-label">{m.label}</div>
          <div className="cs-mod-meta-name">{m.sublabel}</div>
        </div>
      </div>
      {m.done ? m.content : (
        <div className="cs-locked">
          <Lock size={18} style={{ color: '#4a4070' }} />
          <div className="cs-lock-msg">
            Ukończ <strong style={{ color: '#6d5fa6' }}>{m.label}</strong>, aby odblokować moduł
          </div>
          {m.route && <a href={m.route} className="cs-lock-cta">Rozpocznij<ChevronRight size={11} /></a>}
        </div>
      )}
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────────

export default function CharacterSheet() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [raw, setRaw] = useState<ParsedData>({
    hexaco: null, enneagram: null, strengths: null, career: null, darkTriad: null, values: null,
  });

  useEffect(() => {
    async function load() {
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
        const map: any = {};
        for (const r of rows) if (!map[r.test_type]) map[r.test_type] = r;
        setRaw({
          hexaco:    map['HEXACO']     ?? null,
          enneagram: map['ENNEAGRAM']  ?? null,
          strengths: map['STRENGTHS']  ?? null,
          career:    map['CAREER']     ?? null,
          darkTriad: map['DARK_TRIAD'] ?? null,
          values:    map['VALUES']     ?? null,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const avatarUrl = user?.user_metadata?.avatar_url ?? '';
  const userName  = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Użytkownik';
  const initials  = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const done = {
    hexaco:    !!raw.hexaco,
    enneagram: !!raw.enneagram,
    strengths: !!raw.strengths,
    career:    !!raw.career,
    darkTriad: !!raw.darkTriad,
    values:    !!raw.values,
  };
  const completedCount = Object.values(done).filter(Boolean).length;
  const TOTAL = 6;
  const allDone = completedCount === TOTAL;

  const ennReport  = raw.enneagram?.report;
  const ennPrimary = ennReport?.primary_type;
  const ennTypeNum = ennPrimary?.id as number ?? null;
  const ennLore    = ennTypeNum ? ENNEAGRAM_LORE[ennTypeNum] : null;
  const ennWing    = ennReport?.wing?.type;

  const hexPct: Record<string, number> = raw.hexaco?.percentile_scores ?? {};
  const hexSorted = Object.entries(hexPct)
    .filter(([k]) => HEXACO_LABELS[k])
    .sort(([, a], [, b]) => (b as number) - (a as number));
  const hexTop3 = hexSorted.slice(0, 3);
  const hexBot1 = hexSorted.slice(-1)[0];

  const top5: any[] = raw.strengths?.raw_scores?.top_5 ?? [];
  const top3Names = top5.slice(0, 3).map((t: any) => t.name ?? t.name_en ?? '');

  const careerReport = raw.career ? (raw.career.report ?? generateCareerReport(raw.career.raw_scores)) : null;
  const hollandCode  = careerReport?.holland_code ?? '—';
  const hollandExpl  = careerReport?.summary?.holland_code_explanation ?? '';

  const dtRaw    = raw.darkTriad?.raw_scores ?? {};
  const dtTraits = ['machiavellianism', 'narcissism', 'psychopathy']
    .map(k => ({ k, name: DT_NAMES[k], score: Math.round(dtRaw[k]?.raw_score ?? 0) }))
    .sort((a, b) => b.score - a.score);
  const dtTop = dtTraits[0];

  const valReport = raw.values ? (raw.values.report ?? generateValuesReport(raw.values.raw_scores)) : null;
  const topValues: string[] = (valReport?.top_3 ?? []).slice(0, 3).map((v: any) => v.value ?? v.name ?? '');

  const epithet    = ennLore?.epithet ?? null;
  const rpgClass   = ennLore?.rpg     ?? null;
  const popCulture = ennLore?.pop     ?? [];

  const modules: ModCard[] = [
    {
      key: 'enneagram', label: 'Enneagram', sublabel: 'Archetyp Osobowości',
      route: '/test?type=enneagram', accent: C.fuchsia, accentDim: C.fuchsiaDim, done: done.enneagram,
      icon: <Brain size={15} />,
      content: (
        <>
          <div className="cs-mod-big" style={{ color: C.fuchsia }}>
            Typ {ennPrimary?.id}{ennWing ? `w${ennWing}` : ''} — {ennPrimary?.name ?? '—'}
          </div>
          <div className="cs-mod-sub" style={{ fontSize: 10 }}>{ennPrimary?.description ?? ''}</div>
          {ennReport?.tritype && (
            <div className="cs-mod-sub" style={{ marginTop: 5 }}>
              Tritype: <span style={{ color: '#c4b5fd' }}>{ennReport.tritype.join('-')}</span>
            </div>
          )}
        </>
      ),
    },
    {
      key: 'hexaco', label: 'HEXACO', sublabel: 'Cechy Osobowości',
      route: '/test?type=hexaco', accent: C.cyan, accentDim: C.cyanDim, done: done.hexaco,
      icon: <Zap size={15} />,
      content: (
        <>
          {hexTop3.map(([id, val]) => (
            <div key={id} className="cs-hx-row">
              <div className="cs-hx-label">{HEXACO_LABELS[id]}</div>
              <div className="cs-hx-track">
                <div className="cs-hx-fill" style={{
                  width: `${val}%`,
                  background: (val as number) >= 60 ? C.cyan : (val as number) <= 35 ? C.rose : '#6366f1',
                }} />
              </div>
              <div className="cs-hx-pct" style={{
                color: (val as number) >= 60 ? C.cyan : (val as number) <= 35 ? C.rose : '#6366f1',
              }}>{val}%</div>
            </div>
          ))}
          {hexBot1 && (
            <div className="cs-mod-sub" style={{ marginTop: 6 }}>
              Najniżej: <span style={{ color: C.rose }}>{HEXACO_LABELS[hexBot1[0]]}</span> {hexBot1[1]}%
            </div>
          )}
        </>
      ),
    },
    {
      key: 'strengths', label: 'High5 Talenty', sublabel: 'Mocne Strony',
      route: '/test?type=strengths', accent: C.amber, accentDim: C.amberDim, done: done.strengths,
      icon: <Star size={15} />,
      content: (
        <>
          <div className="cs-chips">
            {top3Names.map((t: string) => (
              <Chip key={t} label={t} color={C.amber} dim={C.amberDim} border="rgba(251,191,36,.22)" />
            ))}
          </div>
          {top5.slice(3, 5).map((t: any) => (
            <div key={t.name} style={{ fontSize: 10, color: '#4a4070', marginTop: 4 }}>+{t.name}</div>
          ))}
        </>
      ),
    },
    {
      key: 'career', label: 'Profil Zawodowy', sublabel: 'Kod Hollanda',
      route: '/test?type=career', accent: C.emerald, accentDim: C.emeraldDim, done: done.career,
      icon: <Briefcase size={15} />,
      content: (
        <>
          <div className="cs-mod-big" style={{ color: C.emerald }}>{hollandCode}</div>
          <div className="cs-mod-sub">{hollandExpl || 'Dominujący profil zawodowy'}</div>
        </>
      ),
    },
    {
      key: 'darkTriad', label: 'Analiza Cienia', sublabel: 'Dark Triad SD3',
      route: '/test?type=dark-triad', accent: C.rose, accentDim: C.roseDim, done: done.darkTriad,
      icon: <Flame size={15} />,
      content: (
        <>
          {dtTraits.map(t => (
            <div key={t.k} className="cs-dt-row">
              <span className="cs-dt-label">{t.name}</span>
              <span className="cs-dt-score" style={{
                color: t.score >= 70 ? C.rose : t.score >= 45 ? C.amber : '#34d399',
              }}>
                {t.score}<span style={{ fontSize: 9, color: '#4a4070', marginLeft: 1 }}>/100</span>
              </span>
            </div>
          ))}
          {dtTop?.score >= 65 && (
            <div className="cs-warn"><Shield size={9} />Ryzyko: {dtTop.name} ({dtTop.score})</div>
          )}
        </>
      ),
    },
    {
      key: 'values', label: 'Wartości', sublabel: 'Schwartz PVQ',
      route: '/test?type=values', accent: C.teal, accentDim: C.tealDim, done: done.values,
      icon: <Heart size={15} />,
      content: (
        <div className="cs-chips">
          {topValues.map(v => (
            <Chip key={v} label={v} color={C.teal} dim={C.tealDim} border="rgba(20,184,166,.22)" />
          ))}
        </div>
      ),
    },
    {
      key: 'archetype', label: 'Archetyp RPG', sublabel: 'Klasa Postaci',
      route: '', accent: C.violet, accentDim: C.violetDim, done: done.enneagram,
      icon: <Hexagon size={15} />,
      content: (
        <>
          <div className="cs-mod-big" style={{ color: C.violet, fontSize: 14 }}>{rpgClass ?? '—'}</div>
          {popCulture.length > 0 && (
            <>
              <div className="cs-mod-sub" style={{ margin: '7px 0 5px' }}>Podobne postacie:</div>
              <div className="cs-chips">
                {popCulture.map((p: string) => (
                  <Chip key={p} label={p} color="#c4b5fd" dim="rgba(112,0,255,.1)" border="rgba(112,0,255,.22)" />
                ))}
              </div>
            </>
          )}
        </>
      ),
    },
    {
      key: 'neural', label: 'Neural Score', sublabel: 'Indeks Profilowy',
      route: '', accent: '#00f0ff', accentDim: 'rgba(0,240,255,.09)', done: completedCount >= 4,
      icon: <Eye size={15} />,
      content: (
        <>
          <div className="cs-mod-big" style={{ color: '#00f0ff' }}>
            {Math.round(completedCount / TOTAL * 100)}
            <span style={{ fontSize: 11, color: '#4a4070' }}> / 100</span>
          </div>
          <div className="cs-mod-sub">Na podstawie {completedCount}/{TOTAL} modułów</div>
          <div className="cs-chips" style={{ marginTop: 8 }}>
            {allDone && <Chip label="Full Profile" color="#00f0ff" dim="rgba(0,240,255,.09)" border="rgba(0,240,255,.22)" />}
            {completedCount >= 3 && <Chip label="Aktywny" color="#34d399" dim="rgba(52,211,153,.1)" border="rgba(52,211,153,.2)" />}
          </div>
        </>
      ),
    },
  ];

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="cs-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#5b4b9a' }}>
          <svg className="cs-spin" width="36" height="36" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(112,0,255,.25)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#7000ff" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div style={{ marginTop: 12, fontSize: 13 }}>Ladowanie Karty Postaci…</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="cs-root">

        <nav className="cs-nav">
          <div className="cs-nav-inner">
            <button className="cs-nav-btn" onClick={() => (window.location.href = '/user-profile-tests.html')}>
              <ArrowLeft size={14} /> Dashboard
            </button>
            <span className="cs-nav-title">Karta Postaci</span>
            <button className="cs-nav-ai-btn" disabled={!allDone}
              title={allDone ? 'Uruchom NEA' : `Ukończ wszystkie ${TOTAL} moduły`}>
              <Sparkles size={13} /> Neural Engine Analysis
            </button>
          </div>
        </nav>

        <div className="cs-body">

          <aside>
            <div className="cs-glass cs-identity">
              <div className="cs-avatar-wrap">
                <div className="cs-avatar">
                  {avatarUrl ? <img src={avatarUrl} alt={userName} /> : initials}
                </div>
                <div className="cs-level-badge"><Zap size={9} /> Poziom {completedCount}</div>
                <div className="cs-name">{userName}</div>
                {epithet  && <div className="cs-epithet">„{epithet}”</div>}
                {rpgClass && <div className="cs-rpg-class">{rpgClass}</div>}
              </div>

              <div className="cs-progress-wrap">
                <div className="cs-progress-label">
                  <span>Postęp profilowania</span>
                  <span style={{ color: allDone ? C.emerald : '#4a4070' }}>{completedCount}/{TOTAL}</span>
                </div>
                <div className="cs-progress-track">
                  <div className="cs-progress-fill" style={{ width: `${Math.round(completedCount / TOTAL * 100)}%` }} />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                {done.enneagram && ennPrimary && (
                  <div className="cs-stat-row">
                    <div className="cs-stat-label"><Brain size={9} />Typ Enn.</div>
                    <div className="cs-stat-value">Typ {ennPrimary.id}{ennWing ? `w${ennWing}` : ''} – {ennPrimary.name}</div>
                  </div>
                )}
                {done.career && (
                  <div className="cs-stat-row">
                    <div className="cs-stat-label"><Briefcase size={9} />Holland</div>
                    <div className="cs-stat-value">{hollandCode}</div>
                  </div>
                )}
                {done.strengths && top3Names[0] && (
                  <div className="cs-stat-row">
                    <div className="cs-stat-label"><Star size={9} />Top Talent</div>
                    <div className="cs-stat-value">{top3Names[0]}</div>
                  </div>
                )}
                {done.hexaco && hexTop3[0] && (
                  <div className="cs-stat-row">
                    <div className="cs-stat-label"><Zap size={9} />HEXACO↑</div>
                    <div className="cs-stat-value" style={{ color: C.cyan }}>{HEXACO_LABELS[hexTop3[0][0]]} {hexTop3[0][1]}%</div>
                  </div>
                )}
                {done.values && topValues[0] && (
                  <div className="cs-stat-row">
                    <div className="cs-stat-label"><Heart size={9} />Wartość #1</div>
                    <div className="cs-stat-value">{topValues[0]}</div>
                  </div>
                )}
                {done.darkTriad && dtTop?.score >= 65 && (
                  <div className="cs-stat-row">
                    <div className="cs-stat-label" style={{ color: C.rose }}><Flame size={9} />Ryzyko</div>
                    <div className="cs-stat-value" style={{ color: C.rose }}>{dtTop.name} {dtTop.score}/100</div>
                  </div>
                )}
              </div>

              {popCulture.length > 0 && (
                <>
                  <div className="cs-section-label">Podobne postacie</div>
                  <div className="cs-pop-chips">
                    {popCulture.map((p: string) => <span key={p} className="cs-pop-chip">{p}</span>)}
                  </div>
                </>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', fontSize: 10, color: '#4a4070', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.04)', marginTop: 2 }}>
                {allDone
                  ? <><Sparkles size={10} style={{ color: C.violet }} /> Pełna synteza AI odblokowana</>
                  : <><Lock size={10} /> Synteza AI: {completedCount}/{TOTAL} modułów</>
                }
              </div>
            </div>
          </aside>

          <main>
            <div className="cs-main-wrap">

              <div className={`cs-ai-banner${allDone ? '' : ' locked'}`}>
                <div className="cs-ai-banner-text">
                  <h3>{allDone ? '❖ Neural Engine Analysis — Gotowy' : '❖ Neural Engine Analysis — Zablokowany'}</h3>
                  <p>{allDone
                    ? 'Wszystkie moduły ukończone. Uruchom głęboką syntezę AI swojego profilu psychologicznego.'
                    : `Ukończ ${TOTAL - completedCount} brakujące moduły, aby odblokować generatywną analizę.`
                  }</p>
                </div>
                <button className="cs-ai-cta" disabled={!allDone}>
                  <Sparkles size={12} />{allDone ? 'Uruchom NEA' : `${completedCount}/${TOTAL}`}
                </button>
              </div>

              <div className="cs-mod-grid">
                {modules.map(m => <ModuleCard key={m.key} m={m} />)}
              </div>

            </div>
          </main>

        </div>
      </div>
    </>
  );
}
