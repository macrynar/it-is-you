import React, { useMemo } from 'react';

const DIM_ORDER = [
  'honesty_humility',
  'emotionality',
  'extraversion',
  'agreeableness',
  'conscientiousness',
  'openness',
] as const;

type DimId = (typeof DIM_ORDER)[number];

const DIM_EMOJI: Record<DimId, string> = {
  honesty_humility: '⚖️',
  emotionality: '💜',
  extraversion: '💬',
  agreeableness: '🤝',
  conscientiousness: '📋',
  openness: '✨',
};

const DIM_LABEL: Record<DimId, string> = {
  honesty_humility: 'Honesty',
  emotionality: 'Emocjonalność',
  extraversion: 'Ekstrawersja',
  agreeableness: 'Ugodowość',
  conscientiousness: 'Sumienność',
  openness: 'Otwartość',
};

const CX = 210;
const CY = 210;
const MAX_R = 155;

function pt(i: number, pct: number) {
  const a = ((i * 60 - 90) * Math.PI) / 180;
  const r = (pct / 100) * MAX_R;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
}

function ringPts(pct: number) {
  return DIM_ORDER.map((_, i) => pt(i, pct).join(',')).join(' ');
}

const labelAnchors: Array<{ id: DimId; lx: number; ly: number }> = [
  { id: 'honesty_humility', lx: 210, ly: 33 },
  { id: 'emotionality', lx: 376, ly: 100 },
  { id: 'extraversion', lx: 376, ly: 320 },
  { id: 'agreeableness', lx: 210, ly: 390 },
  { id: 'conscientiousness', lx: 44, ly: 320 },
  { id: 'openness', lx: 44, ly: 100 },
];

export default function HexacoRadarChart({
  percentiles,
  showFrame = true,
  showHeader = true,
}: {
  percentiles: Record<string, number>;
  showFrame?: boolean;
  showHeader?: boolean;
}) {
  const shapePts = useMemo(() => {
    return DIM_ORDER
      .map((id, i) => pt(i, Number(percentiles?.[id] ?? 0)).join(','))
      .join(' ');
  }, [percentiles]);

  const content = (
    <div className="flex justify-center">
      <svg viewBox="0 0 420 420" style={{ width: '100%', maxWidth: 420, height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="iiy-hexaco-rg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38b6ff" stopOpacity=".35" />
              <stop offset="100%" stopColor="#7b5ea7" stopOpacity=".25" />
            </linearGradient>
          </defs>

          {[20, 40, 60, 80, 100].map((p) => (
            <polygon key={p} points={ringPts(p)} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1" />
          ))}

          {DIM_ORDER.map((_, i) => {
            const [ex, ey] = pt(i, 100);
            return (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={ex}
                y2={ey}
                stroke="rgba(255,255,255,.1)"
                strokeWidth="1"
              />
            );
          })}

          <polygon
            points={shapePts}
            fill="url(#iiy-hexaco-rg)"
            stroke="#38b6ff"
            strokeWidth="2"
            style={{ filter: 'drop-shadow(0 0 12px rgba(56,182,255,.45))' }}
          />

          {DIM_ORDER.map((id, i) => {
            const [px, py] = pt(i, Number(percentiles?.[id] ?? 0));
            return (
              <circle
                key={id}
                cx={px}
                cy={py}
                r="4"
                fill="#38b6ff"
                style={{ filter: 'drop-shadow(0 0 6px #38b6ff)' }}
              />
            );
          })}

          {labelAnchors.map(({ id, lx, ly }) => {
            const txt = `${DIM_EMOJI[id]} ${DIM_LABEL[id]}`;
            const w = Math.max(txt.length * 7.2 + 16, 82);
            return (
              <g key={id}>
                <rect
                  x={lx - w / 2}
                  y={ly - 12}
                  width={w}
                  height={23}
                  rx="11"
                  fill="rgba(13,15,43,.85)"
                  stroke="rgba(255,255,255,.12)"
                  strokeWidth="1"
                />
                <text
                  x={lx}
                  y={ly + 4}
                  textAnchor="middle"
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    fill: 'rgba(255,255,255,.75)',
                  }}
                >
                  {txt}
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );

  if (!showFrame) return content;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
      {showHeader && (
        <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase mb-3 flex items-center gap-3">
          <span>Mapa osobowości</span>
          <span className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(56,182,255,.2),transparent)' }} />
        </div>
      )}
      {content}
    </div>
  );
}
