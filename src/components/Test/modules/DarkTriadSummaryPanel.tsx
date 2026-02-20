import React from 'react';

const DT_ACCENT: Record<
  string,
  {
    plName: string;
    nameEn: string;
    emoji: string;
    color: string;
    miniFill: string;
    miniFillShadow: string;
  }
> = {
  psychopathy: {
    plName: 'Psychopatia',
    nameEn: 'Psychopathy',
    emoji: '⚡',
    color: '#e8001c',
    miniFill: 'linear-gradient(90deg,#6b0012,#ff2d55)',
    miniFillShadow: '0 0 8px rgba(255,45,85,.55)',
  },
  machiavellianism: {
    plName: 'Makiawelizm',
    nameEn: 'Machiavellianism',
    emoji: '🎭',
    color: '#ff6230',
    miniFill: 'linear-gradient(90deg,#7a1a00,#ff6230)',
    miniFillShadow: '0 0 8px rgba(255,98,48,.55)',
  },
  narcissism: {
    plName: 'Narcyzm',
    nameEn: 'Narcissism',
    emoji: '👑',
    color: '#ffaa00',
    miniFill: 'linear-gradient(90deg,#7a4000,#ffaa00)',
    miniFillShadow: '0 0 8px rgba(255,170,0,.5)',
  },
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function DarkTriadSummaryPanel({
  rawScores,
  report,
}: {
  rawScores: any;
  report?: any;
}) {
  const dims: Record<string, any> = rawScores?.dimensions ?? report?.dimensions ?? {};
  const sortedIds = Object.keys(dims).sort((a, b) => (dims[b]?.raw_score ?? 0) - (dims[a]?.raw_score ?? 0));
  const traitIds = (sortedIds.length ? sortedIds : ['machiavellianism', 'narcissism', 'psychopathy']).filter(
    (id) => !!DT_ACCENT[id]
  );

  const scores = traitIds.map((id) => Number(dims[id]?.raw_score ?? 0)).filter((v) => Number.isFinite(v) && v > 0);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const maxPercentile = traitIds
    .map((id) => Number(dims[id]?.percentile ?? 0))
    .filter((v) => Number.isFinite(v))
    .reduce((m, v) => Math.max(m, v), 0);

  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08), 0 8px 32px -4px rgba(0,0,0,.55)' }}
    >
      <div className="p-5">
        <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">Podsumowanie</div>

        <div className="mt-4 rounded-2xl border p-5 text-center"
          style={{
            background: 'rgba(244,63,94,.07)',
            borderColor: 'rgba(244,63,94,.2)',
          }}
        >
          <div
            className="text-[52px] font-extrabold leading-none"
            style={{
              color: '#fb7185',
              letterSpacing: '-0.06em',
              textShadow: '0 0 30px rgba(251,113,133,.55), 0 0 60px rgba(251,113,133,.2)',
            }}
          >
            {avgScore ? avgScore.toFixed(2) : '—'}
          </div>
          <div className="mt-1 text-[11px] text-white/35 tracking-wide">Średni wynik Dark Triad</div>

          <div
            className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full text-sm font-semibold"
            style={{
              color: '#fb7185',
              background: 'rgba(251,113,133,.1)',
              border: '1px solid rgba(251,113,133,.25)',
            }}
          >
            🔴 Top {maxPercentile ? clamp(Math.round(maxPercentile), 0, 100) : '—'}% populacji
          </div>
        </div>

        <div className="my-5 h-px bg-white/10" />

        <div className="text-[10px] tracking-[2px] font-mono text-white/35 uppercase">Składowe</div>

        <div className="mt-4 flex flex-col gap-3">
          {traitIds.slice(0, 3).map((id) => {
            const ac = DT_ACCENT[id];
            const dim = dims[id] ?? {};
            const raw = Number(dim.raw_score ?? 0);
            const pct = Number.isFinite(raw) && raw > 0 ? Math.round(((raw - 1) / 4) * 100) : 0;

            return (
              <div key={id} className="flex items-center gap-3">
                <span className="text-lg shrink-0">{ac.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="text-sm font-semibold text-white/75 truncate">{ac.plName}</div>
                    <div className="text-sm font-bold shrink-0" style={{ color: ac.color }}>
                      {Number.isFinite(raw) && raw > 0 ? raw.toFixed(2) : '—'}
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{
                        width: `${clamp(pct, 0, 100)}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: ac.miniFill,
                        boxShadow: ac.miniFillShadow,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="my-5 h-px bg-white/10" />

        <div
          className="rounded-xl p-4 text-sm leading-relaxed"
          style={{
            background: 'rgba(123,31,162,.08)',
            border: '1px solid rgba(123,31,162,.22)',
            color: 'rgba(255,255,255,.45)',
          }}
        >
          <strong style={{ color: 'rgba(255,200,200,.85)', fontWeight: 600 }}>
            {report?.overall_risk === 'high'
              ? 'Profil wskazuje na podwyższoną skłonność do zachowań ciemnej triady.'
              : 'Profil mieści się w normie populacyjnej.'}
          </strong>{' '}
          {traitIds[0] && DT_ACCENT[traitIds[0]] ? <>Dominujący wymiar: {DT_ACCENT[traitIds[0]].plName}.</> : null}
        </div>
      </div>
    </div>
  );
}
