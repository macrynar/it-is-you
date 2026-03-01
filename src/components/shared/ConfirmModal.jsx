import React, { useEffect } from 'react';

/**
 * ConfirmModal – neuroglass styled replacement for window.confirm()
 * Props:
 *   message        – main question text
 *   title          – optional title above message
 *   icon           – emoji icon (default "🔄")
 *   confirmLabel   – confirm button text
 *   cancelLabel    – cancel button text
 *   accent         – hex colour for confirm button + icon ring
 *   onConfirm / onCancel – callbacks
 */
export default function ConfirmModal({
  message = 'Czy na pewno?',
  title,
  icon = '🔄',
  confirmLabel = 'Tak, kontynuuj',
  cancelLabel = 'Anuluj',
  accent = '#6366f1',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(4,6,24,.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'cmFadeIn .2s ease',
      }}
    >
      <style>{`
        @keyframes cmFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes cmSlideUp { from { transform:translateY(22px); opacity:0 } to { transform:translateY(0); opacity:1 } }
        @keyframes cmRing1   { 0%,100%{ transform:scale(1);   opacity:.45 } 50%{ transform:scale(1.12); opacity:.2 } }
        @keyframes cmRing2   { 0%,100%{ transform:scale(1);   opacity:.3  } 50%{ transform:scale(1.22); opacity:.1 } }
        @keyframes cmBorder  { 0%{ background-position:0% 50% } 100%{ background-position:200% 50% } }
        @keyframes cmShine   { 0%{ left:-60% } 100%{ left:160% } }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          borderRadius: 22,
          padding: 1.5,              /* border thickness */
          maxWidth: 440,
          width: '100%',
          animation: 'cmSlideUp .25s cubic-bezier(.22,1,.36,1)',
          background: `linear-gradient(135deg,${accent}55,rgba(0,240,255,.35),${accent}55)`,
          backgroundSize: '200% 200%',
        }}
      >
        {/* inner card */}
        <div style={{
          background: 'linear-gradient(160deg,rgba(14,17,52,.98) 0%,rgba(7,9,33,.99) 100%)',
          borderRadius: 21,
          padding: '40px 32px 30px',
          textAlign: 'center',
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          overflow: 'hidden',
        }}>
          {/* decorative neon bar at top */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '60%', height: 2,
            background: `linear-gradient(90deg,transparent,${accent},#00f0ff,${accent},transparent)`,
            borderRadius: '0 0 4px 4px',
            opacity: .9,
          }} />

          {/* Icon rings */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 22 }}>
            {/* outer pulse ring */}
            <div style={{
              position: 'absolute', inset: -14,
              borderRadius: '50%', border: `1px solid ${accent}44`,
              animation: 'cmRing2 2.4s ease-in-out infinite',
            }} />
            {/* mid pulse ring */}
            <div style={{
              position: 'absolute', inset: -7,
              borderRadius: '50%', border: `1px solid ${accent}66`,
              animation: 'cmRing1 2.4s ease-in-out infinite .3s',
            }} />
            {/* icon circle */}
            <div style={{
              width: 58, height: 58, borderRadius: '50%',
              background: `radial-gradient(circle,${accent}22 0%,${accent}08 100%)`,
              border: `1.5px solid ${accent}88`,
              boxShadow: `0 0 22px ${accent}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26,
            }}>
              {icon}
            </div>
          </div>

          {/* Title */}
          {title && (
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '.14em',
              textTransform: 'uppercase', color: `${accent}cc`,
              margin: '0 0 8px',
            }}>
              {title}
            </p>
          )}

          {/* Message */}
          <p style={{
            fontSize: 16.5, fontWeight: 600,
            color: 'rgba(255,255,255,.9)', lineHeight: 1.6,
            margin: '0 0 30px',
          }}>
            {message}
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Cancel */}
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: '0 0 auto',
                padding: '12px 22px',
                borderRadius: 12,
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.11)',
                color: 'rgba(255,255,255,.55)',
                fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = 'rgba(255,255,255,.85)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'rgba(255,255,255,.55)'; }}
            >
              {cancelLabel}
            </button>

            {/* Confirm */}
            <button
              type="button"
              onClick={onConfirm}
              style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                padding: '12px 22px',
                borderRadius: 12,
                background: `linear-gradient(135deg,${accent}e0,${accent})`,
                border: `1px solid ${accent}88`,
                color: '#fff',
                fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
                cursor: 'pointer',
                boxShadow: `0 4px 24px ${accent}55, inset 0 1px 0 rgba(255,255,255,.15)`,
                transition: 'opacity .15s, box-shadow .15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 6px 32px ${accent}88, inset 0 1px 0 rgba(255,255,255,.15)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 24px ${accent}55, inset 0 1px 0 rgba(255,255,255,.15)`; }}
            >
              {/* shine sweep */}
              <span style={{
                position: 'absolute', top: 0, left: '-60%', width: '50%', height: '100%',
                background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)',
                transform: 'skewX(-20deg)',
                animation: 'cmShine 2.8s ease-in-out infinite',
                pointerEvents: 'none',
              }} />
              <span>{confirmLabel}</span>
              <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
