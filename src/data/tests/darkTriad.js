// Dark Triad (SD3) - Test Ciemnej Triady
// Bada "cień" osobowości: Narcyzm, Makiawelizm, Psychopatia
// 27 pytań, skala Likerta 1-5

export const DARK_TRIAD_TEST = {
  test_id: 'dark_triad_sd3',
  test_name: 'Dark Triad SD3',
  test_type: 'dark_traits',
  time_estimate_minutes: 8,
  question_count: 27,
  scale_type: 'likert_5',
  scale_labels: {
    1: 'Zdecydowanie się nie zgadzam',
    2: 'Nie zgadzam się',
    3: 'Neutralnie',
    4: 'Zgadzam się',
    5: 'Zdecydowanie się zgadzam'
  },
  dimensions: [
    {
      id: 'machiavellianism',
      name: 'Makiawelizm',
      name_en: 'Machiavellianism',
      description: 'Skłonność do manipulacji, cynizmu i strategicznego myślenia',
      icon: '🎭'
    },
    {
      id: 'narcissism',
      name: 'Narcyzm',
      name_en: 'Narcissism',
      description: 'Nadmierna potrzeba podziwu, poczucie wyjątkowości i uprzywilejowania',
      icon: '👑'
    },
    {
      id: 'psychopathy',
      name: 'Psychopatia',
      name_en: 'Psychopathy',
      description: 'Impulsywność, brak empatii i skłonność do ryzyka',
      icon: '⚡'
    }
  ],
  questions: [
    // MACHIAVELLIANISM (9 questions)
    {
      id: 'dt_001',
      text: 'Nie jest mądrze zdradzać swoich sekretów innym',
      dimension: 'machiavellianism',
      reverse: false
    },
    {
      id: 'dt_002',
      text: 'Lubię używać sprytnej manipulacji, aby osiągnąć swoje cele',
      dimension: 'machiavellianism',
      reverse: false
    },
    {
      id: 'dt_003',
      text: 'Bez względu na to, co trzeba zrobić, musisz pozyskać ważne osoby na swoją stronę',
      dimension: 'machiavellianism',
      reverse: false
    },
    {
      id: 'dt_004',
      text: 'Unikam bezpośredniego konfliktu z innymi, ponieważ mogą być przydatni w przyszłości',
      dimension: 'machiavellianism',
      reverse: false
    },
    {
      id: 'dt_005',
      text: 'Mądrze jest zbierać informacje, które można później wykorzystać przeciwko ludziom',
      dimension: 'machiavellianism',
      reverse: false
    },
    {
      id: 'dt_006',
      text: 'Powinieneś czekać na odpowiedni moment, aby odegrać się na ludziach',
      dimension: 'machiavellianism',
      reverse: false
    },
    {
      id: 'dt_007',
      text: 'Są rzeczy, które powinieneś ukrywać przed innymi, aby chronić swoją reputację',
      dimension: 'machiavellianism',
      reverse: false
    },
    {
      id: 'dt_008',
      text: 'Upewnij się, że Twoje plany przynoszą korzyść Tobie, a nie innym',
      dimension: 'machiavellianism',
      reverse: false
    },
    {
      id: 'dt_009',
      text: 'Większością ludzi można manipulować przy odpowiednim podejściu',
      dimension: 'machiavellianism',
      reverse: false
    },
    
    // NARCISSISM (9 questions)
    {
      id: 'dt_010',
      text: 'Ludzie postrzegają mnie jako naturalnego przywódcę',
      dimension: 'narcissism',
      reverse: false
    },
    {
      id: 'dt_011',
      text: 'Nienawidzę być w centrum uwagi',
      dimension: 'narcissism',
      reverse: true
    },
    {
      id: 'dt_012',
      text: 'Wiele grupowych aktywności bywa nudnych beze mnie',
      dimension: 'narcissism',
      reverse: false
    },
    {
      id: 'dt_013',
      text: 'Wiem, że jestem dobry, bo wszyscy mi o tym mówią',
      dimension: 'narcissism',
      reverse: false
    },
    {
      id: 'dt_014',
      text: 'Lubię poznawać ważne osoby',
      dimension: 'narcissism',
      reverse: false
    },
    {
      id: 'dt_015',
      text: 'Czuję się zakłopotany, gdy ktoś mi komplementuje',
      dimension: 'narcissism',
      reverse: true
    },
    {
      id: 'dt_016',
      text: 'Byłem porównywany do znanych osób',
      dimension: 'narcissism',
      reverse: false
    },
    {
      id: 'dt_017',
      text: 'Jestem przeciętną osobą',
      dimension: 'narcissism',
      reverse: true
    },
    {
      id: 'dt_018',
      text: 'Nalegam na otrzymanie szacunku, na który zasługuję',
      dimension: 'narcissism',
      reverse: false
    },
    
    // PSYCHOPATHY (9 questions)
    {
      id: 'dt_019',
      text: 'Lubię mścić się na autorytetach, które utrudniają mi życie',
      dimension: 'psychopathy',
      reverse: false
    },
    {
      id: 'dt_020',
      text: 'Unikam niebezpiecznych sytuacji',
      dimension: 'psychopathy',
      reverse: true
    },
    {
      id: 'dt_021',
      text: 'Zemsta powinna być szybka i bolesna',
      dimension: 'psychopathy',
      reverse: false
    },
    {
      id: 'dt_022',
      text: 'Ludzie często mówią, że jestem poza kontrolą',
      dimension: 'psychopathy',
      reverse: false
    },
    {
      id: 'dt_023',
      text: 'To prawda, że potrafię być wredny dla innych',
      dimension: 'psychopathy',
      reverse: false
    },
    {
      id: 'dt_024',
      text: 'Ludzie, którzy ze mną zadzierają, zawsze tego żałują',
      dimension: 'psychopathy',
      reverse: false
    },
    {
      id: 'dt_025',
      text: 'Nigdy nie miałem problemów z prawem',
      dimension: 'psychopathy',
      reverse: true
    },
    {
      id: 'dt_026',
      text: 'Lubię mieć intymne relacje z ludźmi, których ledwo znam',
      dimension: 'psychopathy',
      reverse: false
    },
    {
      id: 'dt_027',
      text: 'Powiem cokolwiek, aby dostać to, czego chcę',
      dimension: 'psychopathy',
      reverse: false
    }
  ],
  
  // Population norms for level determination
  norms: {
    machiavellianism: {
      mean: 3.1,
      low: [1.0, 2.8],
      average: [2.8, 3.4],
      high: [3.4, 5.0]
    },
    narcissism: {
      mean: 2.8,
      low: [1.0, 2.5],
      average: [2.5, 3.2],
      high: [3.2, 5.0]
    },
    psychopathy: {
      mean: 2.3,
      low: [1.0, 2.0],
      average: [2.0, 2.7],
      high: [2.7, 5.0]
    }
  }
};
