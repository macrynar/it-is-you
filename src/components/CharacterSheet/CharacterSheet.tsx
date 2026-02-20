import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { generateCareerReport, generateValuesReport } from '../../utils/scoring.js';
import HexacoDetailCards from '../Test/modules/HexacoDetailCards';
import HexacoRadarChart from '../Test/modules/HexacoRadarChart';
import DarkTriadSummaryPanel from '../Test/modules/DarkTriadSummaryPanel';
import StrengthsTopTalentsGrid from '../Test/modules/StrengthsTopTalentsGrid';
import CareerHollandMiniCards from '../Test/modules/CareerHollandMiniCards';
import ValuesTopChipsMini from '../Test/modules/ValuesTopChipsMini';
import EnneagramTypeCardMini from '../Test/modules/EnneagramTypeCardMini';

/* ═══════════ LORE ═══════════ */
const ENN_LORE: Record<number, {
  rpg: string; epithet: string; desc: string; symbol: string;
  pop: string[]; charges: string[]; drains: string[];
}> = {
  1:{ rpg:'Praworządny Paladin',     epithet:'Architekt Porządku',    desc:'Wysokie standardy i etyka. Twój rdzeń to wewnętrzny krytyk dążący do doskonałości.',              symbol:'⚔',  pop:['Hermiona Granger','Ned Stark','Chidi Anagonye','Captain America','Jiminy Cricket'], charges:['Precyzja i systemy','Realizacja planów','Etyczne decyzje'],       drains:['Chaos i improwizacja','Niedbałość innych','Brak kontroli'] },
  2:{ rpg:'Kapłan Wsparcia',         epithet:'Strażnik Serc',         desc:'Naturalna empatia i orientacja na potrzeby innych. Budujesz mosty i dbasz o relacje.',            symbol:'💜', pop:['Leslie Knope','Ted Lasso','Samwise Gamgee','Beth March','Joyce Byers'],             charges:['Pomaganie i troskliwość','Głębokie relacje','Wpływ na innych'],   drains:['Praca w izolacji','Bycie ignorowanym','Brak uznania'] },
  3:{ rpg:'Bard Ambicji',            epithet:'Architekt Sukcesu',     desc:'Motywacja przez osiągnięcia i prestiż. Adaptujesz się błyskawicznie i wygrywasz.',               symbol:'🏆', pop:['Tony Stark','Harvey Specter','Jay Gatsby','Miranda Priestly','Jordan Belfort'],    charges:['Sukcesy i wyniki','Uznanie i prestiż','Wysoka stawka'],           drains:['Anonimowość','Porażka','Stagnacja'] },
  4:{ rpg:'Mroczny Artysta',         epithet:'Dziecko Cienia',        desc:'Głęboka potrzeba autentyczności i wyrażenia wewnętrznego świata. Czujesz więcej niż inni.',      symbol:'🎭', pop:['Joker (2019)','Severus Snape','Don Draper','Virginia Woolf','Hamlet'],               charges:['Twórcza ekspresja','Autentyczność','Estetyka i piękno'],          drains:['Banalność','Bycie niezrozumianym','Szablony'] },
  5:{ rpg:'Mistrz Wiedzy Zakazanej', epithet:'Wartownik Umysłu',      desc:'Izolacja jako ochrona. Zbierasz wiedzę jako tarczę i broń. Obserwujesz nie uczestnicząc.',      symbol:'🔮', pop:['Sherlock Holmes','Dr House','Walter White','Spock','Alan Turing'],                  charges:['Głęboka analiza','Praca w skupieniu','Odkrywanie tajemnic'],      drains:['Natłok ludzi','Wymuszona małomówność','Brak czasu na myślenie'] },
  6:{ rpg:'Strażnik Bractwa',        epithet:'Bastion Lojalności',    desc:'Bezpieczeństwo przez przynależność. Lojalność jest Twoją walutą, a sceptycyzm tarczą.',         symbol:'🛡', pop:['Captain America','Ron Weasley','Frodo Baggins','Eddard Stark','Leslie Knope'],      charges:['Zaufane środowisko','Jasne zasady','Wierność wartościom'],        drains:['Niepewność i ryzyko','Zdrada','Brak wsparcia'] },
  7:{ rpg:'Chaotyczny Awanturnik',   epithet:'Wirtuoz Możliwości',    desc:'Ucieczka przez doświadczanie. Świat to plac zabaw, a ograniczenia to wrogowie.',               symbol:'🎲', pop:['Jack Sparrow','Tyrion Lannister','Fleabag','Deadpool','Gonzo'],                      charges:['Nowe przygody','Wolność i spontaniczność','Wielość możliwości'], drains:['Rutyna','Ograniczenia','Zobowiązania długoterminowe'] },
  8:{ rpg:'Warlord Wojenny',         epithet:'Inkwizytor Woli',       desc:'Kontrola jako przeżycie. Dominujesz bo słabość jest zagrożeniem. Chronisz intensywnie.',        symbol:'👁', pop:['Walter White','Tony Soprano','Daenerys Targaryen','Gordon Ramsay','Cersei'],        charges:['Kontrola i decyzyjność','Wyzwania i konfrontacja','Ochrona bliskich'], drains:['Zależność od innych','Okazywanie słabości','Utrata kontroli'] },
  9:{ rpg:'Mnich Harmonii',          epithet:'Spokój w Oku Cyklonu',  desc:'Pokój jako cel. Unikanie konfliktu przez fuzję z otoczeniem. Twój superpower to cierpliwość.', symbol:'☯',  pop:['Frodo Baggins','Ted Lasso','The Dude','Keanu Reeves','Samwise Gamgee'],              charges:['Spokój i harmonia','Mediacja','Połączenie z naturą'],              drains:['Konflikt i spory','Presja czasu','Przymus'] },
};

const HEX_FULL: Record<string,string> = {
  honesty_humility:'Uczciwość', emotionality:'Emocjonalność',
  extraversion:'Ekstrawersja', agreeableness:'Ugodowość',
  conscientiousness:'Sumienność', openness:'Otwartość'
};
const HEX_SHORT: Record<string,string> = {
  honesty_humility:'H', emotionality:'E', extraversion:'X',
  agreeableness:'A', conscientiousness:'C', openness:'O'
};
const HEX_COLOR: Record<string,string> = {
  honesty_humility:'#a78bfa', emotionality:'#f472b6', extraversion:'#fb923c',
  agreeableness:'#34d399', conscientiousness:'#60a5fa', openness:'#fbbf24'
};
const HEX_DIMS = ['honesty_humility','emotionality','extraversion','agreeableness','conscientiousness','openness'] as const;
const DT_LABEL: Record<string,string> = {
  machiavellianism:'Makiawelizm', narcissism:'Narcyzm', psychopathy:'Psychopatia'
};
const DT_COLOR: Record<string,string> = {
  machiavellianism:'#f97316', narcissism:'#fbbf24', psychopathy:'#ef4444'
};

interface RawRow { test_type:string; raw_scores:any; percentile_scores:any; report:any; }

function EnnStar({ active, pct }: { active: number|null; pct: number }) {
  const N=9, cx=100, cy=100, R=80, ri=28;
  const angle = (i: number) => ((i * 360 / N) - 90) * (Math.PI / 180);
  const outer = Array.from({length:N}, (_,i) => ({ x: cx+R*Math.cos(angle(i)), y: cy+R*Math.sin(angle(i)), n: i+1 }));
  const inner = Array.from({length:N}, (_,i) => ({ x: cx+ri*Math.cos(angle(i)+(Math.PI/N)), y: cy+ri*Math.sin(angle(i)+(Math.PI/N)) }));
  const starPts = outer.flatMap((o,i) => [`${o.x.toFixed(1)},${o.y.toFixed(1)}`, `${inner[i].x.toFixed(1)},${inner[i].y.toFixed(1)}`]).join(' ');
  return (
    <svg viewBox="0 0 200 200" style={{width:'100%',maxHeight:200,display:'block'}}>
      <circle cx={cx} cy={cy} r={R+6} fill="none" stroke="rgba(176,143,255,.07)" strokeWidth="1.5"/>
      <polygon points={starPts} fill="rgba(176,143,255,.06)" stroke="rgba(176,143,255,.18)" strokeWidth="1.2" strokeLinejoin="round"/>
      {outer.map(o => <line key={o.n} x1={cx} y1={cy} x2={o.x.toFixed(1)} y2={o.y.toFixed(1)} stroke="rgba(176,143,255,.07)" strokeWidth="1"/>)}
      {outer.map(o => (
        <circle key={o.n} cx={o.x.toFixed(1)} cy={o.y.toFixed(1)} r={o.n===active ? 8 : 4}
          fill={o.n===active ? '#b08fff' : 'rgba(176,143,255,.25)'}
          stroke={o.n===active ? 'rgba(176,143,255,.6)' : 'none'} strokeWidth="2"
          style={o.n===active ? {filter:'drop-shadow(0 0 8px #b08fff)'} : {}}/>
      ))}
      {outer.map(o => {
        const lp = { x: cx+(R+18)*Math.cos(angle(o.n-1)), y: cy+(R+18)*Math.sin(angle(o.n-1)) };
        return (
          <text key={o.n} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
            fill={o.n===active ? '#b08fff' : 'rgba(176,143,255,.28)'}
            fontSize={o.n===active ? 11 : 8.5} fontFamily="Orbitron,monospace" fontWeight="700">
            {o.n}
          </text>
        );
      })}
      {active && pct > 0 && (
        <circle cx={cx} cy={cy} r={(pct/100)*(R-10)+10} fill="none" stroke="rgba(176,143,255,.10)" strokeWidth="18" strokeDasharray="3 5"/>
      )}
    </svg>
  );
}

/* ══ HELPERS ══ */
function pad2(n: number) { return String(n).padStart(2,'0'); }
function hashCode(s: string) {
  let h = 0;
  for (const c of s) h = (Math.imul(31,h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/* ══ MAIN ══ */
export default function CharacterSheet() {
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [lightMode, setLightMode] = useState(() => document.body.classList.contains('light-mode'));
  const [raw, setRaw] = useState<Record<string,RawRow|null>>({
    HEXACO:null, ENNEAGRAM:null, STRENGTHS:null, CAREER:null, DARK_TRIAD:null, VALUES:null
  });

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = '/auth'; return; }
      setAuthUser(u);
      const { data: rows } = await supabase
        .from('user_psychometrics')
        .select('test_type,raw_scores,percentile_scores,report')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });
      if (rows?.length) {
        const m: Record<string,RawRow|null> = {
          HEXACO:null, ENNEAGRAM:null, STRENGTHS:null, CAREER:null, DARK_TRIAD:null, VALUES:null
        };
        for (const r of rows) if (m[r.test_type] === null) m[r.test_type] = r;
        setRaw(m);
      }
      setLoading(false);
    })();
  }, []);

  /* DERIVED */
  const userName  = (authUser?.user_metadata?.full_name ?? authUser?.email?.split('@')[0] ?? 'Użytkownik') as string;
  const avatarUrl = (authUser?.user_metadata?.avatar_url ?? '') as string;
  const initials  = userName.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0,2);
  const done      = Object.values(raw).filter(Boolean).length;
  const xpPct     = Math.round((done / 6) * 100);
  const charId    = authUser ? `PSY-${hashCode(authUser.id).toString(16).toUpperCase().slice(0,6)}` : 'PSY-??????';
  const now       = new Date();
  const buildDate = `${now.getFullYear()}.${pad2(now.getMonth()+1)}.${pad2(now.getDate())}`;

  /* HEXACO */
  const hexPct: Record<string,number> = raw.HEXACO?.percentile_scores ?? {};
  const hexBars = HEX_DIMS.map(k => ({
    k, label:HEX_FULL[k], short:HEX_SHORT[k],
    pct:Math.round(hexPct[k] ?? 0),
    color:HEX_COLOR[k]
  }));
  const hexTop3 = [...hexBars].sort((a,b) => b.pct - a.pct).slice(0,3);

  /* ENNEAGRAM */
  const ennR = raw.ENNEAGRAM?.report;
  const ennP = ennR?.primary_type;
  const ennN: number|null = Number.isFinite(Number(ennP?.type ?? ennP?.id)) ? Number(ennP?.type ?? ennP?.id) : null;
  const ennL = ennN ? ENN_LORE[ennN] : null;
  const ennWing: string = ennR?.wing ? `w${ennR.wing}` : '';
  const ennScores: Record<string, number> = raw.ENNEAGRAM?.raw_scores ?? {};
  const ennScore = ennN ? (ennScores[String(ennN)] ?? 0) : 0;
  const ennMax = Math.max(0, ...Object.values(ennScores).map(v => (typeof v === 'number' ? v : 0)));
  const ennStrengthPct = ennMax > 0 ? Math.round((ennScore / ennMax) * 100) : 0;

  /* STRENGTHS */
  const top5: any[] = raw.STRENGTHS?.raw_scores?.top_5 ?? [];

  /* CAREER */
  const careerRep = raw.CAREER ? (raw.CAREER.report ?? generateCareerReport(raw.CAREER.raw_scores)) : null;
  const holland: string = careerRep?.holland_code ?? '';
  const topJobs: any[] = (careerRep?.top_careers ?? careerRep?.career_clusters ?? []).slice(0,6);

  /* VALUES */
  const valuesRep = raw.VALUES
    ? (raw.VALUES.report ?? (raw.VALUES.raw_scores?.sorted_values ? generateValuesReport(raw.VALUES.raw_scores) : null))
    : null;
  const topVals: any[] = (valuesRep?.all_values ?? raw.VALUES?.raw_scores?.sorted_values ?? valuesRep?.top_3 ?? []).slice(0,5);

  /* DARK TRIAD */
  const dtDims = raw.DARK_TRIAD?.raw_scores?.dimensions ?? {};
  const dtTraits = ['machiavellianism','narcissism','psychopathy'].map(k => {
    const v = dtDims[k]?.raw_score ?? 0;
    const pct = v <= 5 ? Math.round(((v-1)/4)*100) : Math.round(v);
    return { k, label:DT_LABEL[k], pct:Math.max(0,Math.min(100,pct)), color:DT_COLOR[k] };
  }).sort((a,b) => b.pct - a.pct);

  /* RPG meta */
  const lvlLabel = ['NOVICE','AWAKENED','SEEKER','ADEPT','INITIATE','OPERATOR'][Math.min(done,5)];
  const rareLabel = done>=6 ? 'LEGENDARY' : done>=4 ? 'RARE' : done>=2 ? 'UNCOMMON' : 'COMMON';
  const codeStr = [hexTop3[0]?.short, hexTop3[1]?.short, ennN ? `E${ennN}` : null, holland||null].filter(Boolean).join(' · ');

  const profileSignature = codeStr;
  const archetypeAiBlurb = (() => {
    if (!ennL || !ennN) return '';
    const charges = (ennL.charges ?? []).slice(0, 2);
    const drains = (ennL.drains ?? []).slice(0, 2);
    const tools = (top5 ?? [])
      .slice(0, 2)
      .map((t: any) => t?.name ?? t?.name_en)
      .filter(Boolean);

    const wingPart = ennWing ? ` (${ennWing})` : '';
    const sentences = [
      `${ennL.epithet}${wingPart}: ${ennL.desc.replace(/\s*\.*\s*$/, '.').trim()}`,
      charges.length ? `Ładuje: ${charges.join(' + ')}.` : '',
      drains.length ? `Drenuje: ${drains.join(' + ')}.` : '',
      tools.length ? `Narzędzia: ${tools.join(' + ')}.` : '',
    ].filter(Boolean);

    return sentences.join(' ').replace(/\s+/g, ' ').trim().slice(0, 240);
  })();

  /* AI SYNTHESIS */
  const synthLines: string[] = [];
  if (ennN && ennL) synthLines.push(`<strong>Archetyp ${ennL.rpg}:</strong> ${ennL.epithet}. ${ennL.desc.slice(0,120)}.`);
  if (hexTop3.length >= 3) synthLines.push(`<strong>Rdzeń HEXACO:</strong> Dominują ${hexTop3.map(h => h.label + ' (' + h.pct + '%)').join(', ')}. To Twój psychologiczny hardware.`);
  if (top5.length >= 3) synthLines.push(`<strong>Talenty:</strong> ${top5.slice(0,3).map((t:any) => t.name ?? t.name_en).join(', ')} — naturalne przewagi wymagające narzędzi, nie pracy.`);
  if (dtTraits.length && raw.DARK_TRIAD) synthLines.push(`<strong>Strefa cienia:</strong> ${dtTraits[0].label} (${dtTraits[0].pct}%) to najsilniejszy obszar Twojego cienia. Świadomość to pierwsza linia obrony.`);
  if (topVals.length) synthLines.push(`<strong>Wartości dominujące:</strong> ${topVals.slice(0,3).map((v:any) => v.name ?? v.value_name ?? String(v)).join(', ')}. To Twój wewnętrzny kompas.`);
  if (careerRep && holland) synthLines.push(`<strong>Profil kariery:</strong> Kod Holland ${holland} wskazuje na środowiska: ${topJobs.slice(0,2).map((j:any) => j.title ?? j.name ?? '').filter(Boolean).join(' i ')}. Twój flow jest właśnie tam.`);

  /* LOADING */
  if (loading) return (
    <div className="min-h-screen bg-bg-main text-text-main flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-brand-secondary/20 border-t-brand-secondary mx-auto mb-4 animate-spin"/>
        <div className="font-mono text-brand-secondary/40 text-[11px] tracking-[3px]">LOADING PROFILE…</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-main text-text-main bg-neural-gradient bg-fixed">
      <nav className="border-b border-white/5 bg-bg-surface/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <a href="/" className="iiy-logo iiy-sm">
              <div className="iiy-signet">
                <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="iiy-hg2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38b6ff" />
                      <stop offset="50%" stopColor="#7b5ea7" />
                      <stop offset="100%" stopColor="#38b6ff" />
                    </linearGradient>
                    <linearGradient id="iiy-bg2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#38b6ff" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#1a1d4a" stopOpacity="0.08" />
                    </linearGradient>
                    <filter id="iiy-glow2" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="2" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <clipPath id="iiy-clip2">
                      <polygon points="48,5 87,27 87,69 48,91 9,69 9,27" />
                    </clipPath>
                  </defs>
                  <polygon points="48,5 87,27 87,69 48,91 9,69 9,27" fill="#11143a" />
                  <g className="iiy-ring-ticks" filter="url(#iiy-glow2)">
                    <line x1="48" y1="5" x2="48" y2="12" stroke="#38b6ff" strokeWidth="1.8" />
                    <line x1="87" y1="27" x2="81" y2="30" stroke="#38b6ff" strokeWidth="1.8" />
                    <line x1="87" y1="69" x2="81" y2="66" stroke="#38b6ff" strokeWidth="1.8" />
                    <line x1="48" y1="91" x2="48" y2="84" stroke="#38b6ff" strokeWidth="1.8" />
                    <line x1="9" y1="69" x2="15" y2="66" stroke="#38b6ff" strokeWidth="1.8" />
                    <line x1="9" y1="27" x2="15" y2="30" stroke="#38b6ff" strokeWidth="1.8" />
                    <line x1="68" y1="8" x2="66" y2="12" stroke="#7b5ea7" strokeWidth="1" opacity="0.6" />
                    <line x1="28" y1="8" x2="30" y2="12" stroke="#7b5ea7" strokeWidth="1" opacity="0.6" />
                    <line x1="90" y1="48" x2="84" y2="48" stroke="#7b5ea7" strokeWidth="1" opacity="0.6" />
                    <line x1="6" y1="48" x2="12" y2="48" stroke="#7b5ea7" strokeWidth="1" opacity="0.6" />
                    <line x1="68" y1="88" x2="66" y2="84" stroke="#7b5ea7" strokeWidth="1" opacity="0.6" />
                    <line x1="28" y1="88" x2="30" y2="84" stroke="#7b5ea7" strokeWidth="1" opacity="0.6" />
                  </g>
                  <polygon points="48,5 87,27 87,69 48,91 9,69 9,27" fill="none" stroke="url(#iiy-hg2)" strokeWidth="1.8" />
                  <g clipPath="url(#iiy-clip2)">
                    <line className="iiy-scan" x1="12" y1="48" x2="84" y2="48" stroke="#38b6ff" strokeWidth="1.2" opacity="0.5" />
                    <circle cx="48" cy="30" r="12" fill="#11143a" stroke="#38b6ff" strokeWidth="1.2" />
                    <rect x="37" y="26.5" width="22" height="6" rx="3" fill="#0d0f2b" stroke="#38b6ff" strokeWidth="0.7" />
                    <ellipse className="iiy-eye-l" cx="43" cy="29.5" rx="3.5" ry="1.8" fill="#7b5ea7" filter="url(#iiy-glow2)" />
                    <ellipse className="iiy-eye-r" cx="53" cy="29.5" rx="3.5" ry="1.8" fill="#7b5ea7" filter="url(#iiy-glow2)" />
                    <rect x="44.5" y="42" width="7" height="6" rx="1" fill="#11143a" stroke="#38b6ff" strokeWidth="0.8" />
                    <path d="M28 90 L31 50 Q48 44 65 50 L68 90 Z" fill="url(#iiy-bg2)" stroke="#38b6ff" strokeWidth="0.9" />
                    <line x1="48" y1="50" x2="48" y2="74" stroke="#38b6ff" strokeWidth="0.5" opacity="0.35" />
                    <rect x="39" y="55" width="18" height="12" rx="1.5" fill="none" stroke="#38b6ff" strokeWidth="0.6" opacity="0.5" />
                    <line x1="31" y1="52" x2="31" y2="65" stroke="#7b5ea7" strokeWidth="1.4" opacity="0.9" />
                    <line x1="65" y1="52" x2="65" y2="65" stroke="#7b5ea7" strokeWidth="1.4" opacity="0.9" />
                    <circle className="iiy-core" cx="48" cy="61" r="2.8" fill="#38b6ff" filter="url(#iiy-glow2)" />
                  </g>
                </svg>
              </div>
              <div className="iiy-wordmark">
                <div className="iiy-title">PSYCHER</div>
                <div className="iiy-divider" />
                <div className="iiy-sub">Psychometric AI Engine</div>
              </div>
            </a>

            {/* Center Nav Tabs */}
            <div className="iiy-nav-tabs">
              <button className="iiy-tab-btn" onClick={() => { window.location.href = '/user-profile-tests.html'; }}>
                🧪 Testy
              </button>
              <button className="iiy-tab-btn active" aria-current="page">
                🃏 Karta Postaci
              </button>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              <button
                className={`theme-toggle ${lightMode ? 'light' : ''}`}
                onClick={() => { const n = !lightMode; setLightMode(n); document.body.classList.toggle('light-mode', n); }}
                title="Przełącz motyw"
              >
                <div className="theme-toggle-slider" />
                <svg className="theme-icon theme-icon-moon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg className="theme-icon theme-icon-sun" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>

              <button
                onClick={async () => { await supabase.auth.signOut(); window.location.href='/'; }}
                className="px-4 py-2 bg-bg-surface/50 hover:bg-bg-surface text-white rounded-lg text-sm border border-white/10 hover:border-brand-primary/50 transition-all backdrop-blur-sm"
              >
                Wyloguj
              </button>
              <a
                href="/settings"
                className="px-4 py-2 bg-bg-surface/50 hover:bg-bg-surface text-white rounded-lg text-sm border border-white/10 hover:border-brand-primary/50 transition-all backdrop-blur-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                title="Ustawienia konta"
              >
                ⚙️ Ustawienia
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="px-6 py-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto auto-rows-min">
          {(() => {
            const TILE_BASE = 'card-neural p-6 relative flex flex-col';
            const archetype = ennL?.rpg ?? 'Archetyp nieznany';
            const epithet = ennL?.epithet ?? 'Brak danych';
            const pop = (ennL?.pop ?? []).slice(0, 6).map((name, i) => ({ name, pct: Math.max(60, 95 - i * 7) }));

            return (
              <>
                {/* TILE 1: HERO & AI CORE */}
                <section className={`col-span-1 lg:col-span-1 lg:row-span-2 ${TILE_BASE}`}>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
                    <div aria-hidden className="absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl opacity-25" style={{ background: 'rgba(56,182,255,.35)' }} />
                    <div aria-hidden className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full blur-3xl opacity-20" style={{ background: 'rgba(176,143,255,.35)' }} />

                    <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-14 h-14 rounded-full border border-white/15 bg-white/5 overflow-hidden flex items-center justify-center shrink-0" style={{ boxShadow: '0 0 0 1px rgba(56,182,255,.18), 0 0 20px rgba(56,182,255,.08)' }}>
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-semibold text-white/75">{initials}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-semibold leading-tight whitespace-normal break-words text-[15px]" title={userName}>
                            {userName}
                          </div>
                          <div className="text-[11px] text-white/45 font-mono mt-1 whitespace-normal break-words">
                            <span className="text-white/55">ID:</span> {charId}
                            <span className="mx-1.5 text-white/25">•</span>
                            <span className="text-white/55">Build:</span> {buildDate}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-wrap sm:flex-col items-start sm:items-end justify-start sm:justify-end gap-2">
                        <span className="badge-primary">{rareLabel}</span>
                        <span className="badge-pending">Poziom {done} · {lvlLabel}</span>
                      </div>
                    </div>

                    <div className="relative mt-4">
                      <div className="flex items-center justify-between text-[10px] tracking-[2px] font-mono text-white/35">
                        <span>POSTĘP PROFILU</span>
                        <span className="text-white/50">Testy: {done}/6 · {xpPct}%</span>
                      </div>
                      <div className="stat-bar-track mt-2">
                        <div className="stat-bar-fill" style={{ width: `${Math.max(0, Math.min(100, xpPct))}%` }} />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/45 font-mono">
                        <span className="text-white/45">SYGNATURA</span>
                        <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/60 whitespace-normal break-words">
                          {profileSignature || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-[10px] tracking-[2px] font-mono text-white/35">ARCHETYP RPG</div>
                    <div className="mt-2 text-xl font-extrabold text-brand-secondary leading-tight">{archetype}</div>
                    <div className="mt-1 text-sm text-white/55 italic">{epithet}</div>
                    {archetypeAiBlurb ? (
                      <div className="mt-3 text-sm text-white/60 leading-relaxed bg-white/5 border border-white/10 rounded-lg p-3">
                        <span className="text-white/75 font-semibold">AI:</span> {archetypeAiBlurb}
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-white/45">
                        Ukończ Enneagram i HEXACO, aby wygenerować opis archetypu.
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <div className="text-[10px] tracking-[2px] font-mono text-white/35">PODOBNE POSTACIE</div>
                    <div className="mt-3 flex flex-col gap-2">
                      {pop.length > 0 ? (
                        pop.map((p) => (
                          <div key={p.name} className="bg-white/5 rounded-md p-2 flex justify-between gap-3">
                            <span className="text-sm text-white/70 truncate">{p.name}</span>
                            <span className="text-xs font-mono text-white/45 shrink-0">{p.pct}%</span>
                          </div>
                        ))
                      ) : (
                        <a
                          href="/user-profile-tests.html"
                          className="bg-white/5 rounded-md p-3 text-sm text-white/45 border border-white/10 hover:border-brand-primary/30 hover:text-white/70 transition no-underline"
                        >
                          Ukończ Enneagram, aby odblokować archetyp i podobieństwa →
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] tracking-[2px] font-mono text-emerald-200/70">CHARGES</div>
                      <div className="mt-2 space-y-1">
                        {(ennL?.charges ?? []).slice(0, 3).map((s) => (
                          <div key={s} className="text-xs text-emerald-100/80 bg-emerald-500/10 border border-emerald-400/20 rounded-md px-2 py-1 truncate">
                            {s}
                          </div>
                        ))}
                        {!ennL && (
                          <div className="text-xs text-emerald-100/50 bg-emerald-500/10 border border-emerald-400/20 rounded-md px-2 py-1">
                            Ukończ Enneagram
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] tracking-[2px] font-mono text-rose-200/70">DRAINS</div>
                      <div className="mt-2 space-y-1">
                        {(ennL?.drains ?? []).slice(0, 3).map((s) => (
                          <div key={s} className="text-xs text-rose-100/80 bg-rose-500/10 border border-rose-400/20 rounded-md px-2 py-1 truncate">
                            {s}
                          </div>
                        ))}
                        {!ennL && (
                          <div className="text-xs text-rose-100/50 bg-rose-500/10 border border-rose-400/20 rounded-md px-2 py-1">
                            Ukończ Enneagram
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* TILE 2: MATRYCA HEXACO */}
                <section className={`col-span-1 lg:col-span-2 lg:row-span-2 ${TILE_BASE}`}>
                  <div className="text-[10px] tracking-[2px] font-mono text-white/35">MATRYCA HEXACO</div>
                  {raw.HEXACO ? (
                    <>
                      <div className="mt-4">
                        <HexacoRadarChart
                          percentiles={raw.HEXACO?.percentile_scores ?? {}}
                          showFrame={false}
                          showHeader={false}
                        />
                      </div>

                      <div className="mt-4">
                        <HexacoDetailCards
                          percentiles={raw.HEXACO?.percentile_scores ?? {}}
                          showEnglishName={false}
                          showDescription={false}
                          columns={2}
                        />
                      </div>
                    </>
                  ) : (
                    <a
                      href="/user-profile-tests.html"
                      className="mt-4 bg-white/5 rounded-md p-3 text-sm text-white/45 border border-white/10 hover:border-brand-primary/30 hover:text-white/70 transition no-underline"
                    >
                      Wykonaj test HEXACO, aby zobaczyć radar i paski →
                    </a>
                  )}
                </section>

                {/* TILE 3: ENNEAGRAM & ENGINE */}
                <section className={`col-span-1 lg:col-span-1 lg:row-span-2 ${TILE_BASE}`}>
                  <div className="text-[10px] tracking-[2px] font-mono text-white/35">ENNEAGRAM & ENGINE</div>

                  <div className="flex items-center justify-center mt-3">
                    <div className="w-full max-w-[220px]">
                      <EnnStar active={ennN} pct={ennN ? ennStrengthPct : 0}/>
                    </div>
                  </div>

                  <div className="mt-4">
                    {raw.ENNEAGRAM ? (
                      <EnneagramTypeCardMini primaryType={ennP} wing={ennR?.wing} strengthPct={ennStrengthPct} lore={ennL} />
                    ) : (
                      <a
                        href="/user-profile-tests.html"
                        className="bg-white/5 rounded-md p-3 text-sm text-white/45 border border-white/10 hover:border-brand-primary/30 hover:text-white/70 transition no-underline block"
                      >
                        Wykonaj test Enneagram, aby odblokować profil typu →
                      </a>
                    )}
                  </div>

                  <div className="mt-6 space-y-4 min-w-0">
                    <div className="min-w-0">
                      <div className="text-[10px] tracking-[2px] font-mono text-white/35">RIASEC</div>
                      {careerRep?.top_3?.length ? (
                        <div className="mt-2">
                          <CareerHollandMiniCards report={careerRep} />
                        </div>
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-2 max-w-full overflow-hidden">
                          {(holland ? holland.split('') : []).slice(0, 3).map((c, i) => (
                            <span key={`${c}-${i}`} className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/60">
                              {c}
                            </span>
                          ))}
                          {!holland && (
                            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/40">
                              Wykonaj test kariery
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-[10px] tracking-[2px] font-mono text-white/35">WARTOŚCI</div>
                      {topVals.length > 0 ? (
                        <div className="mt-2">
                          <ValuesTopChipsMini report={valuesRep} fallback={topVals} max={3} />
                        </div>
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-2 max-w-full overflow-hidden">
                          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/40">
                            Wykonaj test wartości
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* TILE 4: ARSENAŁ */}
                <section className={`col-span-1 lg:col-span-2 ${TILE_BASE}`}>
                  <div className="text-[10px] tracking-[2px] font-mono text-white/35">ARSENAŁ</div>
                  <div className="mt-3 text-lg font-semibold text-amber-400">Top talenty</div>

                  {top5.length > 0 ? (
                    <div className="mt-4">
                      <StrengthsTopTalentsGrid top5={top5} />
                    </div>
                  ) : (
                    <a
                      href="/user-profile-tests.html"
                      className="mt-4 bg-white/5 rounded-md p-3 text-sm text-white/45 border border-white/10 hover:border-brand-primary/30 hover:text-white/70 transition no-underline"
                    >
                      Wykonaj test Strengths, aby zobaczyć top 5 talentów →
                    </a>
                  )}
                </section>

                {/* TILE 5: STREFA CIENIA */}
                <section className={`col-span-1 lg:col-span-2 card-neural card-danger p-6 relative flex flex-col`}>
                  <div className="text-[10px] tracking-[2px] font-mono text-rose-200/60">STREFA CIENIA</div>
                  <div className="mt-3 text-lg font-semibold text-rose-300">Ciemna Triada (SD3)</div>

                  {raw.DARK_TRIAD ? (
                    <div className="mt-4">
                      <DarkTriadSummaryPanel rawScores={raw.DARK_TRIAD?.raw_scores} report={raw.DARK_TRIAD?.report} />
                    </div>
                  ) : (
                    <a
                      href="/user-profile-tests.html"
                      className="mt-4 bg-white/5 rounded-md p-3 text-sm text-white/45 border border-white/10 hover:border-rose-400/40 hover:text-white/70 transition no-underline"
                    >
                      Wykonaj test Dark Triad, aby zobaczyć profil cienia →
                    </a>
                  )}
                </section>

                {/* TILE 6: SYNTEZA AI */}
                <section className={`col-span-1 lg:col-span-4 ${TILE_BASE}`}>
                  <div className="text-[10px] tracking-[2px] font-mono text-white/35">SYNTEZA AI</div>
                  <div className="mt-3 text-lg font-semibold text-white/80">Najważniejsze wnioski</div>

                  {synthLines.length > 0 ? (
                    <div className="mt-4 space-y-3 text-sm text-white/65 leading-relaxed">
                      {synthLines.map((line, i) => (
                        <div
                          key={i}
                          className="bg-white/5 border border-white/10 rounded-lg p-4"
                          dangerouslySetInnerHTML={{ __html: line }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 text-sm text-white/45">
                      Ukończ więcej testów, aby AI mogło wygenerować spójną syntezę.
                    </div>
                  )}
                </section>
              </>
            );
          })()}
        </div>
      </main>
    </div>
  );
}
