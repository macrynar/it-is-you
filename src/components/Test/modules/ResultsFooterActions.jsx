import React, { useState } from 'react';
import ConfirmModal from '../../shared/ConfirmModal';

export default function ResultsFooterActions({
  dashboardHref = '/user-profile-tests.html',
  retakeHref = '/test',
  confirmMessage = 'Czy na pewno chcesz wykonać test ponownie?',
}) {
  const borderColor = 'rgba(255,255,255,.12)';
  const btnBase = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '13px 22px',
    borderRadius: 12,
    background: 'rgba(255,255,255,.06)',
    border: `1px solid ${borderColor}`,
    color: 'rgba(255,255,255,.75)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 1,
    transition: 'background .2s ease, border-color .2s ease, color .2s ease',
  };

  const onEnter = (e) => {
    e.currentTarget.style.background = 'rgba(255,255,255,.1)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)';
    e.currentTarget.style.color = '#fff';
  };

  const onLeave = (e) => {
    e.currentTarget.style.background = btnBase.background;
    e.currentTarget.style.borderColor = borderColor;
    e.currentTarget.style.color = btnBase.color;
  };

  const [showConfirm, setShowConfirm] = useState(false);

  const go = (href) => {
    window.location.href = href;
  };

  const handleRetake = () => {
    if (!confirmMessage) { go(retakeHref); return; }
    setShowConfirm(true);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>
      <button
        type="button"
        onClick={() => go(dashboardHref)}
        style={btnBase}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        ← Wróć do dashboardu
      </button>
      <button
        type="button"
        onClick={handleRetake}
        style={btnBase}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        ↻ Ponów test
      </button>
      {showConfirm && (
        <ConfirmModal
          message={confirmMessage}
          confirmLabel="Tak, ponów test"
          onConfirm={() => { setShowConfirm(false); go(retakeHref); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
