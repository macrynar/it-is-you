import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { DARK_TRIAD_TEST } from '../../data/tests/darkTriad.js';
import { generateDarkTriadReport } from '../../utils/scoring.js';

/**
 * Dark Triad Results Component
 * "System Alert" style - showing shadow personality traits
 * Red theme with risk indicators
 */
function DarkTriadResults() {
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

      // Fetch latest Dark Triad test result
      const { data, error: fetchError } = await supabase
        .from('user_psychometrics')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('test_type', 'DARK_TRIAD')
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
      
      // Generate full report
      const fullReport = generateDarkTriadReport({
        test_id: testResult.test_type,
        test_name: 'Dark Triad SD3',
        completed_at: testResult.completed_at,
        dimensions: testResult.raw_scores,
        risk_levels: testResult.risk_levels || {},
        overall_risk: testResult.overall_risk || 'average',
        highest_dimension: testResult.highest_dimension || {},
        sorted_dimensions: Object.entries(testResult.raw_scores || {}).map(([id, data]) => {
          const dim = DARK_TRIAD_TEST.dimensions.find(d => d.id === id);
          return {
            id,
            name: dim?.name || id,
            name_en: dim?.name_en || id,
            icon: dim?.icon || '⚠️',
            score: data.raw_score,
            level: data.level
          };
        }).sort((a, b) => b.score - a.score)
      });

      setReport(fullReport);
      setLoading(false);
    } catch (err) {
      console.error('Error loading Dark Triad results:', err);
      setError('Błąd podczas ładowania wyników');
      setLoading(false);
    }
  }

  // Get color classes based on risk level
  const getRiskColor = (level) => {
    switch(level) {
      case 'high':
        return {
          bg: 'bg-rose-950/30',
          border: 'border-rose-500',
          text: 'text-rose-400',
          glow: 'shadow-rose-500/50',
          bar: 'bg-gradient-to-r from-rose-600 to-red-600',
          pulse: 'animate-pulse'
        };
      case 'average':
        return {
          bg: 'bg-orange-950/20',
          border: 'border-orange-500/50',
          text: 'text-orange-400',
          glow: 'shadow-orange-500/20',
          bar: 'bg-gradient-to-r from-orange-600 to-amber-600',
          pulse: ''
        };
      default: // low
        return {
          bg: 'bg-slate-900/30',
          border: 'border-slate-600',
          text: 'text-slate-400',
          glow: 'shadow-slate-500/10',
          bar: 'bg-gradient-to-r from-slate-600 to-slate-500',
          pulse: ''
        };
    }
  };

  // Get risk badge
  const getRiskBadge = (level) => {
    switch(level) {
      case 'high':
        return <span className="px-3 py-1 bg-rose-600/20 border border-rose-500 text-rose-400 rounded-full text-xs font-bold uppercase tracking-wider">⚠️ Wysokie Ryzyko</span>;
      case 'average':
        return <span className="px-3 py-1 bg-orange-600/20 border border-orange-500/50 text-orange-400 rounded-full text-xs font-semibold uppercase tracking-wider">⚡ W Normie</span>;
      default:
        return <span className="px-3 py-1 bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 rounded-full text-xs font-semibold uppercase tracking-wider">✓ Niskie</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Analiza Cienia...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 flex items-center justify-center p-6">
        <div className="bg-rose-950/30 border border-rose-500 rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-rose-400 mb-2">Błąd</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.href = '/test?type=dark_triad'}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all"
          >
            Wróć do Testu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header - System Alert Style */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-rose-950/50 border border-rose-500/50 rounded-full">
            <span className="text-rose-400 font-mono text-sm tracking-wider">SYSTEM ALERT: PERSONALITY ANALYSIS</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Analiza <span className="text-rose-500">Cienia</span>
          </h1>
          <p className="text-slate-400 text-lg">Dark Triad Assessment (SD3)</p>
          
          {/* Overall Risk Alert */}
          <div className={`mt-6 p-6 rounded-2xl border-2 ${getRiskColor(report.overall_risk).bg} ${getRiskColor(report.overall_risk).border}`}>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-4xl">{report.overall_risk === 'high' ? '⚠️' : report.overall_risk === 'average' ? '⚡' : '✓'}</div>
              <div className="text-left">
                <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">Status Ogólny</div>
                <div className={`text-2xl font-bold ${getRiskColor(report.overall_risk).text}`}>
                  {report.risk_alert}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions Analysis */}
        <div className="grid gap-6 mb- 8">
          {report.sorted_dimensions.map((dimension, index) => {
            const dimData = report.dimensions[dimension.id];
            const colors = getRiskColor(dimData.level);
            const norm = DARK_TRIAD_TEST.norms[dimension.id];
            
            // Calculate position for score marker (1-5 scale)
            const scorePosition = ((dimData.raw_score - 1) / 4) * 100;
            const normPosition = ((norm.mean - 1) / 4) * 100;

            return (
              <div 
                key={dimension.id}
                className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${colors.glow} shadow-xl`}
              >
                {/* Dimension Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{dimension.icon}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{dimension.name}</h3>
                      <p className="text-slate-400 text-sm">{dimension.name_en}</p>
                    </div>
                  </div>
                  {getRiskBadge(dimData.level)}
                </div>

                {/* Score Bar with Norm Marker */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>1.0</span>
                    <span className="text-slate-400">Norma: {norm.mean}</span>
                    <span>5.0</span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="relative h-12 bg-slate-900/50 rounded-xl overflow-hidden backdrop-blur-sm">
                    {/* Filled portion */}
                    <div 
                      className={`absolute left-0 top-0 h-full ${colors.bar} ${colors.pulse} transition-all duration-1000 ease-out flex items-center justify-end pr-3`}
                      style={{ width: `${scorePosition}%` }}
                    >
                      <span className="text-white font-bold text-sm drop-shadow-lg">
                        {dimData.raw_score}
                      </span>
                    </div>
                    
                    {/* Population Norm Marker - Vertical Line */}
                    <div 
                      className="absolute top-0 h-full w-1 bg-cyan-400 opacity-60"
                      style={{ left: `${normPosition}%` }}
                      title={`Średnia populacji: ${norm.mean}`}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full"></div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full"></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-slate-500">
                      vs średnia: <span className={`font-bold ${dimData.vs_population > 0 ? colors.text : 'text-emerald-400'}`}>
                        {dimData.vs_population > 0 ? '+' : ''}{dimData.vs_population}
                      </span>
                    </span>
                    <span className="text-slate-500">
                      Percentyl: <span className="font-bold text-slate-300">{dimData.percentile}%</span>
                    </span>
                  </div>
                </div>

                {/* Interpretation */}
                <div className="border-t border-slate-700/50 pt-4">
                  <p className="text-slate-300 mb-4 leading-relaxed">
                    {dimData.interpretation.description}
                  </p>
                  
                  {/* Implications */}
                  {dimData.interpretation.implications && dimData.interpretation.implications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Implikacje:</h4>
                      <ul className="space-y-2">
                        {dimData.interpretation.implications.map((imp, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                            <span className={`${colors.text} mt-0.5`}>▸</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scientific Note */}
        <div className="mt-8 p-6 bg-slate-900/50 border border-slate-700 rounded-xl">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">📊 Informacje Naukowe</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-3">
            Dark Triad SD3 to zwalidowane narzędzie psychometryczne mierzące trzy cechy "ciemnej" osobowości:
            Makiawelizm (manipulacja), Narcyzm (megalomani a) i Psychopatia (bezwzględność).
          </p>
          <p className="text-slate-500 text-xs">
            Wyniki porównane są z normami populacyjnymi (Jones & Paulhus, 2014). 
            Podwyższone wyniki nie oznaczają diagnozy klinicznej, ale mogą wskazywać obszary do rozwoju osobistego.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => window.location.href = '/user-profile-tests.html'}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all shadow-lg"
          >
            ← Powrót do Testów
          </button>
          <button
            onClick={() => window.location.href = '/test?type=dark_triad'}
            className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-rose-500/20"
          >
            Wykonaj Test Ponownie
          </button>
        </div>

      </div>
    </div>
  );
}

export default DarkTriadResults;
