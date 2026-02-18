import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Scale, TrendingUp, TrendingDown } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { supabase } from '../../lib/supabaseClient.js';
import { VALUES_TEST } from '../../data/tests/values.js';
import { generateValuesReport } from '../../utils/scoring.js';

/**
 * Personal Values Results Component
 * Displays centered value scores with diverging bar chart
 * Uses MRAT (Mean-Referenced Average Technique)
 */
export default function ValuesResults() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    try {
      setLoading(true);
      
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError('Nie jesteś zalogowany');
        setLoading(false);
        return;
      }

      // Fetch latest Values test result
      const { data, error: fetchError } = await supabase
        .from('user_psychometrics')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('test_type', 'VALUES')
        .order('completed_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        throw fetchError;
      }

      if (!data || data.length === 0) {
        setError('Nie znaleziono wyników testu. Wykonaj test najpierw.');
        setLoading(false);
        return;
      }

      const testResult = data[0];
      
      // Extract scores from raw_scores JSONB
      const scoresData = testResult.raw_scores || {};
      
      // Generate full report with interpretations
      const fullReport = generateValuesReport(scoresData);
      
      setReport({
        ...fullReport,
        completed_at: testResult.completed_at
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading results:', err);
      setError(err.message || 'Błąd podczas ładowania wyników');
      setLoading(false);
    }
  }

  const handleRetakeTest = () => {
    if (confirm('Czy na pewno chcesz wykonać test ponownie?')) {
      window.location.href = '/test?type=values';
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = '/user-profile-tests.html';
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const score = data.score;
      const isPositive = score >= 0;
      
      return (
        <div className="bg-slate-900 border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-white mb-1">{data.value}</p>
          <p className={`text-sm ${isPositive ? 'text-emerald-400' : 'text-slate-400'}`}>
            Ważność względem Twojej średniej: <span className="font-bold">{score > 0 ? '+' : ''}{score.toFixed(2)}</span>
          </p>
          {isPositive && (
            <p className="text-xs text-emerald-500 mt-1">📈 Priorytet</p>
          )}
          {!isPositive && (
            <p className="text-xs text-slate-500 mt-1">📉 Mniej istotne</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-slate-400">Ładowanie wyników...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Błąd</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/user-profile-tests.html'}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
          >
            Wróć do Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header Bar */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={handleRetakeTest}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              <RefreshCw size={18} />
              <span>Powtórz Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full mb-6">
            <Scale size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Twój Kod Wartości
          </h1>
          <p className="text-xl text-slate-400 mb-2">
            Test Wartości Osobistych (Schwartz PVQ)
          </p>
          <p className="text-sm text-slate-500">
            Ukończono: {new Date(report.completed_at).toLocaleDateString('pl-PL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* MRAT Explanation */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-teal-950/50 to-cyan-950/50 border border-teal-500/30 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-teal-300 mb-2">
                  Jak odczytywać wyniki?
                </h3>
                <p className="text-slate-300 leading-relaxed mb-3">
                  {report.summary.mrat_explanation}
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-emerald-400" size={16} />
                    <span className="text-slate-400">Wartości dodatnie = Twoje priorytety</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="text-slate-500" size={16} />
                    <span className="text-slate-400">Wartości ujemne = Mniej istotne</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diverging Bar Chart */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Twój System Wartości
          </h2>
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8">
            <ResponsiveContainer width="100%" height={600}>
              <BarChart
                data={report.chart_data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#334155" 
                  horizontal={false}
                />
                <XAxis 
                  type="number"
                  domain={[-3, 3]}
                  ticks={[-3, -2, -1, 0, 1, 2, 3]}
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  type="category"
                  dataKey="value"
                  stroke="transparent"
                  tick={{ fill: '#cbd5e1', fontSize: 14 }}
                  width={140}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  x={0} 
                  stroke="#e2e8f0" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ 
                    value: 'Twoja Średnia', 
                    position: 'top', 
                    fill: '#e2e8f0',
                    fontSize: 12
                  }}
                />
                <Bar 
                  dataKey="score" 
                  radius={[0, 4, 4, 0]}
                >
                  {report.chart_data.map((entry, index) => {
                    const isPositive = entry.score >= 0;
                    const color = isPositive ? entry.color : '#64748b';
                    const opacity = isPositive ? 1 : 0.4;
                    
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={color}
                        fillOpacity={opacity}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* Chart Legend */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-teal-500 rounded"></div>
                  <span className="text-slate-400">Wartości po prawej (kolorowe)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-600 opacity-40 rounded"></div>
                  <span className="text-slate-400">Wartości po lewej (szare)</span>
                </div>
              </div>
              <p className="text-center text-slate-500 text-xs mt-3">
                Wartości po prawej strony to Twoje główne motywatory. Wartości po lewej są dla Ciebie mniej istotne przy podejmowaniu decyzji.
              </p>
            </div>
          </div>
        </div>

        {/* Top 3 Values - Priorities */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Twoje 3 Główne Wartości (Priorytety)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {report.top_3.map((value, index) => (
              <div
                key={value.id}
                className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden"
              >
                {/* Value Header */}
                <div 
                  className="p-6 border-b border-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${value.color}15, transparent)`
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div 
                      className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white text-lg"
                      style={{ backgroundColor: value.color }}
                    >
                      #{value.rank}
                    </div>
                    <div className="text-right">
                      <div 
                        className="text-3xl font-bold"
                        style={{ color: value.color }}
                      >
                        +{value.score.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {value.name}
                  </h3>
                  <p className="text-sm text-slate-400">{value.name_en}</p>
                </div>

                {/* Value Interpretation */}
                <div className="p-6">
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    {value.interpretation.description}
                  </p>
                  
                  {value.interpretation.characteristics && (
                    <div className="space-y-2">
                      {value.interpretation.characteristics.slice(0, 3).map((char, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start gap-2 text-sm text-slate-400"
                        >
                          <span 
                            className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: value.color }}
                          />
                          {char}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Values - Full List */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Wszystkie Wartości (Ranking)
          </h2>
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {report.all_values.map((value, index) => {
                const isPositive = value.centered_score >= 0;
                
                return (
                  <div
                    key={value.id}
                    className="p-6 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 flex-1">
                        <div 
                          className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white"
                          style={{ 
                            backgroundColor: isPositive ? value.color : '#64748b',
                            opacity: isPositive ? 1 : 0.5
                          }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-1">
                            {value.name}
                          </h4>
                          <p className="text-sm text-slate-400">
                            {value.motivational_goal}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div 
                          className={`text-2xl font-bold ${isPositive ? 'text-emerald-400' : 'text-slate-500'}`}
                        >
                          {value.centered_score > 0 ? '+' : ''}{value.centered_score.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500">
                          surowy: {value.raw_average.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Score Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${Math.abs(value.centered_score / 3) * 100}%`,
                          backgroundColor: isPositive ? value.color : '#64748b',
                          opacity: isPositive ? 1 : 0.4,
                          marginLeft: isPositive ? '0' : 'auto',
                          marginRight: isPositive ? 'auto' : '0'
                        }}
                      />
                    </div>
                    
                    {/* Interpretation Summary */}
                    <p className="text-sm text-slate-400 mt-3">
                      {value.interpretation.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom 3 Values - Sacrifices */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">💭</span>
            Wartości Mniej Istotne (Twoje "Poświęcenia")
          </h2>
          <div className="bg-slate-900/30 border border-white/5 rounded-xl p-6">
            <p className="text-slate-400 mb-6">
              Te wartości są dla Ciebie mnie j istotne. Nie oznacza to, że je odrzucasz - po prostu nie są głównym źródłem Twoich decyzji i motywacji.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.bottom_3.map((value) => (
                <div
                  key={value.id}
                  className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-300">{value.name}</h4>
                    <span className="text-lg font-bold text-slate-500">
                      {value.score.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-900/30 border border-white/5 rounded-xl p-6 text-center">
          <p className="text-slate-400 text-sm mb-2">
            Test oparty na teorii wartości uniwersalnych Shaloma Schwartza
          </p>
          <p className="text-slate-500 text-xs">
            Teoria Schwartza identyfikuje 10 podstawowych wartości uniwersalnych, które kierują zachowaniem ludzi we wszystkich kulturach. 
            Metoda MRAT (Mean-Referenced Average Technique) pozwala na wycentrowanie wyników względem Twojej osobistej średniej odpowiedzi.
          </p>
        </div>
      </div>
    </div>
  );
}
