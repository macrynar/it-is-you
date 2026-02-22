/**
 * Schwartz Values Circumplex (decagonal radar)
 * Custom SVG – neuro-glass style, 10-point circumplex model
 * Traditional order (clockwise from top): UN, BE, CO, TR, SE, PO, AC, HE, ST, SD
 */

export const SCHWARTZ_CIRCUMPLEX = [
  { id: 'universalism',  short: 'UN', label: 'Uniwersalizm',   color: '#14b8a6' },
  { id: 'benevolence',   short: 'BE', label: 'Życzliwość',     color: '#10b981' },
  { id: 'conformity',    short: 'CO', label: 'Konformizm',     color: '#64748b' },
  { id: 'tradition',     short: 'TR', label: 'Tradycja',       color: '#78716c' },
  { id: 'security',      short: 'SE', label: 'Bezpiecz.',      color: '#06b6d4' },
  { id: 'power',         short: 'PO', label: 'Władza',         color: '#8b5cf6' },
  { id: 'achievement',   short: 'AC', label: 'Osiągnięcia',    color: '#eab308' },
  { id: 'hedonism',      short: 'HE', label: 'Hedonizm',       color: '#f97316' },
  { id: 'stimulation',   short: 'ST', label: 'Stymulacja',     color: '#ec4899' },
  { id: 'self_direction',short: 'SD', label: 'Samokier.',      color: '#3b82f6' },
] as const;

const N = 10;
const CX = 140;
const CY = 140;
const MAX_R = 90;

function pt(i: number, pct: number): [number, number] {
  const angle = ((i * (360 / N) - 90) * Math.PI) / 180;
  const r = (pct / 100) * MAX_R;
  return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
}

function ringPts(pct: number) {
  return SCHWARTZ_CIRCUMPLEX.map((_, i) => pt(i, pct).join(',')).join(' ');
}

const LABEL_DIST = MAX_R + 26;
const LABEL_ANCHORS = SCHWARTZ_CIRCUMPLEX.map((_, i) => {
  const angle = ((i * 36 - 90) * Math.PI) / 180;
  const x = CX + LABEL_DIST * Math.cos(angle);
  const y = CY + LABEL_DIST * Math.sin(angle);
  // anchor based on horizontal position
  const anchor: 'end' | 'start' | 'middle' = x < CX - 8 ? 'end' : x > CX + 8 ? 'start' : 'middle';
  return { x, y, anchor };
});

export default function ValuesCircumplexChart({
  scores,       // { self_direction: 5.4, universalism: 4.9, … }
  topN = 3,
}: {
  scores: Record<string, number>;
  topN?: number;
}) {
  // sort by score desc → top N ids
  const sorted = [...SCHWARTZ_CIRCUMPLEX]
    .map((d) => ({ ...d, v: Number(scores[d.id] ?? 0) }))
    .sort((a, b) => b.v - a.v);

  const topIds = new Set(sorted.slice(0, topN).map((d) => d.id));

  const vals = SCHWARTZ_CIRCUMPLEX.map((d, i) => ({
    ...d,
    v: Number(scores[d.id] ?? 0),
    pct: Number(scores[d.id] ?? 0) > 0 ? Math.min(100, (Number(scores[d.id] ?? 0) / 6) * 100) : 0,
    isTop: topIds.has(d.id),
    idx: i,
  }));

  const userPts = vals.map((d, i) => pt(i, d.pct).join(',')).join(' ');

  const topColor = sorted[0]?.color ?? '#14b8a6';

  return (
    <svg viewBox="0 0 280 280" width="100%" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="val-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={topColor} stopOpacity="0.45" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.25" />
        </linearGradient>
        <filter id="val-glow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Reference rings */}
      {[25, 50, 75, 100].map((pct) => (
        <polygon
          key={pct}
          points={ringPts(pct)}
          fill="none"
          stroke={pct === 50 ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.05)'}
          strokeWidth={pct === 50 ? 1 : 0.6}
        />
      ))}

      {/* Axis lines */}
      {SCHWARTZ_CIRCUMPLEX.map((_, i) => {
        const [x, y] = pt(i, 100);
        return (
          <line
            key={i}
            x1={CX} y1={CY}
            x2={x} y2={y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={0.7}
          />
        );
      })}

      {/* User profile fill */}
      <polygon
        points={userPts}
        fill="url(#val-fill)"
        stroke={topColor}
        strokeWidth={1.6}
        strokeOpacity={0.85}
        filter="url(#val-glow)"
      />

      {/* Vertex dots */}
      {vals.map((d, i) => {
        const [x, y] = pt(i, d.pct);
        return (
          <circle
            key={d.id}
            cx={x} cy={y}
            r={d.isTop ? 4 : 2.5}
            fill={d.isTop ? d.color : 'rgba(255,255,255,0.3)'}
            style={d.isTop ? { filter: `drop-shadow(0 0 4px ${d.color})` } : undefined}
          />
        );
      })}

      {/* Labels */}
      {vals.map((d, i) => {
        const { x, y, anchor } = LABEL_ANCHORS[i];
        return (
          <text
            key={d.id}
            x={x} y={y + 4}
            textAnchor={anchor}
            fontSize={d.isTop ? 12 : 10}
            fontWeight={d.isTop ? 800 : 500}
            fontFamily="'Space Grotesk', sans-serif"
            fill={d.isTop ? d.color : 'rgba(255,255,255,0.3)'}
            style={d.isTop ? { filter: `drop-shadow(0 0 5px ${d.color})` } : undefined}
          >
            {d.short}
          </text>
        );
      })}

      {/* Center "TOP N" badge */}
      <circle cx={CX} cy={CY} r={22} fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.8} />
      <text x={CX} y={CY - 4} textAnchor="middle" fontSize={8} fontFamily="'Inter', sans-serif"
        fill="rgba(255,255,255,0.35)" fontWeight={700} letterSpacing="1">TOP</text>
      <text x={CX} y={CY + 11} textAnchor="middle" fontSize={16} fontFamily="'Space Grotesk', sans-serif"
        fill={topColor} fontWeight={900}
        style={{ filter: `drop-shadow(0 0 8px ${topColor})` }}
      >{topN}</text>
    </svg>
  );
}
