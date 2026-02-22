import { useEffect, useMemo, useState } from 'react';
import { supabase, getAccessToken, SUPABASE_ANON_KEY } from '../../lib/supabaseClient.js';
import { generateCareerReport, generateValuesReport } from '../../utils/scoring.js';
import HexacoRadarChart from '../Test/modules/HexacoRadarChart';
import HexacoDetailCards from '../Test/modules/HexacoDetailCards';
import CharacterChatBubble from './CharacterChatBubble';
import { getUserPremiumStatus, type UserPremiumStatus } from '../../lib/stripeService';

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
  darktriad_synthesis: string;
  popculture: Array<{ context: string; name: string; reason: string }>;
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

const ENNEAGRAM_META: Record<number, { name: string; mottoEn: string; stress: string; growth: string }> = {
  1: { name: 'Reformista', mottoEn: 'The Reformer', stress: 'Pod presją: sztywność, krytycyzm, napięcie na „powinno”.', growth: 'W rozwoju: elastyczność, mądry standard zamiast perfekcjonizmu.' },
  2: { name: 'Pomocnik', mottoEn: 'The Helper', stress: 'Pod presją: nadopiekuńczość, ukryte oczekiwania, rozczarowanie.', growth: 'W rozwoju: zdrowe granice i proszenie o wsparcie wprost.' },
  3: { name: 'Osiągacz', mottoEn: 'The Achiever', stress: 'Pod presją: praca w trybie „wynik albo nic”, utrata kontaktu z sobą.', growth: 'W rozwoju: autentyczność, spokój i cele zgodne z wartościami.' },
  4: { name: 'Indywidualista', mottoEn: 'The Individualist', stress: 'Pod presją: porównywanie, dramatyzacja, poczucie braku.', growth: 'W rozwoju: ugruntowanie i działanie mimo nastroju.' },
  5: { name: 'Badacz', mottoEn: 'The Investigator', stress: 'Pod presją: wycofanie, nadmierna analiza, odcięcie od potrzeb.', growth: 'W rozwoju: kontakt, dzielenie się i ucieleśnione działanie.' },
  6: { name: 'Lojalista', mottoEn: 'The Loyalist', stress: 'Pod presją: czarny scenariusz, testowanie lojalności, napięcie.', growth: 'W rozwoju: zaufanie do siebie i odwaga w niepewności.' },
  7: { name: 'Entuzjasta', mottoEn: 'The Enthusiast', stress: 'Pod presją: ucieczka w bodźce, rozproszenie, unikanie ciężaru.', growth: 'W rozwoju: głębia, konsekwencja i wybór jednej rzeczy naraz.' },
  8: { name: 'Wyzywacz', mottoEn: 'The Challenger', stress: 'Pod presją: kontrola, ostrość, „siła albo słabość”.', growth: 'W rozwoju: ochrona bez dominacji i siła z empatią.' },
  9: { name: 'Mediator', mottoEn: 'The Peacemaker', stress: 'Pod presją: zamrożenie, prokrastynacja, znikanie z konfliktu.', growth: 'W rozwoju: priorytety, obecność i zdrowa asertywność.' },
};

const RIASEC_META: Record<string, { name: string; letter: string; colorClass: string }> = {
  realistic: { name: 'Realistic', letter: 'R', colorClass: 'text-rose-300' },
  investigative: { name: 'Investigative', letter: 'I', colorClass: 'text-sky-300' },
  artistic: { name: 'Artistic', letter: 'A', colorClass: 'text-fuchsia-300' },
  social: { name: 'Social', letter: 'S', colorClass: 'text-emerald-300' },
  enterprising: { name: 'Enterprising', letter: 'E', colorClass: 'text-amber-300' },
  conventional: { name: 'Conventional', letter: 'C', colorClass: 'text-slate-300' },
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
    <div className="col-span-3 flex items-center gap-3 mt-2">
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

/* ══ MAIN ══ */
type CharacterSheetProps = {
  publicToken?: string;
};

export default function CharacterSheet({ publicToken }: CharacterSheetProps) {
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

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = (typeof window !== 'undefined' ? window.localStorage.getItem('theme') : null) ?? 'dark';
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    (async () => {
      setLoading(true);

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
    }));
    const style = (llmContent?.tags_style ?? []).map((text) => ({
      text: String(text),
      className: 'iiy-cs-t-violet',
      tip: 'Style tag',
    }));
    const values = (llmContent?.tags_values ?? []).map((text) => ({
      text: String(text),
      className: 'iiy-cs-t-amber',
      tip: 'Values tag',
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
  const enneagramStress = ennN ? ENNEAGRAM_META[ennN]?.stress : '';
  const enneagramGrowth = ennN ? ENNEAGRAM_META[ennN]?.growth : '';

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

  const riasecScores = useMemo(() => {
    const typeScores = careerRep?.type_scores ?? careerRep?.typeScores ?? careerRep?.type_scores_map ?? null;
    const m = (typeScores && typeof typeScores === 'object') ? typeScores : {};

    const map: Record<string, number> = {
      realistic: Number(m.realistic ?? m.R ?? 0),
      investigative: Number(m.investigative ?? m.I ?? 0),
      artistic: Number(m.artistic ?? m.A ?? 0),
      social: Number(m.social ?? m.S ?? 0),
      enterprising: Number(m.enterprising ?? m.E ?? 0),
      conventional: Number(m.conventional ?? m.C ?? 0),
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
      setLlmError('Interpretacje AI chwilowo niedostępne');
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
    <div className="min-h-screen bg-bg-main text-text-main bg-neural-gradient bg-fixed">
      {/* TOP NAV (like user-profile-tests.html) */}
      {!isPublic ? (
      <nav className="border-b border-white/5 bg-bg-surface/80 backdrop-blur-xl sticky top-0 z-50 nav-neural">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <a href="/" className="iiy-logo">
              <div className="iiy-signet">
                <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="iiy-hg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38b6ff" /><stop offset="50%" stopColor="#7b5ea7" /><stop offset="100%" stopColor="#38b6ff" /></linearGradient>
                    <linearGradient id="iiy-bg2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#38b6ff" stopOpacity="0.45" /><stop offset="100%" stopColor="#1a1d4a" stopOpacity="0.08" /></linearGradient>
                    <filter id="iiy-glow2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    <clipPath id="iiy-clip2"><polygon points="48,5 87,27 87,69 48,91 9,69 9,27" /></clipPath>
                  </defs>
                  <polygon points="48,5 87,27 87,69 48,91 9,69 9,27" fill="#11143a" />
                  <g className="iiy-ring-ticks" filter="url(#iiy-glow2)">
                    <line x1="48" y1="5" x2="48" y2="12" stroke="#38b6ff" strokeWidth="1.8" /><line x1="87" y1="27" x2="81" y2="30" stroke="#38b6ff" strokeWidth="1.8" /><line x1="87" y1="69" x2="81" y2="66" stroke="#38b6ff" strokeWidth="1.8" /><line x1="48" y1="91" x2="48" y2="84" stroke="#38b6ff" strokeWidth="1.8" /><line x1="9" y1="69" x2="15" y2="66" stroke="#38b6ff" strokeWidth="1.8" /><line x1="9" y1="27" x2="15" y2="30" stroke="#38b6ff" strokeWidth="1.8" />
                    <line x1="68" y1="8" x2="66" y2="12" stroke="#7b5ea7" strokeWidth="1" opacity="0.6" /><line x1="28" y1="8" x2="30" y2="12" stroke="#7b5ea7" strokeWidth="1" opacity="0.6" /><line x1="90" y1="48" x2="84" y2="48" stroke="#7b5ea7" strokeWidth="1" opacity="0.6" /><line x1="6" y1="48" x2="12" y2="48" stroke="#7b5ea7" strokeWidth="1" opacity="0.6" /><line x1="68" y1="88" x2="66" y2="84" stroke="#7b5ea7" strokeWidth="1" opacity="0.6" /><line x1="28" y1="88" x2="30" y2="84" stroke="#7b5ea7" strokeWidth="1" opacity="0.6" />
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

            {/* Center tabs */}
            <div className="iiy-nav-tabs">
              <a className="iiy-tab-btn" href="/user-profile-tests.html">🧪 Testy</a>
              <a className="iiy-tab-btn active" href="/character">🃏 Karta Postaci</a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
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

              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }}
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
      ) : null}

      <main className="max-w-7xl mx-auto px-6 py-10">
        {isPublic ? (
          <div className="card-neural iiy-hover-panel p-6 mb-6">
            <div className="text-sm text-white/70">To jest publiczny podgląd karty postaci.</div>
            <a href="/auth" className="mt-4 inline-flex items-center gap-2 btn-neural no-underline">Stwórz swoją kartę postaci →</a>
          </div>
        ) : null}

        {!isPublic && done < 6 ? (
          <div className="card-neural iiy-hover-panel p-6 mb-6">
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
                                {llmContent ? (llmContent.archetype_subtitle ?? '') : (llmError ?? 'Interpretacje AI chwilowo niedostępne')}
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
                                <span className="iiy-cs-ai-chip">AI</span>
                              </>
                            ) : (
                              <>Wygeneruj kartę, aby zobaczyć opis.<span className="iiy-cs-ai-chip">AI</span></>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Segment 4: Actions */}
                      <div className="iiy-cs-s-actions">
                        {isPublic ? (
                          <a href="/auth" className="iiy-cs-btn iiy-cs-btn-primary no-underline" style={{ textDecoration: 'none' }}>
                            Stwórz swoją kartę
                          </a>
                        ) : (
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
                              title={done < 6 ? 'Ukończ wszystkie testy, aby odświeżyć kartę' : 'Odśwież kartę (AI)'}
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

            <section className="col-span-1 lg:col-span-2 card-neural iiy-hover-panel p-6">
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
                      showEnglishName
                      showDescription
                      descriptionLang="en"
                      extraContent={(id) => {
                        const interp = (llmContent?.hexaco_interpretations as any)?.[id] as string | undefined;
                        const pct = clamp(
                          Math.round(Number((raw.HEXACO?.percentile_scores ?? {})?.[id] ?? 0)),
                          0,
                          100,
                        );
                        const lvl = levelLabelEn(pct);
                        if (llmLoading) return <Skeleton className="h-4 w-full" />;
                        return (
                          <div className="space-y-2">
                            <div className="text-[11px] text-white/45">
                              Level: <span className="text-white/70 font-semibold">{lvl}</span>
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

            <section className="col-span-1 lg:col-span-1 card-neural iiy-hover-panel p-6">
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
                    <div className="rounded-xl p-4 border border-rose-400/20 bg-rose-500/10 iiy-hover-panel">
                      <div className="text-[10px] tracking-[2px] font-mono text-rose-200/70 uppercase">W stresie</div>
                      <div className="mt-2 text-xs text-white/65 leading-relaxed">{enneagramStress}</div>
                    </div>
                    <div className="rounded-xl p-4 border border-emerald-400/20 bg-emerald-500/10 iiy-hover-panel">
                      <div className="text-[10px] tracking-[2px] font-mono text-emerald-200/70 uppercase">W rozwoju</div>
                      <div className="mt-2 text-xs text-white/65 leading-relaxed">{enneagramGrowth}</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl p-4 border border-white/10 bg-white/5 iiy-hover-panel">
                    <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">✦ AI</div>
                    {llmLoading ? (
                      <div className="mt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6 mt-2" /></div>
                    ) : llmContent?.enneagram_motivation_text && !llmError ? (
                      <div className="mt-2 text-sm text-white/70 leading-relaxed">{llmContent.enneagram_motivation_text}</div>
                    ) : (
                      <div className="mt-2 text-sm text-white/45">{llmError ?? 'Brak treści AI'}</div>
                    )}
                  </div>
                </>
              ) : (
                <a href="/user-profile-tests.html" className="mt-4 block bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/55 hover:border-brand-secondary/30 transition no-underline iiy-hover-panel">
                  Ukończ test Enneagram, aby odblokować ten kafel →
                </a>
              )}
            </section>

            <SectionDivider label="Arsenal & Kariera" />

            <section className="col-span-1 card-neural iiy-hover-panel p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">Top Talenty</div>
                {!raw.STRENGTHS ? <span className="badge">Zablokowane</span> : null}
              </div>
              {raw.STRENGTHS ? (
                <div className="mt-4 space-y-3">
                  {(top5 ?? []).slice(0, 5).map((t: any, idx: number) => {
                    const domain = STRENGTHS_DOMAIN[String(t?.category ?? '')] ?? { label: String(t?.category ?? 'Talent'), className: 'bg-white/5 border-white/10 text-white/55' }
                    const name = String(t?.name ?? t?.name_en ?? `Talent ${idx + 1}`)
                    return (
                      <div key={`${name}-${idx}`} className="rounded-xl border border-white/10 bg-white/5 p-3 iiy-hover-panel">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="text-xl font-extrabold text-white/25 leading-none">{idx + 1}</div>
                              <div className="text-sm font-semibold text-white/80 truncate">{name}</div>
                            </div>
                          </div>
                          <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold ${domain.className}`}>{domain.label}</span>
                        </div>
                        {idx === 0 ? (
                          <div className="mt-2 text-xs italic text-purple-200/70">
                            {llmLoading ? (
                              <Skeleton className="h-4 w-full" />
                            ) : llmContent?.strengths_top1_interpretation && !llmError ? (
                              <>✦ {llmContent.strengths_top1_interpretation}</>
                            ) : llmError ? (
                              <span className="text-white/35">{llmError}</span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <a href="/user-profile-tests.html" className="mt-4 block bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/55 hover:border-emerald-400/30 transition no-underline iiy-hover-panel">
                  Ukończ test Strengths, aby odblokować ten kafel →
                </a>
              )}
            </section>

            <section className="col-span-1 card-neural iiy-hover-panel p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">Profil Kariery RIASEC</div>
                {!raw.CAREER ? <span className="badge">Zablokowane</span> : null}
              </div>

              {raw.CAREER ? (
                <>
                  <div className="mt-4 flex items-center gap-2">
                    {String(holland || '---').slice(0, 3).split('').map((ch, idx) => (
                      <span
                        key={`${ch}-${idx}`}
                        className={
                          idx === 0
                            ? 'px-3 py-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-200 font-extrabold text-xl'
                            : 'px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/70 font-bold'
                        }
                      >
                        {ch.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 space-y-3">
                    {riasecScores.items.map((it) => {
                      const meta = RIASEC_META[it.id] ?? { name: it.id, letter: '?', colorClass: 'text-white/60' }
                      const pct = riasecScores.max > 0 ? clamp(Math.round((it.v / riasecScores.max) * 100), 0, 100) : 0
                      return (
                        <div key={it.id} className="flex items-center gap-3">
                          <div className={`w-10 text-sm font-extrabold ${meta.colorClass}`}>{meta.letter}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <div className="text-xs text-white/70 truncate">{meta.name} ({meta.letter})</div>
                              <div className="text-xs text-white/35 font-mono">{it.v ? it.v.toFixed(2) : '—'}</div>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full rounded-full bg-emerald-400/60" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-4 rounded-xl p-4 border border-white/10 bg-white/5 iiy-hover-panel">
                    <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">✦ AI</div>
                    {llmLoading ? (
                      <div className="mt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5 mt-2" /></div>
                    ) : llmContent?.riasec_environment_text && !llmError ? (
                      <div className="mt-2 text-sm text-white/70 leading-relaxed">{llmContent.riasec_environment_text}</div>
                    ) : (
                      <div className="mt-2 text-sm text-white/45">{llmError ?? 'Brak treści AI'}</div>
                    )}
                  </div>
                </>
              ) : (
                <a href="/user-profile-tests.html" className="mt-4 block bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/55 hover:border-emerald-400/30 transition no-underline iiy-hover-panel">
                  Ukończ test Career, aby odblokować ten kafel →
                </a>
              )}
            </section>

            <section className="col-span-1 card-neural iiy-hover-panel p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">Wartości Fundamentalne</div>
                {!raw.VALUES ? <span className="badge">Zablokowane</span> : null}
              </div>

              {raw.VALUES ? (
                <>
                  <div className="mt-4 space-y-3">
                    {schwartzTop3.map((v: any, idx: number) => (
                      <div key={`${v?.id ?? v?.name ?? idx}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 iiy-hover-panel">
                        <span className="w-7 h-7 rounded-full inline-flex items-center justify-center text-[12px] font-extrabold" style={{ background: 'rgba(244,63,94,.18)', border: '1px solid rgba(244,63,94,.28)', color: 'rgba(255,200,200,.9)' }}>{idx + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-white/80 truncate">{v?.name ?? v?.value_name ?? String(v)}</div>
                          <div className="text-[11px] text-white/35 font-mono">{Number.isFinite(Number(v?.raw_score)) ? `${Number(v.raw_score).toFixed(1)}/6` : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl p-4 border border-white/10 bg-white/5 iiy-hover-panel">
                    <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">✦ AI</div>
                    {llmLoading ? (
                      <div className="mt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3 mt-2" /></div>
                    ) : llmContent?.schwartz_values_text && !llmError ? (
                      <div className="mt-2 text-sm text-white/70 leading-relaxed">{llmContent.schwartz_values_text}</div>
                    ) : (
                      <div className="mt-2 text-sm text-white/45">{llmError ?? 'Brak treści AI'}</div>
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

            <section className="col-span-1 lg:col-span-2 card-neural iiy-hover-panel p-6">
              <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">Kim jesteś naprawdę</div>
              {llmLoading ? (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              ) : llmContent && !llmError ? (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { label: 'Esencja', key: 'portrait_essence' },
                    { label: 'Środowisko naturalne', key: 'portrait_environment' },
                    { label: 'Twoje supermoce', key: 'portrait_superpowers' },
                    { label: 'Ślepe punkty', key: 'portrait_blindspots' },
                  ] as const).map((b) => (
                    <div key={b.key} className="rounded-xl border border-white/10 bg-white/5 p-4 iiy-hover-panel">
                      <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">{b.label}</div>
                      <div className="mt-2 text-sm text-white/70 leading-relaxed">{(llmContent as any)[b.key]}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/45 iiy-hover-panel">{llmError ?? 'Brak treści AI'}</div>
              )}
            </section>

            <section className="col-span-1 lg:col-span-1 card-neural iiy-hover-panel p-6">
              <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">Twoje Alter Ego</div>
              {llmLoading ? (
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : llmContent?.popculture?.length && !llmError ? (
                <div className="mt-4 space-y-3">
                  {llmContent.popculture.slice(0, 3).map((p, idx) => (
                    <div key={`${p.name}-${idx}`} className="rounded-xl border border-white/10 bg-white/5 p-4 iiy-hover-panel">
                      <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">{p.context}</div>
                      <div className="mt-1 text-sm font-semibold text-white/80">{p.name}</div>
                      <div className="mt-2 text-xs text-white/60 leading-relaxed">{p.reason}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/45 iiy-hover-panel">{llmError ?? 'Brak treści AI'}</div>
              )}
            </section>

            <SectionDivider label="Strefa Cienia" tone="danger" />

            <section className="col-span-1 lg:col-span-3 card-neural iiy-hover-panel p-6">
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
                    <div className="text-[10px] tracking-[2px] font-mono text-rose-200/60 uppercase">✦ AI · Synteza Cienia</div>
                    {llmLoading ? (
                      <div className="mt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6 mt-2" /></div>
                    ) : llmContent?.darktriad_synthesis && !llmError ? (
                      <div className="mt-2 text-sm text-white/70 leading-relaxed">{llmContent.darktriad_synthesis}</div>
                    ) : (
                      <div className="mt-2 text-sm text-white/45">{llmError ?? 'Brak treści AI'}</div>
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

      {!isPublic ? <CharacterChatBubble profileContext={JSON.stringify(characterCardInput)} /> : null}
    </div>
  );
}
