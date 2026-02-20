import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.js';
import AiInterpretation from './AiInterpretation.jsx';
import { DARK_TRIAD_TEST } from '../../data/tests/darkTriad.js';
import { generateDarkTriadReport } from '../../utils/scoring.js';

/* ════════════════════════════════════════════════════════════════════
   ACCENT & META
════════════════════════════════════════════════════════════════════ */
const DT_ACCENT = {
  psychopathy: {
    plName: 'Psychopatia', nameEn: 'Psychopathy', emoji: '⚡',
    color: '#e8001c', fillGrad: 'linear-gradient(90deg,#6b0012,#e8001c,#ff2d55)',
    glow: 'rgba(232,0,28,.6)', blob: '#e8001c',
    hoverShadow: 'inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(232,0,28,.4),0 0 30px -4px rgba(232,0,28,.3),0 16px 48px -6px rgba(0,0,0,.75)',
    glowLine: '0 0 12px 3px rgba(232,0,28,.65)',
    iconBg: 'rgba(232,0,28,.18)', iconBorder: 'rgba(232,0,28,.3)',
    dotGlow: 'rgba(232,0,28,.7)', miniFill: 'linear-gradient(90deg,#6b0012,#ff2d55)',
    miniFillShadow: '0 0 8px rgba(255,45,85,.55)', vsColor: '#ff6060',
  },
  machiavellianism: {
    plName: 'Makiawelizm', nameEn: 'Machiavellianism', emoji: '🎭',
    color: '#ff6230', fillGrad: 'linear-gradient(90deg,#7a1a00,#ff6230,#ff9060)',
    glow: 'rgba(255,98,48,.6)', blob: '#ff6230',
    hoverShadow: 'inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,98,48,.4),0 0 30px -4px rgba(255,98,48,.3),0 16px 48px -6px rgba(0,0,0,.75)',
    glowLine: '0 0 12px 3px rgba(255,98,48,.65)',
    iconBg: 'rgba(255,98,48,.15)', iconBorder: 'rgba(255,98,48,.28)',
    dotGlow: 'rgba(255,98,48,.7)', miniFill: 'linear-gradient(90deg,#7a1a00,#ff6230)',
    miniFillShadow: '0 0 8px rgba(255,98,48,.55)', vsColor: '#ff9060',
  },
  narcissism: {
    plName: 'Narcyzm', nameEn: 'Narcissism', emoji: '👑',
    color: '#ffaa00', fillGrad: 'linear-gradient(90deg,#7a4000,#ffaa00,#ffd060)',
    glow: 'rgba(255,170,0,.5)', blob: '#ffaa00',
    hoverShadow: 'inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,170,0,.4),0 0 30px -4px rgba(255,170,0,.3),0 16px 48px -6px rgba(0,0,0,.75)',
    glowLine: '0 0 12px 3px rgba(255,170,0,.65)',
    iconBg: 'rgba(255,170,0,.14)', iconBorder: 'rgba(255,170,0,.28)',
    dotGlow: 'rgba(255,170,0,.6)', miniFill: 'linear-gradient(90deg,#7a4000,#ffaa00)',
    miniFillShadow: '0 0 8px rgba(255,170,0,.5)', vsColor: '#ffd060',
  },
};

const RISK_META = {
  high:    { label: 'Wysokie ryzyko', badge: '⚠', isHigh: true  },
  average: { label: 'Średnie ryzyko', badge: '⚡', isHigh: false },
  low:     { label: 'Niskie ryzyko',  badge: '✓', isHigh: false },
};

/* ════════════════════════════════════════════════════════════════════
   CSS
════════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');

.dt-root {
  font-family: 'Space Grotesk', sans-serif;
  background: #0d0a1a;
  color: #fff;
  min-height: 100vh;
  padding: 0;
  position: relative;
  overflow: clip;
}
.dt-root::before {
  content: '';
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 55% 40% at 10% 15%, rgba(244,63,94,.14) 0%, transparent 60%),
    radial-gradient(ellipse 45% 50% at 88% 70%, rgba(123,31,162,.16) 0%, transparent 60%),
    radial-gradient(ellipse 40% 35% at 55% 45%, rgba(244,63,94,.07) 0%, transparent 60%),
    radial-gradient(ellipse 30% 30% at 80% 15%, rgba(255,98,48,.06) 0%, transparent 55%),
    #0d0a1a;
}

/* ── PAGE HEADER OVERRIDE (defeats Tailwind preflight) ── */
.dt-root .dt-page-title {
  font-size: 42px !important;
  font-weight: 800 !important;
  line-height: 1.1 !important;
  letter-spacing: -1px !important;
  margin-bottom: 10px !important;
  color: #ffffff !important;
  display: block !important;
  position: relative !important;
  z-index: 2 !important;
  -webkit-text-fill-color: unset !important;
  background: none !important;
}
.dt-root .dt-page-title .dt-title-accent {
  color: #fb7185 !important;
  -webkit-text-fill-color: #fb7185 !important;
  text-shadow: 0 0 30px rgba(251,113,133,.5), 0 0 60px rgba(251,113,133,.2) !important;
}
.dt-root .dt-page-sub {
  font-size: 14px !important;
  color: rgba(255,255,255,.3) !important;
  -webkit-text-fill-color: rgba(255,255,255,.3) !important;
  font-weight: 400 !important;
  display: block !important;
  margin: 0 !important;
  position: relative !important;
  z-index: 2 !important;
}
.dt-root header {
  position: relative !important;
  z-index: 2 !important;
}

/* glass base */
.dt-glass {
  background: rgba(28,10,18,.65);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border-radius: 20px;
  position: relative;
  isolation: isolate;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.08),
    0 0 0 1px rgba(251,113,133,.1),
    0 8px 32px -4px rgba(0,0,0,.7),
    0 2px 8px -2px rgba(0,0,0,.5);
}
.dt-glass::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(145deg,
    rgba(255,255,255,.12) 0%,
    rgba(251,113,133,.22) 30%,
    rgba(123,31,162,.18) 70%,
    rgba(255,255,255,.03) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* page badge pulse */
@keyframes badgePulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); }
  50%     { box-shadow: 0 0 16px 2px rgba(244,63,94,.25); }
}

/* alert glow */
@keyframes alertGlow {
  0%,100% { box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(244,63,94,.15), 0 0 30px -4px rgba(244,63,94,.2), 0 8px 32px -4px rgba(0,0,0,.6); }
  50%     { box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(244,63,94,.35), 0 0 50px -4px rgba(244,63,94,.35), 0 8px 32px -4px rgba(0,0,0,.6); }
}

/* trait card */
.dt-trait-card {
  padding: 26px 26px 22px;
  border-radius: 18px;
  transition: transform .28s cubic-bezier(.22,.68,0,1.15), box-shadow .28s ease;
  overflow: hidden;
}
.dt-trait-card:hover { transform: translateY(-4px) scale(1.005); }

/* glow line */
.dt-glow-line {
  position: absolute;
  bottom: 0; left: 12%; right: 12%;
  height: 1px;
  border-radius: 100px;
  opacity: 0;
  pointer-events: none;
  transition: opacity .3s;
}
.dt-trait-card:hover .dt-glow-line { opacity: 1; }

/* blob */
.dt-blob {
  position: absolute;
  width: 180px; height: 180px;
  border-radius: 50%;
  filter: blur(55px);
  bottom: -70px; right: -50px;
  opacity: .12;
  z-index: -1;
  pointer-events: none;
  transition: opacity .35s;
}
.dt-trait-card:hover .dt-blob { opacity: .28; }

/* scale fill */
.dt-scale-fill {
  height: 100%;
  border-radius: 100px;
  position: relative;
  transition: width 1.2s cubic-bezier(.22,.68,0,1.1);
}

/* impl dot */
.dt-impl-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* shimmer */
@keyframes shimmer { 0%{background-position:-600px 0;} 100%{background-position:600px 0;} }
.dt-shimmer {
  background: linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.05) 75%);
  background-size: 600px 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

/* spin loader */
@keyframes spinLoader { to { transform: rotate(360deg); } }

/* sticky nav */
.dt-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(13,10,26,.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(251,113,133,.12);
}
.dt-nav-inner {
  max-width: 980px;
  margin: 0 auto;
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dt-nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: rgba(255,255,255,.5);
  cursor: pointer;
  font: 500 .9rem 'Space Grotesk', sans-serif;
  transition: color .2s;
  padding: 0;
}
.dt-nav-btn:hover { color: #fff; }
.dt-nav-retake {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 8px;
  padding: 8px 16px;
  color: rgba(255,255,255,.55);
  cursor: pointer;
  font: 600 .85rem 'Space Grotesk', sans-serif;
  transition: all .2s;
}
.dt-nav-retake:hover { background: rgba(255,255,255,.1); color: #fff; }
`;

/* ════════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════════ */
function DarkTriadResults() {
  const [report, setReport]                               = useState(null);
  const [loading, setLoading]                             = useState(true);
  const [error, setError]                                 = useState(null);
  const [rawScores, setRawScores]                         = useState(null);
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

      // Load cached interpretation in parallel
      const { data: cached } = await supabase
        .from('ai_interpretations')
        .select('interpretation')
        .eq('user_id', session.user.id)
        .eq('test_type', 'DARK_TRIAD')
        .maybeSingle();

      setReport(fullReport);
      setRawScores(testResult.raw_scores);
      setLoading(false);

      if (cached?.interpretation) {
        setInterpretation(cached.interpretation);
      } else {
        generateInterpretation(testResult.raw_scores);
      }
    } catch (err) {
      console.error(err);
      setError('Błąd podczas ładowania wyników');
      setLoading(false);
    }
  }

  async function generateInterpretation(rawScores) {
    setInterpretationLoading(true);
    setInterpretationError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Brak sesji');

      const dims = rawScores?.dimensions || {};
      const percentile_scores = {};
      Object.entries(dims).forEach(([k, v]) => { percentile_scores[k] = v.percentile || 0; });

      const { data, error: fnErr } = await supabase.functions.invoke('interpret-test', {
        body: { test_type: 'DARK_TRIAD', percentile_scores },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (fnErr) throw fnErr;
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
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('ai_interpretations').delete().eq('user_id', user.id).eq('test_type', 'DARK_TRIAD');
    setInterpretation(null);
    const { data } = await supabase.from('user_psychometrics').select('raw_scores').eq('test_type', 'DARK_TRIAD').order('completed_at', { ascending: false }).limit(1);
    if (data?.[0]) generateInterpretation(data[0].raw_scores);
  }

  /* ── LOADING ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <style>{CSS}</style>
      <div style={{ width: 56, height: 56, border: '3px solid rgba(251,113,133,.3)', borderTopColor: '#fb7185', borderRadius: '50%', animation: 'spinLoader 1s linear infinite' }} />
      <p style={{ color: 'rgba(255,255,255,.4)', fontFamily: 'Space Grotesk', fontSize: 14 }}>Analiza Cienia…</p>
    </div>
  );

  /* ── ERROR ── */
  if (error || !report) return (
    <div style={{ minHeight: '100vh', background: '#0d0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{CSS}</style>
      <div className="dt-glass" style={{ padding: 40, maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ color: '#fb7185', marginBottom: 8, fontSize: 22, fontWeight: 700 }}>Błąd</h2>
        <p style={{ color: 'rgba(255,255,255,.5)', marginBottom: 24 }}>{error}</p>
        <button onClick={() => window.location.href = '/user-profile-tests.html'} style={{ background: 'rgba(251,113,133,.15)', border: '1px solid rgba(251,113,133,.4)', color: '#fb7185', padding: '10px 24px', borderRadius: 12, cursor: 'pointer', fontFamily: 'Space Grotesk', fontWeight: 600 }}>
          Wróć do Dashboardu
        </button>
      </div>
    </div>
  );

  /* ── DATA ── */
  const dims = report.dimensions || {};
  // Sort by score desc: psychopathy, machiavellianism, narcissism (or whatever order they fall in)
  const sortedIds = Object.keys(dims).sort((a, b) => (dims[b]?.raw_score || 0) - (dims[a]?.raw_score || 0));

  // Compute average score
  const scores = sortedIds.map(id => dims[id]?.raw_score || 0);
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : '0.00';

  // Highest percentile for "Top X%"
  const maxPercentile = Math.max(...sortedIds.map(id => dims[id]?.percentile || 0));

  const overallMeta = RISK_META[report.overall_risk] || RISK_META.average;

  return (
    <div className="dt-root" style={{ position: 'relative', zIndex: 1, paddingTop: 0 }}>
      <style>{CSS}</style>

      {/* ── STICKY NAV ── */}
      <nav className="dt-nav">
        <div className="dt-nav-inner">
          <button className="dt-nav-btn" onClick={() => window.location.href = '/user-profile-tests.html'}>
            <ArrowLeft size={18} /> Dashboard
          </button>
          <button className="dt-nav-retake" onClick={() => { if (confirm('Powtórzyć test? Wyniki zostaną zastąpione.')) window.location.href = '/test'; }}>
            <RefreshCw size={15} /> Powtórz Test
          </button>
        </div>
      </nav>

      {/* ── PAGE CONTENT ── */}
      <div style={{ padding: '48px 40px 80px' }}>
      <header style={{ textAlign: 'center', marginBottom: 44, display: 'block', position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '7px 18px', borderRadius: 100,
          background: 'rgba(244,63,94,.12)', border: '1px solid rgba(244,63,94,.35)',
          fontSize: 11, fontWeight: 700, color: '#fb7185',
          letterSpacing: 3, textTransform: 'uppercase',
          marginBottom: 18, backdropFilter: 'blur(10px)',
          animation: 'badgePulse 3s ease-in-out infinite',
        }}>
          ⚠ System Alert: Personality Analysis
        </div>
        <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1, marginBottom: 10, lineHeight: 1.1, display: 'block', fontFamily: "'Space Grotesk', sans-serif" }}>
          <span style={{ color: '#ffffff' }}>Analiza </span>
          <span style={{ color: '#fb7185', textShadow: '0 0 30px rgba(251,113,133,.5), 0 0 60px rgba(251,113,133,.2)' }}>Cienia</span>
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.35)', fontWeight: 400, display: 'block', marginTop: 4 }}>Dark Triad Assessment (SD3)</div>
      </header>

      {/* ── ALERT BANNER ── */}
      {(report.overall_risk === 'high' || sortedIds.some(id => dims[id]?.level === 'high')) && (
        <div style={{
          maxWidth: 900, margin: '0 auto 28px', padding: '24px 28px', borderRadius: 16,
          background: 'rgba(244,63,94,.08)', border: '1px solid rgba(244,63,94,.3)',
          backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'flex-start', gap: 16,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(244,63,94,.15), 0 0 30px -4px rgba(244,63,94,.2), 0 8px 32px -4px rgba(0,0,0,.6)',
          animation: 'alertGlow 3s ease-in-out infinite',
        }}>
          <div style={{ fontSize: 28, flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(255,170,0,.6))' }}>⚠️</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 6 }}>Status Ogólny</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fb7185', lineHeight: 1.5, textShadow: '0 0 20px rgba(251,113,133,.3)' }}>
              {report.risk_alert || 'Jeden lub więcej wymiarów wskazuje na podwyższone ryzyko.'}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, maxWidth: 900, margin: '0 auto' }}>

        {/* LEFT — trait cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sortedIds.map(id => {
            const ac   = DT_ACCENT[id];
            const dim  = dims[id];
            if (!ac || !dim) return null;

            const norm    = DARK_TRIAD_TEST.norms?.[id];
            const pct     = Math.round(((dim.raw_score - 1) / 4) * 100);
            const normPct = norm ? Math.round(((norm.mean - 1) / 4) * 100) : 50;
            const riskM   = RISK_META[dim.level] || RISK_META.low;
            const vsDiff  = norm ? (dim.raw_score - norm.mean).toFixed(2) : '0';

            return (
              <div key={id} className="dt-glass dt-trait-card"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(251,113,133,.1), 0 8px 32px -4px rgba(0,0,0,.7), 0 2px 8px -2px rgba(0,0,0,.5)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = ac.hoverShadow}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(251,113,133,.1), 0 8px 32px -4px rgba(0,0,0,.7), 0 2px 8px -2px rgba(0,0,0,.5)'}
              >
                <div className="dt-glow-line" style={{ background: ac.color, boxShadow: ac.glowLine }} />
                <div className="dt-blob" style={{ background: ac.blob }} />

                {/* card header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, flexShrink: 0, background: ac.iconBg, border: `1px solid ${ac.iconBorder}`,
                      transition: 'transform .3s ease',
                    }}>
                      {ac.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -.3, marginBottom: 2 }}>{ac.plName}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', fontWeight: 500 }}>{ac.nameEn}</div>
                    </div>
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 100, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                    color: riskM.isHigh ? '#fb7185' : '#ffaa00',
                    background: riskM.isHigh ? 'rgba(251,113,133,.1)' : 'rgba(255,170,0,.1)',
                    border: `1px solid ${riskM.isHigh ? 'rgba(251,113,133,.3)' : 'rgba(255,170,0,.3)'}`,
                    boxShadow: riskM.isHigh ? '0 0 12px -2px rgba(251,113,133,.25)' : '0 0 12px -2px rgba(255,170,0,.2)',
                  }}>
                    {riskM.badge} {riskM.label}
                  </div>
                </div>

                {/* scale bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.25)', fontWeight: 500, marginBottom: 8 }}>
                      <span>1.0</span>
                      {norm && <span style={{ position: 'absolute', left: `${normPct}%`, transform: 'translateX(-50%)', color: 'rgba(255,255,255,.3)' }}>Norma: {norm.mean}</span>}
                      <span>5.0</span>
                    </div>
                  </div>
                  <div style={{ height: 10, borderRadius: 100, background: 'rgba(255,255,255,.06)', position: 'relative', overflow: 'visible' }}>
                    <div className="dt-scale-fill" style={{ width: `${pct}%`, background: ac.fillGrad, boxShadow: `0 0 14px ${ac.glow}` }}>
                      <div style={{
                        position: 'absolute', right: -1, top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(10,6,20,.85)', border: '1px solid rgba(255,255,255,.15)',
                        borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                        backdropFilter: 'blur(8px)',
                      }}>
                        {dim.raw_score?.toFixed(2)}
                      </div>
                    </div>
                    {norm && (
                      <div style={{ position: 'absolute', top: -2, bottom: -2, width: 2, left: `${normPct}%`, background: 'rgba(255,255,255,.4)', borderRadius: 2, boxShadow: '0 0 6px rgba(255,255,255,.3)' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11 }}>
                    <span style={{ fontWeight: 600 }}>
                      vs średnia: <span style={{ color: ac.vsColor }}>{parseFloat(vsDiff) >= 0 ? '+' : ''}{vsDiff}</span>
                    </span>
                    <span style={{ color: 'rgba(255,255,255,.4)' }}>
                      Percentyl: <strong style={{ color: 'rgba(255,255,255,.7)' }}>{dim.percentile}%</strong>
                    </span>
                  </div>
                </div>

                {/* description */}
                {dim.interpretation?.description && (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.65, marginBottom: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.06)' }}>
                    {dim.interpretation.description}
                  </div>
                )}

                {/* implications */}
                {dim.interpretation?.implications?.length > 0 && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginBottom: 10 }}>Implikacje:</div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {dim.interpretation.implications.map((imp, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
                          <span className="dt-impl-dot" style={{ background: ac.color, boxShadow: `0 0 6px ${ac.dotGlow}` }} />
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT — summary panel (wrapper stretches to full grid height for sticky to work) */}
        <div style={{ position: 'relative' }}>
        <div className="dt-glass" style={{ padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.25)' }}>Podsumowanie</div>

          {/* overall score */}
          <div style={{ background: 'rgba(244,63,94,.07)', border: '1px solid rgba(244,63,94,.2)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -2, color: '#fb7185', textShadow: '0 0 30px rgba(251,113,133,.55), 0 0 60px rgba(251,113,133,.2)', lineHeight: 1, marginBottom: 4 }}>
              {avgScore}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', letterSpacing: 1 }}>Średni wynik Dark Triad</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12,
              fontSize: 12, fontWeight: 700, color: '#fb7185',
              background: 'rgba(251,113,133,.1)', border: '1px solid rgba(251,113,133,.25)',
              padding: '5px 12px', borderRadius: 100,
            }}>
              🔴 Top {maxPercentile}% populacji
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,.07)' }} />
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.25)' }}>Składowe</div>

          {/* mini bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedIds.map(id => {
              const ac  = DT_ACCENT[id];
              const dim = dims[id];
              if (!ac || !dim) return null;
              const pct = Math.round(((dim.raw_score - 1) / 4) * 100);
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{ac.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.65)', marginBottom: 5, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{ac.plName}</span>
                      <span style={{ fontWeight: 700, color: ac.color }}>{dim.raw_score?.toFixed(2)}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 100, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 100, background: ac.miniFill, boxShadow: ac.miniFillShadow }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,.07)' }} />

          {/* insight box */}
          <div style={{ background: 'rgba(123,31,162,.08)', border: '1px solid rgba(123,31,162,.22)', borderRadius: 12, padding: 16, fontSize: 12, lineHeight: 1.65, color: 'rgba(255,255,255,.45)' }}>
            <strong style={{ color: 'rgba(255,200,200,.85)', fontWeight: 600 }}>
              {report.overall_risk === 'high'
                ? 'Profil wskazuje na podwyższoną skłonność do zachowań ciemnej triady.'
                : 'Profil mieści się w normie populacyjnej.'}
            </strong>{' '}
            {sortedIds[0] && DT_ACCENT[sortedIds[0]] && (
              <>Dominujący wymiar: {DT_ACCENT[sortedIds[0]].plName}.</>
            )}
          </div>

          {/* disclaimer */}
          <div style={{ background: 'rgba(255,170,0,.05)', border: '1px solid rgba(255,170,0,.15)', borderRadius: 10, padding: '12px 14px', fontSize: 11, color: 'rgba(255,200,100,.5)', lineHeight: 1.55, textAlign: 'center' }}>
            ⚠️ Wyniki mają charakter informacyjny. Nie stanowią diagnozy klinicznej. W razie wątpliwości skonsultuj się ze specjalistą.
          </div>
        </div>
        </div>

      </div>

      {/* ── AI INTERPRETATION ── */}
      <div style={{ maxWidth: 900, margin: '28px auto 0' }}>
        <div className="dt-glass" style={{ padding: 36, background: 'rgba(20,6,16,.7)' }}>
          <AiInterpretation
            interpretation={interpretation}
            loading={interpretationLoading}
            error={interpretationError}
            onRegenerate={regenerateInterpretation}
            onRetry={() => generateInterpretation(rawScores)}
            accentColor="#fb7185"
            accentGlow="rgba(251,113,133,.5)"
            testLabel="profilu Dark Triad"
          />
        </div>
      </div>

      {/* ── ACTIONS ── */}
      <div style={{ maxWidth: 900, margin: '32px auto 0', display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button
          onClick={() => window.location.href = '/user-profile-tests.html'}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 14 }}
        >
          <ArrowLeft size={16} /> Wróć do Dashboardu
        </button>
        <button
          onClick={() => { if (confirm('Powtórzyć test? Wyniki zostaną zastąpione.')) window.location.href = '/test'; }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14, background: 'rgba(251,113,133,.12)', border: '1px solid rgba(251,113,133,.35)', color: '#fb7185', cursor: 'pointer', fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 14 }}
        >
          <RefreshCw size={16} /> Wykonaj Test Ponownie
        </button>
      </div>

      </div>{/* /page content */}
    </div>
  );
}

export default DarkTriadResults;
