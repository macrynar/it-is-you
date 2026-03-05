import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { generateEQReport } from '../../utils/scoring.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';

const PAGE_ACCENT = '#06b6d4';

const DIM_META = {
  self_awareness:  { color: '#06b6d4', grad: 'linear-gradient(90deg,#164e63,#06b6d4)', glow: 'rgba(6,182,212,.55)', bg: 'rgba(6,182,212,.08)' },
  self_regulation: { color: '#0ea5e9', grad: 'linear-gradient(90deg,#0c4a6e,#0ea5e9)', glow: 'rgba(14,165,233,.55)', bg: 'rgba(14,165,233,.08)' },
  empathy:         { color: '#38bdf8', grad: 'linear-gradient(90deg,#075985,#38bdf8)', glow: 'rgba(56,189,248,.55)', bg: 'rgba(56,189,248,.08)' },
  social_skills:   { color: '#67e8f9', grad: 'linear-gradient(90deg,#155e75,#67e8f9)', glow: 'rgba(103,232,249,.45)', bg: 'rgba(103,232,249,.08)' },
  motivation:      { color: '#22d3ee', grad: 'linear-gradient(90deg,#134e4a,#22d3ee)', glow: 'rgba(34,211,238,.55)', bg: 'rgba(34,211,238,.08)' },
};

function ScoreBar({ dim, pct, idx }) {
  const [w, setW] = useState(0);
  const m = DIM_META[dim.id] || DIM_META.self_awareness;
  useEffect(() => { const t = setTimeout(() => setW(pct), 200 + idx * 120); return () => clearTimeout(t); }, [pct, idx]);
  return (
    <div style={{ background: m.bg, border: `1px solid ${m.glow}`, borderRadius: 16, padding: '18px 22px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{dim.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{dim.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>{dim.description}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{dim.raw_score?.toFixed ? dim.raw_score.toFixed(1) : dim.raw_score}</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>/5</span>
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 100, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: m.grad, borderRadius: 100, transition: 'width 1.2s cubic-bezier(.22,.68,0,1.1)', boxShadow: `0 0 10px ${m.glow}` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,.3)' }}>
        <span>Niski</span><span style={{ color: m.color, fontWeight: 700 }}>{dim.level_label}</span><span>Wysoki</span>
      </div>
    </div>
  );
}

export default function EqResults() {
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
          .eq('test_type', 'EQ')
          .order('completed_at', { ascending: false })
          .limit(1);
        if (dbErr) throw dbErr;
        if (!rows || rows.length === 0) { window.location.href = '/user-profile-tests.html'; return; }
        const row = rows[0];
        const report = row.report || generateEQReport({ raw_scores: row.raw_scores?.raw_scores || {}, percentile_scores: row.raw_scores?.percentile_scores || {}, total_eq: row.raw_scores?.total_eq || 0, test_id: row.test_id, test_name: 'EQ', completed_at: row.completed_at });
        setData({ report, row });
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    fetchResults();
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Ładowanie wyników...</div>;
  if (error) return <div style={{ minHeight: '100vh', background: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>Błąd: {error}</div>;
  if (!data) return null;

  const { report, row } = data;
  const totalPct = Math.round(((report.total_eq - 1) / 4) * 100);

  return (
    <ResultsScaffold accent={PAGE_ACCENT}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", background: '#0a0f1a', minHeight: '100vh', color: '#fff', padding: isMobile ? '24px 16px' : '40px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 100, background: 'rgba(6,182,212,.12)', border: '1px solid rgba(6,182,212,.3)', fontSize: 12, color: PAGE_ACCENT, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
              Inteligencja Emocjonalna
            </div>
            <h1 style={{ fontSize: isMobile ? 32 : 44, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
              Twoje EQ:{' '}
              <span style={{ color: PAGE_ACCENT, textShadow: `0 0 30px rgba(6,182,212,.5)` }}>
                {report.total_eq?.toFixed(1) ?? '—'}/5.0
              </span>
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)' }}>Poziom ogólny: <strong style={{ color: PAGE_ACCENT }}>{report.eq_level_label}</strong></p>

            {/* EQ ring */}
            <div style={{ margin: '32px auto', width: 140, height: 140, borderRadius: '50%', background: `conic-gradient(${PAGE_ACCENT} ${totalPct * 3.6}deg, rgba(255,255,255,.07) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px rgba(6,182,212,.3)` }}>
              <div style={{ width: 110, height: 110, borderRadius: '50%', background: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: PAGE_ACCENT }}>{totalPct}%</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>percentyl</span>
              </div>
            </div>
          </div>

          {/* Dimension bars */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'rgba(255,255,255,.8)' }}>Profil 5 Wymiarów EQ</h2>
            {report.dimensions?.map((dim, i) => (
              <ScoreBar key={dim.id} dim={dim} pct={dim.percentile ?? 0} idx={i} />
            ))}
          </div>

          {/* AI Interpretation */}
          <AiInterpretation
            testType="EQ"
            testId={row.test_id}
            userId={row.user_id}
            reportData={report}
            accent={PAGE_ACCENT}
            promptVersion={PROMPT_VERSION}
          />

          <ResultsFooterActions accent={PAGE_ACCENT} testType="emotional_intelligence" />
        </div>
      </div>
    </ResultsScaffold>
  );
}
