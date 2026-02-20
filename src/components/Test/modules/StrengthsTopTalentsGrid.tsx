import React from 'react';
import { STRENGTHS_TEST } from '../../../data/tests/strengths.js';

const CAT: Record<
  string,
  {
    color: string;
    glow: string;
    bar: string;
    badge: string;
    shadow: string;
  }
> = {
  strategic_thinking: {
    color: '#34d399',
    glow: 'rgba(52,211,153,.5)',
    bar: 'linear-gradient(90deg,#065f46,#34d399)',
    badge: 'linear-gradient(135deg,#065f46,#34d399)',
    shadow: '0 0 0 1px rgba(52,211,153,.35),0 0 30px -4px rgba(52,211,153,.3)',
  },
  executing: {
    color: '#b08fff',
    glow: 'rgba(123,94,167,.6)',
    bar: 'linear-gradient(90deg,#4a28b0,#b08fff)',
    badge: 'linear-gradient(135deg,#4a28b0,#b08fff)',
    shadow: '0 0 0 1px rgba(123,94,167,.4),0 0 30px -4px rgba(123,94,167,.3)',
  },
  influencing: {
    color: '#fbbf24',
    glow: 'rgba(251,191,36,.5)',
    bar: 'linear-gradient(90deg,#78350f,#fbbf24)',
    badge: 'linear-gradient(135deg,#78350f,#fbbf24)',
    shadow: '0 0 0 1px rgba(251,191,36,.35),0 0 30px -4px rgba(251,191,36,.25)',
  },
  relationship_building: {
    color: '#60a5fa',
    glow: 'rgba(96,165,250,.5)',
    bar: 'linear-gradient(90deg,#1e3a5f,#60a5fa)',
    badge: 'linear-gradient(135deg,#1e3a5f,#60a5fa)',
    shadow: '0 0 0 1px rgba(96,165,250,.35),0 0 30px -4px rgba(96,165,250,.3)',
  },
};

const getCat = (id: string) => CAT[id] || CAT.strategic_thinking;
const getCategoryInfo = (id: string) => (STRENGTHS_TEST as any)?.categories?.find((c: any) => c.id === id);

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function StrengthsTopTalentsGrid({
  top5,
  compact = true,
}: {
  top5: any[];
  compact?: boolean;
}) {
  if (!top5?.length) return null;

  return (
    <div className={compact ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-5'}>
      {top5.slice(0, 5).map((talent: any, idx: number) => {
        const catInfo = getCategoryInfo(String(talent.category ?? ''));
        const c = getCat(String(talent.category ?? 'strategic_thinking'));
        const score = Number(talent.score ?? 0);
        const scorePct = clamp(Math.round((score / 5) * 100), 0, 100);

        const name = String(talent.name ?? talent.name_en ?? `Talent ${idx + 1}`);
        const nameEn = String(talent.name_en ?? '');
        const desc = String(talent.description ?? '').slice(0, compact ? 120 : 170);
        const keywords: string[] = Array.isArray(talent.keywords)
          ? talent.keywords
          : typeof talent.keywords === 'string'
            ? talent.keywords.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [];

        const baseShadow = 'inset 0 1px 0 rgba(255,255,255,.08), 0 8px 32px -4px rgba(0,0,0,.55)';

        return (
          <div
            key={talent.id ?? name}
            className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl relative overflow-hidden transition-transform"
            style={{ boxShadow: baseShadow }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = `inset 0 1px 0 rgba(255,255,255,.14),${c.shadow},0 16px 48px -6px rgba(0,0,0,.7)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = '';
              (e.currentTarget as HTMLDivElement).style.boxShadow = baseShadow;
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                width: 140,
                height: 140,
                borderRadius: '50%',
                filter: 'blur(55px)',
                bottom: -55,
                right: -45,
                background: c.color,
                opacity: 0.14,
                pointerEvents: 'none',
              }}
            />

            <div className={compact ? 'p-5' : 'p-6'}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg" aria-hidden>
                      {catInfo?.icon ?? '⭐'}
                    </span>
                    <div className="text-sm font-semibold text-white/85 truncate">{name}</div>
                  </div>
                  {nameEn ? <div className="text-[11px] text-white/40 truncate">{nameEn}</div> : null}

                  <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-semibold"
                    style={{ background: `${c.color}20`, borderColor: `${c.color}45`, color: c.color }}
                  >
                    {catInfo?.name ?? String(talent.category ?? 'Talent')}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-extrabold"
                    style={{ background: c.badge, boxShadow: `0 4px 20px -2px ${c.glow}` }}
                  >
                    #{Number(talent.rank ?? idx + 1)}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-[11px] text-white/35 mb-2">
                  <span>Wynik</span>
                  <span style={{ color: c.color, fontWeight: 700 }}>
                    {Number.isFinite(score) && score > 0 ? score.toFixed(2) : '—'} / 5.00
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    style={{
                      width: `${scorePct}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: c.bar,
                      boxShadow: `0 0 10px ${c.glow}`,
                    }}
                  />
                </div>
              </div>

              {desc ? <div className="text-sm text-white/65 leading-relaxed">{desc}{desc.length >= (compact ? 120 : 170) ? '…' : ''}</div> : null}

              {keywords.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {keywords.slice(0, compact ? 6 : 10).map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/55"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
