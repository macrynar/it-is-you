import React, { useState, useEffect } from 'react';
import { getAccessToken, SUPABASE_ANON_KEY, supabase } from '../../lib/supabaseClient.js';
import { MENTAL_TOUGHNESS_TEST } from '../../data/tests/mentalToughness.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';

const PAGE_ACCENT = '#f59e0b';
const DIM_ACCENT = {
  control:    { color:'#8b5cf6', gradient:'linear-gradient(90deg,#3b0764,#8b5cf6)', glow:'rgba(139,92,246,.55)', blob:'#8b5cf6', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(139,92,246,.4),0 0 30px -4px rgba(139,92,246,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  commitment: { color:'#60a5fa', gradient:'linear-gradient(90deg,#1e3a8a,#60a5fa)', glow:'rgba(96,165,250,.55)',  blob:'#60a5fa', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(96,165,250,.4),0 0 30px -4px rgba(96,165,250,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  challenge:  { color:'#f97316', gradient:'linear-gradient(90deg,#7c2d12,#f97316)', glow:'rgba(249,115,22,.55)',  blob:'#f97316', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(249,115,22,.4),0 0 30px -4px rgba(249,115,22,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  confidence: { color:'#f59e0b', gradient:'linear-gradient(90deg,#78350f,#f59e0b)', glow:'rgba(245,158,11,.55)',  blob:'#f59e0b', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(245,158,11,.4),0 0 30px -4px rgba(245,158,11,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
};

const MT_LEVEL = (p) => p >= 85 ? ['Elite','#f59e0b'] : p >= 70 ? ['Wysoka','#10b981'] : p >= 50 ? ['Umiarkowana','#60a5fa'] : p >= 35 ? ['Rozwijająca się','#8b5cf6'] : ['Niska','#f43f5e'];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.mnt-root{font-family:'Space Grotesk',sans-serif;background:#0d0f2b;color:#fff;min-height:100vh;overflow-x:hidden;}
.mnt-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 15% 20%,rgba(245,158,11,.08) 0%,transparent 65%),radial-gradient(ellipse 50% 50% at 85% 75%,rgba(139,92,246,.07) 0%,transparent 65%);}
.mnt-glass{background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6);}
.mnt-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(245,158,11,.22) 35%,rgba(245,158,11,.1) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.mnt-card{border-radius:16px;overflow:hidden;position:relative;isolation:isolate;transition:transform .28s cubic-bezier(.22,.68,0,1.15),box-shadow .28s ease;}
.mnt-card::after{content:'';position:absolute;width:120px;height:120px;border-radius:50%;filter:blur(45px);bottom:-40px;right:-30px;opacity:.18;pointer-events:none;z-index:-1;transition:opacity .3s,transform .3s;}
.mnt-card:hover::after{opacity:.35;transform:scale(1.2);}
.mnt-glow-line{position:absolute;bottom:0;left:15%;right:15%;height:1px;border-radius:100px;opacity:0;transition:opacity .3s;}
.mnt-card:hover .mnt-glow-line{opacity:1;}
@keyframes spinLoader{to{transform:rotate(360deg);}}
@keyframes ringIn{from{stroke-dashoffset:565;}to{}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
.mnt-fadein{animation:fadeUp .6s cubic-bezier(.22,.68,0,1.1) forwards;}
`;
const G = { background:'rgba(16,20,56,.6)',backdropFilter:'blur(24px) saturate(180%)',WebkitBackdropFilter:'blur(24px) saturate(180%)',border:'1px solid rgba(255,255,255,.07)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.1),0 8px 32px -4px rgba(0,0,0,.6)',borderRadius:20 };

export default function MentalToughnessResults() {
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
        supabase.from('user_psychometrics').select('*').eq('user_id',user.id).eq('test_type','MENTAL_TOUGHNESS').order('completed_at',{ascending:false}).limit(1),
        supabase.from('ai_interpretations').select('interpretation').eq('user_id',user.id).eq('test_type','MENTAL_TOUGHNESS').eq('prompt_version',PROMPT_VERSION).maybeSingle(),
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
        body: { test_type:'MENTAL_TOUGHNESS', raw_scores: r.raw_scores, report: r.report, force },
        headers: { Authorization:`Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
      });
      if (fnErr) throw fnErr;
      setInterpretation(d?.interpretation ?? null);
    } catch { setInterpError('Nie udało się wygenerować interpretacji.'); }
    finally { setInterpLoading(false); }
  };
  const regenerate = () => { if (results) { setInterpretation(null); generateInterpretation(results,{force:true}); } };

  if (loading) return (<><style>{CSS}</style><div className="mnt-root" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><div style={{textAlign:'center'}}><div style={{width:44,height:44,border:`3px solid rgba(245,158,11,.22)`,borderTopColor:PAGE_ACCENT,borderRadius:'50%',animation:'spinLoader 1s linear infinite',margin:'0 auto 16px'}}/><p style={{color:'rgba(255,255,255,.4)',fontSize:13}}>Ładowanie wyników...</p></div></div></>);
  if (error) return (<><style>{CSS}</style><div className="mnt-root" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:24,minHeight:'100vh'}}><div className="mnt-glass" style={{...G,padding:40,textAlign:'center',maxWidth:380}}><div style={{fontSize:44,marginBottom:16}}>⚠️</div><p style={{color:'rgba(255,255,255,.7)',marginBottom:24,lineHeight:1.6}}>{error}</p><button onClick={()=>window.location.href='/user-profile-tests.html'} style={{background:`linear-gradient(135deg,${PAGE_ACCENT}cc,${PAGE_ACCENT})`,color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',fontSize:14}}>Wróć do Dashboardu</button></div></div></>);

  const rs = results.raw_scores || {};
  const rawDims = rs.raw_scores || {};
  const percentiles = rs.percentile_scores || {};
  const totalMt = rs.total_mt ?? 1;
  const totalMtPct = Math.round(Math.min(100, Math.max(0, ((totalMt - 1) / 4) * 100)));
  const [mtLabel, mtColor] = MT_LEVEL(totalMtPct);
  const ringCirc = 2 * Math.PI * 90;
  const ringOffset = ringCirc * (1 - totalMtPct / 100);
  const topDim = MENTAL_TOUGHNESS_TEST.dimensions.reduce((a,b) => (rawDims[a.id]||0) >= (rawDims[b.id]||0) ? a : b, MENTAL_TOUGHNESS_TEST.dimensions[0]);

  return (
    <><style>{CSS}</style>
    <div className="mnt-root">
      <ResultsScaffold accent={PAGE_ACCENT} navLabel="MENTAL TOUGHNESS"
        badge="⚡ Twardość Mentalna"
        title={<>Twoja <span style={{color:PAGE_ACCENT,textShadow:`0 0 24px ${PAGE_ACCENT}66`}}>Twardość Mentalna</span></>}
        subtitle="Model 4C Clougha & Strycharczyka · Kontrola · Zaangażowanie · Wyzwanie · Pewność"
        completedAt={results?.completed_at} retakeHref="/test?type=mental_toughness">

        {/* Hero row */}
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'220px 1fr',gap:24,marginBottom:24}}>

          {/* Ring */}
          <div className="mnt-glass mnt-fadein" style={{...G,padding:28,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <svg width="200" height="200" style={{overflow:'visible'}}>
              <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="10"/>
              <circle cx="100" cy="100" r="90" fill="none" stroke={mtColor} strokeWidth="10"
                strokeLinecap="round" strokeDasharray={ringCirc} strokeDashoffset={ringOffset}
                transform="rotate(-90 100 100)" style={{transition:'stroke-dashoffset 1s cubic-bezier(.22,.68,0,1.1)',filter:`drop-shadow(0 0 14px ${mtColor}88)`}}/>
              <text x="100" y="95" textAnchor="middle" fill="#fff" fontSize="34" fontWeight="800" fontFamily="Space Grotesk">{totalMtPct}%</text>
              <text x="100" y="118" textAnchor="middle" fill={mtColor} fontSize="11" fontWeight="700" fontFamily="Space Grotesk" letterSpacing="1">{mtLabel.toUpperCase()}</text>
            </svg>
            <div style={{textAlign:'center',marginTop:8}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>Wynik: {totalMt.toFixed(2)}/5.0</div>
            </div>
          </div>

          {/* 4C summary */}
          <div className="mnt-glass" style={{...G,padding:'28px 24px',display:'flex',flexDirection:'column',gap:16,justifyContent:'center'}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:4}}>Model 4C — Profil wymiarów</div>
            {MENTAL_TOUGHNESS_TEST.dimensions.map(d => {
              const ac = DIM_ACCENT[d.id] || DIM_ACCENT.confidence;
              const pctile = percentiles[d.id] ?? Math.round(((rawDims[d.id]||1)-1)/4*100);
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
            <span style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)'}}>Szczegółowe wyniki — 4 filary twardości mentalnej</span>
            <span style={{flex:1,height:1,background:`linear-gradient(90deg,${PAGE_ACCENT}66,transparent)`}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)',gap:16}}>
            {MENTAL_TOUGHNESS_TEST.dimensions.map(d => {
              const ac = DIM_ACCENT[d.id] || DIM_ACCENT.confidence;
              const score = rawDims[d.id] ?? 1;
              const pctile = percentiles[d.id] ?? Math.round(((score-1)/4)*100);
              const isTop = d.id === topDim.id;
              return (
                <div key={d.id} className="mnt-glass mnt-card" style={{...G,padding:'22px 22px 20px'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px) scale(1.01)';e.currentTarget.style.boxShadow=ac.hover;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=G.boxShadow;}}>
                  <div style={{position:'absolute',width:120,height:120,borderRadius:'50%',filter:'blur(45px)',bottom:-40,right:-30,background:ac.blob,opacity: isTop ? .28 : .14,pointerEvents:'none'}}/>
                  <div className="mnt-glow-line" style={{background:ac.color,boxShadow:`0 0 10px 2px ${ac.glow}`}}/>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{fontSize:26}}>{d.icon}</div>
                      <div>
                        <div style={{fontSize:10,fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:3}}>{d.name_en}</div>
                        <div style={{fontSize:15,fontWeight:700}}>{d.name}</div>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      {isTop && <div style={{fontSize:9,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:ac.color,background:`${ac.color}18`,border:`1px solid ${ac.color}30`,padding:'2px 8px',borderRadius:100,marginBottom:4}}>NAJSILNIEJSZY</div>}
                      <div style={{fontSize:28,fontWeight:800,color:ac.color,lineHeight:1}}>{pctile}%</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>{score.toFixed(2)}/5.0</div>
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
        <div className="mnt-glass" style={{...G,padding:36,marginBottom:32,overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:400,height:180,background:'rgba(245,158,11,.06)',borderRadius:'50%',filter:'blur(60px)',pointerEvents:'none'}}/>
          <div style={{position:'relative'}}>
            <AiInterpretation interpretation={interpretation} loading={interpLoading} error={interpError}
              onRegenerate={regenerate} onRetry={() => generateInterpretation(results)}
              accentColor={PAGE_ACCENT} accentGlow="rgba(245,158,11,.5)" testLabel="Twojej twardości mentalnej"/>
          </div>
        </div>

        <ResultsFooterActions retakeHref="/test?type=mental_toughness"/>
      </ResultsScaffold>
    </div></>
  );
}
