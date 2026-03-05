/**
 * Meaning & Spirituality Test
 * 32 questions, 4 dimensions, Likert 1-6 scale
 * Based on Meaning in Life Questionnaire & Existential Fulfillment frameworks
 */

export const MEANING_TEST = {
  test_id: 'meaning_spirituality_32',
  test_name: 'Sens i Duchowość',
  test_type: 'meaning_spirituality',
  time_estimate_minutes: 10,
  question_count: 32,
  scale_type: 'likert_6',
  scale_labels: {
    1: 'Zdecydowanie się nie zgadzam',
    2: 'Raczej się nie zgadzam',
    3: 'Trochę się nie zgadzam',
    4: 'Trochę się zgadzam',
    5: 'Raczej się zgadzam',
    6: 'Zdecydowanie się zgadzam',
  },
  dimensions: [
    {
      id: 'purpose',
      name: 'Cel i Misja',
      name_en: 'Purpose & Mission',
      description: 'Poczucie posiadania ważnego celu i kierunku w życiu.',
      icon: '🧭',
    },
    {
      id: 'transcendence',
      name: 'Transcendencja',
      name_en: 'Transcendence',
      description: 'Doświadczenia przekraczające codzienność; poczucie łączności z czymś większym.',
      icon: '✨',
    },
    {
      id: 'existential',
      name: 'Egzystencjalny Spokój',
      name_en: 'Existential Peace',
      description: 'Akceptacja skończoności życia; spokój wobec egzystencjalnych pytań.',
      icon: '⚖️',
    },
    {
      id: 'connection',
      name: 'Głęboka Łączność',
      name_en: 'Deep Connection',
      description: 'Poczucie głębokiej przynależności do innych, natury lub wszechświata.',
      icon: '🕸️',
    },
  ],
  questions: [
    // Purpose (pu_001 – pu_008)
    { id: 'pu_001', text: 'Wiem, jaki jest mój cel w życiu.', dimension: 'purpose', reverse: false },
    { id: 'pu_002', text: 'Moje życie ma wyraźny kierunek i sens.', dimension: 'purpose', reverse: false },
    { id: 'pu_003', text: 'Czuję, że to, co robię każdego dnia, ma znaczenie.', dimension: 'purpose', reverse: false },
    { id: 'pu_004', text: 'Mam poczucie misji — jest coś ważnego, co muszę osiągnąć lub przekazać.', dimension: 'purpose', reverse: false },
    { id: 'pu_005', text: 'Czuję się zagubiony(-a) i nie wiem, po co żyję.', dimension: 'purpose', reverse: true },
    { id: 'pu_006', text: 'Moje działania są spójne z głębokimi wartościami, które cenię.', dimension: 'purpose', reverse: false },
    { id: 'pu_007', text: 'Wiem, co jest dla mnie naprawdę ważne i żyję zgodnie z tym.', dimension: 'purpose', reverse: false },
    { id: 'pu_008', text: 'Czuję, że moje życie zmierza ku czemuś wartościowemu.', dimension: 'purpose', reverse: false },

    // Transcendence (tr_001 – tr_008)
    { id: 'tr_001', text: 'Czasami doświadczam chwil, w których czuję się częścią czegoś większego niż ja sam(-a).', dimension: 'transcendence', reverse: false },
    { id: 'tr_002', text: 'Mam poczucie, że moje życie wpisuje się w jakiś większy porządek lub plan.', dimension: 'transcendence', reverse: false },
    { id: 'tr_003', text: 'Przeżywam chwile głębokiej czci lub uniesienia wobec piękna świata.', dimension: 'transcendence', reverse: false },
    { id: 'tr_004', text: 'Praktyki duchowe lub refleksja egzystencjalna są ważną częścią mojego życia.', dimension: 'transcendence', reverse: false },
    { id: 'tr_005', text: 'Czuję się odłączony(-a) od czegokolwiek wyższego czy transcendentnego.', dimension: 'transcendence', reverse: true },
    { id: 'tr_006', text: 'Mam momenty, kiedy tracę poczucie czasu i granic swojego „ja".', dimension: 'transcendence', reverse: false },
    { id: 'tr_007', text: 'Doświadczam czegoś, co mogę nazwać sacrum lub świętością — w naturze, muzyce, chwilach ciszy.', dimension: 'transcendence', reverse: false },
    { id: 'tr_008', text: 'Wierzę, że istnieje coś, co wykracza poza materialne istnienie.', dimension: 'transcendence', reverse: false },

    // Existential Peace (ex_001 – ex_008)
    { id: 'ex_001', text: 'Świadomość śmierci nie napawa mnie lękiem — traktuję ją jako naturalną część życia.', dimension: 'existential', reverse: false },
    { id: 'ex_002', text: 'Mogę spokojnie myśleć o tym, że pewnego dnia przestanę istnieć.', dimension: 'existential', reverse: false },
    { id: 'ex_003', text: 'Pytania o sens istnienia są dla mnie źródłem ciekawości, nie niepokoju.', dimension: 'existential', reverse: false },
    { id: 'ex_004', text: 'Zaakceptowałem(-am) fakt, że wiele pytań o życie może pozostać bez odpowiedzi.', dimension: 'existential', reverse: false },
    { id: 'ex_005', text: 'Myśl o nieistnieniu po śmierci wywołuje u mnie silny lęk.', dimension: 'existential', reverse: true },
    { id: 'ex_006', text: 'Czuję wewnętrzny spokój wobec niepewności i tajemnic życia.', dimension: 'existential', reverse: false },
    { id: 'ex_007', text: 'Potrafię cieszyć się chwilą, nie martwiac się o kres.', dimension: 'existential', reverse: false },
    { id: 'ex_008', text: 'Życie i śmierć postrzegam jako dwie strony tej samej całości.', dimension: 'existential', reverse: false },

    // Deep Connection (dc_001 – dc_008)
    { id: 'dc_001', text: 'Czuję głęboką łączność z innymi ludźmi — nawet z obcymi.', dimension: 'connection', reverse: false },
    { id: 'dc_002', text: 'Przyroda wywołuje u mnie poczucie jedności i przynależności.', dimension: 'connection', reverse: false },
    { id: 'dc_003', text: 'Czuję się częścią czegoś, co przekracza moją indywidualną egzystencję.', dimension: 'connection', reverse: false },
    { id: 'dc_004', text: 'Cierpienie innych dotyka mnie głęboko — czuję się z nimi połączony(-a).', dimension: 'connection', reverse: false },
    { id: 'dc_005', text: 'Czuję się samotny(-a) nawet wśród ludzi — trudno mi nawiązać głębokie połączenie.', dimension: 'connection', reverse: true },
    { id: 'dc_006', text: 'W chwilach ciszy lub medytacji czuję głęboki spokój i łączność.', dimension: 'connection', reverse: false },
    { id: 'dc_007', text: 'Wierzę, że jestem częścią większej całości — ludzkości, natury lub kosmosu.', dimension: 'connection', reverse: false },
    { id: 'dc_008', text: 'Doświadczenie wspólnoty — rodziny, przyjaciół lub grupy — daje mi głęboki sens.', dimension: 'connection', reverse: false },
  ],
};
