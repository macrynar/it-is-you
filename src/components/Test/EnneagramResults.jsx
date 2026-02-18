import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.js';
import { ENNEAGRAM_TEST } from '../../data/tests/enneagram.js';

export default function EnneagramResults() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Nie jesteś zalogowany');
      }

      // Get latest Enneagram test result
      const { data, error: fetchError } = await supabase
        .from('user_psychometrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('test_type', 'ENNEAGRAM')
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
    } catch (err) {
      console.error('Error loading results:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleRetakeTest = () => {
    if (confirm('Czy na pewno chcesz wykonać test ponownie? Obecne wyniki zostaną zastąpione.')) {
      window.location.href = '/test?type=enneagram';
    }
  };

  // Get type icon/emoji
  const getTypeIcon = (type) => {
    const icons = {
      1: '⚖️',
      2: '❤️',
      3: '⭐',
      4: '🎭',
      5: '🔬',
      6: '🛡️',
      7: '🎉',
      8: '⚡',
      9: '☮️'
    };
    return icons[type] || '✨';
  };

  // Get type color gradient
  const getTypeColor = (type) => {
    const colors = {
      1: 'from-red-500 to-orange-500',
      2: 'from-pink-500 to-rose-500',
      3: 'from-yellow-500 to-amber-500',
      4: 'from-purple-500 to-violet-500',
      5: 'from-blue-500 to-cyan-500',
      6: 'from-green-500 to-emerald-500',
      7: 'from-orange-500 to-yellow-500',
      8: 'from-red-600 to-red-500',
      9: 'from-teal-500 to-cyan-500'
    };
    return colors[type] || 'from-slate-500 to-slate-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Ładowanie wyników...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
        <div className="max-w-md mx-auto bg-slate-900/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Brak wyników</h2>
          <p className="text-slate-400 mb-6">{error || 'Nie znaleziono wyników testu'}</p>
          <a
            href="/test?type=enneagram"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-violet-500 transition"
          >
            <RefreshCw size={18} />
            Wykonaj Test
          </a>
        </div>
      </div>
    );
  }

  const primaryType = results.report.primary_type;
  const wing = results.report.wing;
  const tritype = results.report.tritype;
  const allScores = results.raw_scores;
  const interpretation = primaryType.interpretation;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href="/user-profile-tests.html"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span>Wróć do Dashboardu</span>
          </a>
          <button
            onClick={handleRetakeTest}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-sm font-medium transition"
          >
            <RefreshCw size={16} />
            Wykonaj ponownie
          </button>
        </div>
      </div>

      {/* Hero Section - Primary Type */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-1 w-12 bg-emerald-500"></div>
            <Sparkles className="text-emerald-400" size={20} />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Analiza Ukończona</span>
            <Sparkles className="text-emerald-400" size={20} />
            <div className="h-1 w-12 bg-emerald-500"></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            TWÓJ TYP ENNEAGRAM
          </h1>
          <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
            <span>Test ukończony</span>
            <div className="w-1 h-1 rounded-full bg-slate-600"></div>
            <span>{new Date(results.completed_at).toLocaleDateString('pl-PL')}</span>
          </div>
        </div>

        {/* Main Type Card - Big & Bold */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className={`relative bg-gradient-to-br ${getTypeColor(primaryType.type)} p-1 rounded-3xl shadow-[0_0_60px_rgba(168,85,247,0.3)]`}>
            <div className="bg-slate-900 rounded-3xl p-12">
              <div className="text-center">
                <div className="text-8xl mb-6">{getTypeIcon(primaryType.type)}</div>
                <div className="mb-4">
                  <div className="text-7xl font-black text-white mb-2">
                    TYP {primaryType.type}
                  </div>
                  {wing && (
                    <div className="text-3xl font-semibold text-slate-400">
                      ze skrzydłem {wing.type}
                    </div>
                  )}
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">{primaryType.name}</h2>
                <p className="text-xl text-slate-300 mb-6">"{primaryType.name_en}"</p>
                <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
                  {primaryType.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Motivation & Fear */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-8">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">
              ✨ Podstawowa Motywacja
            </h3>
            <p className="text-xl text-white leading-relaxed">
              {primaryType.core_motivation}
            </p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4">
              ⚠️ Podstawowy Lęk
            </h3>
            <p className="text-xl text-white leading-relaxed">
              {primaryType.basic_fear}
            </p>
          </div>
        </div>

        {/* Strengths & Challenges */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Strengths */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-emerald-400">💪</span>
              Mocne Strony
            </h3>
            <ul className="space-y-3">
              {interpretation.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300 leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Challenges */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-amber-400">⚡</span>
              Wyzwania
            </h3>
            <ul className="space-y-3">
              {interpretation.challenges.map((challenge, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300 leading-relaxed">{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Growth Path */}
        <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-10 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🌱</span>
            <h3 className="text-2xl font-bold text-white">Ścieżka Rozwoju</h3>
          </div>
          <p className="text-xl text-slate-200 leading-relaxed">
            {interpretation.growth_path}
          </p>
        </div>

        {/* Tritype */}
        {tritype && tritype.length > 0 && (
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-white mb-6">🔺 Tritype</h3>
            <p className="text-slate-400 mb-6">
              Twój Tritype składa się z trzech dominujących typów z każdego centrum inteligencji (Gut, Heart, Head).
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {tritype.slice(0, 3).map((typeData) => {
                const typeDef = ENNEAGRAM_TEST.types.find(t => t.id === typeData.type);
                return (
                  <div key={typeData.type} className="bg-slate-800/50 rounded-xl p-6 text-center">
                    <div className="text-4xl mb-3">{getTypeIcon(typeData.type)}</div>
                    <div className="text-3xl font-bold text-white mb-2">Typ {typeData.type}</div>
                    <div className="text-sm text-slate-400 mb-2">{typeDef?.name}</div>
                    <div className="text-xs text-slate-500">{typeData.score} punktów</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Type Scores - Bar Chart */}
        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-8">📊 Wszystkie Typy</h3>
          <div className="space-y-4">
            {Object.entries(allScores)
              .sort((a, b) => b[1] - a[1])
              .map(([type, score]) => {
                const typeNum = parseInt(type);
                const typeDef = ENNEAGRAM_TEST.types.find(t => t.id === typeNum);
                const maxScore = Math.max(...Object.values(allScores));
                const percentage = (score / maxScore) * 100;
                
                return (
                  <div key={type} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(typeNum)}</span>
                        <span className="text-white font-medium">Typ {type} - {typeDef?.name}</span>
                      </div>
                      <span className="text-slate-400 font-bold">{score}</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${getTypeColor(typeNum)} transition-all duration-1000 ${
                          typeNum === primaryType.type ? 'shadow-[0_0_20px_rgba(168,85,247,0.5)]' : ''
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-12">
          <a
            href="/user-profile-tests.html"
            className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
          >
            Wróć do Dashboardu
          </a>
          <button
            onClick={handleRetakeTest}
            className="px-8 py-3.5 bg-slate-800/50 hover:bg-slate-700/70 text-white font-semibold rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-300 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Wykonaj Test Ponownie
          </button>
        </div>
      </div>
    </div>
  );
}
