import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Cell, ResponsiveContainer
} from 'recharts';
import { supabase } from '../../lib/supabaseClient.js';
import { generateValuesReport } from '../../utils/scoring.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';

const PAGE_ACCENT = '#00B8D4';

/**
 * Personal Values (Schwartz PVQ) Results — Neural Glass redesign
 */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.vr-root{font-family:'Space Grotesk',sans-serif;background:#0d0f2b;color:#fff;min-height:100vh;overflow-x:hidden;}
.vr-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 15% 20%,rgba(20,184,166,.09) 0%,transparent 65%),radial-gradient(ellipse 50% 50% at 85% 75%,rgba(59,130,246,.1) 0%,transparent 65%),radial-gradient(ellipse 40% 35% at 50% 50%,rgba(80,40,160,.07) 0%,transparent 65%);}
.vr-glass{background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6);}
.vr-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(20,184,166,.15) 35%,rgba(59,130,246,.12) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.vr-val-card{border-radius:20px;position:relative;isolation:isolate;overflow:hidden;background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);transition:transform .28s cubic-bezier(.22,.68,0,1.15),box-shadow .28s ease;cursor:default;}
.vr-val-card:hover{transform:translateY(-6px);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 0 0 1px rgba(255,255,255,.1),0 0 40px -8px var(--val-color,#14b8a6),0 20px 48px -8px rgba(0,0,0,.7);}
.vr-val-card::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.06) 50%,rgba(255,255,255,.02) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.vr-val-card::after{content:'';position:absolute;width:140px;height:140px;border-radius:50%;filter:blur(50px);bottom:-50px;right:-40px;opacity:.14;pointer-events:none;z-index:0;transition:opacity .35s,transform .35s;background:var(--val-color,#14b8a6);}
.vr-val-card:hover::after{opacity:.38;transform:scale(1.25);}
.vr-glow-line{position:absolute;bottom:0;left:12%;right:12%;height:1px;border-radius:100px;opacity:0;transition:opacity .3s;}
.vr-val-card:hover .vr-glow-line{opacity:1;}
.vr-top3-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:28px;}
@media(max-width:640px){.vr-top3-grid{grid-template-columns:1fr;}}
.vr-bar-track{height:6px;background:rgba(255,255,255,.07);border-radius:100px;overflow:hidden;margin-top:10px;}
.vr-bar-fill{height:100%;border-radius:100px;position:relative;transition:width 1s cubic-bezier(.22,.68,0,1.1);}
.vr-bar-fill::after{content:'';position:absolute;right:-1px;top:50%;transform:translateY(-50%);width:9px;height:9px;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.6);}
.vr-rank-badge{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;flex-shrink:0;}
.vr-tag{padding:3px 10px;border-radius:100px;font-size:.7rem;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.6);}
.vr-all-row{padding:14px 0;border-bottom:1px solid rgba(255,255,255,.05);transition:background .2s;}
.vr-all-row:last-child{border-bottom:none;}
.vr-bottom-card{border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);padding:16px;transition:border-color .2s;}
.vr-bottom-card:hover{border-color:rgba(255,255,255,.12);}
.vr-bottom-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
@media(max-width:600px){.vr-bottom-grid{grid-template-columns:1fr;}}
@keyframes spinLoader{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
.vr-fadein{animation:fadeUp .6s cubic-bezier(.22,.68,0,1.1) both;}
`;

export default function ValuesResults() {
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
          .eq('user_id', user.id).eq('test_type', 'VALUES')
          .order('completed_at', { ascending: false }).limit(1),
        supabase.from('ai_interpretations').select('interpretation')
          .eq('user_id', user.id).eq('test_type', 'VALUES')
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
      const fullReport = generateValuesReport(scoresData);
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
        body: { test_type: 'VALUES', raw_scores: scores, report: reportData },
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
      window.location.href = '/test?type=values';
    }
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: 'rgba(16,20,56,.95)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, padding: '10px 14px', fontFamily: "'Space Grotesk',sans-serif" }}>
        <p style={{ fontWeight: 700, color: '#fff', marginBottom: 4, fontSize: '.85rem' }}>{d.value}</p>
        <p style={{ color: d.score >= 0 ? '#34d399' : 'rgba(255,255,255,.35)', fontSize: '.8rem' }}>
          {d.score > 0 ? '+' : ''}{d.score.toFixed(2)} względem Twojej średniej
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ background: '#0d0f2b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk',sans-serif" }}>
        <style>{`@keyframes spinLoader{to{transform:rotate(360deg);}}`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid rgba(0,184,212,.28)', borderTop: `3px solid ${PAGE_ACCENT}`, borderRadius: '50%', animation: 'spinLoader 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.95rem' }}>Ładowanie wyników...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#0d0f2b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk',sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Błąd</h2>
          <p style={{ color: 'rgba(255,255,255,.5)', marginBottom: 24 }}>{error}</p>
          <button
            onClick={() => window.location.href = '/user-profile-tests.html'}
            style={{ background: `linear-gradient(135deg,${PAGE_ACCENT}cc,${PAGE_ACCENT})`, border: 'none', borderRadius: 12, padding: '12px 28px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif" }}>
            Wróć do Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const top1Color = report.top_3?.[0]?.color || '#14b8a6';

  return (
    <div className="vr-root">
      <style>{CSS}</style>

      <ResultsScaffold
        accent={PAGE_ACCENT}
        navLabel="KOMPAS WARTOŚCI"
        badge="🧭 Kompas Wartości (PVQ)"
        title={<>Twój <span style={{ color: PAGE_ACCENT, textShadow: `0 0 24px ${PAGE_ACCENT}66` }}>Kompas Wartości</span></>}
        subtitle={<>Test Wartości Osobistych (Schwartz PVQ)</>}
        completedAt={report?.completed_at}
        retakeHref="/test?type=values"
      >

        {report.top_3?.length ? (
          <div className="vr-fadein" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
            {report.top_3.map((v, i) => (
              <span key={v.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, fontSize: '.78rem', fontWeight: 600, background: `${v.color}22`, border: `1px solid ${v.color}50`, color: v.color }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: v.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.62rem', fontWeight: 800, color: '#000' }}>{i + 1}</span>
                {v.name}
              </span>
            ))}
          </div>
        ) : null}

        {/* ─── MRAT explanation ─── */}
        <div className="vr-glass vr-fadein" style={{ padding: '22px 26px', marginBottom: 24, animationDelay: '.08s' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ fontSize: '1.4rem', flexShrink: 0 }}>💡</div>
            <div>
              <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#14b8a6', marginBottom: 6, letterSpacing: '.3px' }}>Jak odczytywać wyniki?</div>
              <p style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.75, margin: 0 }}>
                {report.summary?.mrat_explanation}
              </p>
              <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.73rem', color: '#34d399' }}>
                  <span style={{ fontSize: '1rem' }}>📈</span> Wartości dodatnie = Twoje priorytety
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.73rem', color: 'rgba(255,255,255,.35)' }}>
                  <span style={{ fontSize: '1rem' }}>📉</span> Wartości ujemne = Mniej istotne
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Diverging bar chart ─── */}
        <div className="vr-glass vr-fadein" style={{ padding: '28px 24px', marginBottom: 24, animationDelay: '.12s' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.85)' }}>
            <span>📊</span> Twój System Wartości
          </h2>
          <ResponsiveContainer width="100%" height={560}>
            <BarChart
              data={report.chart_data}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 140, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" horizontal={false} />
              <XAxis
                type="number"
                domain={[-3, 3]}
                ticks={[-3, -2, -1, 0, 1, 2, 3]}
                stroke="rgba(255,255,255,.15)"
                tick={{ fill: 'rgba(255,255,255,.35)', fontSize: 11, fontFamily: "'Space Grotesk',sans-serif" }}
              />
              <YAxis
                type="category"
                dataKey="value"
                stroke="transparent"
                tick={{ fill: 'rgba(255,255,255,.65)', fontSize: 12, fontFamily: "'Space Grotesk',sans-serif" }}
                width={132}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={0}
                stroke="rgba(255,255,255,.3)"
                strokeWidth={1.5}
                strokeDasharray="5 4"
                label={{ value: 'Średnia', position: 'insideTopRight', fill: 'rgba(255,255,255,.3)', fontSize: 10 }}
              />
              <Bar dataKey="score" radius={[0, 5, 5, 0]}>
                {report.chart_data?.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={entry.score >= 0 ? entry.color : '#475569'}
                    fillOpacity={entry.score >= 0 ? 0.9 : 0.35}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '.72rem', color: 'rgba(255,255,255,.4)' }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, background: '#14b8a6', display: 'inline-block' }} />
              Kolorowe = powyżej Twojej średniej
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '.72rem', color: 'rgba(255,255,255,.4)' }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, background: '#475569', opacity: .4, display: 'inline-block' }} />
              Szare = poniżej Twojej średniej
            </span>
          </div>
        </div>

        {/* ─── Top 3 cards ─── */}
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.75)' }}>
          <span>🎯</span> Twoje 3 Główne Wartości
        </h2>

        <div className="vr-top3-grid">
          {report.top_3?.map((value, index) => (
            <div
              key={value.id}
              className="vr-val-card vr-fadein"
              style={{ '--val-color': value.color, animationDelay: `${.18 + index * .07}s`, padding: 22 }}
            >
              <div className="vr-glow-line" style={{ background: `linear-gradient(90deg,transparent,${value.color},transparent)` }} />
              <div style={{ position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="vr-rank-badge" style={{ width: 46, height: 46, fontSize: '1.1rem', background: `linear-gradient(135deg,${value.color}55,${value.color})` }}>
                      #{value.rank}
                    </div>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.25 }}>{value.name}</div>
                      <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.38)', marginTop: 2 }}>{value.name_en}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: value.color, lineHeight: 1 }}>+{value.score.toFixed(2)}</div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="vr-bar-track" style={{ marginBottom: 14 }}>
                  <div className="vr-bar-fill" style={{ width: `${Math.min((value.score / 3) * 100, 100)}%`, background: `linear-gradient(90deg,${value.color}60,${value.color})` }} />
                </div>

                {/* Description */}
                {value.interpretation?.description && (
                  <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.72, marginBottom: 10 }}>
                    {value.interpretation.description}
                  </p>
                )}

                {/* Characteristics */}
                {value.interpretation?.characteristics?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {value.interpretation.characteristics.slice(0, 3).map((c, i) => (
                      <span key={i} className="vr-tag">{c.length > 38 ? c.slice(0, 36) + '…' : c}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ─── All values ranking ─── */}
        <div className="vr-glass vr-fadein" style={{ padding: '24px 28px', marginBottom: 24, animationDelay: '.32s' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.85)' }}>
            <span>📋</span> Wszystkie Wartości — Ranking
          </h2>
          <div>
            {report.all_values?.map((value, index) => {
              const isPos = value.centered_score >= 0;
              return (
                <div key={value.id} className="vr-all-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="vr-rank-badge" style={{ width: 32, height: 32, fontSize: '.78rem', background: isPos ? `linear-gradient(135deg,${value.color}55,${value.color})` : 'rgba(255,255,255,.08)', flexShrink: 0, opacity: isPos ? 1 : 0.5 }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: '.88rem', fontWeight: 600, color: isPos ? '#fff' : 'rgba(255,255,255,.45)' }}>{value.name}</span>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: isPos ? '#34d399' : 'rgba(255,255,255,.25)', flexShrink: 0 }}>
                          {value.centered_score > 0 ? '+' : ''}{value.centered_score.toFixed(2)}
                        </span>
                      </div>
                      <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.3)', margin: '0 0 6px' }}>{value.motivational_goal}</p>
                      <div className="vr-bar-track" style={{ margin: 0 }}>
                        <div style={{
                          width: `${Math.min(Math.abs(value.centered_score) / 3 * 100, 100)}%`,
                          height: '100%',
                          borderRadius: 100,
                          background: isPos ? `linear-gradient(90deg,${value.color}60,${value.color})` : 'rgba(100,116,139,.5)',
                          opacity: isPos ? 1 : 0.5,
                          transition: 'width 1s cubic-bezier(.22,.68,0,1.1)'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Bottom 3 ─── */}
        <div className="vr-glass vr-fadein" style={{ padding: '24px 28px', marginBottom: 28, animationDelay: '.38s' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.55)' }}>
            <span>💭</span> Wartości Mniej Istotne
          </h2>
          <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.3)', marginBottom: 18, lineHeight: 1.7 }}>
            Te wartości nie są głównym źródłem Twoich decyzji i motywacji — nie oznacza to ich odrzucenia.
          </p>
          <div className="vr-bottom-grid">
            {report.bottom_3?.map(v => (
              <div key={v.id} className="vr-bottom-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontSize: '.82rem', fontWeight: 600, color: 'rgba(255,255,255,.4)' }}>{v.name}</span>
                  <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'rgba(255,255,255,.2)' }}>{v.score?.toFixed(2)}</span>
                </div>
                <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.22)', lineHeight: 1.65, margin: 0 }}>{v.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Footer note ─── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.22)', lineHeight: 1.9 }}>
            Test oparty na teorii wartości uniwersalnych Shaloma Schwartza ·{' '}
            Metoda MRAT (Mean-Referenced Average Technique) pozwala wycentrować wyniki względem Twojej osobistej średniej.
          </p>
        </div>

        {/* ─── AI Interpretation ─── */}
        <div className="vr-glass vr-fadein" style={{ padding: 36, marginBottom: 24 }}>
          <AiInterpretation
            interpretation={interpretation}
            loading={interpLoading}
            error={interpError}
            onRegenerate={handleRegenerate}
            onRetry={() => generateInterpretation(rawScores, report)}
            accentColor="#14b8a6"
            accentGlow="rgba(20,184,166,.5)"
            testLabel="KOMPAS WARTOŚCI"
          />
        </div>

        <ResultsFooterActions retakeHref="/test?type=values" />

      </ResultsScaffold>
    </div>
  );
}
