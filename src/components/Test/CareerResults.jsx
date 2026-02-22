import React, { useState, useEffect } from 'react';
import { SUPABASE_ANON_KEY, supabase } from '../../lib/supabaseClient.js';
import { CAREER_TEST } from '../../data/tests/career.js';
import { generateCareerReport } from '../../utils/scoring.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';

const PAGE_ACCENT = '#009688';

/**
 * Career Interests (RIASEC) Results — Neural Glass redesign
 */

const RIASEC = {
  realistic:     { color: '#ef4444', glow: 'rgba(239,68,68,.5)',   bar: 'linear-gradient(90deg,#7f1d1d,#ef4444)',  badge: 'linear-gradient(135deg,#7f1d1d,#ef4444)',  shadow: '0 0 0 1px rgba(239,68,68,.35),0 0 30px -4px rgba(239,68,68,.3)' },
  investigative: { color: '#0ea5e9', glow: 'rgba(14,165,233,.5)',  bar: 'linear-gradient(90deg,#0c4a6e,#0ea5e9)', badge: 'linear-gradient(135deg,#0c4a6e,#0ea5e9)', shadow: '0 0 0 1px rgba(14,165,233,.35),0 0 30px -4px rgba(14,165,233,.3)' },
  artistic:      { color: '#d946ef', glow: 'rgba(217,70,239,.5)',  bar: 'linear-gradient(90deg,#701a75,#d946ef)', badge: 'linear-gradient(135deg,#701a75,#d946ef)', shadow: '0 0 0 1px rgba(217,70,239,.35),0 0 30px -4px rgba(217,70,239,.3)' },
  social:        { color: '#10b981', glow: 'rgba(16,185,129,.5)',  bar: 'linear-gradient(90deg,#064e3b,#10b981)', badge: 'linear-gradient(135deg,#064e3b,#10b981)', shadow: '0 0 0 1px rgba(16,185,129,.35),0 0 30px -4px rgba(16,185,129,.3)' },
  enterprising:  { color: '#f59e0b', glow: 'rgba(245,158,11,.5)',  bar: 'linear-gradient(90deg,#78350f,#f59e0b)', badge: 'linear-gradient(135deg,#78350f,#f59e0b)', shadow: '0 0 0 1px rgba(245,158,11,.35),0 0 30px -4px rgba(245,158,11,.25)' },
  conventional:  { color: '#94a3b8', glow: 'rgba(148,163,184,.4)', bar: 'linear-gradient(90deg,#1e293b,#94a3b8)', badge: 'linear-gradient(135deg,#1e293b,#94a3b8)', shadow: '0 0 0 1px rgba(148,163,184,.3),0 0 30px -4px rgba(148,163,184,.2)' },
};

const getR = id => RIASEC[id] || RIASEC.conventional;

// ── Custom SVG Radar (hexagon, same style as HEXACO) ─────────────────
const RIASEC_ORDER = ['realistic','investigative','artistic','social','enterprising','conventional'];
const RIASEC_EMOJI = { realistic:'🔧', investigative:'🔬', artistic:'🎨', social:'🤝', enterprising:'📢', conventional:'📋' };
const RIASEC_PL    = { realistic:'Praktyczny', investigative:'Badawczy', artistic:'Twórczy', social:'Społeczny', enterprising:'Przedsiębiorczy', conventional:'Konwencjonalny' };

const R_CX = 210, R_CY = 210, R_MAX = 155;
function radarPt(i, pct) {
  const a = (i * 60 - 90) * Math.PI / 180;
  const r = (pct / 100) * R_MAX;
  return [R_CX + r * Math.cos(a), R_CY + r * Math.sin(a)];
}
function radarRing(pct) { return RIASEC_ORDER.map((_, i) => radarPt(i, pct).join(',')).join(' '); }

const radarLabelAnchors = [
  { id: 'realistic',     lx: 210, ly: 33  },
  { id: 'investigative', lx: 380, ly: 100 },
  { id: 'artistic',      lx: 380, ly: 320 },
  { id: 'social',        lx: 210, ly: 390 },
  { id: 'enterprising',  lx: 44,  ly: 320 },
  { id: 'conventional',  lx: 44,  ly: 100 },
];

const EMERALD = PAGE_ACCENT;
const EMERALD_GLOW = 'rgba(0,150,136,.5)';
const EMERALD_DIM  = 'rgba(0,150,136,.12)';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.cr-root{font-family:'Space Grotesk',sans-serif;background:#0d0f2b;color:#fff;min-height:100vh;overflow-x:hidden;}
.cr-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 15% 20%,rgba(0,150,136,.09) 0%,transparent 65%),radial-gradient(ellipse 50% 50% at 85% 75%,rgba(0,150,136,.06) 0%,transparent 65%),radial-gradient(ellipse 40% 35% at 50% 50%,rgba(80,40,160,.07) 0%,transparent 65%);}
.cr-glass{background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6);}
.cr-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(0,150,136,.18) 35%,rgba(0,150,136,.08) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.cr-interest-card{border-radius:20px;position:relative;isolation:isolate;overflow:hidden;background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);transition:transform .28s cubic-bezier(.22,.68,0,1.15),box-shadow .28s ease;cursor:default;}
.cr-interest-card:hover{transform:translateY(-6px);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 0 0 1px rgba(255,255,255,.1),0 0 40px -8px var(--type-color,#0ea5e9),0 20px 48px -8px rgba(0,0,0,.7);}
.cr-interest-card::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.06) 50%,rgba(255,255,255,.02) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.cr-interest-card::after{content:'';position:absolute;width:140px;height:140px;border-radius:50%;filter:blur(50px);bottom:-50px;right:-40px;opacity:.14;pointer-events:none;z-index:0;transition:opacity .35s,transform .35s;background:var(--type-color,#0ea5e9);}
.cr-interest-card:hover::after{opacity:.38;transform:scale(1.25);}
.cr-glow-line{position:absolute;bottom:0;left:12%;right:12%;height:1px;border-radius:100px;opacity:0;transition:opacity .3s;}
.cr-interest-card:hover .cr-glow-line{opacity:1;}
.cr-two-col{display:grid;grid-template-columns:1fr 340px;gap:20px;margin-bottom:24px;}
@media(max-width:860px){.cr-two-col{grid-template-columns:1fr;}}
.cr-interest-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:28px;}
@media(max-width:640px){.cr-interest-grid{grid-template-columns:1fr;}}
.cr-score-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
@media(max-width:500px){.cr-score-grid{grid-template-columns:repeat(2,1fr);}}
.cr-bar-track{height:6px;background:rgba(255,255,255,.07);border-radius:100px;overflow:hidden;}
.cr-bar-fill{height:100%;border-radius:100px;position:relative;transition:width 1s cubic-bezier(.22,.68,0,1.1);}
.cr-bar-fill::after{content:'';position:absolute;right:-1px;top:50%;transform:translateY(-50%);width:9px;height:9px;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.6);}
.cr-letter-badge{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;flex-shrink:0;}
.cr-tag{padding:3px 10px;border-radius:100px;font-size:.7rem;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.6);}
.cr-score-mini{border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);padding:16px;transition:border-color .2s;}
.cr-score-mini:hover{border-color:rgba(255,255,255,.14);}
@keyframes spinLoader{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
.cr-fadein{animation:fadeUp .6s cubic-bezier(.22,.68,0,1.1) both;}
.cr-radar-shape{animation:radarIn 1s cubic-bezier(.22,.68,0,1.1) forwards;}
.cr-radar-dot{animation:radarIn 1s cubic-bezier(.22,.68,0,1.1) .2s both;}
@keyframes radarIn{from{opacity:0;}to{opacity:1;}}
`;

export default function CareerResults() {
  const [report,         setReport]         = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [rawScores,      setRawScores]      = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [interpLoading,  setInterpLoading]  = useState(false);
  const [interpError,    setInterpError]    = useState(null);

  useEffect(() => { loadResults(); }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: ue } = await supabase.auth.getUser();
      if (ue || !user) throw new Error('Nie jesteś zalogowany');

      const [{ data, error: fe }, { data: cached }] = await Promise.all([
        supabase.from('user_psychometrics').select('*')
          .eq('user_id', user.id).eq('test_type', 'CAREER')
          .order('completed_at', { ascending: false }).limit(1),
        supabase.from('ai_interpretations').select('interpretation')
          .eq('user_id', user.id).eq('test_type', 'CAREER')
          .eq('prompt_version', PROMPT_VERSION)
          .maybeSingle(),
      ]);

      if (fe) throw fe;
      if (!data?.length) {
        setError('Nie znaleziono wyników testu. Wykonaj test najpierw.');
        setLoading(false);
        return;
      }

      const testResult = data[0];
      const scoresData = testResult.raw_scores || {};
      const fullReport = generateCareerReport(scoresData);
      const reportWithDate = { ...fullReport, completed_at: testResult.completed_at };

      setReport(reportWithDate);
      setRawScores(scoresData);

      if (cached?.interpretation) {
        setInterpretation(cached.interpretation);
      } else {
        generateInterpretation(scoresData, reportWithDate);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading results:', err);
      setError(err.message || 'Błąd podczas ładowania wyników');
      setLoading(false);
    }
  };

  const generateInterpretation = async (scores, reportData, { force = false } = {}) => {
    try {
      setInterpLoading(true);
      setInterpError(null);
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('interpret-test', {
        body: { test_type: 'CAREER', raw_scores: scores, report: reportData, force },
        headers: { Authorization: `Bearer ${session.access_token}`, apikey: SUPABASE_ANON_KEY },
      });
      if (error) throw error;
      setInterpretation(data.interpretation);
    } catch (err) {
      console.error('Interpretation error:', err);
      setInterpError(err.message || 'Błąd generowania interpretacji');
    } finally {
      setInterpLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setInterpretation(null);
    await generateInterpretation(rawScores, report, { force: true });
  };

  if (loading) {
    return (
      <div style={{ background: '#0d0f2b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
        <style>{`@keyframes spinLoader{to{transform:rotate(360deg);}}`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid rgba(0,150,136,.24)', borderTop: `3px solid ${PAGE_ACCENT}`, borderRadius: '50%', animation: 'spinLoader 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.95rem' }}>Ładowanie wyników...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#0d0f2b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Błąd</h2>
          <p style={{ color: 'rgba(255,255,255,.5)', marginBottom: 24 }}>{error}</p>
          <button
            onClick={() => window.location.href = '/user-profile-tests.html'}
            style={{ background: `linear-gradient(135deg,${PAGE_ACCENT}cc,${PAGE_ACCENT})`, border: 'none', borderRadius: 12, padding: '12px 28px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}>
            Wróć do Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const domType = report.top_3?.[0];
  const domR = domType ? getR(domType.id) : RIASEC.investigative;

  return (
    <div className="cr-root">
      <style>{CSS}</style>

      <ResultsScaffold
        accent={PAGE_ACCENT}
        navLabel="PROFIL ZAWODOWY"
        badge="💼 Profil Zawodowy (RIASEC)"
        title={<>Twój Profil <span style={{ color: PAGE_ACCENT, textShadow: `0 0 24px ${PAGE_ACCENT}66` }}>Zawodowy</span></>}
        subtitle={<>Test Zainteresowań Zawodowych (RIASEC)</>}
        completedAt={report?.completed_at}
        retakeHref="/test?type=career"
        confirmMessage="Czy na pewno chcesz wykonać test ponownie?"
      >

        {/* ─── Holland Code — expanded card ─── */}
        <div className="cr-glass cr-fadein" style={{ padding: '32px 36px', marginBottom: 24, animationDelay: '.05s', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: EMERALD_GLOW, filter: 'blur(80px)', opacity: .18, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(192,132,252,.25)', filter: 'blur(70px)', opacity: .15, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 22, textAlign: 'center' }}>
              Twój Kod Hollanda
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
              {report.top_3?.map((interest, idx) => {
                const r = getR(interest.id);
                return (
                  <div key={interest.id} style={{ flex: '1 1 180px', maxWidth: 240, background: `${r.color}10`, border: `1px solid ${r.color}35`, borderRadius: 18, padding: '22px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', bottom: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: r.color, filter: 'blur(40px)', opacity: .12, pointerEvents: 'none' }} />
                    <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{RIASEC_EMOJI[interest.id]}</div>
                    <div style={{ fontSize: 'clamp(2.2rem,6vw,3.2rem)', fontWeight: 900, letterSpacing: '.05em', color: r.color, lineHeight: 1, marginBottom: 8, textShadow: `0 0 20px ${r.color}60` }}>
                      {interest.letter}
                    </div>
                    <div style={{ fontSize: '.95rem', fontWeight: 700, color: '#fff', marginBottom: 3 }}>{interest.name}</div>
                    <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.4)', marginBottom: 6 }}>{interest.name_en}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: r.color, background: `${r.color}18`, border: `1px solid ${r.color}30`, padding: '3px 10px', borderRadius: 100 }}>
                      #{idx + 1} · {interest.score.toFixed(1)} / 5.0
                    </div>
                  </div>
                );
              })}
            </div>
            {report.summary?.holland_code_explanation && (
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.87rem', lineHeight: 1.8, textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
                {report.summary.holland_code_explanation}
              </p>
            )}
          </div>
        </div>

        {/* ─── Two-column: Radar + Sidebar ─── */}
        {(() => {
          const pctOf = id => Math.round(((rawScores?.all_scores?.[id]?.raw_score ?? 1) - 1) / 4 * 100);
          const shapePts = RIASEC_ORDER.map((id, i) => radarPt(i, pctOf(id)).join(',')).join(' ');
          const sortedAll = RIASEC_ORDER
            .map(id => ({ id, score: rawScores?.all_scores?.[id]?.raw_score ?? 1 }))
            .sort((a, b) => b.score - a.score);
          return (
            <div className="cr-fadein cr-two-col" style={{ animationDelay: '.1s' }}>
              {/* Radar */}
              <div className="cr-glass" style={{ padding: '28px 24px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                  Mapa Zainteresowań
                  <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${EMERALD_DIM},transparent)` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <svg viewBox="0 0 420 420" style={{ width: '100%', maxWidth: 420, height: 'auto', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="crg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={domR.color} stopOpacity=".35" />
                        <stop offset="100%" stopColor="#c084fc" stopOpacity=".2" />
                      </linearGradient>
                    </defs>
                    {[20, 40, 60, 80, 100].map(p => (
                      <polygon key={p} points={radarRing(p)} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1" />
                    ))}
                    {RIASEC_ORDER.map((_, i) => {
                      const [ex, ey] = radarPt(i, 100);
                      return <line key={i} x1={R_CX} y1={R_CY} x2={ex} y2={ey} stroke="rgba(255,255,255,.1)" strokeWidth="1" />;
                    })}
                    <polygon className="cr-radar-shape" points={shapePts} fill="url(#crg)" stroke={domR.color} strokeWidth="2" style={{ filter: `drop-shadow(0 0 12px ${domR.glow})` }} />
                    {RIASEC_ORDER.map((id, i) => {
                      const [px, py] = radarPt(i, pctOf(id));
                      const col = RIASEC[id]?.color ?? '#38b6ff';
                      return <circle key={id} className="cr-radar-dot" cx={px} cy={py} r="5" fill={col} style={{ filter: `drop-shadow(0 0 7px ${col})` }} />;
                    })}
                    {radarLabelAnchors.map(({ id, lx, ly }) => {
                      const txt = `${RIASEC_EMOJI[id]} ${RIASEC_PL[id]}`;
                      const w = Math.max(txt.length * 6.8 + 16, 82);
                      return (
                        <g key={id}>
                          <rect x={lx - w / 2} y={ly - 12} width={w} height={23} rx="11" fill="rgba(13,15,43,.85)" stroke="rgba(255,255,255,.12)" strokeWidth="1" />
                          <text x={lx} y={ly + 4} textAnchor="middle" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 600, fill: 'rgba(255,255,255,.75)' }}>{txt}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.22)', fontSize: '.7rem', marginTop: 6 }}>Skala: 1 (Nie lubię) → 5 (Bardzo lubię)</p>
              </div>

              {/* Sidebar — quick stats */}
              <div className="cr-glass" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>Profil</div>
                {/* Dominant type highlight */}
                <div style={{ background: `${domR.color}10`, border: `1px solid ${domR.color}30`, borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: domR.color, marginBottom: 6 }}>Dominujący typ</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${domR.color}40,${domR.color}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                      {RIASEC_EMOJI[domType?.id]}
                    </div>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>{domType?.name}</div>
                      <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.4)' }}>{domType?.name_en}</div>
                    </div>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: domR.color, background: `${domR.color}18`, border: `1px solid ${domR.color}30`, padding: '4px 10px', borderRadius: 100 }}>
                    ⭐ Wynik: {domType?.score.toFixed(1)} / 5.0
                  </div>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,.07)' }} />
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>Wszystkie wymiary</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {sortedAll.map(({ id, score }) => {
                    const r = getR(id);
                    const data = rawScores?.all_scores?.[id];
                    return (
                      <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.55)', width: 100, flexShrink: 0 }}>{data?.name ?? RIASEC_PL[id]}</span>
                        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.07)', borderRadius: 100, overflow: 'visible', position: 'relative' }}>
                          <div style={{ width: `${(score / 5) * 100}%`, height: '100%', background: r.bar, boxShadow: `0 0 8px ${r.glow}`, borderRadius: 100 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, minWidth: 28, textAlign: 'right', color: r.color }}>{score.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,.07)' }} />
                <div style={{ background: 'rgba(0,150,136,.06)', border: '1px solid rgba(0,150,136,.18)', borderRadius: 12, padding: 14, fontSize: 12, lineHeight: 1.65, color: 'rgba(255,255,255,.5)' }}>
                  <strong style={{ color: 'rgba(255,255,255,.85)', fontWeight: 600 }}>Kod Hollanda: {report.holland_code}</strong>
                  {' — trzy litery reprezentują Twoje najsilniejsze typy zainteresowań w kolejności dominacji.'}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ─── Top 3 Interests ─── */}
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.75)' }}>
          <span>🎯</span> Twoje 3 Główne Zainteresowania
        </h2>

        <div className="cr-interest-grid">
          {report.top_3?.map((interest, index) => {
            const r = getR(interest.id);
            return (
              <div
                key={interest.id}
                className="cr-interest-card cr-fadein"
                style={{ '--type-color': r.color, animationDelay: `${.15 + index * .08}s`, padding: 22 }}
              >
                <div className="cr-glow-line" style={{ background: `linear-gradient(90deg,transparent,${r.color},transparent)` }} />
                <div style={{ position: 'relative', zIndex: 1 }}>

                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="cr-letter-badge" style={{ width: 48, height: 48, fontSize: '1.3rem', background: r.badge }}>
                        {interest.letter}
                      </div>
                      <div>
                        <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 2 }}>
                          #{interest.rank}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.25 }}>{interest.name}</div>
                        <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{interest.name_en}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: r.color, lineHeight: 1 }}>{interest.score.toFixed(1)}</div>
                      <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.3)' }}>/ 5.0</div>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="cr-bar-track" style={{ marginBottom: 14 }}>
                    <div className="cr-bar-fill" style={{ width: `${(interest.score / 5) * 100}%`, background: r.bar }} />
                  </div>

                  {/* Overview */}
                  {interest.interpretation?.overview && (
                    <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.58)', lineHeight: 1.72, marginBottom: 12 }}>
                      {interest.interpretation.overview}
                    </p>
                  )}

                  {/* Characteristics as tags */}
                  {interest.interpretation?.characteristics?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 6 }}>Cechy</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {interest.interpretation.characteristics.slice(0, 4).map((c, i) => (
                          <span key={i} className="cr-tag">{c.length > 38 ? c.slice(0, 36) + '…' : c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Career paths */}
                  {interest.interpretation?.career_paths?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 6 }}>Ścieżki kariery</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {interest.interpretation.career_paths.slice(0, 5).map((p, i) => (
                          <span key={i} style={{ padding: '3px 10px', borderRadius: 100, fontSize: '.7rem', background: `${r.color}18`, border: `1px solid ${r.color}35`, color: r.color }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* ─── All Scores ─── */}
        <div className="cr-glass cr-fadein" style={{ padding: '28px', marginBottom: 28, animationDelay: '.32s' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.85)' }}>
            <span>📋</span> Wszystkie Wyniki RIASEC
          </h2>
          <div className="cr-score-grid">
            {Object.entries(report.all_scores)
              .sort((a, b) => b[1].raw_score - a[1].raw_score)
              .map(([id, data]) => {
                const r = getR(id);
                return (
                  <div key={id} className="cr-score-mini">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div className="cr-letter-badge" style={{ width: 36, height: 36, fontSize: '.95rem', background: r.badge }}>
                        {data.letter}
                      </div>
                      <div>
                        <div style={{ fontSize: '.77rem', fontWeight: 600, lineHeight: 1.3 }}>{data.name}</div>
                        <div style={{ fontSize: '.63rem', color: 'rgba(255,255,255,.33)' }}>{data.name_en}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: r.color }}>{data.raw_score.toFixed(1)}</span>
                      <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.28)' }}>/ 5.0</span>
                    </div>
                    <div className="cr-bar-track">
                      <div className="cr-bar-fill" style={{ width: `${(data.raw_score / 5) * 100}%`, background: r.bar }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* ─── Footer note ─── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.22)', lineHeight: 1.9 }}>
            Test oparty na modelu RIASEC Johna Hollanda ·{' '}
            Model RIASEC (Realistic, Investigative, Artistic, Social, Enterprising, Conventional){' '}
            to jedno z najbardziej uznanych narzędzi diagnostycznych w obszarze preferencji zawodowych.
          </p>
        </div>

        {/* ─── AI Interpretation ─── */}
        <div className="cr-glass cr-fadein" style={{ padding: 36, marginBottom: 24 }}>
          <AiInterpretation
            interpretation={interpretation}
            loading={interpLoading}
            error={interpError}
            onRegenerate={handleRegenerate}
            onRetry={() => generateInterpretation(rawScores, report)}
            accentColor={PAGE_ACCENT}
            accentGlow="rgba(0,150,136,.45)"
            testLabel="PROFIL ZAWODOWY"
          />
        </div>

        <ResultsFooterActions retakeHref="/test?type=career" />

      </ResultsScaffold>
    </div>
  );
}
