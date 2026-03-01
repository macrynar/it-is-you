import React from 'react';
import { RefreshCw, Lock } from 'lucide-react';
import { useIsPremium } from '../../utils/useIsPremium';

/**
 * Renders a GPT markdown interpretation with styled sections.
 * Handles: ## headings, **bold**, *italic*, --- divider, plain paragraphs.
 */
function renderMarkdown(text, accentColor = '#a29bfe') {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ## Heading
    if (line.startsWith('## ')) {
      const headingText = line.slice(3).trim();
      elements.push(
        <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginTop: elements.length > 0 ? 28 : 0, marginBottom:12 }}>
          <span style={{ width:3, height:20, borderRadius:2, background:accentColor, flexShrink:0, boxShadow:`0 0 8px ${accentColor}` }}/>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#fff', letterSpacing:'.2px' }}>{headingText}</h3>
        </div>
      );
      i++;
      continue;
    }

    // --- divider
    if (line.trim() === '---') {
      elements.push(
        <div key={i} style={{ height:1, background:'rgba(255,255,255,.08)', margin:'20px 0' }}/>
      );
      i++;
      continue;
    }

    // empty line — skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Regular paragraph (may contain **bold** and *italic*)
    const rendered = renderInline(line.trim(), accentColor);
    if (rendered) {
      // Check if it's a purely italic line (the "essence" quote at the end)
      const isEssence = line.trim().startsWith('*') && line.trim().endsWith('*') && !line.trim().startsWith('**');
      elements.push(
        isEssence
          ? <p key={i} style={{ margin:0, fontSize:14, fontStyle:'italic', color:accentColor, borderLeft:`2px solid ${accentColor}66`, paddingLeft:14, lineHeight:1.7 }}>{rendered}</p>
          : <p key={i} style={{ margin:'0 0 4px', fontSize:14, color:'rgba(255,255,255,.7)', lineHeight:1.75 }}>{rendered}</p>
      );
    }
    i++;
  }

  return elements;
}

function renderInline(text, accentColor) {
  // Split on **bold** and *italic* markers
  const parts = [];
  // Regex: **text** or *text* (non-greedy)
  const rx = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let match;
  let key = 0;
  while ((match = rx.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<React.Fragment key={key++}>{text.slice(last, match.index)}</React.Fragment>);
    }
    const raw = match[0];
    if (raw.startsWith('**')) {
      parts.push(<strong key={key++} style={{ color:'#fff', fontWeight:700 }}>{raw.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={key++} style={{ color:accentColor, fontStyle:'italic' }}>{raw.slice(1, -1)}</em>);
    }
    last = match.index + raw.length;
  }
  if (last < text.length) {
    parts.push(<React.Fragment key={key++}>{text.slice(last)}</React.Fragment>);
  }
  return parts.length > 0 ? parts : text;
}

/* ─── The full AI panel component ─── */
export default function AiInterpretation({
  interpretation,   // string | null
  loading,          // bool
  error,            // string | null
  onRegenerate,     // fn
  onRetry,          // fn
  accentColor = '#a29bfe',
  accentGlow = 'rgba(162,155,254,.4)',
  testLabel = 'Twojego profilu',
}) {
  const { isPremium } = useIsPremium();
  const shimmerStyle = {
    background: 'linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.05) 75%)',
    backgroundSize: '600px 100%',
    animation: 'aiShimmer 1.8s ease-in-out infinite',
    borderRadius: 7,
    height: 14,
  };

  return (
    <>
      <style>{`@keyframes aiShimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`${accentColor}25`, border:`1px solid ${accentColor}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>Analiza Silnika Neuronalnego (NEA®)</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.35)' }}>Spersonalizowana analiza {testLabel}</div>
          </div>
        </div>
        {interpretation && !loading && (
          isPremium ? (
            <button onClick={onRegenerate}
              style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'rgba(255,255,255,.4)', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'7px 14px', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}
              onMouseEnter={e => { e.currentTarget.style.color = accentColor; e.currentTarget.style.borderColor = `${accentColor}66`; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; }}>
              <RefreshCw size={12}/> Regeneruj
            </button>
          ) : (
            <a href="/pricing"
              title="Dostępne dla użytkowników Premium"
              style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'rgba(255,255,255,.2)', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:8, padding:'7px 14px', cursor:'pointer', fontFamily:'inherit', fontWeight:600, textDecoration:'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f59e0b'; e.currentTarget.style.borderColor = 'rgba(245,158,11,.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'; }}>
              <Lock size={11}/> Regeneruj <span style={{fontSize:10,letterSpacing:'.05em',color:'#f59e0b'}}>PREMIUM</span>
            </a>
          )
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:accentColor, animation:'aiShimmer 1s linear infinite' }}/>
            <span style={{ fontSize:13, color:accentColor, fontWeight:600 }}>Generuję interpretację...</span>
          </div>
          {[1,.88,.95,.76,.92,.65,.85,.7,.9,.6].map((w, i) => (
            <div key={i} style={{ ...shimmerStyle, width:`${w*100}%`, marginTop: i === 4 ? 12 : 0 }}/>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:12, padding:'16px 20px', textAlign:'center' }}>
          <p style={{ color:'rgba(239,68,68,.8)', fontSize:13, marginBottom:8 }}>{error}</p>
          <button onClick={onRetry} style={{ fontSize:12, color:'rgba(255,255,255,.4)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', textDecoration:'underline' }}>Spróbuj ponownie</button>
        </div>
      )}

      {/* Rendered markdown */}
      {interpretation && !loading && (
        <div>
          {renderMarkdown(interpretation, accentColor)}
          <div style={{ borderTop:'1px solid rgba(255,255,255,.05)', paddingTop:12, marginTop:20 }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.2)' }}>Analiza Silnika Neuronalnego (NEA®) · Nie diagnoza medyczna</div>
          </div>
        </div>
      )}
    </>
  );
}
