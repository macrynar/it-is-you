/**
 * RIASEC Hexagonal Radar Chart
 * Custom SVG – neuro-glass style matching the HEXACO radar
 */

const RIASEC_DIMS = [
  { id: 'investigative', short: 'I', label: 'Badawczy',       color: '#38b6ff' },
  { id: 'artistic',      short: 'A', label: 'Artystyczny',    color: '#e878e0' },
  { id: 'social',        short: 'S', label: 'Społeczny',      color: '#10b981' },
  { id: 'enterprising',  short: 'E', label: 'Przedsięb.',     color: '#fbbf24' },
  { id: 'realistic',     short: 'R', label: 'Praktyczny',     color: '#f87171' },
  { id: 'conventional',  short: 'C', label: 'Konwencjon.',    color: '#94a3b8' },
] as const;

const N = 6;
const CX = 130;
const CY = 130;
const MAX_R = 88;

/** Returns polar point [x, y] for dimension i at given percentage */
function pt(i: number, pct: number): [number, number] {
  const angle = ((i * (360 / N) - 90) * Math.PI) / 180;
  const r = (pct / 100) * MAX_R;
  return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
}

function ringPts(pct: number) {
  return RIASEC_DIMS.map((_, i) => pt(i, pct).join(',')).join(' ');
}

const LABEL_DIST = MAX_R + 28;
const labelAnchors = RIASEC_DIMS.map((_, i) => {
  const angle = ((i * 60 - 90) * Math.PI) / 180;
  return {
    x: CX + LABEL_DIST * Math.cos(angle),
    y: CY + LABEL_DIST * Math.sin(angle),
    anchor: ((i === 0 || i === 3) ? 'middle' : i < 3 ? 'start' : 'end') as 'middle' | 'start' | 'end',
  };
});

export default function RiasecRadarChart({
  scores,      // { investigative: 4.4, artistic: 4.0, … }  max score scale (default 6)
  maxScale = 6,
  hollandCode = '',
}: {
  scores: Record<string, number>;
  maxScale?: number;
  hollandCode?: string;
}) {
  const vals = RIASEC_DIMS.map((d) => ({
    ...d,
    v: Number(scores[d.id] ?? 0),
    pct: maxScale > 0 ? (Number(scores[d.id] ?? 0) / maxScale) * 100 : 0,
  }));

  const topLetters = hollandCode.slice(0, 3).toUpperCase().split('');

  /** Polygon points for the user profile */
  const userPts = vals.map((d, i) => pt(i, d.pct).join(',')).join(' ');

  /** Primary color: first Holland letter dimension color */
  const primaryColor = vals.sort((a, b) => b.v - a.v)[0]?.color ?? '#38b6ff';
  // re-sort to original order for rendering
  const valsOrdered = RIASEC_DIMS.map((d) => {
    const found = vals.find((x) => x.id === d.id)!;
    return found;
  });

  return (
    <svg viewBox="0 0 260 260" width="100%" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="riasec-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.55" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
        </linearGradient>
        <filter id="riasec-glow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Reference rings */}
      {[25, 50, 75, 100].map((pct) => (
        <polygon
          key={pct}
          points={ringPts(pct)}
          fill="none"
          stroke={pct === 50 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}
          strokeWidth={pct === 50 ? 1 : 0.7}
        />
      ))}

      {/* Axis lines */}
      {RIASEC_DIMS.map((_, i) => {
        const [x, y] = pt(i, 100);
        return (
          <line
            key={i}
            x1={CX} y1={CY}
            x2={x} y2={y}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={0.8}
          />
        );
      })}

      {/* User profile fill */}
      <polygon
        key="user"
        points={userPts}
        fill="url(#riasec-fill)"
        stroke={primaryColor}
        strokeWidth={1.8}
        strokeOpacity={0.9}
        filter="url(#riasec-glow)"
      />

      {/* Vertex dots */}
      {valsOrdered.map((d, i) => {
        const [x, y] = pt(i, d.pct);
        return (
          <circle key={d.id} cx={x} cy={y} r={3.5} fill={d.color}
            style={{ filter: `drop-shadow(0 0 4px ${d.color})` }} />
        );
      })}

      {/* Labels */}
      {RIASEC_DIMS.map((d, i) => {
        const { x, y, anchor } = labelAnchors[i];
        const isInHolland = topLetters.includes(d.short);
        const vd = valsOrdered[i];
        return (
          <g key={d.id}>
            <text
              x={x} y={y - 5}
              textAnchor={anchor}
              fontSize={isInHolland ? 13 : 11}
              fontWeight={isInHolland ? 800 : 500}
              fontFamily="'Space Grotesk', sans-serif"
              fill={isInHolland ? d.color : 'rgba(255,255,255,0.35)'}
              style={isInHolland ? { filter: `drop-shadow(0 0 5px ${d.color})` } : undefined}
            >
              {d.short}
            </text>
            <text
              x={x} y={y + 9}
              textAnchor={anchor}
              fontSize={8.5}
              fontFamily="'Inter', sans-serif"
              fill={isInHolland ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)'}
            >
              {vd.v ? vd.v.toFixed(1) : ''}
            </text>
          </g>
        );
      })}

      {/* Center dot */}
      <circle cx={CX} cy={CY} r={3} fill="rgba(255,255,255,0.15)" />
    </svg>
  );
}
