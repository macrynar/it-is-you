import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { generateAttachmentReport } from '../../utils/scoring.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';

const PAGE_ACCENT = '#ec4899';

const DIM_META = {
  secure:       { color: '#10b981', grad: 'linear-gradient(90deg,#064e3b,#10b981)', glow: 'rgba(16,185,129,.55)', bg: 'rgba(16,185,129,.08)',  emoji: '🏡', desc: 'Komfort z bliskością i niezależnością' },
  anxious:      { color: '#f59e0b', grad: 'linear-gradient(90deg,#78350f,#f59e0b)', glow: 'rgba(245,158,11,.55)',  bg: 'rgba(245,158,11,.08)',   emoji: '😟', desc: 'Intensywna potrzeba bliskości, lęk przed porzuceniem' },
  avoidant:     { color: '#6366f1', grad: 'linear-gradient(90deg,#1e1b4b,#6366f1)', glow: 'rgba(99,102,241,.55)', bg: 'rgba(99,102,241,.08)',   emoji: '🚪', desc: 'Dyskomfort wobec bliskości, potrzeba niezależności' },
  disorganized: { color: '#ec4899', grad: 'linear-gradient(90deg,#4a0d25,#ec4899)', glow: 'rgba(236,72,153,.55)', bg: 'rgba(236,72,153,.08)',   emoji: '🌀', desc: 'Niespójne wzorce, trudność w regulacji emocji' },
};

function StyleBar({ styleId, name, score, maxScore, idx }) {
  const [w, setW] = useState(0);
  const m = DIM_META[styleId] || DIM_META.secure;
  const pct = Math.round(((score - 1) / 5) * 100);
  useEffect(() => { const t = setTimeout(() => setW(pct), 200 + idx * 130); return () => clearTimeout(t); }, [pct, idx]);
  return (
    <div style={{ background: m.bg, border: `1px solid ${m.glow}`, borderRadius: 16, padding: '18px 22px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{m.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>{m.desc}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{score?.toFixed ? score.toFixed(1) : score}</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>/6</span>
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 100, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: m.grad, borderRadius: 100, transition: 'width 1.2s cubic-bezier(.22,.68,0,1.1)', boxShadow: `0 0 10px ${m.glow}` }} />
      </div>
    </div>
  );
}

export default function AttachmentResults() {
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
          .eq('test_type', 'ATTACHMENT')
          .order('completed_at', { ascending: false })
          .limit(1);
        if (dbErr) throw dbErr;
        if (!rows || rows.length === 0) { window.location.href = '/user-profile-tests.html'; return; }
        const row = rows[0];
        const report = row.report || generateAttachmentReport({
          raw_scores: row.raw_scores?.raw_scores || {},
          dominant_style: row.raw_scores?.dominant_style || {},
          sorted_styles: row.raw_scores?.sorted_styles || [],
          test_id: row.test_id, test_name: 'Styl Przywiązania', completed_at: row.completed_at,
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
  const dominant = report.dominant_style;
  const domMeta = dominant ? DIM_META[dominant.id] : DIM_META.secure;

  return (
    <ResultsScaffold accent={PAGE_ACCENT}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", background: '#0d0a1a', minHeight: '100vh', color: '#fff', padding: isMobile ? '24px 16px' : '40px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 100, background: 'rgba(236,72,153,.12)', border: '1px solid rgba(236,72,153,.3)', fontSize: 12, color: PAGE_ACCENT, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
              Styl Przywiązania
            </div>
            <h1 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
              {domMeta?.emoji} Styl{' '}
              <span style={{ color: domMeta?.color || PAGE_ACCENT, textShadow: `0 0 30px ${domMeta?.glow || 'rgba(236,72,153,.5)'}` }}>
                {dominant?.name || '—'}
              </span>
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', maxWidth: 480, margin: '0 auto' }}>
              {domMeta?.desc}
            </p>
          </div>

          {/* Dominant style card */}
          {dominant && (
            <div style={{ background: `${domMeta.bg}`, border: `1px solid ${domMeta.glow}`, borderRadius: 20, padding: '28px', marginBottom: 32, textAlign: 'center', boxShadow: `0 0 40px ${domMeta.glow}` }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{domMeta.emoji}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: domMeta.color, marginBottom: 8 }}>Dominujący: {dominant.name}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,.6)' }}>{dominant.description}</div>
              <div style={{ marginTop: 16, fontSize: 28, fontWeight: 800, color: domMeta.color }}>{dominant.score?.toFixed(1)}<span style={{ fontSize: 14, color: 'rgba(255,255,255,.4)' }}>/6.0</span></div>
            </div>
          )}

          {/* All styles */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'rgba(255,255,255,.8)' }}>Profil Wszystkich Stylów</h2>
            {report.sorted_styles?.map((s, i) => (
              <StyleBar key={s.id} styleId={s.id} name={s.name} score={s.score} idx={i} />
            ))}
          </div>

          <AiInterpretation
            testType="ATTACHMENT"
            testId={row.test_id}
            userId={row.user_id}
            reportData={report}
            accent={PAGE_ACCENT}
            promptVersion={PROMPT_VERSION}
          />

          <ResultsFooterActions accent={PAGE_ACCENT} testType="attachment_style" />
        </div>
      </div>
    </ResultsScaffold>
  );
}
