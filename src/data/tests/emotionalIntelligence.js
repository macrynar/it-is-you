/**
 * Emotional Intelligence Test (EQ)
 * 40 questions, 5 dimensions, Likert 1-5 scale
 * Based on Goleman's EQ framework
 */

export const EQ_TEST = {
  test_id: 'eq_goleman_40',
  test_name: 'Inteligencja Emocjonalna (EQ)',
  test_type: 'emotional_intelligence',
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
      id: 'self_awareness',
      name: 'Samoświadomość',
      name_en: 'Self-Awareness',
      description: 'Zdolność do rozpoznawania własnych emocji i ich wpływu na myślenie i zachowanie.',
      icon: '🪞',
    },
    {
      id: 'self_regulation',
      name: 'Samoregulacja',
      name_en: 'Self-Regulation',
      description: 'Zdolność do kontrolowania impulsów i zarządzania własnymi emocjami.',
      icon: '🎛️',
    },
    {
      id: 'empathy',
      name: 'Empatia',
      name_en: 'Empathy',
      description: 'Zdolność do rozumienia i odczuwania emocji innych ludzi.',
      icon: '💞',
    },
    {
      id: 'social_skills',
      name: 'Umiejętności Społeczne',
      name_en: 'Social Skills',
      description: 'Zdolność do zarządzania relacjami i wpływania na innych.',
      icon: '🤝',
    },
    {
      id: 'motivation',
      name: 'Motywacja Wewnętrzna',
      name_en: 'Intrinsic Motivation',
      description: 'Wewnętrzny napęd do osiągania celów niezależnie od zewnętrznych nagród.',
      icon: '🔥',
    },
  ],
  questions: [
    // Self-Awareness (sa_001 – sa_008)
    { id: 'sa_001', text: 'Łatwo rozpoznaję, jaką emocję właśnie czuję.', dimension: 'self_awareness', reverse: false },
    { id: 'sa_002', text: 'Wiem, jak moje nastroje wpływają na moje decyzje.', dimension: 'self_awareness', reverse: false },
    { id: 'sa_003', text: 'Rozumiem, dlaczego pewne sytuacje wywołują u mnie silne reakcje emocjonalne.', dimension: 'self_awareness', reverse: false },
    { id: 'sa_004', text: 'Potrafię nazwać emocje odczuwane w danym momencie z dużą precyzją.', dimension: 'self_awareness', reverse: false },
    { id: 'sa_005', text: 'Często myślę o tym, jak moje zachowanie jest postrzegane przez innych.', dimension: 'self_awareness', reverse: false },
    { id: 'sa_006', text: 'Mam świadomość swoich słabości i staram się nad nimi pracować.', dimension: 'self_awareness', reverse: false },
    { id: 'sa_007', text: 'Trudno mi opisać słowami to, co czuję w danej chwili.', dimension: 'self_awareness', reverse: true },
    { id: 'sa_008', text: 'Potrafię dostrzec, kiedy moje emocje zaczęły wpływać na moje myślenie.', dimension: 'self_awareness', reverse: false },

    // Self-Regulation (sr_001 – sr_008)
    { id: 'sr_001', text: 'Kiedy jestem zdenerwowany(-a), potrafię się szybko uspokoić.', dimension: 'self_regulation', reverse: false },
    { id: 'sr_002', text: 'Nawet w stresujących sytuacjach zachowuję spokój.', dimension: 'self_regulation', reverse: false },
    { id: 'sr_003', text: 'Rzadko mówię lub robię rzeczy, których potem żałuję pod wpływem emocji.', dimension: 'self_regulation', reverse: false },
    { id: 'sr_004', text: 'Potrafię odłożyć frustrację na bok i skupić się na zadaniu.', dimension: 'self_regulation', reverse: false },
    { id: 'sr_005', text: 'Kiedy ktoś mnie wyprowadza z równowagi, szybko tracę kontrolę nad słowami.', dimension: 'self_regulation', reverse: true },
    { id: 'sr_006', text: 'Potrafię elastycznie zmieniać plany, gdy sytuacja tego wymaga.', dimension: 'self_regulation', reverse: false },
    { id: 'sr_007', text: 'Stres rzadko uniemożliwia mi efektywne działanie.', dimension: 'self_regulation', reverse: false },
    { id: 'sr_008', text: 'Nawet gdy jesteś bardzo zmęczony(-a), panuje nad swoimi reakcjami emocjonalnymi.', dimension: 'self_regulation', reverse: false },

    // Empathy (em_001 – em_008)
    { id: 'em_001', text: 'Łatwo wyczuwam, gdy ktoś jest smutny lub przygnębiony, nawet gdy nic nie mówi.', dimension: 'empathy', reverse: false },
    { id: 'em_002', text: 'Staram się zrozumieć punkt widzenia osoby, zanim ją ocenię.', dimension: 'empathy', reverse: false },
    { id: 'em_003', text: 'Odczuwam emocje innych osób jak gdyby były moimi własnymi.', dimension: 'empathy', reverse: false },
    { id: 'em_004', text: 'Potrafię wyczuć napięcia w grupie, zanim stają się one otwarte.', dimension: 'empathy', reverse: false },
    { id: 'em_005', text: 'Trudno mi zrozumieć, dlaczego inni reagują emocjonalnie na pewne sytuacje.', dimension: 'empathy', reverse: true },
    { id: 'em_006', text: 'Naturalnie dostosuję swój styl komunikacji do potrzeb rozmówcy.', dimension: 'empathy', reverse: false },
    { id: 'em_007', text: 'Kiedy ktoś jest w trudnej sytuacji, instynktownie chcę mu pomóc.', dimension: 'empathy', reverse: false },
    { id: 'em_008', text: 'Często wyczuwam, co ktoś czuje, zanim mi o tym powie.', dimension: 'empathy', reverse: false },

    // Social Skills (ss_001 – ss_008)
    { id: 'ss_001', text: 'Łatwo buduję relacje z nowymi ludźmi.', dimension: 'social_skills', reverse: false },
    { id: 'ss_002', text: 'Potrafię rozwiązywać konflikty w sposób, który zadowala obie strony.', dimension: 'social_skills', reverse: false },
    { id: 'ss_003', text: 'Potrafię zmotywować innych do działania.', dimension: 'social_skills', reverse: false },
    { id: 'ss_004', text: 'Chętnie współpracuję z innymi, by osiągać wspólne cele.', dimension: 'social_skills', reverse: false },
    { id: 'ss_005', text: 'Trudno mi inicjować rozmowy z osobami, których dobrze nie znam.', dimension: 'social_skills', reverse: true },
    { id: 'ss_006', text: 'Potrafię wpływać na opinie i postawy innych bez uciekania się do manipulacji.', dimension: 'social_skills', reverse: false },
    { id: 'ss_007', text: 'Utrzymuję pozytywne relacje nawet z osobami, które mnie drażnią.', dimension: 'social_skills', reverse: false },
    { id: 'ss_008', text: 'W zespole naturalnie przyjmuję rolę osoby, która scala i motywuje grupę.', dimension: 'social_skills', reverse: false },

    // Intrinsic Motivation (mo_001 – mo_008)
    { id: 'mo_001', text: 'Działam wytrwale nawet wtedy, gdy nie ma natychmiastowej nagrody.', dimension: 'motivation', reverse: false },
    { id: 'mo_002', text: 'Mam jasną wizję tego, co chcę osiągnąć w życiu.', dimension: 'motivation', reverse: false },
    { id: 'mo_003', text: 'Porażki mnie nie zniechęcają — uczą mnie i mobilizują do dalszego działania.', dimension: 'motivation', reverse: false },
    { id: 'mo_004', text: 'Sam proces uczenia się i doskonalenia sprawia mi radość, niezależnie od wyników.', dimension: 'motivation', reverse: false },
    { id: 'mo_005', text: 'Kiedy spotykam przeszkody, szybko się poddaję.', dimension: 'motivation', reverse: true },
    { id: 'mo_006', text: 'Działam z entuzjazmem nawet wtedy, gdy nikt mnie nie obserwuje.', dimension: 'motivation', reverse: false },
    { id: 'mo_007', text: 'Czerpię energię z samej pracy nad celami, nie tylko z ich osiągania.', dimension: 'motivation', reverse: false },
    { id: 'mo_008', text: 'Optymizm pomaga mi przetrwać trudne okresy i nie tracić kierunku.', dimension: 'motivation', reverse: false },
  ],
};
