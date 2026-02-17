/**
 * Scoring utilities for psychometric tests
 * Handles reverse scoring and dimension calculations
 */

import { HEXACO_TEST } from '../data/tests/hexaco.js';

/**
 * Calculate HEXACO-60 scores from user responses
 * @param {Object} responses - Object mapping question IDs to answers (1-5)
 * @returns {Object} Dimension scores and metadata
 */
export function calculateHexacoScore(responses) {
  // Validate all 60 questions are answered
  if (Object.keys(responses).length !== 60) {
    throw new Error(`Expected 60 responses, got ${Object.keys(responses).length}`);
  }

  // Initialize dimension scores
  const dimensionScores = {};
  const dimensionCounts = {};
  
  HEXACO_TEST.dimensions.forEach(dim => {
    dimensionScores[dim.id] = 0;
    dimensionCounts[dim.id] = 0;
  });

  // Calculate raw scores for each dimension
  HEXACO_TEST.questions.forEach(question => {
    const response = responses[question.id];
    
    if (response === undefined || response === null) {
      throw new Error(`Missing response for question ${question.id}`);
    }

    // Validate response is in range 1-5
    if (response < 1 || response > 5) {
      throw new Error(`Invalid response ${response} for question ${question.id}. Must be 1-5`);
    }

    // Apply reverse scoring if needed
    const score = question.reverse ? (6 - response) : response;
    
    dimensionScores[question.dimension] += score;
    dimensionCounts[question.dimension] += 1;
  });

  // Calculate averages (raw scores from 1-5)
  const averages = {};
  HEXACO_TEST.dimensions.forEach(dim => {
    averages[dim.id] = dimensionScores[dim.id] / dimensionCounts[dim.id];
  });

  // Calculate percentiles (0-100 scale for visualization)
  const percentiles = {};
  HEXACO_TEST.dimensions.forEach(dim => {
    // Convert 1-5 scale to 0-100
    // 1.0 → 0, 3.0 → 50, 5.0 → 100
    percentiles[dim.id] = ((averages[dim.id] - 1) / 4) * 100;
  });

  return {
    raw_scores: averages,        // 1-5 scale
    percentile_scores: percentiles, // 0-100 scale
    raw_answers: responses,
    dimension_counts: dimensionCounts,
    test_id: HEXACO_TEST.test_id,
    test_name: HEXACO_TEST.test_name,
    completed_at: new Date().toISOString()
  };
}

/**
 * Get interpretation text for a dimension score
 * @param {string} dimensionId - The dimension ID
 * @param {number} score - Raw score (1-5)
 * @returns {Object} Interpretation with level and description
 */
export function getHexacoInterpretation(dimensionId, score) {
  const interpretations = {
    honesty_humility: {
      low: {
        level: "Niski",
        description: "Pragmatyczne podejście do życia, gotowość do wykorzystywania okazji, pewność siebie w relacjach społecznych."
      },
      medium: {
        level: "Średni",
        description: "Balans między uczciwością a pragmatyzmem, elastyczne podejście do różnych sytuacji społecznych."
      },
      high: {
        level: "Wysoki",
        description: "Silne wartości moralne, szczerość i skromność w relacjach, niewielkie zainteresowanie statusem materialnym."
      }
    },
    emotionality: {
      low: {
        level: "Niski",
        description: "Emocjonalna odporność, niezależność, pewność siebie w trudnych sytuacjach."
      },
      medium: {
        level: "Średni",
        description: "Zrównoważone doświadczanie emocji, elastyczne reagowanie na sytuacje wymagające wsparcia."
      },
      high: {
        level: "Wysoki",
        description: "Wysoka wrażliwość emocjonalna, silne więzi z bliskimi, potrzeba bezpieczeństwa i wsparcia."
      }
    },
    extraversion: {
      low: {
        level: "Niski",
        description: "Preferencja dla samodzielnej pracy, refleksyjność, komfort w mniejszych grupach."
      },
      medium: {
        level: "Średni",
        description: "Elastyczność w sytuacjach społecznych, komfort zarówno w grupie jak i samotności."
      },
      high: {
        level: "Wysoki",
        description: "Energia społeczna, pewność siebie w kontaktach, entuzjazm do nowych doświadczeń."
      }
    },
    agreeableness: {
      low: {
        level: "Niski",
        description: "Asertywność, gotowość do wyrażania sprzeciwu, krytyczne myślenie."
      },
      medium: {
        level: "Średni",
        description: "Balans między współpracą a obroną własnego zdania, elastyczne podejście do konfliktów."
      },
      high: {
        level: "Wysoki",
        description: "Wyrozumiałość, cierpliwość, chęć współpracy i kompromisu w relacjach."
      }
    },
    conscientiousness: {
      low: {
        level: "Niski",
        description: "Spontaniczność, elastyczność, komfort w nieprzewidywalnych sytuacjach."
      },
      medium: {
        level: "Średni",
        description: "Równowaga między organizacją a spontanicznością, dostosowanie metod pracy do sytuacji."
      },
      high: {
        level: "Wysoki",
        description: "Wysoka organizacja, dokładność, systematyczność i dyscyplina w działaniu."
      }
    },
    openness: {
      low: {
        level: "Niski",
        description: "Praktyczne podejście, preferencja dla konkretów, komfort w rutynie."
      },
      medium: {
        level: "Średni",
        description: "Balans między pragmatyzmem a ciekawością, selektywna otwartość na nowe doświadczenia."
      },
      high: {
        level: "Wysoki",
        description: "Silna ciekawość intelektualna, docenianie sztuki, otwartość na niekonwencjonalne idee."
      }
    }
  };

  // Classify score into low (<2.5), medium (2.5-3.5), high (>3.5)
  let level = 'medium';
  if (score < 2.5) level = 'low';
  else if (score > 3.5) level = 'high';

  return interpretations[dimensionId]?.[level] || {
    level: "Nieznany",
    description: "Brak interpretacji dla tego wymiaru."
  };
}

/**
 * Generate full HEXACO report
 * @param {Object} scores - Result from calculateHexacoScore
 * @returns {Object} Full report with interpretations
 */
export function generateHexacoReport(scores) {
  const report = {
    test_info: {
      test_id: scores.test_id,
      test_name: scores.test_name,
      completed_at: scores.completed_at
    },
    dimensions: []
  };

  HEXACO_TEST.dimensions.forEach(dim => {
    const rawScore = scores.raw_scores[dim.id];
    const percentile = scores.percentile_scores[dim.id];
    const interpretation = getHexacoInterpretation(dim.id, rawScore);

    report.dimensions.push({
      id: dim.id,
      name: dim.name,
      name_en: dim.name_en,
      description: dim.description,
      raw_score: rawScore.toFixed(2),
      percentile: Math.round(percentile),
      interpretation: interpretation
    });
  });

  return report;
}
