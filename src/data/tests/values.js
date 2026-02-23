/**
 * Personal Values Assessment (Schwartz PVQ)
 * Polish Translation - Test Wartości Osobistych
 * 
 * 40 questions measuring 10 universal human values
 * Uses MRAT (Mean-Centered) scoring method
 */

export const VALUES_TEST = {
  test_id: "values_schwartz",
  test_name: "Test Wartości Osobistych",
  test_name_en: "Personal Values Assessment",
  test_type: "values",
  time_estimate_minutes: 10,
  question_count: 40,
  scale_type: "likert_6",
  scale_labels: {
    1: "Zupełnie nie jak ja",
    2: "Nie jak ja",
    3: "Trochę jak ja",
    4: "Umiarkowanie jak ja",
    5: "Jak ja",
    6: "Bardzo jak ja"
  },
  
  // Schwartz's 10 Universal Values with colors
  values: [
    {
      id: "self_direction",
      name: "Samokierowanie",
      name_en: "Self-Direction",
      description: "Niezależne myślenie i działanie - wybieranie, tworzenie, odkrywanie",
      color: "#3b82f6", // blue-500
      motivational_goal: "Niezależność myśli i działania"
    },
    {
      id: "stimulation",
      name: "Stymulacja",
      name_en: "Stimulation",
      description: "Podekscytowanie, nowość i wyzwania w życiu",
      color: "#ec4899", // pink-500
      motivational_goal: "Emocje, wyzwania, różnorodność"
    },
    {
      id: "hedonism",
      name: "Hedonizm",
      name_en: "Hedonism",
      description: "Przyjemność i zmysłowa gratyfikacja dla siebie",
      color: "#f97316", // orange-500
      motivational_goal: "Przyjemność i zmysłowe zadowolenie"
    },
    {
      id: "achievement",
      name: "Osiągnięcia",
      name_en: "Achievement",
      description: "Osobisty sukces poprzez wykazanie się kompetencjami",
      color: "#eab308", // yellow-500
      motivational_goal: "Sukces osobisty i uznanie społeczne"
    },
    {
      id: "power",
      name: "Władza",
      name_en: "Power",
      description: "Status społeczny, prestiż, kontrola nad ludźmi i zasobami",
      color: "#8b5cf6", // violet-500
      motivational_goal: "Prestiż społeczny i kontrola"
    },
    {
      id: "security",
      name: "Bezpieczeństwo",
      name_en: "Security",
      description: "Bezpieczeństwo, harmonia i stabilność społeczeństwa, relacji i siebie",
      color: "#06b6d4", // cyan-500
      motivational_goal: "Bezpieczeństwo i stabilność"
    },
    {
      id: "conformity",
      name: "Konformizm",
      name_en: "Conformity",
      description: "Ograniczanie działań, które mogą zranić innych lub naruszać normy",
      color: "#64748b", // slate-500
      motivational_goal: "Zgodność z oczekiwaniami społecznymi"
    },
    {
      id: "tradition",
      name: "Tradycja",
      name_en: "Tradition",
      description: "Respekt, zaangażowanie i akceptacja dla tradycji i kultury",
      color: "#78716c", // stone-500
      motivational_goal: "Szacunek dla tradycji i zwyczajów"
    },
    {
      id: "benevolence",
      name: "Życzliwość",
      name_en: "Benevolence",
      description: "Troska o dobro bliskich osób w codziennych kontaktach",
      color: "#10b981", // emerald-500
      motivational_goal: "Troska o bliskich"
    },
    {
      id: "universalism",
      name: "Uniwersalizm",
      name_en: "Universalism",
      description: "Zrozumienie, tolerancja i ochrona dobra wszystkich ludzi i natury",
      color: "#14b8a6", // teal-500
      motivational_goal: "Dobro wszystkich i natury"
    }
  ],

  questions: [
    // Self-Direction (4 questions)
    {
      id: "val_001",
      text: "Jest dla mnie ważne wymyślanie nowych pomysłów i bycie kreatywnym",
      text_en: "Thinking up new ideas and being creative is important to them",
      value: "self_direction"
    },
    {
      id: "val_011",
      text: "Jest dla mnie ważne podejmowanie własnych decyzji",
      text_en: "It is important to them to make their own decisions",
      value: "self_direction"
    },
    {
      id: "val_022",
      text: "Uważam, że ważne jest interesowanie się różnymi rzeczami",
      text_en: "They think it is important to be interested in things",
      value: "self_direction"
    },
    {
      id: "val_035",
      text: "Jest dla mnie ważne bycie niezależnym",
      text_en: "It is important to them to be independent",
      value: "self_direction"
    },

    // Stimulation (3 questions)
    {
      id: "val_006",
      text: "Lubię niespodzianki i zawsze szukam nowych rzeczy do robienia",
      text_en: "They like surprises and are always looking for new things to do",
      value: "stimulation"
    },
    {
      id: "val_015",
      text: "Szukam przygód i lubię ryzykować",
      text_en: "They look for adventures and like to take risks",
      value: "stimulation"
    },
    {
      id: "val_030",
      text: "Lubię podejmować ryzyko i szukać przygód",
      text_en: "They like to take risks and are looking for adventures",
      value: "stimulation"
    },

    // Hedonism (3 questions)
    {
      id: "val_010",
      text: "Wykorzystuję każdą okazję do zabawy",
      text_en: "They seek every chance to have fun",
      value: "hedonism"
    },
    {
      id: "val_026",
      text: "Czerpanie przyjemności z życia jest dla mnie ważne",
      text_en: "Enjoying life's pleasures is important to them",
      value: "hedonism"
    },
    {
      id: "val_034",
      text: "Dobrze się bawić jest dla mnie ważne",
      text_en: "Having a good time is important to them",
      value: "hedonism"
    },

    // Achievement (3 questions)
    {
      id: "val_004",
      text: "Jest dla mnie bardzo ważne pokazywanie swoich umiejętności",
      text_en: "It's very important to them to show their abilities",
      value: "achievement"
    },
    {
      id: "val_013",
      text: "Bycie człowiekiem sukcesu jest dla mnie ważne",
      text_en: "Being very successful is important to them",
      value: "achievement"
    },
    {
      id: "val_024",
      text: "Uważam, że ważne jest bycie ambitnym",
      text_en: "They think it is important to be ambitious",
      value: "achievement"
    },

    // Power (4 questions)
    {
      id: "val_002",
      text: "Jest dla mnie ważne bycie bogatym",
      text_en: "It is important to them to be rich",
      value: "power"
    },
    {
      id: "val_017",
      text: "Jest dla mnie ważne otrzymywanie szacunku od innych",
      text_en: "It is important to them to get respect from others",
      value: "power"
    },
    {
      id: "val_031",
      text: "Jest dla mnie ważne być głównym decydentem",
      text_en: "It is important to them to be in charge",
      value: "power"
    },
    {
      id: "val_039",
      text: "Jest dla mnie ważne mieć zawsze wystarczająco dużo pieniędzy",
      text_en: "It is important to them to always have enough money",
      value: "power"
    },

    // Security (4 questions)
    {
      id: "val_005",
      text: "Jest dla mnie ważne życie w bezpiecznym otoczeniu",
      text_en: "It is important to them to live in secure surroundings",
      value: "security"
    },
    {
      id: "val_014",
      text: "Jest dla mnie ważne, aby rząd zapewniał moje bezpieczeństwo",
      text_en: "It is important that the government ensures their safety",
      value: "security"
    },
    {
      id: "val_021",
      text: "Jest dla mnie ważne, aby rzeczy były zorganizowane i czyste",
      text_en: "It is important that things be organized and clean",
      value: "security"
    },
    {
      id: "val_036",
      text: "Stabilne społeczeństwo jest dla mnie ważne",
      text_en: "A stable society is important to them",
      value: "security"
    },

    // Conformity (4 questions)
    {
      id: "val_007",
      text: "Uważam, że ludzie powinni robić to, co im się każe",
      text_en: "They believe people should do what they're told",
      value: "conformity"
    },
    {
      id: "val_016",
      text: "Jest dla mnie ważne zawsze zachowywać się właściwie",
      text_en: "It is important to them always to behave properly",
      value: "conformity"
    },
    {
      id: "val_028",
      text: "Uważam, że powinno się zawsze okazywać szacunek rodzicom",
      text_en: "They believe they should always show respect to parents",
      value: "conformity"
    },
    {
      id: "val_038",
      text: "Jest dla mnie ważne nie denerwować innych ludzi",
      text_en: "It is important not to upset other people",
      value: "conformity"
    },

    // Tradition (4 questions)
    {
      id: "val_009",
      text: "Uważam, że ludzie powinni być zadowoleni z tego, co mają",
      text_en: "They believe people should be satisfied with what they have",
      value: "tradition"
    },
    {
      id: "val_020",
      text: "Wiara religijna jest dla mnie ważna",
      text_en: "Religious belief is important to them",
      value: "tradition"
    },
    {
      id: "val_025",
      text: "Uważam, że najlepiej robić rzeczy w tradycyjny sposób",
      text_en: "They think it is best to do things in traditional ways",
      value: "tradition"
    },
    {
      id: "val_033",
      text: "Jest dla mnie ważne przestrzeganie zwyczajów rodzinnych",
      text_en: "It is important to them to follow family customs",
      value: "tradition"
    },

    // Benevolence (5 questions)
    {
      id: "val_012",
      text: "Jest dla mnie bardzo ważne pomaganie ludziom wokół mnie",
      text_en: "It's very important to them to help people around them",
      value: "benevolence"
    },
    {
      id: "val_018",
      text: "Jest dla mnie ważne być lojalnym wobec przyjaciół",
      text_en: "It is important to them to be loyal to their friends",
      value: "benevolence"
    },
    {
      id: "val_027",
      text: "Jest dla mnie ważne reagowanie na potrzeby innych",
      text_en: "It is important to them to respond to the needs of others",
      value: "benevolence"
    },
    {
      id: "val_032",
      text: "Jest dla mnie ważne móc polegać na ludziach",
      text_en: "It is important to them to be able to rely on people",
      value: "benevolence"
    },
    {
      id: "val_040",
      text: "Jest dla mnie ważne pomagać innym, nawet jeśli mnie to kosztuje",
      text_en: "It is important to them to help others even if it costs them",
      value: "benevolence"
    },

    // Universalism (5 questions)
    {
      id: "val_003",
      text: "Uważam, że wszyscy ludzie na świecie powinni być traktowani równo",
      text_en: "They think everyone in the world should be treated equally",
      value: "universalism"
    },
    {
      id: "val_008",
      text: "Jest dla mnie ważne słuchanie ludzi, którzy są inni",
      text_en: "It is important to them to listen to people who are different",
      value: "universalism"
    },
    {
      id: "val_019",
      text: "Mocno wierzę, że ludzie powinni dbać o naturę",
      text_en: "They strongly believe people should care for nature",
      value: "universalism"
    },
    {
      id: "val_023",
      text: "Uważam, że wszyscy ludzie na świecie powinni żyć w harmonii",
      text_en: "They believe all the world's people should live in harmony",
      value: "universalism"
    },
    {
      id: "val_029",
      text: "Chcę, aby każdy był traktowany sprawiedliwie",
      text_en: "They want everyone to be treated justly",
      value: "universalism"
    },

    // Additional question for Achievement
    {
      id: "val_037",
      text: "Jest dla mnie ważne dostawanie tego, czego chcę",
      text_en: "It is important to them to get what they want",
      value: "achievement"
    }
  ]
};
