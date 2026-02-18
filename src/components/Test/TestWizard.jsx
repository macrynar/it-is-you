import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { HEXACO_TEST } from '../../data/tests/hexaco.js';
import { ENNEAGRAM_TEST } from '../../data/tests/enneagram.js';
import { DARK_TRIAD_TEST } from '../../data/tests/darkTriad.js';
import { 
  calculateHexacoScore, 
  generateHexacoReport,
  calculateEnneagramScore,
  generateEnneagramReport,
  calculateDarkTriadScore,
  generateDarkTriadReport
} from '../../utils/scoring.js';
import { supabase } from '../../lib/supabaseClient.js';

export default function TestWizard({ testType = 'hexaco' }) {
  // Select test data based on testType prop
  const TEST_DATA = testType === 'dark_triad' 
    ? DARK_TRIAD_TEST 
    : testType === 'enneagram' 
      ? ENNEAGRAM_TEST 
      : HEXACO_TEST;
  const isEnneagram = TEST_DATA.scale_type === 'forced_choice';
  const isDarkTriad = testType === 'dark_triad';
  
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
      else if (!isEnneagram && e.key >= '1' && e.key <= '5') {
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
  }, [currentQuestionIndex, responses, canGoNext, canGoPrev, isEnneagram]);

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
    } else {
      const dimensionInfo = TEST_DATA.dimensions.find(d => d.id === currentQuestion.dimension);
      return {
        label: dimensionInfo?.name || 'Test',
        color: 'from-cyan-500 to-blue-500'
      };
    }
  };

  const badgeInfo = getBadgeInfo();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white">
                {TEST_DATA.test_name}
              </h1>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-slate-400">
                Pytanie <span className={`font-bold ${isDarkTriad ? 'text-rose-400' : 'text-cyan-400'}`}>{currentQuestionIndex + 1}</span>
                <span className="text-slate-600"> / {totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <div 
            className={`h-full bg-gradient-to-r ${isDarkTriad ? 'from-rose-600 to-red-600' : 'from-cyan-500 to-blue-500'} transition-all duration-500 ease-out relative`}
            style={{ width: `${progress}%` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${isDarkTriad ? 'from-rose-600 to-red-600' : 'from-cyan-500 to-blue-500'} blur-md opacity-60`}></div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Dimension Badge */}
        <div className="flex justify-center mb-6">
          <div className={`px-4 py-1.5 rounded-full bg-slate-800/50 border ${isDarkTriad ? 'border-rose-500/30' : 'border-cyan-500/30'} backdrop-blur-sm`}>
            <span className={`text-xs font-semibold ${isDarkTriad ? 'text-rose-400' : 'text-cyan-400'} uppercase tracking-wider`}>{badgeInfo.label}</span>
          </div>
        </div>

        {/* Question UI - Conditional based on test type */}
        {isEnneagram ? (
          /* ENNEAGRAM: Forced Choice - Two Cards Side by Side */
          <div className="mb-8">
            <h2 className="text-xl font-medium text-center text-white mb-6">
              Która opcja bardziej do Ciebie pasuje?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Option A */}
              <button
                onClick={() => handleAnswer('a')}
                className={`group relative p-6 rounded-2xl transition-all duration-500 min-h-[200px] flex flex-col justify-center ${
                  responses[currentQuestion.id] === 'a'
                    ? 'border-2 border-cyan-400 bg-cyan-900/50 shadow-[0_0_40px_rgba(34,211,238,0.4)] scale-105'
                    : 'border-2 border-slate-700 bg-slate-900/50 hover:border-cyan-500/50 hover:bg-cyan-950/20 hover:scale-102'
                }`}
              >
                <div className="absolute top-6 left-6">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    responses[currentQuestion.id] === 'a'
                      ? 'border-cyan-400 bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                      : 'border-slate-600 text-slate-500 group-hover:border-cyan-500/50 group-hover:text-cyan-400'
                  }`}>
                    A
                  </div>
                </div>
                <p className={`text-lg leading-relaxed transition-colors duration-300 ${
                  responses[currentQuestion.id] === 'a'
                    ? 'text-white font-medium'
                    : 'text-slate-300 group-hover:text-white'
                }`}>
                  {currentQuestion.option_a}
                </p>
              </button>

              {/* Option B */}
              <button
                onClick={() => handleAnswer('b')}
                className={`group relative p-6 rounded-2xl transition-all duration-500 min-h-[200px] flex flex-col justify-center ${
                  responses[currentQuestion.id] === 'b'
                    ? 'border-2 border-purple-400 bg-purple-900/50 shadow-[0_0_40px_rgba(168,85,247,0.4)] scale-105'
                    : 'border-2 border-slate-700 bg-slate-900/50 hover:border-purple-500/50 hover:bg-purple-950/20 hover:scale-102'
                }`}
              >
                <div className="absolute top-6 left-6">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    responses[currentQuestion.id] === 'b'
                      ? 'border-purple-400 bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                      : 'border-slate-600 text-slate-500 group-hover:border-purple-500/50 group-hover:text-purple-400'
                  }`}>
                    B
                  </div>
                </div>
                <p className={`text-xl leading-relaxed transition-colors duration-300 ${
                  responses[currentQuestion.id] === 'b'
                    ? 'text-white font-medium'
                    : 'text-slate-300 group-hover:text-white'
                }`}>
                  {currentQuestion.option_b}
                </p>
              </button>
            </div>
          </div>
        ) : (
          /* HEXACO: Likert Scale 1-5 */
          <>
            {/* Question Text */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8 mb-6">
              <div className="text-center">
                <p className="text-xl md:text-2xl font-medium leading-relaxed text-white">
                  {currentQuestion.text}
                </p>
              </div>
            </div>

            {/* Likert Scale Options */}
            <div className="space-y-3 mb-8">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  className={`group w-full p-4 rounded-xl transition-all duration-300 ${
                    responses[currentQuestion.id] === value
                      ? `border ${isDarkTriad ? 'border-rose-400 bg-rose-900/50 shadow-[0_0_25px_rgba(244,63,94,0.4)]' : 'border-cyan-400 bg-cyan-900/50 shadow-[0_0_25px_rgba(34,211,238,0.4)]'}`
                      : `border border-slate-700 bg-slate-900/50 ${isDarkTriad ? 'hover:border-rose-500/50 hover:bg-rose-950/30' : 'hover:border-cyan-500/50 hover:bg-cyan-950/30'}`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        responses[currentQuestion.id] === value
                          ? `${isDarkTriad ? 'border-rose-400 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'border-cyan-400 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]'}`
                          : `border-slate-600 ${isDarkTriad ? 'group-hover:border-rose-500/50' : 'group-hover:border-cyan-500/50'}`
                      }`}>
                        {responses[currentQuestion.id] === value && (
                          <div className="w-3 h-3 rounded-full bg-white" />
                        )}
                      </div>
                      <span className={`text-base font-medium transition-colors duration-300 ${
                        responses[currentQuestion.id] === value 
                          ? 'text-white' 
                          : 'text-slate-300 group-hover:text-white'
                      }`}>
                        {TEST_DATA.scale_labels[value]}
                      </span>
                    </div>
                    <span className={`text-2xl font-bold transition-colors duration-300 ${
                      responses[currentQuestion.id] === value
                        ? `${isDarkTriad ? 'text-rose-400' : 'text-cyan-400'}`
                        : 'text-slate-700 group-hover:text-slate-500'
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
        <div className="text-center text-sm text-slate-600 mb-8">
          <span className="inline-flex items-center gap-2">
            {isEnneagram ? (
              <>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs">A</kbd>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs">B</kbd>
                <span>lub strzałki do nawigacji</span>
              </>
            ) : (
              <>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs">1-5</kbd>
                <span>lub strzałki do nawigacji</span>
              </>
            )}
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/30 border border-red-500/50 rounded-2xl text-red-200 text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-xl font-medium transition-all duration-300 ${
              canGoPrev
                ? 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 text-white'
                : 'bg-slate-900/30 border border-slate-800 text-slate-700 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={20} />
            <span>Wstecz</span>
          </button>

          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`flex items-center space-x-2 px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                canGoNext
                  ? `bg-gradient-to-r ${isDarkTriad ? 'from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50' : 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50'} text-white`
                  : 'bg-slate-900/30 border border-slate-800 text-slate-700 cursor-not-allowed'
              }`}
            >
              <span>Dalej</span>
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canGoNext || isSubmitting}
              className={`flex items-center space-x-2 px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                canGoNext && !isSubmitting
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 text-white'
                  : 'bg-slate-900/30 border border-slate-800 text-slate-700 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Zapisywanie...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>Zakończ Test</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Question Indicator Dots */}
        <div className="mt-12 flex justify-center gap-1.5 flex-wrap max-w-2xl mx-auto">
          {TEST_DATA.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentQuestionIndex
                  ? 'bg-cyan-400 w-12 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
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
  );
}
