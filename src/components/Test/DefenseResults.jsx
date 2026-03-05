import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { generateDefenseReport } from '../../utils/scoring.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';

const PAGE_ACCENT = '#8b5cf6';

const DIM_META = {
  mature:    { color: '#10b981', grad: 'linear-gradient(90deg,#064e3b,#10b981)', glow: 'rgba(16,185,129,.55)', bg: 'rgba(16,185,129,.08)',  emoji: '🌱', label: 'Dojrzałe' },
  neurotic:  { color: '#f59e0b', grad: 'linear-gradient(90deg,#78350f,#f59e0b)', glow: 'rgba(245,158,11,.55)',  bg: 'rgba(245,158,11,.08)',   emoji: '🌀', label: 'Neurotyczne' },
  immature:  { color: '#ef4444', grad: 'linear-gradient(90deg,#7f1d1d,#ef4444)', glow: 'rgba(239,68,68,.55)',   bg: 'rgba(239,68,68,.08)',    emoji: '⚡', label: 'Niedojrzałe' },
  primitive: { color: '#8b5cf6', grad: 'linear-gradient(90deg,#2e1065,#8b5cf6)', glow: 'rgba(139,92,246,.55)', bg: 'rgba(139,92,246,.08)',   emoji: '🔥', label: 'Prymitywne' },
};

function DefBar({ mech, idx }) {
  const [w, setW] = useState(0);
  const m = DIM_META[mech.id] || DIM_META.mature;
  const pct = Math.round(((mech.score - 1) / 4) * 100);
  useEffect(() => { const t = setTimeout(() => setW(pct), 200 + idx * 130); return () => clearTimeout(t); }, [pct, idx]);
  return (
    <div style={{ background: m.bg, border: `1px solid ${m.glow}`, borderRadius: 16, padding: '18px 22px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{m.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{mech.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>{mech.description}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{mech.score?.toFixed ? mech.score.toFixed(1) : mech.score}</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>/5</span>
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 100, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: m.grad, borderRadius: 100, transition: 'width 1.2s cubic-bezier(.22,.68,0,1.1)', boxShadow: `0 0 10px ${m.glow}` }} />
      </div>
    </div>
  );
}

function MaturityGauge({ index }) {
  const [filled, setFilled] = useState(0);
  // maturity_index typically in range -2 to +2; map to 0-100%
  const pct = Math.min(100, Math.max(0, ((index + 2.5) / 5) * 100));
  const color = index >= 1.5 ? '#10b981' : index >= 0 ? '#f59e0b' : '#ef4444';
  const label = index >= 1.5 ? 'Dojrzały' : index >= 0 ? 'Mieszany' : 'Niedojrzały';
  useEffect(() => { const t = setTimeout(() => setFilled(pct), 300); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.25)', borderRadius: 20, padding: '24px', marginBottom: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Indeks Dojrzałości</div>
      <div style={{ fontSize: 36, fontWeight: 800, color, marginBottom: 8 }}>{index >= 0 ? '+' : ''}{index?.toFixed ? index.toFixed(2) : index}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 16 }}>{label} profil obrony</div>
      <div style={{ height: 10, borderRadius: 100, background: 'rgba(255,255,255,.08)', overflow: 'hidden', maxWidth: 400, margin: '0 auto' }}>
        <div style={{ height: '100%', width: `${filled}%`, background: `linear-gradient(90deg, #ef4444, ${color})`, borderRadius: 100, transition: 'width 1.3s cubic-bezier(.22,.68,0,1.1)' }} />
      </div>
    </div>
  );
}

export default function DefenseResults() {
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
          .eq('test_type', 'DEFENSE')
          .order('completed_at', { ascending: false })
          .limit(1);
        if (dbErr) throw dbErr;
        if (!rows || rows.length === 0) { window.location.href = '/user-profile-tests.html'; return; }
        const row = rows[0];
        const report = row.report || generateDefenseReport({
          raw_scores: row.raw_scores?.raw_scores || {},
          maturity_index: row.raw_scores?.maturity_index ?? 0,
          sorted_mechanisms: row.raw_scores?.sorted_mechanisms || [],
          dominant_mechanism: row.raw_scores?.sorted_mechanisms?.[0] || null,
          test_id: row.test_id, test_name: 'Mechanizmy Obronne', completed_at: row.completed_at,
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

  return (
    <ResultsScaffold accent={PAGE_ACCENT}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", background: '#0d0a1a', minHeight: '100vh', color: '#fff', padding: isMobile ? '24px 16px' : '40px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 100, background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.3)', fontSize: 12, color: PAGE_ACCENT, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
              Mechanizmy Obronne
            </div>
            <h1 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
              Twój Profil{' '}
              <span style={{ color: PAGE_ACCENT, textShadow: '0 0 30px rgba(139,92,246,.5)' }}>Psychologicznej Obrony</span>
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)' }}>Dominujący mechanizm: <strong style={{ color: DIM_META[report.dominant_mechanism?.id]?.color || PAGE_ACCENT }}>{report.dominant_mechanism?.name || '—'}</strong></p>
          </div>

          <MaturityGauge index={report.maturity_index ?? 0} />

          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'rgba(255,255,255,.8)' }}>Hierarchia Mechanizmów Obronnych</h2>
            {report.sorted_mechanisms?.map((mech, i) => (
              <DefBar key={mech.id} mech={mech} idx={i} />
            ))}
          </div>

          <AiInterpretation
            testType="DEFENSE"
            testId={row.test_id}
            userId={row.user_id}
            reportData={report}
            accent={PAGE_ACCENT}
            promptVersion={PROMPT_VERSION}
          />

          <ResultsFooterActions accent={PAGE_ACCENT} testType="defense_mechanisms" />
        </div>
      </div>
    </ResultsScaffold>
  );
}
