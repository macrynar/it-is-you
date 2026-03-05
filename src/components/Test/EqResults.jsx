import React, { useState, useEffect } from 'react';
import { getAccessToken, SUPABASE_ANON_KEY, supabase } from '../../lib/supabaseClient.js';
import { EQ_TEST } from '../../data/tests/emotionalIntelligence.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';

const PAGE_ACCENT = '#06b6d4';
const DIM_ACCENT = {
  self_awareness:  { color:'#06b6d4', gradient:'linear-gradient(90deg,#164e63,#06b6d4)', glow:'rgba(6,182,212,.55)',   blob:'#06b6d4', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(6,182,212,.4),0 0 30px -4px rgba(6,182,212,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  self_regulation: { color:'#0ea5e9', gradient:'linear-gradient(90deg,#0c4a6e,#0ea5e9)', glow:'rgba(14,165,233,.55)', blob:'#0ea5e9', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(14,165,233,.4),0 0 30px -4px rgba(14,165,233,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  empathy:         { color:'#38bdf8', gradient:'linear-gradient(90deg,#075985,#38bdf8)', glow:'rgba(56,189,248,.55)', blob:'#38bdf8', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(56,189,248,.4),0 0 30px -4px rgba(56,189,248,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  social_skills:   { color:'#67e8f9', gradient:'linear-gradient(90deg,#155e75,#67e8f9)', glow:'rgba(103,232,249,.45)',blob:'#67e8f9', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(103,232,249,.35),0 0 30px -4px rgba(103,232,249,.25),0 16px 48px -6px rgba(0,0,0,.7)' },
  motivation:      { color:'#22d3ee', gradient:'linear-gradient(90deg,#134e4a,#22d3ee)', glow:'rgba(34,211,238,.55)', blob:'#22d3ee', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(34,211,238,.4),0 0 30px -4px rgba(34,211,238,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.eq-root{font-family:'Space Grotesk',sans-serif;background:#0d0f2b;color:#fff;min-height:100vh;overflow-x:hidden;}
.eq-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 15% 20%,rgba(6,182,212,.12) 0%,transparent 65%),radial-gradient(ellipse 50% 50% at 85% 75%,rgba(6,182,212,.08) 0%,transparent 65%);}
.eq-glass{background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6);}
.eq-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(6,182,212,.22) 35%,rgba(6,182,212,.12) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.eq-card{border-radius:16px;overflow:hidden;position:relative;isolation:isolate;transition:transform .28s cubic-bezier(.22,.68,0,1.15),box-shadow .28s ease;}
.eq-card::after{content:'';position:absolute;width:120px;height:120px;border-radius:50%;filter:blur(45px);bottom:-40px;right:-30px;opacity:.18;pointer-events:none;z-index:-1;transition:opacity .3s,transform .3s;}
.eq-card:hover::after{opacity:.35;transform:scale(1.2);}
.eq-glow-line{position:absolute;bottom:0;left:15%;right:15%;height:1px;border-radius:100px;opacity:0;transition:opacity .3s;}
.eq-card:hover .eq-glow-line{opacity:1;}
.eq-pfill{height:100%;border-radius:100px;position:relative;}
.eq-pfill::after{content:'';position:absolute;right:-1px;top:50%;transform:translateY(-50%);width:9px;height:9px;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.6);}
@keyframes spinLoader{to{transform:rotate(360deg);}}
@keyframes ringIn{from{opacity:0;transform:scale(.85);}to{opacity:1;transform:scale(1);}}
.eq-ring{animation:ringIn .8s cubic-bezier(.22,.68,0,1.1) forwards;}
`;
const G = { background:'rgba(16,20,56,.6)',backdropFilter:'blur(24px) saturate(180%)',WebkitBackdropFilter:'blur(24px) saturate(180%)',border:'1px solid rgba(255,255,255,.07)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.1),0 8px 32px -4px rgba(0,0,0,.6)',borderRadius:20 };

export default function EqResults() {
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
      const { data: { user }, error: ue } = await supabase.auth.getUser();
      if (ue || !user) throw new Error('Nie jesteś zalogowany');
      const [{ data, error: fe }, { data: cached }] = await Promise.all([
        supabase.from('user_psychometrics').select('*').eq('user_id', user.id).eq('test_type','EQ').order('completed_at',{ascending:false}).limit(1),
        supabase.from('ai_interpretations').select('interpretation').eq('user_id', user.id).eq('test_type','EQ').eq('prompt_version',PROMPT_VERSION).maybeSingle(),
      ]);
      if (fe) throw fe;
      if (!data?.length) { setError('Nie znaleziono wyników testu.'); setLoading(false); return; }
      setResults(data[0]);
      setLoading(false);
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
        body: { test_type:'EQ', raw_scores: r.raw_scores, report: r.report, force },
        headers: { Authorization:`Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
      });
      if (fnErr) throw fnErr;
      setInterpretation(d?.interpretation ?? null);
    } catch { setInterpError('Nie udało się wygenerować interpretacji.'); }
    finally { setInterpLoading(false); }
  };
  const regenerate = () => { if (results) { setInterpretation(null); generateInterpretation(results,{force:true}); } };

  if (loading) return (<><style>{CSS}</style><div className="eq-root" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><div style={{textAlign:'center'}}><div style={{width:44,height:44,border:'3px solid rgba(6,182,212,.22)',borderTopColor:PAGE_ACCENT,borderRadius:'50%',animation:'spinLoader 1s linear infinite',margin:'0 auto 16px'}}/><p style={{color:'rgba(255,255,255,.4)',fontSize:13}}>Ładowanie wyników...</p></div></div></>);
  if (error) return (<><style>{CSS}</style><div className="eq-root" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:24,minHeight:'100vh'}}><div className="eq-glass" style={{...G,padding:40,textAlign:'center',maxWidth:380}}><div style={{fontSize:44,marginBottom:16}}>⚠️</div><p style={{color:'rgba(255,255,255,.7)',marginBottom:24,lineHeight:1.6}}>{error}</p><button onClick={()=>window.location.href='/user-profile-tests.html'} style={{background:`linear-gradient(135deg,${PAGE_ACCENT}cc,${PAGE_ACCENT})`,color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',fontSize:14}}>Wróć do Dashboardu</button></div></div></>);

  const rs = results.raw_scores || {};
  const rawDims = rs.raw_scores || {};
  const pctDims = rs.percentile_scores || {};
  const totalEQ = rs.total_eq ?? 0;
  const totalPct = Math.round(((totalEQ - 1) / 4) * 100);
  const dims = EQ_TEST.dimensions.map(d => ({
    ...d,
    raw: rawDims[d.id] ?? 0,
    pct: pctDims[d.id] != null ? Math.round(pctDims[d.id]) : Math.round(((rawDims[d.id]??1)-1)/4*100),
  }));
  const sorted = [...dims].sort((a,b) => b.pct - a.pct);
  const highest = sorted[0]; const lowest = sorted[sorted.length-1];
  const eqLabel = totalEQ >= 4.0 ? 'Wysoki' : totalEQ >= 2.5 ? 'Średni' : 'Niski';

  return (
    <><style>{CSS}</style>
    <div className="eq-root">
      <ResultsScaffold accent={PAGE_ACCENT} navLabel="INTELIGENCJA EMOCJONALNA"
        badge="🧠 Inteligencja Emocjonalna (EQ)"
        title={<>Twoje wyniki <span style={{color:PAGE_ACCENT,textShadow:`0 0 24px ${PAGE_ACCENT}66`}}>EQ</span></>}
        subtitle="Model Golemana · 5 wymiarów inteligencji emocjonalnej"
        completedAt={results?.completed_at} retakeHref="/test?type=emotional_intelligence">

        {/* Hero row */}
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 340px',gap:24,marginBottom:24}}>
          <div className="eq-glass" style={{...G,padding:36,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:24}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',alignSelf:'flex-start',display:'flex',alignItems:'center',gap:12,width:'100%'}}>
              Ogólny poziom EQ <span style={{flex:1,height:1,background:`linear-gradient(90deg,${PAGE_ACCENT}66,transparent)`}}/>
            </div>
            <div className="eq-ring" style={{width:180,height:180,borderRadius:'50%',background:`conic-gradient(${PAGE_ACCENT} ${totalPct*3.6}deg, rgba(255,255,255,.06) 0deg)`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 60px rgba(6,182,212,.3),0 0 0 1px rgba(6,182,212,.15)`}}>
              <div style={{width:142,height:142,borderRadius:'50%',background:'#0d0f2b',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2}}>
                <span style={{fontSize:40,fontWeight:800,color:PAGE_ACCENT,letterSpacing:'-2px'}}>{totalPct}%</span>
                <span style={{fontSize:11,color:'rgba(255,255,255,.35)',fontWeight:600,letterSpacing:1}}>percentyl</span>
              </div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:800,letterSpacing:'-.3px'}}>{totalEQ.toFixed(2)} / 5.0</div>
              <div style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:8,fontSize:12,fontWeight:700,color:PAGE_ACCENT,background:'rgba(6,182,212,.1)',border:'1px solid rgba(6,182,212,.25)',padding:'5px 14px',borderRadius:100}}>Poziom: {eqLabel}</div>
            </div>
          </div>

          <div className="eq-glass" style={{...G,padding:'28px 24px',display:'flex',flexDirection:'column',gap:18}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)'}}>Profil EQ</div>
            <div style={{background:'rgba(6,182,212,.06)',border:'1px solid rgba(6,182,212,.18)',borderRadius:14,padding:18}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:'2.5px',textTransform:'uppercase',color:PAGE_ACCENT,marginBottom:6}}>Dominujący wymiar</div>
              <div style={{fontSize:20,fontWeight:800,marginBottom:4,display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:22}}>{highest.icon}</span>{highest.name}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.4)',lineHeight:1.5,marginBottom:10}}>{highest.description?.substring(0,80)}…</div>
              <div style={{display:'inline-flex',gap:6,fontSize:11,fontWeight:700,color:'#b08fff',background:'rgba(123,94,167,.12)',border:'1px solid rgba(123,94,167,.25)',padding:'4px 10px',borderRadius:100}}>💎 Wynik: {highest.pct}%</div>
            </div>
            <div style={{height:1,background:'rgba(255,255,255,.07)'}}/>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)'}}>Ranking wymiarów</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {sorted.map(d => { const ac=DIM_ACCENT[d.id]; return (
                <div key={d.id} style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:16,width:22,textAlign:'center',flexShrink:0}}>{d.icon}</span>
                  <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,.6)',width:120,flexShrink:0,lineHeight:1.2}}>{d.name}</span>
                  <div style={{flex:1,height:4,background:'rgba(255,255,255,.07)',borderRadius:100,overflow:'hidden'}}>
                    <div style={{width:`${d.pct}%`,height:'100%',background:ac.gradient,boxShadow:`0 0 8px ${ac.glow}`,borderRadius:100}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,minWidth:34,textAlign:'right',color:ac.color}}>{d.pct}%</span>
                </div>
              );})}
            </div>
            <div style={{background:'rgba(123,94,167,.08)',border:'1px solid rgba(123,94,167,.2)',borderRadius:12,padding:16,fontSize:13,lineHeight:1.65,color:'rgba(255,255,255,.52)'}}>
              <strong style={{color:'rgba(255,255,255,.85)'}}>Twój najsilniejszy obszar to {highest.name}</strong>, a potencjał wzrostu leży w obszarze <strong style={{color:'rgba(255,255,255,.85)'}}>{lowest.name}</strong>.
            </div>
          </div>
        </div>

        {/* Dimension stat cards */}
        <div style={{marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
            <span style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)'}}>Szczegółowe wyniki — 5 wymiarów EQ</span>
            <span style={{flex:1,height:1,background:`linear-gradient(90deg,${PAGE_ACCENT}66,transparent)`}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)',gap:16}}>
            {dims.map(d => { const ac=DIM_ACCENT[d.id]; return (
              <div key={d.id} className="eq-glass eq-card" style={{...G,padding:'22px 22px 20px'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px) scale(1.01)';e.currentTarget.style.boxShadow=ac.hover;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=G.boxShadow;}}>
                <div style={{position:'absolute',width:120,height:120,borderRadius:'50%',filter:'blur(45px)',bottom:-40,right:-30,background:ac.blob,opacity:.18,pointerEvents:'none'}}/>
                <div className="eq-glow-line" style={{background:ac.color,boxShadow:`0 0 10px 2px ${ac.glow}`}}/>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
                  <div>
                    <div style={{fontSize:24,marginBottom:6}}>{d.icon}</div>
                    <div style={{fontSize:10,fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:3}}>{d.name_en}</div>
                    <div style={{fontSize:15,fontWeight:700,color:'#fff'}}>{d.name}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:28,fontWeight:800,color:ac.color,lineHeight:1,letterSpacing:'-.5px'}}>{d.pct}%</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.3)',marginTop:2}}>{d.raw.toFixed(1)}/5.0</div>
                  </div>
                </div>
                <div style={{height:4,borderRadius:100,background:'rgba(255,255,255,.07)',marginBottom:12,overflow:'hidden',position:'relative'}}>
                  <div className="eq-pfill" style={{width:`${d.pct}%`,background:ac.gradient,boxShadow:`0 0 10px ${ac.glow}`}}/>
                </div>
                <div style={{fontSize:12,color:'rgba(255,255,255,.35)',lineHeight:1.55}}>{d.description?.substring(0,90)}</div>
              </div>
            );})}
          </div>
        </div>

        {/* AI Interpretation */}
        <div className="eq-glass" style={{...G,padding:36,marginBottom:32,overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:400,height:180,background:'rgba(6,182,212,.07)',borderRadius:'50%',filter:'blur(60px)',pointerEvents:'none'}}/>
          <div style={{position:'relative'}}>
            <AiInterpretation interpretation={interpretation} loading={interpLoading} error={interpError}
              onRegenerate={regenerate} onRetry={() => generateInterpretation(results)}
              accentColor={PAGE_ACCENT} accentGlow="rgba(6,182,212,.5)" testLabel="Twojego profilu EQ"/>
          </div>
        </div>

        <ResultsFooterActions retakeHref="/test?type=emotional_intelligence"/>
      </ResultsScaffold>
    </div></>
  );
}
