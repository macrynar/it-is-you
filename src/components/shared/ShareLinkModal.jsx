import React, { useEffect, useState } from 'react';

/**
 * ShareLinkModal – shows a shareable URL with a one-click copy button.
 * Shown as fallback when navigator.clipboard is unavailable.
 */
export default function ShareLinkModal({ url, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => { setCopied(false); onClose?.(); }, 1400);
    } catch {
      /* ignore – user can copy manually */
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(6,8,30,.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'slmFadeIn .18s ease',
      }}
    >
      <style>{`
        @keyframes slmFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slmSlideUp { from { transform:translateY(18px); opacity:0 } to { transform:translateY(0); opacity:1 } }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg,rgba(26,29,64,.98),rgba(18,21,52,.98))',
          border: '1px solid rgba(255,255,255,.13)',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.07)',
          padding: '32px 28px 26px',
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
          animation: 'slmSlideUp .22s ease',
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(99,102,241,.15)',
          border: '1.5px solid rgba(99,102,241,.35)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, marginBottom: 18,
        }}>
          🔗
        </div>

        <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,.88)', margin: '0 0 6px' }}>
          Udostępnij Kartę Postaci
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', margin: '0 0 22px', lineHeight: 1.5 }}>
          Skopiuj poniższy link i wyślij komu chcesz
        </p>

        {/* URL box */}
        <div style={{
          background: 'rgba(255,255,255,.05)',
          border: '1px solid rgba(255,255,255,.12)',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 14,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{
            flex: 1,
            fontSize: 12,
            color: 'rgba(255,255,255,.55)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'ui-monospace, "Space Mono", monospace',
          }}>
            {url}
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.12)',
              color: 'rgba(255,255,255,.6)',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Zamknij
          </button>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              flex: 2,
              padding: '12px 16px',
              borderRadius: 12,
              background: copied
                ? 'linear-gradient(135deg,#22c55ecc,#22c55e)'
                : 'linear-gradient(135deg,#6366f1cc,#6366f1)',
              border: copied ? '1px solid #22c55e66' : '1px solid #6366f166',
              color: '#fff',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background .25s, border-color .25s',
              boxShadow: copied ? '0 4px 20px #22c55e44' : '0 4px 20px #6366f144',
            }}
          >
            {copied ? '✓ Skopiowano!' : 'Kopiuj link'}
          </button>
        </div>
      </div>
    </div>
  );
}
