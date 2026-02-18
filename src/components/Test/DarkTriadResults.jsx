import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.js';
import { DARK_TRIAD_TEST } from '../../data/tests/darkTriad.js';
import { generateDarkTriadReport } from '../../utils/scoring.js';

const DT_ACCENT = {
  machiavellianism: {
    plName: 'Makiawelizm', name: 'Machiavellianism', emoji: '🎭',
    color: '#ff9532', gradient: 'linear-gradient(90deg,#a04000,#ff9532)',
    glow: 'rgba(255,149,50,.5)', blob: '#ff9532',
    hover: 'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(255,149,50,.35),0 0 30px -4px rgba(255,149,50,.25),0 16px 48px -6px rgba(0,0,0,.7)',
  },
  narcissism: {
    plName: 'Narcyzm', name: 'Narcissism', emoji: '👑',
    color: '#b08fff', gradient: 'linear-gradient(90deg,#4a28b0,#b08fff)',
    glow: 'rgba(123,94,167,.6)', blob: '#7b5ea7',
    hover: 'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(123,94,167,.4),0 0 30px -4px rgba(123,94,167,.3),0 16px 48px -6px rgba(0,0,0,.7)',
  },
  psychopathy: {
    plName: 'Psychopatia', name: 'Psychopathy', emoji: '🔴',
    color: '#ff4d6d', gradient: 'linear-gradient(90deg,#7f0020,#ff4d6d)',
    glow: 'rgba(255,77,109,.5)', blob: '#ff4d6d',
    hover: 'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(255,77,109,.4),0 0 30px -4px rgba(255,77,109,.3),0 16px 48px -6px rgba(0,0,0,.7)',
  },
};

const DT_ORDER = ['machiavellianism', 'narcissism', 'psychopathy'];

const RISK_META = {
  high:    { label: 'Wysokie', badge: '⚠️', badgeColor: '#ff4d6d', bgColor: 'rgba(255,77,109,.12)',  borderColor: 'rgba(255,77,109,.4)' },
  average: { label: 'Średnie', badge: '⚡', badgeColor: '#ff9532', bgColor: 'rgba(255,149,50,.08)', borderColor: 'rgba(255,149,50,.3)' },
  low:     { label: 'Niskie',  badge: '✓',  badgeColor: '#00e5a0', bgColor: 'rgba(0,229,160,.08)',  borderColor: 'rgba(0,229,160,.3)' },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.dt-root{font-family:'Space Grotesk',sans-serif;background:#0d0f2b;color:#fff;min-height:100vh;overflow-x:hidden;}
.dt-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 15% 20%,rgba(255,77,109,.08) 0%,transparent 65%),radial-gradient(ellipse 50% 50% at 85% 75%,rgba(123,94,167,.12) 0%,transparent 65%),radial-gradient(ellipse 40% 35% at 50% 50%,rgba(80,10,40,.1) 0%,transparent 65%);}
.dt-glass{background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6),0 2px 8px -2px rgba(0,0,0,.4);}
.dt-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(255,77,109,.18) 35%,rgba(123,94,167,.15) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.dt-stat-card{border-radius:16px;cursor:default;overflow:hidden;position:relative;isolation:isolate;transition:transform .28s cubic-bezier(.22,.68,0,1.15),box-shadow .28s ease;}
.dt-stat-card:hover{transform:translateY(-5px) scale(1.01);}
.dt-glow-line{position:absolute;bottom:0;left:15%;right:15%;height:1px;border-radius:100px;opacity:0;transition:opacity .3s;}
.dt-stat-card:hover .dt-glow-line{opacity:1;}
.dt-pfill{height:100%;border-radius:100px;position:relative;}
.dt-pfill::after{content:'';position:absolute;right:-1px;top:50%;transform:translateY(-50%);width:9px;height:9px;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.6);}
.dt-tbar{height:100%;border-radius:100px;}
@keyframes spinLoader{to{transform:rotate(360deg);}}
@keyframes shimmer{0%{background-position:-600px 0;}100%{background-position:600px 0;}}
.dt-shimmer{background:linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.05) 75%);background-size:600px 100%;animation:shimmer 1.8s ease-in-out infinite;}
`;

const G = {
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6)',
};

function DarkTriadResults() {
  const [report, setReport]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [interpretation, setInterpretation]               = useState(null);
  const [interpretationLoading, setInterpretationLoading] = useState(false);
  const [interpretationError, setInterpretationError]     = useState(null);

  useEffect(() => { loadResults(); }, []);

  async function loadResults() {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) { setError('Nie jesteś zalogowany'); setLoading(false); return; }

      const { data, error: fetchError } = await supabase
        .from('user_psychometrics')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('test_type', 'DARK_TRIAD')
        .order('completed_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;
      if (!data || data.length === 0) { setError('Nie znaleziono wyników testu.'); setLoading(false); return; }

      const testResult    = data[0];
      const darkTriadData = testResult.raw_scores || {};
      const dimensions    = darkTriadData.dimensions || {};
      const riskLevels    = darkTriadData.risk_levels || {};
      const overallRisk   = darkTriadData.overall_risk || 'average';
      const highestDim    = darkTriadData.highest_dimension || {};

      const fullReport = generateDarkTriadReport({
        test_id: testResult.test_type,
        test_name: 'Dark Triad SD3',
        completed_at: testResult.completed_at,
        dimensions,
        risk_levels: riskLevels,
        overall_risk: overallRisk,
        highest_dimension: highestDim,
        sorted_dimensions: Object.entries(dimensions).map(([id, d]) => {
          const dim = DARK_TRIAD_TEST.dimensions.find(x => x.id === id);
          return { id, name: dim?.name || id, name_en: dim?.name_en || id, icon: dim?.icon || '⚠️', score: d.raw_score, level: d.level };
        }).sort((a, b) => b.score - a.score),
      });

      setReport(fullReport);
      setLoading(false);
      loadInterpretation(testResult.raw_scores);
    } catch (err) {
      console.error(err);
      setError('Błąd podczas ładowania wyników');
      setLoading(false);
    }
  }

  async function loadInterpretation(rawScores) {
    setInterpretationLoading(true);
    setInterpretationError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Brak sesji');

      const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const dims = rawScores?.dimensions || {};
      const percentile_scores = {};
      Object.entries(dims).forEach(([k, v]) => { percentile_scores[k] = v.percentile || 0; });

      const res = await fetch(`${supabaseUrl}/functions/v1/interpret-test`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey':        supabaseAnonKey,
        },
        body: JSON.stringify({ test_type: 'DARK_TRIAD', percentile_scores }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInterpretation(data?.interpretation ?? null);
    } catch (err) {
      console.error('Interpretation error:', err);
      setInterpretationError('Nie udało się wygenerować interpretacji.');
    } finally {
      setInterpretationLoading(false);
    }
  }

  async function regenerateInterpretation() {
    if (!report) return;
    await supabase.from('ai_interpretations').delete().eq('test_type', 'DARK_TRIAD');
    setInterpretation(null);
    const { data } = await supabase.from('user_psychometrics').select('raw_scores').eq('test_type', 'DARK_TRIAD').order('completed_at', { ascending: false }).limit(1);
    if (data?.[0]) loadInterpretation(data[0].raw_scores);
  }

  /* ── LOADING ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0f2b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <style>{CSS}</style>
      <div style={{ width: 56, height: 56, border: '3px solid rgba(255,77,109,.3)', borderTopColor: '#ff4d6d', borderRadius: '50%', animation: 'spinLoader 1s linear infinite' }} />
      <p style={{ color: 'rgba(255,255,255,.4)', fontFamily: 'Space Grotesk', fontSize: 14 }}>Analiza Cienia…</p>
    </div>
  );

  /* ── ERROR ── */
  if (error || !report) return (
    <div style={{ minHeight: '100vh', background: '#0d0f2b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{CSS}</style>
      <div className="dt-glass" style={{ padding: 40, maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ color: '#ff4d6d', marginBottom: 8, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 700 }}>Błąd</h2>
        <p style={{ color: 'rgba(255,255,255,.5)', marginBottom: 24, fontFamily: 'Space Grotesk' }}>{error}</p>
        <button onClick={() => window.location.href = '/user-profile-tests.html'} style={{ background: 'rgba(255,77,109,.15)', border: '1px solid rgba(255,77,109,.4)', color: '#ff4d6d', padding: '10px 24px', borderRadius: 12, cursor: 'pointer', fontFamily: 'Space Grotesk', fontWeight: 600 }}>
          Wróć do Dashboardu
        </button>
      </div>
    </div>
  );

  /* ── DATA ── */
  const dims        = report.dimensions || {};
  const sorted      = DT_ORDER.filter(id => dims[id]);
  const byScore     = [...sorted].sort((a, b) => (dims[b]?.raw_score || 0) - (dims[a]?.raw_score || 0));
  const overallMeta = RISK_META[report.overall_risk] || RISK_META.average;

  return (
    <div className="dt-root" style={{ padding: '48px 24px 80px', position: 'relative', zIndex: 1 }}>
      <style>{CSS}</style>

      {/* ── PAGE HEADER ── */}
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 100, background: 'rgba(255,77,109,.1)', border: '1px solid rgba(255,77,109,.25)', fontSize: 13, fontWeight: 600, color: '#ff4d6d', letterSpacing: .5, marginBottom: 14 }}>
          👁 System Alert: Shadow Analysis
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -.5, marginBottom: 8 }}>
          Analiza <span style={{ color: '#ff4d6d' }}>Cienia</span>
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.35)', fontWeight: 400 }}>
          <strong style={{ color: 'rgba(255,255,255,.55)', fontWeight: 500 }}>Dark Triad SD3</strong> · Makiawelizm · Narcyzm · Psychopatia
        </p>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, maxWidth: 1160, margin: '0 auto' }}>

        {/* LEFT: Bar chart per dimension */}
        <div className="dt-glass" style={{ padding: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            Profil Ciemnej Triady
            <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(255,77,109,.2),transparent)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {sorted.map(id => {
              const ac     = DT_ACCENT[id];
              const dim    = dims[id];
              if (!dim) return null;
              const norm    = DARK_TRIAD_TEST.norms?.[id];
              const pct     = Math.round(((dim.raw_score - 1) / 4) * 100);
              const normPct = norm ? Math.round(((norm.mean - 1) / 4) * 100) : 50;
              const riskM   = RISK_META[dim.level] || RISK_META.low;

              return (
                <div key={id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{ac.emoji}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{ac.plName}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 500, letterSpacing: 1 }}>{ac.name}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: riskM.bgColor, border: `1px solid ${riskM.borderColor}`, color: riskM.badgeColor }}>
                        {riskM.badge} {riskM.label}
                      </span>
                      <span style={{ fontSize: 22, fontWeight: 800, color: ac.color, minWidth: 48, textAlign: 'right' }}>{dim.raw_score?.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* progress track */}
                  <div style={{ position: 'relative', height: 10, background: 'rgba(255,255,255,.06)', borderRadius: 100, overflow: 'visible' }}>
                    <div className="dt-pfill" style={{ width: `${pct}%`, background: ac.gradient, boxShadow: `0 0 10px ${ac.glow}` }} />
                    {norm && (
                      <div style={{ position: 'absolute', top: -4, left: `${normPct}%`, width: 2, height: 18, background: 'rgba(255,255,255,.25)', borderRadius: 2, transform: 'translateX(-50%)' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,.25)' }}>
                    <span>1.0 (min)</span>
                    {norm && <span style={{ color: 'rgba(255,255,255,.35)' }}>Norma: {norm.mean}</span>}
                    <span>5.0 (max)</span>
                  </div>

                  {dim.interpretation?.description && (
                    <p style={{ marginTop: 10, fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.6, borderLeft: `2px solid ${ac.color}44`, paddingLeft: 12 }}>
                      {dim.interpretation.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Summary panel */}
        <div className="dt-glass" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>Podsumowanie</div>

          {/* Overall risk */}
          <div style={{ background: overallMeta.bgColor, border: `1px solid ${overallMeta.borderColor}`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: overallMeta.badgeColor, marginBottom: 6 }}>Status Ogólny</div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -.3, marginBottom: 4 }}>
              {overallMeta.badge} {report.risk_alert || 'Profil Analizy Cienia'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>Dark Triad SD3 · Jones &amp; Paulhus, 2014</div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,.07)' }} />

          {/* Trait ranking */}
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>Ranking cech</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {byScore.map(id => {
              const ac  = DT_ACCENT[id];
              const dim = dims[id];
              if (!dim) return null;
              const pct = Math.round(((dim.raw_score - 1) / 4) * 100);
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.65)', whiteSpace: 'nowrap', minWidth: 108 }}>
                    {ac.emoji} {ac.plName}
                  </span>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.07)', borderRadius: 100, overflow: 'hidden' }}>
                    <div className="dt-tbar" style={{ width: `${pct}%`, background: ac.gradient, boxShadow: `0 0 8px ${ac.glow}` }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, minWidth: 30, textAlign: 'right', color: ac.color }}>{dim.raw_score?.toFixed(1)}</span>
                </div>
              );
            })}
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,.07)' }} />

          {/* Insight note */}
          <div style={{ background: 'rgba(255,77,109,.06)', border: '1px solid rgba(255,77,109,.18)', borderRadius: 12, padding: 16, fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,.5)' }}>
            <strong style={{ color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>Uwaga:</strong>{' '}
            Podwyższone wyniki nie oznaczają diagnozy klinicznej. Dark Triad to spektrum cech
            obecnych w całej populacji z różnym natężeniem.
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ maxWidth: 1160, margin: '24px auto 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>Szczegółowe wyniki</span>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(255,77,109,.2),transparent)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {sorted.map(id => {
            const ac    = DT_ACCENT[id];
            const dim   = dims[id];
            if (!dim) return null;
            const pct   = Math.round(((dim.raw_score - 1) / 4) * 100);
            const riskM = RISK_META[dim.level] || RISK_META.low;

            return (
              <div key={id} className="dt-glass dt-stat-card"
                style={{ boxShadow: G.boxShadow }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = ac.hover}
                onMouseLeave={e => e.currentTarget.style.boxShadow = G.boxShadow}
              >
                <div className="dt-glow-line" style={{ background: ac.color, boxShadow: `0 0 10px 2px ${ac.glow}` }} />
                <div style={{ padding: '22px 22px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 4 }}>{ac.plName}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -.2, color: '#fff' }}>{ac.name}</div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: ac.color, lineHeight: 1 }}>
                      {dim.raw_score?.toFixed(1)}<span style={{ fontSize: 13, color: 'rgba(255,255,255,.3)' }}>/5</span>
                    </div>
                  </div>

                  <div style={{ height: 4, borderRadius: 100, background: 'rgba(255,255,255,.07)', marginBottom: 12, overflow: 'hidden' }}>
                    <div className="dt-pfill" style={{ width: `${pct}%`, background: ac.gradient, boxShadow: `0 0 10px ${ac.glow}` }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: riskM.bgColor, border: `1px solid ${riskM.borderColor}`, color: riskM.badgeColor }}>
                      {riskM.badge} {riskM.label} ryzyko
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>
                      Percentyl: <strong style={{ color: 'rgba(255,255,255,.6)' }}>{dim.percentile}%</strong>
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.5 }}>
                    {dim.interpretation?.description?.substring(0, 120)}…
                  </div>

                  {dim.interpretation?.implications?.length > 0 && (
                    <ul style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {dim.interpretation.implications.slice(0, 2).map((imp, i) => (
                        <li key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{ color: ac.color, marginTop: 1 }}>▸</span>{imp}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* blob */}
                <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', filter: 'blur(50px)', bottom: -50, right: -30, background: ac.blob, opacity: .15, pointerEvents: 'none', zIndex: -1 }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── AI INTERPRETATION ── */}
      <div style={{ maxWidth: 1160, margin: '24px auto 0' }}>
        <div className="dt-glass" style={{ padding: 36, background: 'rgba(20,10,30,.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,77,109,.12)', border: '1px solid rgba(255,77,109,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Interpretacja AI</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Spersonalizowana analiza profilu Dark Triad</div>
              </div>
            </div>
            {interpretation && !interpretationLoading && (
              <button onClick={regenerateInterpretation} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.35)', padding: '6px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)', background: 'transparent', cursor: 'pointer' }}>
                <RefreshCw size={12} /> Regeneruj
              </button>
            )}
          </div>

          {interpretationLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4d6d' }} />
                <span style={{ fontSize: 13, color: '#ff4d6d' }}>Generuję interpretację…</span>
              </div>
              {[100, 83, 91, 70, 88, 75, 95].map((w, i) => (
                <div key={i} className="dt-shimmer" style={{ height: 14, borderRadius: 8, width: `${w}%` }} />
              ))}
            </div>
          )}

          {interpretationError && !interpretationLoading && (
            <div style={{ background: 'rgba(255,77,109,.08)', border: '1px solid rgba(255,77,109,.25)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <p style={{ color: '#ff4d6d', fontSize: 13, marginBottom: 10 }}>{interpretationError}</p>
              <button onClick={() => { setInterpretationError(null); loadInterpretation(null); }} style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
                Spróbuj ponownie
              </button>
            </div>
          )}

          {interpretation && !interpretationLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {interpretation.split('\n\n').filter(p => p.trim()).map((para, i) => {
                const isItalic = para.trim().startsWith('*') && para.trim().endsWith('*');
                const text = isItalic ? para.trim().replace(/^\*|\*$/g, '') : para.trim();
                return isItalic
                  ? <p key={i} style={{ fontSize: 13, fontStyle: 'italic', color: '#ff9532', borderLeft: '2px solid rgba(255,149,50,.4)', paddingLeft: 14, margin: 0 }}>{text}</p>
                  : <p key={i} style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,.55)', margin: 0 }}>{text}</p>;
              })}
              <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 12, fontSize: 11, color: 'rgba(255,255,255,.2)' }}>
                Wygenerowane przez GPT-4o-mini · Interpretacja psychologiczna, nie diagnoza medyczna
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SCIENTIFIC NOTE ── */}
      <div style={{ maxWidth: 1160, margin: '24px auto 0' }}>
        <div className="dt-glass" style={{ padding: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 12 }}>📊 Informacje Naukowe</div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.7, marginBottom: 8 }}>
            Dark Triad SD3 to zwalidowane narzędzie psychometryczne mierzące trzy cechy „ciemnej" osobowości:
            <strong style={{ color: 'rgba(255,255,255,.6)' }}> Makiawelizm</strong> (manipulacja w relacjach),
            <strong style={{ color: 'rgba(255,255,255,.6)' }}> Narcyzm</strong> (poczucie wyższości i potrzeba podziwu) oraz
            <strong style={{ color: 'rgba(255,255,255,.6)' }}> Psychopatię</strong> (bezwzględność i brak empatii).
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', lineHeight: 1.6 }}>
            Wyniki porównane są z normami populacyjnymi (Jones &amp; Paulhus, 2014). Podwyższone wyniki nie oznaczają diagnozy klinicznej.
          </p>
        </div>
      </div>

      {/* ── ACTIONS ── */}
      <div style={{ maxWidth: 1160, margin: '32px auto 0', display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button
          onClick={() => window.location.href = '/user-profile-tests.html'}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 14 }}
        >
          <ArrowLeft size={16} /> Wróć do Dashboardu
        </button>
        <button
          onClick={() => { if (confirm('Powtórzyć test? Wyniki zostaną zastąpione.')) window.location.href = '/test'; }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14, background: 'rgba(255,77,109,.12)', border: '1px solid rgba(255,77,109,.35)', color: '#ff4d6d', cursor: 'pointer', fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 14 }}
        >
          <RefreshCw size={16} /> Wykonaj Test Ponownie
        </button>
      </div>

    </div>
  );
}

export default DarkTriadResults;
