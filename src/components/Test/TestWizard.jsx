import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { HEXACO_TEST } from '../../data/tests/hexaco.js';
import { ENNEAGRAM_TEST } from '../../data/tests/enneagram.js';
import { DARK_TRIAD_TEST } from '../../data/tests/darkTriad.js';
import { STRENGTHS_TEST } from '../../data/tests/strengths.js';
import { CAREER_TEST } from '../../data/tests/career.js';
import { VALUES_TEST } from '../../data/tests/values.js';
import { CAREER_DNA_TEST } from '../../data/tests/careerDna.js';
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
  generateValuesReport,
  calculateCareerDnaScore,
  generateCareerDnaReport,
} from '../../utils/scoring.js';
import { supabase } from '../../lib/supabaseClient.js';

function hexToRgb(hex) {
  const s = String(hex || '').trim();
  const m = s.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

const TEST_META = {
  hexaco: { title: 'Rdzeń Osobowości (HEXACO)', accent: 'rgb(56, 182, 255)' },
  enneagram: { title: 'Silnik Motywacji (Enneagram)', accent: '#6A1B9A' },
  dark_triad: { title: 'Analiza Cienia (Dark Triad)', accent: '#8B0000' },
  strengths: { title: 'Mocne Strony', accent: '#FFB300' },
  career: { title: 'Profil Kariery (RIASEC)', accent: '#009688' },
  values: { title: 'Kompas Wartości (PVQ)', accent: '#00B8D4' },
  career_dna: { title: 'DNA Kariery', accent: '#f97316' },
};

export default function TestWizard({ testType = 'hexaco' }) {
  const meta = TEST_META[testType] ?? TEST_META.hexaco;
  const accent = meta.accent;
  const accentRgb = hexToRgb(accent);
  const accentRgba = (a) => {
    if (!accentRgb) return `rgba(56,182,255,${a})`;
    return `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},${a})`;
  };

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
            : testType === 'career_dna'
              ? CAREER_DNA_TEST
              : HEXACO_TEST;
  const isEnneagram = TEST_DATA.scale_type === 'forced_choice';
  const isDarkTriad = testType === 'dark_triad';
  const isStrengths = testType === 'strengths';
  const isCareer = testType === 'career';
  const isValues = testType === 'values';
  const isCareerDna = testType === 'career_dna';
  const isLikert6 = TEST_DATA.scale_type === 'likert_6';

  const layoutMaxWidth = 'max-w-[1100px]';
  
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
      } else if (isCareerDna) {
        scores = calculateCareerDnaScore(responses);
        report = generateCareerDnaReport(scores);
        dbTestType = 'CAREER_DNA';
        redirectPath = '/test/career-dna/results';
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
      } else if (isCareerDna) {
        // Store Career DNA normalized scores
        dbPayload.raw_scores = {
          normalized_scores: scores.normalized_scores,
          raw_scores: scores.raw_scores,
          top1: scores.top1,
          top2: scores.top2,
          profile_key: scores.profile_key,
          profile: scores.profile,
          chart_data: scores.chart_data,
          sorted_dimensions: scores.sorted_dimensions,
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
      // For Career DNA: 'a'-'d' keys
      else if (isCareerDna && ['a','b','c','d','A','B','C','D'].includes(e.key)) {
        handleAnswer(e.key.toLowerCase());
      }
      // For HEXACO: number keys 1-5
      else if (!isEnneagram && !isLikert6 && !isCareerDna && e.key >= '1' && e.key <= '5') {
        const value = parseInt(e.key);
        handleAnswer(value);
      }
      // For Values (6-point scale): number keys 1-6
      else if (!isEnneagram && isLikert6 && !isCareerDna && e.key >= '1' && e.key <= '6') {
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
        label: dimensionInfo?.name || 'Dark Triad'
      };
    } else if (isEnneagram) {
      return {
        label: 'Enneagram'
      };
    } else if (isStrengths) {
      const strengthInfo = TEST_DATA.strengths.find(s => s.id === currentQuestion.strength);
      return {
        label: strengthInfo?.name || 'Talenty'
      };
    } else if (isCareer) {
      const interestInfo = TEST_DATA.interest_types.find(t => t.id === currentQuestion.interest);
      return {
        label: interestInfo?.name || 'Zainteresowania'
      };
    } else if (isValues) {
      const valueInfo = TEST_DATA.values.find(v => v.id === currentQuestion.value);
      return {
        label: valueInfo?.name || 'Wartości'
      };
    } else if (isCareerDna) {
      return { label: 'DNA Kariery' };
    } else {
      const dimensionInfo = TEST_DATA.dimensions.find(d => d.id === currentQuestion.dimension);
      return {
        label: dimensionInfo?.name || 'Test'
      };
    }
  };

  const badgeInfo = getBadgeInfo();

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">

      {/* Header */}
      <div className="shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <div className={`${layoutMaxWidth} mx-auto px-6 py-3 flex items-center justify-between`}>
          <h1 className="text-base font-semibold text-white">{meta.title}</h1>
          <div className="text-sm font-medium text-slate-400">
            Pytanie <span className="font-bold" style={{ color: accent }}>{currentQuestionIndex + 1}</span>
            <span className="text-slate-600"> / {totalQuestions}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="shrink-0 h-1 bg-slate-800">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: accent, boxShadow: `0 0 18px ${accentRgba(0.18)}` }}
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className={`${layoutMaxWidth} mx-auto px-6 py-4`}>

          {/* Dimension Badge */}
          <div className="flex justify-center mb-3">
            <div
              className="px-4 py-1 rounded-full bg-slate-800/50 border backdrop-blur-sm"
              style={{ borderColor: accentRgba(0.28) }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: accent }}
              >
                {badgeInfo.label}
              </span>
            </div>
          </div>

          {/* Question UI */}
          {isCareerDna ? (
            /* ── Career DNA: 4-choice A/B/C/D ── */
            <div className="mb-3">
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-xl p-4 mb-3">
                <p className="text-base font-medium leading-relaxed text-white text-center">
                  {currentQuestion.text}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {currentQuestion.options.map((option) => {
                  const key = option.label.toLowerCase();
                  const isSelected = responses[currentQuestion.id] === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleAnswer(key)}
                      className={`group p-4 rounded-xl transition-all duration-300 min-h-[90px] flex flex-row items-start gap-3 text-left ${
                        isSelected
                          ? 'border-2 bg-slate-900/50 scale-[1.01]'
                          : 'border-2 border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/70'
                      }`}
                      style={
                        isSelected
                          ? { borderColor: accent, backgroundColor: accentRgba(0.12), boxShadow: `0 0 24px ${accentRgba(0.2)}` }
                          : undefined
                      }
                    >
                      <div className="shrink-0 mt-0.5">
                        <div
                          className="w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300"
                          style={
                            isSelected
                              ? { borderColor: accent, backgroundColor: accent, color: '#fff' }
                              : { borderColor: 'rgba(148,163,184,0.55)', color: 'rgba(148,163,184,0.75)' }
                          }
                        >
                          {option.label}
                        </div>
                      </div>
                      <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                        isSelected ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white'
                      }`}>
                        {option.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : isEnneagram ? (
            <div className="mb-3">
              <h2 className="text-sm font-medium text-center text-slate-300 mb-3">
                {currentQuestion.prompt ?? 'Która opcja bardziej do Ciebie pasuje?'}
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {/* Option A */}
                <button
                  onClick={() => handleAnswer('a')}
                  className={`group p-5 rounded-xl transition-all duration-300 min-h-[140px] flex flex-row items-start gap-4 text-left ${
                    responses[currentQuestion.id] === 'a'
                      ? 'border-2 bg-slate-900/50 scale-[1.02]'
                      : 'border-2 border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/70'
                  }`}
                  style={
                    responses[currentQuestion.id] === 'a'
                      ? {
                          borderColor: accent,
                          backgroundColor: accentRgba(0.14),
                          boxShadow: `0 0 28px ${accentRgba(0.22)}`,
                        }
                      : undefined
                  }
                >
                  <div className="shrink-0 mt-0.5">
                    <div
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300"
                      style={
                        responses[currentQuestion.id] === 'a'
                          ? { borderColor: accent, backgroundColor: accent, color: '#fff' }
                          : { borderColor: 'rgba(148,163,184,0.55)', color: 'rgba(148,163,184,0.75)' }
                      }
                    >
                      A
                    </div>
                  </div>
                  <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                    responses[currentQuestion.id] === 'a' ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {currentQuestion.option_a}
                  </p>
                </button>

                {/* Option B */}
                <button
                  onClick={() => handleAnswer('b')}
                  className={`group p-5 rounded-xl transition-all duration-300 min-h-[140px] flex flex-row items-start gap-4 text-left ${
                    responses[currentQuestion.id] === 'b'
                      ? 'border-2 bg-slate-900/50 scale-[1.02]'
                      : 'border-2 border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/70'
                  }`}
                  style={
                    responses[currentQuestion.id] === 'b'
                      ? {
                          borderColor: accent,
                          backgroundColor: accentRgba(0.14),
                          boxShadow: `0 0 28px ${accentRgba(0.22)}`,
                        }
                      : undefined
                  }
                >
                  <div className="shrink-0 mt-0.5">
                    <div
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300"
                      style={
                        responses[currentQuestion.id] === 'b'
                          ? { borderColor: accent, backgroundColor: accent, color: '#fff' }
                          : { borderColor: 'rgba(148,163,184,0.55)', color: 'rgba(148,163,184,0.75)' }
                      }
                    >
                      B
                    </div>
                  </div>
                  <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                    responses[currentQuestion.id] === 'b' ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {currentQuestion.option_b}
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Scale Hint (shown for tests that have instructional context, e.g. RIASEC) */}
              {TEST_DATA.scale_hint && (
                <p className="text-xs text-slate-400 text-center mb-2 px-2 leading-snug italic">
                  {TEST_DATA.scale_hint}
                </p>
              )}

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
                        ? 'bg-slate-900/50'
                        : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/70'
                    }`}
                    style={
                      responses[currentQuestion.id] === value
                        ? {
                            borderColor: accent,
                            backgroundColor: accentRgba(0.14),
                            boxShadow: `0 0 18px ${accentRgba(0.18)}`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                          style={
                            responses[currentQuestion.id] === value
                              ? { borderColor: accent, backgroundColor: accent }
                              : { borderColor: 'rgba(148,163,184,0.55)' }
                          }
                        >
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
                      <span
                        className={`text-xl font-bold transition-colors duration-200 ${
                          responses[currentQuestion.id] === value ? '' : 'text-slate-700 group-hover:text-slate-500'
                        }`}
                        style={responses[currentQuestion.id] === value ? { color: accent } : undefined}
                      >
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
              ) : isCareerDna ? (
                <>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">A</kbd>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">B</kbd>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">C</kbd>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">D</kbd>
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
                    ? 'shadow-lg text-white hover:brightness-110'
                    : 'bg-slate-900/30 border border-slate-800 text-slate-700 cursor-not-allowed'
                }`}
                style={
                  canGoNext
                    ? { backgroundColor: accent, boxShadow: `0 12px 30px ${accentRgba(0.22)}` }
                    : undefined
                }
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
                    ? 'shadow-lg text-white hover:brightness-110'
                    : 'bg-slate-900/30 border border-slate-800 text-slate-700 cursor-not-allowed'
                }`}
                style={
                  canGoNext && !isSubmitting
                    ? { backgroundColor: accent, boxShadow: `0 12px 30px ${accentRgba(0.22)}` }
                    : undefined
                }
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
          <div className={`mt-4 flex justify-center gap-1 flex-wrap ${layoutMaxWidth} mx-auto`}>
            {TEST_DATA.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentQuestionIndex
                    ? 'w-10 shadow-sm'
                    : responses[q.id] !== undefined
                    ? 'w-1.5'
                    : 'w-1.5 hover:brightness-110'
                }`}
                style={
                  idx === currentQuestionIndex
                    ? { backgroundColor: accent, boxShadow: `0 0 10px ${accentRgba(0.22)}` }
                    : responses[q.id] !== undefined
                      ? { backgroundColor: accentRgba(0.45) }
                      : { backgroundColor: 'rgba(148,163,184,0.25)' }
                }
                title={`Pytanie ${idx + 1}${responses[q.id] ? ' (odpowiedziano)' : ''}`}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
