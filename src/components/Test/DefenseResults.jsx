import React, { useState, useEffect } from 'react';
import { getAccessToken, SUPABASE_ANON_KEY, supabase } from '../../lib/supabaseClient.js';
import { DEFENSE_TEST } from '../../data/tests/defenseMechanisms.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';

const PAGE_ACCENT = '#8b5cf6';
const DIM_ACCENT = {
  mature:    { color:'#10b981', gradient:'linear-gradient(90deg,#064e3b,#10b981)', glow:'rgba(16,185,129,.55)',  blob:'#10b981', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(16,185,129,.4),0 0 30px -4px rgba(16,185,129,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  neurotic:  { color:'#f59e0b', gradient:'linear-gradient(90deg,#78350f,#f59e0b)', glow:'rgba(245,158,11,.55)', blob:'#f59e0b', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(245,158,11,.4),0 0 30px -4px rgba(245,158,11,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  immature:  { color:'#f97316', gradient:'linear-gradient(90deg,#7c2d12,#f97316)', glow:'rgba(249,115,22,.55)',  blob:'#f97316', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(249,115,22,.4),0 0 30px -4px rgba(249,115,22,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  primitive: { color:'#f43f5e', gradient:'linear-gradient(90deg,#881337,#f43f5e)', glow:'rgba(244,63,94,.55)',  blob:'#f43f5e', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(244,63,94,.4),0 0 30px -4px rgba(244,63,94,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
};

const MATURITY_LABELS = [
  { min:-2.5, max:-1.5, label:'Bardzo prymitywne', color:'#f43f5e' },
  { min:-1.5, max:-0.5, label:'Niedojrzałe',        color:'#f97316' },
  { min:-0.5, max: 0.5, label:'Neurotyczne',         color:'#f59e0b' },
  { min: 0.5, max: 1.5, label:'Mieszane',            color:'#a78bfa' },
  { min: 1.5, max: 2.5, label:'Dojrzałe',            color:'#10b981' },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.def-root{font-family:'Space Grotesk',sans-serif;background:#0d0f2b;color:#fff;min-height:100vh;overflow-x:hidden;}
.def-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 15% 20%,rgba(139,92,246,.1) 0%,transparent 65%),radial-gradient(ellipse 50% 50% at 85% 75%,rgba(16,185,129,.06) 0%,transparent 65%);}
.def-glass{background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6);}
.def-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(139,92,246,.22) 35%,rgba(139,92,246,.1) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.def-card{border-radius:16px;overflow:hidden;position:relative;isolation:isolate;transition:transform .28s cubic-bezier(.22,.68,0,1.15),box-shadow .28s ease;}
.def-card::after{content:'';position:absolute;width:120px;height:120px;border-radius:50%;filter:blur(45px);bottom:-40px;right:-30px;opacity:.18;pointer-events:none;z-index:-1;transition:opacity .3s,transform .3s;}
.def-card:hover::after{opacity:.35;transform:scale(1.2);}
.def-glow-line{position:absolute;bottom:0;left:15%;right:15%;height:1px;border-radius:100px;opacity:0;transition:opacity .3s;}
.def-card:hover .def-glow-line{opacity:1;}
@keyframes spinLoader{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
.def-fadein{animation:fadeUp .6s cubic-bezier(.22,.68,0,1.1) forwards;}
@keyframes gaugeSlide{from{width:0%;}to{}}
.def-gauge-fill{animation:gaugeSlide .9s cubic-bezier(.22,.68,0,1.1) forwards;}
`;
const G = { background:'rgba(16,20,56,.6)',backdropFilter:'blur(24px) saturate(180%)',WebkitBackdropFilter:'blur(24px) saturate(180%)',border:'1px solid rgba(255,255,255,.07)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.1),0 8px 32px -4px rgba(0,0,0,.6)',borderRadius:20 };

export default function DefenseResults() {
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
        supabase.from('user_psychometrics').select('*').eq('user_id',user.id).eq('test_type','DEFENSE').order('completed_at',{ascending:false}).limit(1),
        supabase.from('ai_interpretations').select('interpretation').eq('user_id',user.id).eq('test_type','DEFENSE').eq('prompt_version',PROMPT_VERSION).maybeSingle(),
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
        body: { test_type:'DEFENSE', raw_scores: r.raw_scores, report: r.report, force },
        headers: { Authorization:`Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
      });
      if (fnErr) throw fnErr;
      setInterpretation(d?.interpretation ?? null);
    } catch { setInterpError('Nie udało się wygenerować interpretacji.'); }
    finally { setInterpLoading(false); }
  };
  const regenerate = () => { if (results) { setInterpretation(null); generateInterpretation(results,{force:true}); } };

  if (loading) return (<><style>{CSS}</style><div className="def-root" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><div style={{textAlign:'center'}}><div style={{width:44,height:44,border:'3px solid rgba(139,92,246,.22)',borderTopColor:PAGE_ACCENT,borderRadius:'50%',animation:'spinLoader 1s linear infinite',margin:'0 auto 16px'}}/><p style={{color:'rgba(255,255,255,.4)',fontSize:13}}>Ładowanie wyników...</p></div></div></>);
  if (error) return (<><style>{CSS}</style><div className="def-root" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:24,minHeight:'100vh'}}><div className="def-glass" style={{...G,padding:40,textAlign:'center',maxWidth:380}}><div style={{fontSize:44,marginBottom:16}}>⚠️</div><p style={{color:'rgba(255,255,255,.7)',marginBottom:24,lineHeight:1.6}}>{error}</p><button onClick={()=>window.location.href='/user-profile-tests.html'} style={{background:`linear-gradient(135deg,${PAGE_ACCENT}cc,${PAGE_ACCENT})`,color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',fontSize:14}}>Wróć do Dashboardu</button></div></div></>);

  const rs = results.raw_scores || {};
  const rawDims = rs.raw_scores || {};
  const maturityIndex = rs.maturity_index ?? 0;
  const maturityPct = Math.round(((maturityIndex + 2.5) / 5) * 100);
  const maturityLevel = MATURITY_LABELS.find(l => maturityIndex >= l.min && maturityIndex < l.max) || MATURITY_LABELS[4];
  const sortedMechanisms = rs.sorted_mechanisms || DEFENSE_TEST.dimensions.map(d => ({ ...d, score: rawDims[d.id] ?? 0 })).sort((a,b) => b.score - a.score);
  const topMech = sortedMechanisms[0];
  const topDim = DEFENSE_TEST.dimensions.find(d => d.id === topMech?.id);

  return (
    <><style>{CSS}</style>
    <div className="def-root">
      <ResultsScaffold accent={PAGE_ACCENT} navLabel="MECHANIZMY OBRONNE"
        badge="🛡️ Mechanizmy Obronne"
        title={<>Twoje <span style={{color:PAGE_ACCENT,textShadow:`0 0 24px ${PAGE_ACCENT}66`}}>Mechanizmy Obronne</span></>}
        subtitle="Model dojrzałości obronnej Vaillanta · 4 poziomy mechanizmów"
        completedAt={results?.completed_at} retakeHref="/test?type=defense_mechanisms">

        {/* Header: maturity gauge + top mechanism */}
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 280px',gap:24,marginBottom:24}}>

          {/* Maturity Index Gauge */}
          <div className="def-glass def-fadein" style={{...G,padding:36,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-60,right:-60,width:220,height:220,borderRadius:'50%',background:maturityLevel.color,opacity:.09,filter:'blur(60px)',pointerEvents:'none'}}/>
            <div style={{position:'relative'}}>
              <div style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:4}}>Indeks Dojrzałości Obronnej</div>
              <div style={{fontSize:36,fontWeight:800,color:maturityLevel.color,marginBottom:4,letterSpacing:'-.5px'}}>
                {maturityLevel.label}
              </div>
              <div style={{fontSize:14,color:'rgba(255,255,255,.4)',marginBottom:28}}>Wartość: {maturityIndex.toFixed(2)} <span style={{opacity:.5}}>/ skala -2.5 do +2.5</span></div>
              {/* Gauge bar */}
              <div style={{marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:11,color:'rgba(255,255,255,.3)'}}>
                  <span>← prymitywne</span><span>dojrzałe →</span>
                </div>
                <div style={{height:14,borderRadius:100,background:'rgba(255,255,255,.07)',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,#f43f5e,#f97316,#f59e0b,#a78bfa,#10b981)',opacity:.22,borderRadius:100}}/>
                  <div className="def-gauge-fill" style={{position:'relative',width:`${maturityPct}%`,height:'100%',background:`linear-gradient(90deg,${maturityLevel.color}88,${maturityLevel.color})`,borderRadius:100,boxShadow:`0 0 12px ${maturityLevel.color}66`,transition:'width .9s cubic-bezier(.22,.68,0,1.1)'}}/>
                  {/* pointer */}
                  <div style={{position:'absolute',top:-2,bottom:-2,left:`${maturityPct}%`,width:3,background:'#fff',borderRadius:100,boxShadow:`0 0 8px rgba(255,255,255,.8)`,transform:'translateX(-50%)'}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:11,color:'rgba(255,255,255,.25)'}}>
                  {['−2.5','−1.5','−0.5','+0.5','+1.5','+2.5'].map(v => <span key={v}>{v}</span>)}
                </div>
              </div>
              <p style={{fontSize:14,color:'rgba(255,255,255,.55)',lineHeight:1.65}}>
                Wynik {maturityIndex > 1 ? 'wskazuje na przewagę dojrzałych strategii radzenia sobie z napięciem.' : maturityIndex > 0 ? 'sugeruje mieszankę różnych poziomów mechanizmów obronnych.' : maturityIndex > -1 ? 'sugeruje tendencję do neurotycznych reakcji obronnych.' : 'wskazuje na przewagę niedojrzałych lub prymitywnych mechanizmów.'}
              </p>
            </div>
          </div>

          {/* Top mechanism */}
          {topDim && <div className="def-glass" style={{...G,padding:'28px 24px',display:'flex',flexDirection:'column',gap:0,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:DIM_ACCENT[topDim.id]?.blob,opacity:.15,filter:'blur(40px)',pointerEvents:'none'}}/>
            <div style={{position:'relative'}}>
              <div style={{fontSize:11,fontWeight:600,letterSpacing:'2.5px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:16}}>Dominujący mechanizm</div>
              <div style={{fontSize:44,marginBottom:12}}>{topDim.icon}</div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:DIM_ACCENT[topDim.id]?.color,marginBottom:6}}>{topDim.name_en}</div>
              <div style={{fontSize:22,fontWeight:800,marginBottom:12}}>{topDim.name}</div>
              <div style={{height:3,borderRadius:100,background:'rgba(255,255,255,.07)',marginBottom:16,overflow:'hidden'}}>
                <div style={{width:`${Math.round(((topMech.score||0)/6)*100)}%`,height:'100%',background:DIM_ACCENT[topDim.id]?.gradient,borderRadius:100}}/>
              </div>
              <p style={{fontSize:13,color:'rgba(255,255,255,.5)',lineHeight:1.6}}>{topDim.description?.substring(0,130)}</p>
            </div>
          </div>}
        </div>

        {/* 4 mechanism detail cards */}
        <div style={{marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
            <span style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)'}}>Szczegółowe wyniki — 4 poziomy mechanizmów</span>
            <span style={{flex:1,height:1,background:`linear-gradient(90deg,${PAGE_ACCENT}66,transparent)`}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)',gap:16}}>
            {DEFENSE_TEST.dimensions.map(d => {
              const ac = DIM_ACCENT[d.id] || DIM_ACCENT.mature;
              const score = rawDims[d.id] ?? 0;
              const pct = Math.round((score/6)*100);
              const isTop = d.id === topDim?.id;
              return (
                <div key={d.id} className="def-glass def-card" style={{...G,padding:'22px 22px 20px'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px) scale(1.01)';e.currentTarget.style.boxShadow=ac.hover;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=G.boxShadow;}}>
                  <div style={{position:'absolute',width:120,height:120,borderRadius:'50%',filter:'blur(45px)',bottom:-40,right:-30,background:ac.blob,opacity: isTop ? .28 : .14,pointerEvents:'none'}}/>
                  <div className="def-glow-line" style={{background:ac.color,boxShadow:`0 0 10px 2px ${ac.glow}`}}/>
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
                      <div style={{fontSize:28,fontWeight:800,color:ac.color,lineHeight:1}}>{pct}%</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>{score.toFixed(2)}/6.0</div>
                    </div>
                  </div>
                  <div style={{height:4,borderRadius:100,background:'rgba(255,255,255,.07)',marginBottom:12,overflow:'hidden'}}>
                    <div style={{width:`${pct}%`,height:'100%',background:ac.gradient,boxShadow:`0 0 10px ${ac.glow}`,borderRadius:100}}/>
                  </div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,.35)',lineHeight:1.55}}>{d.description?.substring(0,120)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Interpretation */}
        <div className="def-glass" style={{...G,padding:36,marginBottom:32,overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:400,height:180,background:'rgba(139,92,246,.07)',borderRadius:'50%',filter:'blur(60px)',pointerEvents:'none'}}/>
          <div style={{position:'relative'}}>
            <AiInterpretation interpretation={interpretation} loading={interpLoading} error={interpError}
              onRegenerate={regenerate} onRetry={() => generateInterpretation(results)}
              accentColor={PAGE_ACCENT} accentGlow="rgba(139,92,246,.5)" testLabel="Twoich mechanizmów obronnych"/>
          </div>
        </div>

        <ResultsFooterActions retakeHref="/test?type=defense_mechanisms"/>
      </ResultsScaffold>
    </div></>
  );
}
