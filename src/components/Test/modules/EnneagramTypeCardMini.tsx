import React from 'react';

const TYPE_ACCENT: Record<
  number,
  {
    name: string;
    color: string;
    gradient: string;
    glow: string;
    blob: string;
  }
> = {
  1: { name: 'Reformista', color: '#ff6b6b', gradient: 'linear-gradient(90deg,#c0392b,#ff6b6b)', glow: 'rgba(255,107,107,.5)', blob: '#ff6b6b' },
  2: { name: 'Pomocnik', color: '#ff9ff3', gradient: 'linear-gradient(90deg,#8e44ad,#ff9ff3)', glow: 'rgba(255,159,243,.5)', blob: '#ff9ff3' },
  3: { name: 'Osiągacz', color: '#ffd32a', gradient: 'linear-gradient(90deg,#a0760a,#ffd32a)', glow: 'rgba(255,211,42,.5)', blob: '#ffd32a' },
  4: { name: 'Indywidualista', color: '#a29bfe', gradient: 'linear-gradient(90deg,#4a0080,#a29bfe)', glow: 'rgba(162,155,254,.5)', blob: '#a29bfe' },
  5: { name: 'Badacz', color: '#55efc4', gradient: 'linear-gradient(90deg,#00695c,#55efc4)', glow: 'rgba(85,239,196,.5)', blob: '#55efc4' },
  6: { name: 'Lojalista', color: '#74b9ff', gradient: 'linear-gradient(90deg,#0a3d8a,#74b9ff)', glow: 'rgba(116,185,255,.5)', blob: '#74b9ff' },
  7: { name: 'Entuzjasta', color: '#fd9644', gradient: 'linear-gradient(90deg,#a04000,#fd9644)', glow: 'rgba(253,150,68,.5)', blob: '#fd9644' },
  8: { name: 'Wyzywacz', color: '#ff4757', gradient: 'linear-gradient(90deg,#7f0000,#ff4757)', glow: 'rgba(255,71,87,.5)', blob: '#ff4757' },
  9: { name: 'Mediator', color: '#26de81', gradient: 'linear-gradient(90deg,#006633,#26de81)', glow: 'rgba(38,222,129,.5)', blob: '#26de81' },
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function EnneagramTypeCardMini({
  primaryType,
  wing,
  strengthPct,
  lore,
}: {
  primaryType?: any;
  wing?: any;
  strengthPct?: number;
  lore?: any;
}) {
  const typeNumRaw = primaryType?.type ?? primaryType?.id;
  const typeNum = Number.isFinite(Number(typeNumRaw)) ? Number(typeNumRaw) : null;
  const ac = typeNum ? TYPE_ACCENT[typeNum] : null;
  const accent = ac ?? TYPE_ACCENT[4];

  const name = String(primaryType?.name ?? (typeNum ? `Typ ${typeNum}` : 'Brak danych'));
  const nameEn = String(primaryType?.name_en ?? '');
  const desc = String(primaryType?.description ?? lore?.desc ?? '').trim();
  const wingType = wing?.type ?? wing?.id;

  const pct = clamp(Math.round(Number(strengthPct ?? 0)), 0, 100);

  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl relative overflow-hidden"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08), 0 8px 32px -4px rgba(0,0,0,.55)' }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          filter: 'blur(70px)',
          bottom: -75,
          right: -70,
          background: accent.blob,
          opacity: 0.16,
          pointerEvents: 'none',
        }}
      />

      <div className="p-4 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] tracking-[2px] font-mono uppercase" style={{ color: `${accent.color}` }}>
              Soul Blueprint
            </div>
            <div className="mt-1 text-[11px] text-white/35 font-mono tracking-[2px]">TWÓJ TYP</div>
          </div>

          {wingType ? (
            <span
              className="shrink-0 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-semibold"
              style={{ color: '#d946ef', background: 'rgba(217,70,239,.1)', borderColor: 'rgba(217,70,239,.3)' }}
            >
              🪶 Skrzydło {String(wingType)}
            </span>
          ) : null}
        </div>

        <div className="mt-3 rounded-2xl border p-4 text-center" style={{ background: `${accent.color}12`, borderColor: `${accent.color}30` }}>
          <div
            className="text-[56px] font-extrabold leading-none"
            style={{ color: accent.color, letterSpacing: '-0.06em', textShadow: `0 0 30px ${accent.glow}` }}
          >
            {typeNum ?? '—'}
          </div>
          <div className="mt-1 text-base font-bold text-white/90">{name}</div>
          {nameEn ? <div className="mt-0.5 text-[12px] text-white/45 italic">“{nameEn}”</div> : null}
          {lore?.epithet ? <div className="mt-2 text-[12px] text-white/55">{lore.epithet}</div> : null}
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-white/35">
            <span>Siła profilu</span>
            <span className="font-mono" style={{ color: accent.color }}>
              {pct}%
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                borderRadius: 999,
                background: accent.gradient,
                boxShadow: `0 0 10px ${accent.glow}`,
              }}
            />
          </div>
        </div>

        {desc ? <div className="mt-3 text-sm text-white/60 leading-relaxed">{desc.slice(0, 170)}{desc.length > 170 ? '…' : ''}</div> : null}
      </div>
    </div>
  );
}
