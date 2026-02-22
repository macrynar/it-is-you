import React, { useState, useEffect } from 'react';
import { getAccessToken, SUPABASE_ANON_KEY, supabase } from '../../lib/supabaseClient.js';
import { HEXACO_TEST } from '../../data/tests/hexaco.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';

const PAGE_ACCENT = '#1F3C88';

const ACCENT = {
  honesty_humility: { plName:'Szczerość', name:'Honesty-Humility', color:'#38b6ff', gradient:'linear-gradient(90deg,#1a6aff,#38b6ff)', glow:'rgba(56,182,255,.5)', blob:'#38b6ff', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(56,182,255,.35),0 0 30px -4px rgba(56,182,255,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  emotionality:     { plName:'Emocjonalność', name:'Emotionality', color:'#ff9532', gradient:'linear-gradient(90deg,#a04000,#ff9532)', glow:'rgba(255,149,50,.5)', blob:'#ff9532', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(255,149,50,.35),0 0 30px -4px rgba(255,149,50,.25),0 16px 48px -6px rgba(0,0,0,.7)' },
  extraversion:     { plName:'Ekstrawersja', name:'Extraversion', color:'#b08fff', gradient:'linear-gradient(90deg,#4a28b0,#b08fff)', glow:'rgba(123,94,167,.6)', blob:'#7b5ea7', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(123,94,167,.4),0 0 30px -4px rgba(123,94,167,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
  agreeableness:    { plName:'Ugodowość', name:'Agreeableness', color:'#40e0d0', gradient:'linear-gradient(90deg,#006060,#40e0d0)', glow:'rgba(64,224,208,.5)', blob:'#40e0d0', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(64,224,208,.35),0 0 30px -4px rgba(64,224,208,.25),0 16px 48px -6px rgba(0,0,0,.7)' },
  conscientiousness:{ plName:'Sumienność', name:'Conscientiousness', color:'#00e5a0', gradient:'linear-gradient(90deg,#007a50,#00e5a0)', glow:'rgba(0,229,160,.5)', blob:'#00e5a0', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(0,229,160,.35),0 0 30px -4px rgba(0,229,160,.25),0 16px 48px -6px rgba(0,0,0,.7)' },
  openness:         { plName:'Otwartość', name:'Openness', color:'#e878e0', gradient:'linear-gradient(90deg,#7b1fa2,#e878e0)', glow:'rgba(200,80,192,.5)', blob:'#c850c0', hover:'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(200,80,192,.4),0 0 30px -4px rgba(200,80,192,.3),0 16px 48px -6px rgba(0,0,0,.7)' },
};

const DIM_ORDER = ['honesty_humility','emotionality','extraversion','agreeableness','conscientiousness','openness'];
const DIM_EMOJI = { honesty_humility:'⚖️', emotionality:'💜', extraversion:'💬', agreeableness:'🤝', conscientiousness:'📋', openness:'✨' };
const DIM_LABEL = { honesty_humility:'Honesty', emotionality:'Emocjonalność', extraversion:'Ekstrawersja', agreeableness:'Ugodowość', conscientiousness:'Sumienność', openness:'Otwartość' };

const CX = 210, CY = 210, MAX_R = 155;
function pt(i, pct) { const a = (i * 60 - 90) * Math.PI / 180; const r = (pct / 100) * MAX_R; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; }
function ringPts(pct) { return DIM_ORDER.map((_, i) => pt(i, pct).join(',')).join(' '); }

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.hr-root{font-family:'Space Grotesk',sans-serif;background:#0d0f2b;color:#fff;min-height:100vh;overflow-x:hidden;}
.hr-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 15% 20%,rgba(31,60,136,.14) 0%,transparent 65%),radial-gradient(ellipse 50% 50% at 85% 75%,rgba(31,60,136,.09) 0%,transparent 65%),radial-gradient(ellipse 40% 35% at 50% 50%,rgba(80,40,160,.07) 0%,transparent 65%);}
.hr-glass{background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6),0 2px 8px -2px rgba(0,0,0,.4);}
.hr-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(31,60,136,.22) 35%,rgba(31,60,136,.12) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.hr-stat-card{border-radius:16px;cursor:pointer;overflow:hidden;position:relative;isolation:isolate;transition:transform .28s cubic-bezier(.22,.68,0,1.15),box-shadow .28s ease;}
.hr-stat-card::after{content:'';position:absolute;width:120px;height:120px;border-radius:50%;filter:blur(45px);bottom:-40px;right:-30px;opacity:.18;pointer-events:none;z-index:-1;transition:opacity .3s,transform .3s;}
.hr-stat-card:hover::after{opacity:.35;transform:scale(1.2);}
.hr-glow-line{position:absolute;bottom:0;left:15%;right:15%;height:1px;border-radius:100px;opacity:0;transition:opacity .3s;}
.hr-stat-card:hover .hr-glow-line{opacity:1;}
.hr-pfill{height:100%;border-radius:100px;position:relative;}
.hr-pfill::after{content:'';position:absolute;right:-1px;top:50%;transform:translateY(-50%);width:9px;height:9px;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.6);}
.hr-tbar{height:100%;border-radius:100px;position:relative;}
.hr-tbar::after{content:'';position:absolute;right:-1px;top:50%;transform:translateY(-50%);width:8px;height:8px;border-radius:50%;background:inherit;box-shadow:0 0 8px currentColor;}
.hr-radar-shape{animation:radarIn 1s cubic-bezier(.22,.68,0,1.1) forwards;}
.hr-radar-dot{animation:radarIn 1s cubic-bezier(.22,.68,0,1.1) .2s both;}
@keyframes radarIn{from{opacity:0;}to{opacity:1;}}
@keyframes spinLoader{to{transform:rotate(360deg);}}
@keyframes shimmer{0%{background-position:-600px 0;}100%{background-position:600px 0;}}
.hr-shimmer{background:linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.05) 75%);background-size:600px 100%;animation:shimmer 1.8s ease-in-out infinite;}
`;

const G = { background:'rgba(16,20,56,.6)', backdropFilter:'blur(24px) saturate(180%)', WebkitBackdropFilter:'blur(24px) saturate(180%)', border:'1px solid rgba(255,255,255,.07)', boxShadow:'inset 0 1px 0 rgba(255,255,255,.1),0 8px 32px -4px rgba(0,0,0,.6)', borderRadius:20 };

const labelAnchors = [
  { id:'honesty_humility', lx:210, ly:33  },
  { id:'emotionality',     lx:376, ly:100 },
  { id:'extraversion',     lx:376, ly:320 },
  { id:'agreeableness',    lx:210, ly:390 },
  { id:'conscientiousness',lx:44,  ly:320 },
  { id:'openness',         lx:44,  ly:100 },
];

export default function HexacoResults() {
  const [results,        setResults]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [interpLoading,  setInterpLoading]  = useState(false);
  const [interpError,    setInterpError]    = useState(null);

  useEffect(() => { loadResults(); }, []);

  const loadResults = async () => {
    try {
      const { data: { user }, error: ue } = await supabase.auth.getUser();
      if (ue || !user) throw new Error('Nie jesteś zalogowany');

      // Load test results + cached interpretation in parallel
      const [{ data, error: fe }, { data: cached }] = await Promise.all([
        supabase.from('user_psychometrics').select('*')
          .eq('user_id', user.id).eq('test_type', 'HEXACO')
          .order('completed_at', { ascending: false }).limit(1),
        supabase.from('ai_interpretations').select('interpretation')
          .eq('user_id', user.id).eq('test_type', 'HEXACO')
          .eq('prompt_version', PROMPT_VERSION)
          .maybeSingle(),
      ]);

      if (fe) throw fe;
      if (!data?.length) { setError('Nie znaleziono wyników testu.'); setLoading(false); return; }
      setResults(data[0]);
      setLoading(false);

      if (cached?.interpretation) {
        setInterpretation(cached.interpretation);
      } else {
        generateInterpretation(data[0]);
      }
    } catch (err) { setError(err.message); setLoading(false); }
  };

  const generateInterpretation = async (r, { force = false } = {}) => {
    setInterpLoading(true); setInterpError(null);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error('Brak sesji');
      const { data: d, error: fnErr } = await supabase.functions.invoke('interpret-test', {
        body: { test_type: 'HEXACO', percentile_scores: r.percentile_scores, raw_scores: r.raw_scores, force },
        headers: { Authorization: `Bearer ${accessToken}`, apikey: SUPABASE_ANON_KEY },
      });
      if (fnErr) throw fnErr;
      setInterpretation(d?.interpretation ?? null);
    } catch (err) { setInterpError('Nie udało się wygenerować interpretacji.'); }
    finally { setInterpLoading(false); }
  };

  const regenerate = async () => {
    if (!results) return;
    setInterpretation(null);
    generateInterpretation(results, { force: true });
  };

  const handleRetake = () => {
    if (confirm('Czy na pewno chcesz wykonać test ponownie?')) window.location.href = '/test';
  };

  if (loading) return (
    <><style>{CSS}</style>
    <div className="hr-root" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:44,height:44,border:'3px solid rgba(31,60,136,.25)',borderTopColor:PAGE_ACCENT,borderRadius:'50%',animation:'spinLoader 1s linear infinite',margin:'0 auto 16px'}}/>
        <p style={{color:'rgba(255,255,255,.4)',fontSize:13}}>Ładowanie wyników...</p>
      </div>
    </div></>
  );

  if (error) return (
    <><style>{CSS}</style>
    <div className="hr-root" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:24,minHeight:'100vh'}}>
      <div className="hr-glass" style={{...G,padding:40,textAlign:'center',maxWidth:380}}>
        <div style={{fontSize:44,marginBottom:16}}>⚠️</div>
        <p style={{color:'rgba(255,255,255,.7)',marginBottom:24,lineHeight:1.6}}>{error}</p>
        <button onClick={()=>window.location.href='/user-profile-tests.html'} style={{background:`linear-gradient(135deg,${PAGE_ACCENT}cc,${PAGE_ACCENT})`,color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',fontSize:14}}>Wróć do Dashboardu</button>
      </div>
    </div></>
  );

  const sorted   = DIM_ORDER.map(id => ({ id, pct: Math.round(results.percentile_scores[id] ?? 0) })).sort((a,b) => b.pct - a.pct);
  const highest  = sorted[0];
  const lowest   = sorted[sorted.length - 1];
  const avg      = Math.round(sorted.reduce((s,d) => s + d.pct, 0) / sorted.length);
  const shapePts = DIM_ORDER.map((id,i) => pt(i, results.percentile_scores[id] ?? 0).join(',')).join(' ');

  return (
    <><style>{CSS}</style>
    <div className="hr-root">

      <ResultsScaffold
        accent={PAGE_ACCENT}
        navLabel="RDZEŃ OSOBOWOŚCI"
        badge="🧠 Rdzeń Osobowości (HEXACO)"
        title={<>Twoje wyniki <span style={{ color: PAGE_ACCENT, textShadow: `0 0 24px ${PAGE_ACCENT}66` }}>HEXACO-60</span></>}
        subtitle={<>HEXACO / Big Five · Pokazuje jak reagujesz, pracujesz i radzisz sobie z konfliktami</>}
        completedAt={results?.completed_at}
        retakeHref="/test"
      >

        <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:24,marginBottom:24}}>

          <div className="hr-glass" style={{...G,padding:36}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:28,display:'flex',alignItems:'center',gap:12}}>
              Mapa Osobowości <span style={{flex:1,height:1,background:`linear-gradient(90deg,${PAGE_ACCENT}66,transparent)`}}/>
            </div>
            <div style={{display:'flex',justifyContent:'center'}}>
              <svg viewBox="0 0 420 420" style={{width:'100%',maxWidth:420,height:'auto',overflow:'visible'}}>
                <defs>
                  <linearGradient id="iiy-hexaco-rg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38b6ff" stopOpacity=".35" />
                    <stop offset="100%" stopColor="#7b5ea7" stopOpacity=".25" />
                  </linearGradient>
                </defs>
                {[20,40,60,80,100].map(p => <polygon key={p} points={ringPts(p)} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1"/>)}
                {DIM_ORDER.map((_,i) => { const [ex,ey]=pt(i,100); return <line key={i} x1={CX} y1={CY} x2={ex} y2={ey} stroke="rgba(255,255,255,.1)" strokeWidth="1"/>; })}
                <polygon className="hr-radar-shape" points={shapePts} fill="url(#iiy-hexaco-rg)" stroke="#38b6ff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 12px rgba(56,182,255,.45))' }} />
                {DIM_ORDER.map((id,i) => { const [px,py]=pt(i,results.percentile_scores[id]??0); return <circle key={id} className="hr-radar-dot" cx={px} cy={py} r="4" fill="#38b6ff" style={{ filter: 'drop-shadow(0 0 6px #38b6ff)' }} />; })}
                {labelAnchors.map(({id,lx,ly}) => {
                  const txt=`${DIM_EMOJI[id]} ${DIM_LABEL[id]}`;
                  const w=Math.max(txt.length*7.2+16,82);
                  return <g key={id}><rect x={lx-w/2} y={ly-12} width={w} height={23} rx="11" fill="rgba(13,15,43,.85)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/><text x={lx} y={ly+4} textAnchor="middle" style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:11,fontWeight:600,fill:'rgba(255,255,255,.75)'}}>{txt}</text></g>;
                })}
              </svg>
            </div>
          </div>

          <div className="hr-glass" style={{...G,padding:'28px 24px',display:'flex',flexDirection:'column',gap:18}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)'}}>Profil</div>
            <div style={{background:'rgba(56,182,255,.06)',border:'1px solid rgba(56,182,255,.18)',borderRadius:14,padding:18}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:'2.5px',textTransform:'uppercase',color:'#38b6ff',marginBottom:6}}>Dominująca cecha</div>
              <div style={{fontSize:21,fontWeight:800,letterSpacing:'-.3px',marginBottom:3}}>{ACCENT[highest.id]?.plName}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.4)'}}>{ACCENT[highest.id]?.name}</div>
              <div style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:10,fontSize:11,fontWeight:600,color:'#b08fff',background:'rgba(123,94,167,.12)',border:'1px solid rgba(123,94,167,.25)',padding:'4px 10px',borderRadius:100}}>💎 Wynik: {highest.pct}% · Śr: {avg}%</div>
            </div>
            <div style={{height:1,background:'rgba(255,255,255,.07)'}}/>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)'}}>Dominujące cechy</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {sorted.slice(0,5).map(({id,pct}) => {
                const ac=ACCENT[id];
                return <div key={id} style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,.6)',width:108,flexShrink:0}}>{ac.plName}</span>
                  <div style={{flex:1,height:4,background:'rgba(255,255,255,.07)',borderRadius:100,overflow:'visible',position:'relative'}}>
                    <div className="hr-tbar" style={{width:`${pct}%`,height:'100%',background:ac.gradient,boxShadow:`0 0 8px ${ac.glow}`,borderRadius:100}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,minWidth:32,textAlign:'right',color:ac.color}}>{pct}%</span>
                </div>;
              })}
            </div>
            <div style={{height:1,background:'rgba(255,255,255,.07)'}}/>
            <div style={{background:'rgba(123,94,167,.08)',border:'1px solid rgba(123,94,167,.2)',borderRadius:12,padding:16,fontSize:13,lineHeight:1.65,color:'rgba(255,255,255,.52)'}}>
              <strong style={{color:'rgba(255,255,255,.85)',fontWeight:600}}>Twój dominujący wymiar to {ACCENT[highest.id]?.plName}</strong>, a największy potencjał wzrostu leży w obszarze <strong style={{color:'rgba(255,255,255,.85)',fontWeight:600}}>{ACCENT[lowest.id]?.plName}</strong>.
            </div>
          </div>
        </div>

        <div style={{marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
            <span style={{fontSize:11,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,.3)'}}>Szczegółowe wyniki</span>
              <span style={{flex:1,height:1,background:`linear-gradient(90deg,${PAGE_ACCENT}66,transparent)`}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {DIM_ORDER.map(id => {
              const ac=ACCENT[id];
              const pct=Math.round(results.percentile_scores[id]??0);
              const dim=HEXACO_TEST.dimensions.find(d=>d.id===id);
              return <div key={id} className="hr-glass hr-stat-card" style={{...G,padding:'22px 22px 20px'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px) scale(1.01)';e.currentTarget.style.boxShadow=ac.hover;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=G.boxShadow;}}>
                <div style={{position:'absolute',width:120,height:120,borderRadius:'50%',filter:'blur(45px)',bottom:-40,right:-30,background:ac.blob,opacity:.18,pointerEvents:'none'}}/>
                <div className="hr-glow-line" style={{background:ac.color,boxShadow:`0 0 10px 2px ${ac.glow}`}}/>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:4}}>{ac.plName}</div>
                    <div style={{fontSize:16,fontWeight:700,color:'#fff',letterSpacing:'-.2px'}}>{ac.name}</div>
                  </div>
                  <div style={{fontSize:22,fontWeight:800,color:ac.color,lineHeight:1,letterSpacing:'-.5px'}}>{pct}%</div>
                </div>
                <div style={{height:4,borderRadius:100,background:'rgba(255,255,255,.07)',marginBottom:12,overflow:'visible',position:'relative'}}>
                  <div className="hr-pfill" style={{width:`${pct}%`,background:ac.gradient,boxShadow:`0 0 10px ${ac.glow}`}}/>
                </div>
                <div style={{fontSize:12,color:'rgba(255,255,255,.35)',lineHeight:1.55}}>{(dim?.description??'').substring(0,85)}</div>
              </div>;
            })}
          </div>
        </div>

        <div className="hr-glass" style={{...G,padding:36,marginBottom:32,overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:400,height:180,background:'rgba(123,94,167,.07)',borderRadius:'50%',filter:'blur(60px)',pointerEvents:'none'}}/>
          <div style={{position:'relative'}}>
            <AiInterpretation
              interpretation={interpretation}
              loading={interpLoading}
              error={interpError}
              onRegenerate={regenerate}
              onRetry={() => generateInterpretation(results)}
              accentColor={PAGE_ACCENT}
              accentGlow="rgba(31,60,136,.5)"
              testLabel="Twojego profilu HEXACO"
            />
          </div>
        </div>

        <ResultsFooterActions retakeHref="/test" />

      </ResultsScaffold>
    </div></>
  );
}
