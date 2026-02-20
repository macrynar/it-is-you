import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.js';
import { ENNEAGRAM_TEST } from '../../data/tests/enneagram.js';
import AiInterpretation from './AiInterpretation.jsx';

/* ─────────────── Per-type accent palette ─────────────── */
const TYPE_ACCENT = {
  1: { name:'Reformista',  color:'#ff6b6b', gradient:'linear-gradient(90deg,#c0392b,#ff6b6b)', glow:'rgba(255,107,107,.5)',  blob:'#ff6b6b' },
  2: { name:'Pomocnik',    color:'#ff9ff3', gradient:'linear-gradient(90deg,#8e44ad,#ff9ff3)', glow:'rgba(255,159,243,.5)',  blob:'#ff9ff3' },
  3: { name:'Osiągacz',    color:'#ffd32a', gradient:'linear-gradient(90deg,#a0760a,#ffd32a)', glow:'rgba(255,211,42,.5)',   blob:'#ffd32a' },
  4: { name:'Indywidualista', color:'#a29bfe', gradient:'linear-gradient(90deg,#4a0080,#a29bfe)', glow:'rgba(162,155,254,.5)', blob:'#a29bfe' },
  5: { name:'Badacz',      color:'#55efc4', gradient:'linear-gradient(90deg,#00695c,#55efc4)', glow:'rgba(85,239,196,.5)',   blob:'#55efc4' },
  6: { name:'Lojalista',   color:'#74b9ff', gradient:'linear-gradient(90deg,#0a3d8a,#74b9ff)', glow:'rgba(116,185,255,.5)', blob:'#74b9ff' },
  7: { name:'Entuzjasta',  color:'#fd9644', gradient:'linear-gradient(90deg,#a04000,#fd9644)', glow:'rgba(253,150,68,.5)',   blob:'#fd9644' },
  8: { name:'Wyzywacz',    color:'#ff4757', gradient:'linear-gradient(90deg,#7f0000,#ff4757)', glow:'rgba(255,71,87,.5)',    blob:'#ff4757' },
  9: { name:'Mediator',    color:'#26de81', gradient:'linear-gradient(90deg,#006633,#26de81)', glow:'rgba(38,222,129,.5)',   blob:'#26de81' },
};

/* ─────────────── CSS ─────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');

.en-root {
  font-family: 'Space Grotesk', sans-serif;
  background: #0d0f2b;
  color: #fff;
  min-height: 100vh;
  overflow-x: hidden;
}
.en-root::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 60% 40% at 20% 15%, rgba(217,70,239,.12) 0%, transparent 65%),
    radial-gradient(ellipse 50% 45% at 80% 80%, rgba(217,70,239,.07) 0%, transparent 65%),
    radial-gradient(ellipse 35% 30% at 50% 50%, rgba(80,40,160,.07) 0%, transparent 65%);
}
.en-glass {
  background: rgba(16,20,56,.6);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-radius: 20px;
  position: relative;
  isolation: isolate;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.1),
    0 0 0 1px rgba(255,255,255,.07),
    0 8px 32px -4px rgba(0,0,0,.6),
    0 2px 8px -2px rgba(0,0,0,.4);
}
.en-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(145deg, rgba(255,255,255,.18) 0%, rgba(217,70,239,.2) 35%, rgba(217,70,239,.1) 65%, rgba(255,255,255,.04) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
.en-bar-fill {
  height: 100%;
  border-radius: 100px;
  position: relative;
  transition: width 1s cubic-bezier(.22,.68,0,1.1);
}
.en-bar-fill::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 8px rgba(255,255,255,.6);
}
@keyframes spinLoader { to { transform: rotate(360deg); } }
@keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.en-shimmer {
  background: linear-gradient(90deg, rgba(255,255,255,.05) 25%, rgba(255,255,255,.1) 50%, rgba(255,255,255,.05) 75%);
  background-size: 600px 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}
.en-fade-up { animation: fadeUp .5s ease both; }
.en-card {
  transition: transform .28s cubic-bezier(.22,.68,0,1.15), box-shadow .28s ease;
}
.en-glow-line {
  position: absolute;
  bottom: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  border-radius: 100px;
  opacity: 0;
  transition: opacity .3s;
  pointer-events: none;
  z-index: 2;
}
.en-card:hover .en-glow-line { opacity: 1; }
`;

const G = {
  background: 'rgba(16,20,56,.6)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,.07)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.1),0 8px 32px -4px rgba(0,0,0,.6)',
  borderRadius: 20,
};

/* ─────────────── Enneagram circle diagram ─────────────── */
const CX = 200, CY = 200, R = 155;
function typePos(t) {
  const a = ((t - 1) / 9 * 360 - 90) * Math.PI / 180;
  return [CX + R * Math.cos(a), CY + R * Math.sin(a)];
}
// classic enneagram connecting lines (inner pentagram + inner triangle)
const INNER_LINES = [[1,4],[4,2],[2,8],[8,5],[5,7],[7,1], [3,6],[6,9],[9,3]];

function EnneagramDiagram({ primaryType, allScores }) {
  const ac = TYPE_ACCENT[primaryType] || TYPE_ACCENT[1];
  const maxScore = Math.max(...Object.values(allScores));
  return (
    <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: 380, height: 'auto', overflow: 'visible' }}>
      <defs>
        <radialGradient id="enGradBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(217,70,239,.08)"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
        <filter id="enGlow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* background glow circle */}
      <circle cx={CX} cy={CY} r={R + 20} fill="url(#enGradBg)"/>

      {/* ring */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1"/>
      <circle cx={CX} cy={CY} r={R * 0.6} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1"/>
      <circle cx={CX} cy={CY} r={R * 0.2} fill="none" stroke="rgba(255,255,255,.03)" strokeWidth="1"/>

      {/* inner connecting lines */}
      {INNER_LINES.map(([a, b], i) => {
        const [x1, y1] = typePos(a);
        const [x2, y2] = typePos(b);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,.07)" strokeWidth="1"/>;
      })}

      {/* score arcs / spokes */}
      {[1,2,3,4,5,6,7,8,9].map(t => {
        const [ex, ey] = typePos(t);
        const score = allScores[t] || allScores[String(t)] || 0;
        const pct = maxScore > 0 ? score / maxScore : 0;
        const [dx, dy] = [CX + (ex - CX) * pct, CY + (ey - CY) * pct];
        const isPrimary = t === primaryType;
        return (
          <g key={t}>
            <line x1={CX} y1={CY} x2={ex} y2={ey} stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
            {isPrimary && (
              <line x1={CX} y1={CY} x2={dx} y2={dy}
                stroke={ac.color} strokeWidth="2.5"
                style={{ filter: `drop-shadow(0 0 6px ${ac.color})` }}/>
            )}
            {!isPrimary && (
              <line x1={CX} y1={CY} x2={dx} y2={dy}
                stroke="rgba(255,255,255,.2)" strokeWidth="1.5"/>
            )}
          </g>
        );
      })}

      {/* type nodes */}
      {[1,2,3,4,5,6,7,8,9].map(t => {
        const [nx, ny] = typePos(t);
        const isPrimary = t === primaryType;
        const nodeAc = TYPE_ACCENT[t];
        return (
          <g key={t}>
            {isPrimary && (
              <circle cx={nx} cy={ny} r={22} fill={`${ac.color}22`}
                stroke={ac.color} strokeWidth="1.5"
                style={{ filter: `drop-shadow(0 0 16px ${ac.color})` }}/>
            )}
            <circle cx={nx} cy={ny} r={isPrimary ? 14 : 9}
              fill={isPrimary ? ac.color : `${nodeAc.color}40`}
              stroke={nodeAc.color}
              strokeWidth={isPrimary ? 2 : 1}
              style={isPrimary ? { filter: `drop-shadow(0 0 12px ${ac.color})` } : {}}
            />
            <text x={nx} y={ny + 4} textAnchor="middle"
              style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize: isPrimary ? 12 : 9, fontWeight: 700, fill: '#fff' }}
            >{t}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function EnneagramResults() {
  const [results,        setResults]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [aiInterp,       setAiInterp]       = useState(null);
  const [aiLoading,      setAiLoading]      = useState(false);
  const [aiError,        setAiError]        = useState(null);

  useEffect(() => { loadResults(); }, []);

  const loadResults = async () => {
    try {
      const { data: { user }, error: ue } = await supabase.auth.getUser();
      if (ue || !user) throw new Error('Nie jesteś zalogowany');

      // Load test results + cached interpretation in parallel
      const [{ data, error: fe }, { data: cached }] = await Promise.all([
        supabase.from('user_psychometrics').select('*')
          .eq('user_id', user.id).eq('test_type', 'ENNEAGRAM')
          .order('completed_at', { ascending: false }).limit(1),
        supabase.from('ai_interpretations').select('interpretation')
          .eq('user_id', user.id).eq('test_type', 'ENNEAGRAM')
          .maybeSingle(),
      ]);

      if (fe) throw fe;
      if (!data?.length) { setError('Nie znaleziono wyników testu. Wykonaj test ponownie.'); setLoading(false); return; }
      setResults(data[0]);
      setLoading(false);

      if (cached?.interpretation) {
        // Instant — no skeleton
        setAiInterp(cached.interpretation);
      } else {
        // Generate fresh
        generateInterpretation(data[0]);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const generateInterpretation = async (r) => {
    setAiLoading(true); setAiError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Brak sesji');
      const { data: d, error: fnErr } = await supabase.functions.invoke('interpret-test', {
        body: { test_type: 'ENNEAGRAM', raw_scores: r.raw_scores, report: r.report },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (fnErr) throw fnErr;
      setAiInterp(d?.interpretation ?? null);
    } catch (err) {
      setAiError('Nie udało się wygenerować interpretacji AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const regenerate = async () => {
    if (!results) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('ai_interpretations').delete().eq('user_id', user.id).eq('test_type', 'ENNEAGRAM');
    setAiInterp(null);
    generateInterpretation(results);
  };

  const handleRetake = () => {
    if (confirm('Czy na pewno chcesz wykonać test ponownie? Obecne wyniki zostaną zastąpione.')) {
      window.location.href = '/test?type=enneagram';
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <><style>{CSS}</style>
    <div className="en-root" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44, height:44, border:'3px solid rgba(217,70,239,.25)', borderTopColor:'#d946ef', borderRadius:'50%', animation:'spinLoader 1s linear infinite', margin:'0 auto 16px' }}/>
        <p style={{ color:'rgba(255,255,255,.4)', fontSize:13 }}>Ładowanie wyników...</p>
      </div>
    </div></>
  );

  /* ── Error ── */
  if (error || !results) return (
    <><style>{CSS}</style>
    <div className="en-root" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:24, minHeight:'100vh' }}>
      <div className="en-glass" style={{ ...G, padding:40, textAlign:'center', maxWidth:380 }}>
        <div style={{ fontSize:44, marginBottom:16 }}>⚠️</div>
        <p style={{ color:'rgba(255,255,255,.7)', marginBottom:24, lineHeight:1.6 }}>{error || 'Nie znaleziono wyników testu'}</p>
        <button onClick={() => window.location.href='/test?type=enneagram'} style={{ background:'linear-gradient(135deg,#7b1fa2,#d946ef)', color:'#fff', border:'none', borderRadius:10, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>Wykonaj Test</button>
      </div>
    </div></>
  );

  /* ── Data ── */
  const primaryType  = results.report.primary_type;
  const wing         = results.report.wing;
  const tritype      = results.report.tritype;
  const allScores    = results.raw_scores;
  const interp       = primaryType.interpretation;
  const ac           = TYPE_ACCENT[primaryType.type] || TYPE_ACCENT[1];
  const maxScore     = Math.max(...Object.values(allScores));

  const sortedTypes = Object.entries(allScores)
    .map(([k, v]) => ({ type: parseInt(k), score: v }))
    .sort((a, b) => b.score - a.score);

  const hoverOn = (color, glow) => e => {
    e.currentTarget.style.transform = 'translateY(-5px) scale(1.01)';
    e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px ${color}55,0 0 30px -4px ${glow},0 16px 48px -6px rgba(0,0,0,.7)`;
  };
  const hoverOff = e => {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = G.boxShadow;
  };

  return (
    <><style>{CSS}</style>
    <div className="en-root">

      {/* ── Nav ── */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 40px', borderBottom:'1px solid rgba(255,255,255,.05)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:100, background:'rgba(13,15,43,.88)' }}>
        <button onClick={() => window.location.href='/user-profile-tests.html'}
          style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', color:'rgba(255,255,255,.5)', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:500, padding:0 }}
          onMouseEnter={e => e.currentTarget.style.color='#fff'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.5)'}>
          <ArrowLeft size={18}/> Dashboard
        </button>
        <button onClick={handleRetake}
          style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.55)', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600, borderRadius:8, padding:'8px 16px' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.1)'; e.currentTarget.style.color='#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.color='rgba(255,255,255,.55)'; }}>
          <RefreshCw size={14}/> Powtórz Test
        </button>
      </nav>

      <div style={{ maxWidth:1160, margin:'0 auto', padding:'48px 40px 80px', position:'relative', zIndex:1 }}>

        {/* ── Header ── */}
        <header style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 18px', borderRadius:100, background:'#d946ef18', border:'1px solid #d946ef44', fontSize:13, fontWeight:600, color:'#d946ef', letterSpacing:'.5px', marginBottom:14 }}>
            🔮 Soul Blueprint
          </div>
          <div style={{ fontSize:32, fontWeight:800, letterSpacing:'-.5px', margin:'0 0 8px' }}>
            Twoje wyniki <span style={{ color:'#d946ef' }}>Enneagram</span>
          </div>
          <p style={{ fontSize:14, color:'rgba(255,255,255,.35)', margin:0 }}>
            <strong style={{ color:'rgba(255,255,255,.55)', fontWeight:500 }}>Test Enneagramu</strong> · Poznaj swoją głęboką motywację i wzorzec osobowości
          </p>
        </header>

        {/* ── Main 2-column: Diagram + Type Card ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:24, marginBottom:24 }}>

          {/* Enneagram circle diagram */}
          <div className="en-glass en-card" style={{ ...G, padding:36, overflow:'hidden' }}
            onMouseEnter={hoverOn(ac.color, ac.glow)}
            onMouseLeave={hoverOff}>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'rgba(255,255,255,.3)', marginBottom:28, display:'flex', alignItems:'center', gap:12 }}>
              Mapa Osobowości <span style={{ flex:1, height:1, background:`linear-gradient(90deg,${ac.color}44,transparent)` }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'center' }}>
              <EnneagramDiagram primaryType={primaryType.type} allScores={allScores}/>
            </div>
            <div className="en-glow-line" style={{ background:ac.color, boxShadow:`0 0 10px 2px ${ac.glow}` }}/>
          </div>

          {/* Type Card */}
          <div className="en-glass en-card" style={{ ...G, padding:'28px 24px', display:'flex', flexDirection:'column', gap:18, overflow:'hidden' }}
            onMouseEnter={hoverOn(ac.color, ac.glow)}
            onMouseLeave={hoverOff}>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'rgba(255,255,255,.3)' }}>Twój Typ</div>

            {/* Big type number */}
            <div style={{ background:`${ac.color}12`, border:`1px solid ${ac.color}30`, borderRadius:16, padding:'20px 18px', textAlign:'center' }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:'2.5px', textTransform:'uppercase', color:ac.color, marginBottom:4 }}>Typ Enneagram</div>
              <div style={{ fontSize:64, fontWeight:900, lineHeight:1, color:ac.color, textShadow:`0 0 30px ${ac.glow}`, marginBottom:4 }}>
                {primaryType.type}
              </div>
              <div style={{ fontSize:22, fontWeight:700, color:'#fff', marginBottom:2 }}>{primaryType.name}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,.4)', fontStyle:'italic', marginBottom:10 }}>"{primaryType.name_en}"</div>
              {wing && (
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600, color:'#d946ef', background:'rgba(217,70,239,.1)', border:'1px solid rgba(217,70,239,.3)', padding:'4px 10px', borderRadius:100 }}>
                  🪶 Skrzydło {wing.type}
                </div>
              )}
            </div>

            <div style={{ height:1, background:'rgba(255,255,255,.07)' }}/>

            {/* Description */}
            <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', lineHeight:1.65, margin:0 }}>
              {primaryType.description}
            </p>

            <div style={{ height:1, background:'rgba(255,255,255,.07)' }}/>

            {/* Tritype badge */}
            {tritype && tritype.length >= 3 && (
              <div>
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'rgba(255,255,255,.3)', marginBottom:8 }}>Tritype</div>
                <div style={{ display:'flex', gap:8 }}>
                  {tritype.slice(0,3).map(td => {
                    const nodeAc = TYPE_ACCENT[td.type] || TYPE_ACCENT[1];
                    return (
                      <div key={td.type} style={{ flex:1, background:`${nodeAc.color}12`, border:`1px solid ${nodeAc.color}30`, borderRadius:10, padding:'8px 4px', textAlign:'center' }}>
                        <div style={{ fontSize:18, fontWeight:800, color:nodeAc.color }}>{td.type}</div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,.35)' }}>{nodeAc.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ height:1, background:'rgba(255,255,255,.07)' }}/>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.25)' }}>
              Ukończono {new Date(results.completed_at).toLocaleDateString('pl-PL')}
            </div>
            <div className="en-glow-line" style={{ background:ac.color, boxShadow:`0 0 10px 2px ${ac.glow}` }}/>
          </div>
        </div>

        {/* ── Core Motivation + Basic Fear ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
          <div className="en-glass en-card" style={{ ...G, padding:28, overflow:'hidden' }}
            onMouseEnter={hoverOn('#55efc4','rgba(85,239,196,.4)')}
            onMouseLeave={hoverOff}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:'2.5px', textTransform:'uppercase', color:'#55efc4', marginBottom:10 }}>✨ Podstawowa Motywacja</div>
            <p style={{ fontSize:16, color:'#fff', lineHeight:1.6, margin:0, fontWeight:500 }}>{primaryType.core_motivation}</p>
            <div className="en-glow-line" style={{ background:'#55efc4', boxShadow:'0 0 10px 2px rgba(85,239,196,.5)' }}/>
          </div>
          <div className="en-glass en-card" style={{ ...G, padding:28, overflow:'hidden' }}
            onMouseEnter={hoverOn('#ff6b81','rgba(255,107,129,.4)')}
            onMouseLeave={hoverOff}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:'2.5px', textTransform:'uppercase', color:'#ff6b81', marginBottom:10 }}>⚠️ Podstawowy Lęk</div>
            <p style={{ fontSize:16, color:'#fff', lineHeight:1.6, margin:0, fontWeight:500 }}>{primaryType.basic_fear}</p>
            <div className="en-glow-line" style={{ background:'#ff6b81', boxShadow:'0 0 10px 2px rgba(255,107,129,.5)' }}/>
          </div>
        </div>

        {/* ── Strengths + Challenges ── */}
        {interp && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
            <div className="en-glass en-card" style={{ ...G, padding:28, overflow:'hidden' }}
              onMouseEnter={hoverOn('#55efc4','rgba(85,239,196,.4)')}
              onMouseLeave={hoverOff}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'rgba(255,255,255,.3)', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
                💪 Mocne Strony <span style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(85,239,196,.2),transparent)' }}/>
              </div>
              <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:10 }}>
                {interp.strengths?.map((s, i) => (
                  <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#55efc4', marginTop:6, flexShrink:0, boxShadow:'0 0 6px rgba(85,239,196,.5)' }}/>
                    <span style={{ fontSize:14, color:'rgba(255,255,255,.7)', lineHeight:1.55 }}>{s}</span>
                  </li>
                ))}
              </ul>
              <div className="en-glow-line" style={{ background:'#55efc4', boxShadow:'0 0 10px 2px rgba(85,239,196,.5)' }}/>
            </div>
            <div className="en-glass en-card" style={{ ...G, padding:28, overflow:'hidden' }}
              onMouseEnter={hoverOn('#fd9644','rgba(253,150,68,.4)')}
              onMouseLeave={hoverOff}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'rgba(255,255,255,.3)', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
                ⚡ Wyzwania <span style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(253,150,68,.2),transparent)' }}/>
              </div>
              <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:10 }}>
                {interp.challenges?.map((c, i) => (
                  <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#fd9644', marginTop:6, flexShrink:0, boxShadow:'0 0 6px rgba(253,150,68,.5)' }}/>
                    <span style={{ fontSize:14, color:'rgba(255,255,255,.7)', lineHeight:1.55 }}>{c}</span>
                  </li>
                ))}
              </ul>
              <div className="en-glow-line" style={{ background:'#fd9644', boxShadow:'0 0 10px 2px rgba(253,150,68,.5)' }}/>
            </div>
          </div>
        )}

        {/* ── Growth Path ── */}
        {interp?.growth_path && (
          <div className="en-glass en-card" style={{ ...G, padding:32, marginBottom:24, overflow:'hidden' }}
            onMouseEnter={hoverOn('#d946ef','rgba(217,70,239,.5)')}
            onMouseLeave={hoverOff}>
            <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:400, height:200, background:'rgba(217,70,239,.06)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' }}/>
            <div className="en-glow-line" style={{ background:'#d946ef', boxShadow:'0 0 10px 2px rgba(217,70,239,.5)' }}/>
            <div style={{ position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`${ac.color}20`, border:`1px solid ${ac.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌱</div>
                <div style={{ fontSize:16, fontWeight:700 }}>Ścieżka Rozwoju</div>
              </div>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.75)', lineHeight:1.75, margin:0 }}>{interp.growth_path}</p>
            </div>
          </div>
        )}

        {/* ── All Type Scores ── */}
        <div className="en-glass en-card" style={{ ...G, padding:32, marginBottom:24, overflow:'hidden' }}
          onMouseEnter={hoverOn('#d946ef','rgba(217,70,239,.5)')}
          onMouseLeave={hoverOff}>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'rgba(255,255,255,.3)', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
            Wszystkie Typy <span style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(217,70,239,.2),transparent)' }}/>
          </div>
          <div className="en-glow-line" style={{ background:'#d946ef', boxShadow:'0 0 10px 2px rgba(217,70,239,.5)' }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {sortedTypes.map(({ type, score }) => {
              const typeAc = TYPE_ACCENT[type] || TYPE_ACCENT[1];
              const typeDef = ENNEAGRAM_TEST.types.find(t => t.id === type);
              const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
              const isPrimary = type === primaryType.type;
              return (
                <div key={type}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:`${typeAc.color}20`, border:`1px solid ${typeAc.color}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:typeAc.color, flexShrink:0 }}>{type}</div>
                      <span style={{ fontSize:14, fontWeight: isPrimary ? 700 : 500, color: isPrimary ? '#fff' : 'rgba(255,255,255,.6)' }}>
                        Typ {type} – {typeDef?.name}
                        {isPrimary && <span style={{ marginLeft:8, fontSize:11, fontWeight:700, color:typeAc.color, background:`${typeAc.color}18`, border:`1px solid ${typeAc.color}40`, padding:'2px 8px', borderRadius:100 }}>TWÓJ TYP</span>}
                      </span>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color: isPrimary ? typeAc.color : 'rgba(255,255,255,.4)' }}>{score}</span>
                  </div>
                  <div style={{ height:4, borderRadius:100, background:'rgba(255,255,255,.07)', overflow:'visible', position:'relative' }}>
                    <div className="en-bar-fill" style={{ width:`${pct}%`, background:typeAc.gradient, boxShadow: isPrimary ? `0 0 12px ${typeAc.glow}` : 'none' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── AI Interpretation ── */}
        <div className="en-glass en-card" style={{ ...G, padding:36, marginBottom:32, overflow:'hidden' }}
          onMouseEnter={hoverOn('#d946ef','rgba(217,70,239,.5)')}
          onMouseLeave={hoverOff}>
          <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:400, height:180, background:'rgba(217,70,239,.06)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' }}/>
          <div className="en-glow-line" style={{ background:'#d946ef', boxShadow:'0 0 10px 2px rgba(217,70,239,.5)' }}/>
          <div style={{ position:'relative' }}>
            <AiInterpretation
              interpretation={aiInterp}
              loading={aiLoading}
              error={aiError}
              onRegenerate={regenerate}
              onRetry={() => generateInterpretation(results)}
              accentColor='#d946ef'
              accentGlow='rgba(217,70,239,.5)'
              testLabel="Twojego profilu Enneagram"
            />
          </div>
        </div>

        {/* ── Footer Buttons ── */}
        <div style={{ display:'flex', justifyContent:'center', gap:12 }}>
          <button onClick={() => window.location.href='/user-profile-tests.html'}
            style={{ background:'linear-gradient(135deg,#7b1fa2,#d946ef)', color:'#fff', border:'none', borderRadius:12, padding:'13px 28px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 0 20px rgba(217,70,239,.5)' }}>
            Wróć do Dashboardu
          </button>
          <button onClick={handleRetake}
            style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.05)', color:'rgba(255,255,255,.65)', border:'1px solid rgba(255,255,255,.1)', borderRadius:12, padding:'13px 28px', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>
            <RefreshCw size={16}/> Wykonaj Test Ponownie
          </button>
        </div>

      </div>
    </div></>
  );
}
