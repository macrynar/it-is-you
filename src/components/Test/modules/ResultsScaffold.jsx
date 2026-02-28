import React from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const DEFAULT_MAX_WIDTH = 1100;

function formatPlDate(dateLike) {
  if (!dateLike) return '';
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ResultsScaffold({
  accent = '#38b6ff',
  maxWidth = DEFAULT_MAX_WIDTH,
  navLabel,
  badge,
  title,
  subtitle,
  completedAt,
  dashboardHref = '/user-profile-tests.html',
  retakeHref = '/test',
  confirmMessage = 'Czy na pewno chcesz wykonać test ponownie?',
  children,
}) {
  const container = {
    maxWidth,
    margin: '0 auto',
    padding: '48px 32px 80px',
    position: 'relative',
    zIndex: 1,
  };

  const navShell = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid rgba(255,255,255,.06)',
    background: 'rgba(13,15,43,.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };

  const navInner = {
    maxWidth,
    margin: '0 auto',
    padding: '14px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  };

  const navLeft = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,.7)',
    cursor: 'pointer',
    font: '600 .9rem "Space Grotesk",sans-serif',
    padding: 0,
    transition: 'color .2s ease',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  };

  const navMid = {
    fontSize: '.78rem',
    fontWeight: 700,
    letterSpacing: '1.6px',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,.32)',
    whiteSpace: 'nowrap',
  };

  const navRight = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255,255,255,.06)',
    border: `1px solid rgba(255,255,255,.12)`,
    borderRadius: 10,
    padding: '8px 16px',
    color: 'rgba(255,255,255,.75)',
    cursor: 'pointer',
    font: '700 .85rem "Space Grotesk",sans-serif',
    transition: 'background .2s ease, border-color .2s ease, color .2s ease',
    whiteSpace: 'nowrap',
  };

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 18px',
    borderRadius: 999,
    background: `${accent}1a`,
    border: `1px solid ${accent}55`,
    fontSize: 13,
    fontWeight: 700,
    color: accent,
    letterSpacing: '.5px',
    marginBottom: 14,
  };

  const titleStyle = {
    fontSize: 'clamp(1.85rem,4vw,2.65rem)',
    fontWeight: 850,
    letterSpacing: '-.6px',
    margin: '0 0 10px',
    lineHeight: 1.1,
  };

  const subtitleStyle = {
    fontSize: 14,
    color: 'rgba(255,255,255,.38)',
    margin: 0,
    lineHeight: 1.6,
  };

  const metaStyle = {
    marginTop: 10,
    fontSize: 12,
    color: 'rgba(255,255,255,.26)',
  };

  const [showConfirm, setShowConfirm] = useState(false);

  const go = (href) => {
    window.location.href = href;
  };

  const onBack = () => go(dashboardHref);

  const onRetake = () => {
    if (!confirmMessage) { go(retakeHref); return; }
    setShowConfirm(true);
  };

  const onEnterLeft = (e) => {
    e.currentTarget.style.color = '#fff';
  };

  const onLeaveLeft = (e) => {
    e.currentTarget.style.color = navLeft.color;
  };

  const onEnterRight = (e) => {
    e.currentTarget.style.background = 'rgba(255,255,255,.1)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)';
    e.currentTarget.style.color = '#fff';
  };

  const onLeaveRight = (e) => {
    e.currentTarget.style.background = navRight.background;
    e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)';
    e.currentTarget.style.color = navRight.color;
  };

  const dateStr = formatPlDate(completedAt);

  return (
    <>
      <nav style={navShell}>
        <div style={navInner}>
          <button type="button" onClick={onBack} style={navLeft} onMouseEnter={onEnterLeft} onMouseLeave={onLeaveLeft}>
            <ArrowLeft size={18} /> Wróć do dashboardu
          </button>

          <span style={navMid}>{navLabel}</span>

          <button type="button" onClick={onRetake} style={navRight} onMouseEnter={onEnterRight} onMouseLeave={onLeaveRight}>
            <RefreshCw size={15} /> Ponów test
          </button>
        </div>
      </nav>

      <div style={container}>
        <header style={{ textAlign: 'center', marginBottom: 36 }}>
          {badge ? <div style={badgeStyle}>{badge}</div> : null}
          {title ? (
            <h1 style={titleStyle}>{title}</h1>
          ) : null}
          {subtitle ? <p style={subtitleStyle}>{subtitle}</p> : null}
          {dateStr ? <div style={metaStyle}>Ukończono: {dateStr}</div> : null}
        </header>

        {children}
      </div>
      {showConfirm && (
        <ConfirmModal
          message={confirmMessage}
          confirmLabel="Tak, ponów test"
          accent={accent}
          onConfirm={() => { setShowConfirm(false); go(retakeHref); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
