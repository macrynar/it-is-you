import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Share2, Download } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.js';
import { HEXACO_TEST } from '../../data/tests/hexaco.js';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function HexacoResults() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [interpretationLoading, setInterpretationLoading] = useState(false);
  const [interpretationError, setInterpretationError] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Nie jesteś zalogowany');
      }

      // Get latest HEXACO test result
      const { data, error: fetchError } = await supabase
        .from('user_psychometrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('test_type', 'HEXACO')
        .order('completed_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        setError('Nie znaleziono wyników testu. Wykonaj test ponownie.');
        setLoading(false);
        return;
      }

      setResults(data[0]);
      setLoading(false);
      loadInterpretation(data[0]);
    } catch (err) {
      console.error('Error loading results:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const loadInterpretation = async (testResult) => {
    setInterpretationLoading(true);
    setInterpretationError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Brak sesji użytkownika');

      const { data, error: fnError } = await supabase.functions.invoke('interpret-test', {
        headers: { Authorization: `Bearer ${token}` },
        body: {
          test_type: 'HEXACO',
          percentile_scores: testResult.percentile_scores,
          raw_scores: testResult.raw_scores
        }
      });
      if (fnError) throw fnError;
      setInterpretation(data?.interpretation ?? null);
    } catch (err) {
      console.error('Interpretation error:', err);
      setInterpretationError('Nie udało się wygenerować interpretacji.');
    } finally {
      setInterpretationLoading(false);
    }
  };

  const regenerateInterpretation = async () => {
    if (!results) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return;
    // Delete cache first so edge function regenerates
    await supabase
      .from('ai_interpretations')
      .delete()
      .eq('test_type', 'HEXACO');
    setInterpretation(null);
    loadInterpretation(results);
  };

  const handleRetakeTest = () => {
    if (confirm('Czy na pewno chcesz wykonać test ponownie? Obecne wyniki zostaną zastąpione.')) {
      window.location.href = '/test';
    }
  };

  // Get progress bar color based on percentile
  const getProgressBarColor = (percentile) => {
    if (percentile >= 80) {
      return 'from-emerald-500 to-cyan-500'; // High - Neon Green/Cyan
    } else if (percentile >= 50) {
      return 'from-blue-500 to-purple-500'; // Medium - Blue/Purple
    } else if (percentile >= 30) {
      return 'from-yellow-500 to-orange-500'; // Below average - Yellow/Orange
    } else {
      return 'from-orange-500 to-red-500'; // Low - Orange/Red
    }
  };

  // Get glow color for high scores
  const getGlowColor = (percentile) => {
    if (percentile >= 80) {
      return 'shadow-[0_0_20px_rgba(16,185,129,0.4)]';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Ładowanie wyników...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-red-500/30 text-center max-w-md">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Błąd</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/user-profile-tests.html'}
            className="btn-neural"
          >
            Wróć do Dashboardu
          </button>
        </div>
      </div>
    );
  }

  const dimensionIcons = {
    honesty_humility: '🎭',
    emotionality: '💭',
    extraversion: '⚡',
    agreeableness: '🤝',
    conscientiousness: '📋',
    openness: '🌟'
  };

  // Icon paths for radar chart vertices
  const radarTickIcons = {
    'Honesty-Humility': {
      emoji: '⚖️',
      color: '#a78bfa'
    },
    'Emotionality': {
      emoji: '💜',
      color: '#f472b6'
    },
    'Extraversion': {
      emoji: '💬',
      color: '#60a5fa'
    },
    'Agreeableness': {
      emoji: '🤝',
      color: '#34d399'
    },
    'Conscientiousness': {
      emoji: '📋',
      color: '#fbbf24'
    },
    'Openness': {
      emoji: '🌟',
      color: '#f87171'
    },
  };

  const CustomRadarTick = ({ x, y, payload }) => {
    const cfg = radarTickIcons[payload.value] || { emoji: '●', color: '#94a3b8' };
    const label = payload.value;
    const charWidth = 7.5;
    const pillW = Math.max(label.length * charWidth + 28, 90);
    const pillH = 22;
    const emojiSize = 18;
    const gap = 5;

    return (
      <g>
        {/* Icon circle background */}
        <circle cx={x} cy={y - pillH / 2 - gap - emojiSize / 2 + 2} r={14}
          fill="rgba(10,16,35,0.9)" stroke={cfg.color + '55'} strokeWidth={1.5} />
        {/* Emoji icon */}
        <text x={x} y={y - pillH / 2 - gap - emojiSize / 2 + 2}
          textAnchor="middle" dominantBaseline="central" fontSize={14}>
          {cfg.emoji}
        </text>
        {/* Label pill background */}
        <rect x={x - pillW / 2} y={y - pillH / 2}
          width={pillW} height={pillH} rx={6}
          fill="rgba(10,16,35,0.88)" stroke={cfg.color + '44'} strokeWidth={1} />
        {/* Label text */}
        <text x={x} y={y}
          textAnchor="middle" dominantBaseline="central"
          fill="#cbd5e1" fontSize={11} fontWeight="600">
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.location.href = '/user-profile-tests.html'}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={handleRetakeTest}
              className="btn-ghost flex items-center gap-2"
            >
              <RefreshCw size={18} />
              <span>Powtórz Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Hero Section - Mission Report Style */}
        <div className="text-center mb-16 relative">
          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-bold uppercase tracking-wider mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              Status: Ukończono
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent tracking-tight">
              ANALIZA UKOŃCZONA
            </h1>
            
            <div className="flex items-center justify-center gap-4 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-cyan-500"></div>
                <span>HEXACO-60 Test Osobowości</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <div className="flex items-center gap-2">
                <span>{new Date(results.completed_at).toLocaleDateString('pl-PL', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric'
                })}</span>
                <span className="text-slate-700">•</span>
                <span>{new Date(results.completed_at).toLocaleTimeString('pl-PL', { 
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Radar Chart Section */}
        <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-indigo-500/20 mb-16 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-4">
                <span className="text-2xl">🧠</span>
                <span className="text-sm font-semibold text-slate-300">Personality Radar</span>
              </div>
              <p className="text-slate-400 text-sm">
                HEXACO / Big Five Test • Shows how you react, work, and handle conflicts
              </p>
            </div>

            {/* Radar Chart */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-8">
              <ResponsiveContainer width="100%" height={520}>
                <RadarChart
                  data={HEXACO_TEST.dimensions.map(dim => {
                    const shortLabels = {
                      'honesty_humility': 'Honesty-Humility',
                      'emotionality': 'Emotionality',
                      'extraversion': 'Extraversion',
                      'agreeableness': 'Agreeableness',
                      'conscientiousness': 'Conscientiousness',
                      'openness': 'Openness'
                    };
                    return {
                      dimension: shortLabels[dim.id] || dim.name,
                      value: Math.round(results.percentile_scores[dim.id]),
                    };
                  })}
                  margin={{ top: 60, right: 80, bottom: 60, left: 80 }}
                  outerRadius="62%"
                >
                  <PolarGrid
                    stroke="#334155"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                  />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={<CustomRadarTick />}
                    tickLine={false}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.55}
                    strokeWidth={2.5}
                    dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Dimension Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {HEXACO_TEST.dimensions.map((dimension) => {
                const percentile = results.percentile_scores[dimension.id];
                const report = results.report?.dimensions?.find(d => d.id === dimension.id);
                
                return (
                  <div key={dimension.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-indigo-400/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold text-sm">
                        {dimension.name.split('-')[0]}
                      </h3>
                      <span className="text-indigo-400 font-bold text-lg">
                        {Math.round(percentile)}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full bg-gradient-to-r ${getProgressBarColor(percentile)} transition-all duration-1000`}
                        style={{ width: `${percentile}%` }}
                      />
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {report?.interpretation?.keywords || dimension.description.substring(0, 50) + '...'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dimensions Grid - HUD Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {HEXACO_TEST.dimensions.map((dimension) => {
            const score = results.raw_scores[dimension.id];
            const percentile = results.percentile_scores[dimension.id];
            const report = results.report?.dimensions?.find(d => d.id === dimension.id);
            
            return (
              <div
                key={dimension.id}
                className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all duration-300 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                    {dimensionIcons[dimension.id]}
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold text-white mb-1 ${getGlowColor(percentile)}`}>
                      {Math.round(percentile)}<span className="text-xl text-slate-500">%</span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono">
                      {score?.toFixed(2)}/5.00
                    </div>
                  </div>
                </div>

                {/* Dimension Name */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {dimension.name}
                </h3>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  {dimension.description}
                </p>

                {/* Progress Bar - Thin & Elegant */}
                <div className="mb-5">
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full bg-gradient-to-r ${getProgressBarColor(percentile)} transition-all duration-1000 relative ${getGlowColor(percentile)}`}
                      style={{ width: `${percentile}%` }}
                    >
                      {/* Inner glow */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${getProgressBarColor(percentile)} blur-sm opacity-50`}></div>
                    </div>
                  </div>
                </div>

                {/* Interpretation */}
                {report?.interpretation && (
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                      {report.interpretation.level}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {report.interpretation.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Visualization Section */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-800 mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-cyan-400">■</span>
            Profil Osbowości
          </h2>
          
          {/* Bar Chart */}
          <div className="space-y-6">
            {HEXACO_TEST.dimensions.map((dimension) => {
              const percentile = results.percentile_scores[dimension.id];
              
              return (
                <div key={dimension.id} className="group">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-slate-400 font-medium flex items-center gap-2">
                      <span className="text-xl">{dimensionIcons[dimension.id]}</span>
                      {dimension.name}
                    </span>
                    <span className="text-white font-bold text-lg">{Math.round(percentile)}<span className="text-slate-600 text-sm">%</span></span>
                  </div>
                  <div className="relative">
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full bg-gradient-to-r ${getProgressBarColor(percentile)} transition-all duration-1000 relative group-hover:opacity-90`}
                        style={{ width: `${percentile}%` }}
                      >
                        {/* Glow effect */}
                        {percentile >= 80 && (
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 blur-md opacity-40"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Section - Mission Stats */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-800 mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-cyan-400">■</span>
            Kluczowe Statystyki
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Highest Dimension */}
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-500/50 transition-all">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">
                Dominujący Wymiar
              </div>
              {(() => {
                const highest = Object.entries(results.percentile_scores)
                  .sort((a, b) => b[1] - a[1])[0];
                const dim = HEXACO_TEST.dimensions.find(d => d.id === highest[0]);
                return (
                  <div>
                    <div className="text-3xl mb-2">{dimensionIcons[highest[0]]}</div>
                    <div className="text-xl font-bold text-white mb-1">{dim?.name}</div>
                    <div className="text-2xl font-bold text-emerald-400">{Math.round(highest[1])}<span className="text-sm text-emerald-600">%</span></div>
                  </div>
                );
              })()}
            </div>

            {/* Lowest Dimension */}
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-6 hover:border-orange-500/50 transition-all">
              <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-4">
                Obszar Rozwoju
              </div>
              {(() => {
                const lowest = Object.entries(results.percentile_scores)
                  .sort((a, b) => a[1] - b[1])[0];
                const dim = HEXACO_TEST.dimensions.find(d => d.id === lowest[0]);
                return (
                  <div>
                    <div className="text-3xl mb-2">{dimensionIcons[lowest[0]]}</div>
                    <div className="text-xl font-bold text-white mb-1">{dim?.name}</div>
                    <div className="text-2xl font-bold text-orange-400">{Math.round(lowest[1])}<span className="text-sm text-orange-600">%</span></div>
                  </div>
                );
              })()}
            </div>

            {/* Average Score */}
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4">
                Średni Wynik
              </div>
              {(() => {
                const avg = Object.values(results.percentile_scores)
                  .reduce((sum, val) => sum + val, 0) / 6;
                return (
                  <div>
                    <div className="text-3xl mb-2">📈</div>
                    <div className="text-xl font-bold text-white mb-1">Ogólny Profil</div>
                    <div className="text-2xl font-bold text-cyan-400">{Math.round(avg)}<span className="text-sm text-cyan-600">%</span></div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* AI Interpretation Section */}
        <div className="bg-gradient-to-br from-violet-950/40 to-indigo-950/40 backdrop-blur-sm rounded-2xl p-8 border border-violet-500/20 mb-12 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-violet-500/8 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-lg">
                  🤖
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Interpretacja AI</h2>
                  <p className="text-xs text-slate-500">Spersonalizowana analiza Twojego profilu HEXACO</p>
                </div>
              </div>
              {interpretation && !interpretationLoading && (
                <button
                  onClick={regenerateInterpretation}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-400 transition-colors px-3 py-1.5 rounded-lg border border-slate-800 hover:border-violet-500/30"
                >
                  <RefreshCw size={12} />
                  Regeneruj
                </button>
              )}
            </div>

            {/* Loading skeleton */}
            {interpretationLoading && (
              <div className="space-y-3 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping"></div>
                  <span className="text-sm text-violet-400">Generuję interpretację...</span>
                </div>
                <div className="h-4 bg-slate-800/60 rounded w-full"></div>
                <div className="h-4 bg-slate-800/60 rounded w-5/6"></div>
                <div className="h-4 bg-slate-800/60 rounded w-4/5"></div>
                <div className="h-4 bg-slate-800/60 rounded w-full mt-4"></div>
                <div className="h-4 bg-slate-800/60 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800/60 rounded w-5/6"></div>
                <div className="h-4 bg-slate-800/60 rounded w-full mt-4"></div>
                <div className="h-4 bg-slate-800/60 rounded w-4/6"></div>
              </div>
            )}

            {/* Error state */}
            {interpretationError && !interpretationLoading && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center">
                <p className="text-red-400 text-sm mb-3">{interpretationError}</p>
                <button
                  onClick={() => loadInterpretation(results)}
                  className="text-xs text-slate-400 hover:text-white transition-colors underline"
                >
                  Spróbuj ponownie
                </button>
              </div>
            )}

            {/* Interpretation text */}
            {interpretation && !interpretationLoading && (
              <div className="space-y-4">
                {interpretation.split('\n\n').filter(p => p.trim()).map((paragraph, i) => {
                  const isItalic = paragraph.trim().startsWith('*') && paragraph.trim().endsWith('*');
                  const text = isItalic ? paragraph.trim().replace(/^\*|\*$/g, '') : paragraph.trim();
                  return isItalic ? (
                    <p key={i} className="text-violet-300 text-sm italic border-l-2 border-violet-500/50 pl-4 mt-2">
                      {text}
                    </p>
                  ) : (
                    <p key={i} className="text-slate-300 text-sm leading-relaxed">
                      {text}
                    </p>
                  );
                })}
                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-600">Wygenerowane przez GPT-4o-mini • Interpretacja psychologiczna, nie diagnoza medyczna</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.location.href = '/user-profile-tests.html'}
            className="btn-neural"
          >
            Wróć do Dashboardu
          </button>
          <button
            onClick={handleRetakeTest}
            className="btn-ghost flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Wykonaj Test Ponownie
          </button>
        </div>

      </div>
    </div>
  );
}
