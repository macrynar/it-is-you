import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Award, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.js';
import { STRENGTHS_TEST } from '../../data/tests/strengths.js';
import { generateStrengthsReport } from '../../utils/scoring.js';

/**
 * Strengths Assessment Results Component
 * Displays Top 5 talents with detailed interpretations
 * Organized by 4 competency categories
 */
export default function StrengthsResults() {
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

      // Fetch latest Strengths test result
      const { data, error: fetchError } = await supabase
        .from('user_psychometrics')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('test_type', 'STRENGTHS')
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
      const fullReport = generateStrengthsReport(scoresData);
      
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
      window.location.href = '/test?type=strengths';
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = '/user-profile-tests.html';
  };

  // Get category color classes
  const getCategoryColor = (categoryId) => {
    const category = STRENGTHS_TEST.categories.find(c => c.id === categoryId);
    if (!category) return 'emerald';
    
    const colorMap = {
      'emerald-500': 'emerald',
      'purple-500': 'purple',
      'amber-500': 'amber',
      'blue-500': 'blue'
    };
    
    return colorMap[category.color] || 'emerald';
  };

  const getCategoryInfo = (categoryId) => {
    return STRENGTHS_TEST.categories.find(c => c.id === categoryId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-cyan-400">Ładowanie wyników...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="glass-card-active max-w-md w-full p-8 text-center">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-400 mb-4">Błąd</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={handleBackToDashboard}
            className="btn-primary"
          >
            Wróć do Dashboardu
          </button>
        </div>
      </div>
    );
  }

  if (!report || !report.top_5) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="glass-card-active max-w-md w-full p-8 text-center">
          <p className="text-slate-300">Brak danych do wyświetlenia</p>
          <button onClick={handleBackToDashboard} className="btn-primary mt-4">
            Wróć do Dashboardu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Hero Section */}
        <div className="glass-card-active p-6 mb-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/40 via-blue-950/40 to-purple-950/40"></div>
          <div className="relative z-10">
            <div className="text-5xl mb-3">🎯</div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Twoje Top 5 Talentów
            </h1>
            <p className="text-slate-300 text-sm">
              Odkryj swoje naturalne mocne strony
            </p>
            {report.completed_at && (
              <p className="text-slate-400 text-xs mt-2">
                Ukończono: {new Date(report.completed_at).toLocaleDateString('pl-PL')}
              </p>
            )}
          </div>
        </div>

        {/* Primary Strength Highlight */}
        {report.summary?.primary_strength && (
          <div className="glass-card-active p-6 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 to-yellow-950/30"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Award className="text-amber-400" size={24} />
                <h2 className="text-xl font-bold text-amber-400">
                  Twój Główny Talent
                </h2>
              </div>
              <p className="text-2xl font-bold text-white mb-2">
                {report.summary.primary_strength.name}
              </p>
              <p className="text-slate-300 text-sm">
                {report.summary.primary_strength.name_en}
              </p>
            </div>
          </div>
        )}

        {/* Top 5 Talents List */}
        <div className="space-y-6 mb-8">
          {report.top_5.map((talent, index) => {
            const categoryInfo = getCategoryInfo(talent.category);
            const colorName = getCategoryColor(talent.category);
            
            return (
              <div
                key={talent.id}
                className="glass-card-active p-6 relative overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Rank Badge */}
                <div className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br from-${colorName}-500 to-${colorName}-600 flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  #{talent.rank}
                </div>

                {/* Talent Header */}
                <div className="pr-16 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{categoryInfo?.icon || '⭐'}</span>
                    <h3 className="text-2xl font-bold text-white">
                      {talent.name}
                    </h3>
                  </div>
                  <p className={`text-${colorName}-400 text-sm mb-2`}>
                    {talent.name_en}
                  </p>
                  <div className={`inline-block px-3 py-1 rounded-full bg-${colorName}-950/50 border border-${colorName}-500/30 text-${colorName}-400 text-xs`}>
                    {categoryInfo?.name || talent.category}
                  </div>
                </div>

                {/* Score Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Wynik</span>
                    <span>{talent.score.toFixed(2)} / 5.00</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${colorName}-500 to-${colorName}-400 transition-all duration-1000`}
                      style={{ width: `${(talent.score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                  {talent.description}
                </p>

                {/* Keywords */}
                {talent.keywords && talent.keywords.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 mb-2">Kluczowe cechy:</p>
                    <div className="flex flex-wrap gap-2">
                      {talent.keywords.map((keyword, kidx) => (
                        <span
                          key={kidx}
                          className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interpretation */}
                {talent.interpretation && (
                  <div className="border-t border-slate-700 pt-4 mt-4 space-y-4">
                    {/* Overview */}
                    <div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {talent.interpretation.overview}
                      </p>
                    </div>

                    {/* How to Use */}
                    {talent.interpretation.how_to_use && talent.interpretation.how_to_use.length > 0 && (
                      <div>
                        <h4 className={`text-${colorName}-400 font-bold text-sm mb-2 flex items-center gap-2`}>
                          <Sparkles size={16} />
                          Jak wykorzystać ten talent:
                        </h4>
                        <ul className="space-y-1.5 ml-6">
                          {talent.interpretation.how_to_use.map((tip, tidx) => (
                            <li key={tidx} className="text-slate-300 text-sm list-disc">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Watch Out */}
                    {talent.interpretation.watch_out && talent.interpretation.watch_out.length > 0 && (
                      <div>
                        <h4 className="text-amber-400 font-bold text-sm mb-2">
                          ⚠️ Na co uważać:
                        </h4>
                        <ul className="space-y-1.5 ml-6">
                          {talent.interpretation.watch_out.map((warning, widx) => (
                            <li key={widx} className="text-slate-300 text-sm list-disc">
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Category Distribution */}
        {report.category_scores && (
          <div className="glass-card-active p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              📊 Rozkład Kategorii
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(report.category_scores).map(([catId, catData]) => {
                const categoryInfo = getCategoryInfo(catId);
                const colorName = getCategoryColor(catId);
                
                return (
                  <div
                    key={catId}
                    className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{categoryInfo?.icon || '⭐'}</span>
                      <h3 className={`font-bold text-${colorName}-400`}>
                        {categoryInfo?.name || catId}
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-300">
                        <span>Średni wynik:</span>
                        <span className="font-bold">{catData.average_score.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Talenty w Top 5:</span>
                        <span className="font-bold">{catData.count_in_top5}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full bg-gradient-to-r from-${colorName}-500 to-${colorName}-400`}
                          style={{ width: `${(catData.average_score / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dominant Category */}
        {report.dominant_category && (
          <div className="glass-card-active p-6 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 to-indigo-950/30"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
                👑 Twoja Dominująca Kategoria
              </h2>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{report.dominant_category.icon}</span>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {report.dominant_category.name}
                  </h3>
                  <p className="text-slate-300 text-sm">
                    {report.dominant_category.name_en}
                  </p>
                </div>
              </div>
              {report.dominant_category.description && (
                <p className="text-slate-300 text-sm leading-relaxed">
                  {report.dominant_category.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleBackToDashboard}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Wróć do Dashboardu
          </button>
          <button
            onClick={handleRetakeTest}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} />
            Wykonaj Ponownie
          </button>
        </div>

      </div>
    </div>
  );
}
