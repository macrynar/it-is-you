/**
 * DNA Kariery – Career DNA Test
 * 20 questions, 4-choice (A/B/C/D) format
 * 6 dimensions: AN, SO, CR, ST, LE, HO
 */

export const CAREER_DNA_TEST = {
  test_id: 'career_dna_v1',
  test_name: 'DNA Kariery',
  test_type: 'career_dna',
  time_estimate_minutes: 8,
  question_count: 20,
  scale_type: 'choice_4',

  dimensions: [
    {
      id: 'AN',
      name: 'Analityczność',
      name_en: 'Analytical',
      description: 'Skłonność do rozumowania logicznego, badania danych i rozwiązywania złożonych problemów.',
      icon: '🔍',
      color: '#3b82f6',
      max: 21,
    },
    {
      id: 'SO',
      name: 'Praca z ludźmi',
      name_en: 'Social',
      description: 'Orientacja na relacje międzyludzkie, pomaganie i efektywną komunikację.',
      icon: '🤝',
      color: '#10b981',
      max: 21,
    },
    {
      id: 'CR',
      name: 'Kreatywność',
      name_en: 'Creative',
      description: 'Potrzeba tworzenia, eksperymentowania i wprowadzania oryginalnych pomysłów.',
      icon: '🎨',
      color: '#a855f7',
      max: 21,
    },
    {
      id: 'ST',
      name: 'Ustrukturyzowanie',
      name_en: 'Structured',
      description: 'Preferencja dla porządku, planowania i systematycznego podejścia do pracy.',
      icon: '📐',
      color: '#f59e0b',
      max: 21,
    },
    {
      id: 'LE',
      name: 'Przywództwo',
      name_en: 'Leadership',
      description: 'Tendencja do przewodzenia, podejmowania decyzji i inspirowania innych.',
      icon: '🧭',
      color: '#ef4444',
      max: 18,
    },
    {
      id: 'HO',
      name: 'Praktyczność',
      name_en: 'Hands-on',
      description: 'Orientacja na konkretne działanie, rzemiosło i namacalne efekty pracy.',
      icon: '🔧',
      color: '#f97316',
      max: 18,
    },
  ],

  // 15 profile mappings based on top-2 dimensions
  profiles: {
    'AN+ST': { name: 'Architekt Systemów',  emoji: '🏗️', tagline: 'Budujesz logiczne, niezawodne struktury.' },
    'AN+CR': { name: 'Innowator',           emoji: '💡', tagline: 'Łączysz analizę z twórczym myśleniem.' },
    'AN+LE': { name: 'Strateg',             emoji: '♟️', tagline: 'Myślisz kilka kroków naprzód.' },
    'AN+SO': { name: 'Badacz Ludzi',        emoji: '🔎', tagline: 'Rozumiesz systemy i ludzi jednocześnie.' },
    'AN+HO': { name: 'Inżynier',            emoji: '⚙️', tagline: 'Przekształcasz wiedzę w działające rozwiązania.' },
    'SO+LE': { name: 'Lider Ludzi',         emoji: '👥', tagline: 'Inspirujesz i prowadzisz innych.' },
    'SO+CR': { name: 'Komunikator',         emoji: '🗣️', tagline: 'Tworzysz i łączysz przez opowieści.' },
    'SO+ST': { name: 'Koordynator',         emoji: '📋', tagline: 'Organizujesz ludzi i procesy.' },
    'SO+HO': { name: 'Opiekun',             emoji: '🫶', tagline: 'Pomagasz konkretnie i z zaangażowaniem.' },
    'CR+HO': { name: 'Twórca',              emoji: '✍️', tagline: 'Twoje dłonie materializują pomysły.' },
    'CR+LE': { name: 'Wizjoner',            emoji: '🌟', tagline: 'Prowadzisz innych ku nieznanym horyzontom.' },
    'CR+ST': { name: 'Designer',            emoji: '🎯', tagline: 'Łączysz estetykę z funkcjonalną strukturą.' },
    'ST+LE': { name: 'Menedżer',            emoji: '📊', tagline: 'Zarządzasz zasobami i ludźmi z precyzją.' },
    'ST+HO': { name: 'Rzemieślnik',         emoji: '🧰', tagline: 'Metodycznie doskonalisz swoje rzemiosło.' },
    'LE+HO': { name: 'Budowniczy',          emoji: '🏛️', tagline: 'Realizujesz ambitne projekty od podstaw.' },
  },

  questions: [
    // P1
    {
      id: 'p1',
      text: 'Kiedy mam do wykonania nowe zadanie, zazwyczaj...',
      options: [
        { label: 'A', text: 'Najpierw dokładnie analizuję problem i tworzę szczegółowy plan działania.', scores: { AN: 3, ST: 1 } },
        { label: 'B', text: 'Chętnie angażuję innych i wspólnie ustalamy podejście.', scores: { SO: 3 } },
        { label: 'C', text: 'Od razu próbuję różnych rozwiązań i eksperymentuję.', scores: { HO: 2, CR: 1 } },
        { label: 'D', text: 'Szukam sprawdzonej procedury i krok po kroku ją realizuję.', scores: { ST: 3 } },
      ],
    },
    // P2
    {
      id: 'p2',
      text: 'Mój idealny projekt zawodowy to taki, który...',
      options: [
        { label: 'A', text: 'Ma jasno określone etapy, terminy i kryteria sukcesu.', scores: { ST: 3 } },
        { label: 'B', text: 'Pozwala mi wymyślać oryginalne rozwiązania i tworzyć coś nowego.', scores: { CR: 3 } },
        { label: 'C', text: 'Wymaga dogłębnej analizy danych, teorii i zależności.', scores: { AN: 3 } },
        { label: 'D', text: 'Kończy się namacalnym, fizycznym efektem mojej pracy.', scores: { HO: 3 } },
      ],
    },
    // P3
    {
      id: 'p3',
      text: 'W kontekście pracy zespołowej najczęściej...',
      options: [
        { label: 'A', text: 'Naturalnie przejmuję inicjatywę i prowadzę grupę do celu.', scores: { LE: 3 } },
        { label: 'B', text: 'Skupiam się na tym, by każdy czuł się zaangażowany.', scores: { SO: 2 } },
        { label: 'C', text: 'Wolę realizować swoje zadania samodzielnie i nie angażować innych.', scores: { LE: -1 } },
        { label: 'D', text: 'Analizuję możliwości i służę radą, nie forsując roli lidera.', scores: { AN: 2, LE: 1 } },
      ],
    },
    // P4
    {
      id: 'p4',
      text: 'Najlepiej czuję się, gdy mogę...',
      options: [
        { label: 'A', text: 'Badać problemy, szukać przyczyn i weryfikować hipotezy.', scores: { AN: 3 } },
        { label: 'B', text: 'Tworzyć oryginalne koncepcje, projekty lub dzieła.', scores: { CR: 3 } },
        { label: 'C', text: 'Pomagać ludziom rozwiązywać ich problemy.', scores: { SO: 3 } },
        { label: 'D', text: 'Realizować konkretne zadania według jasnych wytycznych.', scores: { ST: 2, HO: 1 } },
      ],
    },
    // P5
    {
      id: 'p5',
      text: 'Kiedy uczę się nowej umiejętności, preferuję...',
      options: [
        { label: 'A', text: 'Strukturalne szkolenia z wyraźnym programem i zadaniami.', scores: { ST: 3 } },
        { label: 'B', text: 'Samodzielne zgłębianie tematu, analizowanie i eksperymentowanie.', scores: { AN: 2, CR: 1 } },
        { label: 'C', text: 'Naukę przez interakcję – warsztaty i rozmowy z ekspertami.', scores: { SO: 3 } },
        { label: 'D', text: 'Praktyczne ćwiczenia, gdzie od razu stosuję wiedzę.', scores: { HO: 3 } },
      ],
    },
    // P6
    {
      id: 'p6',
      text: 'Gdy widzę, że coś w firmie nie działa, zazwyczaj...',
      options: [
        { label: 'A', text: 'Inicjuję zmianę – rozmawiam z ludźmi i proponuję rozwiązania.', scores: { LE: 2, SO: 1 } },
        { label: 'B', text: 'Staram się zrozumieć, co czują współpracownicy i jak pomóc.', scores: { SO: 3 } },
        { label: 'C', text: 'Zbieram dane, analizuję przyczyny i przygotowuję diagnozę.', scores: { AN: 3 } },
        { label: 'D', text: 'Czekam, aż ktoś inny to naprawi – to nie moja rola.', scores: { LE: -1 } },
      ],
    },
    // P7
    {
      id: 'p7',
      text: 'Praca, która daje mi największą satysfakcję, polega na...',
      options: [
        { label: 'A', text: 'Tworzeniu precyzyjnych analiz z dbałością o szczegóły.', scores: { AN: 3, ST: 1 } },
        { label: 'B', text: 'Eksperymentowaniu z nowymi podejściami i metodami.', scores: { CR: 2 } },
        { label: 'C', text: 'Bezpośredniej pomocy innym ludziom.', scores: { SO: 3 } },
        { label: 'D', text: 'Zarządzaniu projektami według ustalonych harmonogramów.', scores: { ST: 3 } },
      ],
    },
    // P8
    {
      id: 'p8',
      text: 'W wolnym czasie zwykle...',
      options: [
        { label: 'A', text: 'Czytam, rozwiązuję łamigłówki lub uczę się nowych zagadnień.', scores: { AN: 3 } },
        { label: 'B', text: 'Spędzam czas z bliskimi lub angażuję się w projekty społeczne.', scores: { SO: 2, LE: 1 } },
        { label: 'C', text: 'Realizuję kreatywne hobby – muzykę, rysunek, pisanie.', scores: { CR: 3 } },
        { label: 'D', text: 'Naprawiam, buduję lub usprawniają coś własnoręcznie.', scores: { HO: 3 } },
      ],
    },
    // P9
    {
      id: 'p9',
      text: 'Które zdanie najbardziej do Ciebie pasuje?',
      options: [
        { label: 'A', text: 'Lubię mieć wszystko zaplanowane i poukładane.', scores: { ST: 2 } },
        { label: 'B', text: 'Najważniejsze są relacje i praca z ludźmi.', scores: { SO: 2 } },
        { label: 'C', text: 'Ciągnie mnie do wszystkiego, co nowe i oryginalne.', scores: { CR: 2 } },
        { label: 'D', text: 'Wolę konkretne działanie od teoretyzowania.', scores: { HO: 2 } },
      ],
    },
    // P10
    {
      id: 'p10',
      text: 'Podczas pracy w grupie najchętniej przejmuję rolę...',
      options: [
        { label: 'A', text: 'Koordynatora – śledzę postępy i pilnuję harmonogramu.', scores: { AN: 2, ST: 1 } },
        { label: 'B', text: 'Wykonawcy – robię konkretne zadania i dostarczam rezultaty.', scores: { HO: 3 } },
        { label: 'C', text: 'Moderatora – dbam o komunikację i relacje w teamie.', scores: { SO: 3 } },
        { label: 'D', text: 'Generatora pomysłów – wymyślam nowe ścieżki rozwiązań.', scores: { CR: 2, AN: 1 } },
      ],
    },
    // P11
    {
      id: 'p11',
      text: 'Kiedy mam zrealizować zadanie w krótkim czasie...',
      options: [
        { label: 'A', text: 'Szybko tworzę plan, przypisuję priorytety i systematycznie działam.', scores: { ST: 3, AN: 1 } },
        { label: 'B', text: 'Szukam nieoczywistego, szybszego lub sprytniejszego rozwiązania.', scores: { CR: 3 } },
        { label: 'C', text: 'Mobilizuję zespół i dzielimy pracę między siebie.', scores: { SO: 3 } },
        { label: 'D', text: 'Biorę najtrudniejszą część na siebie i po prostu to robię.', scores: { HO: 2, LE: 1 } },
      ],
    },
    // P12
    {
      id: 'p12',
      text: 'Jakie środowisko pracy jest dla Ciebie najlepsze?',
      options: [
        { label: 'A', text: 'Dobrze zorganizowane, z jasno zdefiniowanymi rolami i procesami.', scores: { ST: 3 } },
        { label: 'B', text: 'Otwarte, pełne interakcji i możliwości pomagania innym.', scores: { SO: 3 } },
        { label: 'C', text: 'Wymagające intelektualnie, gdzie rozwiązuje się złożone problemy.', scores: { AN: 3 } },
        { label: 'D', text: 'Dynamiczne, kreatywne, gdzie nie ma miejsca na rutynę.', scores: { CR: 3 } },
      ],
    },
    // P13
    {
      id: 'p13',
      text: 'Co najbardziej motywuje Cię do pracy?',
      options: [
        { label: 'A', text: 'Odkrywanie prawdy – rozumienie, jak coś naprawdę działa.', scores: { AN: 3 } },
        { label: 'B', text: 'Widzenie namacalnych, realnych efektów własnej pracy.', scores: { HO: 2, LE: 1 } },
        { label: 'C', text: 'Wiedza, że moja praca pomaga konkretnym ludziom.', scores: { SO: 2 } },
        { label: 'D', text: 'Poczucie kontroli i realizowanie projektu zgodnie z planem.', scores: { ST: 3 } },
      ],
    },
    // P14
    {
      id: 'p14',
      text: 'Gdybym mógł/mogła teraz wybrać pracę, wybrałbym/wybrałabym...',
      options: [
        { label: 'A', text: 'Doradcę / Terapeutę / Coacha.', scores: { SO: 3 } },
        { label: 'B', text: 'Analityka / Badacza / Audytora.', scores: { AN: 2, ST: 1 } },
        { label: 'C', text: 'Designera / Twórcę treści / Artystę.', scores: { CR: 3 } },
        { label: 'D', text: 'Technika / Konstruktora / Rzemieślnika.', scores: { HO: 3 } },
      ],
    },
    // P15
    {
      id: 'p15',
      text: 'Jak radzisz sobie z niepewnością i zmianami w pracy?',
      options: [
        { label: 'A', text: 'Tworzę plany awaryjne i staram się przewidzieć każdy scenariusz.', scores: { ST: 3 } },
        { label: 'B', text: 'Analizuję sytuację i szukam optymalnej strategii postępowania.', scores: { AN: 2, LE: 1 } },
        { label: 'C', text: 'Traktuję zmiany jako szansę na nowe, twórcze rozwiązania.', scores: { CR: 2 } },
        { label: 'D', text: 'Skupiam się na tym, co mam pod kontrolą i działam pragmatycznie.', scores: { CR: 1, HO: 1 } },
      ],
    },
    // P16
    {
      id: 'p16',
      text: 'Kiedy prowadzę spotkanie lub prezentację...',
      options: [
        { label: 'A', text: 'Czuję się na swoim miejscu – lubię przewodzić i inspirować.', scores: { LE: 3, SO: 1 } },
        { label: 'B', text: 'Skupiam się na merytorycznym przygotowaniu i precyzji przekazu.', scores: { AN: 2 } },
        { label: 'C', text: 'Wolę demonstrować coś praktycznego niż mówić o abstrakcjach.', scores: { HO: 2 } },
        { label: 'D', text: 'Dbam o to, żeby każdy był wysłuchany i zrozumiany.', scores: { SO: 3 } },
      ],
    },
    // P17
    {
      id: 'p17',
      text: 'Jak podchodzisz do planowania kariery?',
      options: [
        { label: 'A', text: 'Wyznaczam ambitne cele i dążę do wzrostu odpowiedzialności.', scores: { LE: 3, ST: 1 } },
        { label: 'B', text: 'Stale poszerzam kompetencje, by stać się ekspertem w dziedzinie.', scores: { AN: 2, ST: 1 } },
        { label: 'C', text: 'Szukam ścieżek, które pozwolą mi tworzyć i wyrażać siebie.', scores: { CR: 3 } },
        { label: 'D', text: 'Interesuje mnie stabilność i rozwijanie praktycznego rzemiosła.', scores: { HO: 3 } },
      ],
    },
    // P18
    {
      id: 'p18',
      text: 'Które stwierdzenie najlepiej opisuje Twój styl myślenia?',
      options: [
        { label: 'A', text: 'Myślę logicznie i analitycznie – lubię głęboko rozumieć zagadnienia.', scores: { AN: 3 } },
        { label: 'B', text: 'Myślę empatycznie – rozumiem ludzi i ich potrzeby.', scores: { SO: 2 } },
        { label: 'C', text: 'Myślę systematycznie – lubię porządkować złożone informacje.', scores: { ST: 3 } },
        { label: 'D', text: 'Myślę dywergencyjnie – generuję wiele różnych pomysłów naraz.', scores: { CR: 3 } },
      ],
    },
    // P19
    {
      id: 'p19',
      text: 'Jaką rolę wolisz pełnić w organizacji?',
      options: [
        { label: 'A', text: 'Lidera / Menedżera – inspirować i prowadzić zespół.', scores: { LE: 2, SO: 1 } },
        { label: 'B', text: 'Eksperta / Specjalisty – być autorytetem w swojej dziedzinie.', scores: { AN: 2, ST: 1 } },
        { label: 'C', text: 'Wykonawcy / Rzemieślnika – realizować konkretne, namacalne zadania.', scores: { HO: 2 } },
        { label: 'D', text: 'Mentora / Opiekuna – wspierać innych w ich rozwoju.', scores: { SO: 3 } },
      ],
    },
    // P20
    {
      id: 'p20',
      text: 'Co według Ciebie jest kluczem do sukcesu zawodowego?',
      options: [
        { label: 'A', text: 'Wiedza, precyzja i systematyczność w każdym działaniu.', scores: { AN: 2, ST: 2 } },
        { label: 'B', text: 'Umiejętność budowania relacji i motywowania innych.', scores: { SO: 2, LE: 1 } },
        { label: 'C', text: 'Kreatywność, elastyczność i gotowość do eksperymentowania.', scores: { CR: 2, HO: 1 } },
        { label: 'D', text: 'Odwaga do podejmowania decyzji i brania odpowiedzialności.', scores: { LE: 3 } },
      ],
    },
  ],
};

export const CAREER_DNA_MAX_SCORES = { AN: 21, SO: 21, CR: 21, ST: 21, LE: 18, HO: 18 };
