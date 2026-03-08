import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

type AlterEgo = { context: string; name: string; reason: string };

interface Props {
  userName: string;
  avatarUrl?: string;
  archetypeName: string;
  popculture: AlterEgo[];
  shareUrl: string;
}

/* Fun one-liner quips keyed to index so they feel personalised */
const QUIPS = [
  'Jeśli by nas sklonować, wyszłoby to.',
  'Ta postać to ty, ale z lepszym budżetem.',
  'Alter ego potwierdzone przez algorytm.',
  'Psychometria wskazała właśnie na kogoś epickim.',
  'Twoje DNA osobowości znalazło wyraz w popkulturze.',
  'Zbieżność nieprzypadkowa.',
];

export default function AlterEgoCard({ userName, avatarUrl, archetypeName, popculture, shareUrl }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const top = popculture[0] ?? null;
  const rest = popculture.slice(1, 4);
  const quip = QUIPS[(popculture.length + archetypeName.length) % QUIPS.length];

  const download = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const url = await toPng(cardRef.current, { pixelRatio: 3 });
      const a = document.createElement('a');
      a.href = url;
      a.download = `alter-ego-${userName.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.click();
    } catch {
      // silent
    } finally {
      setDownloading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent
    }
  };

  const initials = userName
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (!top) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
        Brak danych alter ego. Wróć do Karty Postaci i wygeneruj pełny profil.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>

      {/* ── CARD ── */}
      <div
        ref={cardRef}
        style={{
          width: 380,
          maxWidth: 'calc(100vw - 48px)',
          borderRadius: 28,
          background: 'linear-gradient(145deg, #0d0f2e 0%, #120a2e 50%, #050714 100%)',
          border: '1px solid rgba(124,58,237,0.35)',
          boxShadow: '0 0 60px rgba(124,58,237,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
          overflow: 'hidden',
          fontFamily: "'Space Grotesk', sans-serif",
          position: 'relative',
        }}
      >
        {/* aurora bg blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,240,255,0.1) 0%, transparent 70%)' }} />
        </div>

        {/* top bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 40%, #00f0ff 100%)' }} />

        {/* header */}
        <div style={{ padding: '20px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>ALCHEMY · ALTER EGO</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{archetypeName}</div>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>it-is-you.pl</div>
        </div>

        {/* main content */}
        <div style={{ padding: '20px 22px 24px', position: 'relative', zIndex: 1 }}>

          {/* avatar + alter ego name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            {/* user avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(0,240,255,0.2))',
              border: '2px solid rgba(124,58,237,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, overflow: 'hidden',
              boxShadow: '0 0 24px rgba(124,58,237,0.4)',
            }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 24, fontWeight: 800, color: '#c4b5fd', letterSpacing: '-0.04em' }}>{initials}</span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>Ty w popkulturze</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 4 }}>{top.name}</div>
              <div style={{
                display: 'inline-block', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#a78bfa',
                background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)',
                borderRadius: 6, padding: '3px 8px',
              }}>
                {top.context}
              </div>
            </div>
          </div>

          {/* reason / fun description */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>✦ Dlaczego?</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0 }}>{top.reason}</p>
          </div>

          {/* more alter egos */}
          {rest.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>Inne wcielenia</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {rest.map((alt) => (
                  <div key={alt.name} style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: '5px 10px',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>{alt.name}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{alt.context}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* quip */}
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', textAlign: 'center', marginTop: 4 }}>
            {quip}
          </div>
        </div>

        {/* footer */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '10px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>PSYCHOMETRY · ALCHEMY</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(124,58,237,0.7)', letterSpacing: '0.08em' }}>IT-IS-YOU.PL</div>
        </div>
      </div>

      {/* ── ACTIONS ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={download}
          disabled={downloading}
          style={{
            padding: '12px 24px', borderRadius: 14, cursor: 'pointer',
            background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
            border: 'none', color: '#fff', fontFamily: 'inherit',
            fontWeight: 700, fontSize: 14,
            boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
            opacity: downloading ? 0.6 : 1,
          }}
        >
          {downloading ? 'Generuję…' : '⬇ Pobierz PNG'}
        </button>

        <button
          onClick={copyLink}
          style={{
            padding: '12px 24px', borderRadius: 14, cursor: 'pointer',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.75)', fontFamily: 'inherit',
            fontWeight: 700, fontSize: 14,
          }}
        >
          {copied ? '✓ Skopiowano!' : '🔗 Kopiuj link'}
        </button>
      </div>

      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', maxWidth: 340, lineHeight: 1.6 }}>
        Alter ego generowane na podstawie psychometrii — HEXACO, Enneagram i testów wartości.
      </p>
    </div>
  );
}
