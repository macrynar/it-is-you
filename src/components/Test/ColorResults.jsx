import React, { useState, useEffect } from 'react';
import { getAccessToken, SUPABASE_ANON_KEY, supabase } from '../../lib/supabaseClient.js';
import { COLOR_PERSONALITY_TEST } from '../../data/tests/colorPersonality.js';
import { PROMPT_VERSION } from '../../utils/promptVersion.js';
import AiInterpretation from './AiInterpretation.jsx';
import ResultsFooterActions from './modules/ResultsFooterActions.jsx';
import ResultsScaffold from './modules/ResultsScaffold.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';

const PAGE_ACCENT = '#E63946';

// Display accent palette per color (UI-optimised brightness for dark backgrounds)
const COLOR_ACCENT = {
  red: {
    color:    '#E63946',
    colorMid: '#ff6b6b',
    gradient: 'linear-gradient(90deg,#7f0012,#E63946)',
    glow:     'rgba(230,57,70,.55)',
    blob:     '#E63946',
    hover:    'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(230,57,70,.4),0 0 30px -4px rgba(230,57,70,.3),0 16px 48px -6px rgba(0,0,0,.7)',
    bg:       'rgba(230,57,70,.08)',
    border:   'rgba(230,57,70,.28)',
  },
  yellow: {
    color:    '#FFB703',
    colorMid: '#ffd60a',
    gradient: 'linear-gradient(90deg,#7a4d00,#FFB703)',
    glow:     'rgba(255,183,3,.55)',
    blob:     '#FFB703',
    hover:    'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(255,183,3,.4),0 0 30px -4px rgba(255,183,3,.3),0 16px 48px -6px rgba(0,0,0,.7)',
    bg:       'rgba(255,183,3,.08)',
    border:   'rgba(255,183,3,.28)',
  },
  green: {
    color:    '#34d399',
    colorMid: '#6ee7b7',
    gradient: 'linear-gradient(90deg,#064e3b,#34d399)',
    glow:     'rgba(52,211,153,.55)',
    blob:     '#34d399',
    hover:    'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(52,211,153,.4),0 0 30px -4px rgba(52,211,153,.3),0 16px 48px -6px rgba(0,0,0,.7)',
    bg:       'rgba(52,211,153,.08)',
    border:   'rgba(52,211,153,.28)',
  },
  blue: {
    color:    '#60a5fa',
    colorMid: '#93c5fd',
    gradient: 'linear-gradient(90deg,#1e3a8a,#60a5fa)',
    glow:     'rgba(96,165,250,.55)',
    blob:     '#60a5fa',
    hover:    'inset 0 1px 0 rgba(255,255,255,.15),0 0 0 1px rgba(96,165,250,.4),0 0 30px -4px rgba(96,165,250,.3),0 16px 48px -6px rgba(0,0,0,.7)',
    bg:       'rgba(96,165,250,.08)',
    border:   'rgba(96,165,250,.28)',
  },
};

const COLOR_EMOJI = { red: '🔴', yellow: '🟡', green: '🟢', blue: '🔵' };
const COLOR_MEDAL = ['🥇', '🥈', '🥉', '4️⃣'];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.col-root{font-family:'Space Grotesk',sans-serif;background:#0d0f2b;color:#fff;min-height:100vh;overflow-x:hidden;}
.col-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(ellipse 60% 40% at 15% 20%,rgba(230,57,70,.09) 0%,transparent 65%),
             radial-gradient(ellipse 50% 50% at 85% 75%,rgba(255,183,3,.06) 0%,transparent 65%);}
.col-glass{background:rgba(16,20,56,.6);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:20px;position:relative;isolation:isolate;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,255,255,.07),0 8px 32px -4px rgba(0,0,0,.6);}
.col-glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(230,57,70,.22) 35%,rgba(230,57,70,.1) 70%,rgba(255,255,255,.04) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.col-card{border-radius:16px;overflow:hidden;position:relative;isolation:isolate;transition:transform .28s cubic-bezier(.22,.68,0,1.15),box-shadow .28s ease;}
.col-card::after{content:'';position:absolute;width:150px;height:150px;border-radius:50%;filter:blur(55px);bottom:-50px;right:-40px;opacity:.18;pointer-events:none;z-index:-1;transition:opacity .3s,transform .3s;}
.col-card:hover::after{opacity:.35;transform:scale(1.2);}
.col-glow-line{position:absolute;bottom:0;left:15%;right:15%;height:1px;border-radius:100px;opacity:0;transition:opacity .3s;}
.col-card:hover .col-glow-line{opacity:1;}
@keyframes spinLoader{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
.col-fadein{animation:fadeUp .6s cubic-bezier(.22,.68,0,1.1) forwards;}
`;
const G = {
  background: 'rgba(16,20,56,.6)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,.07)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.1),0 8px 32px -4px rgba(0,0,0,.6)',
  borderRadius: 20,
};

export default function ColorResults() {
  const isMobile = useIsMobile();
  const [results, setResults]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [interpLoading, setInterpLoading]   = useState(false);
  const [interpError, setInterpError]       = useState(null);

  useEffect(() => { loadResults(); }, []);

  const loadResults = async () => {
    try {
      const { data: { user }, error: ue } = await supabase.auth.getUser();
      if (ue || !user) throw new Error('Nie jesteś zalogowany');
      const [{ data, error: fe }, { data: cached }] = await Promise.all([
        supabase.from('user_psychometrics').select('*').eq('user_id', user.id).eq('test_type', 'COLOR_PERSONALITY').order('completed_at', { ascending: false }).limit(1),
        supabase.from('ai_interpretations').select('interpretation').eq('user_id', user.id).eq('test_type', 'COLOR_PERSONALITY').eq('prompt_version', PROMPT_VERSION).maybeSingle(),
      ]);
      if (fe) throw fe;
      if (!data?.length) { setError('Nie znaleziono wyników testu.'); setLoading(false); return; }
      setResults(data[0]);
      setLoading(false);
      if (cached?.interpretation) setInterpretation(cached.interpretation);
      else generateInterpretation(data[0]);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const generateInterpretation = async (r, { force = false } = {}) => {
    setInterpLoading(true); setInterpError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Brak sesji');
      const { data: d, error: fnErr } = await supabase.functions.invoke('interpret-test', {
        body: { test_type: 'COLOR_PERSONALITY', raw_scores: r.raw_scores, report: r.report, force },
        headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
      });
      if (fnErr) throw fnErr;
      setInterpretation(d?.interpretation ?? null);
    } catch {
      setInterpError('Nie udało się wygenerować interpretacji.');
    } finally {
      setInterpLoading(false);
    }
  };
  const regenerate = () => { if (results) { setInterpretation(null); generateInterpretation(results, { force: true }); } };

  if (loading) return (
    <><style>{CSS}</style>
    <div className="col-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: `3px solid rgba(230,57,70,.22)`, borderTopColor: PAGE_ACCENT, borderRadius: '50%', animation: 'spinLoader 1s linear infinite', margin: '0 auto 16px' }}/>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>Ładowanie wyników...</p>
      </div>
    </div></>
  );

  if (error) return (
    <><style>{CSS}</style>
    <div className="col-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: '100vh' }}>
      <div className="col-glass" style={{ ...G, padding: 40, textAlign: 'center', maxWidth: 380 }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: 'rgba(255,255,255,.7)', marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
        <button onClick={() => window.location.href = '/user-profile-tests.html'}
          style={{ background: `linear-gradient(135deg,${PAGE_ACCENT}cc,${PAGE_ACCENT})`, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
          Wróć do Dashboardu
        </button>
      </div>
    </div></>
  );

  const rs = results.raw_scores || {};
  const colorCounts = rs.color_counts || {};
  const colorPercentages = rs.color_percentages || {};
  const primaryColor = rs.primary_color || 'red';
  const secondaryColor = rs.secondary_color || 'yellow';
  const profileKey = rs.profile_key || `${primaryColor}_${secondaryColor}`;
  const sortedColors = rs.sorted_colors || COLOR_PERSONALITY_TEST.colors.map(c => ({
    ...c,
    count: colorCounts[c.id] || 0,
    percentage: colorPercentages[c.id] || 0,
  })).sort((a, b) => b.count - a.count);

  const primaryData = COLOR_PERSONALITY_TEST.colors.find(c => c.id === primaryColor);
  const secondaryData = COLOR_PERSONALITY_TEST.colors.find(c => c.id === secondaryColor);
  const primaryAc = COLOR_ACCENT[primaryColor] || COLOR_ACCENT.red;
  const combinationDesc = COLOR_PERSONALITY_TEST.combination_profiles[profileKey] || null;
  const dominantInterpretation = COLOR_PERSONALITY_TEST.dominant_interpretations[primaryColor] || null;
  const maxCount = Math.max(...Object.values(colorCounts), 1);

  return (
    <><style>{CSS}</style>
    <div className="col-root">
      <ResultsScaffold
        accent={PAGE_ACCENT}
        navLabel="KOD KOLORU"
        badge={`${COLOR_EMOJI[primaryColor] || '🎨'} Kod Koloru`}
        title={<>Twój <span style={{ color: primaryAc.color, textShadow: `0 0 24px ${primaryAc.glow}` }}>Kod Koloru</span></>}
        subtitle="COLOR PERSONALITY MAP · Czerwony / Żółty / Zielony / Niebieski"
        completedAt={results?.completed_at}
        retakeHref="/test?type=color_personality"
      >

        {/* ── Hero: Primary archetype ── */}
        <div className="col-glass col-fadein" style={{ ...G, padding: isMobile ? '28px 24px' : '36px 40px', marginBottom: 24, overflow: 'hidden', borderColor: primaryAc.border }}>
          <div style={{ position: 'absolute', top: -60, right: -40, width: 260, height: 260, borderRadius: '50%', background: primaryAc.blob, opacity: .12, filter: 'blur(70px)', pointerEvents: 'none' }}/>
          <div style={{ position: 'relative', display: 'flex', gap: 24, alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row' }}>
            {/* Color swatch */}
            <div style={{ flexShrink: 0, width: 80, height: 80, borderRadius: 20, background: primaryAc.gradient, boxShadow: `0 0 28px ${primaryAc.glow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
              {COLOR_EMOJI[primaryColor]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: primaryAc.color, marginBottom: 4 }}>
                {primaryData?.name?.toUpperCase()} · DOMINUJĄCY KOLOR
              </div>
              <div style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 8 }}>
                {primaryData?.archetype}
              </div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', fontStyle: 'italic', marginBottom: 12 }}>
                „{primaryData?.tagline}"
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 11, padding: '4px 12px', borderRadius: 100, background: primaryAc.bg, border: `1px solid ${primaryAc.border}`, color: primaryAc.color, fontWeight: 700, letterSpacing: '1px' }}>
                  Potrzeba: {primaryData?.core_need}
                </div>
                <div style={{ fontSize: 11, padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>
                  Drugi kolor: {secondaryData?.archetype}
                </div>
              </div>
            </div>
          </div>
          {dominantInterpretation && (
            <p style={{ position: 'relative', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.7, borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 16 }}>
              {dominantInterpretation}
            </p>
          )}
        </div>

        {/* ── Color distribution bars ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>Rozkład kolorów osobowości</span>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${PAGE_ACCENT}66,transparent)` }}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)', gap: 16 }}>
            {sortedColors.map((sc, i) => {
              const colorData = COLOR_PERSONALITY_TEST.colors.find(c => c.id === sc.id) || sc;
              const ac = COLOR_ACCENT[sc.id] || COLOR_ACCENT.red;
              const pct = Math.round(((sc.count || 0) / maxCount) * 100);
              const isPrimary = sc.id === primaryColor;
              const isSecondary = sc.id === secondaryColor;
              return (
                <div key={sc.id} className="col-glass col-card col-fadein"
                  style={{ ...G, padding: '22px 20px', borderColor: isPrimary ? ac.border : 'rgba(255,255,255,.07)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'; e.currentTarget.style.boxShadow = ac.hover; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = G.boxShadow; }}>
                  <div className="col-glow-line" style={{ background: ac.color, boxShadow: `0 0 10px 2px ${ac.glow}` }}/>
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: ac.blob, opacity: isPrimary ? .22 : .12, filter: 'blur(40px)', pointerEvents: 'none' }}/>
                  <div style={{ position: 'relative' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{COLOR_MEDAL[i]}</div>
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{COLOR_EMOJI[sc.id]}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: ac.color, marginBottom: 2 }}>{colorData.name}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
                      {colorData.archetype}
                      {isPrimary && <span style={{ fontSize: 10, marginLeft: 6, padding: '2px 7px', background: ac.bg, border: `1px solid ${ac.border}`, borderRadius: 100, color: ac.color, fontWeight: 700 }}>główny</span>}
                      {isSecondary && !isPrimary && <span style={{ fontSize: 10, marginLeft: 6, padding: '2px 7px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 100, color: 'rgba(255,255,255,.45)', fontWeight: 700 }}>drugi</span>}
                    </div>
                    <div style={{ height: 4, borderRadius: 100, background: 'rgba(255,255,255,.07)', marginBottom: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: ac.gradient, borderRadius: 100, boxShadow: `0 0 10px ${ac.glow}` }}/>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
                      <span>{sc.count || 0} wyborów</span>
                      <span style={{ color: ac.color, fontWeight: 700 }}>{sc.percentage || colorPercentages[sc.id] || 0}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Combination profile ── */}
        {combinationDesc && (
          <div className="col-glass" style={{ ...G, marginBottom: 24, padding: '28px 28px', borderColor: primaryAc.border, overflow: 'hidden', background: `${primaryAc.bg}` }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 220, height: 220, borderRadius: '50%', background: primaryAc.blob, opacity: .06, filter: 'blur(60px)', pointerEvents: 'none' }}/>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>{COLOR_EMOJI[primaryColor]}</span>
                <span style={{ fontSize: 16, color: 'rgba(255,255,255,.4)' }}>+</span>
                <span style={{ fontSize: 20 }}>{COLOR_EMOJI[secondaryColor]}</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: primaryAc.color, marginLeft: 4 }}>
                  Profil kombinacyjny
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.72)', lineHeight: 1.75 }}>{combinationDesc}</p>
            </div>
          </div>
        )}

        {/* ── Primary color deep-dive ── */}
        {primaryData && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>
                {primaryData.name}: {primaryData.archetype} — głębszy profil
              </span>
              <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${primaryAc.color}66,transparent)` }}/>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* Strengths */}
              <div className="col-glass" style={{ ...G, padding: '24px 24px', borderColor: primaryAc.border }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: primaryAc.color, marginBottom: 14 }}>💪 Mocne strony</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(primaryData.strengths || []).map(s => (
                    <span key={s} style={{ fontSize: 12, padding: '5px 13px', borderRadius: 100, background: primaryAc.bg, border: `1px solid ${primaryAc.border}`, color: primaryAc.color, fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Shadows */}
              <div className="col-glass" style={{ ...G, padding: '24px 24px', borderColor: 'rgba(244,63,94,.2)', background: 'rgba(244,63,94,.04)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#f87171', marginBottom: 14 }}>🌑 Cień — obszary wzrostu</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(primaryData.shadows || []).map(s => (
                    <span key={s} style={{ fontSize: 12, padding: '5px 13px', borderRadius: 100, background: 'rgba(244,63,94,.08)', border: '1px solid rgba(244,63,94,.25)', color: '#f87171', fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* At Work / In Relationship / Communication */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '💼', label: 'W pracy', content: primaryData.at_work },
                { icon: '💞', label: 'W relacjach', content: primaryData.in_relationship },
                { icon: '💬', label: 'Styl komunikacji', content: primaryData.communication },
              ].map(({ icon, label, content }) => content && (
                <div key={label} className="col-glass" style={{ ...G, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 12, background: primaryAc.bg, border: `1px solid ${primaryAc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: primaryAc.color, marginBottom: 6 }}>{label}</div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, margin: 0 }}>{content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── All 4 colors overview ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>
              Wszystkie 4 kolory osobowości
            </span>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${PAGE_ACCENT}66,transparent)` }}/>
          </div>
          <div className="col-glass" style={{ ...G, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {COLOR_PERSONALITY_TEST.colors.map(colorDef => {
              const ac = COLOR_ACCENT[colorDef.id] || COLOR_ACCENT.red;
              const count = colorCounts[colorDef.id] || 0;
              const pct = parseFloat(colorPercentages[colorDef.id] || 0);
              const barPct = Math.round((count / maxCount) * 100);
              const isPrimary = colorDef.id === primaryColor;
              const isSecondary = colorDef.id === secondaryColor;
              return (
                <div key={colorDef.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: isPrimary ? ac.bg : 'rgba(255,255,255,.03)', border: isPrimary ? `1px solid ${ac.border}` : '1px solid rgba(255,255,255,.06)' }}>
                  <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{COLOR_EMOJI[colorDef.id]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isPrimary ? ac.color : isSecondary ? ac.color : 'rgba(255,255,255,.55)' }}>
                        {colorDef.archetype}
                        <span style={{ fontSize: 10, marginLeft: 6, color: 'rgba(255,255,255,.35)', fontWeight: 400 }}>({colorDef.name})</span>
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isPrimary ? ac.color : 'rgba(255,255,255,.35)' }}>{count}/32 · {pct}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 100, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                      <div style={{ width: `${barPct}%`, height: '100%', background: ac.gradient, borderRadius: 100, boxShadow: `0 0 8px ${ac.glow}` }}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── AI Interpretation ── */}
        <div className="col-glass" style={{ ...G, padding: 36, marginBottom: 32, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 400, height: 180, background: `${primaryAc.blob}10`, borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }}/>
          <div style={{ position: 'relative' }}>
            <AiInterpretation
              interpretation={interpretation}
              loading={interpLoading}
              error={interpError}
              onRegenerate={regenerate}
              onRetry={() => generateInterpretation(results)}
              accentColor={PAGE_ACCENT}
              accentGlow="rgba(230,57,70,.5)"
              testLabel="Twojego kodu koloru"
            />
          </div>
        </div>

        <ResultsFooterActions retakeHref="/test?type=color_personality"/>
      </ResultsScaffold>
    </div></>
  );
}
