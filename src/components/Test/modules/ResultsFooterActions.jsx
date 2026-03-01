import React, { useState } from 'react';
import { Lock, RefreshCw } from 'lucide-react';
import ConfirmModal from '../../shared/ConfirmModal';
import { useIsPremium } from '../../../utils/useIsPremium';

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
  const { isPremium } = useIsPremium();

  const go = (href) => {
    window.location.href = href;
  };

  const handleRetake = () => {
    if (!isPremium) { window.location.href = '/pricing'; return; }
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
        style={isPremium ? btnBase : {...btnBase, color:'rgba(255,255,255,.3)', borderColor:'rgba(255,255,255,.07)'}}
        onMouseEnter={isPremium ? onEnter : e=>{e.currentTarget.style.color='#f59e0b';e.currentTarget.style.borderColor='rgba(245,158,11,.3)';}}
        onMouseLeave={isPremium ? onLeave : e=>{e.currentTarget.style.color='rgba(255,255,255,.3)';e.currentTarget.style.borderColor='rgba(255,255,255,.07)';}}
        title={isPremium ? undefined : 'Dostępne dla użytkowników Premium'}>
        {isPremium ? <RefreshCw size={14}/> : <Lock size={14}/>} Ponów test{!isPremium && <span style={{fontSize:10,letterSpacing:'.05em',color:'#f59e0b',marginLeft:4}}>PREMIUM</span>}
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
