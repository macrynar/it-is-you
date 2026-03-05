import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { generateMentalToughnessReport } from '../../utils/scoring.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';

const PAGE_ACCENT = '#f59e0b';

const DIM_META = {
  control:    { color: '#f59e0b', grad: 'linear-gradient(90deg,#78350f,#f59e0b)', glow: 'rgba(245,158,11,.55)', bg: 'rgba(245,158,11,.08)',  emoji: '🎯' },
  commitment: { color: '#fb923c', grad: 'linear-gradient(90deg,#7c2d12,#fb923c)', glow: 'rgba(251,146,60,.55)',  bg: 'rgba(251,146,60,.08)',   emoji: '💪' },
  challenge:  { color: '#fbbf24', grad: 'linear-gradient(90deg,#713f12,#fbbf24)', glow: 'rgba(251,191,36,.45)',  bg: 'rgba(251,191,36,.08)',   emoji: '⛰️' },
  confidence: { color: '#fcd34d', grad: 'linear-gradient(90deg,#78350f,#fcd34d)', glow: 'rgba(252,211,77,.4)',   bg: 'rgba(252,211,77,.06)',   emoji: '🦁' },
};

function FourCCard({ dim, idx }) {
  const [w, setW] = useState(0);
  const m = DIM_META[dim.id] || DIM_META.control;
  const pct = dim.percentile ?? 0;
  useEffect(() => { const t = setTimeout(() => setW(pct), 200 + idx * 130); return () => clearTimeout(t); }, [pct, idx]);
  return (
    <div style={{ background: m.bg, border: `1px solid ${m.glow}`, borderRadius: 16, padding: '18px 22px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{m.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{dim.name} <span style={{ fontSize: 12, color: m.color, fontWeight: 600 }}>(C)</span></div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>{dim.description}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{dim.raw_score?.toFixed ? dim.raw_score.toFixed(1) : dim.raw_score}<span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>/5</span></div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{dim.level_label}</div>
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 100, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: m.grad, borderRadius: 100, transition: 'width 1.2s cubic-bezier(.22,.68,0,1.1)', boxShadow: `0 0 10px ${m.glow}` }} />
      </div>
    </div>
  );
}

export default function MentalToughnessResults() {
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
          .eq('test_type', 'MENTAL_TOUGHNESS')
          .order('completed_at', { ascending: false })
          .limit(1);
        if (dbErr) throw dbErr;
        if (!rows || rows.length === 0) { window.location.href = '/user-profile-tests.html'; return; }
        const row = rows[0];
        const report = row.report || generateMentalToughnessReport({
          raw_scores: row.raw_scores?.raw_scores || {},
          percentile_scores: row.raw_scores?.percentile_scores || {},
          total_mt: row.raw_scores?.total_mt || 0,
          test_id: row.test_id, test_name: 'Odporność Psychiczna', completed_at: row.completed_at,
        });
        setData({ report, row });
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    fetchResults();
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', background: '#0d0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Ładowanie wyników...</div>;
  if (error) return <div style={{ minHeight: '100vh', background: '#0d0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>Błąd: {error}</div>;
  if (!data) return null;

  const { report, row } = data;
  const totalPct = Math.round(((report.total_mt - 1) / 4) * 100);

  return (
    <ResultsScaffold accent={PAGE_ACCENT}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", background: '#0d0a1a', minHeight: '100vh', color: '#fff', padding: isMobile ? '24px 16px' : '40px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 100, background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.3)', fontSize: 12, color: PAGE_ACCENT, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
              Odporność Psychiczna 4C
            </div>
            <h1 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
              MT Score:{' '}
              <span style={{ color: PAGE_ACCENT, textShadow: '0 0 30px rgba(245,158,11,.5)' }}>
                {report.total_mt?.toFixed ? report.total_mt.toFixed(1) : report.total_mt}/5.0
              </span>
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)' }}>Poziom ogólny: <strong style={{ color: PAGE_ACCENT }}>{report.mt_level_label}</strong></p>

            {/* total gauge */}
            <div style={{ margin: '32px auto', width: 140, height: 140, borderRadius: '50%', background: `conic-gradient(${PAGE_ACCENT} ${totalPct * 3.6}deg, rgba(255,255,255,.07) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px rgba(245,158,11,.3)` }}>
              <div style={{ width: 110, height: 110, borderRadius: '50%', background: '#0d0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: PAGE_ACCENT }}>{totalPct}%</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>ogólny</span>
              </div>
            </div>
          </div>

          {/* 4C cards */}
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'rgba(255,255,255,.8)' }}>Model 4C — Cztery Filary Odporności</h2>
            {report.dimensions?.map((dim, i) => (
              <FourCCard key={dim.id} dim={dim} idx={i} />
            ))}
          </div>

          <AiInterpretation
            testType="MENTAL_TOUGHNESS"
            testId={row.test_id}
            userId={row.user_id}
            reportData={report}
            accent={PAGE_ACCENT}
            promptVersion={PROMPT_VERSION}
          />

          <ResultsFooterActions accent={PAGE_ACCENT} testType="mental_toughness" />
        </div>
      </div>
    </ResultsScaffold>
  );
}
