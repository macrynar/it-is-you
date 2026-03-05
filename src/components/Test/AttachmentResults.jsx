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
  secure:        { color:'#10b981', gradient:'linear-gradient(90deg,#064e3b,#10b981)', glow:'rgba(16,185,129,.55)', blob:'#10b981', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(16,185,129,.4),0 0 30px -4px rgba(16,185,129,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  anxious:       { color:'#f59e0b', gradient:'linear-gradient(90deg,#78350f,#f59e0b)', glow:'rgba(245,158,11,.55)', blob:'#f59e0b', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(245,158,11,.4),0 0 30px -4px rgba(245,158,11,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  avoidant:      { color:'#8b5cf6', gradient:'linear-gradient(90deg,#3b0764,#8b5cf6)', glow:'rgba(139,92,246,.55)', blob:'#8b5cf6', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(139,92,246,.4),0 0 30px -4px rgba(139,92,246,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  disorganized:  { color:'#f43f5e', gradient:'linear-gradient(90deg,#881337,#f43f5e)', glow:'rgba(244,63,94,.55)',  blob:'#f43f5e', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(244,63,94,.4),0 0 30px -4px rgba(244,63,94,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.at-root{font-family:'Space Grotesk',sans-serif;background:#0d0f2b;color:#fff;min-height:100vh;overflow-x:hidden;}
.at-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 15% 20%,rgba(236,72,153,.1) 0%,transparent 65%),radial-gradient(ellipse 50% 50% at 85% 75%,rgba(139,92,246,.08) 0%,transparent 65%);}
.at-glass{background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6);}
.at-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(236,72,153,.22) 35%,rgba(236,72,153,.1) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.at-card{border-radius:16px;overflow:hidden;position:relative;isolation:isolate;transition:transform .28s cubic-bezier(.22,.68,0,1.15),box-shadow .28s ease;}
.at-card::after{content:'';position:absolute;width:120px;height:120px;border-radius:50%;filter:blur(45px);bottom:-40px;right:-30px;opacity:.18;pointer-events:none;z-index:-1;transition:opacity .3s,transform .3s;}
.at-card:hover::after{opacity:.35;transform:scale(1.2);}
.at-glow-line{position:absolute;bottom:0;left:15%;right:15%;height:1px;border-radius:100px;opacity:0;transition:opacity .3s;}
.at-card:hover .at-glow-line{opacity:1;}
@keyframes spinLoader{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
.at-fadein{animation:fadeUp .6s cubic-bezier(.22,.68,0,1.1) forwards;}
`;
const G = { background:'rgba(16,20,56,.6)',backdropFilter:'blur(24px) saturate(180%)',WebkitBackdropFilter:'blur(24px) saturate(180%)',border:'1px solid rgba(255,255,255,.07)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.1),0 8px 32px -4px rgba(0,0,0,.6)',borderRadius:20 };

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

  if (loading) return (<><style>{CSS}</style><div className="at-root" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><div style={{textAlign:'center'}}><div style={{width:44,height:44,border:'3px solid rgba(236,72,153,.22)',borderTopColor:PAGE_ACCENT,borderRadius:'50%',animation:'spinLoader 1s linear infinite',margin:'0 auto 16px'}}/><p style={{color:'rgba(255,255,255,.4)',fontSize:13}}>Ładowanie wyników...</p></div></div></>);
  if (error) return (<><style>{CSS}</style><div className="at-root" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:24,minHeight:'100vh'}}><div className="at-glass" style={{...G,padding:40,textAlign:'center',maxWidth:380}}><div style={{fontSize:44,marginBottom:16}}>⚠️</div><p style={{color:'rgba(255,255,255,.7)',marginBottom:24,lineHeight:1.6}}>{error}</p><button onClick={()=>window.location.href='/user-profile-tests.html'} style={{background:`linear-gradient(135deg,${PAGE_ACCENT}cc,${PAGE_ACCENT})`,color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',fontSize:14}}>Wróć do Dashboardu</button></div></div></>);

  const rs = results.raw_scores || {};
  const rawDims = rs.raw_scores || {};
  const dominantId = rs.dominant_style?.id || Object.entries(rawDims).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'secure';
  const sortedStyles = rs.sorted_styles || ATTACHMENT_TEST.dimensions.map(d => ({ id: d.id, score: rawDims[d.id] ?? 0, ...d })).sort((a,b) => b.score - a.score);
  const dominant = ATTACHMENT_TEST.dimensions.find(d => d.id === dominantId) || ATTACHMENT_TEST.dimensions[0];
  const second = sortedStyles[1];
  const domAc = DIM_ACCENT[dominantId] || DIM_ACCENT.secure;
  const maxScore = Math.max(...sortedStyles.map(s => s.score || 0)) || 1;

  return (
    <><style>{CSS}</style>
    <div className="at-root">
      <ResultsScaffold accent={PAGE_ACCENT} navLabel="STYL PRZYWIĄZANIA"
        badge="💗 Styl Przywiązania"
        title={<>Twój <span style={{color:PAGE_ACCENT,textShadow:`0 0 24px ${PAGE_ACCENT}66`}}>Styl Przywiązania</span></>}
        subtitle="Teoria Przywiązania Bowlby'ego / Ainsworth · 4 style relacyjne"
        completedAt={results?.completed_at} retakeHref="/test?type=attachment_style">

        {/* Dominant style hero */}
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 320px',gap:24,marginBottom:24}}>

          {/* Large dominant card */}
          <div className="at-glass at-fadein" style={{...G,padding:40,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-60,right:-60,width:260,height:260,borderRadius:'50%',background:domAc.blob,opacity:.12,filter:'blur(60px)',pointerEvents:'none'}}/>
            <div style={{position:'relative'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
                <div style={{width:52,height:52,borderRadius:14,background:`${domAc.color}22`,border:`1.5px solid ${domAc.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>{dominant.icon}</div>
                <div>
                  <div style={{fontSize:11,fontWeight:600,letterSpacing:'2.5px',textTransform:'uppercase',color:domAc.color,marginBottom:3}}>Dominujący styl · {Math.round((rawDims[dominantId]/6)*100)}%</div>
                  <div style={{fontSize:22,fontWeight:800,letterSpacing:'-.3px'}}>{dominant.name}</div>
                </div>
              </div>
              <p style={{fontSize:15,color:'rgba(255,255,255,.7)',lineHeight:1.7,marginBottom:20}}>{dominant.description}</p>
              {dominant.strengths && <div style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:10}}>Silne strony</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {(dominant.strengths||[]).map((s,i) => <span key={i} style={{fontSize:12,fontWeight:600,color:domAc.color,background:`${domAc.color}15`,border:`1px solid ${domAc.color}33`,padding:'4px 12px',borderRadius:100}}>{s}</span>)}
                </div>
              </div>}
              {dominant.challenges && <div>
                <div style={{fontSize:11,fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:10}}>Obszary do pracy</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {(dominant.challenges||[]).map((c,i) => <span key={i} style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,.5)',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',padding:'4px 12px',borderRadius:100}}>{c}</span>)}
                </div>
              </div>}
            </div>
          </div>

          {/* Style ranking */}
          <div className="at-glass" style={{...G,padding:'28px 24px',display:'flex',flexDirection:'column',gap:20}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)'}}>Profil stylów</div>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {sortedStyles.map((s,i) => {
                const dim = ATTACHMENT_TEST.dimensions.find(d => d.id === s.id);
                const ac = DIM_ACCENT[s.id] || DIM_ACCENT.secure;
                const barPct = Math.round(((s.score||0) / 6) * 100);
                const isDom = s.id === dominantId;
                return (
                  <div key={s.id} style={{background: isDom ? `${ac.color}12` : 'rgba(255,255,255,.03)', border: isDom ? `1px solid ${ac.color}33` : '1px solid rgba(255,255,255,.06)', borderRadius:12, padding:'14px 16px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                      <span style={{fontSize:18}}>{dim?.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span style={{fontSize:13,fontWeight:700,color: isDom ? ac.color : 'rgba(255,255,255,.7)'}}>{dim?.name}</span>
                          {isDom && <span style={{fontSize:10,fontWeight:700,color:ac.color,background:`${ac.color}18`,border:`1px solid ${ac.color}33`,padding:'2px 8px',borderRadius:100}}>DOMINUJĄCY</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{height:4,borderRadius:100,background:'rgba(255,255,255,.07)',marginBottom:6,overflow:'hidden'}}>
                      <div style={{width:`${barPct}%`,height:'100%',background:ac.gradient,borderRadius:100,boxShadow:`0 0 8px ${ac.glow}`}}/>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'rgba(255,255,255,.4)'}}>
                      <span>{(s.score||0).toFixed(2)}/6.0</span>
                      <span style={{color: isDom ? ac.color : undefined,fontWeight: isDom ? 700 : 400}}>{barPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {second && <div style={{background:'rgba(123,94,167,.08)',border:'1px solid rgba(123,94,167,.2)',borderRadius:12,padding:16,fontSize:13,lineHeight:1.65,color:'rgba(255,255,255,.52)'}}>
              Dominujesz stylem <strong style={{color:'rgba(255,255,255,.85)'}}>{dominant.name}</strong>. Wtórnie obecny jest <strong style={{color:'rgba(255,255,255,.85)'}}>{ATTACHMENT_TEST.dimensions.find(d=>d.id===second.id)?.name}</strong>.
            </div>}
          </div>
        </div>

        {/* All 4 dimension detail cards */}
        <div style={{marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
            <span style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)'}}>Szczegółowe wyniki — 4 style przywiązania</span>
            <span style={{flex:1,height:1,background:`linear-gradient(90deg,${PAGE_ACCENT}66,transparent)`}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)',gap:16}}>
            {ATTACHMENT_TEST.dimensions.map(d => {
              const ac = DIM_ACCENT[d.id] || DIM_ACCENT.secure;
              const score = rawDims[d.id] ?? 0;
              const pct = Math.round((score/6)*100);
              const isDom = d.id === dominantId;
              return (
                <div key={d.id} className="at-glass at-card" style={{...G,padding:'22px 22px 20px'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px) scale(1.01)';e.currentTarget.style.boxShadow=ac.hover;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=G.boxShadow;}}>
                  <div style={{position:'absolute',width:120,height:120,borderRadius:'50%',filter:'blur(45px)',bottom:-40,right:-30,background:ac.blob,opacity: isDom ? .28 : .14,pointerEvents:'none'}}/>
                  <div className="at-glow-line" style={{background:ac.color,boxShadow:`0 0 10px 2px ${ac.glow}`}}/>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{fontSize:24}}>{d.icon}</div>
                      <div>
                        <div style={{fontSize:10,fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:3}}>{d.name_en}</div>
                        <div style={{fontSize:15,fontWeight:700,color:'#fff'}}>{d.name}</div>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      {isDom && <div style={{fontSize:9,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:ac.color,background:`${ac.color}18`,border:`1px solid ${ac.color}30`,padding:'2px 8px',borderRadius:100,marginBottom:4}}>DOMINUJĄCY</div>}
                      <div style={{fontSize:28,fontWeight:800,color:ac.color,lineHeight:1}}>{pct}%</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>{score.toFixed(2)}/6.0</div>
                    </div>
                  </div>
                  <div style={{height:4,borderRadius:100,background:'rgba(255,255,255,.07)',marginBottom:12,overflow:'hidden'}}>
                    <div style={{width:`${pct}%`,height:'100%',background:ac.gradient,boxShadow:`0 0 10px ${ac.glow}`,borderRadius:100}}/>
                  </div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,.35)',lineHeight:1.55}}>{d.description?.substring(0,100)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Interpretation */}
        <div className="at-glass" style={{...G,padding:36,marginBottom:32,overflow:'hidden'}}>
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
