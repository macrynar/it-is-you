import React from 'react';

const RIASEC: Record<
  string,
  {
    color: string;
    glow: string;
  }
> = {
  realistic: { color: '#ef4444', glow: 'rgba(239,68,68,.5)' },
  investigative: { color: '#0ea5e9', glow: 'rgba(14,165,233,.5)' },
  artistic: { color: '#d946ef', glow: 'rgba(217,70,239,.5)' },
  social: { color: '#10b981', glow: 'rgba(16,185,129,.5)' },
  enterprising: { color: '#f59e0b', glow: 'rgba(245,158,11,.5)' },
  conventional: { color: '#94a3b8', glow: 'rgba(148,163,184,.4)' },
};

const RIASEC_EMOJI: Record<string, string> = {
  realistic: '🔧',
  investigative: '🔬',
  artistic: '🎨',
  social: '🤝',
  enterprising: '📢',
  conventional: '📋',
};

const getR = (id: string) => RIASEC[id] || RIASEC.conventional;

export default function CareerHollandMiniCards({
  report,
}: {
  report: any;
}) {
  const top3: any[] = report?.top_3 ?? [];
  if (!top3.length) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {top3.slice(0, 3).map((interest: any, idx: number) => {
        const r = getR(String(interest.id ?? 'conventional'));
        return (
          <div
            key={interest.id ?? idx}
            className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl relative overflow-hidden"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08), 0 8px 32px -4px rgba(0,0,0,.55)' }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                width: 110,
                height: 110,
                borderRadius: '50%',
                filter: 'blur(45px)',
                bottom: -45,
                right: -35,
                background: r.color,
                opacity: 0.14,
                pointerEvents: 'none',
              }}
            />

            <div className="p-3 relative">
              <div className="flex items-start justify-between gap-2">
                <span className="text-lg" aria-hidden>
                  {RIASEC_EMOJI[String(interest.id)] ?? '💼'}
                </span>
                <span
                  className="text-[11px] font-mono px-2 py-0.5 rounded-full border"
                  style={{ color: r.color, borderColor: `${r.color}40`, background: `${r.color}14` }}
                >
                  #{idx + 1}
                </span>
              </div>

              <div
                className="mt-1 text-3xl font-extrabold leading-none text-center"
                style={{ color: r.color, textShadow: `0 0 18px ${r.color}60` }}
              >
                {String(interest.letter ?? '').toUpperCase() || '—'}
              </div>

              <div className="mt-2 text-[11px] font-semibold text-white/80 text-center truncate">
                {interest.name ?? '—'}
              </div>

              <div className="mt-2 text-center">
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{ color: r.color, background: `${r.color}18`, borderColor: `${r.color}35` }}
                >
                  {Number.isFinite(Number(interest.score)) ? Number(interest.score).toFixed(1) : '—'} / 5.0
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
