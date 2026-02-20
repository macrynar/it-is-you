import React from 'react';

export default function ValuesTopChipsMini({
  report,
  fallback,
  max = 3,
}: {
  report?: any;
  fallback?: any[];
  max?: number;
}) {
  const top3: any[] = report?.top_3 ?? [];

  if (top3.length) {
    return (
      <div className="flex flex-wrap gap-2">
        {top3.slice(0, max).map((v: any, i: number) => {
          const color = String(v.color ?? '#14b8a6');
          return (
            <span
              key={v.id ?? v.name ?? i}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-semibold"
              style={{ background: `${color}22`, borderColor: `${color}50`, color }}
            >
              <span
                className="w-[18px] h-[18px] rounded-full inline-flex items-center justify-center text-[10px] font-extrabold"
                style={{ background: color, color: '#000' }}
              >
                {i + 1}
              </span>
              <span className="max-w-[180px] truncate">{v.name ?? v.value ?? v.value_name ?? '—'}</span>
            </span>
          );
        })}
      </div>
    );
  }

  if (fallback?.length) {
    return (
      <div className="flex flex-wrap gap-2">
        {fallback.slice(0, max).map((v: any, i: number) => (
          <span
            key={v.id ?? v.name ?? v.value_name ?? i}
            className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/65 truncate max-w-full"
          >
            {v.name ?? v.value_name ?? String(v)}
          </span>
        ))}
      </div>
    );
  }

  return null;
}
