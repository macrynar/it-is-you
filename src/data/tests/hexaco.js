/**
 * HEXACO-60 Personality Test Data
 * Polish Translation - psychometryczne badanie osobowości
 * 
 * 6 dimensions: Honesty-Humility, Emotionality, eXtraversion, 
 * Agreeableness, Conscientiousness, Openness
 */

export const HEXACO_TEST = {
  test_id: "hexaco_60",
  test_name: "HEXACO-60 - Test Osobowości",
  test_type: "personality_traits",
  time_estimate_minutes: 15,
  question_count: 60,
  scale_type: "likert_5",
  scale_labels: {
    1: "Zdecydowanie się nie zgadzam",
    2: "Nie zgadzam się",
    3: "Neutralnie",
    4: "Zgadzam się",
    5: "Zdecydowanie się zgadzam"
  },
  dimensions: [
    {
      id: "honesty_humility",
      name: "Szczerość-Pokora",
      name_en: "Honesty-Humility",
      description: "Skłonność do uczciwości, skromności i unikania manipulacji"
    },
    {
      id: "emotionality",
      name: "Emocjonalność",
      name_en: "Emotionality",
      description: "Wrażliwość emocjonalna, lęk i potrzeba wsparcia"
    },
    {
      id: "extraversion",
      name: "Ekstrawersja",
      name_en: "eXtraversion",
      description: "Energia społeczna, pewność siebie i entuzjazm"
    },
    {
      id: "agreeableness",
      name: "Ugodowość",
      name_en: "Agreeableness",
      description: "Wyrozumiałość, cierpliwość i chęć współpracy"
    },
    {
      id: "conscientiousness",
      name: "Sumienność",
      name_en: "Conscientiousness",
      description: "Organizacja, dokładność i samodyscyplina"
    },
    {
      id: "openness",
      name: "Otwartość na doświadczenia",
      name_en: "Openness to Experience",
      description: "Ciekawość intelektualna i docenianie sztuki"
    }
  ],
  questions: [
    {
      id: "hex_001",
      text: "Kusiłoby mnie użycie fałszywych pieniędzy, gdybym był pewien, że się to uda",
      dimension: "honesty_humility",
      reverse: true
    },
    {
      id: "hex_002",
      text: "Nie użyłbym pochlebstw, aby dostać podwyżkę lub awans, nawet gdybym sądził, że to zadziała",
      dimension: "honesty_humility",
      reverse: false
    },
    {
      id: "hex_003",
      text: "Nigdy nie przyjąłbym łapówki, nawet gdyby była bardzo wysoka",
      dimension: "honesty_humility",
      reverse: false
    },
    {
      id: "hex_004",
      text: "Ogólnie jestem dość zadowolony z siebie",
      dimension: "emotionality",
      reverse: true
    },
    {
      id: "hex_005",
      text: "Czasami nie mogę przestać martwić się drobnymi sprawami",
      dimension: "emotionality",
      reverse: false
    },
    {
      id: "hex_006",
      text: "Rzadko wyrażam swoje opinie na spotkaniach grupowych",
      dimension: "extraversion",
      reverse: true
    },
    {
      id: "hex_007",
      text: "Czuję się pewnie, gdy przemawiam przed grupą",
      dimension: "extraversion",
      reverse: false
    },
    {
      id: "hex_008",
      text: "Wolę pracować samodzielnie niż w zespole",
      dimension: "extraversion",
      reverse: true
    },
    {
      id: "hex_009",
      text: "Mam tendencję do trzymania urazy wobec ludzi, którzy mnie skrzywdzili",
      dimension: "agreeableness",
      reverse: true
    },
    {
      id: "hex_010",
      text: "Szybko wybaczam innym ich błędy",
      dimension: "agreeableness",
      reverse: false
    },
    {
      id: "hex_011",
      text: "Planuję z wyprzedzeniem i organizuję sprawy, aby uniknąć śpiechu w ostatniej chwili",
      dimension: "conscientiousness",
      reverse: false
    },
    {
      id: "hex_012",
      text: "Często zostawiam swoje rzeczy porozrzucane po domu",
      dimension: "conscientiousness",
      reverse: true
    },
    {
      id: "hex_013",
      text: "Lubię oglądać dzieła sztuki w muzeach lub galeriach",
      dimension: "openness",
      reverse: false
    },
    {
      id: "hex_014",
      text: "Mam niewielkie zainteresowanie abstrakcyjnymi ideami lub dyskusjami filozoficznymi",
      dimension: "openness",
      reverse: true
    },
    {
      id: "hex_015",
      text: "Myślę, że zwracanie uwagi na radykalne idee to strata czasu",
      dimension: "openness",
      reverse: true
    },
    {
      id: "hex_016",
      text: "Jeśli chcę czegoś od kogoś, będę śmiał się z jego najgorszych żartów",
      dimension: "honesty_humility",
      reverse: true
    },
    {
      id: "hex_017",
      text: "Posiadanie dużo pieniędzy nie jest dla mnie szczególnie ważne",
      dimension: "honesty_humility",
      reverse: false
    },
    {
      id: "hex_018",
      text: "Należy mi się więcej szacunku niż przeciętnej osobie",
      dimension: "honesty_humility",
      reverse: true
    },
    {
      id: "hex_019",
      text: "Zachowuję spokój nawet w napięciu sytuacjach",
      dimension: "emotionality",
      reverse: true
    },
    {
      id: "hex_020",
      text: "Kiedy cierpię na poważną chorobę, wolę być pod opieką innych",
      dimension: "emotionality",
      reverse: false
    },
    {
      id: "hex_021",
      text: "Chce mi się płakać, gdy widzę płaczących ludzi",
      dimension: "emotionality",
      reverse: false
    },
    {
      id: "hex_022",
      text: "Bawiłoby mnie bycie celebrytą lub osobą publiczną",
      dimension: "extraversion",
      reverse: false
    },
    {
      id: "hex_023",
      text: "W sytuacjach towarzyskich to zazwyczaj ja podejmuję pierwszy krok",
      dimension: "extraversion",
      reverse: false
    },
    {
      id: "hex_024",
      text: "Wolę pracę wymagającą aktywnej interakcji społecznej od pracy w samotności",
      dimension: "extraversion",
      reverse: false
    },
    {
      id: "hex_025",
      text: "Często czuję się szczęśliwy i pełen energii",
      dimension: "extraversion",
      reverse: false
    },
    {
      id: "hex_026",
      text: "Rzadko czuję złość, nawet gdy ludzie traktują mnie źle",
      dimension: "agreeableness",
      reverse: false
    },
    {
      id: "hex_027",
      text: "Czasami kłócę się tylko dla samej kłótni",
      dimension: "agreeableness",
      reverse: true
    },
    {
      id: "hex_028",
      text: "Chętnie idę na kompromis w swoich opiniach, aby osiągnąć porozumienie",
      dimension: "agreeableness",
      reverse: false
    },
    {
      id: "hex_029",
      text: "Upewniam się, że wszystko jest na swoim miejscu przed wyjściem z domu",
      dimension: "conscientiousness",
      reverse: false
    },
    {
      id: "hex_030",
      text: "Pracuję, dopóki wszystko nie jest dokładnie takie, jakie być powinno, nawet jeśli zajmuje to więcej czasu",
      dimension: "conscientiousness",
      reverse: false
    },
    {
      id: "hex_031",
      text: "Zawsze staram się być dokładny w pracy, nawet jeśli mnie to spowalnia",
      dimension: "conscientiousness",
      reverse: false
    },
    {
      id: "hex_032",
      text: "Nie myślę o konsekwencjach przed działaniem",
      dimension: "conscientiousness",
      reverse: true
    },
    {
      id: "hex_033",
      text: "Sprawiałoby mi przyjemność stworzenie dzieła sztuki, takiego jak powieść, piosenka czy obraz",
      dimension: "openness",
      reverse: false
    },
    {
      id: "hex_034",
      text: "Interesuję się poznawaniem historii i polityki innych krajów",
      dimension: "openness",
      reverse: false
    },
    {
      id: "hex_035",
      text: "Nudziłaby mnie wizyta w galerii sztuki",
      dimension: "openness",
      reverse: true
    },
    {
      id: "hex_036",
      text: "Lubię ludzi, którzy mają niekonwencjonalne poglądy",
      dimension: "openness",
      reverse: false
    },
    {
      id: "hex_037",
      text: "Chcę, aby ludzie wiedzieli, że jestem ważną osobą o wysokim statusie",
      dimension: "honesty_humility",
      reverse: true
    },
    {
      id: "hex_038",
      text: "Nie udawałbym, że ktoś mi się podoba, tylko po to, żeby wyświadczał mi przysługi",
      dimension: "honesty_humility",
      reverse: false
    },
    {
      id: "hex_039",
      text: "Chciałbym mieszkać w bardzo drogiej, ekskluzywnej dzielnicy",
      dimension: "honesty_humility",
      reverse: true
    },
    {
      id: "hex_040",
      text: "Jeśli chodzi o fizyczne niebezpieczeństwo, jestem bardzo bojaźliwy",
      dimension: "emotionality",
      reverse: false
    },
    {
      id: "hex_041",
      text: "Martwię się znacznie mniej niż większość ludzi",
      dimension: "emotionality",
      reverse: true
    },
    {
      id: "hex_042",
      text: "Mogę poradzić sobie sam, bez wielkiej pomocy innych",
      dimension: "emotionality",
      reverse: true
    },
    {
      id: "hex_043",
      text: "Odczuwam silne emocje, gdy ktoś bliski wyjeżdża na długi czas",
      dimension: "emotionality",
      reverse: false
    },
    {
      id: "hex_044",
      text: "Uważam, że jestem osobą bardzo towarzyską i otwartą",
      dimension: "extraversion",
      reverse: false
    },
    {
      id: "hex_045",
      text: "Unikam nawiązywania pogawędek z ludźmi",
      dimension: "extraversion",
      reverse: true
    },
    {
      id: "hex_046",
      text: "Zazwyczaj jestem duszą towarzystwa",
      dimension: "extraversion",
      reverse: false
    },
    {
      id: "hex_047",
      text: "Trudno mi opanować temperament, gdy ludzie mnie obrażają",
      dimension: "agreeableness",
      reverse: true
    },
    {
      id: "hex_048",
      text: "Moje podejście do ludzi, którzy traktowali mnie źle to 'wybaczyć i zapomnieć'",
      dimension: "agreeableness",
      reverse: false
    },
    {
      id: "hex_049",
      text: "Mam tendencję do surowego osądzania innych ludzi",
      dimension: "agreeableness",
      reverse: true
    },
    {
      id: "hex_050",
      text: "Mam skłonność do elastyczności w swoich opiniach, gdy inni się ze mną nie zgadzają",
      dimension: "agreeableness",
      reverse: false
    },
    {
      id: "hex_051",
      text: "Ludzie często nazywają mnie perfekcjonistą",
      dimension: "conscientiousness",
      reverse: false
    },
    {
      id: "hex_052",
      text: "Często bardzo się staram, kiedy próbuję osiągnąć cel",
      dimension: "conscientiousness",
      reverse: false
    },
    {
      id: "hex_053",
      text: "Nie pozwalam, aby moje impulsy rządziły moim zachowaniem",
      dimension: "conscientiousness",
      reverse: false
    },
    {
      id: "hex_054",
      text: "Ludzie często mówili mi, że mam dobrą wyobraźnię",
      dimension: "openness",
      reverse: false
    },
    {
      id: "hex_055",
      text: "Interesuję się poznawaniem różnych kultur i ich tradycji",
      dimension: "openness",
      reverse: false
    },
    {
      id: "hex_056",
      text: "Bardzo by mnie nudziła książka o historii nauki i technologii",
      dimension: "openness",
      reverse: true
    },
    {
      id: "hex_057",
      text: "Sprawiłoby mi przyjemność spędzenie czasu w muzeum, oglądając niezwykłe lub egzotyczne eksponaty",
      dimension: "openness",
      reverse: false
    },
    {
      id: "hex_058",
      text: "Myślę o sobie jako o zwykłej osobie, która nie jest lepsza od innych",
      dimension: "honesty_humility",
      reverse: false
    },
    {
      id: "hex_059",
      text: "Sprawiałoby mi dużo przyjemności posiadanie drogich luksusowych dóbr",
      dimension: "honesty_humility",
      reverse: true
    },
    {
      id: "hex_060",
      text: "Uważam za nudne dyskutowanie o filozofii i idei dotyczących sensu życia",
      dimension: "openness",
      reverse: true
    }
  ]
};

// Helper to get questions by dimension
export function getQuestionsByDimension(dimensionId) {
  return HEXACO_TEST.questions.filter(q => q.dimension === dimensionId);
}

// Helper to get dimension info
export function getDimensionInfo(dimensionId) {
  return HEXACO_TEST.dimensions.find(d => d.id === dimensionId);
}
