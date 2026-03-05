/**
 * Defense Mechanisms Test
 * 36 questions, 4 dimensions, Likert 1-5 scale
 * Based on Vaillant's hierarchy of defense mechanisms
 */

export const DEFENSE_TEST = {
  test_id: 'defense_mechanisms_36',
  test_name: 'Mechanizmy Obronne',
  test_type: 'defense_mechanisms',
  time_estimate_minutes: 10,
  question_count: 36,
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
      id: 'mature',
      name: 'Dojrzałe',
      name_en: 'Mature Defenses',
      description: 'Konstruktywne sposoby radzenia sobie ze stresem: humor, altruizm, sublimacja.',
      icon: '🌱',
    },
    {
      id: 'neurotic',
      name: 'Neurotyczne',
      name_en: 'Neurotic Defenses',
      description: 'Racjonalizacja, wypieranie, reakcja upozorowana.',
      icon: '🌀',
    },
    {
      id: 'immature',
      name: 'Niedojrzałe',
      name_en: 'Immature Defenses',
      description: 'Projekcja, acting out, bierna agresja.',
      icon: '⚡',
    },
    {
      id: 'primitive',
      name: 'Prymitywne',
      name_en: 'Primitive Defenses',
      description: 'Rozszczepienie, zaprzeczenie, dysocjacja.',
      icon: '🔥',
    },
  ],
  questions: [
    // Mature (ma_001 – ma_009)
    { id: 'ma_001', text: 'Gdy jestem w trudnej sytuacji, potrafię znaleźć w niej coś komicznego.', dimension: 'mature', reverse: false },
    { id: 'ma_002', text: 'Kiedy przeżywam trudny czas, koncentruję się na pomaganiu innym.', dimension: 'mature', reverse: false },
    { id: 'ma_003', text: 'Energię z negatywnych emocji kieruję na twórcze lub sportowe działania.', dimension: 'mature', reverse: false },
    { id: 'ma_004', text: 'Trudne doświadczenia traktuję jako okazję do wzrostu i nauki.', dimension: 'mature', reverse: false },
    { id: 'ma_005', text: 'Potrafię wyrazić trudne uczucia w sposób, który nie krzywdzi innych.', dimension: 'mature', reverse: false },
    { id: 'ma_006', text: 'Kiedy coś mnie boli, celowo poszukuję głębszego sensu tego doświadczenia.', dimension: 'mature', reverse: false },
    { id: 'ma_007', text: 'Spokojnie akceptuję rzeczy, na które nie mam wpływu.', dimension: 'mature', reverse: false },
    { id: 'ma_008', text: 'Potrafię odroczyć zaspokojenie potrzeby lub emocji, gdy wymaga tego sytuacja.', dimension: 'mature', reverse: false },
    { id: 'ma_009', text: 'W obliczu stresu szukam konkretnych rozwiązań zamiast pogrążać się w emocjach.', dimension: 'mature', reverse: false },

    // Neurotic (ne_001 – ne_009)
    { id: 'ne_001', text: 'Zdarza mi się znajdować logiczne uzasadnienie dla decyzji, które były mocno emocjonalne.', dimension: 'neurotic', reverse: false },
    { id: 'ne_002', text: 'Czasem działam dokładnie odwrotnie niż to, co naprawdę czuję.', dimension: 'neurotic', reverse: false },
    { id: 'ne_003', text: 'Zdarza mi się, że przypominanie sobie pewnych wydarzeń jest dla mnie trudne lub niemożliwe.', dimension: 'neurotic', reverse: false },
    { id: 'ne_004', text: 'Tłumię nieprzyjemne uczucia, zamiast się z nimi zmierzyć.', dimension: 'neurotic', reverse: false },
    { id: 'ne_005', text: 'Zdarza mi się, że przepraszam lub rekompensuję coś w nadmiarze, bez wyraźnego powodu.', dimension: 'neurotic', reverse: false },
    { id: 'ne_006', text: 'Emocje, które mi towarzyszą, bywają intensywniejsze niż powód, który je wywołuje.', dimension: 'neurotic', reverse: false },
    { id: 'ne_007', text: 'Mam tendencję do przenoszenia uczuć z jednej osoby na inną.', dimension: 'neurotic', reverse: false },
    { id: 'ne_008', text: 'Zdarza mi się skupiać uwagę na drobnym aspekcie sytuacji, by unikać emocji z nią związanych.', dimension: 'neurotic', reverse: false },
    { id: 'ne_009', text: 'Potrafię być bardzo zajęty(-a), by nie myśleć o czymś nieprzyjemnym.', dimension: 'neurotic', reverse: false },

    // Immature (im_001 – im_009)
    { id: 'im_001', text: 'Kiedy nie radzę sobie z trudną sytuacją, obwiniam innych za swoje problemy.', dimension: 'immature', reverse: false },
    { id: 'im_002', text: 'W chwilach stresu zachowuję się jak w dzieciństwie — reaguję gwałtownie lub kapryśnie.', dimension: 'immature', reverse: false },
    { id: 'im_003', text: 'Gdy jestem zły(-a), wyrażam to w sposób, który potem uznaję za niekonstruktywny.', dimension: 'immature', reverse: false },
    { id: 'im_004', text: 'Zdarza mi się, że przypisuję swoim problemom cechy, których nie mają.', dimension: 'immature', reverse: false },
    { id: 'im_005', text: 'Kiedy jestem sfrustrowany(-a), mój gniew wyładowuje się na przypadkowych osobach.', dimension: 'immature', reverse: false },
    { id: 'im_006', text: 'Miewam tendencję do idealizowania osób, a potem odczuwam rozczarowanie.', dimension: 'immature', reverse: false },
    { id: 'im_007', text: 'Biernie utrudniam innym, zamiast otwarcie wyrażać swoje niezadowolenie.', dimension: 'immature', reverse: false },
    { id: 'im_008', text: 'W trudnych chwilach zaniedbuję obowiązki i chowam się w wygodnych nawykach.', dimension: 'immature', reverse: false },
    { id: 'im_009', text: 'Zdarza mi się fantazjować o niemożliwych rozwiązaniach zamiast działać.', dimension: 'immature', reverse: false },

    // Primitive (pr_001 – pr_009)
    { id: 'pr_001', text: 'Zdarza mi się całkowicie zaprzeczać problemom, jakby w ogóle nie istniały.', dimension: 'primitive', reverse: false },
    { id: 'pr_002', text: 'Mam tendencję do widzenia sytuacji albo jako całkowicie dobre, albo całkowicie złe.', dimension: 'primitive', reverse: false },
    { id: 'pr_003', text: 'Czasem obudzę się z poczuciem, że nie pamiętam, jak reagowałem(-am) podczas emocjonalnego zdarzenia.', dimension: 'primitive', reverse: false },
    { id: 'pr_004', text: 'Zdarza mi się wyłączyć emocje i stać się „nierealnym(-ą)" podczas kryzysu.', dimension: 'primitive', reverse: false },
    { id: 'pr_005', text: 'Potrafię jednego dnia uwielbiać kogoś, a następnego go nienawidzić bez wyraźnej przyczyny.', dimension: 'primitive', reverse: false },
    { id: 'pr_006', text: 'Miewam wrażenie, że to, co mnie spotyka, dzieje się jakby komuś innemu.', dimension: 'primitive', reverse: false },
    { id: 'pr_007', text: 'Kiedy sytuacja jest nie do zniesienia, mój umysł jak gdyby się „wyłącza".', dimension: 'primitive', reverse: false },
    { id: 'pr_008', text: 'Bardzo trudno mi dostrzec pozytywne i negatywne cechy tej samej osoby naraz.', dimension: 'primitive', reverse: false },
    { id: 'pr_009', text: 'Intensywne emocje potrafią mi zupełnie „ukraść" ciągłość przeżywania — odcinam się.', dimension: 'primitive', reverse: false },
  ],
};
