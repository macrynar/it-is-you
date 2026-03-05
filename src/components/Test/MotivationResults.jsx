import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { generateMotivationReport } from '../../utils/scoring.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';

const PAGE_ACCENT = '#10b981';

const DIM_META = {
  power:       { color: '#f59e0b', grad: 'linear-gradient(90deg,#78350f,#f59e0b)', glow: 'rgba(245,158,11,.55)', bg: 'rgba(245,158,11,.08)',  emoji: '👑' },
  affiliation: { color: '#ec4899', grad: 'linear-gradient(90deg,#4a0d25,#ec4899)', glow: 'rgba(236,72,153,.55)', bg: 'rgba(236,72,153,.08)',   emoji: '🫂' },
  achievement: { color: '#f97316', grad: 'linear-gradient(90deg,#7c2d12,#f97316)', glow: 'rgba(249,115,22,.55)', bg: 'rgba(249,115,22,.08)',   emoji: '🏆' },
  security:    { color: '#6366f1', grad: 'linear-gradient(90deg,#1e1b4b,#6366f1)', glow: 'rgba(99,102,241,.55)', bg: 'rgba(99,102,241,.08)',   emoji: '🛡️' },
  autonomy:    { color: '#06b6d4', grad: 'linear-gradient(90deg,#164e63,#06b6d4)', glow: 'rgba(6,182,212,.55)',  bg: 'rgba(6,182,212,.08)',    emoji: '🦅' },
  meaning:     { color: '#a78bfa', grad: 'linear-gradient(90deg,#2e1065,#a78bfa)', glow: 'rgba(167,139,250,.55)', bg: 'rgba(167,139,250,.08)', emoji: '🌟' },
  recognition: { color: '#fcd34d', grad: 'linear-gradient(90deg,#713f12,#fcd34d)', glow: 'rgba(252,211,77,.45)', bg: 'rgba(252,211,77,.07)',   emoji: '🎖️' },
  discovery:   { color: '#10b981', grad: 'linear-gradient(90deg,#064e3b,#10b981)', glow: 'rgba(16,185,129,.55)', bg: 'rgba(16,185,129,.08)',   emoji: '🔭' },
};

function DriveBar({ drive, idx, isTop, isShadow }) {
  const [w, setW] = useState(0);
  const m = DIM_META[drive.id] || DIM_META.discovery;
  const pct = Math.round(((drive.score - 1) / 4) * 100);
  useEffect(() => { const t = setTimeout(() => setW(pct), 200 + idx * 100); return () => clearTimeout(t); }, [pct, idx]);
  return (
    <div style={{
      background: m.bg,
      border: `1px solid ${isTop ? m.color : isShadow ? 'rgba(239,68,68,.3)' : m.glow}`,
      borderRadius: 14,
      padding: '14px 18px',
      marginBottom: 10,
      position: 'relative',
      ...(isTop ? { boxShadow: `0 0 20px ${m.glow}` } : {}),
    }}>
      {isTop && <div style={{ position: 'absolute', top: -8, right: 12, background: m.color, color: '#000', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 100, letterSpacing: 1 }}>TOP DRIVE</div>}
      {isShadow && <div style={{ position: 'absolute', top: -8, right: 12, background: 'rgba(239,68,68,.8)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 100, letterSpacing: 1 }}>CIEŃ</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{m.emoji}</span>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{drive.name}</div>
        </div>
        <span style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{drive.score?.toFixed ? drive.score.toFixed(1) : drive.score}<span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>/5</span></span>
      </div>
      <div style={{ height: 7, borderRadius: 100, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: m.grad, borderRadius: 100, transition: 'width 1.2s cubic-bezier(.22,.68,0,1.1)', boxShadow: `0 0 8px ${m.glow}` }} />
      </div>
    </div>
  );
}

export default function MotivationResults() {
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
          .eq('test_type', 'MOTIVATION')
          .order('completed_at', { ascending: false })
          .limit(1);
        if (dbErr) throw dbErr;
        if (!rows || rows.length === 0) { window.location.href = '/user-profile-tests.html'; return; }
        const row = rows[0];
        const report = row.report || generateMotivationReport({
          raw_scores: row.raw_scores?.raw_scores || {},
          top_drives: row.raw_scores?.top_drives || [],
          shadow_drive: row.raw_scores?.shadow_drive || null,
          sorted_drives: row.raw_scores?.sorted_drives || [],
          test_id: row.test_id, test_name: 'Silnik Motywacji', completed_at: row.completed_at,
        });
        setData({ report, row });
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    fetchResults();
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', background: '#060f0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Ładowanie wyników...</div>;
  if (error) return <div style={{ minHeight: '100vh', background: '#060f0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>Błąd: {error}</div>;
  if (!data) return null;

  const { report, row } = data;
  const topIds = new Set(report.top_drives?.map(d => d.id) || []);
  const shadowId = report.shadow_drive?.id;

  return (
    <ResultsScaffold accent={PAGE_ACCENT}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", background: '#060f0a', minHeight: '100vh', color: '#fff', padding: isMobile ? '24px 16px' : '40px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 100, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', fontSize: 12, color: PAGE_ACCENT, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
              Silnik Motywacji
            </div>
            <h1 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
              Twoje{' '}
              <span style={{ color: PAGE_ACCENT, textShadow: '0 0 30px rgba(16,185,129,.5)' }}>Główne Napędy</span>
            </h1>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
              {report.top_drives?.map(d => {
                const m = DIM_META[d.id] || DIM_META.discovery;
                return (
                  <div key={d.id} style={{ padding: '6px 14px', borderRadius: 100, background: m.bg, border: `1px solid ${m.color}`, fontSize: 13, fontWeight: 700, color: m.color }}>
                    {m.emoji} {d.name}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 3 */}
          {report.top_drives?.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,.8)' }}>🌟 Top 3 Napędy</h2>
              {report.top_drives.map((d, i) => <DriveBar key={d.id} drive={d} idx={i} isTop isShadow={false} />)}
            </div>
          )}

          {/* All drives full ranking */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,.8)' }}>Pełny Ranking 8 Napędów</h2>
            {report.sorted_drives?.map((d, i) => (
              <DriveBar key={d.id} drive={d} idx={i} isTop={false} isShadow={d.id === shadowId} />
            ))}
          </div>

          {/* Shadow drive info */}
          {report.shadow_drive && (
            <div style={{ background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 16, padding: '20px', marginBottom: 32 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f87171', marginBottom: 8 }}>⚠️ Cień Motywacyjny: {DIM_META[report.shadow_drive.id]?.emoji} {report.shadow_drive.name}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>Najsłabszy napęd — obszary z potencjałem do uwagi lub świadomej integracji.</div>
            </div>
          )}

          <AiInterpretation
            testType="MOTIVATION"
            testId={row.test_id}
            userId={row.user_id}
            reportData={report}
            accent={PAGE_ACCENT}
            promptVersion={PROMPT_VERSION}
          />

          <ResultsFooterActions accent={PAGE_ACCENT} testType="motivation_engine" />
        </div>
      </div>
    </ResultsScaffold>
  );
}
