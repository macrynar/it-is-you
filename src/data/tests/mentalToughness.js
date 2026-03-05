/**
 * Mental Toughness Test (4C Model)
 * 40 questions, 4 dimensions, Likert 1-5 scale
 * Based on Clough & Earle's 4C Mental Toughness Framework
 */

export const MENTAL_TOUGHNESS_TEST = {
  test_id: 'mental_toughness_4c',
  test_name: 'Odporność Psychiczna (4C)',
  test_type: 'mental_toughness',
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
      id: 'control',
      name: 'Kontrola',
      name_en: 'Control',
      description: 'Poczucie wpływu na własne życie i emocje; zdolność zarządzania sobą.',
      icon: '🎯',
    },
    {
      id: 'commitment',
      name: 'Zaangażowanie',
      name_en: 'Commitment',
      description: 'Wytrwałość w dążeniu do celów i zdolność do dotrzymywania obietnic.',
      icon: '💪',
    },
    {
      id: 'challenge',
      name: 'Wyzwanie',
      name_en: 'Challenge',
      description: 'Postrzeganie trudności jako okazji do wzrostu, a nie zagrożeń.',
      icon: '⛰️',
    },
    {
      id: 'confidence',
      name: 'Pewność Siebie',
      name_en: 'Confidence',
      description: 'Wiara w swoje możliwości i zdolność do radzenia sobie z krytyką.',
      icon: '🦁',
    },
  ],
  questions: [
    // Control (co_001 – co_010)
    { id: 'co_001', text: 'Czuję, że mam kontrolę nad tym, co dzieje się w moim życiu.', dimension: 'control', reverse: false },
    { id: 'co_002', text: 'Kiedy coś idzie nie tak, potrafię zachować spokój i działać celowo.', dimension: 'control', reverse: false },
    { id: 'co_003', text: 'Czuję się bezsilny(-a), gdy sprawy wymykają mi się z rąk.', dimension: 'control', reverse: true },
    { id: 'co_004', text: 'Potrafię regulować swoje emocje nawet w bardzo trudnych sytuacjach.', dimension: 'control', reverse: false },
    { id: 'co_005', text: 'Moje wyniki zależą głównie od mojego wysiłku, a nie od szczęścia.', dimension: 'control', reverse: false },
    { id: 'co_006', text: 'Stresuję się, gdy nie mogę kontrolować wyników swojego działania.', dimension: 'control', reverse: true },
    { id: 'co_007', text: 'Potrafię skupić się na tym, co jest w moich rękach, zamiast martwić się resztą.', dimension: 'control', reverse: false },
    { id: 'co_008', text: 'Wierzę, że moje decyzje mają realny wpływ na kształt mojego życia.', dimension: 'control', reverse: false },
    { id: 'co_009', text: 'Kiedy przeżywam trudny czas, potrafię to ocenić ze spokojem.', dimension: 'control', reverse: false },
    { id: 'co_010', text: 'Jestem świadomy(-a) swoich emocji i zarządzam nimi świadomie.', dimension: 'control', reverse: false },

    // Commitment (cm_001 – cm_010)
    { id: 'cm_001', text: 'Trzymam się swoich celów nawet wtedy, gdy wygodniej byłoby się poddać.', dimension: 'commitment', reverse: false },
    { id: 'cm_002', text: 'Dotrzymuję obietnic samemu sobie, nawet gdy nikt nie patrzy.', dimension: 'commitment', reverse: false },
    { id: 'cm_003', text: 'Łatwo mi porzucać projekty, które stają się trudne.', dimension: 'commitment', reverse: true },
    { id: 'cm_004', text: 'Potrafię codziennie wykonywać nawet nudne zadania, jeśli prowadzą do ważnego celu.', dimension: 'commitment', reverse: false },
    { id: 'cm_005', text: 'Mam jasno określone cele i działam zgodnie z nimi.', dimension: 'commitment', reverse: false },
    { id: 'cm_006', text: 'Nie wyobrażam sobie rezygnacji w połowie drogi, nawet gdy jest ciężko.', dimension: 'commitment', reverse: false },
    { id: 'cm_007', text: 'Trudno mi podtrzymać motywację przez dłuższy czas.', dimension: 'commitment', reverse: true },
    { id: 'cm_008', text: 'Jestem osobą, która kończy to, co zaczyna.', dimension: 'commitment', reverse: false },
    { id: 'cm_009', text: 'Podejmuję się odpowiedzialnych zadań i nie zrzucam ich na innych.', dimension: 'commitment', reverse: false },
    { id: 'cm_010', text: 'Mój wysiłek jest spójny w czasie — nie tylko gdy jestem pełen(-a) energii.', dimension: 'commitment', reverse: false },

    // Challenge (ch_001 – ch_010)
    { id: 'ch_001', text: 'Trudności traktuję jako okazje do wzrostu, a nie jako zagrożenia.', dimension: 'challenge', reverse: false },
    { id: 'ch_002', text: 'Lubię wychodzić poza strefę komfortu, bo to mnie rozwija.', dimension: 'challenge', reverse: false },
    { id: 'ch_003', text: 'Niepewność w nowych sytuacjach mnie blokuje i obezwładnia.', dimension: 'challenge', reverse: true },
    { id: 'ch_004', text: 'Porażki traktuję jako cenne lekcje, nie jako dowód na swoją słabość.', dimension: 'challenge', reverse: false },
    { id: 'ch_005', text: 'Chętnie podejmuję ryzyko, jeśli potencjalna nagroda jest warta wysiłku.', dimension: 'challenge', reverse: false },
    { id: 'ch_006', text: 'Lubię środowiska, w których trzeba ciągle się adaptować i uczyć.', dimension: 'challenge', reverse: false },
    { id: 'ch_007', text: 'Zmiany wywołują u mnie głównie lęk, a nie ciekawość.', dimension: 'challenge', reverse: true },
    { id: 'ch_008', text: 'Kiedy napotykam przeszkodę, szukam nowego podejścia zamiast rezygnować.', dimension: 'challenge', reverse: false },
    { id: 'ch_009', text: 'Trudne zadania mobilizują mnie bardziej niż łatwe.', dimension: 'challenge', reverse: false },
    { id: 'ch_010', text: 'Postrzegam konkurencję jako coś, co mnie motywuje, a nie zagraża.', dimension: 'challenge', reverse: false },

    // Confidence (cf_001 – cf_010)
    { id: 'cf_001', text: 'Wierzę we własne możliwości, nawet gdy inni mnie krytykują.', dimension: 'confidence', reverse: false },
    { id: 'cf_002', text: 'Nie potrzebuję ciągłego potwierdzenia, że idę w dobrym kierunku.', dimension: 'confidence', reverse: false },
    { id: 'cf_003', text: 'Krytyka ze strony innych łatwo podważa moją pewność siebie.', dimension: 'confidence', reverse: true },
    { id: 'cf_004', text: 'W trudnych sytuacjach wierzę, że sobie poradzę.', dimension: 'confidence', reverse: false },
    { id: 'cf_005', text: 'Kiedy inni wątpią w moje możliwości, jeszcze bardziej się mobilizuję.', dimension: 'confidence', reverse: false },
    { id: 'cf_006', text: 'Mam silne poczucie własnej wartości, które nie zależy od opinii innych.', dimension: 'confidence', reverse: false },
    { id: 'cf_007', text: 'W nowych sytuacjach czuję się niepewnie i wątpię w swoje kompetencje.', dimension: 'confidence', reverse: true },
    { id: 'cf_008', text: 'Mogę poradzić sobie ze stresem i trudnymi sytuacjami tak dobrze jak większość ludzi.', dimension: 'confidence', reverse: false },
    { id: 'cf_009', text: 'Dobrze radzę sobie z odrzuceniem i niepowodzeniem.', dimension: 'confidence', reverse: false },
    { id: 'cf_010', text: 'Wnoszę wartość do grupowych projektów i właściwie to rozumiem.', dimension: 'confidence', reverse: false },
  ],
};
