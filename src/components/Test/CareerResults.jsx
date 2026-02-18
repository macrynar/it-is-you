import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Briefcase, Target } from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { supabase } from '../../lib/supabaseClient.js';
import { CAREER_TEST } from '../../data/tests/career.js';
import { generateCareerReport } from '../../utils/scoring.js';

/**
 * Career Interests (RIASEC) Results Component
 * Displays Holland Code and Top 3 interests with radar chart visualization
 */
export default function CareerResults() {
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

      // Fetch latest Career test result
      const { data, error: fetchError } = await supabase
        .from('user_psychometrics')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('test_type', 'CAREER')
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
      const fullReport = generateCareerReport(scoresData);
      
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
      window.location.href = '/test?type=career';
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = '/user-profile-tests.html';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
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
            className="btn-neural"
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
              className="btn-ghost flex items-center gap-2"
            >
              <RefreshCw size={18} />
              <span>Powtórz Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-6">
            <Briefcase size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Twój Profil Zawodowy
          </h1>
          <p className="text-xl text-slate-400 mb-2">
            Test Zainteresowań Zawodowych (RIASEC)
          </p>
          <p className="text-sm text-slate-500">
            Ukończono: {new Date(report.completed_at).toLocaleDateString('pl-PL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Holland Code Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border border-indigo-500/30 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="text-indigo-400" size={32} />
              <h2 className="text-3xl font-bold text-indigo-300">
                Twój Kod Hollanda
              </h2>
            </div>
            <div className="text-7xl font-black text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text mb-4 tracking-wider">
              {report.holland_code}
            </div>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              {report.summary.holland_code_explanation}
            </p>
          </div>
        </div>

        {/* Radar Chart Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Profil Zainteresowań (Wykres Radarowy)
          </h2>
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8">
            <ResponsiveContainer width="100%" height={500}>
              <RadarChart data={report.chart_data}>
                <PolarGrid 
                  stroke="#334155" 
                  strokeWidth={1}
                />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#cbd5e1', fontSize: 14 }}
                  tickLine={{ stroke: '#475569' }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 5]}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickCount={6}
                />
                <Radar
                  name="Poziom Zainteresowania"
                  dataKey="A"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Legend 
                  wrapperStyle={{ color: '#cbd5e1' }}
                  iconType="circle"
                />
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-center text-slate-400 text-sm mt-4">
              Skala: 1 (Nie lubię) do 5 (Bardzo lubię)
            </p>
          </div>
        </div>

        {/* Top 3 Interests - Detailed */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Twoje 3 Główne Zainteresowania
          </h2>
          <div className="space-y-6">
            {report.top_3.map((interest, index) => {
              const typeData = CAREER_TEST.interest_types.find(t => t.id === interest.id);
              
              return (
                <div 
                  key={interest.id}
                  className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden"
                >
                  {/* Interest Header */}
                  <div 
                    className="p-6 border-b border-white/10"
                    style={{
                      background: `linear-gradient(135deg, ${interest.color}15, transparent)`
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div 
                          className="flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl text-white"
                          style={{ backgroundColor: interest.color }}
                        >
                          {interest.letter}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-slate-400">
                              #{interest.rank}
                            </span>
                            <h3 className="text-2xl font-bold text-white">
                              {interest.name}
                            </h3>
                          </div>
                          <p className="text-slate-400 text-sm">
                            {interest.name_en}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div 
                          className="text-3xl font-bold"
                          style={{ color: interest.color }}
                        >
                          {interest.score.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-500">/ 5.0</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{
                          width: `${(interest.score / 5) * 100}%`,
                          backgroundColor: interest.color
                        }}
                      />
                    </div>
                  </div>

                  {/* Interest Details */}
                  <div className="p-6 space-y-6">
                    {/* Overview */}
                    <div>
                      <h4 className="text-lg font-semibold mb-2 text-indigo-300">
                        📝 Opis
                      </h4>
                      <p className="text-slate-300 leading-relaxed">
                        {interest.interpretation.overview}
                      </p>
                    </div>

                    {/* Characteristics */}
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-indigo-300">
                        ✨ Twoje Cechy
                      </h4>
                      <ul className="space-y-2">
                        {interest.interpretation.characteristics.map((char, idx) => (
                          <li 
                            key={idx}
                            className="flex items-start gap-3 text-slate-300"
                          >
                            <span 
                              className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: interest.color }}
                            />
                            {char}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Career Paths */}
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-indigo-300">
                        💼 Przykładowe Ścieżki Kariery
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {interest.interpretation.career_paths.map((path, idx) => (
                          <div
                            key={idx}
                            className="px-4 py-2 bg-slate-800/50 border border-white/5 rounded-lg text-slate-300 text-sm"
                          >
                            {path}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Work Environments */}
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-indigo-300">
                        🏢 Środowiska Pracy
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {interest.interpretation.work_environments.map((env, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-slate-800/50 border border-white/5 rounded-full text-slate-400 text-sm"
                          >
                            {env}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Scores Table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Wszystkie Wyniki
          </h2>
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-slate-400 font-medium">Typ</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Nazwa</th>
                  <th className="text-center p-4 text-slate-400 font-medium">Wynik</th>
                  <th className="text-left p-4 text-slate-400 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.all_scores)
                  .sort((a, b) => b[1].raw_score - a[1].raw_score)
                  .map(([id, data]) => (
                    <tr 
                      key={id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div 
                          className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white"
                          style={{ backgroundColor: data.color }}
                        >
                          {data.letter}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-white">{data.name}</div>
                        <div className="text-sm text-slate-400">{data.name_en}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span 
                          className="text-2xl font-bold"
                          style={{ color: data.color }}
                        >
                          {data.raw_score.toFixed(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${(data.raw_score / 5) * 100}%`,
                              backgroundColor: data.color
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-900/30 border border-white/5 rounded-xl p-6 text-center">
          <p className="text-slate-400 text-sm mb-2">
            Test oparty na modelu RIASEC Johna Hollanda
          </p>
          <p className="text-slate-500 text-xs">
            Model RIASEC (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) 
            to jedno z najbardziej uznanych narzędzi do badania preferencji zawodowych.
          </p>
        </div>
      </div>
    </div>
  );
}
