/**
 * Motivation Engine Test
 * 40 questions, 8 dimensions, Likert 1-5 scale
 * Based on McClelland's Theory + Self-Determination Theory extensions
 */

export const MOTIVATION_TEST = {
  test_id: 'motivation_engine_40',
  test_name: 'Silnik Motywacji',
  test_type: 'motivation_engine',
  time_estimate_minutes: 12,
  question_count: 40,
  scale_type: 'likert_5',
  scale_labels: {
    1: 'Zdecydowanie się nie zgadzam',
    2: 'Raczej się nie zgadzam',
    3: 'Ani tak, ani nie',
    4: 'Raczej się zgadzam',
    5: 'Zdecydowanie się zgadzam',
  },
  dimensions: [
    {
      id: 'power',
      name: 'Władza i Wpływ',
      name_en: 'Power & Influence',
      description: 'Potrzeba wywierania wpływu, liderowania i zmieniania środowiska.',
      icon: '👑',
    },
    {
      id: 'affiliation',
      name: 'Przynależność',
      name_en: 'Affiliation',
      description: 'Potrzeba bliskich relacji, akceptacji i przynależności do grupy.',
      icon: '🫂',
    },
    {
      id: 'achievement',
      name: 'Osiągnięcia',
      name_en: 'Achievement',
      description: 'Potrzeba doskonalenia się, pokonywania wyzwań i osiągania ambitnych celów.',
      icon: '🏆',
    },
    {
      id: 'security',
      name: 'Bezpieczeństwo',
      name_en: 'Security',
      description: 'Potrzeba stabilności, przewidywalności i zabezpieczenia przyszłości.',
      icon: '🛡️',
    },
    {
      id: 'autonomy',
      name: 'Autonomia',
      name_en: 'Autonomy',
      description: 'Potrzeba niezależności, wolności i działania według własnych zasad.',
      icon: '🦅',
    },
    {
      id: 'meaning',
      name: 'Sens i Misja',
      name_en: 'Meaning & Mission',
      description: 'Potrzeba działania w zgodzie z wartościami i przyczyniania się do czegoś ważnego.',
      icon: '🌟',
    },
    {
      id: 'recognition',
      name: 'Uznanie',
      name_en: 'Recognition',
      description: 'Potrzeba zauważenia, docenienia i pozytywnej oceny przez innych.',
      icon: '🎖️',
    },
    {
      id: 'discovery',
      name: 'Odkrycie i Ciekawość',
      name_en: 'Discovery & Curiosity',
      description: 'Potrzeba eksplorowania, uczenia się i odkrywania nowych terytoriów.',
      icon: '🔭',
    },
  ],
  questions: [
    // Power & Influence (pw_001 – pw_005)
    { id: 'pw_001', text: 'Zależy mi na tym, by mieć wpływ na decyzje w moim otoczeniu.', dimension: 'power', reverse: false },
    { id: 'pw_002', text: 'Chętnie obejmuję rolę lidera, gdy mam ku temu okazję.', dimension: 'power', reverse: false },
    { id: 'pw_003', text: 'Motywuje mnie możliwość zmieniania środowiska wokół mnie.', dimension: 'power', reverse: false },
    { id: 'pw_004', text: 'Lubię, gdy inni słuchają moich wskazówek i podążają za moją wizją.', dimension: 'power', reverse: false },
    { id: 'pw_005', text: 'Status i pozycja społeczna są dla mnie ważnymi wyznacznikami sukcesu.', dimension: 'power', reverse: false },

    // Affiliation (af_001 – af_005)
    { id: 'af_001', text: 'Czuję się zaspokojony(-a), gdy jestem częścią zgranej grupy lub zespołu.', dimension: 'affiliation', reverse: false },
    { id: 'af_002', text: 'Bliskie relacje z innymi są dla mnie ważniejszą nagrodą niż indywidualne sukcesy.', dimension: 'affiliation', reverse: false },
    { id: 'af_003', text: 'Poczucie akceptacji i przynależności jest dla mnie silnym motywatorem.', dimension: 'affiliation', reverse: false },
    { id: 'af_004', text: 'Kiedy czuję się odłączony(-a) od innych, tracę motywację do działania.', dimension: 'affiliation', reverse: false },
    { id: 'af_005', text: 'Chętniej pracuję w zespole niż samotnie.', dimension: 'affiliation', reverse: false },

    // Achievement (ac_001 – ac_005)
    { id: 'ac_001', text: 'Stawiam sobie wysoko zawieszoną poprzeczkę i staram się ją przekroczyć.', dimension: 'achievement', reverse: false },
    { id: 'ac_002', text: 'Mierzę swój sukces konkretnymi wynikami i osiągnięciami.', dimension: 'achievement', reverse: false },
    { id: 'ac_003', text: 'Konkretne osiągnięcia i postęp w celach dają mi głęboką satysfakcję.', dimension: 'achievement', reverse: false },
    { id: 'ac_004', text: 'Lubię wyzwania, które wymagają ode mnie maksymalnego wysiłku.', dimension: 'achievement', reverse: false },
    { id: 'ac_005', text: 'Robię wszystko, by stać się ekspertem w tym, co robię.', dimension: 'achievement', reverse: false },

    // Security (se_001 – se_005)
    { id: 'se_001', text: 'Stabilność finansowa i zawodowa są dla mnie ważnym priorytetem.', dimension: 'security', reverse: false },
    { id: 'se_002', text: 'Preferuję pewność i przewidywalność nad ryzyko i przygodę.', dimension: 'security', reverse: false },
    { id: 'se_003', text: 'Silnie motywuje mnie chęć zabezpieczenia swojej przyszłości.', dimension: 'security', reverse: false },
    { id: 'se_004', text: 'Kiedy czuję się bezpiecznie i stabilnie, jestem najbardziej produktywny(-a).', dimension: 'security', reverse: false },
    { id: 'se_005', text: 'Unikam zmian, które mogłyby destabilizować moją sytuację.', dimension: 'security', reverse: false },

    // Autonomy (au_001 – au_005)
    { id: 'au_001', text: 'Potrzebuję wolności, by działać po swojemu — kontrola zewnętrzna mnie blokuje.', dimension: 'autonomy', reverse: false },
    { id: 'au_002', text: 'Motywuje mnie możliwość samodzielnego podejmowania decyzji.', dimension: 'autonomy', reverse: false },
    { id: 'au_003', text: 'Wolę pracować w niezależny sposób, bez konieczności ciągłego raportowania.', dimension: 'autonomy', reverse: false },
    { id: 'au_004', text: 'Niezależność i swoboda są ważniejsze niż wysokie zarobki.', dimension: 'autonomy', reverse: false },
    { id: 'au_005', text: 'Działam najlepiej, gdy nikt nie narzuca mi jak i kiedy mam coś robić.', dimension: 'autonomy', reverse: false },

    // Meaning & Mission (me_001 – me_005)
    { id: 'me_001', text: 'Potrzebuję wierzyć, że moja praca przyczynia się do czegoś ważnego.', dimension: 'meaning', reverse: false },
    { id: 'me_002', text: 'Działanie w zgodzie z moimi wartościami jest dla mnie silnym motywatorem.', dimension: 'meaning', reverse: false },
    { id: 'me_003', text: 'Bardziej niż pieniądze motywuje mnie poczucie, że robię coś sensownego.', dimension: 'meaning', reverse: false },
    { id: 'me_004', text: 'Chcę, by moje życie i praca miały pozytywny wpływ na świat.', dimension: 'meaning', reverse: false },
    { id: 'me_005', text: 'Praca bez głębszego sensu szybko powoduje u mnie wypalenie.', dimension: 'meaning', reverse: false },

    // Recognition (re_001 – re_005)
    { id: 're_001', text: 'Docenienie mojej pracy przez innych jest dla mnie ważną nagrodą.', dimension: 'recognition', reverse: false },
    { id: 're_002', text: 'Pochwały i pozytywna informacja zwrotna znacząco zwiększają moją motywację.', dimension: 'recognition', reverse: false },
    { id: 're_003', text: 'Zależy mi na tym, by moje sukcesy były zauważane przez otoczenie.', dimension: 'recognition', reverse: false },
    { id: 're_004', text: 'Publiczne wyróżnienie lub nagroda motywuje mnie bardziej niż prywatna satysfakcja.', dimension: 'recognition', reverse: false },
    { id: 're_005', text: 'Kiedy moje wysiłki są niezauważane, tracę energię do dalszego działania.', dimension: 'recognition', reverse: false },

    // Discovery & Curiosity (di_001 – di_005)
    { id: 'di_001', text: 'Silnie motywuje mnie możliwość odkrywania nowej wiedzy i obszarów.', dimension: 'discovery', reverse: false },
    { id: 'di_002', text: 'Ciekawość i chęć eksploracji są dla mnie ważniejsze niż komfort rutyny.', dimension: 'discovery', reverse: false },
    { id: 'di_003', text: 'Uczenie się czegoś nowego sprawia mi autentyczną przyjemność.', dimension: 'discovery', reverse: false },
    { id: 'di_004', text: 'Lubię eksperymentować i próbować nowych podejść, nawet gdy ryzyko porażki jest wysokie.', dimension: 'discovery', reverse: false },
    { id: 'di_005', text: 'Nieznane mnie fascynuje, a nie przeraża.', dimension: 'discovery', reverse: false },
  ],
};
