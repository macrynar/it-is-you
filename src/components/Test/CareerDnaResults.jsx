import React, { useState, useEffect, useRef } from 'react';
import { getAccessToken, SUPABASE_ANON_KEY, supabase } from '../../lib/supabaseClient.js';
import { CAREER_DNA_TEST } from '../../data/tests/careerDna.js';
import { generateCareerDnaReport } from '../../utils/scoring.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';

const PAGE_ACCENT = '#f97316';       // orange-500
const ACCENT_GLOW  = 'rgba(249,115,22,.5)';
const ACCENT_DIM   = 'rgba(249,115,22,.12)';

// per-dimension color registry
const DIM_COLORS = {
  AN: { color: '#3b82f6', glow: 'rgba(59,130,246,.45)',  bar: 'linear-gradient(90deg,#1e3a8a,#3b82f6)',  bg: 'rgba(59,130,246,.08)'  },
  SO: { color: '#10b981', glow: 'rgba(16,185,129,.45)',   bar: 'linear-gradient(90deg,#064e3b,#10b981)',  bg: 'rgba(16,185,129,.08)'  },
  CR: { color: '#a855f7', glow: 'rgba(168,85,247,.45)',   bar: 'linear-gradient(90deg,#3b0764,#a855f7)',  bg: 'rgba(168,85,247,.08)'  },
  ST: { color: '#f59e0b', glow: 'rgba(245,158,11,.45)',   bar: 'linear-gradient(90deg,#78350f,#f59e0b)',  bg: 'rgba(245,158,11,.08)'  },
  LE: { color: '#ef4444', glow: 'rgba(239,68,68,.45)',    bar: 'linear-gradient(90deg,#7f1d1d,#ef4444)',  bg: 'rgba(239,68,68,.08)'   },
  HO: { color: '#f97316', glow: 'rgba(249,115,22,.45)',   bar: 'linear-gradient(90deg,#7c2d12,#f97316)',  bg: 'rgba(249,115,22,.08)'  },
};
const getDim = (id) => DIM_COLORS[id] || DIM_COLORS.HO;

// ── Radar (hexagon) SVG ─────────────────────────────────────────────────────
const DIM_ORDER = ['AN', 'SO', 'CR', 'ST', 'LE', 'HO'];
const CX = 290, CY = 220, R_MAX = 145;

function radPt(i, pct) {
  const a = (i * 60 - 90) * (Math.PI / 180);
  const r = (pct / 100) * R_MAX;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}
function ring(pct) {
  return DIM_ORDER.map((_, i) => radPt(i, pct).join(',')).join(' ');
}

const LABELS = [
  { id: 'AN', lx: 290, ly: 38  },
  { id: 'SO', lx: 448, ly: 128 },
  { id: 'CR', lx: 448, ly: 314 },
  { id: 'ST', lx: 290, ly: 402 },
  { id: 'LE', lx: 132, ly: 314 },
  { id: 'HO', lx: 132, ly: 128 },
];
const DIM_META = Object.fromEntries(
  CAREER_DNA_TEST.dimensions.map((d) => [d.id, d])
);

function HexRadar({ data }) {
  const [animated, setAnimated] = useState(false);
  const scoreMap = Object.fromEntries(data.map((d) => [d.id, d.value]));
  const pts = DIM_ORDER.map((id, i) => radPt(i, animated ? (scoreMap[id] || 0) : 0).join(',')).join(' ');

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <svg viewBox="0 0 580 440" style={{ width: '100%', maxWidth: 580, display: 'block', margin: '0 auto' }}>
      {/* rings */}
      {[20, 40, 60, 80, 100].map((p) => (
        <polygon key={p} points={ring(p)} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={1} />
      ))}
      {/* spokes */}
      {DIM_ORDER.map((_, i) => {
        const [x, y] = radPt(i, 100);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(255,255,255,.07)" strokeWidth={1} />;
      })}
      {/* filled shape */}
      <polygon
        points={pts}
        fill={`rgba(249,115,22,.18)`}
        stroke={PAGE_ACCENT}
        strokeWidth={2.5}
        strokeLinejoin="round"
        style={{ transition: 'points 1.1s cubic-bezier(.22,.68,0,1.1)', filter: `drop-shadow(0 0 12px ${ACCENT_GLOW})` }}
      />
      {/* dots */}
      {DIM_ORDER.map((id, i) => {
        const [x, y] = radPt(i, animated ? (scoreMap[id] || 0) : 0);
        return (
          <circle
            key={id}
            cx={x} cy={y} r={5}
            fill={PAGE_ACCENT}
            stroke="rgba(0,0,0,.5)"
            strokeWidth={1.5}
            style={{ transition: `cx 1.1s cubic-bezier(.22,.68,0,1.1), cy 1.1s cubic-bezier(.22,.68,0,1.1)` }}
          />
        );
      })}
      {/* labels */}
      {LABELS.map(({ id, lx, ly }) => {
        const meta = DIM_META[id];
        const score = scoreMap[id] ?? 0;
        const anchor = lx < 160 ? 'end' : lx > 420 ? 'start' : 'middle';
        return (
          <g key={id}>
            <text x={lx} y={ly} textAnchor={anchor} fill="rgba(255,255,255,.55)" fontSize={11} fontWeight={600} fontFamily="'Space Grotesk', sans-serif">{meta?.icon} {meta?.name}</text>
            <text x={lx} y={ly + 14} textAnchor={anchor} fill={getDim(id).color} fontSize={12} fontWeight={800} fontFamily="'Space Grotesk', sans-serif">{score}%</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Bar row ─────────────────────────────────────────────────────────────────
function DimBar({ dim, score, rank }) {
  const [width, setWidth] = useState(0);
  const d = getDim(dim.id);
  const meta = DIM_META[dim.id];

  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 200 + rank * 120);
    return () => clearTimeout(t);
  }, [score, rank]);

  return (
    <div className="cdr-dim-bar" style={{ '--dim-glow': d.glow, background: d.bg, border: `1px solid ${d.color}22`, borderRadius: 16, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{meta?.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{meta?.name}</span>
          {rank === 0 && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.5px', background: PAGE_ACCENT, color: '#fff', borderRadius: 6, padding: '2px 7px' }}>TOP 1</span>}
          {rank === 1 && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.5px', background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 6, padding: '2px 7px' }}>TOP 2</span>}
        </div>
        <span style={{ fontSize: 16, fontWeight: 800, color: d.color }}>{score}%</span>
      </div>
      <div style={{ height: 7, background: 'rgba(255,255,255,.06)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${width}%`, background: d.bar, borderRadius: 100, transition: 'width 1.1s cubic-bezier(.22,.68,0,1.1)', boxShadow: `0 0 10px ${d.glow}` }} />
      </div>
    </div>
  );
}

// ── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.cdr-root{font-family:'Space Grotesk',sans-serif;background:#0d0318;color:#fff;min-height:100vh;overflow-x:hidden;}
.cdr-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 70% 50% at 20% 10%,rgba(249,115,22,.08) 0%,transparent 65%),radial-gradient(ellipse 55% 55% at 80% 80%,rgba(249,115,22,.05) 0%,transparent 65%),radial-gradient(ellipse 40% 35% at 50% 45%,rgba(120,40,180,.07) 0%,transparent 65%);}
.cdr-glass{background:rgba(18,8,40,.65);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.06),0 8px 32px -4px rgba(0,0,0,.6);}
.cdr-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.16) 0%,rgba(249,115,22,.18) 35%,rgba(249,115,22,.08) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.cdr-hero{border-radius:24px;background:linear-gradient(155deg,rgba(249,115,22,.15) 0%,rgba(18,8,40,.9) 45%,rgba(5,2,15,.8) 100%);border:1px solid rgba(249,115,22,.22);box-shadow:0 0 0 1px rgba(249,115,22,.08),0 6px 48px -8px rgba(249,115,22,.35),inset 0 1px 0 rgba(255,255,255,.08);position:relative;overflow:hidden;}
.cdr-hero::before{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(249,115,22,.6),transparent);pointer-events:none;}
.cdr-job-card{border-radius:14px;background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.15);padding:16px 18px;transition:background .2s,border-color .2s;}
.cdr-job-card:hover{background:rgba(249,115,22,.1);border-color:rgba(249,115,22,.28);}
.cdr-course-card{border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:14px 16px;transition:background .2s,border-color .2s;}
.cdr-course-card:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14);}
.cdr-two-col{display:grid;grid-template-columns:1.55fr 1fr;gap:20px;margin-bottom:24px;align-items:start;}
@media(max-width:900px){.cdr-two-col{grid-template-columns:1fr;}}
.cdr-dim-bar{cursor:default;transition:transform .22s ease,box-shadow .22s ease;}
.cdr-dim-bar:hover{transform:translateY(-2px) scale(1.015);box-shadow:0 6px 28px -4px var(--dim-glow,rgba(249,115,22,.35));}
.cdr-dim-card{cursor:default;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;}
.cdr-dim-card:hover{transform:translateY(-3px);box-shadow:0 10px 36px -6px var(--dim-glow,rgba(249,115,22,.4));}
.cdr-jobs-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;}
@media(max-width:580px){.cdr-jobs-grid{grid-template-columns:1fr;}}
.cdr-courses-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;}
@media(max-width:580px){.cdr-courses-grid{grid-template-columns:1fr;}}
@keyframes cdFadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
.cdr-fade{animation:cdFadeUp .55s cubic-bezier(.22,.68,0,1) both;}
@keyframes spinCD{to{transform:rotate(360deg);}}
`;

// ── Main component ───────────────────────────────────────────────────────────
export default function CareerDnaResults() {
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [report,       setReport]       = useState(null);
  const [rawScores,    setRawScores]    = useState(null);
  const [aiData,       setAiData]       = useState(null);   // { opis, zawody, kursy, czego_unikac }
  const [aiLoading,    setAiLoading]    = useState(false);
  const [aiError,      setAiError]      = useState(null);
  const [aiRequested,  setAiRequested]  = useState(false);

  // Load test results from database
  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error('Nie jesteś zalogowany.');

      const { data: rows, error: dbErr } = await supabase
        .from('user_psychometrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('test_type', 'CAREER_DNA')
        .order('completed_at', { ascending: false })
        .limit(1);

      if (dbErr) throw dbErr;
      if (!rows || rows.length === 0) throw new Error('Nie znaleziono wyników testu DNA Kariery. Proszę wykonaj test ponownie.');

      const row = rows[0];
      const scoresData = row.raw_scores;
      setRawScores(scoresData);

      // Generate report client-side (same algo as during save)
      const calculatedReport = generateCareerDnaReport(scoresData);
      setReport(calculatedReport);

      setLoading(false);
    } catch (err) {
      console.error('Error loading Career DNA results:', err);
      setError(err.message || 'Błąd podczas ładowania wyników');
      setLoading(false);
    }
  };

  const fetchAiInsights = async () => {
    if (aiRequested) return;
    setAiRequested(true);
    setAiLoading(true);
    setAiError(null);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error('Brak sesji – zaloguj się ponownie.');

      const { data, error: fnErr } = await supabase.functions.invoke('interpret-test', {
        body: {
          test_type: 'CAREER_DNA',
          raw_scores: rawScores,
          report: report,
          force: false,
        },
        headers: { Authorization: `Bearer ${accessToken}`, apikey: SUPABASE_ANON_KEY },
      });

      if (fnErr) throw fnErr;

      // Try to parse JSON payload from interpretation string
      try {
        const parsed = typeof data.interpretation === 'string'
          ? JSON.parse(data.interpretation)
          : data.interpretation;
        setAiData(parsed);
      } catch {
        // Fallback: raw text
        setAiData({ opis: data.interpretation });
      }
    } catch (err) {
      console.error('AI insights error:', err);
      setAiError(err.message || 'Błąd generowania rekomendacji AI');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: '#0d0318', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
        <style>{`@keyframes spinCD{to{transform:rotate(360deg);}}`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: `3px solid rgba(249,115,22,.2)`, borderTop: `3px solid ${PAGE_ACCENT}`, borderRadius: '50%', animation: 'spinCD 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.95rem' }}>Wczytuję Twoje DNA Kariery...</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ background: '#0d0318', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Błąd</h2>
          <p style={{ color: 'rgba(255,255,255,.5)', marginBottom: 24 }}>{error}</p>
          <button onClick={() => window.location.href = '/user-profile-tests.html'}
            style={{ background: `linear-gradient(135deg,rgba(249,115,22,.8),${PAGE_ACCENT})`, border: 'none', borderRadius: 12, padding: '12px 28px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Wróć do Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const { profile_name, profile_emoji, profile_tagline, all_dimensions, top_dimensions } = report;
  const dimsSortedByScore = [...all_dimensions].sort((a, b) => b.value - a.value);

  return (
    <div className="cdr-root">
      <style>{CSS}</style>

      <ResultsScaffold
        accent={PAGE_ACCENT}
        navLabel="DNA KARIERY"
        badge="🧬 DNA Kariery"
        title={<>Twoje <span style={{ color: PAGE_ACCENT, textShadow: `0 0 24px ${ACCENT_GLOW}` }}>DNA Kariery</span></>}
        subtitle="Odkryj naturalny profil Twoich predyspozycji zawodowych."
        retakeHref="/test?type=career_dna"
        confirmMessage="Czy na pewno chcesz wykonać test DNA Kariery ponownie?"
      >

        {/* ── Profile hero card ──────────────────────────────────────────── */}
        <div className="cdr-hero cdr-fade" style={{ padding: '36px 40px', marginBottom: 24, animationDelay: '.05s' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            {/* emoji badge */}
            <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(249,115,22,.15)', border: '1px solid rgba(249,115,22,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0, boxShadow: `0 0 32px -8px ${ACCENT_GLOW}` }}>
              {profile_emoji}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: PAGE_ACCENT }}>Twój Profil Zawodowy</p>
              <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#fff' }}>{profile_name}</h1>
              <p style={{ margin: '0 0 20px', fontSize: '1rem', color: 'rgba(255,255,255,.6)', lineHeight: 1.55 }}>{profile_tagline}</p>
              {/* top 2 dim badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {top_dimensions.slice(0, 2).map((d, i) => (
                  <span key={d.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, background: getDim(d.id).bg, border: `1px solid ${getDim(d.id).color}33`, fontSize: 13, fontWeight: 700, color: getDim(d.id).color }}>
                    {d.icon} {d.name}
                    {i === 0 && <span style={{ fontSize: 10, opacity: .7 }}>· #1</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column: radar + bars ────────────────────────────────────── */}
        <div className="cdr-two-col cdr-fade" style={{ animationDelay: '.15s' }}>
          {/* radar column — bigger, left */}
          <div className="cdr-glass" style={{ padding: '28px 24px' }}>
            <h2 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,.85)', textAlign: 'center' }}>Radar Predyspozycji</h2>
            <HexRadar data={all_dimensions} />
          </div>

          {/* bars column — smaller, right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,.85)' }}>Profil Kompetencji</h2>
            {dimsSortedByScore.map((dim, i) => (
              <DimBar key={dim.id} dim={CAREER_DNA_TEST.dimensions.find(d => d.id === dim.id)} score={dim.value} rank={i} />
            ))}
          </div>
        </div>

        {/* ── Dimension detail cards ──────────────────────────────────────── */}
        <div className="cdr-fade" style={{ marginBottom: 24, animationDelay: '.25s' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,.85)' }}>Co oznaczają Twoje wymiary?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {dimsSortedByScore.map((dim) => {
              const meta = DIM_META[dim.id];
              const d = getDim(dim.id);
              return (
                <div key={dim.id} className="cdr-glass cdr-dim-card" style={{ '--dim-glow': getDim(dim.id).glow, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{meta?.icon}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: d.color }}>{meta?.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{meta?.name_en}</p>
                    </div>
                    <span style={{ marginLeft: 'auto', fontWeight: 800, fontSize: 18, color: d.color }}>{dim.value}%</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,.55)', lineHeight: 1.65 }}>{meta?.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── AI Insights section ─────────────────────────────────────────── */}
        <div className="cdr-glass cdr-fade" style={{ padding: '28px 32px', marginBottom: 24, animationDelay: '.35s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>🤖 Odkryj swoje zawody</h2>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,.45)' }}>Personalizowane rekomendacje zawodów i ścieżek kariery</p>
            </div>
            {!aiRequested && (
              <button
                onClick={fetchAiInsights}
                style={{ padding: '11px 24px', borderRadius: 12, background: `linear-gradient(135deg,rgba(249,115,22,.9),${PAGE_ACCENT})`, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 6px 24px -4px ${ACCENT_GLOW}`, transition: 'opacity .2s' }}
                onMouseOver={e => e.currentTarget.style.opacity = '.85'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                Generuj rekomendacje AI ✨
              </button>
            )}
          </div>

          {/* Loading */}
          {aiLoading && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 40, height: 40, border: `3px solid rgba(249,115,22,.2)`, borderTop: `3px solid ${PAGE_ACCENT}`, borderRadius: '50%', animation: 'spinCD 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>AI analizuje Twój profil kariery...</p>
            </div>
          )}

          {/* Error */}
          {aiError && (
            <div style={{ padding: 16, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 12, color: '#fca5a5', fontSize: 13 }}>
              {aiError}
              <button onClick={() => { setAiRequested(false); setAiError(null); }} style={{ marginLeft: 12, background: 'none', border: '1px solid rgba(239,68,68,.4)', borderRadius: 8, padding: '4px 10px', color: '#fca5a5', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>Spróbuj ponownie</button>
            </div>
          )}

          {/* AI Data */}
          {aiData && (
            <div style={{ animation: 'cdFadeUp .5s both' }}>
              {/* opis */}
              {aiData.opis && (
                <div style={{ marginBottom: 24, padding: '18px 20px', background: 'rgba(249,115,22,.07)', border: '1px solid rgba(249,115,22,.18)', borderRadius: 14 }}>
                  <p style={{ margin: 0, fontSize: 14.5, color: 'rgba(255,255,255,.78)', lineHeight: 1.75 }}>{aiData.opis}</p>
                </div>
              )}

              {/* zawody */}
              {aiData.zawody && aiData.zawody.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: '.9rem', fontWeight: 700, color: PAGE_ACCENT, textTransform: 'uppercase', letterSpacing: '.5px' }}>💼 Zawody dla Ciebie</h3>
                  <div className="cdr-jobs-grid">
                    {aiData.zawody.map((z, i) => (
                      <div key={i} className="cdr-job-card">
                        <p style={{ margin: '0 0 5px', fontWeight: 700, fontSize: 14, color: '#fff' }}>
                          <span style={{ color: PAGE_ACCENT, marginRight: 6 }}>{i + 1}.</span>{z.nazwa}
                        </p>
                        <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,.5)', lineHeight: 1.55 }}>{z.uzasadnienie}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* kursy */}
              {aiData.kursy && aiData.kursy.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: '.9rem', fontWeight: 700, color: 'rgba(255,255,255,.65)', textTransform: 'uppercase', letterSpacing: '.5px' }}>📚 Polecane kursy</h3>
                  <div className="cdr-courses-grid">
                    {aiData.kursy.map((k, i) => (
                      <div key={i} className="cdr-course-card">
                        <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 13.5, color: '#fff' }}>{k.nazwa}</p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                          {k.platforma && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)' }}>{k.platforma}</span>}
                          {k.poziom    && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(249,115,22,.12)', color: PAGE_ACCENT }}>{k.poziom}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* czego unikac */}
              {aiData.czego_unikac && (
                <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.18)', borderRadius: 12 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'rgba(239,68,68,.75)' }}>⚠️ Czego unikać</p>
                  <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,.6)', lineHeight: 1.65 }}>{aiData.czego_unikac}</p>
                </div>
              )}
            </div>
          )}

          {/* Placeholder when not yet requested */}
          {!aiRequested && !aiLoading && (
            <div style={{ textAlign: 'center', padding: '28px 0', borderTop: '1px solid rgba(255,255,255,.06)' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,.28)' }}>Kliknij przycisk powyżej, aby wygenerować spersonalizowane rekomendacje zawodów, kursów i wskazówek kariery.</p>
            </div>
          )}
        </div>

        {/* ── Footer actions ──────────────────────────────────────────────── */}
        <ResultsFooterActions
          dashboardHref="/user-profile-tests.html"
          retakeHref="/test?type=career_dna"
          confirmMessage="Czy na pewno chcesz wykonać test DNA Kariery ponownie?"
        />

      </ResultsScaffold>
    </div>
  );
}
