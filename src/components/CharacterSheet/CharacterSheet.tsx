import { useEffect, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, Sparkles, AlertTriangle, Zap } from 'lucide-react';
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
            fontSize="34" fontWeight="900" fill={color}
            style={{ fontFamily: 'Orbitron, monospace', filter: `drop-shadow(0 0 14px ${color})` }}>
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

/* ─── SHARED CARD ────────────────────────────────────────────────────────────── */

function Card({
  children, style = {}, accent, warning,
}: {
  children: React.ReactNode; style?: React.CSSProperties;
  accent?: string; warning?: boolean;
}) {
  const base: React.CSSProperties = {
    background: warning ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.025)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: warning
      ? '1px solid rgba(239,68,68,0.28)'
      : `1px solid ${accent ? `${accent}20` : 'rgba(255,255,255,0.07)'}`,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };
  if (accent && !warning) {
    (base as any).boxShadow = `inset 0 1px 0 ${accent}14, 0 0 0 1px ${accent}07`;
  }
  if (warning) {
    (base as any).boxShadow = 'inset 0 1px 0 rgba(239,68,68,0.1), 0 0 20px rgba(239,68,68,0.04)';
  }
  return (
    <div style={base}>
      {accent && !warning && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg,transparent,${accent}50,transparent)`,
          pointerEvents: 'none',
        }} />
      )}
      {children}
    </div>
  );
}

function TileLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 2.5,
      color: color ?? 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function LockedTile({ icon, text, href, color }: {
  icon: React.ReactNode; text: string; href: string; color: string;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 0' }}>
      <div style={{ color: `${color}55`, opacity: 0.6 }}>{icon}</div>
      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 1.5, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>{text}</div>
      <a href={href} style={{ padding: '5px 14px', borderRadius: 6, border: `1px solid ${color}30`, background: `${color}09`, fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 600, color: `${color}99`, textDecoration: 'none' }}>
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
    <div style={{ minHeight: '100vh', background: '#030014', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes _cs_spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(112,0,255,.25)', borderTopColor: '#7000ff', animation: '_cs_spin .8s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'rgba(255,255,255,0.35)', fontSize: 13, letterSpacing: 2 }}>ŁADOWANIE...</div>
      </div>
    </div>
  );

  /* ─── RENDER ─────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: '#030014', backgroundImage: 'radial-gradient(circle at 50% 0%,#1a0b4e 0%,transparent 55%),radial-gradient(circle at 90% 10%,#0d1a3a 0%,transparent 40%)', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Space+Grotesk:wght@500;700&display=swap');
        *{box-sizing:border-box}
        .cs-radar .recharts-polar-grid line,
        .cs-radar .recharts-polar-grid polygon{stroke:rgba(0,240,255,0.07)!important}
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(3,0,20,0.88)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(112,0,255,0.1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Wróć
          </a>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 700, color: 'rgba(112,0,255,0.5)', letterSpacing: 2, textTransform: 'uppercase' }}>
            Karta Postaci · {completedCount}/6 Testów
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {([raw.hexaco, raw.enneagram, raw.strengths, raw.career, raw.darkTriad, raw.values] as any[]).map((r, i) => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: r ? '#7000ff' : 'rgba(255,255,255,0.1)', boxShadow: r ? '0 0 6px #7000ff' : 'none', transition: 'all .3s' }} />
            ))}
          </div>
        </div>
      </nav>

      {/* BENTO GRID */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 60px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>

        {/* T1: HERO CORE — col-span-2, row-span-2 */}
        <Card accent="#7000ff" style={{ gridColumn: 'span 2', gridRow: 'span 2', minHeight: 320, display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(112,0,255,0.13) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <TileLabel color="rgba(112,0,255,0.45)">// PROFIL GŁÓWNY · HERO CORE</TileLabel>

          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flex: 1 }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 96, height: 96, borderRadius: '50%', padding: 2, background: 'linear-gradient(135deg,#7000ff,#d946ef,#00f0ff)', boxShadow: '0 0 24px rgba(112,0,255,0.45)' }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#150830', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#7000ff', fontFamily: 'Space Grotesk, sans-serif' }}>{initials}</div>
                }
              </div>
              <div style={{ position: 'absolute', bottom: 2, right: 2, width: 15, height: 15, borderRadius: '50%', background: completedCount >= 4 ? '#34d399' : '#f97316', border: '2px solid #030014', boxShadow: `0 0 6px ${completedCount >= 4 ? '#34d399' : '#f97316'}` }} />
            </div>

            {/* Identity */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 2, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userName.toUpperCase()}
              </div>
              {ennLore ? (
                <>
                  <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, fontWeight: 900, color: '#7000ff', textShadow: '0 0 20px rgba(112,0,255,0.6)', marginBottom: 3, lineHeight: 1.3 }}>
                    {ennLore.rpg}
                  </div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
                    &ldquo;{ennLore.epithet}&rdquo;
                  </div>
                </>
              ) : (
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color: 'rgba(255,255,255,0.18)', letterSpacing: 2, marginBottom: 10 }}>ARCHETYP NIEZDEFINIOWANY</div>
              )}

              {hollandCode && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.18)', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, letterSpacing: 2, color: 'rgba(0,240,255,0.55)' }}>RIASEC</span>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, fontWeight: 700, color: '#00f0ff', letterSpacing: 3 }}>{hollandCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pop culture chips */}
          {ennLore && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.18)', marginBottom: 8 }}>🎬 POSTACIE PODOBNE DO CIEBIE</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ennLore.pop.map((p, i) => (
                  <div key={p} style={{ padding: '4px 12px', borderRadius: 20, background: i === 0 ? 'rgba(112,0,255,0.14)' : 'rgba(255,255,255,0.04)', border: i === 0 ? '1px solid rgba(112,0,255,0.38)' : '1px solid rgba(255,255,255,0.07)', fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 600, color: i === 0 ? '#c4b5fd' : 'rgba(255,255,255,0.45)' }}>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* XP Progress */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.18)' }}>PROFIL XP</span>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: '#7000ff' }}>{completedCount}/6</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(completedCount / 6) * 100}%`, background: 'linear-gradient(90deg,#7000ff,#d946ef)', boxShadow: '0 0 8px rgba(112,0,255,0.7)', transition: 'width .8s ease', borderRadius: 2 }} />
            </div>
          </div>
        </Card>

        {/* T2: HEXACO RADAR — col-span-1, row-span-2 */}
        <Card accent="#00f0ff" style={{ gridColumn: 'span 1', gridRow: 'span 2', minHeight: 280, display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: -30, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,240,255,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <TileLabel color="rgba(0,240,255,0.4)">// MATRYCA OSOBOWOŚCI · HEXACO</TileLabel>
          {raw.hexaco ? (
            <>
              <div style={{ flex: 1, minHeight: 0, marginBottom: 4 }} className="cs-radar">
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 22, bottom: 10, left: 22 }}>
                    <PolarGrid stroke="rgba(0,240,255,0.07)" gridType="polygon" />
                    <PolarAngleAxis dataKey="trait" tick={{ fill: 'rgba(0,240,255,0.4)', fontSize: 8, fontFamily: 'Share Tech Mono, monospace' }} tickLine={false} />
                    <Radar dataKey="value" stroke="#22d3ee" strokeWidth={2} fill="#22d3ee" fillOpacity={0.1} dot={{ fill: '#22d3ee', r: 3, strokeWidth: 0 } as any} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {hexTopDim && (
                <div style={{ textAlign: 'center', paddingTop: 4 }}>
                  <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 26, fontWeight: 900, color: '#00f0ff', textShadow: '0 0 16px rgba(0,240,255,0.65)', lineHeight: 1 }}>{hexTopDim.value}%</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'rgba(0,240,255,0.38)', letterSpacing: 2, marginTop: 3 }}>{hexTopDim.full.toUpperCase()}</div>
                </div>
              )}
            </>
          ) : (
            <LockedTile icon={<Zap size={22} />} text="Wykonaj test HEXACO-60" href="/test?type=hexaco" color="#00f0ff" />
          )}
        </Card>

        {/* T3: ENNEAGRAM STAR — col-span-1, row-span-2 */}
        <Card accent="#d946ef" style={{ gridColumn: 'span 1', gridRow: 'span 2', minHeight: 280, display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle,rgba(217,70,239,0.09) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <TileLabel color="rgba(217,70,239,0.4)">// ENGINE · ENNEAGRAM</TileLabel>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 200, aspectRatio: '1' }}>
              <EnneagramStar activeType={ennTypeNum} color="#d946ef" />
            </div>
          </div>
          {ennPrimary && (
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: 700, color: '#e879f9' }}>{ennPrimary.name}</div>
              {ennPrimary.core_motivation && (
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'rgba(217,70,239,0.38)', letterSpacing: 1.5, marginTop: 3 }}>{ennPrimary.core_motivation}</div>
              )}
            </div>
          )}
          {!raw.enneagram && (
            <LockedTile icon={<span style={{ fontSize: 20 }}>★</span>} text="Wykonaj test Enneagram" href="/test?type=enneagram" color="#d946ef" />
          )}
        </Card>

        {/* T4: STRENGTHS ARSENAL — col-span-2 */}
        <Card accent="#fbbf24" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
          <TileLabel color="rgba(251,191,36,0.4)">// ARSENAL · TOP TALENTY</TileLabel>
          {top5.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {top5.slice(0, 4).map((t: any, i: number) => {
                const barW = 96 - i * 10;
                return (
                  <div key={t.name ?? t.name_en ?? i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: 'rgba(251,191,36,0.45)', minWidth: 20, textAlign: 'right' }}>0{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 600, color: i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.65)', marginBottom: 4 }}>{t.name ?? t.name_en}</div>
                      <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${barW}%`, background: i === 0 ? 'linear-gradient(90deg,#f97316,#fbbf24)' : 'rgba(251,191,36,0.3)', boxShadow: i === 0 ? '0 0 8px rgba(251,191,36,0.5)' : 'none', transition: 'width 1s ease', borderRadius: 2 }} />
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'rgba(251,191,36,0.38)', minWidth: 28, textAlign: 'right' }}>{barW}%</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <LockedTile icon={<span style={{ fontSize: 20 }}>⭐</span>} text="Wykonaj test Strengths" href="/test?type=strengths" color="#fbbf24" />
          )}
        </Card>

        {/* T5: DARK TRIAD — col-span-2 */}
        <Card warning style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: '50%', background: 'radial-gradient(circle,rgba(239,68,68,0.09) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={12} style={{ color: 'rgba(239,68,68,0.65)' }} />
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 2, color: 'rgba(239,68,68,0.45)', textTransform: 'uppercase' }}>// WYKRYTE RYZYKA · DARK TRIAD</span>
          </div>
          {raw.darkTriad && dtTop ? (
            <>
              <div style={{ padding: '12px 14px', borderRadius: 10, background: `${dtTop.color}0a`, border: `1px solid ${dtTop.color}20`, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 700, color: dtTop.color }}>{dtTop.name}</div>
                  <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 22, fontWeight: 900, color: dtTop.color, textShadow: `0 0 14px ${dtTop.color}70`, lineHeight: 1 }}>{dtTop.pct}%</div>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${dtTop.pct}%`, background: `linear-gradient(90deg,${dtTop.color}80,${dtTop.color})`, boxShadow: `0 0 8px ${dtTop.color}55`, transition: 'width 1s', borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {dtTraits.slice(1).map(t => (
                  <div key={t.k} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: 1 }}>{t.name}</div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 16, fontWeight: 700, color: t.color, marginTop: 2 }}>{t.pct}%</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <LockedTile icon={<AlertTriangle size={20} />} text="Odblokuj test Dark Triad" href="/test?type=dark_triad" color="#ef4444" />
          )}
        </Card>

        {/* T6: AI SYNTHESIS — full width */}
        <Card accent="#7000ff" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 10, background: 'rgba(112,0,255,0.13)', border: '1px solid rgba(112,0,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={17} style={{ color: '#a855f7' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, fontWeight: 700, color: '#a855f7', letterSpacing: 1 }}>PSYCHER AI SYNTHESIS</span>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg,rgba(112,0,255,0.28),transparent)' }} />
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: 0 }}>
              {buildAiSummary()}
            </p>
          </div>
        </Card>

      </div>
    </div>
  );
}
