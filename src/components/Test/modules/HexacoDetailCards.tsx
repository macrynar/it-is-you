import React from 'react';
import { HEXACO_TEST } from '../../../data/tests/hexaco.js';

const HEXACO_DESC_EN: Record<string, string> = {
  honesty_humility: 'Tendency toward honesty, modesty, and resisting manipulation or exploitation.',
  emotionality: 'Emotional sensitivity, fearfulness, and a greater need for closeness and reassurance.',
  extraversion: 'Social energy, confidence, enthusiasm, and comfort taking the lead in groups.',
  agreeableness: 'Patience, forgiveness, and willingness to cooperate rather than escalate conflict.',
  conscientiousness: 'Organization, diligence, self-discipline, and follow-through on plans and commitments.',
  openness: 'Intellectual curiosity, imagination, and appreciation for ideas, art, and novel experiences.',
};

const ACCENT: Record<
  string,
  {
    plName: string;
    name: string;
    color: string;
    gradient: string;
    glow: string;
    blob: string;
    hover: string;
  }
> = {
  honesty_humility: {
    plName: 'Szczerość',
    name: 'Honesty-Humility',
    color: '#38b6ff',
    gradient: 'linear-gradient(90deg,#38b6ff,#38b6ff)',
    glow: 'rgba(56,182,255,.5)',
    blob: '#38b6ff',
    hover:
      'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(56,182,255,.35),0 0 30px -4px rgba(56,182,255,.3),0 16px 48px -6px rgba(0,0,0,.7)',
  },
  emotionality: {
    plName: 'Emocjonalność',
    name: 'Emotionality',
    color: '#ff9532',
    gradient: 'linear-gradient(90deg,#a04000,#ff9532)',
    glow: 'rgba(255,149,50,.5)',
    blob: '#ff9532',
    hover:
      'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(255,149,50,.35),0 0 30px -4px rgba(255,149,50,.25),0 16px 48px -6px rgba(0,0,0,.7)',
  },
  extraversion: {
    plName: 'Ekstrawersja',
    name: 'Extraversion',
    color: '#b08fff',
    gradient: 'linear-gradient(90deg,#4a28b0,#b08fff)',
    glow: 'rgba(123,94,167,.6)',
    blob: '#7b5ea7',
    hover:
      'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(123,94,167,.4),0 0 30px -4px rgba(123,94,167,.3),0 16px 48px -6px rgba(0,0,0,.7)',
  },
  agreeableness: {
    plName: 'Ugodowość',
    name: 'Agreeableness',
    color: '#40e0d0',
    gradient: 'linear-gradient(90deg,#006060,#40e0d0)',
    glow: 'rgba(64,224,208,.5)',
    blob: '#40e0d0',
    hover:
      'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(64,224,208,.35),0 0 30px -4px rgba(64,224,208,.25),0 16px 48px -6px rgba(0,0,0,.7)',
  },
  conscientiousness: {
    plName: 'Sumienność',
    name: 'Conscientiousness',
    color: '#00e5a0',
    gradient: 'linear-gradient(90deg,#007a50,#00e5a0)',
    glow: 'rgba(0,229,160,.5)',
    blob: '#00e5a0',
    hover:
      'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(0,229,160,.35),0 0 30px -4px rgba(0,229,160,.25),0 16px 48px -6px rgba(0,0,0,.7)',
  },
  openness: {
    plName: 'Otwartość',
    name: 'Openness',
    color: '#e878e0',
    gradient: 'linear-gradient(90deg,#7b1fa2,#e878e0)',
    glow: 'rgba(200,80,192,.5)',
    blob: '#c850c0',
    hover:
      'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(200,80,192,.4),0 0 30px -4px rgba(200,80,192,.3),0 16px 48px -6px rgba(0,0,0,.7)',
  },
};

const DIM_ORDER = [
  'honesty_humility',
  'emotionality',
  'extraversion',
  'agreeableness',
  'conscientiousness',
  'openness',
] as const;

type DimId = (typeof DIM_ORDER)[number];

export default function HexacoDetailCards({
  percentiles,
  compact = true,
  showEnglishName = true,
  showDescription = true,
  descriptionLang = 'pl',
  columns,
  extraContent,
}: {
  percentiles: Record<string, number>;
  compact?: boolean;
  showEnglishName?: boolean;
  showDescription?: boolean;
  descriptionLang?: 'pl' | 'en' | 'both';
  columns?: 2 | 3;
  extraContent?: (id: string) => React.ReactNode;
}) {
  const gridClass = (() => {
    const cols = columns ?? (compact ? 3 : 3);
    if (cols === 2) return compact ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-5';
    return compact
      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
      : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5';
  })();

  return (
    <div className={gridClass}>
      {DIM_ORDER.map((id) => {
        const ac = ACCENT[id];
        const pct = Math.round(percentiles?.[id] ?? 0);
        const dim = (HEXACO_TEST as any).dimensions?.find((d: any) => d.id === id);
        const plDesc = String(dim?.description ?? '');
        const enDesc = HEXACO_DESC_EN[id] ?? '';
        const desc = (
          descriptionLang === 'en'
            ? enDesc
            : descriptionLang === 'both'
              ? [enDesc, plDesc].filter(Boolean).join(' ')
              : plDesc
        ).substring(0, compact ? 120 : 220);

        return (
          <div
            key={id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl relative overflow-hidden transition-transform"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08), 0 8px 32px -4px rgba(0,0,0,.55)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = ac.hover;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = '';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,.08), 0 8px 32px -4px rgba(0,0,0,.55)';
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
                background: ac.blob,
                opacity: 0.16,
                pointerEvents: 'none',
              }}
            />

            <div className={compact ? 'p-5' : 'p-6'}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white/85 leading-tight whitespace-normal break-words">
                    {ac.plName}
                  </div>
                  {showEnglishName && (
                    <div className="text-xs text-white/45 truncate mt-0.5">{ac.name}</div>
                  )}
                </div>
                <div className="text-2xl font-extrabold leading-none" style={{ color: ac.color }}>
                  {pct}%
                </div>
              </div>

              <div className="h-1.5 rounded-full bg-white/10 overflow-visible relative mb-3">
                <div
                  style={{
                    width: `${Math.max(0, Math.min(100, pct))}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: ac.gradient,
                    boxShadow: `0 0 10px ${ac.glow}`,
                    position: 'relative',
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      content: "''",
                      position: 'absolute',
                      right: -1,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 0 8px rgba(255,255,255,.6)',
                    }}
                  />
                </div>
              </div>

              {showDescription && desc && (
                <div className="text-xs text-white/40 leading-relaxed">{desc}</div>
              )}

              {extraContent ? (
                <div className={showDescription && desc ? 'mt-3' : ''}>{extraContent(id)}</div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
