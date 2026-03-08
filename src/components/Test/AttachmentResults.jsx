import React, { useState, useEffect } from 'react';
import { getAccessToken, SUPABASE_ANON_KEY, supabase } from '../../lib/supabaseClient.js';
import { ATTACHMENT_TEST } from '../../data/tests/attachmentStyle.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';

const PAGE_ACCENT = '#ec4899';
const DIM_ACCENT = {
  secure:       { color:'#10b981', gradient:'linear-gradient(135deg,#064e3b,#10b981)', glow:'rgba(16,185,129,.55)',  blob:'#10b981', light:'rgba(16,185,129,.15)',  border:'rgba(16,185,129,.35)'  },
  anxious:      { color:'#f59e0b', gradient:'linear-gradient(135deg,#78350f,#f59e0b)', glow:'rgba(245,158,11,.55)', blob:'#f59e0b', light:'rgba(245,158,11,.15)', border:'rgba(245,158,11,.35)' },
  avoidant:     { color:'#8b5cf6', gradient:'linear-gradient(135deg,#3b0764,#8b5cf6)', glow:'rgba(139,92,246,.55)', blob:'#8b5cf6', light:'rgba(139,92,246,.15)', border:'rgba(139,92,246,.35)' },
  disorganized: { color:'#f43f5e', gradient:'linear-gradient(135deg,#881337,#f43f5e)', glow:'rgba(244,63,94,.55)',  blob:'#f43f5e', light:'rgba(244,63,94,.15)',  border:'rgba(244,63,94,.35)'  },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.at-root{font-family:'Space Grotesk',sans-serif;background:#0d0f2b;color:#fff;min-height:100vh;overflow-x:hidden;}
.at-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(ellipse 60% 40% at 15% 20%,rgba(236,72,153,.12) 0%,transparent 65%),
    radial-gradient(ellipse 50% 50% at 85% 75%,rgba(139,92,246,.08) 0%,transparent 65%),
    radial-gradient(ellipse 40% 35% at 50% 50%,rgba(245,158,11,.05) 0%,transparent 65%);}
.at-glass{background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6);}
.at-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(236,72,153,.22) 35%,rgba(236,72,153,.1) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.at-dim-card{border-radius:16px;position:relative;isolation:isolate;transition:transform .28s cubic-bezier(.22,.68,0,1.15),box-shadow .28s ease;}
.at-dim-card:hover{transform:translateY(-4px) scale(1.005);}
.at-pill{display:inline-flex;align-items:center;padding:3px 12px;border-radius:100px;font-size:12px;font-weight:600;line-height:1.5;}
.at-bar-track{height:6px;border-radius:100px;background:rgba(255,255,255,.07);overflow:hidden;}
.at-bar-fill{height:100%;border-radius:100px;position:relative;}
.at-bar-fill-dot::after{content:'';position:absolute;right:-1px;top:50%;transform:translateY(-50%);width:10px;height:10px;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.6);}
@keyframes spinLoader{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
.at-fadein{animation:fadeUp .55s cubic-bezier(.22,.68,0,1.1) forwards;}
.at-fadein-2{animation:fadeUp .55s .1s cubic-bezier(.22,.68,0,1.1) both;}
.at-fadein-3{animation:fadeUp .55s .2s cubic-bezier(.22,.68,0,1.1) both;}
`;
const G = { background:'rgba(16,20,56,.6)',backdropFilter:'blur(24px) saturate(180%)',WebkitBackdropFilter:'blur(24px) saturate(180%)',border:'1px solid rgba(255,255,255,.07)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.1),0 8px 32px -4px rgba(0,0,0,.6)',borderRadius:20 };

/* ── 2×2 quadrant chart (SVG) ── */
function QuadrantChart({ rawDims, dominantId }) {
  const anxietyScore   = Math.min((rawDims.anxious    || 0) / 6, 1);
  const avoidanceScore = Math.min((rawDims.avoidant   || 0) / 6, 1);
  const SIZE = 280, PAD = 40, inner = SIZE - PAD * 2;
  const dotX = PAD + avoidanceScore * inner;
  const dotY = PAD + (1 - anxietyScore) * inner;
  const domAc = DIM_ACCENT[dominantId] || DIM_ACCENT.secure;

  const QDEFS = [
    { id:'secure',       emoji:'🟢', label:'Bezpieczny',   qx: PAD+inner/4,   qy: PAD+inner/4 },
    { id:'avoidant',     emoji:'🟣', label:'Unikający',    qx: PAD+inner*3/4, qy: PAD+inner/4 },
    { id:'anxious',      emoji:'🟡', label:'Lękowo-Ambiw.',qx: PAD+inner/4,   qy: PAD+inner*3/4 },
    { id:'disorganized', emoji:'🔴', label:'Zdezorganiz.', qx: PAD+inner*3/4, qy: PAD+inner*3/4 },
  ];

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{display:'block',margin:'0 auto'}}>
      {/* Quadrant bg fills */}
      <rect x={PAD}          y={PAD}          width={inner/2} height={inner/2} fill="rgba(16,185,129,.07)"  rx="4"/>
      <rect x={PAD+inner/2}  y={PAD}          width={inner/2} height={inner/2} fill="rgba(139,92,246,.07)"  rx="4"/>
      <rect x={PAD}          y={PAD+inner/2}  width={inner/2} height={inner/2} fill="rgba(245,158,11,.07)"  rx="4"/>
      <rect x={PAD+inner/2}  y={PAD+inner/2}  width={inner/2} height={inner/2} fill="rgba(244,63,94,.07)"   rx="4"/>
      {/* Border */}
      <rect x={PAD} y={PAD} width={inner} height={inner} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1" rx="8"/>
      {/* Center dividers */}
      <line x1={PAD+inner/2} y1={PAD} x2={PAD+inner/2} y2={PAD+inner} stroke="rgba(255,255,255,.11)" strokeWidth="1" strokeDasharray="4 4"/>
      <line x1={PAD} y1={PAD+inner/2} x2={PAD+inner} y2={PAD+inner/2} stroke="rgba(255,255,255,.11)" strokeWidth="1" strokeDasharray="4 4"/>
      {/* Axis labels */}
      <text x={SIZE/2} y={PAD-12}         textAnchor="middle" fill="rgba(255,255,255,.3)" fontSize="9" fontWeight="600" letterSpacing="1.2" fontFamily="Space Grotesk,sans-serif">NISKI LĘKI ↑</text>
      <text x={SIZE/2} y={SIZE-6}         textAnchor="middle" fill="rgba(255,255,255,.3)" fontSize="9" fontWeight="600" letterSpacing="1.2" fontFamily="Space Grotesk,sans-serif">WYSOKI LĘKI</text>
      <text x={10}     y={SIZE/2} textAnchor="middle" fill="rgba(255,255,255,.3)" fontSize="9" fontWeight="600" letterSpacing="1.2" fontFamily="Space Grotesk,sans-serif" transform={`rotate(-90,10,${SIZE/2})`}>NISKIE UNIKanie</text>
      <text x={SIZE-4} y={SIZE/2} textAnchor="middle" fill="rgba(255,255,255,.3)" fontSize="9" fontWeight="600" letterSpacing="1.2" fontFamily="Space Grotesk,sans-serif" transform={`rotate(90,${SIZE-4},${SIZE/2})`}>WYSOKIE UNIKANIE</text>
      {/* Quadrant icons + labels */}
      {QDEFS.map(q => {
        const dim = ATTACHMENT_TEST.dimensions.find(d => d.id === q.id);
        const isDom = q.id === dominantId;
        const ac = DIM_ACCENT[q.id];
        return (
          <g key={q.id}>
            <text x={q.qx} y={q.qy-8}    textAnchor="middle" dominantBaseline="middle" fontSize={isDom?'22':'16'} opacity={isDom?1:0.35}>{dim?.icon}</text>
            <text x={q.qx} y={q.qy+12}   textAnchor="middle" fill={isDom ? ac.color : 'rgba(255,255,255,.22)'} fontSize="8.5" fontWeight={isDom?'700':'500'} fontFamily="Space Grotesk,sans-serif">{q.label}</text>
          </g>
        );
      })}
      {/* Glow halo */}
      <circle cx={dotX} cy={dotY} r="16" fill={`${domAc.blob}20`}/>
      <circle cx={dotX} cy={dotY} r="10" fill={`${domAc.blob}35`}/>
      {/* Position dot */}
      <circle cx={dotX} cy={dotY} r="6" fill={domAc.color} style={{filter:`drop-shadow(0 0 7px ${domAc.glow})`}}/>
      <circle cx={dotX} cy={dotY} r="2.5" fill="#fff" opacity="0.9"/>
    </svg>
  );
}

export default function AttachmentResults() {
  const isMobile = useIsMobile();
  const [results, setResults]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [interpLoading, setInterpLoading]   = useState(false);
  const [interpError, setInterpError]       = useState(null);

  useEffect(() => { loadResults(); }, []);

  const loadResults = async () => {
    try {
      const { data:{ user }, error: ue } = await supabase.auth.getUser();
      if (ue || !user) throw new Error('Nie jesteś zalogowany');
      const [{ data, error: fe }, { data: cached }] = await Promise.all([
        supabase.from('user_psychometrics').select('*').eq('user_id',user.id).eq('test_type','ATTACHMENT').order('completed_at',{ascending:false}).limit(1),
        supabase.from('ai_interpretations').select('interpretation').eq('user_id',user.id).eq('test_type','ATTACHMENT').eq('prompt_version',PROMPT_VERSION).maybeSingle(),
      ]);
      if (fe) throw fe;
      if (!data?.length) { setError('Nie znaleziono wyników testu.'); setLoading(false); return; }
      setResults(data[0]); setLoading(false);
      if (cached?.interpretation) setInterpretation(cached.interpretation);
      else generateInterpretation(data[0]);
    } catch (err) { setError(err.message); setLoading(false); }
  };

  const generateInterpretation = async (r, { force=false }={}) => {
    setInterpLoading(true); setInterpError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Brak sesji');
      const { data: d, error: fnErr } = await supabase.functions.invoke('interpret-test', {
        body: { test_type:'ATTACHMENT', raw_scores: r.raw_scores, report: r.report, force },
        headers: { Authorization:`Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
      });
      if (fnErr) throw fnErr;
      setInterpretation(d?.interpretation ?? null);
    } catch { setInterpError('Nie udało się wygenerować interpretacji.'); }
    finally { setInterpLoading(false); }
  };
  const regenerate = () => { if (results) { setInterpretation(null); generateInterpretation(results,{force:true}); } };

  /* ── Loading state ── */
  if (loading) return (
    <><style>{CSS}</style>
    <div className="at-root" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:44,height:44,border:`3px solid rgba(236,72,153,.22)`,borderTopColor:PAGE_ACCENT,borderRadius:'50%',animation:'spinLoader 1s linear infinite',margin:'0 auto 16px'}}/>
        <p style={{color:'rgba(255,255,255,.4)',fontSize:13}}>Ładowanie wyników...</p>
      </div>
    </div></>
  );

  /* ── Error state ── */
  if (error) return (
    <><style>{CSS}</style>
    <div className="at-root" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:24,minHeight:'100vh'}}>
      <div className="at-glass" style={{...G,padding:40,textAlign:'center',maxWidth:380}}>
        <div style={{fontSize:44,marginBottom:16}}>⚠️</div>
        <p style={{color:'rgba(255,255,255,.7)',marginBottom:24,lineHeight:1.6}}>{error}</p>
        <button onClick={()=>window.location.href='/user-profile-tests.html'}
          style={{background:`linear-gradient(135deg,${PAGE_ACCENT}cc,${PAGE_ACCENT})`,color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',fontSize:14}}>
          Wróć do Dashboardu
        </button>
      </div>
    </div></>
  );

  /* ── Derive scores ── */
  const rs         = results.raw_scores || {};
  const rawDims    = rs.raw_scores || {};
  const dominantId = rs.dominant_style?.id || Object.entries(rawDims).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'secure';
  const sortedStyles = (rs.sorted_styles || ATTACHMENT_TEST.dimensions.map(d => ({ id:d.id, score:rawDims[d.id]??0 }))).sort((a,b)=>b.score-a.score);
  const dominant   = ATTACHMENT_TEST.dimensions.find(d => d.id === dominantId) || ATTACHMENT_TEST.dimensions[0];
  const second     = ATTACHMENT_TEST.dimensions.find(d => d.id === sortedStyles[1]?.id);
  const domAc      = DIM_ACCENT[dominantId] || DIM_ACCENT.secure;
  const pct        = (id) => Math.round(((rawDims[id]||0)/6)*100);

  return (
    <><style>{CSS}</style>
    <div className="at-root">
      <ResultsScaffold accent={PAGE_ACCENT} navLabel="STYL PRZYWIĄZANIA"
        badge="💗 Styl Przywiązania"
        title={<>Twój <span style={{color:PAGE_ACCENT,textShadow:`0 0 24px ${PAGE_ACCENT}66`}}>Styl Przywiązania</span></>}
        subtitle="Teoria Przywiązania Bowlby'ego / Ainsworth · 4 style relacyjne"
        completedAt={results?.completed_at} retakeHref="/test?type=attachment_style">

        {/* ═════════════════════════════════════════════════════
            SEKCJA 1 — Hero dominant + Quadrant visualization
        ═════════════════════════════════════════════════════ */}
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 300px',gap:20,marginBottom:20}}>

          {/* Hero dominant card */}
          <div className="at-glass at-fadein" style={{...G,padding:36,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-80,right:-80,width:300,height:300,borderRadius:'50%',background:domAc.blob,opacity:.1,filter:'blur(80px)',pointerEvents:'none'}}/>
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${domAc.color}44,transparent)`}}/>
            <div style={{position:'relative'}}>
              {/* Type header */}
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
                <div style={{width:60,height:60,borderRadius:16,background:domAc.light,border:`1.5px solid ${domAc.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>
                  {dominant.icon}
                </div>
                <div>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',color:domAc.color,marginBottom:4}}>
                    ✦ Dominujący styl · {pct(dominantId)}%
                  </div>
                  <div style={{fontSize:26,fontWeight:800,letterSpacing:'-.5px',lineHeight:1.1}}>{dominant.name}</div>
                  <div style={{fontSize:13,color:'rgba(255,255,255,.4)',marginTop:3}}>{dominant.name_en}</div>
                </div>
              </div>

              {/* Score bar */}
              <div className="at-bar-track" style={{marginBottom:20}}>
                <div className="at-bar-fill at-bar-fill-dot" style={{width:`${pct(dominantId)}%`,background:domAc.gradient,boxShadow:`0 0 12px ${domAc.glow}`}}/>
              </div>

              {/* Description */}
              <p style={{fontSize:14,color:'rgba(255,255,255,.72)',lineHeight:1.75,marginBottom:20}}>
                {dominant.description}
              </p>

              {/* Keywords */}
              {dominant.keywords && (
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:22}}>
                  {dominant.keywords.map((k,i) => (
                    <span key={i} style={{display:'inline-flex',padding:'3px 12px',borderRadius:100,fontSize:12,fontWeight:600,color:domAc.color,background:domAc.light,border:`1px solid ${domAc.border}`}}>{k}</span>
                  ))}
                </div>
              )}

              {/* Strengths & challenges in 2 columns */}
              <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:16}}>
                {dominant.strengths && (
                  <div>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:'2.5px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:10}}>✦ Silne strony</div>
                    <div style={{display:'flex',flexDirection:'column',gap:7}}>
                      {dominant.strengths.map((s,i) => (
                        <div key={i} style={{display:'flex',alignItems:'center',gap:9}}>
                          <div style={{width:5,height:5,borderRadius:'50%',background:domAc.color,flexShrink:0,boxShadow:`0 0 6px ${domAc.glow}`}}/>
                          <span style={{fontSize:13,color:'rgba(255,255,255,.7)'}}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {dominant.challenges && (
                  <div>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:'2.5px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:10}}>◦ Obszary do pracy</div>
                    <div style={{display:'flex',flexDirection:'column',gap:7}}>
                      {dominant.challenges.map((c,i) => (
                        <div key={i} style={{display:'flex',alignItems:'center',gap:9}}>
                          <div style={{width:5,height:5,borderRadius:'50%',background:'rgba(255,255,255,.25)',flexShrink:0}}/>
                          <span style={{fontSize:13,color:'rgba(255,255,255,.5)'}}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: chart + ranking */}
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {/* Quadrant map */}
            <div className="at-glass at-fadein-2" style={{...G,padding:'20px 12px 16px',textAlign:'center'}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:12}}>Mapa przywiązania</div>
              <QuadrantChart rawDims={rawDims} dominantId={dominantId}/>
              <div style={{fontSize:11,color:'rgba(255,255,255,.28)',marginTop:8,lineHeight:1.55}}>
                Oś X: unikanie bliskości<br/>Oś Y: lęk przed porzuceniem
              </div>
            </div>

            {/* Style ranking bars */}
            <div className="at-glass at-fadein-3" style={{...G,padding:'20px 18px',flex:1}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:14}}>Profil stylów</div>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {sortedStyles.map(s => {
                  const dim = ATTACHMENT_TEST.dimensions.find(d => d.id === s.id);
                  const ac  = DIM_ACCENT[s.id] || DIM_ACCENT.secure;
                  const p   = pct(s.id);
                  const isDom = s.id === dominantId;
                  return (
                    <div key={s.id}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                        <span style={{fontSize:15}}>{dim?.icon}</span>
                        <span style={{flex:1,fontSize:12,fontWeight:isDom?700:500,color:isDom?ac.color:'rgba(255,255,255,.6)'}}>{dim?.name}</span>
                        <span style={{fontSize:13,fontWeight:700,color:isDom?ac.color:'rgba(255,255,255,.45)'}}>{p}%</span>
                      </div>
                      <div className="at-bar-track">
                        <div style={{width:`${p}%`,height:'100%',borderRadius:100,background:isDom?ac.gradient:`${ac.color}40`,transition:'width 1s ease'}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════
            SEKCJA 2 — W relacjach + wskazówka rozwojowa
        ═════════════════════════════════════════════════════ */}
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:16,marginBottom:20}}>
          <div className="at-glass" style={{...G,padding:28,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:domAc.blob,opacity:.08,filter:'blur(50px)',pointerEvents:'none'}}/>
            <div style={{position:'relative'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                <span style={{fontSize:20}}>💞</span>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:'2.5px',textTransform:'uppercase',color:domAc.color}}>W relacjach</div>
              </div>
              <p style={{fontSize:14,color:'rgba(255,255,255,.7)',lineHeight:1.75,margin:0}}>{dominant.relationship_style}</p>
            </div>
          </div>
          <div className="at-glass" style={{...G,padding:28,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',bottom:-30,left:-30,width:140,height:140,borderRadius:'50%',background:'rgba(236,72,153,.18)',filter:'blur(50px)',pointerEvents:'none'}}/>
            <div style={{position:'relative'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                <span style={{fontSize:20}}>🌱</span>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:'2.5px',textTransform:'uppercase',color:PAGE_ACCENT}}>Wskazówka rozwojowa</div>
              </div>
              <p style={{fontSize:14,color:'rgba(255,255,255,.7)',lineHeight:1.75,margin:0}}>{dominant.growth_tip}</p>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════
            SEKCJA 3 — Karty wszystkich 4 stylów (szczegóły)
        ═════════════════════════════════════════════════════ */}
        <div style={{marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18}}>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)'}}>
              Szczegółowe wyniki — 4 style przywiązania
            </span>
            <span style={{flex:1,height:1,background:`linear-gradient(90deg,${PAGE_ACCENT}55,transparent)`}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)',gap:14}}>
            {ATTACHMENT_TEST.dimensions.map(d => {
              const ac    = DIM_ACCENT[d.id] || DIM_ACCENT.secure;
              const p     = pct(d.id);
              const score = rawDims[d.id] ?? 0;
              const isDom = d.id === dominantId;
              return (
                <div key={d.id} className="at-glass at-dim-card"
                  style={{...G,padding:'24px 22px 20px',border:isDom?`1px solid ${ac.border}`:'1px solid rgba(255,255,255,.07)'}}>
                  <div style={{position:'absolute',width:100,height:100,borderRadius:'50%',filter:'blur(40px)',bottom:-20,right:-20,background:ac.blob,opacity:isDom?.28:.1,pointerEvents:'none'}}/>
                  <div style={{position:'relative'}}>
                    {/* Card header */}
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{fontSize:22}}>{d.icon}</div>
                        <div>
                          <div style={{fontSize:10,fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:3}}>{d.name_en}</div>
                          <div style={{fontSize:16,fontWeight:700,color:isDom?ac.color:'#fff'}}>{d.name}</div>
                        </div>
                      </div>
                      <div style={{textAlign:'right',flexShrink:0}}>
                        {isDom && <div style={{fontSize:9,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:ac.color,background:ac.light,border:`1px solid ${ac.border}`,padding:'2px 8px',borderRadius:100,marginBottom:5}}>DOMINUJĄCY</div>}
                        <div style={{fontSize:28,fontWeight:800,color:isDom?ac.color:'rgba(255,255,255,.8)',lineHeight:1}}>{p}%</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>{score.toFixed(2)}/6.0</div>
                      </div>
                    </div>
                    {/* Score bar */}
                    <div className="at-bar-track" style={{marginBottom:14}}>
                      <div style={{width:`${p}%`,height:'100%',borderRadius:100,background:isDom?ac.gradient:`${ac.color}50`,boxShadow:isDom?`0 0 10px ${ac.glow}`:undefined}}/>
                    </div>
                    {/* Full description (no truncation) */}
                    <p style={{fontSize:13,color:'rgba(255,255,255,.55)',lineHeight:1.65,margin:'0 0 14px'}}>{d.description}</p>
                    {/* Keywords */}
                    {d.keywords && (
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {d.keywords.map((k,ki) => (
                          <span key={ki} style={{display:'inline-flex',padding:'2px 10px',borderRadius:100,fontSize:11,fontWeight:600,
                            color:isDom?ac.color:'rgba(255,255,255,.4)',background:isDom?ac.light:'rgba(255,255,255,.05)',border:`1px solid ${isDom?ac.border:'rgba(255,255,255,.1)'}`}}>
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════
            SEKCJA 4 — Wtórny styl (gdy >= 40%)
        ═════════════════════════════════════════════════════ */}
        {second && pct(second.id) >= 40 && (
          <div className="at-glass" style={{...G,padding:'22px 24px',marginBottom:20,display:'flex',gap:14,alignItems:'flex-start'}}>
            <div style={{fontSize:26,flexShrink:0,marginTop:2}}>{second.icon}</div>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'2.5px',textTransform:'uppercase',color:'rgba(255,255,255,.35)',marginBottom:6}}>Wtórny wzorzec relacyjny</div>
              <p style={{fontSize:14,color:'rgba(255,255,255,.7)',lineHeight:1.7,margin:0}}>
                Obok dominującego stylu <strong style={{color:domAc.color}}>{dominant.name}</strong> widoczny jest
                także wzorzec <strong style={{color:DIM_ACCENT[second.id]?.color}}>{second.name}</strong> ({pct(second.id)}%).
                Połączenie tych stylów kształtuje złożony, unikalny profil relacyjny.
              </p>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════
            SEKCJA 5 — AI Interpretacja
        ═════════════════════════════════════════════════════ */}
        <div className="at-glass" style={{...G,padding:36,marginBottom:32,overflow:'hidden',position:'relative'}}>
          <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:400,height:180,background:'rgba(236,72,153,.07)',borderRadius:'50%',filter:'blur(60px)',pointerEvents:'none'}}/>
          <div style={{position:'relative'}}>
            <AiInterpretation interpretation={interpretation} loading={interpLoading} error={interpError}
              onRegenerate={regenerate} onRetry={() => generateInterpretation(results)}
              accentColor={PAGE_ACCENT} accentGlow="rgba(236,72,153,.5)" testLabel="Twojego stylu przywiązania"/>
          </div>
        </div>

        <ResultsFooterActions retakeHref="/test?type=attachment_style"/>
      </ResultsScaffold>
    </div></>
  );
}
