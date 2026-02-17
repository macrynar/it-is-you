import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { HEXACO_TEST } from '../../data/tests/hexaco.js';
import { calculateHexacoScore, generateHexacoReport } from '../../utils/scoring.js';
import { supabase } from '../../lib/supabaseClient.js';

export default function TestWizard() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const currentQuestion = HEXACO_TEST.questions[currentQuestionIndex];
  const totalQuestions = HEXACO_TEST.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const canGoNext = responses[currentQuestion.id] !== undefined;
  const canGoPrev = currentQuestionIndex > 0;

  // Handle answer selection
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
      // Calculate scores
      const scores = calculateHexacoScore(responses);
      const report = generateHexacoReport(scores);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Nie jesteś zalogowany. Proszę zaloguj się ponownie.');
      }

      // Save to database
      const { error: insertError } = await supabase
        .from('user_psychometrics')
        .insert([{
          user_id: user.id,
          test_type: 'HEXACO',
          test_id: scores.test_id,
          raw_scores: scores.raw_scores,
          percentile_scores: scores.percentile_scores,
          raw_answers: responses,
          report: report,
          completed_at: scores.completed_at
        }]);

      if (insertError) {
        throw insertError;
      }

      // Mark user as having profile data
      localStorage.setItem('has_profile', 'true');

      // Redirect to results page
      window.location.href = '/test/hexaco/results';

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
      if (e.key >= '1' && e.key <= '5') {
        const value = parseInt(e.key);
        handleAnswer(value);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
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
  }, [currentQuestionIndex, responses, canGoNext, canGoPrev]);

  // Get dimension badge color
  const getDimensionColor = (dimension) => {
    const colors = {
      honesty_humility: 'from-purple-500 to-pink-500',
      emotionality: 'from-blue-500 to-cyan-500',
      extraversion: 'from-yellow-500 to-orange-500',
      agreeableness: 'from-green-500 to-emerald-500',
      conscientiousness: 'from-red-500 to-rose-500',
      openness: 'from-indigo-500 to-violet-500'
    };
    return colors[dimension] || 'from-gray-500 to-gray-600';
  };

  const dimensionInfo = HEXACO_TEST.dimensions.find(d => d.id === currentQuestion.dimension);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white">
                {HEXACO_TEST.test_name}
              </h1>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-slate-400">
                Pytanie <span className="text-cyan-400 font-bold">{currentQuestionIndex + 1}</span>
                <span className="text-slate-600"> / {totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar - Thin with Glow */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 blur-md opacity-60"></div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Dimension Badge */}
        <div className="flex justify-center mb-12">
          <div className="px-5 py-2 rounded-full bg-slate-800/50 border border-cyan-500/30 backdrop-blur-sm">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">{dimensionInfo?.name}</span>
          </div>
        </div>

        {/* Question Card - Floating Effect */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-10 md:p-16 mb-12 shadow-2xl shadow-cyan-500/5 hover:shadow-cyan-500/10 transition-shadow duration-500">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-medium leading-relaxed text-white">
              {currentQuestion.text}
            </p>
          </div>
        </div>

        {/* Likert Scale Options - Vertical Tiles */}
        <div className="space-y-4 mb-12">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleAnswer(value)}
              className={`group w-full p-6 rounded-2xl transition-all duration-300 ${
                responses[currentQuestion.id] === value
                  ? 'border border-cyan-400 bg-cyan-900/50 shadow-[0_0_25px_rgba(34,211,238,0.4)]'
                  : 'border border-slate-700 bg-slate-900/50 hover:border-cyan-500/50 hover:bg-cyan-950/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    responses[currentQuestion.id] === value
                      ? 'border-cyan-400 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                      : 'border-slate-600 group-hover:border-cyan-500/50'
                  }`}>
                    {responses[currentQuestion.id] === value && (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </div>
                  <span className={`text-lg font-medium transition-colors duration-300 ${
                    responses[currentQuestion.id] === value 
                      ? 'text-white' 
                      : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {HEXACO_TEST.scale_labels[value]}
                  </span>
                </div>
                <span className={`text-3xl font-bold transition-colors duration-300 ${
                  responses[currentQuestion.id] === value
                    ? 'text-cyan-400'
                    : 'text-slate-700 group-hover:text-slate-500'
                }`}>
                  {value}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Keyboard Hint */}
        <div className="text-center text-sm text-slate-600 mb-8">
          <span className="inline-flex items-center gap-2">
            <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs">1-5</kbd>
            <span>lub strzałki do nawigacji</span>
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
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 text-white'
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
          {HEXACO_TEST.questions.map((q, idx) => (
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
