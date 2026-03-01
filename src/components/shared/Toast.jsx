import React, { useEffect, useState } from 'react';

/**
 * Toast – lightweight auto-dismissing notification pill.
 * Props:
 *   type     – 'success' | 'error'
 *   message  – text to display
 *   onDone   – called when the toast finishes (auto after 3 s)
 */
export default function Toast({ type = 'success', message, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 2700);
    const t2 = setTimeout(() => onDone?.(), 3050);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  const isSuccess = type === 'success';
  const accent    = isSuccess ? '#22c55e' : '#ef4444';
  const icon      = isSuccess ? '✓' : '!';

  return (
    <>
      <style>{`
        @keyframes toastIn  { from { transform:translateX(120%); opacity:0 } to { transform:translateX(0); opacity:1 } }
        @keyframes toastOut { from { transform:translateX(0);    opacity:1 } to { transform:translateX(120%); opacity:0 } }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '13px 18px',
          borderRadius: 14,
          background: `linear-gradient(135deg,rgba(14,17,52,.97),rgba(7,9,33,.98))`,
          border: `1px solid ${accent}55`,
          boxShadow: `0 8px 32px rgba(0,0,0,.55), 0 0 0 1px ${accent}22`,
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          animation: visible ? 'toastIn .3s cubic-bezier(.22,1,.36,1)' : 'toastOut .35s ease forwards',
          maxWidth: 340,
        }}
      >
        {/* icon dot */}
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: `${accent}22`,
          border: `1.5px solid ${accent}88`,
          boxShadow: `0 0 10px ${accent}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 900, color: accent,
          flexShrink: 0,
        }}>
          {icon}
        </div>

        {/* message */}
        <span style={{
          fontSize: 13.5, fontWeight: 600,
          color: 'rgba(255,255,255,.88)',
          lineHeight: 1.4,
        }}>
          {message}
        </span>

        {/* close */}
        <button
          type="button"
          onClick={() => { setVisible(false); setTimeout(() => onDone?.(), 350); }}
          style={{
            marginLeft: 4,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,.35)',
            fontSize: 16,
            cursor: 'pointer',
            lineHeight: 1,
            padding: 0,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,.7)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,.35)'; }}
        >
          ✕
        </button>
      </div>
    </>
  );
}
