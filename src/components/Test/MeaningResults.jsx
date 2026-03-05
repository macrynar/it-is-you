import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { generateMeaningReport } from '../../utils/scoring.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';

const PAGE_ACCENT = '#a78bfa';

const DIM_META = {
  purpose:      { color: '#a78bfa', grad: 'linear-gradient(90deg,#2e1065,#a78bfa)', glow: 'rgba(167,139,250,.55)', bg: 'rgba(167,139,250,.08)', emoji: '🧭' },
  transcendence:{ color: '#c4b5fd', grad: 'linear-gradient(90deg,#3b0764,#c4b5fd)', glow: 'rgba(196,181,253,.45)', bg: 'rgba(196,181,253,.07)', emoji: '✨' },
  existential:  { color: '#818cf8', grad: 'linear-gradient(90deg,#1e1b4b,#818cf8)', glow: 'rgba(129,140,248,.55)', bg: 'rgba(129,140,248,.08)', emoji: '⚖️' },
  connection:   { color: '#e879f9', grad: 'linear-gradient(90deg,#4a044e,#e879f9)', glow: 'rgba(232,121,249,.5)',  bg: 'rgba(232,121,249,.08)', emoji: '🕸️' },
};

function MeaningBar({ dim, idx }) {
  const [w, setW] = useState(0);
  const m = DIM_META[dim.id] || DIM_META.purpose;
  const pct = dim.percentile ?? 0;
  useEffect(() => { const t = setTimeout(() => setW(pct), 200 + idx * 130); return () => clearTimeout(t); }, [pct, idx]);
  return (
    <div style={{ background: m.bg, border: `1px solid ${m.glow}`, borderRadius: 16, padding: '18px 22px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{m.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{dim.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>{dim.description}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{dim.raw_score?.toFixed ? dim.raw_score.toFixed(1) : dim.raw_score}</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>/6</span>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{dim.level_label}</div>
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 100, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: m.grad, borderRadius: 100, transition: 'width 1.2s cubic-bezier(.22,.68,0,1.1)', boxShadow: `0 0 10px ${m.glow}` }} />
      </div>
    </div>
  );
}

export default function MeaningResults() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = '/auth'; return; }
        const { data: rows, error: dbErr } = await supabase
          .from('user_psychometrics')
          .select('*')
          .eq('user_id', user.id)
          .eq('test_type', 'MEANING')
          .order('completed_at', { ascending: false })
          .limit(1);
        if (dbErr) throw dbErr;
        if (!rows || rows.length === 0) { window.location.href = '/user-profile-tests.html'; return; }
        const row = rows[0];
        const report = row.report || generateMeaningReport({
          raw_scores: row.raw_scores?.raw_scores || {},
          percentile_scores: row.raw_scores?.percentile_scores || {},
          total_meaning: row.raw_scores?.total_meaning || 0,
          test_id: row.test_id, test_name: 'Sens i Duchowość', completed_at: row.completed_at,
        });
        setData({ report, row });
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    fetchResults();
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0414', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Ładowanie wyników...</div>;
  if (error) return <div style={{ minHeight: '100vh', background: '#0a0414', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>Błąd: {error}</div>;
  if (!data) return null;

  const { report, row } = data;
  const totalPct = Math.round(((report.total_meaning - 1) / 5) * 100);

  return (
    <ResultsScaffold accent={PAGE_ACCENT}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", background: '#0a0414', minHeight: '100vh', color: '#fff', padding: isMobile ? '24px 16px' : '40px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 100, background: 'rgba(167,139,250,.12)', border: '1px solid rgba(167,139,250,.3)', fontSize: 12, color: PAGE_ACCENT, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
              Sens i Duchowość
            </div>
            <h1 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
              Twój Wymiar{' '}
              <span style={{ color: PAGE_ACCENT, textShadow: '0 0 30px rgba(167,139,250,.5)' }}>Sensu i Transcendencji</span>
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)' }}>
              Wynik ogólny: <strong style={{ color: PAGE_ACCENT }}>{report.total_meaning?.toFixed ? report.total_meaning.toFixed(1) : '—'}/6.0</strong> — poziom: <strong style={{ color: PAGE_ACCENT }}>{report.meaning_level_label}</strong>
            </p>

            {/* ring */}
            <div style={{ margin: '32px auto', width: 140, height: 140, borderRadius: '50%', background: `conic-gradient(${PAGE_ACCENT} ${totalPct * 3.6}deg, rgba(255,255,255,.07) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(167,139,250,.3)' }}>
              <div style={{ width: 110, height: 110, borderRadius: '50%', background: '#0a0414', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: PAGE_ACCENT }}>{totalPct}%</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>ogólny</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'rgba(255,255,255,.8)' }}>Cztery Wymiary Sensu</h2>
            {report.dimensions?.map((dim, i) => (
              <MeaningBar key={dim.id} dim={dim} idx={i} />
            ))}
          </div>

          <AiInterpretation
            testType="MEANING"
            testId={row.test_id}
            userId={row.user_id}
            reportData={report}
            accent={PAGE_ACCENT}
            promptVersion={PROMPT_VERSION}
          />

          <ResultsFooterActions accent={PAGE_ACCENT} testType="meaning_spirituality" />
        </div>
      </div>
    </ResultsScaffold>
  );
}
