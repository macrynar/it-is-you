/**
 * Scoring utilities for psychometric tests
 * Handles reverse scoring and dimension calculations
 */

import { HEXACO_TEST } from '../data/tests/hexaco.js';
import { ENNEAGRAM_TEST } from '../data/tests/enneagram.js';
import { DARK_TRIAD_TEST } from '../data/tests/darkTriad.js';
import { STRENGTHS_TEST } from '../data/tests/strengths.js';
import { CAREER_TEST } from '../data/tests/career.js';
import { VALUES_TEST } from '../data/tests/values.js';

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

/**
 * ===========================================
 * DARK TRIAD (SD3) SCORING
 * ===========================================
 */

/**
 * Calculate Dark Triad scores from user responses
 * Measures Machiavellianism, Narcissism, and Psychopathy
 * @param {Object} responses - Object mapping question IDs to answers (1-5)
 * @returns {Object} Dimension scores with risk levels
 */
export function calculateDarkTriadScore(responses) {
  // Validate all 27 questions are answered
  if (Object.keys(responses).length !== 27) {
    throw new Error(`Expected 27 responses, got ${Object.keys(responses).length}`);
  }

  const dimensionScores = {};
  const dimensionCounts = {};
  
  // Initialize scores
  DARK_TRIAD_TEST.dimensions.forEach(dim => {
    dimensionScores[dim.id] = 0;
    dimensionCounts[dim.id] = 0;
  });

  // Calculate raw scores for each dimension
  DARK_TRIAD_TEST.questions.forEach(question => {
    const response = responses[question.id];
    
    if (response === undefined || response === null) {
      throw new Error(`Missing response for question ${question.id}`);
    }

    // Validate response is in range 1-5
    if (response < 1 || response > 5) {
      throw new Error(`Invalid response ${response} for question ${question.id}. Must be 1-5`);
    }

    // Apply reverse scoring if needed (6 - response for reverse items)
    const score = question.reverse ? (6 - response) : response;
    
    dimensionScores[question.dimension] += score;
    dimensionCounts[question.dimension] += 1;
  });

  // Calculate averages and determine risk levels
  const results = {};
  const riskLevels = {};
  
  DARK_TRIAD_TEST.dimensions.forEach(dim => {
    const average = dimensionScores[dim.id] / dimensionCounts[dim.id];
    const norm = DARK_TRIAD_TEST.norms[dim.id];
    
    // Determine risk level based on population norms
    let level = 'average';
    if (average < norm.average[0]) {
      level = 'low';
    } else if (average >= norm.high[0]) {
      level = 'high';
    }
    
    results[dim.id] = {
      raw_score: parseFloat(average.toFixed(2)),
      level: level,
      vs_population: parseFloat((average - norm.mean).toFixed(2)),
      norm_mean: norm.mean,
      percentile: calculatePercentileApprox(average, norm)
    };
    
    riskLevels[dim.id] = level;
  });

  // Determine overall risk (highest level)
  const overallRisk = Object.values(results).some(r => r.level === 'high') 
    ? 'high' 
    : Object.values(results).some(r => r.level === 'average') 
      ? 'average' 
      : 'low';

  // Find highest scoring dimension
  const sortedDimensions = Object.entries(results)
    .sort((a, b) => b[1].raw_score - a[1].raw_score);
  
  const highestDimension = DARK_TRIAD_TEST.dimensions.find(
    d => d.id === sortedDimensions[0][0]
  );

  return {
    test_id: 'dark_triad_sd3',
    test_name: 'Dark Triad SD3',
    completed_at: new Date().toISOString(),
    dimensions: results,
    risk_levels: riskLevels,
    overall_risk: overallRisk,
    highest_dimension: {
      id: highestDimension.id,
      name: highestDimension.name,
      score: results[highestDimension.id].raw_score,
      level: results[highestDimension.id].level
    },
    sorted_dimensions: sortedDimensions.map(([id, data]) => {
      const dim = DARK_TRIAD_TEST.dimensions.find(d => d.id === id);
      return {
        id: id,
        name: dim.name,
        name_en: dim.name_en,
        icon: dim.icon,
        score: data.raw_score,
        level: data.level
      };
    })
  };
}

/**
 * Calculate approximate percentile based on normal distribution
 * @param {number} score - User's score
 * @param {Object} norm - Norm object with mean and ranges
 * @returns {number} Approximate percentile (0-100)
 */
function calculatePercentileApprox(score, norm) {
  // Simple approximation based on ranges
  if (score < norm.average[0]) {
    // Low range: 0-30th percentile
    const ratio = (score - norm.low[0]) / (norm.average[0] - norm.low[0]);
    return Math.round(ratio * 30);
  } else if (score < norm.high[0]) {
    // Average range: 30-70th percentile
    const ratio = (score - norm.average[0]) / (norm.high[0] - norm.average[0]);
    return Math.round(30 + ratio * 40);
  } else {
    // High range: 70-100th percentile
    const ratio = (score - norm.high[0]) / (norm.high[1] - norm.high[0]);
    return Math.round(70 + ratio * 30);
  }
}

/**
 * Get interpretation text for Dark Triad dimensions
 * @param {string} dimension - Dimension ID
 * @param {string} level - Risk level ('low', 'average', 'high')
 * @returns {Object} Interpretation with description and implications
 */
export function getDarkTriadInterpretation(dimension, level) {
  const interpretations = {
    machiavellianism: {
      low: {
        description: "Masz niski poziom makiawelizmu. Jesteś szczery i bezpośredni w relacjach, rzadko uciekasz się do manipulacji.",
        implications: [
          "Wysoka uczciwość w relacjach",
          "Przejrzysta komunikacja",
          "Mniejsza skłonność do gier politycznych",
          "Mogą wykorzystywać Cię osoby bardziej manipulacyjne"
        ]
      },
      average: {
        description: "Twój poziom makiawelizmu jest w normie populacyjnej. Potrafisz być strategiczny, gdy sytuacja tego wymaga, ale nie jest to Twoja dominująca cecha.",
        implications: [
          "Umiejętność dostosowania się do sytuacji",
          "Zrównoważone podejście do relacji",
          "Możesz być strategiczny, gdy trzeba",
          "Zachowujesz integralność w większości przypadków"
        ]
      },
      high: {
        description: "Masz podwyższony poziom makiawelizmu. Jesteś strategiczny, cyniczny i skłonny do manipulacji dla osiągnięcia celów.",
        implications: [
          "Silne myślenie strategiczne",
          "Skłonność do manipulacji w relacjach",
          "Cyniczne spojrzenie na ludzi",
          "Ryzyko problemów w bliskich relacjach"
        ]
      }
    },
    narcissism: {
      low: {
        description: "Masz niski poziom narcyzmu. Jesteś skromny i nie potrzebujesz bycia w centrum uwagi.",
        implications: [
          "Naturalna skromność",
          "Brak potrzeby podziwu",
          "Empatia wobec innych",
          "Ryzyko niedocenienia własnej wartości"
        ]
      },
      average: {
        description: "Twój poziom narcyzmu jest w normie. Masz zdrowe poczucie własnej wartości bez przesadnej potrzeby uwagi.",
        implications: [
          "Zrównoważone poczucie własnej wartości",
          "Umiar w szukaniu uznania",
          "Równowaga między ego a empatią",
          "Zdrowe podejście do sukcesów i porażek"
        ]
      },
      high: {
        description: "Masz podwyższony poziom narcyzmu. Potrzebujesz podziwu, czujesz się wyjątkowy i uprzywilejowany.",
        implications: [
          "Silne poczucie własnej wartości",
          "Potrzeba bycia w centrum uwagi",
          "Trudności z empatią",
          "Ryzyko problemów w relacjach interpersonalnych"
        ]
      }
    },
    psychopathy: {
      low: {
        description: "Masz niski poziom psychopatii. Jesteś empatyczny, kontrolujesz impulsy i unikasz ryzyka.",
        implications: [
          "Wysoka empatia",
          "Dobra kontrola impulsów",
          "Unikanie niepotrzebnego ryzyka",
          "Silna więź emocjonalna z innymi"
        ]
      },
      average: {
        description: "Twój poziom psychopatii jest w normie. Masz zrównoważone podejście do ryzyka i kontroli emocji.",
        implications: [
          "Zrównoważona empatia",
          "Umiejętność podejmowania ryzyka, gdy trzeba",
          "Kontrola impulsów w większości sytuacji",
          "Normalne funkcjonowanie społeczne"
        ]
      },
      high: {
        description: "Masz podwyższony poziom psychopatii. Jesteś impulsywny, szukasz ryzyka i masz trudności z empatią.",
        implications: [
          "Wysoka tolerancja ryzyka",
          "Trudności z kontrolą impulsów",
          "Ograniczona empatia",
          "Ryzyko zachowań antyspołecznych"
        ]
      }
    }
  };

  return interpretations[dimension]?.[level] || {
    description: "Brak interpretacji dla tego poziomu.",
    implications: []
  };
}

/**
 * Generate full Dark Triad report
 * @param {Object} scores - Result from calculateDarkTriadScore
 * @returns {Object} Full report with interpretations
 */
export function generateDarkTriadReport(scores) {
  const dimensionReports = {};
  
  Object.keys(scores.dimensions).forEach(dimId => {
    const dimData = scores.dimensions[dimId];
    const interpretation = getDarkTriadInterpretation(dimId, dimData.level);
    
    dimensionReports[dimId] = {
      ...dimData,
      interpretation: interpretation
    };
  });

  return {
    test_info: {
      test_id: scores.test_id,
      test_name: scores.test_name,
      completed_at: scores.completed_at
    },
    overall_risk: scores.overall_risk,
    highest_dimension: scores.highest_dimension,
    dimensions: dimensionReports,
    sorted_dimensions: scores.sorted_dimensions,
    risk_alert: scores.overall_risk === 'high' 
      ? "⚠️ Jeden lub więcej wymiarów wskazuje na podwyższone ryzyko. Rozważ konsultację ze specjalistą."
      : scores.overall_risk === 'average'
        ? "✓ Twoje wyniki mieszczą się w normie populacyjnej."
        : "✓ Wszystkie wymiary w zakresie niskiego ryzyka."
  };
}

/**
 * ============================================
 * STRENGTHS ASSESSMENT SCORING
 * ============================================
 */

/**
 * Calculate Strengths Assessment scores - Top 5 Talents
 * @param {Object} responses - Object mapping question IDs to answers (1-5)
 * @returns {Object} Top 5 strengths and all scores
 */
export function calculateStrengthsScore(responses) {
  // Validate all 48 questions are answered
  if (Object.keys(responses).length !== 48) {
    throw new Error(`Expected 48 responses, got ${Object.keys(responses).length}`);
  }

  const strengthScores = {};
  
  // Calculate average for each of 16 strengths
  STRENGTHS_TEST.strengths.forEach(strength => {
    const questions = STRENGTHS_TEST.questions.filter(q => q.strength === strength.id);
    const sum = questions.reduce((acc, q) => acc + (responses[q.id] || 0), 0);
    const average = sum / questions.length;
    
    strengthScores[strength.id] = {
      raw_score: parseFloat(average.toFixed(2)),
      name: strength.name,
      name_en: strength.name_en,
      category: strength.category,
      description: strength.description,
      keywords: strength.keywords
    };
  });
  
  // Sort strengths by score (descending)
  const sortedStrengths = Object.entries(strengthScores)
    .sort((a, b) => b[1].raw_score - a[1].raw_score);
  
  // Get Top 5
  const top5 = sortedStrengths.slice(0, 5).map(([id, data], index) => ({
    rank: index + 1,
    id: id,
    name: data.name,
    name_en: data.name_en,
    category: data.category,
    score: data.raw_score,
    description: data.description,
    keywords: data.keywords
  }));
  
  // Group by category for visualization
  const categoryScores = {};
  STRENGTHS_TEST.categories.forEach(cat => {
    const categoryStrengths = Object.entries(strengthScores)
      .filter(([id, data]) => data.category === cat.id);
    
    const avgScore = categoryStrengths.length > 0
      ? categoryStrengths.reduce((sum, [id, data]) => sum + data.raw_score, 0) / categoryStrengths.length
      : 0;
    
    categoryScores[cat.id] = {
      name: cat.name,
      name_en: cat.name_en,
      average_score: parseFloat(avgScore.toFixed(2)),
      color: cat.color,
      icon: cat.icon,
      count_in_top5: top5.filter(s => s.category === cat.id).length
    };
  });

  return {
    test_id: 'strengths_assessment',
    test_name: 'Test Talentów',
    completed_at: new Date().toISOString(),
    top_5: top5,
    all_scores: strengthScores,
    category_scores: categoryScores,
    dominant_category: Object.entries(categoryScores)
      .sort((a, b) => b[1].count_in_top5 - a[1].count_in_top5)[0]
  };
}

/**
 * Generate interpretation for a single strength
 * @param {string} strengthId - ID of the strength
 * @param {number} rank - Rank in top 5 (1-5)
 * @returns {Object} Interpretation with strategies and tips
 */
export function getStrengthInterpretation(strengthId, rank) {
  const interpretations = {
    analytical: {
      overview: "Twój talent analityczny sprawia, że naturalnie dociekasz przyczyn i szukasz dowodów. Potrzebujesz logiki i danych, aby czuć się pewnie w decyzjach.",
      how_to_use: [
        "Zbieraj dane przed podjęciem ważnych decyzji",
        "Kwestionuj założenia i badaj głębsze przyczyny problemów",
        "Używaj swojej logiki do identyfikowania wzorców i trendów",
        "Pomagaj innym zrozumieć złożone sytuacje poprzez analizę"
      ],
      watch_out: [
        "Nie analizuj nadmiernie - czasem trzeba działać bez pełnych danych",
        "Uważaj, by nie wydawać się zbyt krytycznym wobec pomysłów innych",
        "Pamiętaj, że nie wszystko da się zmierzyć lub udowodnić"
      ]
    },
    strategic: {
      overview: "Widzisz wzorce tam, gdzie inni widzą złożoność. Naturalnie oceniasz alternatywne ścieżki i wybierasz najbardziej skuteczną.",
      how_to_use: [
        "Przewiduj przeszkody i planuj alternatywne scenariusze",
        "Pomagaj zespołom określać priorytety i cele długoterminowe",
        "Używaj wizualizacji (mapy, diagramy) do pokazywania możliwych ścieżek",
        "Zadawaj pytanie: 'Co jeśli...?' aby eksplorować opcje"
      ],
      watch_out: [
        "Nie wszyscy widzą wzorce tak szybko jak Ty - wyjaśniaj swoje myślenie",
        "Uważaj, by strategia nie przerodziła się w paraliż planowania",
        "Czasem trzeba zacząć działać, nawet bez doskonałego planu"
      ]
    },
    learner: {
      overview: "Sam proces uczenia się Cię ekscytuje. Ciągły rozwój i zdobywanie wiedzy dają Ci energię i satysfakcję.",
      how_to_use: [
        "Poszukuj projektów wymagających nauki nowych umiejętności",
        "Śledź najnowsze trendy i badania w swojej dziedzinie",
        "Dziel się tym, czego się uczysz, aby zarazić innych entuzjazmem",
        "Wykorzystuj kursy online, podcasty i książki do ciągłego rozwoju"
      ],
      watch_out: [
        "Nie pozwól, by ciągła nauka powstrzymywała Cię od działania",
        "Pamiętaj, że nie musisz być ekspertem przed startem",
        "Uważaj na 'błyszczący nowy obiekt' - dokończ to, co zacząłeś"
      ]
    },
    ideation: {
      overview: "Fascynują Cię idee i możliwości. Widzisz połączenia między pozornie niezwiązanymi koncepcjami i generujesz innowacyjne rozwiązania.",
      how_to_use: [
        "Prowadź sesje burzy mózgów dla zespołu",
        "Notuj pomysły natychmiast - nie ufaj pamięci",
        "Łącz różne perspektywy i dziedziny wiedzy",
        "Używaj narzędzi wizualnych (mind maps, szkice) do eksploracji pomysłów"
      ],
      watch_out: [
        "Nie każdy pomysł musi być realizowany - wybieraj mądrze",
        "Pomóż innym zrozumieć logikę swoich skojarzeń",
        "Pamiętaj o realizacji - pomysły potrzebują egzekucji"
      ]
    },
    achiever: {
      overview: "Masz wewnętrzny napęd do pracy i osiągania. Satysfakcję daje Ci produktywność i konkretne rezultaty każdego dnia.",
      how_to_use: [
        "Ustal jasne cele codzienne/tygodniowe dla poczucia postępu",
        "Dziel duże projekty na mniejsze, osiągalne zadania",
        "Używaj list zadań i celebruj każde 'odhaczenie'",
        "Twoja energia motywuje innych - bądź przykładem"
      ],
      watch_out: [
        "Nie pozwól, by praca stała się samocelemwatch_out",
        "Pauzuj regularnie - chroniczny wysiłek prowadzi do wypalenia",
        "Nie każdy ma Twoje tempo - szanuj różne rytmy pracy"
      ]
    },
    disciplined: {
      overview: "Potrzebujesz struktury i porządku. Tworzysz systemy, rutyny i procedury, które pomagają panować nad chaosem.",
      how_to_use: [
        "Projektuj procesy i harmonogramy dla projektów",
        "Używaj narzędzi organizacyjnych (kalendarze, checklisty, szablony)",
        "Pomagaj innym tworzyć strukturę w ich pracy",
        "Doceniaj przewidywalność - to Twoja siła, nie słabość"
      ],
      watch_out: [
        "Czasem trzeba być elastycznym - nie każda sytuacja potrzebuje sztywnej struktury",
        "Nie wszyscy czują się komfortowo z wysokim poziomem organizacji",
        "Uważaj na nadmierny perfekcjonizm w rutynie"
      ]
    },
    focus: {
      overview: "Potrzebujesz jasnego kierunku i priorytetów. Potrafisz eliminować rozproszenia i trzymać się kursu do celu.",
      how_to_use: [
        "Pytaj: 'Jaki jest priorytet?' gdy pojawia się chaos",
        "Blokuj czas w kalendarzu na głęboką pracę bez przerw",
        "Pomagaj zespołom określać i trzymać się kierunku",
        "Używaj technik typu Pomodoro dla maksymalnej koncentracji"
      ],
      watch_out: [
        "Nie bądź tak skoncentrowany, że przeoczysz nowe możliwości",
        "Czasem warto zboczćz kursu, jeśli pojawia się lepsza ścieżka",
        "Pamiętaj o potrzebie przerw - koncentracja wymaga regeneracji"
      ]
    },
    responsibility: {
      overview: "Bierzesz psychiczne zobowiązanie wobec tego, co obiecałeś. Twoje poczucie odpowiedzialności jest głębokie i osobiste.",
      how_to_use: [
        "Bądź osobą, na której zespół może polegać w kryzysie",
        "Ustal jasne zobowiązania i dotrzymuj ich",
        "Pomagaj innym zrozumieć konsekwencje ich wyborów",
        "Twoja rzetelność buduje zaufanie - używaj tego świadomie"
      ],
      watch_out: [
        "Nie bierz na siebie zbyt wiele - naucz się mówić 'nie'",
        "Nie wszyscy czują tak głębokie zobowiązanie jak Ty",
        "Nie obwiniaj się nadmiernie za rzeczy poza Twoją kontrolą"
      ]
    },
    communication: {
      overview: "Łatwo znajdujesz słowa. Potrafisz wyjaśniać, opisywać, przekonywać i angażować innych poprzez język.",
      how_to_use: [
        "Bądź rzecznikiem zespołu - przedstawiaj pomysły i wyniki",
        "Używaj opowieści i metafor do wyjaśniania złożonych koncepcji",
        "Prowadź prezentacje, szkolenia, spotkania",
        "Pisz - blogi, raporty, dokumentacja - aby dzielić się wiedzą"
      ],
      watch_out: [
        "Upewnij się, że słuchasz równie dobrze, jak mówisz",
        "Nie dominuj rozmów - daj przestrzeń innym",
        "Czasem prostota jest lepsza niż elokwencja"
      ]
    },
    competition: {
      overview: "Mierzysz swoje wyniki z innymi. Konkurencja Cię motywuje i pcham do wyższych osiągnięć.",
      how_to_use: [
        "Ustal mierzalne cele i śledź postępy",
        "Porównuj się z najlepszymi w swojej dziedzinie",
        "Używaj konkurencji jako źródła motywacji, nie zagrożenia",
        "Celebruj zwycięstwa - Twoje i innych"
      ],
      watch_out: [
        "Nie każdy lubi rywalizację - dostosuj styl do odbiorcy",
        "Uważaj, by konkurencja nie zniszczyła współpracy",
        "Przegrywanie jest częścią gry - ucz się z porażek"
      ]
    
},
    maximizer: {
      overview: "Koncentrujesz się na mocnych stronach jako drodze do doskonałości. Wierzysz w rozwój tego, co już działa dobrze.",
      how_to_use: [
        "Identyfikuj i rozwijaj mocne strony swoje i innych",
        "Zamiast naprawiać słabości, znajdź partnerów uzupełniających",
        "Dawaj konkretny, rozwijający feedback skupiony na mocnych stronach",
        "Celebruj postępy w kierunku doskonałości"
      ],
      watch_out: [
        "Niektóre słabości wymagają uwagi - nie ignoruj ich całkowicie",
        "Nie wszyscy są gotowi na Twoje wysokie standardy",
        "Uważaj, by dążenie do perfekcji nie paraliżowało działania"
      ]
    },
    self_assurance: {
      overview: "Ufasz swojemu osądowi i wewnętrznemu kompasowi. Masz głęboką pewność w swoje zdolności i decyzje.",
      how_to_use: [
        "Podejmuj trudne decyzje, gdy inni się wahają",
        "Używaj swojej pewności do uspokajania innych w niepewnych czasach",
        "Bądź głosem, który kwestionuje status quo",
        "Podejmuj odważne ryzyko oparte na swoim osądzie"
      ],
      watch_out: [
        "Słuchaj innych - Twoja pewność nie oznacza, że zawsze masz rację",
        "Bądź otwarty na zmianę zdania, gdy pojawią się nowe informacje",
        "Nie każdy interpretuje pewność siebie jako pozytywną cechę"
      ]
    },
    adaptability: {
      overview: "Żyjesz chwilą i dobrze radzisz sobie ze zmiennością. Elastyczność i spontaniczność są Twoimi mocnymi stronami.",
      how_to_use: [
        "Bądź osobą 'na już' gdy pojawią się nagłe potrzeby",
        "Pomagaj innym zobaczyć możliwości w zmianach",
        "Reaguj szybko na nowe informacje bez nadmiernego planowania",
        "Twoja elastyczność równoważy sztywność innych"
      ],
      watch_out: [
        "Niektóre sytuacje wymagają planowania - nie wszystko może być spontaniczne",
        "Ustal przynajmniej kilka priorytetów długoterminowych",
        "Nie pozwól, by ciągłe reagowanie przeszkadzało w głębokiej pracy"
      ]
    },
    developer: {
      overview: "Widzisz potencjał w innych i czerpiesz satysfakcję z pomagania im się rozwijać. Małe postępy innych sprawiają Ci radość.",
      how_to_use: [
        "Bądź mentorem dla młodszych członków zespołu",
        "Dawaj feedback skupiony na postępach, nie tylko wynikach",
        "Twórz możliwości rozwoju dla innych",
        "Celebruj małe zwycięstwa w rozwoju innych"
      ],
      watch_out: [
        "Nie wszyscy chcą być 'rozwijani' - pytaj o pozwolenie",
        "Czasem ludzie muszą popełnić błąd, aby się nauczyć",
        "Nie zaniedbuj własnego rozwoju, skupiając się tylko na innych"
      ]
    },
    empathy: {
      overview: "Wyczuwasz emocje innych ludzi. Potrafisz się w nich wczuć i zrozumieć ich perspektywę.",
      how_to_use: [
        "Bądź osobą, do której ludzie przychodzą z problemami",
        "Pomóż innym zrozumieć niewypowiedziane emocje w zespole",
        "Używaj empatii w rozwiązywaniu konfliktów",
        "Twórz bezpieczną przestrzeń dla wyrażania emocji"
      ],
      watch_out: [
        "Chroń swoje granice emocjonalne - nie absorbuj zbyt wiele cudzych emocji",
        "Czasem ludzie potrzebują rozwiązań, nie tylko zrozumienia",
        "Nie wszyscy są gotowi na głębokie połączenia emocjonalne"
      ]
    },
    harmony: {
      overview: "Szukasz obszarów zgody i konsensusu. Unikasz konfrontacji i pomagasz innym znaleźć wspólny grunt.",
      how_to_use: [
        "Mediuj w konfliktach i szukaj punktów wspólnych",
        "Pomagaj zespołom znaleźć kompromisy",
        "Twórz środowisko współpracy zamiast konkurencji",
        "Buduj mosty między różnymi perspektywami"
      ],
      watch_out: [
        "Czasem konflikt jest potrzebny dla postępu - nie unikaj go zawsze",
        "Nie zgadzaj się na wszystko tylko dla zachowania harmonii",
        "Twoje preferencje mogą być interpretowane jako unikanie trudnych decyzji"
      ]
    }
  };

  return interpretations[strengthId] || {
    overview: "Interpretacja w przygotowaniu.",
    how_to_use: [],
    watch_out: []
  };
}

/**
 * Generate full strengths report
 * @param {Object} scores - Scores object from calculateStrengthsScore
 * @returns {Object} Complete report with interpretations
 */
export function generateStrengthsReport(scores) {
  const top5WithInterpretations = scores.top_5.map(strength => ({
    ...strength,
    interpretation: getStrengthInterpretation(strength.id, strength.rank)
  }));

  // Find category with most strengths in top 5
  const dominantCategory = scores.dominant_category;
  const categoryInfo = STRENGTHS_TEST.categories.find(c => c.id === dominantCategory[0]);

  return {
    test_id: scores.test_id,
    test_name: scores.test_name,
    completed_at: scores.completed_at,
    top_5: top5WithInterpretations,
    category_scores: scores.category_scores,
    dominant_category: {
      ...dominantCategory[1],
      id: dominantCategory[0],
      description: categoryInfo?.description || '',
      icon: categoryInfo?.icon || '⭐'
    },
    summary: {
      primary_strength: top5WithInterpretations[0],
      category_distribution: Object.entries(scores.category_scores).map(([id, data]) => ({
        id,
        ...data
      }))
    }
  };
}

/**
 * Calculate Career Interests (RIASEC) scores from user responses
 * Generates Holland Code from top 3 interest types
 * @param {Object} responses - Object mapping question IDs to answers (1-5)
 * @returns {Object} Interest type scores and Holland Code
 */
export function calculateCareerScore(responses) {
  // Validate all 48 questions are answered
  if (Object.keys(responses).length !== 48) {
    throw new Error(`Expected 48 responses, got ${Object.keys(responses).length}`);
  }

  const typeScores = {};
  
  // Calculate average for each of 6 RIASEC types
  CAREER_TEST.interest_types.forEach(type => {
    const questions = CAREER_TEST.questions.filter(q => q.interest === type.id);
    const sum = questions.reduce((acc, q) => acc + (responses[q.id] || 0), 0);
    const average = sum / questions.length;
    
    typeScores[type.id] = {
      raw_score: parseFloat(average.toFixed(2)),
      letter: type.letter,
      name: type.name,
      name_en: type.name_en,
      description: type.description,
      color: type.color,
      fullMark: type.fullMark
    };
  });
  
  // Sort types by score (descending)
  const sortedTypes = Object.entries(typeScores)
    .sort((a, b) => b[1].raw_score - a[1].raw_score);
  
  // Get Top 3 for Holland Code
  const top3 = sortedTypes.slice(0, 3).map(([id, data], index) => ({
    rank: index + 1,
    id: id,
    letter: data.letter,
    name: data.name,
    name_en: data.name_en,
    score: data.raw_score,
    description: data.description,
    color: data.color
  }));
  
  // Generate Holland Code (3-letter code from top 3 types)
  const hollandCode = top3.map(t => t.letter).join('');
  
  // Prepare data for radar chart
  const chartData = CAREER_TEST.interest_types.map(type => ({
    subject: type.name,
    A: typeScores[type.id].raw_score,
    fullMark: 5
  }));

  return {
    test_id: 'career_interests_riasec',
    test_name: 'Test Zainteresowań Zawodowych',
    completed_at: new Date().toISOString(),
    holland_code: hollandCode,
    top_3: top3,
    all_scores: typeScores,
    chart_data: chartData
  };
}

/**
 * Get career path recommendations for RIASEC type
 * @param {string} typeId - RIASEC type ID
 * @param {number} rank - Ranking position (1-3)
 * @returns {Object} Career recommendations and description
 */
export function getCareerInterpretation(typeId, rank) {
  const interpretations = {
    realistic: {
      overview: "Osoby z wysokim wynikiem w kategorii Wykonawca (Realista) preferują praktyczną, fizyczną pracę z narzędziami, maszynami i obiektami. Cenią konkretne, wymierne rezultaty swojej pracy.",
      characteristics: [
        "Preferujesz pracę z rzeczami, a nie z ludźmi",
        "Lubisz rozwiązywać praktyczne problemy",
        "Cenisz umiejętności techniczne i manualne",
        "Wolisz jasne, strukturalne zadania"
      ],
      career_paths: [
        "Inżynier / Mechanik / Technik",
        "Elektryk / Spawacz / Cieśla",
        "Pilot / Kierowca / Operator maszyn",
        "Rolnik / Ogrodnik / Leśnik",
        "Sportowiec / Trener personalny"
      ],
      work_environments: [
        "Warsztaty i fabryki",
        "Budowy i place produkcyjne",
        "Laboratoria techniczne",
        "Miejsca na świeżym powietrzu"
      ]
    },
    investigative: {
      overview: "Osoby z wysokim wynikiem w kategorii Badacz (Analityk) uwielbiają rozwiązywać skomplikowane problemy, prowadzić badania i analizować dane. Są natura dociekliwe i systematyczne.",
      characteristics: [
        "Lubisz zadawać pytania i testować hipotezy",
        "Preferujesz pracę analityczną nad manualną",
        "Cenisz głęboką wiedzę i kompetencje",
        "Wolisz samodzielne myślenie nad rutynowymi zadaniami"
      ],
      career_paths: [
        "Naukowiec / Badacz / Analityk",
        "Lekarz / Farmaceuta / Dentysta",
        "Programista / Data Scientist",
        "Inżynier oprogramowania / Architekt systemów",
        "Psycholog badawczy / Socjolog"
      ],
      work_environments: [
        "Laboratoria badawcze",
        "Uniwersytety i ośrodki naukowe",
        "Firmy technologiczne",
        "Instytuty medyczne"
      ]
    },
    artistic: {
      overview: "Osoby z wysokim wynikiem w kategorii Artysta (Twórca) cenią kreatywność, samowyrażanie i estetykę. Lubią pracować w niestandardowych, innowacyjnych projektach.",
      characteristics: [
        "Masz bogate życie wewnętrzne i wyobraźnię",
        "Preferujesz swobodę twórczą nad rutynowymi zadaniami",
        "Cenisz piękno, harmonię i oryginalność",
        "Wolisz elastyczne środowisko pracy"
      ],
      career_paths: [
        "Grafik / Designer / Artysta wizualny",
        "Muzyk / Kompozytor / Producent muzyczny",
        "Pisarz / Dziennikarz / Copywriter",
        "Aktor / Reżyser / Choreograf",
        "Architekt / Designer wnętrz"
      ],
      work_environments: [
        "Studia artystyczne i agencje kreatywne",
        "Media i rozrywka",
        "Muzea i galerie",
        "Firmy projektowe"
      ]
    },
    social: {
      overview: "Osoby z wysokim wynikiem w kategorii Społecznik (Pomocnik) uwielbiają pracować z ludźmi, pomagać innym i służyć społeczeństwu. Są empatyczne i zorientowane na relacje.",
      characteristics: [
        "Lubisz pomagać ludziom w rozwoju",
        "Masz naturalne zdolności interpersonalne",
        "Cenisz współpracę i pracę zespołową",
        "Wolisz środowiska wspierające i opiekuńcze"
      ],
      career_paths: [
        "Nauczyciel / Wykładowca / Trener",
        "Pielęgniarka / Terapeuta / Fizjoterapeuta",
        "Psycholog / Doradca / Coach",
        "Pracownik socjalny / HR Specialist",
        "Logopeda / Pedagog specjalny"
      ],
      work_environments: [
        "Szkoły i uniwersytety",
        "Szpitale i kliniki",
        "Ośrodki terapeutyczne",
        "Organizacje non-profit"
      ]
    },
    enterprising: {
      overview: "Osoby z wysokim wynikiem w kategorii Przedsiębiorca (Lider) lubią przewodzić, przekonywać i wpływać na innych. Są ambitne, pewne siebie i zorientowane na cel.",
      characteristics: [
        "Lubisz przejmować inicjatywę i liderować",
        "Masz naturalne zdolności perswazyjne",
        "Cenisz osiągnięcia i sukces",
        "Wolisz dynamiczne, konkurencyjne środowisko"
      ],
      career_paths: [
        "Manager / Dyrektor / CEO",
        "Przedsiębiorca / Właściciel firmy",
        "Sprzedawca / Account Manager",
        "Prawnik / Adwokat / Konsultant",
        "Polityk / Lobbysta / Rzecznik prasowy"
      ],
      work_environments: [
        "Korporacje i firmy konsultingowe",
        "Start-upy i własne biznesy",
        "Biura sprzedaży i rozwoju biznesu",
        "Kancelarie prawne"
      ]
    },
    conventional: {
      overview: "Osoby z wysokim wynikiem w kategorii Organizator (Systematyk) preferują ustrukturyzowaną, uporządkowaną pracę z jasnymi procedurami. Cenią dokładność, terminowość i porządek.",
      characteristics: [
        "Lubisz jasne zasady i procedury",
        "Masz doskonałe zdolności organizacyjne",
        "Cenisz szczegółowość i dokładność",
        "Wolisz przewidywalne środowisko pracy"
      ],
      career_paths: [
        "Księgowy / Audytor / Kontroler finansowy",
        "Administrator / Asystent zarządu",
        "Bibliotekarz / Archiwista",
        "Analityk finansowy / Specjalista ds. budżetu",
        "Urzędnik / Specjalista ds. compliance"
      ],
      work_environments: [
        "Biura księgowe i finansowe",
        "Instytucje rządowe",
        "Banki i firmy ubezpieczeniowe",
        "Działy administracyjne"
      ]
    }
  };

  const interpretation = interpretations[typeId] || {};
  const rankLabel = rank === 1 ? 'Główne zainteresowanie' : rank === 2 ? 'Drugie zainteresowanie' : 'Trzecie zainteresowanie';

  return {
    rank_label: rankLabel,
    ...interpretation
  };
}

/**
 * Generate complete career interests report with interpretations
 * @param {Object} scores - Career scores object from calculateCareerScore
 * @returns {Object} Full report with interpretations
 */
export function generateCareerReport(scores) {
  const top3WithInterpretations = scores.top_3.map(type => ({
    ...type,
    interpretation: getCareerInterpretation(type.id, type.rank)
  }));

  return {
    test_id: scores.test_id,
    test_name: scores.test_name,
    completed_at: scores.completed_at,
    holland_code: scores.holland_code,
    top_3: top3WithInterpretations,
    all_scores: scores.all_scores,
    chart_data: scores.chart_data,
    summary: {
      primary_interest: top3WithInterpretations[0],
      holland_code_explanation: `Twój Kod Hollanda to ${scores.holland_code}. Ten trójliteralny kod reprezentuje Twoje trzy najsilniejsze zainteresowania zawodowe w kolejności od najważniejszego.`
    }
  };
}

/**
 * Calculate Personal Values scores using MRAT (Mean-Referenced Average Technique)
 * This method centers scores around the person's mean response
 * @param {Object} responses - Object mapping question IDs to answers (1-6)
 * @returns {Object} Centered value scores
 */
export function calculateValuesScore(responses) {
  // Validate all 40 questions are answered
  if (Object.keys(responses).length !== 40) {
    throw new Error(`Expected 40 responses, got ${Object.keys(responses).length}`);
  }

  // Step 1: Calculate raw averages for each value
  const rawScores = {};
  
  VALUES_TEST.values.forEach(value => {
    const questions = VALUES_TEST.questions.filter(q => q.value === value.id);
    const sum = questions.reduce((acc, q) => acc + (responses[q.id] || 0), 0);
    const average = sum / questions.length;
    
    rawScores[value.id] = {
      raw_average: parseFloat(average.toFixed(3)),
      name: value.name,
      name_en: value.name_en,
      description: value.description,
      color: value.color,
      motivational_goal: value.motivational_goal,
      question_count: questions.length
    };
  });

  // Step 2: Calculate MRAT (person's mean across all 40 responses)
  const allResponses = Object.values(responses);
  const mrat = allResponses.reduce((sum, val) => sum + val, 0) / allResponses.length;
  const mratRounded = parseFloat(mrat.toFixed(3));

  // Step 3: Center scores (subtract MRAT from each raw average)
  const centeredScores = {};
  Object.entries(rawScores).forEach(([valueId, data]) => {
    centeredScores[valueId] = {
      ...data,
      centered_score: parseFloat((data.raw_average - mratRounded).toFixed(3))
    };
  });

  // Step 4: Sort by centered score (descending)
  const sortedValues = Object.entries(centeredScores)
    .sort((a, b) => b[1].centered_score - a[1].centered_score);

  // Get top 3 priorities and bottom 3 sacrifices
  const top3 = sortedValues.slice(0, 3).map(([id, data], index) => ({
    rank: index + 1,
    id: id,
    name: data.name,
    name_en: data.name_en,
    score: data.centered_score,
    raw_average: data.raw_average,
    description: data.description,
    color: data.color
  }));

  const bottom3 = sortedValues.slice(-3).map(([id, data], index) => ({
    rank: 8 + index,
    id: id,
    name: data.name,
    name_en: data.name_en,
    score: data.centered_score,
    raw_average: data.raw_average,
    description: data.description,
    color: data.color
  }));

  // Prepare data for diverging bar chart
  const chartData = sortedValues.map(([id, data]) => ({
    value: data.name,
    score: data.centered_score,
    color: data.color,
    fullMark: 3.0
  }));

  return {
    test_id: 'values_schwartz',
    test_name: 'Test Wartości Osobistych',
    completed_at: new Date().toISOString(),
    mrat: mratRounded,
    top_3: top3,
    bottom_3: bottom3,
    all_scores: centeredScores,
    chart_data: chartData,
    sorted_values: sortedValues.map(([id, data]) => ({
      id,
      ...data
    }))
  };
}

/**
 * Get interpretation for a specific value
 * @param {string} valueId - Value ID
 * @param {number} centeredScore - Centered score (-3 to +3)
 * @returns {Object} Value interpretation
 */
export function getValueInterpretation(valueId, centeredScore) {
  const interpretations = {
    self_direction: {
      high: {
        description: "Samokierowanie jest dla Ciebie kluczową wartością. Cenisz niezależność myślenia i działania.",
        characteristics: [
          "Preferujesz autonomię w podejmowaniu decyzji",
          "Kreatywność i innowacyjność są dla Ciebie ważne",
          "Cenisz możliwość eksplorowania i odkrywania",
          "Wolisz mieć kontrolę nad swoim życiem"
        ],
        life_implications: [
          "Szukasz kariery dającej swobodę działania",
          "Unikasz nadmiernej kontroli ze strony innych",
          "Rozwijasz unikalne pomysły i rozwiązania",
          "Cenisz środowiska sprzyjające kreatywności"
        ]
      },
      low: {
        description: "Samokierowanie nie jest Twoim priorytetem. Prawdopodobnie cenisz strukturę i wskazówki.",
        characteristics: [
          "Czujesz się komfortowo z jasnymi wytycznymi",
          "Preferujesz sprawdzone rozwiązania",
          "Cenisz współpracę nad indywidualizmem",
          "Doceniasz doświadczenie innych"
        ]
      }
    },
    stimulation: {
      high: {
        description: "Stymulacja jest dla Ciebie istotna. Szukasz emocji, wyzwań i nowości.",
        characteristics: [
          "Lubisz ekscytujące i różnorodne doświadczenia",
          "Łatwo znudzisz się rutyną",
          "Chętnie podejmujesz ryzyko",
          "Poszukujesz nowych wyzwań"
        ],
        life_implications: [
          "Szukasz dynamicznego środowiska pracy",
          "Potrzebujesz zmian i różnorodności",
          "Podróże i przygody są dla Ciebie ważne",
          "Eksperymentujesz z nowymi ideami"
        ]
      },
      low: {
        description: "Stymulacja nie jest Twoim priorytetem. Cenisz stabilność i przewidywalność.",
        characteristics: [
          "Preferujesz rutynę i stabilność",
          "Czujesz się komfortowo w znanym otoczeniu",
          "Ostrożnie podchodzisz do ryzyka",
          "Doceniasz spokój i porządek"
        ]
      }
    },
    hedonism: {
      high: {
        description: "Hedonizm jest dla Ciebie ważny. Cenisz przyjemność i życiowe radości.",
        characteristics: [
          "Ważne jest dla Ciebie czerpanie przyjemności z życia",
          "Doceniasz zmysłowe doświadczenia",
          "Lubisz się dobrze bawić",
          "Stawiasz na komfort i przyjemność"
        ],
        life_implications: [
          "Dbasz o work-life balance",
          "Aktywnie szukasz źródeł przyjemności",
          "Doceniasz estetykę i piękno",
          "Nie boisz się celebrować sukcesów"
        ]
      },
      low: {
        description: "Hedonizm nie jest Twoim priorytetem. Prawdopodobnie stawiasz na inne wartości niż osobista przyjemność.",
        characteristics: [
          "Potrafisz odkładać gratyfikację",
          "Skupiasz się na celach długoterminowych",
          "Przyjemność nie jest głównym motywatorem",
          "Potrafisz dostrzec wartość w wysiłku"
        ]
      }
    },
    achievement: {
      high: {
        description: "Osiągnięcia są dla Ciebie kluczowe. Dążysz do sukcesu i uznania.",
        characteristics: [
          "Ambitny i skoncentrowany na celach",
          "Chcesz wykazać się kompetencjami",
          "Sukces zawodowy jest dla Ciebie ważny",
          "Motywuje Cię uznanie innych"
        ],
        life_implications: [
          "Stawiasz sobie wysokie cele",
          "Pracujesz nad rozwojem kompetencji",
          "Szukasz okazji do wykazania się",
          "Cenisz konkurencyjne środowiska"
        ]
      },
      low: {
        description: "Osiągnięcia nie są Twoim głównym priorytetem. Prawdopodobnie kierują Tobą inne motywatory.",
        characteristics: [
          "Sukces materialny nie jest najważniejszy",
          "Cenisz inne aspekty życia",
          "Nie potrzebujesz zewnętrznego uznania",
          "Masz własną definicję sukcesu"
        ]
      }
    },
    power: {
      high: {
        description: "Władza jest dla Ciebie istotna. Cenisz status, prestiż i kontrolę.",
        characteristics: [
          "Dążysz do pozycji wpływowych",
          "Ważny jest dla Ciebie status społeczny",
          "Lubisz mieć kontrolę nad sytuacją",
          "Zasoby i prestiż są dla Ciebie ważne"
        ],
        life_implications: [
          "Szukasz pozycji liderskich",
          "Dbasz o swoją reputację",
          "Chcesz wpływać na decyzje",
          "Sukces materialny jest ważny"
        ]
      },
      low: {
        description: "Władza nie jest Twoim priorytetem. Prawdopodobnie bardziej cenisz równość i współpracę.",
        characteristics: [
          "Status społeczny nie jest dla Ciebie kluczowy",
          "Cenisz równość nad hierarchię",
          "Nie potrzebujesz dominacji",
          "Wolisz współpracę od kontroli"
        ]
      }
    },
    security: {
      high: {
        description: "Bezpieczeństwo jest dla Ciebie fundamentalne. Cenisz stabilność i przewidywalność.",
        characteristics: [
          "Potrzebujesz poczucia bezpieczeństwa",
          "Ważna jest dla Ciebie stabilność",
          "Planujesz i zabezpieczasz przyszłość",
          "Cenisz porządek i harmonię"
        ],
        life_implications: [
          "Dbasz o zabezpieczenie finansowe",
          "Unikasz nadmiernego ryzyka",
          "Cenisz stałe relacje",
          "Preferujesz sprawdzone rozwiązania"
        ]
      },
      low: {
        description: "Bezpieczeństwo nie jest Twoim głównym priorytetem. Prawdopodobnie bardziej cenisz elastyczność.",
        characteristics: [
          "Nie potrzebujesz stałości",
          "Komfortowo czujesz się z niepewnością",
          "Otwartość ważniejsza niż bezpieczeństwo",
          "Potrafisz żyć w zmiennym środowisku"
        ]
      }
    },
    conformity: {
      high: {
        description: "Konformizm jest dla Ciebie ważny. Cenisz zgodność z normami i oczekiwaniami.",
        characteristics: [
          "Szanujesz normy społeczne",
          "Ważne jest dla Ciebie nie ranić innych",
          "Przestrzegasz zasad i konwencji",
          "Dbasz o właściwe zachowanie"
        ],
        life_implications: [
          "Unikasz konfliktów",
          "Dostosujesz się do oczekiwań",
          "Cenisz harmonię społeczną",
          "Respektujesz autorytet"
        ]
      },
      low: {
        description: "Konformizm nie jest Twoim priorytetem. Prawdopodobnie bardziej cenisz autentyczność.",
        characteristics: [
          "Nie boisz się wyrażać odmiennego zdania",
          "Kwestionujesz status quo",
          "Cenisz autentyczność nad konwencję",
          "Potrafisz iść pod prąd"
        ]
      }
    },
    tradition: {
      high: {
        description: "Tradycja jest dla Ciebie istotna. Szanujesz zwyczaje i kulturowe dziedzictwo.",
        characteristics: [
          "Cenisz tradycyjne wartości",
          "Respektujesz zwyczaje rodzinne",
          "Ważne są dla Ciebie korzenie",
          "Doceniasz sprawdzone wzorce"
        ],
        life_implications: [
          "Podtrzymujesz tradycje rodzinne",
          "Szanujesz kulturowe dziedzictwo",
          "Cenisz ciągłość i historię",
          "Wolisz sprawdzone sposoby"
        ]
      },
      low: {
        description: "Tradycja nie jest Twoim priorytetem. Prawdopodobnie bardziej jesteś otwarty na zmiany.",
        characteristics: [
          "Nie przywiązujesz się do przeszłości",
          "Otwarty na nowe podejścia",
          "Kwestionujesz tradycyjne wzorce",
          "Skupiasz się na przyszłości"
        ]
      }
    },
    benevolence: {
      high: {
        description: "Życzliwość jest dla Ciebie kluczowa. Dbasz o dobro bliskich osób.",
        characteristics: [
          "Troska o innych jest dla Ciebie ważna",
          "Jesteś lojalny i pomocny",
          "Stawiasz potrzeby bliskich wysoko",
          "Budowanie relacji jest priorytetem"
        ],
        life_implications: [
          "Poświęcasz czas dla bliskich",
          "Aktywnie wspierasz innych",
          "Relacje są dla Ciebie kluczowe",
          "Potrafisz się poświęcić dla bliskich"
        ]
      },
      low: {
        description: "Życzliwość nie jest Twoim głównym priorytetem. Prawdopodobnie skupiasz się na innych aspektach.",
        characteristics: [
          "Niezależność jest dla Ciebie ważniejsza",
          "Skupiasz się na własnych celach",
          "Granice osobiste są istotne",
          "Stawiasz na samowystarczalność"
        ]
      }
    },
    universalism: {
      high: {
        description: "Uniwersalizm jest dla Ciebie fundamentalny. Dbasz o dobro wszystkich ludzi i natury.",
        characteristics: [
          "Zależy Ci na sprawiedliwości społecznej",
          "Dbasz o ochronę środowiska",
          "Cenisz różnorodność i tolerancję",
          "Patrzysz globalnie"
        ],
        life_implications: [
          "Angażujesz się w sprawy społeczne",
          "Podejmujesz ekologiczne wybory",
          "Wspierasz równość i sprawiedliwość",
          "Działasz na rzecz większego dobra"
        ]
      },
      low: {
        description: "Uniwersalizm nie jest Twoim priorytetem. Prawdopodobnie skupiasz się na bliższym otoczeniu.",
        characteristics: [
          "Skupiasz się na swoim kręgu",
          "Lokalne sprawy są ważniejsze",
          "Pragmatyczne podejście do świata",
          "Priorytet dla bliskich, nie ogółu"
        ]
      }
    }
  };

  const interpretation = interpretations[valueId] || {};
  const level = centeredScore >= 0.5 ? 'high' : 'low';
  
  return {
    level,
    score: centeredScore,
    ...interpretation[level]
  };
}

/**
 * Generate complete values report with interpretations
 * @param {Object} scores - Values scores object from calculateValuesScore
 * @returns {Object} Full report with interpretations
 */
export function generateValuesReport(scores) {
  const valuesWithInterpretations = scores.sorted_values.map(value => ({
    id: value.id,
    name: value.name,
    name_en: value.name_en,
    centered_score: value.centered_score,
    raw_average: value.raw_average,
    color: value.color,
    description: value.description,
    motivational_goal: value.motivational_goal,
    interpretation: getValueInterpretation(value.id, value.centered_score)
  }));

  return {
    test_id: scores.test_id,
    test_name: scores.test_name,
    completed_at: scores.completed_at,
    mrat: scores.mrat,
    top_3: scores.top_3.map(v => ({
      ...v,
      interpretation: getValueInterpretation(v.id, v.score)
    })),
    bottom_3: scores.bottom_3.map(v => ({
      ...v,
      interpretation: getValueInterpretation(v.id, v.score)
    })),
    all_values: valuesWithInterpretations,
    chart_data: scores.chart_data,
    summary: {
      primary_value: valuesWithInterpretations[0],
      mrat_explanation: `Twoje wyniki są wycentrowane względem Twojej osobistej średniej (MRAT = ${scores.mrat.toFixed(2)}). Wartości dodatnie to Twoje prioretety, ujemne to rzeczy mniej istotne w Twoim życiu.`
    }
  };
}
