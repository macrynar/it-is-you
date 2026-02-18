/**
 * Scoring utilities for psychometric tests
 * Handles reverse scoring and dimension calculations
 */

import { HEXACO_TEST } from '../data/tests/hexaco.js';
import { ENNEAGRAM_TEST } from '../data/tests/enneagram.js';

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

/**
 * ===========================================================================
 * ENNEAGRAM SCORING FUNCTIONS
 * ===========================================================================
 */

/**
 * Calculate Enneagram scores from forced-choice responses
 * @param {Object} responses - Object mapping question IDs to choices ('a' or 'b')
 * @returns {Object} Type scores with primary type, wing, and tritype
 */
export function calculateEnneagramScore(responses) {
  // Validate all 36 questions are answered
  if (Object.keys(responses).length !== 36) {
    throw new Error(`Expected 36 responses, got ${Object.keys(responses).length}`);
  }

  // Initialize scores for types 1-9
  const typeScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

  // Calculate scores based on user choices
  ENNEAGRAM_TEST.questions.forEach(question => {
    const userChoice = responses[question.id]; // "a" or "b"

    if (!userChoice) {
      throw new Error(`Missing response for question ${question.id}`);
    }

    if (userChoice !== 'a' && userChoice !== 'b') {
      throw new Error(`Invalid response "${userChoice}" for question ${question.id}. Must be 'a' or 'b'`);
    }

    // Add points based on choice
    if (userChoice === 'a') {
      Object.entries(question.scores_a).forEach(([type, points]) => {
        typeScores[parseInt(type)] += points;
      });
    } else if (userChoice === 'b') {
      Object.entries(question.scores_b).forEach(([type, points]) => {
        typeScores[parseInt(type)] += points;
      });
    }
  });

  // Sort types by score (descending)
  const sorted = Object.entries(typeScores)
    .sort((a, b) => b[1] - a[1])
    .map(([type, score]) => ({ type: parseInt(type), score }));

  // Find primary type (highest score)
  const primaryType = sorted[0].type;
  const primaryScore = sorted[0].score;
  const typeDef = ENNEAGRAM_TEST.types.find(t => t.id === primaryType);

  // Calculate wing (adjacent types with higher score)
  const leftWing = primaryType === 1 ? 9 : primaryType - 1;
  const rightWing = primaryType === 9 ? 1 : primaryType + 1;
  const wing = typeScores[leftWing] > typeScores[rightWing] ? leftWing : rightWing;

  // Tritype: top 3 types (one from each center)
  // Center of Intelligence:
  // Gut (8, 9, 1), Heart (2, 3, 4), Head (5, 6, 7)
  const gutTypes = sorted.filter(t => [8, 9, 1].includes(t.type));
  const heartTypes = sorted.filter(t => [2, 3, 4].includes(t.type));
  const headTypes = sorted.filter(t => [5, 6, 7].includes(t.type));

  const tritype = [
    gutTypes[0],
    heartTypes[0],
    headTypes[0]
  ].filter(Boolean).sort((a, b) => b.score - a.score);

  return {
    primary_type: {
      type: primaryType,
      name: typeDef.name,
      name_en: typeDef.name_en,
      description: typeDef.description,
      core_motivation: typeDef.core_motivation,
      basic_fear: typeDef.basic_fear,
      score: primaryScore
    },
    wing: wing,
    all_scores: typeScores,
    tritype: tritype.slice(0, 3), // Top 3 from different centers
    sorted_types: sorted,
    test_id: ENNEAGRAM_TEST.test_id,
    test_name: ENNEAGRAM_TEST.test_name,
    completed_at: new Date().toISOString()
  };
}

/**
 * Get interpretation for Enneagram type
 * @param {number} type - Enneagram type (1-9)
 * @returns {Object} Detailed interpretation
 */
export function getEnneagramInterpretation(type) {
  const interpretations = {
    1: {
      strengths: [
        "Silne poczucie moralności i etyki",
        "Odpowiedzialność i rzetelność",
        "Wysoki poziom samokontroli",
        "Dążenie do doskonałości"
      ],
      challenges: [
        "Tendencja do krytycyzmu (siebie i innych)",
        "Trudności z akceptacją niedoskonałości",
        "Sztywność i brak elastyczności",
        "Tłumione emocje, szczególnie złość"
      ],
      growth_path: "Naucz się akceptacji i wybaczania. Pamiętaj, że 'dobro' nie zawsze oznacza 'perfekcję'."
    },
    2: {
      strengths: [
        "Głęboka empatia i troska o innych",
        "Hojność i chęć pomagania",
        "Umiejętność budowania relacji",
        "Intuicyjne wyczucie potrzeb innych"
      ],
      challenges: [
        "Zaniedbywanie własnych potrzeb",
        "Oczekiwanie uznania i wdzięczności",
        "Trudności z mówieniem 'nie'",
        "Manipulacja przez helping"
      ],
      growth_path: "Poznaj i zaakceptuj własne potrzeby. Pomagaj bez oczekiwania czegoś w zamian."
    },
    3: {
      strengths: [
        "Wysoka motywacja i produktywność",
        "Adaptacyjność i elastyczność",
        "Umiejętność osiągania celów",
        "Charyzma i pewność siebie"
      ],
      challenges: [
        "Utożsamianie wartości z osiągnięciami",
        "Trudności z autentycznością",
        "Workoholizm i wypalenie",
        "Powierzchowność w relacjach"
      ],
      growth_path: "Odkryj swoją wartość poza sukcesami. Naucz się bycia, nie tylko robienia."
    },
    4: {
      strengths: [
        "Głęboka kreatywność i wizja",
        "Autentyczność i uczciwość emocjonalna",
        "Wrażliwość na piękno",
        "Empatia wobec cierpienia innych"
      ],
      challenges: [
        "Tendencja do melancholii i depresji",
        "Poczucie bycia innym/niezrozumianym",
        "Zazdrość o to, co mają inni",
        "Dramatyzacja emocji"
      ],
      growth_path: "Znajdź równowagę między uczuciami a działaniem. Doceniaj to, co masz teraz."
    },
    5: {
      strengths: [
        "Głęboka analityka i myślenie",
        "Niezależność i samowystarczalność",
        "Innowacyjność i oryginalność",
        "Obiektywizm i bezstronność"
      ],
      challenges: [
        "Izolacja i unikanie relacji",
        "Trudności z wyrażaniem emocji",
        "Skąpienie zasobów (czas, energia)",
        "Nadmierna racjonalizacja"
      ],
      growth_path: "Angażuj się w świat i relacje. Twoje zasoby się odnowią, gdy je użyjesz."
    },
    6: {
      strengths: [
        "Lojalność i zaangażowanie",
        "Umiejętność przewidywania ryzyka",
        "Odpowiedzialność i niezawodność",
        "Odwaga w obronie wartości"
      ],
      challenges: [
        "Chroniczny lęk i niepokój",
        "Trudności z zaufaniem",
        "Prokrastynacja przez paraliż decyzyjny",
        "Projekcja zagrożeń"
      ],
      growth_path: "Zaufaj sobie i swojej wewnętrznej mądrości. Nie wszystko jest zagrożeniem."
    },
    7: {
      strengths: [
        "Optymizm i entuzjazm",
        "Kreatywność i innowacyjność",
        "Elastyczność i adaptacyjność",
        "Umiejętność widzenia możliwości"
      ],
      challenges: [
        "Unikanie bólu i trudnych emocji",
        "Impulsywność i brak cierpliwości",
        "Rozproszenienie i niedokończone projekty",
        "Powierzchowność w relacjach"
      ],
      growth_path: "Naucz się obecności i cierpliwości. Prawdziwa radość pochodzi z głębi, nie z ilości."
    },
    8: {
      strengths: [
        "Siła i pewność siebie",
        "Ochrona słabszych",
        "Bezpośredniość i szczerość",
        "Umiejętność brania odpowiedzialności"
      ],
      challenges: [
        "Dominacja i kontrolowanie innych",
        "Trudności z wrażliwością",
        "Konfrontacyjność i agresja",
        "Lekceważenie własnych ograniczeń"
      ],
      growth_path: "Znajduj siłę w wrażliwości. Pozwól innym być silnymi obok ciebie."
    },
    9: {
      strengths: [
        "Spokój i akceptacja",
        "Umiejętność widzenia wszystkich stron",
        "Mediacja i budowanie mostów",
        "Stabilność i niezawodność"
      ],
      challenges: [
        "Pasywna agresja i unikanie konfliktów",
        "Trudności z określeniem priorytetów",
        "Zaniedbywanie własnych potrzeb",
        "Znieruchomienie i prokrastynacja"
      ],
      growth_path: "Odkryj swoją wartość i priorytet. Twój głos i potrzeby są ważne."
    }
  };

  return interpretations[type] || {
    strengths: [],
    challenges: [],
    growth_path: "Brak danych dla tego typu."
  };
}

/**
 * Generate full Enneagram report
 * @param {Object} scores - Result from calculateEnneagramScore
 * @returns {Object} Full report with interpretations
 */
export function generateEnneagramReport(scores) {
  const interpretation = getEnneagramInterpretation(scores.primary_type.type);
  const wingType = ENNEAGRAM_TEST.types.find(t => t.id === scores.wing);

  return {
    test_info: {
      test_id: scores.test_id,
      test_name: scores.test_name,
      completed_at: scores.completed_at
    },
    primary_type: {
      ...scores.primary_type,
      interpretation: interpretation
    },
    wing: {
      type: scores.wing,
      name: wingType?.name,
      name_en: wingType?.name_en,
      description: `Twój główny typ ${scores.primary_type.type} jest wzbogacony o cechy typu ${scores.wing}`
    },
    tritype: scores.tritype,
    all_scores: scores.all_scores,
    sorted_types: scores.sorted_types
  };
}

