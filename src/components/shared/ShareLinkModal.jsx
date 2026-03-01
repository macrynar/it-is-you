import React, { useEffect, useState } from 'react';

/**
 * ShareLinkModal – neuroglass styled URL share dialog.
 * Props: { url, onClose }
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
      setTimeout(() => { setCopied(false); onClose?.(); }, 1600);
    } catch {
      /* user can copy manually */
    }
  };

  const ACCENT = '#6366f1';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(4,6,24,.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'slmFadeIn .2s ease',
      }}
    >
      <style>{`
        @keyframes slmFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slmSlideUp { from { transform:translateY(22px); opacity:0 } to { transform:translateY(0); opacity:1 } }
        @keyframes slmRing1   { 0%,100%{ transform:scale(1); opacity:.45 } 50%{ transform:scale(1.12); opacity:.2 } }
        @keyframes slmRing2   { 0%,100%{ transform:scale(1); opacity:.3  } 50%{ transform:scale(1.22); opacity:.1 } }
        @keyframes slmShine   { 0%{ left:-60% } 100%{ left:160% } }
        @keyframes slmPop     { 0%{ transform:scale(.85); opacity:0 } 60%{ transform:scale(1.06) } 100%{ transform:scale(1); opacity:1 } }
      `}</style>

      {/* gradient-border wrapper */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          borderRadius: 22,
          padding: 1.5,
          maxWidth: 450,
          width: '100%',
          animation: 'slmSlideUp .25s cubic-bezier(.22,1,.36,1)',
          background: `linear-gradient(135deg,${ACCENT}55,rgba(0,240,255,.35),${ACCENT}55)`,
        }}
      >
        <div style={{
          background: 'linear-gradient(160deg,rgba(14,17,52,.98) 0%,rgba(7,9,33,.99) 100%)',
          borderRadius: 21,
          padding: '40px 30px 30px',
          textAlign: 'center',
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          overflow: 'hidden',
        }}>
          {/* top neon bar */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '60%', height: 2,
            background: `linear-gradient(90deg,transparent,${ACCENT},#00f0ff,${ACCENT},transparent)`,
            borderRadius: '0 0 4px 4px', opacity: .9,
          }} />

          {/* Icon rings */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
            <div style={{
              position: 'absolute', inset: -14, borderRadius: '50%',
              border: `1px solid ${ACCENT}44`,
              animation: 'slmRing2 2.4s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: -7, borderRadius: '50%',
              border: `1px solid ${ACCENT}66`,
              animation: 'slmRing1 2.4s ease-in-out infinite .3s',
            }} />
            <div style={{
              width: 58, height: 58, borderRadius: '50%',
              background: `radial-gradient(circle,${ACCENT}22 0%,${ACCENT}08 100%)`,
              border: `1.5px solid ${ACCENT}88`,
              boxShadow: `0 0 22px ${ACCENT}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26,
            }}>
              🔗
            </div>
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: `${ACCENT}cc`, margin: '0 0 8px' }}>
            Udostępnij
          </p>
          <p style={{ fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,.92)', margin: '0 0 6px' }}>
            Karta Postaci
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.38)', margin: '0 0 24px', lineHeight: 1.5 }}>
            Wyślij ten link komu chcesz
          </p>

          {/* URL row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 0,
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 12,
            marginBottom: 18,
            overflow: 'hidden',
          }}>
            <span style={{
              flex: 1, padding: '11px 14px',
              fontSize: 11.5,
              color: 'rgba(255,255,255,.5)',
              fontFamily: 'ui-monospace,"Cascadia Code","Space Mono",monospace',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textAlign: 'left',
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
                flex: '0 0 auto',
                padding: '12px 20px',
                borderRadius: 12,
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                color: 'rgba(255,255,255,.5)',
                fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = 'rgba(255,255,255,.8)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; }}
            >
              Zamknij
            </button>

            <button
              type="button"
              onClick={handleCopy}
              style={{
                flex: 1,
                position: 'relative', overflow: 'hidden',
                padding: '12px 20px',
                borderRadius: 12,
                background: copied
                  ? 'linear-gradient(135deg,#22c55ecc,#15803d)'
                  : `linear-gradient(135deg,${ACCENT}e0,${ACCENT})`,
                border: copied ? '1px solid #22c55e66' : `1px solid ${ACCENT}88`,
                color: '#fff',
                fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
                cursor: 'pointer',
                boxShadow: copied ? '0 4px 24px #22c55e55' : `0 4px 24px ${ACCENT}55`,
                transition: 'background .3s, border-color .3s, box-shadow .3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                animation: copied ? 'slmPop .35s ease' : 'none',
              }}
            >
              {!copied && (
                <span style={{
                  position: 'absolute', top: 0, left: '-60%', width: '50%', height: '100%',
                  background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)',
                  transform: 'skewX(-20deg)',
                  animation: 'slmShine 2.8s ease-in-out infinite',
                  pointerEvents: 'none',
                }} />
              )}
              <span>{copied ? '✓ Skopiowano!' : 'Kopiuj link'}</span>
              {!copied && <span style={{ fontSize: 15 }}>📋</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
