import { useEffect, useMemo, useState } from 'react';
import { supabase, getAccessToken, SUPABASE_ANON_KEY } from '../../lib/supabaseClient.js';
import { generateCareerReport, generateValuesReport } from '../../utils/scoring.js';
import HexacoRadarChart from '../Test/modules/HexacoRadarChart';
import HexacoDetailCards from '../Test/modules/HexacoDetailCards';
import CharacterChatBubble from './CharacterChatBubble';
import { getUserPremiumStatus, type UserPremiumStatus } from '../../lib/stripeService';
import ValuesCircumplexChart, { SCHWARTZ_CIRCUMPLEX } from './ValuesCircumplexChart';
import AlchemeLogo from '../AlchemeLogo';

type CharacterCardContent = {
  archetype_name: string;
  archetype_subtitle: string;
  tags_fundamental: string[];
  tags_style: string[];
  tags_values: string[];
  hexaco_interpretations: {
    honesty_humility: string;
    emotionality: string;
    extraversion: string;
    agreeableness: string;
    conscientiousness: string;
    openness: string;
  };
  enneagram_motivation_text: string;
  strengths_top1_interpretation: string;
  riasec_environment_text: string;
  schwartz_values_text: string;
  portrait_essence: string;
  portrait_environment: string;
  portrait_superpowers: string;
  portrait_blindspots: string;
  energy_why: string;
  energy_boosters: string[];
  energy_drainers: string[];
  darktriad_synthesis: string;
  popculture: Array<{ context: string; name: string; reason: string }>;
  ideal_careers: Array<{ emoji: string; title: string; description: string }>;
};

const CORE_TESTS = ['HEXACO','ENNEAGRAM','STRENGTHS','CAREER','DARK_TRIAD','VALUES'] as const;

const HEX_DIMS = [
  { id: 'honesty_humility', label: 'Uczciwość-Pokora' },
  { id: 'emotionality', label: 'Emocjonalność' },
  { id: 'extraversion', label: 'Ekstrawersja' },
  { id: 'agreeableness', label: 'Ugodowość' },
  { id: 'conscientiousness', label: 'Sumienność' },
  { id: 'openness', label: 'Otwartość' },
] as const;

const ENNEAGRAM_META: Record<number, { name: string; mottoEn: string; stress: string; growth: string; motivation: string; fear: string }> = {
  1: { name: 'Reformista', mottoEn: 'The Reformer', stress: 'Pod presją: sztywność, krytycyzm, napięcie na „powinno".', growth: 'W rozwoju: elastyczność, mądry standard zamiast perfekcjonizmu.', motivation: 'Być dobrym, prawym i doskonalić siebie oraz świat wokół siebie.', fear: 'Bycia złym, zdeprawowanym lub popełnienia błędu bez możliwości naprawy.' },
  2: { name: 'Pomocnik', mottoEn: 'The Helper', stress: 'Pod presją: nadopiekuńczość, ukryte oczekiwania, rozczarowanie.', growth: 'W rozwoju: zdrowe granice i proszenie o wsparcie wprost.', motivation: 'Być kochanym i potrzebnym — wyrażać miłość i troskę dla innych.', fear: 'Bycia niekochanym lub niechcianym przez tych, na których zależy.' },
  3: { name: 'Osiągacz', mottoEn: 'The Achiever', stress: 'Pod presją: praca w trybie „wynik albo nic", utrata kontaktu z sobą.', growth: 'W rozwoju: autentyczność, spokój i cele zgodne z wartościami.', motivation: 'Być wartościowym i odnoszącym sukcesy — wyróżniać się i być podziwianym.', fear: 'Bycia bezwartościowym lub postrzeganym jako porażka.' },
  4: { name: 'Indywidualista', mottoEn: 'The Individualist', stress: 'Pod presją: porównywanie, dramatyzacja, poczucie braku.', growth: 'W rozwoju: ugruntowanie i działanie mimo nastroju.', motivation: 'Być sobą — odnaleźć i wyrazić swoją unikalną tożsamość i znaczenie.', fear: 'Braku tożsamości lub osobistego sensu; bycia zwyczajnym.' },
  5: { name: 'Badacz', mottoEn: 'The Investigator', stress: 'Pod presją: wycofanie, nadmierna analiza, odcięcie od potrzeb.', growth: 'W rozwoju: kontakt, dzielenie się i ucieleśnione działanie.', motivation: 'Posiadać wiedzę i rozumieć świat — być kompetentnym i samowystarczalnym.', fear: 'Bycia nieudolnym, niekompetentnym lub niezdolnym do funkcjonowania.' },
  6: { name: 'Lojalista', mottoEn: 'The Loyalist', stress: 'Pod presją: czarny scenariusz, testowanie lojalności, napięcie.', growth: 'W rozwoju: zaufanie do siebie i odwaga w niepewności.', motivation: 'Mieć bezpieczeństwo i wsparcie — budować lojalność i trwałe więzi.', fear: 'Braku oparcia i pewnego gruntu; zostania bez pomocy w trudnej chwili.' },
  7: { name: 'Entuzjasta', mottoEn: 'The Enthusiast', stress: 'Pod presją: ucieczka w bodźce, rozproszenie, unikanie ciężaru.', growth: 'W rozwoju: głębia, konsekwencja i wybór jednej rzeczy naraz.', motivation: 'Być szczęśliwym i spełnionym — doświadczać wszystkiego, co życie ma do zaoferowania.', fear: 'Bycia pozbawionym, uwięzionym w bólu lub ograniczeniu.' },
  8: { name: 'Przywódca', mottoEn: 'The Challenger', stress: 'Pod presją: kontrola, ostrość, „siła albo słabość".', growth: 'W rozwoju: ochrona bez dominacji i siła z empatią.', motivation: 'Być niezależnym i silnym — chronić siebie i bliskich, kontrolować własne życie.', fear: 'Bycia skrzywdzonym, zdradzonym lub kontrolowanym przez innych.' },
  9: { name: 'Mediator', mottoEn: 'The Peacemaker', stress: 'Pod presją: zamrożenie, prokrastynacja, znikanie z konfliktu.', growth: 'W rozwoju: priorytety, obecność i zdrowa asertywność.', motivation: 'Zachować wewnętrzny spokój i harmonię — żyć w zgodzie z sobą i otoczeniem.', fear: 'Utraty połączenia z bliskimi lub rozpadnięcia się wewnętrznej harmonii.' },
};
const RIASEC_META: Record<string, { name: string; namePl: string; letter: string; colorClass: string; hexColor: string }> = {
  realistic:     { name: 'Realistic',     namePl: 'Praktyczny',    letter: 'R', colorClass: 'text-rose-300',    hexColor: '#f87171' },
  investigative: { name: 'Investigative', namePl: 'Badawczy',      letter: 'I', colorClass: 'text-sky-300',     hexColor: '#38b6ff' },
  artistic:      { name: 'Artistic',      namePl: 'Artystyczny',   letter: 'A', colorClass: 'text-fuchsia-300', hexColor: '#e878e0' },
  social:        { name: 'Social',        namePl: 'Społeczny',     letter: 'S', colorClass: 'text-emerald-300', hexColor: '#10b981' },
  enterprising:  { name: 'Enterprising',  namePl: 'Przedsięb.',    letter: 'E', colorClass: 'text-amber-300',   hexColor: '#fbbf24' },
  conventional:  { name: 'Conventional',  namePl: 'Konwencjon.',   letter: 'C', colorClass: 'text-slate-300',   hexColor: '#94a3b8' },
};

const STRENGTHS_DOMAIN: Record<string, { label: string; className: string }> = {
  strategic_thinking: { label: 'Strategic Thinking', className: 'bg-sky-500/10 border-sky-400/20 text-sky-200/80' },
  executing: { label: 'Executing', className: 'bg-amber-500/10 border-amber-400/20 text-amber-200/80' },
  influencing: { label: 'Influencing', className: 'bg-rose-500/10 border-rose-400/20 text-rose-200/80' },
  relationship_building: { label: 'Relationship Building', className: 'bg-emerald-500/10 border-emerald-400/20 text-emerald-200/80' },
};

interface RawRow { test_type:string; raw_scores:any; percentile_scores:any; report:any; }

function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }
function levelColor(pct: number) {
  if (pct >= 70) return 'text-emerald-200';
  if (pct >= 40) return 'text-sky-200';
  if (pct >= 25) return 'text-amber-200';
  return 'text-rose-200';
}

function levelLabelEn(pct: number) {
  if (pct >= 70) return 'High';
  if (pct >= 40) return 'Moderate';
  if (pct >= 25) return 'Low';
  return 'Very low';
}

function levelLabelPl(pct: number) {
  if (pct >= 70) return 'Wysoki';
  if (pct >= 40) return 'Umiarkowany';
  if (pct >= 25) return 'Niski';
  return 'Bardzo niski';
}

function firstSentence(text: unknown, fallback = '') {
  const s = typeof text === 'string' ? text.trim() : '';
  if (!s) return fallback;
  const m = s.match(/^(.+?[.!?])\s/);
  return (m?.[1] ?? s).trim();
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />;
}

function SectionDivider({ label, tone }: { label: string; tone?: 'default' | 'danger' }) {
  const danger = tone === 'danger';
  return (
    <div className="col-span-full flex items-center gap-3 mt-2">
      <div className={
        `text-[10px] tracking-[2px] font-mono uppercase ${danger ? 'text-rose-200/60' : 'text-white/35'}`
      }>
        {label}
      </div>
      <div
        className="flex-1 h-px"
        style={{
          background: danger
            ? 'linear-gradient(90deg,rgba(244,63,94,.25),transparent)'
            : 'linear-gradient(90deg,rgba(56,182,255,.18),transparent)',
        }}
      />
    </div>
  );
}

function normalizeTritype(types: unknown, primaryType: number | null): number[] {
  const arr = Array.isArray(types) ? types : [];
  const cleaned = arr
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 9)
    .map((n) => Math.round(n));

  const uniq: number[] = [];
  for (const n of cleaned) {
    if (!uniq.includes(n)) uniq.push(n);
  }

  if (primaryType && !uniq.includes(primaryType)) uniq.unshift(primaryType);
  if (primaryType) uniq.sort((a, b) => (a === primaryType ? -1 : b === primaryType ? 1 : 0));
  return uniq.slice(0, 3);
}

function extractTritypeFromReport(report: any): unknown {
  if (!report || typeof report !== 'object') return null;
  if (Array.isArray(report.tritype)) return report.tritype;
  if (Array.isArray(report.tri_type)) return report.tri_type;
  if (Array.isArray(report.tritype_types)) return report.tritype_types;
  if (Array.isArray(report.tritype_numbers)) return report.tritype_numbers;
  if (Array.isArray(report.top_types)) return report.top_types;
  if (Array.isArray(report.top_3)) return report.top_3;
  if (Array.isArray(report.top_3_types)) return report.top_3_types;
  if (report.tritype && typeof report.tritype === 'object') {
    if (Array.isArray(report.tritype.types)) return report.tritype.types;
    if (Array.isArray(report.tritype.top_3)) return report.tritype.top_3;
  }
  return null;
}

function deriveTop3TypesFromScores(scores: Record<string, number>): number[] {
  const entries = Object.entries(scores ?? {})
    .map(([k, v]) => ({ k, v: typeof v === 'number' && Number.isFinite(v) ? v : 0 }))
    .filter((x) => x.k && x.v > 0);

  const sorted = entries
    .sort((a, b) => b.v - a.v)
    .map((x) => Number(x.k))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 9)
    .map((n) => Math.round(n));

  const uniq: number[] = [];
  for (const n of sorted) {
    if (!uniq.includes(n)) uniq.push(n);
  }
  return uniq.slice(0, 3);
}

function EnnStar({ active, scores }: { active: number | null; scores: Record<string, number> }) {
  const cx = 100;
  const cy = 100;
  const R = 78;

  const angle = (i: number) => (((i * 360) / 9) - 90) * (Math.PI / 180);
  const pts = Array.from({ length: 9 }, (_, i) => {
    const n = i + 1;
    const a = angle(i);
    return { n, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });
  const p = (n: number) => pts.find((x) => x.n === n)!;

  const starSeq = [1, 4, 2, 8, 5, 7, 1];
  const triSeq = [3, 6, 9, 3];

  const starPoints = starSeq.map((n) => `${p(n).x.toFixed(1)},${p(n).y.toFixed(1)}`).join(' ');
  const triPoints = triSeq.map((n) => `${p(n).x.toFixed(1)},${p(n).y.toFixed(1)}`).join(' ');
  const activePt = active ? pts.find((x) => x.n === active) : null;

  const scoreVals = Object.values(scores ?? {}).map((v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0));
  const maxScore = Math.max(0, ...scoreVals);
  const scoreFor = (n: number) => {
    const a = scores?.[String(n)];
    const b = (scores as any)?.[n];
    const v = typeof a === 'number' && Number.isFinite(a) ? a : typeof b === 'number' && Number.isFinite(b) ? b : 0;
    return v;
  };

  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <filter id="iiyEnnGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={cx} cy={cy} r={R + 9} fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="1.5" />

      <polyline points={starPoints} fill="none" stroke="white" strokeOpacity="0.13" strokeWidth="1.2" strokeLinejoin="round" />
      <polyline points={triPoints} fill="none" stroke="white" strokeOpacity="0.09" strokeWidth="1.2" strokeLinejoin="round" />

      {pts.map((o) => (
        <line
          key={`ray-${o.n}`}
          x1={cx}
          y1={cy}
          x2={o.x.toFixed(1)}
          y2={o.y.toFixed(1)}
          stroke="white"
          strokeOpacity="0.06"
          strokeWidth="1"
        />
      ))}

      {/* tendency ticks (relative strength for each type) */}
      {pts.map((o) => {
        const raw = scoreFor(o.n);
        const pct = maxScore > 0 ? clamp(raw / maxScore, 0, 1) : 0;
        const tick = 4 + pct * 14;
        const vx = o.x - cx;
        const vy = o.y - cy;
        const vlen = Math.hypot(vx, vy) || 1;
        const ux = vx / vlen;
        const uy = vy / vlen;

        const rOuter = R + 6;
        const rInner = rOuter - tick;
        const x1 = cx + ux * rOuter;
        const y1 = cy + uy * rOuter;
        const x2 = cx + ux * rInner;
        const y2 = cy + uy * rInner;

        const isActive = o.n === active;
        return (
          <line
            key={`tick-${o.n}`}
            x1={x1.toFixed(1)}
            y1={y1.toFixed(1)}
            x2={x2.toFixed(1)}
            y2={y2.toFixed(1)}
            stroke={isActive ? 'currentColor' : 'white'}
            strokeOpacity={isActive ? 0.85 : 0.08 + pct * 0.22}
            strokeWidth={isActive ? 3 : 2}
            strokeLinecap="round"
          />
        );
      })}

      {activePt ? (
        <line
          x1={cx}
          y1={cy}
          x2={activePt.x.toFixed(1)}
          y2={activePt.y.toFixed(1)}
          stroke="currentColor"
          strokeOpacity="0.65"
          strokeWidth="2.4"
          filter="url(#iiyEnnGlow)"
        />
      ) : null}

      {pts.map((o) => {
        const isActive = o.n === active;
        return (
          <g key={`pt-${o.n}`}>
            {isActive ? (
              <circle
                cx={o.x.toFixed(1)}
                cy={o.y.toFixed(1)}
                r={13}
                fill="currentColor"
                fillOpacity="0.12"
                stroke="currentColor"
                strokeOpacity="0.35"
                strokeWidth="2"
                filter="url(#iiyEnnGlow)"
              />
            ) : null}

            <circle
              cx={o.x.toFixed(1)}
              cy={o.y.toFixed(1)}
              r={isActive ? 8.5 : 4}
              fill={isActive ? 'currentColor' : 'white'}
              fillOpacity={isActive ? 0.9 : 0.18}
              stroke={isActive ? 'currentColor' : 'none'}
              strokeOpacity={isActive ? 0.45 : 0}
              strokeWidth={isActive ? 3 : 0}
              filter={isActive ? 'url(#iiyEnnGlow)' : undefined}
            />

            <text
              x={o.x.toFixed(1)}
              y={(o.y + (isActive ? 19 : 14)).toFixed(1)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isActive ? 'currentColor' : 'white'}
              fillOpacity={isActive ? 0.9 : 0.28}
              fontSize={isActive ? 10 : 8.5}
              fontFamily="Share Tech Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              fontWeight="700"
            >
              {o.n}
            </text>
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r={2.6} fill="white" fillOpacity="0.25" />
    </svg>
  );
}

/* ══ DEMO DATA ══ */
const DEMO_PROFILE = { full_name: 'Aleksandra K.', avatar_url: null as string | null, is_premium: true };
const DEMO_AUTH_USER = { id: 'demo', email: 'demo@alcheme.io', user_metadata: { full_name: 'Aleksandra K.' } };
const DEMO_RAW: Record<string, RawRow> = {
  HEXACO: { test_type: 'HEXACO', raw_scores: {}, percentile_scores: { honesty_humility: 68, emotionality: 41, extraversion: 79, agreeableness: 52, conscientiousness: 65, openness: 93 }, report: null },
  ENNEAGRAM: {
    test_type: 'ENNEAGRAM',
    raw_scores: { '1': 20, '2': 15, '3': 85, '4': 35, '5': 25, '6': 30, '7': 55, '8': 40, '9': 20 },
    percentile_scores: {},
    report: { primary_type: { type: 3 }, wing: 4, tritype: [3, 7, 1] },
  },
  STRENGTHS: {
    test_type: 'STRENGTHS',
    raw_scores: { top_5: [
      { name: 'Myślenie Strategiczne', domain: 'strategic_thinking', score: 0.95 },
      { name: 'Kreatywność', domain: 'strategic_thinking', score: 0.88 },
      { name: 'Miłość do Nauki', domain: 'strategic_thinking', score: 0.82 },
      { name: 'Entuzjazm', domain: 'influencing', score: 0.78 },
      { name: 'Maksymalizacja', domain: 'influencing', score: 0.74 },
    ] },
    percentile_scores: {},
    report: null,
  },
  CAREER: {
    test_type: 'CAREER',
    raw_scores: {},
    percentile_scores: {},
    report: {
      holland_code: 'IAE',
      all_scores: { investigative: 88, artistic: 75, enterprising: 62, social: 54, realistic: 33, conventional: 22 },
      top_careers: [
        { emoji: '🔬', title: 'Data Scientist / Analityk', description: 'Otwartość 93p + precyzja myślenia tworzą idealne warunki do badań.' },
        { emoji: '🚀', title: 'Founder / Strateg', description: 'Ekstrawersja 79p + myślenie systemowe = naturalny lider.' },
        { emoji: '🎨', title: 'UX/Product Designer', description: 'Profil artystyczny IAE z silną kreatywnością.' },
        { emoji: '🧠', title: 'Psycholog / Coach', description: 'Otwartość i empatia — idealny profil do pracy z ludźmi.' },
        { emoji: '🎓', title: 'Badacz / Naukowiec', description: 'Profil badawczy i wysoka sumienność wspierają pracę naukową.' },
      ],
    },
  },
  VALUES: {
    test_type: 'VALUES',
    raw_scores: {},
    percentile_scores: {},
    report: {
      all_values: [
        { name: 'Autonomia', score: 0.95 },
        { name: 'Kreatywność', score: 0.88 },
        { name: 'Wpływ', score: 0.82 },
        { name: 'Wiedza', score: 0.78 },
        { name: 'Wolność', score: 0.74 },
      ],
      top_3: [
        { name: 'Autonomia', score: 0.95 },
        { name: 'Kreatywność', score: 0.88 },
        { name: 'Wpływ', score: 0.82 },
      ],
    },
  },
  DARK_TRIAD: {
    test_type: 'DARK_TRIAD',
    raw_scores: { dimensions: { narcissism: { raw_score: 3.4 }, machiavellianism: { raw_score: 2.8 }, psychopathy: { raw_score: 1.6 } } },
    percentile_scores: {},
    report: null,
  },
};
const DEMO_LLM: CharacterCardContent = {
  archetype_name: 'Wizjoner-Analityk',
  archetype_subtitle: 'Buduje nowe systemy rozumienia',
  tags_fundamental: ['Analityczny', 'Strategiczny'],
  tags_style: ['Ekspresyjny introwerk', 'Systemowy'],
  tags_values: ['Autonomia', 'Wiedza'],
  hexaco_interpretations: {
    honesty_humility: 'Działa z integralnością gdy służy to celowi — bez nadmiernego podporządkowania.',
    emotionality: 'Niska emocjonalność pozwala sprawnie działać pod presją z zachowaną empatią w kluczowych relacjach.',
    extraversion: 'Wysoka ekstrawersja: naturalny lider który energetyzuje otoczenie i mobilizuje ludzi wokół wspólnego celu.',
    agreeableness: 'Potrafi współpracować i ustąpić gdy służy to celowi — ale nie kosztem własnych standardów.',
    conscientiousness: 'Ustrukturyzowane podejście do celów — organizuje to co ważne, zostawiając przestrzeń na improwizację.',
    openness: 'Najwyższy percentyl — źródło nieustannej ciekawości i zdolności do tworzenia nowych, niespotykanych połączeń.',
  },
  enneagram_motivation_text: 'Napędza ją potrzeba bycia wartościowym i odnoszącym sukcesy — wyróżniać się i być podziwianym za realne osiągnięcia.',
  strengths_top1_interpretation: 'Myślenie Strategiczne jako dominujący talent oznacza wyjątkową zdolność do tworzenia alternatywnych ścieżek do celu.',
  riasec_environment_text: 'Profil IAE predysponuje do środowisk łączących głębię intelektualną z twórczością i wpływem na innych.',
  schwartz_values_text: 'Autonomia i wiedza jako wartości nadrzędne tworzą profil osoby, która musi mieć przestrzeń do własnego myślenia.',
  portrait_essence: 'Połączenie rzadkiej ciekawości intelektualnej z wyjątkową ekstrawersją tworzy osobę, która nie tylko widzi wzorce tam gdzie inni ich nie dostrzegają, ale potrafi je skutecznie komunikować.',
  portrait_environment: 'Najlepiej działa w środowiskach gdzie może łączyć głęboką analizę z wpływem na innych. Przytłaczają ją miejsca z nadmierną biurokracją i brakiem sensu.',
  portrait_superpowers: 'Wyjątkowa zdolność syntezy złożonych informacji + naturalne zdolności przywódcze = rzadki profil który potrafi zarówno tworzyć strategie jak i przekonywać innych do ich realizacji.',
  portrait_blindspots: 'Może przeceniać własną wizję i niedoceniać pragmatycznych ograniczeń. Ryzyko wypalenia gdy zbyt wiele projektów jednocześnie.',
  energy_why: 'Energia pochodzi z rozwiązywania problemów które inni uważają za zbyt złożone — każde nowe wyzwanie intelektualne to paliwo.',
  energy_boosters: ['Projekty z realnym wpływem', 'Intelektualne wyzwania', 'Autonomia działania'],
  energy_drainers: ['Biurokracja bez sensu', 'Mikromanagement', 'Powtarzalna rutyna'],
  darktriad_synthesis: 'Profil Dark Triad na poziomie umiarkowanym — narcyzm służy ambicji, machiavelizm jest narzędziem strategii, nie manipulacji.',
  popculture: [
    { context: 'Marvel', name: 'Tony Stark', reason: 'Geniusz analityczny, ekstrawertyczny, zawsze musi być najlepszy — i przeważnie jest.' },
    { context: 'Serial', name: 'Sherlock Holmes', reason: 'Obserwacja, dedukcja i niezrozumienie przez przeciętnych — brzmi znajomo?' },
    { context: 'Pop-kultura', name: 'Lady Gaga', reason: 'Twórcza oryginalność + ambicja + absolutny brak strachu przed oceną innych.' },
    { context: 'Film', name: 'Dr. Gregory House', reason: 'Intelekt ponad przeciętnością, niechęć do zasad, obsesja na punkcie rozwiązywania.' },
    { context: 'Książka', name: 'Hermiona Granger', reason: 'Perfekcjonizm intelektualny, wysoka sumienność i otwartość na naukę jako etos.' },
  ],
  ideal_careers: [
    { emoji: '🔬', title: 'Data Scientist / Analityk', description: 'Otwartość 93p + precyzja myślenia tworzą idealne warunki do badań.' },
    { emoji: '🚀', title: 'Founder / Strateg', description: 'Ekstrawersja 79p + myślenie systemowe = naturalny lider.' },
    { emoji: '🎨', title: 'UX/Product Designer', description: 'Profil artystyczny IAE z silną kreatywnością.' },
    { emoji: '🧠', title: 'Psycholog / Coach', description: 'Otwartość i empatia — idealny profil do pracy z ludźmi.' },
    { emoji: '🎓', title: 'Badacz / Naukowiec', description: 'Profil badawczy i wysoka sumienność wspierają pracę naukową.' },
  ],
};

/* ══ MAIN ══ */
type CharacterSheetProps = {
  publicToken?: string;
  demoMode?: boolean;
};

export default function CharacterSheet({ publicToken, demoMode = false }: CharacterSheetProps) {
  const isPublic = Boolean(publicToken);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null; is_premium?: boolean | null } | null>(null);
  const [byType, setByType] = useState<Record<string, RawRow>>({});
  const [raw, setRaw] = useState<Record<string,RawRow|null>>({
    HEXACO:null, ENNEAGRAM:null, STRENGTHS:null, CAREER:null, DARK_TRIAD:null, VALUES:null
  });

  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [llmContent, setLlmContent] = useState<CharacterCardContent | null>(null);
  const [llmGeneratedAt, setLlmGeneratedAt] = useState<string | null>(null);

  const [premiumStatus, setPremiumStatus] = useState<UserPremiumStatus | null>(null);

  const [shareLoading, setShareLoading] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = (typeof window !== 'undefined' ? window.localStorage.getItem('theme') : null) ?? 'dark';
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    (async () => {
      setLoading(true);

      if (demoMode) {
        setProfile(DEMO_PROFILE);
        setAuthUser(DEMO_AUTH_USER);
        const bt: Record<string, RawRow> = {};
        const m: Record<string, RawRow|null> = { HEXACO:null, ENNEAGRAM:null, STRENGTHS:null, CAREER:null, DARK_TRIAD:null, VALUES:null };
        for (const [k, v] of Object.entries(DEMO_RAW)) { bt[k] = v; m[k] = v; }
        setByType(bt);
        setRaw(m);
        setLlmContent(DEMO_LLM);
        setLlmGeneratedAt(new Date().toISOString());
        setPremiumStatus({ isPremium: true, subscriptionStatus: 'active', stripeCustomerId: null });
        setLoading(false);
        return;
      }

      if (isPublic) {
        const { data, error } = await supabase.functions.invoke('character-share', {
          body: { action: 'fetch', token: publicToken },
        });

        if (error || !data?.profile) {
          setAuthUser(null);
          setProfile(null);
          setByType({});
          setRaw({ HEXACO:null, ENNEAGRAM:null, STRENGTHS:null, CAREER:null, DARK_TRIAD:null, VALUES:null });
          setLlmContent(null);
          setLlmGeneratedAt(null);
          setLlmError('Nie udało się załadować udostępnionej karty');
          setLoading(false);
          return;
        }

        const p = data.profile as { full_name: string | null; avatar_url: string | null; is_premium?: boolean | null };
        setProfile(p);
        setPremiumStatus(null);
        setAuthUser({
          id: data.user_id ?? null,
          email: null,
          user_metadata: {
            full_name: p.full_name ?? undefined,
            avatar_url: p.avatar_url ?? undefined,
          },
        });

        const rows = (data.psychometrics ?? []) as RawRow[];
        if (rows?.length) {
          const bt: Record<string, RawRow> = {};
          const m: Record<string,RawRow|null> = {
            HEXACO:null, ENNEAGRAM:null, STRENGTHS:null, CAREER:null, DARK_TRIAD:null, VALUES:null,
          };
          for (const r of rows) {
            if (bt[r.test_type] == null) bt[r.test_type] = r;
            if (m[r.test_type] === null) m[r.test_type] = r;
          }
          setByType(bt);
          setRaw(m);
        }

        const cc = (data as any)?.character_card_cache;
        setLlmContent((cc?.content ?? null) as CharacterCardContent | null);
        setLlmGeneratedAt(cc?.generated_at ? String(cc.generated_at) : null);
        setLlmError(null);
        setLoading(false);
        return;
      }

      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = '/auth'; return; }
      setAuthUser(u);
      const { data: rows } = await supabase
        .from('user_psychometrics')
        .select('test_type,raw_scores,percentile_scores,report')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });
      if (rows?.length) {
        const bt: Record<string, RawRow> = {};
        const m: Record<string,RawRow|null> = {
          HEXACO:null, ENNEAGRAM:null, STRENGTHS:null, CAREER:null, DARK_TRIAD:null, VALUES:null
        };
        for (const r of rows) {
          if (bt[r.test_type] == null) bt[r.test_type] = r;
          if (m[r.test_type] === null) m[r.test_type] = r;
        }
        setByType(bt);
        setRaw(m);
      }
      setLoading(false);
    })();
  }, [isPublic, publicToken]);

  useEffect(() => {
    if (!authUser?.id) return;
    void (async () => {
      const st = await getUserPremiumStatus();
      setPremiumStatus(st);
    })();
  }, [authUser?.id]);

  useEffect(() => {
    if (!authUser?.id) return;
    void (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', authUser.id)
        .maybeSingle();
      if (!error) setProfile(data ?? null);
    })();
  }, [authUser?.id]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (theme === 'light') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
    try {
      window.localStorage.setItem('theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  /* DERIVED */
  const profileName = (profile?.full_name ?? '') as string;
  const profileAvatar = (profile?.avatar_url ?? '') as string;

  const userName  = (profileName?.trim() || authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Użytkownik') as string;
  const avatarUrl = (profileAvatar?.trim() || authUser?.user_metadata?.avatar_url || '') as string;
  const initials  = userName.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0,2);
  const done      = CORE_TESTS.filter((k) => Boolean(raw[k])).length;

  const isPremium = premiumStatus?.isPremium ?? Boolean(profile?.is_premium);

  const createShareLink = async () => {
    if (shareLoading) return;
    setShareLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('character-share', {
        body: { action: 'create' },
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });
      if (error) throw error;

      const shareToken = String((data as any)?.token ?? '');
      if (!shareToken) throw new Error('No token returned');

      const url = `${window.location.origin}/share/${shareToken}`;

      if (typeof (navigator as any)?.share === 'function') {
        await (navigator as any).share({ title: 'Karta postaci', url });
        return;
      }

      try {
        await navigator.clipboard.writeText(url);
        alert('Link do karty postaci skopiowany do schowka.');
      } catch {
        window.prompt('Skopiuj link:', url);
      }
    } catch {
      alert('Nie udało się wygenerować linku do udostępnienia.');
    } finally {
      setShareLoading(false);
    }
  };

  const heroTagItems = useMemo(() => {
    const fundamental = (llmContent?.tags_fundamental ?? []).map((text) => ({
      text: String(text),
      className: 'iiy-cs-t-cyan',
      tip: 'Fundamental tag',
      icon: (
        <svg className="iiy-cs-tag-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" opacity=".4"/>
          <circle cx="12" cy="12" r="4.5" opacity=".7"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
      ),
    }));
    const style = (llmContent?.tags_style ?? []).map((text) => ({
      text: String(text),
      className: 'iiy-cs-t-violet',
      tip: 'Style tag',
      icon: (
        <svg className="iiy-cs-tag-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6.4 6.4l2.1 2.1M15.5 15.5l2.1 2.1M15.5 8.5l2.1-2.1M6.4 17.6l2.1-2.1"/>
          <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" opacity=".6"/>
        </svg>
      ),
    }));
    const values = (llmContent?.tags_values ?? []).map((text) => ({
      text: String(text),
      className: 'iiy-cs-t-amber',
      tip: 'Values tag',
      icon: (
        <svg className="iiy-cs-tag-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,2 22,12 12,22 2,12"/>
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" opacity=".6"/>
        </svg>
      ),
    }));

    const merged = [...fundamental, ...style, ...values]
      .map((t) => ({ ...t, text: t.text.trim() }))
      .filter((t) => Boolean(t.text));

    const uniq: typeof merged = [];
    for (const t of merged) if (!uniq.some((u) => u.text === t.text)) uniq.push(t);
    return uniq.slice(0, 6);
  }, [llmContent]);

  const heroTags = useMemo(() => {
    const arr = [
      ...(llmContent?.tags_fundamental ?? []),
      ...(llmContent?.tags_style ?? []),
      ...(llmContent?.tags_values ?? []),
    ]
      .map((t) => String(t).trim())
      .filter(Boolean);

    const uniq: string[] = [];
    for (const t of arr) if (!uniq.includes(t)) uniq.push(t);
    return uniq.slice(0, 6);
  }, [llmContent]);

  const dominantTraits = useMemo(() => heroTags.slice(0, 7), [heroTags]);

  /* HEXACO */
  const hexPct: Record<string,number> = raw.HEXACO?.percentile_scores ?? {};

  /* ENNEAGRAM */
  const ennR = raw.ENNEAGRAM?.report;
  const ennP = ennR?.primary_type;
  const ennN: number|null = Number.isFinite(Number(ennP?.type ?? ennP?.id)) ? Number(ennP?.type ?? ennP?.id) : null;
  const ennWing: string = (() => {
    const w: any = ennR?.wing;
    if (w == null) return '';
    if (typeof w === 'number' && Number.isFinite(w)) return `w${w}`;
    if (typeof w === 'string') {
      const m = w.match(/(\d+)/);
      if (m?.[1]) return `w${m[1]}`;
      return w.startsWith('w') ? w : '';
    }
    if (typeof w === 'object') {
      const candidate = (w.wing ?? w.id ?? w.type ?? w.number ?? w.value) as any;
      const n = Number(candidate);
      if (Number.isFinite(n)) return `w${n}`;
      const s = typeof candidate === 'string' ? candidate : '';
      const m = s.match(/(\d+)/);
      if (m?.[1]) return `w${m[1]}`;
    }
    return '';
  })();
  const ennScores: Record<string, number> = raw.ENNEAGRAM?.raw_scores ?? {};

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
  const dtRaw = {
    narcissism: Number(dtDims?.narcissism?.raw_score ?? 0),
    machiavellianism: Number(dtDims?.machiavellianism?.raw_score ?? 0),
    psychopathy: Number(dtDims?.psychopathy?.raw_score ?? 0),
  };

  const enneagramLabel = ennN ? ENNEAGRAM_META[ennN]?.name : '';
  const enneagramMotto = ennN ? ENNEAGRAM_META[ennN]?.mottoEn : '';

  const wingNum = useMemo(() => {
    const m = String(ennWing ?? '').match(/(\d+)/);
    return m?.[1] ? Number(m[1]) : null;
  }, [ennWing]);

  const enneagramTritype = useMemo(() => {
    const fromReport = normalizeTritype(extractTritypeFromReport(ennR), ennN);
    if (fromReport.length === 3) return fromReport;
    const fromScores = normalizeTritype(deriveTop3TypesFromScores(ennScores), ennN);
    return fromScores;
  }, [ennR, ennScores, ennN]);

  const schwartzTop3 = useMemo(() => {
    const all = Array.isArray(valuesRep?.all_values) ? valuesRep.all_values : (Array.isArray(valuesRep?.top_3) ? valuesRep.top_3 : topVals);
    const arr = Array.isArray(all) ? all : [];
    return arr.slice(0, 3);
  }, [valuesRep, topVals]);

  const valuesScoreMap = useMemo(() => {
    const all: any[] = valuesRep?.all_values ?? raw.VALUES?.raw_scores?.sorted_values ?? [];
    const map: Record<string, number> = {};
    for (const v of Array.isArray(all) ? all : []) {
      const id = String(v?.id ?? v?.value_id ?? '');
      const score = Number(v?.centered_score ?? v?.raw_score ?? v?.score ?? v?.mrat_score ?? 0);
      if (id && Number.isFinite(score)) map[id] = score;
    }
    return map;
  }, [valuesRep, raw.VALUES]);

  const riasecScores = useMemo(() => {
    // all_scores is the actual field from generateCareerReport / calculateCareerScore
    const allScores = careerRep?.all_scores ?? careerRep?.type_scores ?? careerRep?.typeScores ?? null;
    const m = (allScores && typeof allScores === 'object') ? allScores as Record<string, any> : {};

    const getV = (key: string, alt: string): number => {
      const entry = m[key] ?? m[alt];
      if (entry == null) return 0;
      if (typeof entry === 'object') return Number(entry?.raw_score ?? entry?.score ?? 0);
      return Number(entry);
    };

    const map: Record<string, number> = {
      realistic:     getV('realistic',     'R'),
      investigative: getV('investigative', 'I'),
      artistic:      getV('artistic',      'A'),
      social:        getV('social',        'S'),
      enterprising:  getV('enterprising',  'E'),
      conventional:  getV('conventional',  'C'),
    };

    const items = Object.entries(map)
      .map(([id, v]) => ({ id, v: Number.isFinite(v) ? v : 0 }))
      .sort((a, b) => b.v - a.v);

    const max = Math.max(0, ...items.map((x) => x.v));
    return { items, max };
  }, [careerRep]);

  const characterCardInput = useMemo(() => {
    const strengthsNames = (top5 ?? [])
      .slice(0, 5)
      .map((t: any) => String(t?.name ?? t?.name_en ?? '').trim())
      .filter(Boolean);

    return {
      user_name: userName,
      tests_completed: done,
      hexaco_scores: raw.HEXACO?.raw_scores ?? null,
      hexaco_percentiles: raw.HEXACO?.percentile_scores ?? null,
      enneagram_type: ennN,
      enneagram_wing: wingNum,
      strengths_top5: strengthsNames,
      riasec_code: holland,
      riasec_scores: riasecScores.items,
      schwartz_top3: schwartzTop3,
      darktriad_scores: dtRaw,
    };
  }, [userName, done, raw.HEXACO, ennN, wingNum, top5, holland, riasecScores.items, schwartzTop3, dtRaw]);

  const generateCharacterCard = async (force: boolean) => {
    if (isPublic) return;
    setLlmError(null);
    setLlmLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No session');

      const payload = { force, input: characterCardInput };

      // Always call Supabase Edge Function directly (works in both dev and prod).
      // supabase.functions.invoke automatically attaches the session JWT.
      const { data, error } = await supabase.functions.invoke('character-card-generate', {
        body: payload,
      });
      if (error) throw new Error((error as any)?.message ?? JSON.stringify(error));
      setLlmContent((data?.content ?? null) as CharacterCardContent | null);
      setLlmGeneratedAt(String(data?.generated_at ?? ''));
    } catch (_e: any) {
      setLlmError('Analiza chwilowo niedostępna');
      setLlmContent(null);
      setLlmGeneratedAt(null);
    } finally {
      setLlmLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (isPublic) return;
    if (!authUser?.id) return;
    if (done < 6) return;
    if (llmContent || llmLoading) return;
    void generateCharacterCard(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, authUser?.id, done, isPublic]);

  /* LOADING */
  if (loading) return (
    <div className="min-h-screen bg-bg-main text-text-main flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-brand-secondary/20 border-t-brand-secondary mx-auto mb-4 animate-spin"/>
        <div className="font-mono text-brand-secondary/40 text-[11px] tracking-[3px]">ŁADOWANIE PROFILU…</div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-bg-main text-text-main bg-neural-gradient bg-fixed${demoMode ? ' demo-mode' : ''}`}>
      {/* TOP NAV */}
      {!demoMode && (!isPublic ? (
      <nav className="border-b border-white/5 bg-bg-surface/80 backdrop-blur-xl sticky top-0 z-50 nav-neural">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <AlchemeLogo href="/" size={32} />

            {/* Center nav links — desktop only, page-level navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a className="iiy-nav-link" href="/methodology">Metodologia</a>
              <a className="iiy-nav-link" href="/pricing">Cennik</a>
              <a className="iiy-nav-link active" href="/character">Karta Postaci</a>
              <a className="iiy-nav-link" href="/user-profile-tests">Testy</a>
            </div>

            {/* Right utility actions — desktop */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                className={`theme-toggle ${theme === 'light' ? 'light' : ''}`}
                onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
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
              <a
                href="/settings"
                className="flex items-center justify-center w-9 h-9 rounded-lg text-white/45 hover:text-white hover:bg-white/8 border border-transparent hover:border-white/10 transition-all"
                title="Ustawienia"
              >
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </a>
              <button
                type="button"
                onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-white/45 hover:text-red-400 hover:bg-red-500/8 border border-transparent hover:border-red-500/20 transition-all"
                title="Wyloguj"
              >
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>

            {/* Hamburger — mobile */}
            <button
              type="button"
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
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
        {mobileMenuOpen && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,15,43,0.97)', backdropFilter: 'blur(20px)' }}>
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all" style={{ textDecoration: 'none' }}>Ustawienia</a>
              <a href="/methodology" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all" style={{ textDecoration: 'none' }}>Metodologia</a>
              <a href="/pricing" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all" style={{ textDecoration: 'none' }}>Cennik</a>
              <a href="/character" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/5 transition-all" style={{ textDecoration: 'none' }}>Karta Postaci</a>
              <a href="/user-profile-tests" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all" style={{ textDecoration: 'none' }}>Testy</a>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs text-white/30 uppercase tracking-widest font-semibold">Motyw</span>
                <button
                  type="button"
                  className={`theme-toggle ${theme === 'light' ? 'light' : ''}`}
                  onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
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
              </div>
              <button
                type="button"
                onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-all text-left"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Wyloguj
              </button>
            </div>
          </div>
        )}
      </nav>
      ) : (
      <nav className="border-b border-white/5 bg-bg-surface/80 backdrop-blur-xl sticky top-0 z-50 nav-neural">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <AlchemeLogo href="/" size={32} />
            <a
              href="/auth"
              className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(120deg, rgba(112,0,255,.75) 0%, rgba(0,200,220,.8) 100%)',
                boxShadow: '0 0 18px -4px rgba(0,240,255,.35)',
                textDecoration: 'none',
              }}
            >
              Stwórz swoją kartę
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          </div>
        </div>
      </nav>
      ))}

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">

        {!isPublic && done < 6 ? (
          <div className="card-neural iiy-hover-panel p-4 sm:p-6 mb-6">
            <div className="text-sm text-white/70">Ukończ wszystkie testy, aby odblokować pełny widok karty postaci.</div>
            <a href="/user-profile-tests.html" className="mt-4 inline-flex items-center gap-2 btn-neural no-underline">Przejdź do testów →</a>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-min">
            {/* SEKCJA 1: TOŻSAMOŚĆ (Hero) */}
            <section className="col-span-1 lg:col-span-3">
              <div className="card-neural iiy-hover-panel px-5 py-5">
                  <div className="iiy-cs-hero-inner">
                    {/* Top row */}
                    <div className="iiy-cs-hero-top">
                      {/* Segment 1: Avatar */}
                      <div className="iiy-cs-s-avatar">
                        <div className="iiy-cs-avatar-wrap">
                          <div className="iiy-cs-avatar" aria-label="Avatar">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div className="text-3xl font-extrabold text-white/70" style={{ letterSpacing: '-0.06em' }}>{initials}</div>
                            )}
                          </div>
                          <div className="iiy-cs-avatar-ring" />
                          <div className="iiy-cs-avatar-ring-2" />
                        </div>
                      </div>

                      <div className="iiy-cs-vd" />

                      {/* Segment 2: Identity + progress */}
                      <div className="iiy-cs-s-identity">
                        <div className="iiy-cs-test-progress" aria-label="Postęp testów">
                          {Array.from({ length: 6 }).map((_, i) => {
                            const active = i < done;
                            const isCurrent = active && i === Math.max(0, done - 1);
                            const cls = active
                              ? (isCurrent ? 'iiy-cs-dot iiy-cs-cyan' : 'iiy-cs-dot')
                              : 'iiy-cs-dot iiy-cs-empty';
                            return <span key={i} className={cls} />;
                          })}
                          <div className="iiy-cs-test-count">{done}/6 testów</div>
                        </div>

                        <div className="iiy-cs-user-name" title={userName}>{userName}</div>

                        <div className="iiy-cs-account-row">
                          {isPremium ? <span className="iiy-cs-badge-premium">PREMIUM</span> : null}
                          <span className="iiy-cs-account-status">Konto aktywne</span>
                        </div>
                      </div>

                      <div className="iiy-cs-vd" />

                      {/* Segment 3: Archetype + description side by side */}
                      <div className="iiy-cs-s-archetype">
                        <div className="iiy-cs-archetype-box iiy-hover-panel">
                          <div className="iiy-cs-arch-eye"><span className="iiy-cs-arch-blink" /> ARCHETYP AI</div>
                          <div className="iiy-cs-arch-row">
                            <div className="iiy-cs-arch-icon">🧙</div>
                            <div className="min-w-0">
                              <div className="iiy-cs-arch-name truncate">
                                {llmLoading ? 'Generuję…' : (llmContent?.archetype_name ?? '—')}
                              </div>
                              <div className="text-[11px] text-white/35 truncate">
                                {llmContent ? (llmContent.archetype_subtitle ?? '') : (llmError ?? 'Analiza chwilowo niedostępna')}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="iiy-cs-subtitle-box iiy-hover-panel">
                          <div className="iiy-cs-sub-eye">Opis postaci</div>
                          <div className="iiy-cs-sub-text">
                            {llmLoading ? (
                              <>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6 mt-2" />
                              </>
                            ) : llmContent ? (
                              <>
                                {firstSentence(llmContent.portrait_essence, '—')}
                                <span className="iiy-cs-ai-chip">Analiza</span>
                              </>
                            ) : (
                              <>Wygeneruj kartę, aby zobaczyć opis.<span className="iiy-cs-ai-chip">Analiza</span></>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Segment 4: Actions */}
                      <div className="iiy-cs-s-actions">
                        {isPublic ? null : (
                          <>
                            <button
                              type="button"
                              className="iiy-cs-btn iiy-cs-btn-primary"
                              onClick={() => void createShareLink()}
                              disabled={shareLoading}
                              title="Udostępnij publiczny link do karty postaci"
                            >
                              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M3 11l2-2 4 4 8-8 4 4v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z" />
                              </svg>
                              {shareLoading ? 'Generuję…' : 'Udostępnij'}
                            </button>

                            <button
                              type="button"
                              className="iiy-cs-btn iiy-cs-btn-ghost"
                              disabled={done < 6 || llmLoading}
                              onClick={() => void generateCharacterCard(true)}
                              title={done < 6 ? 'Ukończ wszystkie testy, aby odświeżyć kartę' : 'Odśwież kartę (Analiza)'}
                            >
                              <svg className="iiy-cs-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 8a8 8 0 00-14.83-3M4 16a8 8 0 0014.83 3" />
                              </svg>
                              {llmLoading ? 'Generuję…' : 'Odśwież'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom row: full-width tags */}
                    <div className="iiy-cs-hero-bottom">
                      <div className="iiy-cs-tags-label">Cechy dominujące</div>
                      <div className="iiy-cs-tags-row">
                        {heroTagItems.length ? (
                          heroTagItems.map((t) => (
                            <div key={t.text} className={`iiy-cs-tag ${t.className}`} data-tip={t.tip}>
                              {t.icon}
                              {t.text}
                            </div>
                          ))
                        ) : llmLoading ? (
                          <>
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-28" />
                            <Skeleton className="h-8 w-20" />
                          </>
                        ) : (
                          <div className="text-xs text-white/35">Wygeneruj kartę, aby zobaczyć tagi.</div>
                        )}
                      </div>
                    </div>
                  </div>
              </div>
            </section>

            <SectionDivider label="Osobowość & Motywacja" />

            <section className="col-span-1 lg:col-span-2 card-neural iiy-hover-panel p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">Matryca HEXACO</div>
                {!raw.HEXACO ? <span className="badge">Zablokowane</span> : null}
              </div>

              {raw.HEXACO ? (
                <>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 iiy-hover-panel">
                    <HexacoRadarChart percentiles={raw.HEXACO?.percentile_scores ?? {}} showFrame={false} showHeader={false} />
                  </div>

                  <div className="mt-6">
                    <HexacoDetailCards
                      percentiles={raw.HEXACO?.percentile_scores ?? {}}
                      compact={false}
                      columns={2}
                      showEnglishName={false}
                      showDescription={false}
                      extraContent={(id) => {
                        const interp = (llmContent?.hexaco_interpretations as any)?.[id] as string | undefined;
                        const pct = clamp(
                          Math.round(Number((raw.HEXACO?.percentile_scores ?? {})?.[id] ?? 0)),
                          0,
                          100,
                        );
                        const lvl = levelLabelPl(pct);
                        if (llmLoading) return <Skeleton className="h-4 w-full" />;
                        return (
                          <div className="space-y-2">
                            <div className="text-[11px] text-white/45">
                              Poziom: <span className="text-white/70 font-semibold">{lvl}</span>
                            </div>
                            {interp && !llmError ? (
                              <div className="text-xs italic text-purple-200/70">✦ {interp}</div>
                            ) : null}
                          </div>
                        );
                      }}
                    />
                  </div>
                </>
              ) : (
                <a href="/user-profile-tests.html" className="mt-4 block bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/55 hover:border-brand-primary/30 transition no-underline iiy-hover-panel">
                  Ukończ test HEXACO, aby odblokować ten kafel →
                </a>
              )}
            </section>

            <section className="col-span-1 lg:col-span-1 card-neural iiy-hover-panel p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">Silnik motywacji — Enneagram</div>
                {!raw.ENNEAGRAM ? <span className="badge">Zablokowane</span> : null}
              </div>

              {raw.ENNEAGRAM && ennN ? (
                <>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 iiy-hover-panel">
                    <div className="w-full max-w-[280px] mx-auto text-brand-secondary">
                      <EnnStar active={ennN} scores={ennScores} />
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 iiy-hover-panel">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="mt-1 text-base font-bold text-white/85">{enneagramLabel}</div>
                        {enneagramMotto ? (
                          <div className="mt-0.5 text-[12px] text-white/45 italic">“{enneagramMotto}”</div>
                        ) : null}
                      </div>
                      {wingNum ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-semibold" style={{ color: '#d946ef', background: 'rgba(217,70,239,.1)', borderColor: 'rgba(217,70,239,.3)' }}>
                          🪶 Skrzydło {wingNum}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="iiy-cs-enn-type-badge">{ennN}</div>
                      <div className="text-[11px] text-white/45">Typ dominujący</div>
                    </div>
                  </div>

                  {enneagramTritype.length === 3 ? (
                    <div className="mt-4 rounded-xl p-4 border border-white/10 bg-white/5 iiy-hover-panel">
                      <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">Tritype</div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {enneagramTritype.map((t) => {
                          const isPrimary = t === ennN
                          const label = ENNEAGRAM_META[t]?.name ?? `Typ ${t}`
                          return (
                            <div
                              key={t}
                              className={
                                isPrimary
                                  ? 'rounded-xl border border-brand-secondary/30 bg-brand-secondary/10 p-3 text-center iiy-hover-panel'
                                  : 'rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center iiy-hover-panel'
                              }
                            >
                              <div className={isPrimary ? 'text-2xl font-extrabold leading-none text-brand-secondary' : 'text-2xl font-extrabold leading-none text-white/70'}>
                                {t}
                              </div>
                              <div className="mt-1 text-[11px] text-white/55 truncate">{label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl p-4 border border-amber-400/20 bg-amber-500/10 iiy-hover-panel">
                      <div className="text-[10px] tracking-[2px] font-mono text-amber-200/70 uppercase">⚡ Motywacja</div>
                      <div className="mt-2 text-xs text-white/65 leading-relaxed">{ennN ? ENNEAGRAM_META[ennN]?.motivation : ''}</div>
                    </div>
                    <div className="rounded-xl p-4 border border-rose-400/20 bg-rose-500/10 iiy-hover-panel">
                      <div className="text-[10px] tracking-[2px] font-mono text-rose-200/70 uppercase">⚠ Lęki</div>
                      <div className="mt-2 text-xs text-white/65 leading-relaxed">{ennN ? ENNEAGRAM_META[ennN]?.fear : ''}</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl p-4 border border-white/10 bg-white/5 iiy-hover-panel">
                    <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">✦ Analiza</div>
                    {llmLoading ? (
                      <div className="mt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6 mt-2" /></div>
                    ) : llmContent?.enneagram_motivation_text && !llmError ? (
                      <div className="mt-2 text-sm text-white/70 leading-relaxed">{llmContent.enneagram_motivation_text}</div>
                    ) : (
                      <div className="mt-2 text-sm text-white/45">{llmError ?? 'Brak Analizy'}</div>
                    )}
                  </div>
                </>
              ) : (
                <a href="/user-profile-tests.html" className="mt-4 block bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/55 hover:border-brand-secondary/30 transition no-underline iiy-hover-panel">
                  Ukończ test Enneagram, aby odblokować ten kafel →
                </a>
              )}
            </section>

            <SectionDivider label="Kariera i Wartości" />

            <section className="col-span-1 card-neural iiy-hover-panel p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">Top Talenty</div>
                {!raw.STRENGTHS ? <span className="badge">Zablokowane</span> : null}
              </div>
              {raw.STRENGTHS ? (
                <>
                  <div className="mt-4 space-y-2">
                    {(top5 ?? []).slice(0, 5).map((t: any, idx: number) => {
                      const domain = STRENGTHS_DOMAIN[String(t?.category ?? '')] ?? { label: String(t?.category ?? 'Talent'), className: 'bg-white/5 border-white/10 text-white/55' };
                      const name = String(t?.name ?? t?.name_en ?? `Talent ${idx + 1}`);
                      const rankColors = ['#a78bfa', '#818cf8', '#60a5fa', '#34d399', '#94a3b8'];
                      const rankColor = rankColors[idx] ?? '#94a3b8';
                      return (
                        <div
                          key={`${name}-${idx}`}
                          className="flex items-center gap-3 rounded-xl border bg-white/[0.03] px-3 py-2.5 iiy-hover-panel"
                          style={{ borderColor: idx === 0 ? `${rankColor}40` : 'rgba(255,255,255,0.07)' }}
                        >
                          <span
                            className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-extrabold"
                            style={{
                              background: `${rankColor}1a`,
                              border: `1px solid ${rankColor}45`,
                              color: rankColor,
                              ...(idx === 0 ? { boxShadow: `0 0 10px -2px ${rankColor}60` } : {}),
                            }}
                          >{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate" style={{ color: idx === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.65)' }}>{name}</div>
                          </div>
                          <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold ${domain.className}`}>{domain.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* AI for top talent */}
                  <div className="mt-4 rounded-xl p-4 border border-white/10 bg-white/5 iiy-hover-panel">
                    <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">✦ Analiza · Talent #1</div>
                    {llmLoading ? (
                      <div className="mt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4 mt-2" /></div>
                    ) : llmContent?.strengths_top1_interpretation && !llmError ? (
                      <div className="mt-2 text-sm text-white/70 leading-relaxed italic">{llmContent.strengths_top1_interpretation}</div>
                    ) : (
                      <div className="mt-2 text-sm text-white/45">{llmError ?? 'Brak Analizy'}</div>
                    )}
                  </div>
                </>
              ) : (
                <a href="/user-profile-tests.html" className="mt-4 block bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/55 hover:border-emerald-400/30 transition no-underline iiy-hover-panel">
                  Ukończ test Strengths, aby odblokować ten kafel →
                </a>
              )}
            </section>

            <section className="col-span-1 card-neural iiy-hover-panel p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">Profil Kariery RIASEC</div>
                {!raw.CAREER ? <span className="badge">Zablokowane</span> : null}
              </div>

              {raw.CAREER ? (
                <>
                  {/* Holland code */}
                  <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                    {String(holland || '---').slice(0, 3).split('').map((ch, idx) => {
                      const meta = Object.values(RIASEC_META).find((m) => m.letter === ch.toUpperCase());
                      return (
                        <span
                          key={`${ch}-${idx}`}
                          className="rounded-xl border font-extrabold"
                          style={{
                            padding: idx === 0 ? '6px 14px' : '4px 10px',
                            fontSize: idx === 0 ? 20 : 15,
                            color: meta?.hexColor ?? 'rgba(255,255,255,0.7)',
                            background: `${meta?.hexColor ?? '#fff'}18`,
                            borderColor: `${meta?.hexColor ?? '#fff'}40`,
                            ...(idx === 0 ? { boxShadow: `0 0 14px -2px ${meta?.hexColor ?? '#fff'}60` } : {}),
                          }}
                        >{ch.toUpperCase()}</span>
                      );
                    })}
                    <span className="ml-1 text-[9px] font-mono text-white/25 uppercase tracking-widest">Kod Hollanda</span>
                  </div>

                  {/* Full-width bars */}
                  <div className="mt-4 space-y-3">
                    {riasecScores.items.map((it) => {
                      const meta = RIASEC_META[it.id] ?? { namePl: it.id, letter: '?', hexColor: '#94a3b8', colorClass: 'text-white/60', name: it.id };
                      const pct = riasecScores.max > 0 ? clamp(Math.round((it.v / riasecScores.max) * 100), 0, 100) : 0;
                      const isTop = String(holland).toUpperCase().slice(0, 3).includes(meta.letter);
                      return (
                        <div key={it.id}>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-extrabold w-5 text-center" style={{ color: isTop ? meta.hexColor : 'rgba(255,255,255,0.25)' }}>{meta.letter}</span>
                              <span className="text-sm" style={{ color: isTop ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.35)' }}>{meta.namePl}</span>
                            </div>
                            <span className="text-sm font-mono font-bold" style={{ color: isTop ? meta.hexColor : 'rgba(255,255,255,0.25)' }}>
                              {it.v ? it.v.toFixed(1) : '—'}
                            </span>
                          </div>
                          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${meta.hexColor}cc, ${meta.hexColor}88)`, opacity: isTop ? 1 : 0.28,
                                ...(isTop ? { boxShadow: `0 0 8px 1px ${meta.hexColor}55` } : {}) }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI */}
                  <div className="mt-6 rounded-xl p-4 border border-white/10 bg-white/5 iiy-hover-panel">
                    <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">✦ Analiza · Środowisko</div>
                    {llmLoading ? (
                      <div className="mt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5 mt-2" /></div>
                    ) : llmContent?.riasec_environment_text && !llmError ? (
                      <div className="mt-2 text-sm text-white/70 leading-relaxed italic">{llmContent.riasec_environment_text}</div>
                    ) : (
                      <div className="mt-2 text-sm text-white/45">{llmError ?? 'Brak Analizy'}</div>
                    )}
                  </div>
                </>
              ) : (
                <a href="/user-profile-tests.html" className="mt-4 block bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/55 hover:border-emerald-400/30 transition no-underline iiy-hover-panel">
                  Ukończ test Career, aby odblokować ten kafel →
                </a>
              )}
            </section>

            <section className="col-span-1 card-neural iiy-hover-panel p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">Wartości Fundamentalne</div>
                {!raw.VALUES ? <span className="badge">Zablokowane</span> : null}
              </div>

              {raw.VALUES ? (
                <>
                  {/* Schwartz circumflex radar */}
                  <div className="mt-3 max-w-[210px] mx-auto">
                    <ValuesCircumplexChart scores={valuesScoreMap} topN={3} />
                  </div>

                  {/* Top 3 values */}
                  <div className="mt-3 space-y-2">
                    {schwartzTop3.map((v: any, idx: number) => {
                      const id = String(v?.id ?? '');
                      const schwartzDef = SCHWARTZ_CIRCUMPLEX.find((s) => s.id === id);
                      const score = Number(v?.raw_score ?? v?.score ?? 0);
                      return (
                        <div key={`${id}-${idx}`} className="flex items-center gap-3 rounded-xl border bg-white/[0.03] px-3 py-2 iiy-hover-panel"
                          style={{ borderColor: `${schwartzDef?.color ?? '#7c3aed'}35` }}>
                          <span className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-extrabold"
                            style={{ background: `${schwartzDef?.color ?? '#7c3aed'}20`, border: `1px solid ${schwartzDef?.color ?? '#7c3aed'}45`, color: schwartzDef?.color ?? '#c4b5fd' }}>
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white/80 truncate">{v?.name ?? v?.value_name ?? String(v)}</div>
                          </div>
                          {Number.isFinite(score) && score > 0 ? (
                            <span className="text-[12px] font-mono font-bold flex-shrink-0"
                              style={{ color: schwartzDef?.color ?? '#c4b5fd' }}>{score.toFixed(1)}</span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {/* AI */}
                  <div className="mt-4 rounded-xl p-4 border border-white/10 bg-white/5 iiy-hover-panel">
                    <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">✦ Analiza · Wartości</div>
                    {llmLoading ? (
                      <div className="mt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3 mt-2" /></div>
                    ) : llmContent?.schwartz_values_text && !llmError ? (
                      <div className="mt-2 text-sm text-white/70 leading-relaxed italic">{llmContent.schwartz_values_text}</div>
                    ) : (
                      <div className="mt-2 text-sm text-white/45">{llmError ?? 'Brak Analizy'}</div>
                    )}
                  </div>
                </>
              ) : (
                <a href="/user-profile-tests.html" className="mt-4 block bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/55 hover:border-rose-400/30 transition no-underline iiy-hover-panel">
                  Ukończ test Values, aby odblokować ten kafel →
                </a>
              )}
            </section>

            <SectionDivider label="Synteza" />

            {/* Col 1 – Zawody dla Ciebie */}
            <section className="col-span-1 card-neural iiy-hover-panel p-4 sm:p-6 flex flex-col border-t-[1.5px] border-t-emerald-400/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-emerald-400/60 text-[11px] leading-none">◈</span>
                <div className="text-[10px] tracking-[2px] font-mono text-emerald-300/55 uppercase">Zawody dla Ciebie</div>
              </div>
              {llmLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : llmContent?.ideal_careers?.length && !llmError ? (
                <div className="space-y-2">
                  {llmContent.ideal_careers.slice(0, 5).map((c, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-xl border border-emerald-400/10 bg-emerald-500/[0.04] px-3 py-3 transition-all duration-200 hover:border-emerald-400/25 hover:bg-emerald-500/[0.08] hover:-translate-y-px hover:shadow-[0_0_22px_-8px_rgba(52,211,153,0.28)]">
                      <span className="text-lg flex-shrink-0 leading-none mt-0.5">{c.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white/85 leading-snug">{c.title}</div>
                        <div className="mt-0.5 text-xs text-white/40 leading-relaxed">{c.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/45">{llmError ?? 'Brak Analizy – wymaga regeneracji karty'}</div>
              )}
            </section>

            {/* Col 2 – Twoje Alter Ego */}
            <section className="col-span-1 card-neural iiy-hover-panel p-4 sm:p-6 flex flex-col border-t-[1.5px] border-t-violet-400/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-violet-400/60 text-[11px] leading-none">◈</span>
                <div className="text-[10px] tracking-[2px] font-mono text-violet-300/55 uppercase">Twoje Alter Ego</div>
              </div>
              <div className="mb-4 text-[11px] text-white/25">Fikcyjne postacie z podobnym DNA osobowości</div>
              {llmLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : llmContent?.popculture?.length && !llmError ? (
                <div className="space-y-2">
                  {llmContent.popculture.slice(0, 5).map((p, idx) => (
                    <div key={`${p.name}-${idx}`} className="rounded-xl border border-violet-400/15 bg-violet-500/[0.04] px-3 py-3 transition-all duration-200 hover:border-violet-400/30 hover:bg-violet-500/[0.09] hover:-translate-y-px hover:shadow-[0_0_22px_-8px_rgba(139,92,246,0.32)]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-bold text-white/85 leading-snug">{p.name}</div>
                        <span className="shrink-0 text-[9px] font-mono text-violet-300/65 uppercase tracking-wider bg-violet-500/15 border border-violet-400/25 rounded-md px-1.5 py-0.5">{p.context}</span>
                      </div>
                      <div className="mt-1 text-xs text-white/45 leading-relaxed italic">{p.reason}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/45">{llmError ?? 'Brak Analizy'}</div>
              )}
            </section>

            {/* Col 3 – Kim naprawdę jesteś */}
            <section className="col-span-1 card-neural iiy-hover-panel p-4 sm:p-6 flex flex-col border-t-[1.5px] border-t-sky-400/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sky-400/60 text-[11px] leading-none">◈</span>
                <div className="text-[10px] tracking-[2px] font-mono text-sky-300/55 uppercase">Kim jesteś naprawdę</div>
              </div>
              {llmLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24" /><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-16" />
                </div>
              ) : llmContent && !llmError ? (
                <div className="space-y-3">
                  {([
                    { label: 'Esencja', key: 'portrait_essence', accent: 'text-violet-300/70', border: 'border-violet-400/15', bg: 'bg-violet-500/[0.04]', hb: 'hover:border-violet-400/30 hover:bg-violet-500/[0.09]', glow: 'hover:shadow-[0_0_18px_-8px_rgba(139,92,246,0.3)]' },
                    { label: 'Środowisko naturalne', key: 'portrait_environment', accent: 'text-sky-300/70', border: 'border-sky-400/15', bg: 'bg-sky-500/[0.04]', hb: 'hover:border-sky-400/30 hover:bg-sky-500/[0.09]', glow: 'hover:shadow-[0_0_18px_-8px_rgba(56,189,248,0.3)]' },
                    { label: 'Supermoce', key: 'portrait_superpowers', accent: 'text-emerald-300/70', border: 'border-emerald-400/15', bg: 'bg-emerald-500/[0.04]', hb: 'hover:border-emerald-400/30 hover:bg-emerald-500/[0.09]', glow: 'hover:shadow-[0_0_18px_-8px_rgba(52,211,153,0.3)]' },
                    { label: 'Ślepe punkty', key: 'portrait_blindspots', accent: 'text-amber-300/70', border: 'border-amber-400/15', bg: 'bg-amber-500/[0.04]', hb: 'hover:border-amber-400/30 hover:bg-amber-500/[0.09]', glow: 'hover:shadow-[0_0_18px_-8px_rgba(251,191,36,0.25)]' },
                  ] as const).map((b) => (
                    <div key={b.key} className={`rounded-xl border ${b.border} ${b.bg} ${b.hb} ${b.glow} p-4 transition-all duration-200 hover:-translate-y-px`}>
                      <div className={`text-[10px] tracking-[2px] font-mono uppercase ${b.accent}`}>{b.label}</div>
                      <div className="mt-2 text-sm text-white/70 leading-relaxed">{(llmContent as any)[b.key]}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/45">{llmError ?? 'Brak Analizy'}</div>
              )}
            </section>

            {/* ── Row 2: Why / Energy Boosters / Energy Drainers ── */}

            {/* Col 1 – Twoje „Dlaczego" */}
            <section className="col-span-1 card-neural iiy-hover-panel p-4 sm:p-6 flex flex-col border-t-[1.5px] border-t-amber-400/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-400/60 text-[11px] leading-none">◈</span>
                <div className="text-[10px] tracking-[2px] font-mono text-amber-300/55 uppercase">Twoje „Dlaczego" (Why)</div>
              </div>
              <div className="mb-4 text-[11px] text-white/25">Głęboka wewnętrzna motywacja i sens działania</div>
              {llmLoading ? (
                <div className="space-y-2"><Skeleton className="h-8" /><Skeleton className="h-8" /><Skeleton className="h-8" /></div>
              ) : llmContent?.energy_why && !llmError ? (
                <div className="relative rounded-xl border border-amber-400/20 bg-amber-500/[0.05] p-4 flex-1
                                shadow-[0_0_40px_-14px_rgba(251,191,36,0.22)]
                                transition-all duration-200 hover:border-amber-400/38 hover:shadow-[0_0_54px_-10px_rgba(251,191,36,0.34)]
                                hover:-translate-y-px">
                  <div className="absolute -inset-px rounded-xl pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.14), transparent 65%)' }} />
                  <p className="relative text-sm text-white/75 leading-relaxed">{llmContent.energy_why}</p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/45">{llmError ?? 'Brak Analizy – wymaga regeneracji karty'}</div>
              )}
            </section>

            {/* Col 2 – Co daje Ci energię */}
            <section className="col-span-1 card-neural iiy-hover-panel p-4 sm:p-6 flex flex-col border-t-[1.5px] border-t-emerald-400/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-emerald-400/60 text-[11px] leading-none">◈</span>
                <div className="text-[10px] tracking-[2px] font-mono text-emerald-300/55 uppercase">Co daje Ci energię</div>
              </div>
              <div className="mb-4 text-[11px] text-white/25">Aktywności, które ładują Twoje baterie</div>
              {llmLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
              ) : llmContent?.energy_boosters?.length && !llmError ? (
                <div className="space-y-2">
                  {llmContent.energy_boosters.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-xl border border-emerald-400/15 bg-emerald-500/[0.04] px-3 py-2.5
                                              transition-all duration-200 hover:border-emerald-400/32 hover:bg-emerald-500/[0.09]
                                              hover:-translate-y-px hover:shadow-[0_0_18px_-8px_rgba(52,211,153,0.32)]">
                      <span className="text-emerald-400 text-sm font-bold leading-none flex-shrink-0">＋</span>
                      <span className="text-sm text-white/75 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/45">{llmError ?? 'Brak Analizy – wymaga regeneracji karty'}</div>
              )}
            </section>

            {/* Col 3 – Co drenuje Twoją energię */}
            <section className="col-span-1 card-neural iiy-hover-panel p-4 sm:p-6 flex flex-col border-t-[1.5px] border-t-rose-400/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-rose-400/60 text-[11px] leading-none">◈</span>
                <div className="text-[10px] tracking-[2px] font-mono text-rose-300/55 uppercase">Co drenuje Twoją energię</div>
              </div>
              <div className="mb-4 text-[11px] text-white/25">Aktywności, które Cię wykańczają</div>
              {llmLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
              ) : llmContent?.energy_drainers?.length && !llmError ? (
                <div className="space-y-2">
                  {llmContent.energy_drainers.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-xl border border-rose-400/15 bg-rose-500/[0.04] px-3 py-2.5
                                              transition-all duration-200 hover:border-rose-400/32 hover:bg-rose-500/[0.08]
                                              hover:-translate-y-px hover:shadow-[0_0_18px_-8px_rgba(244,63,94,0.3)]">
                      <span className="text-rose-400 text-sm font-bold leading-none flex-shrink-0">−</span>
                      <span className="text-sm text-white/75 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/45">{llmError ?? 'Brak Analizy – wymaga regeneracji karty'}</div>
              )}
            </section>

            <SectionDivider label="Strefa Cienia" tone="danger" />

            <section className="col-span-1 lg:col-span-3 card-neural iiy-hover-panel p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] tracking-[2px] font-mono text-rose-200/60 uppercase">Ciemna Strona Mocy</div>
                {!raw.DARK_TRIAD ? <span className="badge">Zablokowane</span> : null}
              </div>

              {raw.DARK_TRIAD ? (
                <>
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {([
                      { key: 'narcissism', base: 'Narcyzm', reframe: 'Siła Własnego Ja' },
                      { key: 'machiavellianism', base: 'Makiawelizm', reframe: 'Myślenie Strategiczne' },
                      { key: 'psychopathy', base: 'Psychopatia', reframe: 'Zimna Głowa pod Presją' },
                    ] as const).map((d) => {
                      const score = Number((dtDims as any)?.[d.key]?.raw_score ?? 0)
                      const pct = score > 0 ? clamp(Math.round(((score - 1) / 4) * 100), 0, 100) : 0
                      const tier = score >= 4.0 ? 'high' : score >= 3.0 ? 'mid' : score > 0 ? 'low' : 'na'
                      const badge = tier === 'high' ? '⚠ Ryzyko' : tier === 'mid' ? '⚠ Uwaga' : tier === 'low' ? '✓ Balans' : '—'
                      const badgeCls =
                        tier === 'high'
                          ? 'bg-rose-500/15 border-rose-400/25 text-rose-200'
                          : tier === 'mid'
                            ? 'bg-amber-500/15 border-amber-400/25 text-amber-200'
                            : 'bg-emerald-500/15 border-emerald-400/25 text-emerald-200'

                      const reframing =
                        tier === 'high'
                          ? 'Wysoka intensywność: uważaj na koszty społeczne i długofalowe.'
                          : tier === 'mid'
                            ? 'Średni poziom: narzędzie, które może ciąć w obie strony.'
                            : tier === 'low'
                              ? 'Niski poziom: rzadko przejmuje stery, zwykle wspiera stabilność.'
                              : ''

                      return (
                        <div key={d.key} className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 iiy-hover-panel">
                          <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">{d.base}</div>
                          <div className="mt-1 text-sm text-white/65">{d.reframe}</div>
                          <div className="mt-3 flex items-end justify-between gap-3">
                            <div className="text-3xl font-extrabold text-rose-200/80">{score ? score.toFixed(2) : '—'}</div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold ${badgeCls}`}>{badge}</span>
                          </div>
                          <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-rose-400/50" style={{ width: `${pct}%` }} />
                          </div>
                          {reframing ? <div className="mt-3 text-xs text-white/55">{reframing}</div> : null}
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-5 rounded-2xl p-5 border iiy-hover-panel" style={{ background: 'rgba(244,63,94,.06)', borderColor: 'rgba(244,63,94,.18)' }}>
                    <div className="text-[10px] tracking-[2px] font-mono text-rose-200/60 uppercase">✦ Analiza · Synteza Cienia</div>
                    {llmLoading ? (
                      <div className="mt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6 mt-2" /></div>
                    ) : llmContent?.darktriad_synthesis && !llmError ? (
                      <div className="mt-2 text-sm text-white/70 leading-relaxed">{llmContent.darktriad_synthesis}</div>
                    ) : (
                      <div className="mt-2 text-sm text-white/45">{llmError ?? 'Brak Analizy'}</div>
                    )}
                  </div>
                </>
              ) : (
                <a href="/user-profile-tests.html" className="mt-4 block bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/55 hover:border-rose-400/30 transition no-underline iiy-hover-panel">
                  Ukończ test Dark Triad, aby odblokować ten kafel →
                </a>
              )}
            </section>
          </div>

      </main>

      {!isPublic && !demoMode ? <CharacterChatBubble profileContext={JSON.stringify(characterCardInput)} /> : null}

      {/* Footer */}
      {!demoMode && <footer className="border-t border-white/5 bg-black/30 backdrop-blur-xl mt-16">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <span className="font-bold text-lg text-white tracking-tight block mb-2">Alcheme</span>
              <p className="text-slate-500 text-sm leading-relaxed">Naukowa diagnoza potencjału w formie przystępnej grywalizacji.</p>
              <a href="mailto:hello@alcheme.io" className="inline-block mt-4 text-sm text-cyan-400/80 hover:text-cyan-300 transition">hello@alcheme.io</a>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Metodologia</h4>
              <ul className="space-y-1.5 text-slate-500 text-sm">
                {[['HEXACO & Big Five', '/methodology#hexaco'], ['Enneagram RHETI', '/methodology#enneagram'], ['O*NET Database', '/methodology#career'], ['Dark Triad SD3', '/methodology#darktriad']].map(([l, href]) => (
                  <li key={l}><a href={href} className="hover:text-indigo-400 transition">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Projekt</h4>
              <ul className="space-y-1.5 text-slate-500 text-sm">
                {[['Cennik', '/pricing'], ['Metodologia', '/methodology'], ['Testy', '/user-profile-tests'], ['Karta Postaci', '/character']].map(([l, href]) => (
                  <li key={l}><a href={href} className="hover:text-indigo-400 transition">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Legal</h4>
              <ul className="space-y-1.5 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition">Polityka Prywatności</a></li>
                <li><a href="/regulamin.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition">Regulamin</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">RODO</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Alcheme. All rights reserved. Disclaimer: To narzędzie rozwojowe, nie diagnoza kliniczna.
          </div>
        </div>
      </footer>}
    </div>
  );
}