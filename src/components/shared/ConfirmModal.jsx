import React, { useEffect } from 'react';

/**
 * ConfirmModal – styled replacement for window.confirm()
 * Usage:
 *   <ConfirmModal
 *     message="Czy na pewno chcesz ponowić test?"
 *     confirmLabel="Tak, ponów"         // optional
 *     cancelLabel="Anuluj"              // optional
 *     accent="#38b6ff"                  // optional, button accent colour
 *     onConfirm={() => { ... }}
 *     onCancel={() => { ... }}
 *   />
 */
export default function ConfirmModal({
  message = 'Czy na pewno?',
  confirmLabel = 'Tak, kontynuuj',
  cancelLabel = 'Anuluj',
  accent = '#6366f1',
  onConfirm,
  onCancel,
}) {
  // Close on Escape
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
        background: 'rgba(6,8,30,.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'cmFadeIn .18s ease',
      }}
    >
      <style>{`
        @keyframes cmFadeIn  { from { opacity:0 }                to { opacity:1 } }
        @keyframes cmSlideUp { from { transform:translateY(18px); opacity:0 } to { transform:translateY(0); opacity:1 } }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg,rgba(26,29,64,.98),rgba(18,21,52,.98))',
          border: '1px solid rgba(255,255,255,.13)',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.07)',
          padding: '36px 32px 28px',
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          animation: 'cmSlideUp .22s ease',
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: `${accent}1a`,
          border: `1.5px solid ${accent}44`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, marginBottom: 20,
        }}>
          🔄
        </div>

        {/* Message */}
        <p style={{
          fontSize: 16,
          fontWeight: 600,
          color: 'rgba(255,255,255,.88)',
          lineHeight: 1.55,
          margin: '0 0 28px',
        }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: 12,
              background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.12)',
              color: 'rgba(255,255,255,.65)',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background .15s, color .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.65)'; }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: 12,
              background: `linear-gradient(135deg,${accent}cc,${accent})`,
              border: `1px solid ${accent}66`,
              color: '#fff',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: `0 4px 20px ${accent}44`,
              transition: 'opacity .15s, box-shadow .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '.88'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
