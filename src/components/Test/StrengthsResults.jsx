import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.js';
import { STRENGTHS_TEST } from '../../data/tests/strengths.js';
import { generateStrengthsReport } from '../../utils/scoring.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';

const CAT = {
  strategic_thinking: {
    color: '#34d399', glow: 'rgba(52,211,153,.5)',
    bar: 'linear-gradient(90deg,#065f46,#34d399)',
    badge: 'linear-gradient(135deg,#065f46,#34d399)',
    shadow: '0 0 0 1px rgba(52,211,153,.35),0 0 30px -4px rgba(52,211,153,.3)',
  },
  executing: {
    color: '#b08fff', glow: 'rgba(123,94,167,.6)',
    bar: 'linear-gradient(90deg,#4a28b0,#b08fff)',
    badge: 'linear-gradient(135deg,#4a28b0,#b08fff)',
    shadow: '0 0 0 1px rgba(123,94,167,.4),0 0 30px -4px rgba(123,94,167,.3)',
  },
  influencing: {
    color: '#fbbf24', glow: 'rgba(251,191,36,.5)',
    bar: 'linear-gradient(90deg,#78350f,#fbbf24)',
    badge: 'linear-gradient(135deg,#78350f,#fbbf24)',
    shadow: '0 0 0 1px rgba(251,191,36,.35),0 0 30px -4px rgba(251,191,36,.25)',
  },
  relationship_building: {
    color: '#60a5fa', glow: 'rgba(96,165,250,.5)',
    bar: 'linear-gradient(90deg,#1e3a5f,#60a5fa)',
    badge: 'linear-gradient(135deg,#1e3a5f,#60a5fa)',
    shadow: '0 0 0 1px rgba(96,165,250,.35),0 0 30px -4px rgba(96,165,250,.3)',
  },
};

const getCat = id => CAT[id] || CAT.strategic_thinking;
const getCategoryInfo = id => STRENGTHS_TEST.categories.find(c => c.id === id);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.sr-root{font-family:'Space Grotesk',sans-serif;background:#0d0f2b;color:#fff;min-height:100vh;overflow-x:hidden;}
.sr-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 15% 20%,rgba(251,191,36,.08) 0%,transparent 65%),radial-gradient(ellipse 50% 50% at 85% 75%,rgba(123,94,167,.12) 0%,transparent 65%),radial-gradient(ellipse 40% 35% at 50% 50%,rgba(80,40,160,.07) 0%,transparent 65%);}
.sr-glass{background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6);}
.sr-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(251,191,36,.15) 35%,rgba(123,94,167,.12) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.sr-talent-card{border-radius:20px;position:relative;isolation:isolate;overflow:hidden;background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(16,20,56,.6) 45%,rgba(16,20,56,.6) 100%);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);transition:transform .28s cubic-bezier(.22,.68,0,1.15),box-shadow .28s ease;cursor:default;}
.sr-talent-card:hover{transform:translateY(-6px);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 0 0 1px rgba(255,255,255,.1),0 0 40px -8px var(--cat-color,#34d399),0 20px 48px -8px rgba(0,0,0,.7);}
.sr-talent-card::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.06) 50%,rgba(255,255,255,.02) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.sr-talent-card::after{content:'';position:absolute;width:140px;height:140px;border-radius:50%;filter:blur(50px);bottom:-50px;right:-40px;opacity:.14;pointer-events:none;z-index:0;transition:opacity .35s,transform .35s;background:var(--cat-color,#34d399);}
.sr-talent-card:hover::after{opacity:.38;transform:scale(1.25);}
.sr-glow-line{position:absolute;bottom:0;left:12%;right:12%;height:1px;border-radius:100px;opacity:0;transition:opacity .3s;}
.sr-talent-card:hover .sr-glow-line{opacity:1;}
.sr-talent-grid{display:grid;grid-template-columns:1fr;gap:20px;margin-bottom:36px;}
@media(max-width:640px){.sr-talent-grid{grid-template-columns:1fr;}}
.sr-bar-track{height:6px;background:rgba(255,255,255,.07);border-radius:100px;overflow:hidden;}
.sr-bar-fill{height:100%;border-radius:100px;position:relative;transition:width 1s cubic-bezier(.22,.68,0,1.1);}
.sr-bar-fill::after{content:'';position:absolute;right:-1px;top:50%;transform:translateY(-50%);width:9px;height:9px;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.6);}
.sr-rank-badge{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:750;color:#fff;flex-shrink:0;}
.sr-cat-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:100px;font-size:.66rem;font-weight:650;letter-spacing:.35px;}
.sr-keyword{padding:3px 9px;border-radius:100px;font-size:.66rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);color:rgba(255,255,255,.58);}
.sr-cat-mini{border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);padding:16px;transition:border-color .2s;}
.sr-cat-mini:hover{border-color:rgba(255,255,255,.14);}
@keyframes spinLoader{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
.sr-fadein{animation:fadeUp .6s cubic-bezier(.22,.68,0,1.1) both;}
`;

export default function StrengthsResults() {
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
          .eq('user_id', user.id).eq('test_type', 'STRENGTHS')
          .order('completed_at', { ascending: false }).limit(1),
        supabase.from('ai_interpretations').select('interpretation')
          .eq('user_id', user.id).eq('test_type', 'STRENGTHS')
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

      if (scoresData.top_5) {
        scoresData.top_5 = scoresData.top_5.map(t => ({
          ...t,
          keywords: typeof t.keywords === 'string'
            ? t.keywords.split(',').map(k => k.trim())
            : (t.keywords || []),
        }));
      }

      const fullReport = generateStrengthsReport(scoresData);
      setReport({ ...fullReport, completed_at: testResult.completed_at });
      setRawScores(scoresData);
      setLoading(false);

      if (cached?.interpretation) {
        setInterpretation(cached.interpretation);
      } else {
        generateInterpretation(scoresData);
      }
    } catch (err) {
      setError(err.message || 'Błąd podczas ładowania wyników');
      setLoading(false);
    }
  };

  const generateInterpretation = async (scores) => {
    setInterpLoading(true);
    setInterpError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Brak sesji');
      const { data, error: fe } = await supabase.functions.invoke('interpret-test', {
        body: { test_type: 'STRENGTHS', raw_scores: scores, report: scores },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (fe) throw fe;
      setInterpretation(data?.interpretation || '');
    } catch (err) {
      setInterpError(err.message || 'Błąd generowania interpretacji');
    } finally {
      setInterpLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!rawScores) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('ai_interpretations').delete().eq('user_id', user.id).eq('test_type', 'STRENGTHS');
    setInterpretation(null);
    generateInterpretation(rawScores);
  };

  if (loading) return (
    <div style={{ background: '#0d0f2b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{CSS}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(251,191,36,.2)', borderTopColor: '#fbbf24', borderRadius: '50%', margin: '0 auto 16px', animation: 'spinLoader 1s linear infinite' }} />
        <p style={{ color: '#fbbf24', fontFamily: 'Space Grotesk,sans-serif', fontWeight: 600 }}>Ładowanie wyników...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ background: '#0d0f2b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{CSS}</style>
      <div className="sr-glass" style={{ maxWidth: 400, width: '100%', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
        <h2 style={{ color: '#f87171', fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Błąd</h2>
        <p style={{ color: 'rgba(255,255,255,.6)', marginBottom: 24 }}>{error}</p>
        <button onClick={() => window.location.href = '/user-profile-tests.html'}
          style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#92400e,#fbbf24)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'Space Grotesk,sans-serif' }}>
          Wróć do Dashboardu
        </button>
      </div>
    </div>
  );

  if (!report?.top_5) return null;

  return (
    <div className="sr-root">
      <style>{CSS}</style>

      <div style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(13,15,43,.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => window.location.href = '/user-profile-tests.html'}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.5)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: '.9rem' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.5)'}
          >
            <ArrowLeft size={18} /> Dashboard
          </button>
          <span style={{ color: 'rgba(255,255,255,.25)', fontSize: '.8rem', fontWeight: 500, letterSpacing: 1 }}>TEST TALENTÓW</span>
          <button
            onClick={() => { if (window.confirm('Czy na pewno chcesz wykonać test ponownie?')) window.location.href = '/test?type=strengths'; }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.45)', background: 'none', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: '.82rem' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; }}
          >
            <RefreshCw size={14} /> Powtórz Test
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '48px 28px 80px' }}>

        <header className="sr-fadein" style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '3.2rem', marginBottom: 12, lineHeight: 1 }}>🎯</div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0 0 8px', background: 'linear-gradient(135deg,#fbbf24 0%,#f97316 50%,#b08fff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Twoje Top 5 Talentów
          </h1>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.95rem', margin: 0 }}>Odkryj swoje naturalne mocne strony</p>
          {report.completed_at && (
            <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '.78rem', marginTop: 8 }}>
              Ukończono: {new Date(report.completed_at).toLocaleDateString('pl-PL')}
            </p>
          )}
        </header>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 36, justifyContent: 'center' }}>
          {STRENGTHS_TEST.categories.map(cat => {
            const c = getCat(cat.id);
            return (
              <span key={cat.id} className="sr-cat-chip" style={{ background: c.color + '18', border: '1px solid ' + c.color + '40', color: c.color }}>
                {cat.icon} {cat.name}
              </span>
            );
          })}
        </div>

        <div className="sr-talent-grid">
          {report.top_5.map((talent, idx) => {
            const catInfo = getCategoryInfo(talent.category);
            const c = getCat(talent.category);
            const scorePct = Math.round((talent.score / 5) * 100);
            return (
              <div
                key={talent.id}
                className="sr-talent-card sr-fadein"
                style={{ padding: 18, '--cat-color': c.color, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08),' + c.shadow + ',0 8px 32px -4px rgba(0,0,0,.6)', animationDelay: (idx * 90) + 'ms' }}
              >
                {/* glow line (hover) */}
                <div className="sr-glow-line" style={{ background: 'linear-gradient(90deg,transparent,' + c.color + ',' + c.color + ',transparent)' }} />
                <div aria-hidden style={{ position: 'absolute', top: 10, left: 16, right: 16, height: 2, borderRadius: 999, background: 'linear-gradient(90deg,' + c.color + '00,' + c.color + '90,' + c.color + '00)', opacity: .9 }} />
                {/* ::after glow blob handled via CSS var + pseudo-element */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: '1.35rem' }}>{catInfo?.icon || '⭐'}</span>
                        <h3 style={{ fontSize: '1.12rem', fontWeight: 850, color: '#fff', lineHeight: 1.15 }}>{talent.name}</h3>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,.36)', fontSize: '.76rem', fontWeight: 550, marginBottom: 8 }}>{talent.name_en}</p>
                      <span className="sr-cat-chip" style={{ background: c.color + '20', border: '1px solid ' + c.color + '45', color: c.color }}>
                        {catInfo?.name || talent.category}
                      </span>
                    </div>
                    <div className="sr-rank-badge" style={{ background: c.badge, boxShadow: '0 4px 20px -2px ' + c.glow }}>
                      #{talent.rank}
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,.35)', fontSize: '.72rem', marginBottom: 6 }}>
                      <span>Wynik</span>
                      <span style={{ color: c.color, fontWeight: 700 }}>{talent.score.toFixed(2)} / 5.00</span>
                    </div>
                    <div className="sr-bar-track">
                      <div className="sr-bar-fill" style={{ width: scorePct + '%', background: c.bar }} />
                    </div>
                  </div>

                  <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '.86rem', lineHeight: 1.6, marginBottom: 12 }}>{talent.description}</p>

                  {talent.keywords?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {talent.keywords.map((kw, i) => <span key={i} className="sr-keyword">{kw}</span>)}
                    </div>
                  )}

                  {talent.interpretation && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 16, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {talent.interpretation.overview && (
                        <p style={{ color: 'rgba(255,255,255,.58)', fontSize: '.84rem', lineHeight: 1.65 }}>{talent.interpretation.overview}</p>
                      )}
                      {talent.interpretation.how_to_use?.length > 0 && (
                        <div>
                          <p style={{ color: c.color, fontSize: '.78rem', fontWeight: 750, marginBottom: 6 }}>✦ Jak wykorzystać ten talent:</p>
                          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {talent.interpretation.how_to_use.map((tip, i) => (
                              <li key={i} style={{ color: 'rgba(255,255,255,.58)', fontSize: '.82rem', lineHeight: 1.55 }}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {talent.interpretation.watch_out?.length > 0 && (
                        <div>
                          <p style={{ color: '#fbbf24', fontSize: '.78rem', fontWeight: 750, marginBottom: 6 }}>⚠️ Na co uważać:</p>
                          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {talent.interpretation.watch_out.map((w, i) => (
                              <li key={i} style={{ color: 'rgba(255,255,255,.58)', fontSize: '.82rem', lineHeight: 1.55 }}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {report.category_scores && (
          <div className="sr-glass sr-fadein" style={{ padding: 28, marginBottom: 24, animationDelay: '500ms' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📊</span><span>Rozkład Kategorii</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12 }}>
              {Object.entries(report.category_scores).map(([catId, catData]) => {
                const catInfo = getCategoryInfo(catId);
                const c = getCat(catId);
                return (
                  <div key={catId} className="sr-cat-mini">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: '1.1rem' }}>{catInfo?.icon || '⭐'}</span>
                      <span style={{ color: c.color, fontWeight: 700, fontSize: '.85rem' }}>{catInfo?.name || catId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,.45)', fontSize: '.75rem', marginBottom: 4 }}>
                      <span>Średnni wynik</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{catData.average_score?.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,.45)', fontSize: '.75rem', marginBottom: 8 }}>
                      <span>Talenty w Top 5</span>
                      <span style={{ color: c.color, fontWeight: 700 }}>{catData.count_in_top5}</span>
                    </div>
                    <div className="sr-bar-track">
                      <div className="sr-bar-fill" style={{ width: (((catData.average_score || 0) / 5) * 100) + '%', background: c.bar }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {report.dominant_category && (() => {
          const c = getCat(report.dominant_category.id || 'strategic_thinking');
          return (
            <div className="sr-glass sr-fadein" style={{ padding: 28, marginBottom: 32, animationDelay: '600ms', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08),' + c.shadow + ',0 8px 32px -4px rgba(0,0,0,.6)' }}>
              <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: c.color, filter: 'blur(70px)', opacity: .07, top: -40, right: -40, pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ color: c.color, fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                  👑 Twoja Dominująca Kategoria
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <span style={{ fontSize: '2.2rem' }}>{report.dominant_category.icon}</span>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{report.dominant_category.name}</h3>
                    <p style={{ color: 'rgba(255,255,255,.38)', fontSize: '.8rem' }}>{report.dominant_category.name_en}</p>
                  </div>
                </div>
                {report.dominant_category.description && (
                  <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.88rem', lineHeight: 1.65 }}>{report.dominant_category.description}</p>
                )}
              </div>
            </div>
          );
        })()}

        <div className="sr-glass sr-fadein" style={{ padding: 36, marginBottom: 24, animationDelay: '700ms' }}>
          <AiInterpretation
            interpretation={interpretation}
            loading={interpLoading}
            error={interpError}
            onRegenerate={handleRegenerate}
            onRetry={() => rawScores && generateInterpretation(rawScores)}
            accentColor="#fbbf24"
            accentGlow="rgba(251,191,36,.5)"
            testLabel="Test Talentów"
          />
        </div>

        <ResultsFooterActions retakeHref="/test?type=strengths" />

      </div>
    </div>
  );
}
