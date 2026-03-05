import React, { useState, useEffect } from 'react';
import { getAccessToken, SUPABASE_ANON_KEY, supabase } from '../../lib/supabaseClient.js';
import { MOTIVATION_TEST } from '../../data/tests/motivationEngine.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';

const PAGE_ACCENT = '#10b981';
const DIM_ACCENT = {
  power:       { color:'#f43f5e', gradient:'linear-gradient(90deg,#881337,#f43f5e)', glow:'rgba(244,63,94,.55)',   blob:'#f43f5e', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(244,63,94,.4),0 0 30px -4px rgba(244,63,94,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  affiliation: { color:'#60a5fa', gradient:'linear-gradient(90deg,#1e3a8a,#60a5fa)', glow:'rgba(96,165,250,.55)',  blob:'#60a5fa', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(96,165,250,.4),0 0 30px -4px rgba(96,165,250,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  achievement: { color:'#f59e0b', gradient:'linear-gradient(90deg,#78350f,#f59e0b)', glow:'rgba(245,158,11,.55)',  blob:'#f59e0b', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(245,158,11,.4),0 0 30px -4px rgba(245,158,11,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  security:    { color:'#a78bfa', gradient:'linear-gradient(90deg,#3b0764,#a78bfa)', glow:'rgba(167,139,250,.55)', blob:'#a78bfa', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(167,139,250,.4),0 0 30px -4px rgba(167,139,250,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  autonomy:    { color:'#34d399', gradient:'linear-gradient(90deg,#064e3b,#34d399)', glow:'rgba(52,211,153,.55)',  blob:'#34d399', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(52,211,153,.4),0 0 30px -4px rgba(52,211,153,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  meaning:     { color:'#c084fc', gradient:'linear-gradient(90deg,#4a044e,#c084fc)', glow:'rgba(192,132,252,.55)', blob:'#c084fc', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(192,132,252,.4),0 0 30px -4px rgba(192,132,252,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  recognition: { color:'#fbbf24', gradient:'linear-gradient(90deg,#713f12,#fbbf24)', glow:'rgba(251,191,36,.55)',  blob:'#fbbf24', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(251,191,36,.4),0 0 30px -4px rgba(251,191,36,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  discovery:   { color:'#67e8f9', gradient:'linear-gradient(90deg,#164e63,#67e8f9)', glow:'rgba(103,232,249,.55)', blob:'#67e8f9', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(103,232,249,.4),0 0 30px -4px rgba(103,232,249,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
};
const MEDALS = ['🥇','🥈','🥉'];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.mot-root{font-family:'Space Grotesk',sans-serif;background:#0d0f2b;color:#fff;min-height:100vh;overflow-x:hidden;}
.mot-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 15% 20%,rgba(16,185,129,.09) 0%,transparent 65%),radial-gradient(ellipse 50% 50% at 85% 75%,rgba(52,211,153,.06) 0%,transparent 65%);}
.mot-glass{background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6);}
.mot-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(16,185,129,.22) 35%,rgba(16,185,129,.1) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.mot-card{border-radius:16px;overflow:hidden;position:relative;isolation:isolate;transition:transform .28s cubic-bezier(.22,.68,0,1.15),box-shadow .28s ease;}
.mot-card::after{content:'';position:absolute;width:150px;height:150px;border-radius:50%;filter:blur(55px);bottom:-50px;right:-40px;opacity:.18;pointer-events:none;z-index:-1;transition:opacity .3s,transform .3s;}
.mot-card:hover::after{opacity:.35;transform:scale(1.2);}
.mot-glow-line{position:absolute;bottom:0;left:15%;right:15%;height:1px;border-radius:100px;opacity:0;transition:opacity .3s;}
.mot-card:hover .mot-glow-line{opacity:1;}
@keyframes spinLoader{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
.mot-fadein{animation:fadeUp .6s cubic-bezier(.22,.68,0,1.1) forwards;}
`;
const G = { background:'rgba(16,20,56,.6)',backdropFilter:'blur(24px) saturate(180%)',WebkitBackdropFilter:'blur(24px) saturate(180%)',border:'1px solid rgba(255,255,255,.07)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.1),0 8px 32px -4px rgba(0,0,0,.6)',borderRadius:20 };

export default function MotivationResults() {
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
        supabase.from('user_psychometrics').select('*').eq('user_id',user.id).eq('test_type','MOTIVATION').order('completed_at',{ascending:false}).limit(1),
        supabase.from('ai_interpretations').select('interpretation').eq('user_id',user.id).eq('test_type','MOTIVATION').eq('prompt_version',PROMPT_VERSION).maybeSingle(),
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
        body: { test_type:'MOTIVATION', raw_scores: r.raw_scores, report: r.report, force },
        headers: { Authorization:`Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
      });
      if (fnErr) throw fnErr;
      setInterpretation(d?.interpretation ?? null);
    } catch { setInterpError('Nie udało się wygenerować interpretacji.'); }
    finally { setInterpLoading(false); }
  };
  const regenerate = () => { if (results) { setInterpretation(null); generateInterpretation(results,{force:true}); } };

  if (loading) return (<><style>{CSS}</style><div className="mot-root" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><div style={{textAlign:'center'}}><div style={{width:44,height:44,border:`3px solid rgba(16,185,129,.22)`,borderTopColor:PAGE_ACCENT,borderRadius:'50%',animation:'spinLoader 1s linear infinite',margin:'0 auto 16px'}}/><p style={{color:'rgba(255,255,255,.4)',fontSize:13}}>Ładowanie wyników...</p></div></div></>);
  if (error) return (<><style>{CSS}</style><div className="mot-root" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:24,minHeight:'100vh'}}><div className="mot-glass" style={{...G,padding:40,textAlign:'center',maxWidth:380}}><div style={{fontSize:44,marginBottom:16}}>⚠️</div><p style={{color:'rgba(255,255,255,.7)',marginBottom:24,lineHeight:1.6}}>{error}</p><button onClick={()=>window.location.href='/user-profile-tests.html'} style={{background:`linear-gradient(135deg,${PAGE_ACCENT}cc,${PAGE_ACCENT})`,color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',fontSize:14}}>Wróć do Dashboardu</button></div></div></>);

  const rs = results.raw_scores || {};
  const rawDims = rs.raw_scores || {};
  const topDrives = rs.top_drives || MOTIVATION_TEST.dimensions.map(d => ({ ...d, score: rawDims[d.id]||0 })).sort((a,b) => b.score - a.score).slice(0,3);
  const shadowDrive = rs.shadow_drive || null;
  const sortedDrives = rs.sorted_drives || MOTIVATION_TEST.dimensions.map(d => ({ ...d, score: rawDims[d.id]||0 })).sort((a,b) => b.score - a.score);
  const maxScore = Math.max(...sortedDrives.map(d => d.score||0)) || 1;

  return (
    <><style>{CSS}</style>
    <div className="mot-root">
      <ResultsScaffold accent={PAGE_ACCENT} navLabel="SILNIK MOTYWACJI"
        badge="🔥 Silnik Motywacji"
        title={<>Twój <span style={{color:PAGE_ACCENT,textShadow:`0 0 24px ${PAGE_ACCENT}66`}}>Silnik Motywacji</span></>}
        subtitle="Model McClellanda & Pinka · 8 motywatorów wewnętrznych"
        completedAt={results?.completed_at} retakeHref="/test?type=motivation_engine">

        {/* Top 3 drives */}
        <div style={{marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
            <span style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)'}}>Twoje 3 główne motywatory</span>
            <span style={{flex:1,height:1,background:`linear-gradient(90deg,${PAGE_ACCENT}66,transparent)`}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)',gap:16}}>
            {topDrives.slice(0,3).map((drive, i) => {
              const dim = MOTIVATION_TEST.dimensions.find(d => d.id === drive.id) || drive;
              const ac = DIM_ACCENT[drive.id] || DIM_ACCENT.achievement;
              const pct = Math.round(((drive.score||0)/6)*100);
              return (
                <div key={drive.id} className="mot-glass mot-card mot-fadein" style={{...G,padding:'28px 24px',position:'relative',overflow:'hidden'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px) scale(1.01)';e.currentTarget.style.boxShadow=ac.hover;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=G.boxShadow;}}>
                  <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:ac.blob,opacity:.18,filter:'blur(50px)',pointerEvents:'none'}}/>
                  <div className="mot-glow-line" style={{background:ac.color,boxShadow:`0 0 10px 2px ${ac.glow}`}}/>
                  <div style={{position:'relative'}}>
                    <div style={{fontSize:36,marginBottom:4}}>{MEDALS[i]}</div>
                    <div style={{fontSize:26,marginBottom:10}}>{dim.icon}</div>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:ac.color,marginBottom:4}}>{dim.name_en}</div>
                    <div style={{fontSize:17,fontWeight:800,marginBottom:12,lineHeight:1.2}}>{dim.name}</div>
                    <div style={{height:4,borderRadius:100,background:'rgba(255,255,255,.07)',marginBottom:8,overflow:'hidden'}}>
                      <div style={{width:`${pct}%`,height:'100%',background:ac.gradient,borderRadius:100,boxShadow:`0 0 10px ${ac.glow}`}}/>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'rgba(255,255,255,.4)'}}>
                      <span>{(drive.score||0).toFixed(2)}/6.0</span>
                      <span style={{color:ac.color,fontWeight:700}}>{pct}%</span>
                    </div>
                    {dim.description && <p style={{fontSize:12,color:'rgba(255,255,255,.4)',lineHeight:1.55,marginTop:12}}>{dim.description.substring(0,90)}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full 8-drive ranking */}
        <div style={{marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
            <span style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)'}}>Pełny ranking 8 motywatorów</span>
            <span style={{flex:1,height:1,background:`linear-gradient(90deg,${PAGE_ACCENT}66,transparent)`}}/>
          </div>
          <div className="mot-glass" style={{...G,padding:'28px 24px',display:'flex',flexDirection:'column',gap:14}}>
            {sortedDrives.map((drive, i) => {
              const dim = MOTIVATION_TEST.dimensions.find(d => d.id === drive.id) || drive;
              const ac = DIM_ACCENT[drive.id] || DIM_ACCENT.achievement;
              const pct = Math.round(((drive.score||0)/maxScore)*100);
              const isTop3 = i < 3;
              const isShadow = drive.id === shadowDrive?.id;
              return (
                <div key={drive.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:12,background: isTop3 ? `${ac.color}10` : isShadow ? 'rgba(244,63,94,.07)' : 'rgba(255,255,255,.03)',border: isTop3 ? `1px solid ${ac.color}30` : isShadow ? '1px solid rgba(244,63,94,.2)' : '1px solid rgba(255,255,255,.06)'}}>
                  <span style={{fontSize:18,width:28,textAlign:'center'}}>{isTop3 ? MEDALS[i] : isShadow ? '🌑' : `${i+1}.`}</span>
                  <span style={{fontSize:18,width:22,textAlign:'center'}}>{dim.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{fontSize:13,fontWeight:700,color: isTop3 ? ac.color : isShadow ? '#f87171' : 'rgba(255,255,255,.65)'}}>{dim.name}</span>
                      <span style={{fontSize:12,fontWeight:700,color: isTop3 ? ac.color : 'rgba(255,255,255,.35)'}}>{(drive.score||0).toFixed(2)}/6</span>
                    </div>
                    <div style={{height:5,borderRadius:100,background:'rgba(255,255,255,.07)',overflow:'hidden'}}>
                      <div style={{width:`${pct}%`,height:'100%',background: isShadow ? 'linear-gradient(90deg,#7f1d1d,#f87171)' : ac.gradient,borderRadius:100,boxShadow:`0 0 8px ${isShadow ? 'rgba(248,113,113,.5)' : ac.glow}`}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shadow drive warning */}
        {shadowDrive && (() => {
          const shadowDim = MOTIVATION_TEST.dimensions.find(d => d.id === shadowDrive.id) || shadowDrive;
          return (
            <div className="mot-glass" style={{...G,marginBottom:24,padding:'28px 28px',borderColor:'rgba(244,63,94,.2)',background:'rgba(244,63,94,.04)',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-30,right:-30,width:200,height:200,borderRadius:'50%',background:'#f43f5e',opacity:.06,filter:'blur(60px)',pointerEvents:'none'}}/>
              <div style={{position:'relative',display:'flex',gap:20,alignItems:isMobile?'flex-start':'center',flexDirection:isMobile?'column':'row'}}>
                <div style={{minWidth:68,height:68,borderRadius:16,background:'rgba(244,63,94,.12)',border:'1.5px solid rgba(244,63,94,.25)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:2}}>
                  <span style={{fontSize:22}}>{shadowDim.icon}</span>
                  <span style={{fontSize:10,fontWeight:700,color:'#f87171'}}>CIEŃ</span>
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'#f87171',marginBottom:4}}>Motywator Cienia — obszar do odkrycia</div>
                  <div style={{fontSize:18,fontWeight:800,color:'#fff',marginBottom:8}}>{shadowDim.name}</div>
                  <p style={{fontSize:13,color:'rgba(255,255,255,.55)',lineHeight:1.65,maxWidth:520}}>
                    {shadowDim.name} to Twój najsłabiej wyrażony motywator. Może to oznaczać, że ten obszar jest mniej aktywowany w Twoim życiu — co jest zarówno informacją o Twoich priorytetach, jak i potencjalnym obszarem wzrostu.
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* AI Interpretation */}
        <div className="mot-glass" style={{...G,padding:36,marginBottom:32,overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:400,height:180,background:'rgba(16,185,129,.06)',borderRadius:'50%',filter:'blur(60px)',pointerEvents:'none'}}/>
          <div style={{position:'relative'}}>
            <AiInterpretation interpretation={interpretation} loading={interpLoading} error={interpError}
              onRegenerate={regenerate} onRetry={() => generateInterpretation(results)}
              accentColor={PAGE_ACCENT} accentGlow="rgba(16,185,129,.5)" testLabel="Twojego silnika motywacji"/>
          </div>
        </div>

        <ResultsFooterActions retakeHref="/test?type=motivation_engine"/>
      </ResultsScaffold>
    </div></>
  );
}
