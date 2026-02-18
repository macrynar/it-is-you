import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { HEXACO_TEST } from '../../data/tests/hexaco.js';
import { ENNEAGRAM_TEST } from '../../data/tests/enneagram.js';
import { DARK_TRIAD_TEST } from '../../data/tests/darkTriad.js';
import { STRENGTHS_TEST } from '../../data/tests/strengths.js';
import { CAREER_TEST } from '../../data/tests/career.js';
import { VALUES_TEST } from '../../data/tests/values.js';
import { 
  calculateHexacoScore, 
  generateHexacoReport,
  calculateEnneagramScore,
  generateEnneagramReport,
  calculateDarkTriadScore,
  generateDarkTriadReport,
  calculateStrengthsScore,
  generateStrengthsReport,
  calculateCareerScore,
  generateCareerReport,
  calculateValuesScore,
  generateValuesReport
} from '../../utils/scoring.js';
import { supabase } from '../../lib/supabaseClient.js';

export default function TestWizard({ testType = 'hexaco' }) {
  // Select test data based on testType prop
  const TEST_DATA = testType === 'dark_triad' 
    ? DARK_TRIAD_TEST 
    : testType === 'enneagram' 
      ? ENNEAGRAM_TEST 
      : testType === 'strengths'
        ? STRENGTHS_TEST
        : testType === 'career'
          ? CAREER_TEST
          : testType === 'values'
            ? VALUES_TEST
            : HEXACO_TEST;
  const isEnneagram = TEST_DATA.scale_type === 'forced_choice';
  const isDarkTriad = testType === 'dark_triad';
  const isStrengths = testType === 'strengths';
  const isCareer = testType === 'career';
  const isValues = testType === 'values';
  const isLikert6 = TEST_DATA.scale_type === 'likert_6';
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const currentQuestion = TEST_DATA.questions[currentQuestionIndex];
  const totalQuestions = TEST_DATA.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const canGoNext = responses[currentQuestion.id] !== undefined;
  const canGoPrev = currentQuestionIndex > 0;

  // Handle answer selection (works for both scales)
  const handleAnswer = (value) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  // Navigate to next question
  const handleNext = () => {
    if (canGoNext && !isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit test and save results
  const handleSubmit = async () => {
    if (Object.keys(responses).length !== totalQuestions) {
      setError('Proszę odpowiedzieć na wszystkie pytania.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Calculate scores based on test type
      let scores, report, dbTestType, redirectPath;
      
      if (isDarkTriad) {
        scores = calculateDarkTriadScore(responses);
        report = generateDarkTriadReport(scores);
        dbTestType = 'DARK_TRIAD';
        redirectPath = '/test/dark-triad/results';
      } else if (isEnneagram) {
        scores = calculateEnneagramScore(responses);
        report = generateEnneagramReport(scores);
        dbTestType = 'ENNEAGRAM';
        redirectPath = '/test/enneagram/results';
      } else if (isStrengths) {
        scores = calculateStrengthsScore(responses);
        report = generateStrengthsReport(scores);
        dbTestType = 'STRENGTHS';
        redirectPath = '/test/strengths/results';
      } else if (isCareer) {
        scores = calculateCareerScore(responses);
        report = generateCareerReport(scores);
        dbTestType = 'CAREER';
        redirectPath = '/test/career/results';
      } else if (isValues) {
        scores = calculateValuesScore(responses);
        report = generateValuesReport(scores);
        dbTestType = 'VALUES';
        redirectPath = '/test/values/results';
      } else {
        scores = calculateHexacoScore(responses);
        report = generateHexacoReport(scores);
        dbTestType = 'HEXACO';
        redirectPath = '/test/hexaco/results';
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Nie jesteś zalogowany. Proszę zaloguj się ponownie.');
      }

      // Save to database
      const dbPayload = {
        user_id: user.id,
        test_type: dbTestType,
        test_id: scores.test_id,
        completed_at: scores.completed_at,
        report: report
      };

      // Add appropriate scores based on test type
      if (isDarkTriad) {
        // Store all Dark Triad data in JSONB fields
        dbPayload.raw_scores = {
          dimensions: scores.dimensions,
          risk_levels: scores.risk_levels,
          overall_risk: scores.overall_risk,
          highest_dimension: scores.highest_dimension
        };
        dbPayload.raw_answers = responses;
      } else if (isEnneagram) {
        dbPayload.raw_scores = scores.all_scores;
        dbPayload.raw_answers = responses;
      } else if (isStrengths) {
        // Store top 5 and all category data
        dbPayload.raw_scores = {
          top_5: scores.top_5,
          all_scores: scores.all_scores,
          category_scores: scores.category_scores,
          dominant_category: scores.dominant_category
        };
        dbPayload.raw_answers = responses;
      } else if (isCareer) {
        // Store Holland Code and top 3 interests
        dbPayload.raw_scores = {
          holland_code: scores.holland_code,
          top_3: scores.top_3,
          all_scores: scores.all_scores,
          chart_data: scores.chart_data
        };
        dbPayload.raw_answers = responses;
      } else if (isValues) {
        // Store MRAT centered scores and value data
        dbPayload.raw_scores = {
          mrat: scores.mrat,
          top_3: scores.top_3,
          bottom_3: scores.bottom_3,
          all_scores: scores.all_scores,
          chart_data: scores.chart_data,
          sorted_values: scores.sorted_values
        };
        dbPayload.raw_answers = responses;
      } else {
        dbPayload.raw_scores = scores.raw_scores;
        dbPayload.percentile_scores = scores.percentile_scores;
        dbPayload.raw_answers = responses;
      }

      const { error: insertError } = await supabase
        .from('user_psychometrics')
        .insert([dbPayload]);

      if (insertError) {
        throw insertError;
      }

      // Mark user as having profile data
      localStorage.setItem('has_profile', 'true');

      // Redirect to results page
      window.location.href = redirectPath;

    } catch (err) {
      console.error('Error saving test results:', err);
      setError(err.message || 'Wystąpił błąd podczas zapisywania wyników. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // For Enneagram: 'a' or 'b' keys
      if (isEnneagram && (e.key === 'a' || e.key === 'A')) {
        handleAnswer('a');
      } else if (isEnneagram && (e.key === 'b' || e.key === 'B')) {
        handleAnswer('b');
      }
      // For HEXACO: number keys 1-5
      else if (!isEnneagram && !isLikert6 && e.key >= '1' && e.key <= '5') {
        const value = parseInt(e.key);
        handleAnswer(value);
      }
      // For Values (6-point scale): number keys 1-6
      else if (!isEnneagram && isLikert6 && e.key >= '1' && e.key <= '6') {
        const value = parseInt(e.key);
        handleAnswer(value);
      }
      // Navigation keys
      else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (canGoNext && !isLastQuestion) {
          handleNext();
        } else if (isLastQuestion && canGoNext) {
          handleSubmit();
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex, responses, canGoNext, canGoPrev, isEnneagram, isLikert6]);

  // Get dimension/type badge info
  const getBadgeInfo = () => {
    if (isDarkTriad) {
      const dimensionInfo = TEST_DATA.dimensions.find(d => d.id === currentQuestion.dimension);
      return {
        label: dimensionInfo?.name || 'Dark Triad',
        color: 'from-rose-600 to-red-600'
      };
    } else if (isEnneagram) {
      return {
        label: 'Enneagram Type',
        color: 'from-purple-500 to-violet-500'
      };
    } else if (isStrengths) {
      const strengthInfo = TEST_DATA.strengths.find(s => s.id === currentQuestion.strength);
      return {
        label: strengthInfo?.name || 'Talenty',
        color: 'from-cyan-500 to-indigo-500'
      };
    } else if (isCareer) {
      const interestInfo = TEST_DATA.interest_types.find(t => t.id === currentQuestion.interest);
      return {
        label: interestInfo?.name || 'Zainteresowania',
        color: 'from-indigo-500 to-purple-500'
      };
    } else if (isValues) {
      const valueInfo = TEST_DATA.values.find(v => v.id === currentQuestion.value);
      return {
        label: valueInfo?.name || 'Wartości',
        color: 'from-teal-500 to-cyan-500'
      };
    } else {
      const dimensionInfo = TEST_DATA.dimensions.find(d => d.id === currentQuestion.dimension);
      return {
        label: dimensionInfo?.name || 'Test',
        color: 'from-cyan-500 to-blue-500'
      };
    }
  };

  const badgeInfo = getBadgeInfo();

  const accentText = isDarkTriad ? 'text-rose-400' : isStrengths ? 'text-indigo-400' : isCareer ? 'text-purple-400' : isValues ? 'text-teal-400' : 'text-cyan-400';
  const accentBorder = isDarkTriad ? 'border-rose-500/30' : isStrengths ? 'border-indigo-500/30' : isValues ? 'border-teal-500/30' : 'border-cyan-500/30';
  const gradientBar = isDarkTriad ? 'from-rose-600 to-red-600' : isStrengths ? 'from-cyan-500 to-indigo-500' : isCareer ? 'from-indigo-500 to-purple-500' : isValues ? 'from-teal-500 to-cyan-500' : 'from-cyan-500 to-blue-500';
  const selectedOption = isDarkTriad ? 'border-rose-400 bg-rose-900/50 shadow-[0_0_20px_rgba(244,63,94,0.35)]' : isStrengths ? 'border-indigo-400 bg-indigo-900/50 shadow-[0_0_20px_rgba(99,102,241,0.35)]' : isValues ? 'border-teal-400 bg-teal-900/50 shadow-[0_0_20px_rgba(20,184,166,0.35)]' : 'border-cyan-400 bg-cyan-900/50 shadow-[0_0_20px_rgba(34,211,238,0.35)]';
  const hoverOption = isDarkTriad ? 'hover:border-rose-500/50 hover:bg-rose-950/30' : isStrengths ? 'hover:border-indigo-500/50 hover:bg-indigo-950/30' : isValues ? 'hover:border-teal-500/50 hover:bg-teal-950/30' : 'hover:border-cyan-500/50 hover:bg-cyan-950/30';
  const selectedDot = isDarkTriad ? 'border-rose-400 bg-rose-500' : isStrengths ? 'border-indigo-400 bg-indigo-500' : isValues ? 'border-teal-400 bg-teal-500' : 'border-cyan-400 bg-cyan-500';
  const hoverDot = isDarkTriad ? 'group-hover:border-rose-500/50' : isStrengths ? 'group-hover:border-indigo-500/50' : isValues ? 'group-hover:border-teal-500/50' : 'group-hover:border-cyan-500/50';
  const nextGradient = isDarkTriad ? 'from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-500/30 hover:shadow-rose-500/50' : isStrengths ? 'from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-indigo-500/30 hover:shadow-indigo-500/50' : isCareer ? 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-purple-500/30 hover:shadow-purple-500/50' : isValues ? 'from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-teal-500/30 hover:shadow-teal-500/50' : 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/30 hover:shadow-cyan-500/50';

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">

      {/* Header */}
      <div className="shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <h1 className="text-base font-semibold text-white">{TEST_DATA.test_name}</h1>
          <div className="text-sm font-medium text-slate-400">
            Pytanie <span className={`font-bold ${accentText}`}>{currentQuestionIndex + 1}</span>
            <span className="text-slate-600"> / {totalQuestions}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="shrink-0 h-1 bg-slate-800">
        <div
          className={`h-full bg-gradient-to-r ${gradientBar} transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-4">

          {/* Dimension Badge */}
          <div className="flex justify-center mb-3">
            <div className={`px-4 py-1 rounded-full bg-slate-800/50 border ${accentBorder} backdrop-blur-sm`}>
              <span className={`text-xs font-semibold ${accentText} uppercase tracking-wider`}>{badgeInfo.label}</span>
            </div>
          </div>

          {/* Question UI */}
          {isEnneagram ? (
            <div className="mb-3">
              <h2 className="text-sm font-medium text-center text-slate-300 mb-3">
                Która opcja bardziej do Ciebie pasuje?
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {/* Option A */}
                <button
                  onClick={() => handleAnswer('a')}
                  className={`group relative p-4 rounded-xl transition-all duration-300 min-h-[120px] flex flex-col justify-center ${
                    responses[currentQuestion.id] === 'a'
                      ? 'border-2 border-cyan-400 bg-cyan-900/50 shadow-[0_0_30px_rgba(34,211,238,0.35)] scale-[1.02]'
                      : 'border-2 border-slate-700 bg-slate-900/50 hover:border-cyan-500/50 hover:bg-cyan-950/20'
                  }`}
                >
                  <div className="absolute top-4 left-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      responses[currentQuestion.id] === 'a'
                        ? 'border-cyan-400 bg-cyan-500 text-white'
                        : 'border-slate-600 text-slate-500 group-hover:border-cyan-500/50 group-hover:text-cyan-400'
                    }`}>A</div>
                  </div>
                  <p className={`text-sm leading-relaxed pl-2 transition-colors duration-300 ${
                    responses[currentQuestion.id] === 'a' ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {currentQuestion.option_a}
                  </p>
                </button>

                {/* Option B */}
                <button
                  onClick={() => handleAnswer('b')}
                  className={`group relative p-4 rounded-xl transition-all duration-300 min-h-[120px] flex flex-col justify-center ${
                    responses[currentQuestion.id] === 'b'
                      ? 'border-2 border-purple-400 bg-purple-900/50 shadow-[0_0_30px_rgba(168,85,247,0.35)] scale-[1.02]'
                      : 'border-2 border-slate-700 bg-slate-900/50 hover:border-purple-500/50 hover:bg-purple-950/20'
                  }`}
                >
                  <div className="absolute top-4 left-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      responses[currentQuestion.id] === 'b'
                        ? 'border-purple-400 bg-purple-500 text-white'
                        : 'border-slate-600 text-slate-500 group-hover:border-purple-500/50 group-hover:text-purple-400'
                    }`}>B</div>
                  </div>
                  <p className={`text-sm leading-relaxed pl-2 transition-colors duration-300 ${
                    responses[currentQuestion.id] === 'b' ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {currentQuestion.option_b}
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Question Text */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-xl p-4 mb-3">
                <p className="text-base font-medium leading-relaxed text-white text-center">
                  {currentQuestion.text}
                </p>
              </div>

              {/* Likert Scale Options */}
              <div className="space-y-2 mb-3">
                {(isLikert6 ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5]).map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAnswer(value)}
                    className={`group w-full px-4 py-3 rounded-xl transition-all duration-200 border ${
                      responses[currentQuestion.id] === value
                        ? selectedOption
                        : `border-slate-700 bg-slate-900/50 ${hoverOption}`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          responses[currentQuestion.id] === value
                            ? selectedDot
                            : `border-slate-600 ${hoverDot}`
                        }`}>
                          {responses[currentQuestion.id] === value && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className={`text-sm font-medium transition-colors duration-200 ${
                          responses[currentQuestion.id] === value ? 'text-white' : 'text-slate-300 group-hover:text-white'
                        }`}>
                          {TEST_DATA.scale_labels[value]}
                        </span>
                      </div>
                      <span className={`text-xl font-bold transition-colors duration-200 ${
                        responses[currentQuestion.id] === value ? accentText : 'text-slate-700 group-hover:text-slate-500'
                      }`}>
                        {value}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Keyboard Hint */}
          <div className="text-center text-xs text-slate-600 mb-3">
            <span className="inline-flex items-center gap-2">
              {isEnneagram ? (
                <>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">A</kbd>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">B</kbd>
                  <span>lub strzałki do nawigacji</span>
                </>
              ) : (
                <>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">{isLikert6 ? '1-6' : '1-5'}</kbd>
                  <span>lub strzałki do nawigacji</span>
                </>
              )}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm text-center backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                canGoPrev
                  ? 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 text-white'
                  : 'bg-slate-900/30 border border-slate-800 text-slate-700 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={18} />
              <span>Wstecz</span>
            </button>

            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`flex items-center space-x-2 px-7 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  canGoNext
                    ? `bg-gradient-to-r ${nextGradient} shadow-lg text-white`
                    : 'bg-slate-900/30 border border-slate-800 text-slate-700 cursor-not-allowed'
                }`}
              >
                <span>Dalej</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canGoNext || isSubmitting}
                className={`flex items-center space-x-2 px-7 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  canGoNext && !isSubmitting
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-lg shadow-emerald-500/30 text-white'
                    : 'bg-slate-900/30 border border-slate-800 text-slate-700 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Zapisywanie...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Zakończ Test</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Question Indicator Dots */}
          <div className="mt-4 flex justify-center gap-1 flex-wrap max-w-2xl mx-auto">
            {TEST_DATA.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentQuestionIndex
                    ? `${accentText.replace('text-', 'bg-')} w-10 shadow-sm`
                    : responses[q.id] !== undefined
                    ? 'bg-emerald-500/60 w-1.5'
                    : 'bg-slate-700 w-1.5 hover:bg-slate-600'
                }`}
                title={`Pytanie ${idx + 1}${responses[q.id] ? ' (odpowiedziano)' : ''}`}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
