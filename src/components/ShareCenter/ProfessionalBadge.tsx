import { useState } from 'react';
import Toast from '../shared/Toast';

interface ProfessionalBadgeProps {
  archetypeName: string;
  archetypeSubtitle: string;
  userName: string;
  energyBoosters: string[];
  shareUrl: string;
}

/** Generates inline-CSS HTML string that works in Gmail / Outlook */
function buildEmailHtml(opts: { archetypeName: string; archetypeSubtitle: string; userName: string; energyBoosters: string[]; shareUrl: string }) {
  const bars = [
    { label: 'Energia', value: opts.energyBoosters[0] ?? '—' },
    { label: 'Komunikacja', value: opts.energyBoosters[1] ?? '—' },
  ];
  const barsHtml = bars.map(b => `
    <tr>
      <td style="padding:2px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;white-space:nowrap;padding-right:10px;">${b.label}:</td>
      <td style="padding:2px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#94a3b8;">${b.value}</td>
    </tr>`).join('');

  return `<!-- Alcheme Professional Badge -->
<table cellpadding="0" cellspacing="0" border="0" style="background:#0f172a;border-radius:10px;border:1px solid #1e293b;max-width:600px;width:100%;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:14px 18px;vertical-align:middle;border-right:1px solid #1e293b;width:52px;">
      <div style="width:46px;height:46px;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1;text-align:center;padding:10px;box-sizing:border-box;">⚡</div>
    </td>
    <td style="padding:12px 16px;vertical-align:middle;border-right:1px solid #1e293b;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#f1f5f9;margin-bottom:2px;">${opts.userName}</div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">${opts.archetypeName}</div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;margin-top:2px;">${opts.archetypeSubtitle}</div>
    </td>
    <td style="padding:12px 14px;vertical-align:middle;border-right:1px solid #1e293b;">
      <table cellpadding="0" cellspacing="0" border="0">${barsHtml}</table>
    </td>
    <td style="padding:12px 18px;vertical-align:middle;text-align:center;white-space:nowrap;">
      <a href="${opts.shareUrl}" style="display:inline-block;padding:8px 14px;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:8px;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.03em;">Read my<br>User Manual →</a>
    </td>
  </tr>
</table>`;
}

export default function ProfessionalBadge({
  archetypeName,
  archetypeSubtitle,
  userName,
  energyBoosters,
  shareUrl,
}: ProfessionalBadgeProps) {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeVariant, setActiveVariant] = useState<'banner' | 'compact'>('banner');

  const htmlCode = buildEmailHtml({ archetypeName, archetypeSubtitle, userName, energyBoosters, shareUrl });

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setToast({ type: 'success', msg: 'HTML skopiowany! Wklej go w stopce Gmail/Outlook.' });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setToast({ type: 'error', msg: 'Kopiowanie nie powiodło się. Zaznacz kod ręcznie.' });
    }
  };

  const bars = [
    { label: 'Energia', value: energyBoosters[0] ?? '—' },
    { label: 'Komunikacja', value: energyBoosters[1] ?? '—' },
  ];

  return (
    <div style={{ fontFamily: "'Space Grotesk',sans-serif" }}>

      {/* variant toggle */}
      <div className="flex items-center gap-2 mb-5">
        {(['banner', 'compact'] as const).map(v => (
          <button key={v} onClick={() => setActiveVariant(v)}
            style={{
              padding:'6px 16px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer',
              background: activeVariant===v ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
              border: activeVariant===v ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
              color: activeVariant===v ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
              transition:'all .2s',
            }}>
            {v === 'banner' ? '📧 Email Footer' : '💬 Slack Compact'}
          </button>
        ))}
      </div>

      {/* badge preview */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom:12 }}>
          Podgląd
        </div>

        {/* preview wrapper with dark bg */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'28px 24px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'auto' }}>
          {activeVariant === 'banner' ? (
            /* Banner variant */
            <div style={{ background:'#0f172a', borderRadius:10, border:'1px solid #1e293b', display:'flex', alignItems:'stretch', maxWidth:580, width:'100%', overflow:'hidden' }}>
              {/* icon col */}
              <div style={{ padding:'14px 16px', borderRight:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <div style={{ width:46, height:46, borderRadius:10, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                  ⚡
                </div>
              </div>
              {/* name + archetype */}
              <div style={{ padding:'12px 16px', borderRight:'1px solid #1e293b', flex:1, minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', marginBottom:1 }}>{userName}</div>
                <div style={{ fontSize:12, fontWeight:700, color:'#7c3aed', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>{archetypeName}</div>
                <div style={{ fontSize:11, color:'#64748b', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{archetypeSubtitle}</div>
              </div>
              {/* power bars */}
              <div style={{ padding:'12px 14px', borderRight:'1px solid #1e293b', display:'flex', flexDirection:'column', justifyContent:'center', gap:4, flexShrink:0 }}>
                {bars.map(b => (
                  <div key={b.label} style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:11, color:'#64748b', whiteSpace:'nowrap' }}>{b.label}:</span>
                    <span style={{ fontSize:11, color:'#94a3b8', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.value}</span>
                  </div>
                ))}
              </div>
              {/* CTA */}
              <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <a href={shareUrl} onClick={e=>e.preventDefault()} style={{ display:'inline-block', padding:'8px 14px', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius:8, color:'#fff', fontSize:12, fontWeight:700, textDecoration:'none', textAlign:'center', lineHeight:1.4 }}>
                  Read my<br />User Manual →
                </a>
              </div>
            </div>
          ) : (
            /* Compact / Slack variant */
            <div style={{ background:'#1e293b', borderRadius:10, border:'1px solid #334155', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, maxWidth:340, width:'100%' }}>
              <div style={{ width:36, height:36, borderRadius:8, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>⚡</div>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', marginBottom:1 }}>{userName}</div>
                <div style={{ fontSize:11, color:'#7c3aed', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em' }}>{archetypeName}</div>
              </div>
              <a href={shareUrl} onClick={e=>e.preventDefault()} style={{ fontSize:11, color:'#818cf8', textDecoration:'none', fontWeight:600, whiteSpace:'nowrap' }}>
                User Manual →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* HTML code block */}
      <div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.75)' }}>HTML do stopki email</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>Gmail: Ustawienia → Ogólne → Podpis → Wstaw HTML</div>
          </div>
          <button onClick={copyHtml}
            style={{
              display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:12,
              background: copied ? 'linear-gradient(135deg,#22c55e,#15803d)' : 'linear-gradient(135deg,#6366f1,#4f46e5)',
              border: copied ? '1px solid #22c55e66' : '1px solid rgba(99,102,241,0.5)',
              color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:13,
              cursor:'pointer', transition:'background .25s, border-color .25s',
              boxShadow: copied ? '0 4px 16px rgba(34,197,94,0.35)' : '0 4px 16px rgba(99,102,241,0.35)',
              flexShrink:0,
            }}>
            {copied ? '✓ Skopiowano!' : '📋 Kopiuj HTML'}
          </button>
        </div>

        {/* code display */}
        <div style={{
          background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12,
          padding:'16px', maxHeight:200, overflow:'auto',
          fontFamily:'ui-monospace,"Cascadia Code","Space Mono",monospace',
          fontSize:11, lineHeight:1.6, color:'rgba(255,255,255,0.5)',
          whiteSpace:'pre', wordBreak:'break-all',
        }}>
          {htmlCode}
        </div>
      </div>

      {/* instructions */}
      <div style={{ marginTop:20, padding:'16px 18px', borderRadius:14, background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.18)' }}>
        <div style={{ fontSize:12, fontWeight:700, color:'#a5b4fc', marginBottom:8 }}>📌 Jak dodać do stopki?</div>
        <ol style={{ margin:0, paddingLeft:16, color:'rgba(255,255,255,0.5)', fontSize:12, lineHeight:1.8 }}>
          <li>Skopiuj powyższy kod HTML</li>
          <li><strong style={{ color:'rgba(255,255,255,0.7)' }}>Gmail:</strong> Ustawienia → Ogólne → Podpis → przycisk &lt;/&gt;</li>
          <li><strong style={{ color:'rgba(255,255,255,0.7)' }}>Outlook:</strong> Plik → Opcje → Poczta → Podpisy → Edytuj źródło</li>
          <li>Zapisz i gotowe — Twój profil psychometryczny w stopce ✅</li>
        </ol>
      </div>

      {toast && <Toast type={toast.type} message={toast.msg} onDone={() => setToast(null)} />}
    </div>
  );
}
