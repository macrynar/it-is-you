import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, ResponsiveContainer
} from 'recharts';
import { supabase } from '../../lib/supabaseClient.js';
import { CAREER_TEST } from '../../data/tests/career.js';
import { generateCareerReport } from '../../utils/scoring.js';
import AiInterpretation from './AiInterpretation.jsx';

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

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.cr-root{font-family:'Space Grotesk',sans-serif;background:#0d0f2b;color:#fff;min-height:100vh;overflow-x:hidden;}
.cr-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 15% 20%,rgba(14,165,233,.08) 0%,transparent 65%),radial-gradient(ellipse 50% 50% at 85% 75%,rgba(217,70,239,.1) 0%,transparent 65%),radial-gradient(ellipse 40% 35% at 50% 50%,rgba(80,40,160,.07) 0%,transparent 65%);}
.cr-glass{background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6);}
.cr-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(14,165,233,.15) 35%,rgba(217,70,239,.12) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.cr-interest-card{border-radius:20px;position:relative;isolation:isolate;overflow:hidden;background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);transition:transform .28s cubic-bezier(.22,.68,0,1.15),box-shadow .28s ease;cursor:default;}
.cr-interest-card:hover{transform:translateY(-6px);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 0 0 1px rgba(255,255,255,.1),0 0 40px -8px var(--type-color,#0ea5e9),0 20px 48px -8px rgba(0,0,0,.7);}
.cr-interest-card::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.06) 50%,rgba(255,255,255,.02) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.cr-interest-card::after{content:'';position:absolute;width:140px;height:140px;border-radius:50%;filter:blur(50px);bottom:-50px;right:-40px;opacity:.14;pointer-events:none;z-index:0;transition:opacity .35s,transform .35s;background:var(--type-color,#0ea5e9);}
.cr-interest-card:hover::after{opacity:.38;transform:scale(1.25);}
.cr-glow-line{position:absolute;bottom:0;left:12%;right:12%;height:1px;border-radius:100px;opacity:0;transition:opacity .3s;}
.cr-interest-card:hover .cr-glow-line{opacity:1;}
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

  const generateInterpretation = async (scores, reportData) => {
    try {
      setInterpLoading(true);
      setInterpError(null);
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('interpret-test', {
        body: { test_type: 'CAREER', raw_scores: scores, report: reportData },
        headers: { Authorization: `Bearer ${session.access_token}` },
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
    await generateInterpretation(rawScores, report);
  };

  const handleRetakeTest = () => {
    if (confirm('Czy na pewno chcesz wykonać test ponownie?')) {
      window.location.href = '/test?type=career';
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#0d0f2b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
        <style>{`@keyframes spinLoader{to{transform:rotate(360deg);}}`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid rgba(14,165,233,.3)', borderTop: '3px solid #0ea5e9', borderRadius: '50%', animation: 'spinLoader 1s linear infinite', margin: '0 auto 16px' }} />
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
            style={{ background: 'linear-gradient(135deg,#0c4a6e,#0ea5e9)', border: 'none', borderRadius: 12, padding: '12px 28px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}>
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

      {/* ─── Navigation ─── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(13,15,43,.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => window.location.href = '/user-profile-tests.html'}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', font: '500 .9rem "Space Grotesk",sans-serif', transition: 'color .2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.7)'}>
            <ArrowLeft size={18} /> Dashboard
          </button>
          <span style={{ fontSize: '.78rem', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)' }}>
            PROFIL ZAWODOWY
          </span>
          <button
            onClick={handleRetakeTest}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '8px 16px', color: 'rgba(255,255,255,.7)', cursor: 'pointer', font: '500 .85rem "Space Grotesk",sans-serif', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.7)'; }}>
            <RefreshCw size={15} /> Powtórz Test
          </button>
        </div>
      </nav>

      {/* ─── Main content ─── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* ─── Hero — Holland Code ─── */}
        <div className="cr-glass cr-fadein" style={{ padding: '44px 32px', textAlign: 'center', marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: domR.glow, filter: 'blur(80px)', opacity: .22, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(192,132,252,.25)', filter: 'blur(70px)', opacity: .18, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '2.8rem', marginBottom: 10 }}>💼</div>
            <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 800, margin: '0 0 6px', background: `linear-gradient(135deg,${domR.color},#c084fc,#60a5fa)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Twój Profil Zawodowy
            </h1>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem', marginBottom: 28 }}>
              Test Zainteresowań Zawodowych (RIASEC) ·{' '}
              {new Date(report.completed_at).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: '.68rem', fontWeight: 600, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 8 }}>
                Twój Kod Hollanda
              </div>
              <div style={{ fontSize: 'clamp(3.5rem,14vw,6rem)', fontWeight: 900, letterSpacing: '0.14em', background: `linear-gradient(135deg,${domR.color},#c084fc)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>
                {report.holland_code}
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.88rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>
              {report.summary?.holland_code_explanation}
            </p>
          </div>
        </div>

        {/* ─── Radar Chart ─── */}
        <div className="cr-glass cr-fadein" style={{ padding: '28px 24px', marginBottom: 24, animationDelay: '.1s' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.85)' }}>
            <span>📊</span> Profil Zainteresowań (Wykres Radarowy)
          </h2>
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart data={report.chart_data}>
              <PolarGrid stroke="rgba(255,255,255,.08)" strokeWidth={1} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'rgba(255,255,255,.7)', fontSize: 13, fontFamily: "'Space Grotesk', sans-serif" }}
                tickLine={{ stroke: 'rgba(255,255,255,.15)' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fill: 'rgba(255,255,255,.3)', fontSize: 11 }}
                tickCount={6}
              />
              <Radar
                name="Poziom zainteresowania"
                dataKey="A"
                stroke={domR.color}
                fill={domR.color}
                fillOpacity={0.18}
                strokeWidth={2}
                dot={{ r: 4, fill: domR.color, strokeWidth: 0 }}
              />
              <Legend
                wrapperStyle={{ color: 'rgba(255,255,255,.45)', fontSize: '.78rem', fontFamily: "'Space Grotesk', sans-serif" }}
                iconType="circle"
              />
            </RadarChart>
          </ResponsiveContainer>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.28)', fontSize: '.72rem', marginTop: 4 }}>
            Skala: 1 (Nie lubię) → 5 (Bardzo lubię)
          </p>
        </div>

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
        <AiInterpretation
          interpretation={interpretation}
          loading={interpLoading}
          error={interpError}
          onRegenerate={handleRegenerate}
          onRetry={() => generateInterpretation(rawScores, report)}
          accentColor={domR.color}
          accentGlow={domR.glow}
          testLabel="PROFIL ZAWODOWY"
        />

      </div>
    </div>
  );
}
