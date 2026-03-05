import React, { useState, useEffect } from 'react';
import { getAccessToken, SUPABASE_ANON_KEY, supabase } from '../../lib/supabaseClient.js';
import { MEANING_TEST } from '../../data/tests/meaningSprituality.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';

const PAGE_ACCENT = '#a78bfa';
const DIM_ACCENT = {
  purpose:       { color:'#f59e0b', gradient:'linear-gradient(90deg,#78350f,#f59e0b)', glow:'rgba(245,158,11,.55)',  blob:'#f59e0b', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(245,158,11,.4),0 0 30px -4px rgba(245,158,11,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  transcendence: { color:'#c084fc', gradient:'linear-gradient(90deg,#4a044e,#c084fc)', glow:'rgba(192,132,252,.55)', blob:'#c084fc', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(192,132,252,.4),0 0 30px -4px rgba(192,132,252,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  existential:   { color:'#67e8f9', gradient:'linear-gradient(90deg,#164e63,#67e8f9)', glow:'rgba(103,232,249,.55)', blob:'#67e8f9', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(103,232,249,.4),0 0 30px -4px rgba(103,232,249,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  connection:    { color:'#4ade80', gradient:'linear-gradient(90deg,#14532d,#4ade80)', glow:'rgba(74,222,128,.55)',  blob:'#4ade80', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(74,222,128,.4),0 0 30px -4px rgba(74,222,128,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
};

const MEANING_LEVEL = (p) => p >= 85 ? ['Głęboki sens','#a78bfa'] : p >= 70 ? ['Wyraźny sens','#c084fc'] : p >= 50 ? ['Umiarkowany','#67e8f9'] : p >= 35 ? ['Poszukujący','#f59e0b'] : ['W procesie','#f43f5e'];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.mng-root{font-family:'Space Grotesk',sans-serif;background:#0d0f2b;color:#fff;min-height:100vh;overflow-x:hidden;}
.mng-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 15% 20%,rgba(167,139,250,.1) 0%,transparent 65%),radial-gradient(ellipse 50% 50% at 85% 75%,rgba(192,132,252,.07) 0%,transparent 65%);}
.mng-glass{background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6);}
.mng-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(167,139,250,.22) 35%,rgba(167,139,250,.1) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.mng-card{border-radius:16px;overflow:hidden;position:relative;isolation:isolate;transition:transform .28s cubic-bezier(.22,.68,0,1.15),box-shadow .28s ease;}
.mng-card::after{content:'';position:absolute;width:120px;height:120px;border-radius:50%;filter:blur(45px);bottom:-40px;right:-30px;opacity:.18;pointer-events:none;z-index:-1;transition:opacity .3s,transform .3s;}
.mng-card:hover::after{opacity:.35;transform:scale(1.2);}
.mng-glow-line{position:absolute;bottom:0;left:15%;right:15%;height:1px;border-radius:100px;opacity:0;transition:opacity .3s;}
.mng-card:hover .mng-glow-line{opacity:1;}
@keyframes spinLoader{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
.mng-fadein{animation:fadeUp .6s cubic-bezier(.22,.68,0,1.1) forwards;}
`;
const G = { background:'rgba(16,20,56,.6)',backdropFilter:'blur(24px) saturate(180%)',WebkitBackdropFilter:'blur(24px) saturate(180%)',border:'1px solid rgba(255,255,255,.07)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.1),0 8px 32px -4px rgba(0,0,0,.6)',borderRadius:20 };

export default function MeaningResults() {
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
        supabase.from('user_psychometrics').select('*').eq('user_id',user.id).eq('test_type','MEANING').order('completed_at',{ascending:false}).limit(1),
        supabase.from('ai_interpretations').select('interpretation').eq('user_id',user.id).eq('test_type','MEANING').eq('prompt_version',PROMPT_VERSION).maybeSingle(),
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
        body: { test_type:'MEANING', raw_scores: r.raw_scores, report: r.report, force },
        headers: { Authorization:`Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
      });
      if (fnErr) throw fnErr;
      setInterpretation(d?.interpretation ?? null);
    } catch { setInterpError('Nie udało się wygenerować interpretacji.'); }
    finally { setInterpLoading(false); }
  };
  const regenerate = () => { if (results) { setInterpretation(null); generateInterpretation(results,{force:true}); } };

  if (loading) return (<><style>{CSS}</style><div className="mng-root" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><div style={{textAlign:'center'}}><div style={{width:44,height:44,border:`3px solid rgba(167,139,250,.22)`,borderTopColor:PAGE_ACCENT,borderRadius:'50%',animation:'spinLoader 1s linear infinite',margin:'0 auto 16px'}}/><p style={{color:'rgba(255,255,255,.4)',fontSize:13}}>Ładowanie wyników...</p></div></div></>);
  if (error) return (<><style>{CSS}</style><div className="mng-root" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:24,minHeight:'100vh'}}><div className="mng-glass" style={{...G,padding:40,textAlign:'center',maxWidth:380}}><div style={{fontSize:44,marginBottom:16}}>⚠️</div><p style={{color:'rgba(255,255,255,.7)',marginBottom:24,lineHeight:1.6}}>{error}</p><button onClick={()=>window.location.href='/user-profile-tests.html'} style={{background:`linear-gradient(135deg,${PAGE_ACCENT}cc,${PAGE_ACCENT})`,color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',fontSize:14}}>Wróć do Dashboardu</button></div></div></>);

  const rs = results.raw_scores || {};
  const rawDims = rs.raw_scores || {};
  const percentiles = rs.percentile_scores || {};
  const totalMeaning = rs.total_meaning ?? 1;
  const totalPct = Math.round(Math.min(100, Math.max(0, ((totalMeaning - 1) / 5) * 100)));
  const [mngLabel, mngColor] = MEANING_LEVEL(totalPct);
  const ringCirc = 2 * Math.PI * 90;
  const ringOffset = ringCirc * (1 - totalPct / 100);
  const topDim = MEANING_TEST.dimensions.reduce((a,b) => (rawDims[a.id]||0) >= (rawDims[b.id]||0) ? a : b, MEANING_TEST.dimensions[0]);

  return (
    <><style>{CSS}</style>
    <div className="mng-root">
      <ResultsScaffold accent={PAGE_ACCENT} navLabel="SENS I DUCHOWOŚĆ"
        badge="✨ Sens i Duchowość"
        title={<>Twój <span style={{color:PAGE_ACCENT,textShadow:`0 0 24px ${PAGE_ACCENT}66`}}>Sens i Duchowość</span></>}
        subtitle="Model Frankla & Baumeistera · Cel · Transcendencja · Egzystencja · Więź"
        completedAt={results?.completed_at} retakeHref="/test?type=meaning_spirituality">

        {/* Hero row */}
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'220px 1fr',gap:24,marginBottom:24}}>
          {/* Ring */}
          <div className="mng-glass mng-fadein" style={{...G,padding:28,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <svg width="200" height="200" style={{overflow:'visible'}}>
              <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="10"/>
              <circle cx="100" cy="100" r="90" fill="none" stroke={mngColor} strokeWidth="10"
                strokeLinecap="round" strokeDasharray={ringCirc} strokeDashoffset={ringOffset}
                transform="rotate(-90 100 100)" style={{transition:'stroke-dashoffset 1s cubic-bezier(.22,.68,0,1.1)',filter:`drop-shadow(0 0 14px ${mngColor}88)`}}/>
              <text x="100" y="95" textAnchor="middle" fill="#fff" fontSize="34" fontWeight="800" fontFamily="Space Grotesk">{totalPct}%</text>
              <text x="100" y="118" textAnchor="middle" fill={mngColor} fontSize="11" fontWeight="700" fontFamily="Space Grotesk" letterSpacing="1">{mngLabel.toUpperCase()}</text>
            </svg>
            <div style={{textAlign:'center',marginTop:8}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>Wynik: {totalMeaning.toFixed(2)}/6.0</div>
            </div>
          </div>

          {/* Summary bars */}
          <div className="mng-glass" style={{...G,padding:'28px 24px',display:'flex',flexDirection:'column',gap:16,justifyContent:'center'}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:4}}>Profil wymiarów sensu</div>
            {MEANING_TEST.dimensions.map(d => {
              const ac = DIM_ACCENT[d.id] || DIM_ACCENT.purpose;
              const pctile = percentiles[d.id] ?? Math.round(((rawDims[d.id]||1)-1)/5*100);
              const isTop = d.id === topDim.id;
              return (
                <div key={d.id} style={{display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontSize:16,width:22,textAlign:'center'}}>{d.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{fontSize:13,fontWeight:700,color: isTop ? ac.color : 'rgba(255,255,255,.7)'}}>{d.name}</span>
                      <span style={{fontSize:12,fontWeight:700,color:ac.color}}>{pctile}%</span>
                    </div>
                    <div style={{height:5,borderRadius:100,background:'rgba(255,255,255,.07)',overflow:'hidden'}}>
                      <div style={{width:`${pctile}%`,height:'100%',background:ac.gradient,borderRadius:100,boxShadow:`0 0 8px ${ac.glow}`}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 dimension stat cards */}
        <div style={{marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
            <span style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)'}}>Szczegółowe wyniki — 4 wymiary sensu</span>
            <span style={{flex:1,height:1,background:`linear-gradient(90deg,${PAGE_ACCENT}66,transparent)`}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)',gap:16}}>
            {MEANING_TEST.dimensions.map(d => {
              const ac = DIM_ACCENT[d.id] || DIM_ACCENT.purpose;
              const score = rawDims[d.id] ?? 1;
              const pctile = percentiles[d.id] ?? Math.round(((score-1)/5)*100);
              const isTop = d.id === topDim.id;
              return (
                <div key={d.id} className="mng-glass mng-card" style={{...G,padding:'22px 22px 20px'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px) scale(1.01)';e.currentTarget.style.boxShadow=ac.hover;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=G.boxShadow;}}>
                  <div style={{position:'absolute',width:120,height:120,borderRadius:'50%',filter:'blur(45px)',bottom:-40,right:-30,background:ac.blob,opacity: isTop ? .28 : .14,pointerEvents:'none'}}/>
                  <div className="mng-glow-line" style={{background:ac.color,boxShadow:`0 0 10px 2px ${ac.glow}`}}/>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{fontSize:26}}>{d.icon}</div>
                      <div>
                        <div style={{fontSize:10,fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:3}}>{d.name_en}</div>
                        <div style={{fontSize:15,fontWeight:700}}>{d.name}</div>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      {isTop && <div style={{fontSize:9,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:ac.color,background:`${ac.color}18`,border:`1px solid ${ac.color}30`,padding:'2px 8px',borderRadius:100,marginBottom:4}}>DOMINUJĄCY</div>}
                      <div style={{fontSize:28,fontWeight:800,color:ac.color,lineHeight:1}}>{pctile}%</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>{score.toFixed(2)}/6.0</div>
                    </div>
                  </div>
                  <div style={{height:4,borderRadius:100,background:'rgba(255,255,255,.07)',marginBottom:12,overflow:'hidden'}}>
                    <div style={{width:`${pctile}%`,height:'100%',background:ac.gradient,boxShadow:`0 0 10px ${ac.glow}`,borderRadius:100}}/>
                  </div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,.35)',lineHeight:1.55}}>{d.description?.substring(0,110)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Interpretation */}
        <div className="mng-glass" style={{...G,padding:36,marginBottom:32,overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:400,height:180,background:'rgba(167,139,250,.07)',borderRadius:'50%',filter:'blur(60px)',pointerEvents:'none'}}/>
          <div style={{position:'relative'}}>
            <AiInterpretation interpretation={interpretation} loading={interpLoading} error={interpError}
              onRegenerate={regenerate} onRetry={() => generateInterpretation(results)}
              accentColor={PAGE_ACCENT} accentGlow="rgba(167,139,250,.5)" testLabel="Twojego poczucia sensu"/>
          </div>
        </div>

        <ResultsFooterActions retakeHref="/test?type=meaning_spirituality"/>
      </ResultsScaffold>
    </div></>
  );
}
