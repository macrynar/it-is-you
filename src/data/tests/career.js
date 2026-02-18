/**
 * Career Interests Assessment (RIASEC) - Holland Code
 * Polish Translation - Test Zainteresowań Zawodowych
 * 
 * 48 questions measuring 6 vocational interests based on Holland's RIASEC model
 * Generates Holland Code from top 3 interest types
 */

export const CAREER_TEST = {
  test_id: "career_interests_riasec",
  test_name: "Test Zainteresowań Zawodowych",
  test_name_en: "Career Interests Profile (RIASEC)",
  test_type: "career_interests",
  time_estimate_minutes: 12,
  question_count: 48,
  scale_type: "likert_5",
  scale_labels: {
    1: "Zdecydowanie nie lubię",
    2: "Nie lubię",
    3: "Neutralnie",
    4: "Lubię",
    5: "Bardzo lubię"
  },
  
  // Holland RIASEC Types with colors for radar chart
  interest_types: [
    {
      id: "realistic",
      name: "Wykonawca (Realista)",
      name_en: "Realistic (Doers)",
      letter: "R",
      description: "Prefer hands-on work with tools, machines, and objects",
      color: "#ef4444", // Red
      fullMark: 5
    },
    {
      id: "investigative",
      name: "Badacz (Analityk)",
      name_en: "Investigative (Thinkers)",
      letter: "I",
      description: "Enjoy solving complex problems and conducting research",
      color: "#0ea5e9", // Sky
      fullMark: 5
    },
    {
      id: "artistic",
      name: "Artysta (Twórca)",
      name_en: "Artistic (Creators)",
      letter: "A",
      description: "Value creativity, self-expression, and aesthetic activities",
      color: "#d946ef", // Fuchsia
      fullMark: 5
    },
    {
      id: "social",
      name: "Społecznik (Pomagacz)",
      name_en: "Social (Helpers)",
      letter: "S",
      description: "Enjoy helping, teaching, and serving others",
      color: "#10b981", // Emerald
      fullMark: 5
    },
    {
      id: "enterprising",
      name: "Przedsiębiorca (Lider)",
      name_en: "Enterprising (Persuaders)",
      letter: "E",
      description: "Like leading, persuading, and influencing others",
      color: "#f59e0b", // Amber
      fullMark: 5
    },
    {
      id: "conventional",
      name: "Organizator (Systematyk)",
      name_en: "Conventional (Organizers)",
      letter: "C",
      description: "Prefer structured, orderly work with clear procedures",
      color: "#64748b", // Slate
      fullMark: 5
    }
  ],

  questions: [
    // Realistic (R) - 8 questions
    {
      id: "car_001",
      text: "Budowanie mebli kuchennych / prace stolarskie",
      text_en: "Build kitchen cabinets",
      interest: "realistic"
    },
    {
      id: "car_007",
      text: "Naprawa sprzętów AGD",
      text_en: "Repair household appliances",
      interest: "realistic"
    },
    {
      id: "car_013",
      text: "Układanie podłóg w domach",
      text_en: "Install flooring in houses",
      interest: "realistic"
    },
    {
      id: "car_019",
      text: "Obsługa maszyn na linii produkcyjnej",
      text_en: "Operate a machine on a production line",
      interest: "realistic"
    },
    {
      id: "car_025",
      text: "Układanie cegieł lub płytek",
      text_en: "Lay brick or tile",
      interest: "realistic"
    },
    {
      id: "car_031",
      text: "Montaż elektronicznych podzespołów",
      text_en: "Assemble electronic parts",
      interest: "realistic"
    },
    {
      id: "car_037",
      text: "Ustawianie i obsługa maszyn do produkcji",
      text_en: "Set up and operate machines to make products",
      interest: "realistic"
    },
    {
      id: "car_043",
      text: "Testowanie jakości części przed wysyłką",
      text_en: "Test the quality of parts before shipment",
      interest: "realistic"
    },

    // Investigative (I) - 8 questions
    {
      id: "car_002",
      text: "Przeprowadzanie eksperymentów chemicznych",
      text_en: "Conduct chemical experiments",
      interest: "investigative"
    },
    {
      id: "car_008",
      text: "Badanie struktury ludzkiego ciała",
      text_en: "Study the structure of the human body",
      interest: "investigative"
    },
    {
      id: "car_014",
      text: "Opracowywanie nowych metod leczenia",
      text_en: "Develop a new medical treatment or procedure",
      interest: "investigative"
    },
    {
      id: "car_020",
      text: "Prowadzenie badań biologicznych",
      text_en: "Conduct biological research",
      interest: "investigative"
    },
    {
      id: "car_026",
      text: "Badanie zjawisk pogodowych",
      text_en: "Study weather conditions",
      interest: "investigative"
    },
    {
      id: "car_032",
      text: "Badanie przyczyn pożaru",
      text_en: "Investigate the cause of a fire",
      interest: "investigative"
    },
    {
      id: "car_038",
      text: "Przeprowadzanie badań przy użyciu mikroskopu",
      text_en: "Conduct research using a microscope",
      interest: "investigative"
    },
    {
      id: "car_044",
      text: "Badanie próbek krwi pod mikroskopem",
      text_en: "Examine blood samples using a microscope",
      interest: "investigative"
    },

    // Artistic (A) - 8 questions
    {
      id: "car_003",
      text: "Projektowanie grafik do magazynów",
      text_en: "Design artwork for magazines",
      interest: "artistic"
    },
    {
      id: "car_009",
      text: "Pisanie scenariuszy filmowych lub telewizyjnych",
      text_en: "Write scripts for movies or television shows",
      interest: "artistic"
    },
    {
      id: "car_015",
      text: "Komponowanie lub aranżowanie muzyki",
      text_en: "Compose or arrange music",
      interest: "artistic"
    },
    {
      id: "car_021",
      text: "Tworzenie efektów specjalnych do filmów",
      text_en: "Create special effects for movies",
      interest: "artistic"
    },
    {
      id: "car_027",
      text: "Reżyserowanie spektaklu teatralnego",
      text_en: "Direct a play",
      interest: "artistic"
    },
    {
      id: "car_033",
      text: "Malowanie scenografii do sztuk teatralnych",
      text_en: "Paint sets for plays",
      interest: "artistic"
    },
    {
      id: "car_039",
      text: "Tworzenie choreografii tanecznych do show",
      text_en: "Create dance routines for a show",
      interest: "artistic"
    },
    {
      id: "car_045",
      text: "Wykonywanie tańca jazzowego lub stepu",
      text_en: "Perform jazz or tap dance",
      interest: "artistic"
    },

    // Social (S) - 8 questions
    {
      id: "car_004",
      text: "Pomaganie ludziom z problemami osobistymi",
      text_en: "Help people with personal problems",
      interest: "social"
    },
    {
      id: "car_010",
      text: "Uczenie dzieci czytania",
      text_en: "Teach children how to read",
      interest: "social"
    },
    {
      id: "car_016",
      text: "Wykonywanie obowiązków pielęgniarskich w szpitalu",
      text_en: "Perform nursing duties in a hospital",
      interest: "social"
    },
    {
      id: "car_022",
      text: "Udzielanie porad zawodowych innym ludziom",
      text_en: "Give career guidance to people",
      interest: "social"
    },
    {
      id: "car_028",
      text: "Nauczanie języka migowego osób niesłyszących",
      text_en: "Teach sign language to people who are deaf",
      interest: "social"
    },
    {
      id: "car_034",
      text: "Pomaganie rodzinom w rozwiązywaniu problemów",
      text_en: "Help people with family-related problems",
      interest: "social"
    },
    {
      id: "car_040",
      text: "Prowadzenie sesji terapii grupowej",
      text_en: "Help conduct a group therapy session",
      interest: "social"
    },
    {
      id: "car_046",
      text: "Opieka nad dziećmi w przedszkolu",
      text_en: "Take care of children at a day-care center",
      interest: "social"
    },

    // Enterprising (E) - 8 questions
    {
      id: "car_005",
      text: "Sprzedaż franczyz restauracyjnych",
      text_en: "Sell restaurant franchises to individuals",
      interest: "enterprising"
    },
    {
      id: "car_011",
      text: "Zarządzanie sklepem detalicznym",
      text_en: "Manage a retail store",
      interest: "enterprising"
    },
    {
      id: "car_017",
      text: "Kupno i sprzedaż akcji oraz obligacji",
      text_en: "Buy and sell stocks and bonds",
      interest: "enterprising"
    },
    {
      id: "car_023",
      text: "Negocjowanie umów biznesowych",
      text_en: "Negotiate business contracts",
      interest: "enterprising"
    },
    {
      id: "car_029",
      text: "Reprezentowanie klienta w sądzie",
      text_en: "Represent a client in a lawsuit",
      interest: "enterprising"
    },
    {
      id: "car_035",
      text: "Zakładanie własnej firmy",
      text_en: "Start your own business",
      interest: "enterprising"
    },
    {
      id: "car_041",
      text: "Sprzedaż towarów w domu towarowym",
      text_en: "Sell merchandise at a department store",
      interest: "enterprising"
    },
    {
      id: "car_047",
      text: "Zarządzanie działem w dużej firmie",
      text_en: "Manage a department within a large company",
      interest: "enterprising"
    },

    // Conventional (C) - 8 questions
    {
      id: "car_006",
      text: "Prowadzenie ewidencji wysyłek i dostaw",
      text_en: "Keep shipping and receiving records",
      interest: "conventional"
    },
    {
      id: "car_012",
      text: "Obliczanie wynagrodzeń pracowników",
      text_en: "Calculate the wages of employees",
      interest: "conventional"
    },
    {
      id: "car_018",
      text: "Korekta dokumentów i formularzy",
      text_en: "Proofread records or forms",
      interest: "conventional"
    },
    {
      id: "car_024",
      text: "Tworzenie i utrzymanie baz danych komputerowych",
      text_en: "Set up and maintain computer databases",
      interest: "conventional"
    },
    {
      id: "car_030",
      text: "Inwentaryzacja zapasów z użyciem komputera przenośnego",
      text_en: "Inventory supplies using a hand-held computer",
      interest: "conventional"
    },
    {
      id: "car_036",
      text: "Kserowanie listów i raportów",
      text_en: "Photocopy letters and reports",
      interest: "conventional"
    },
    {
      id: "car_042",
      text: "Obsługa transakcji bankowych klientów",
      text_en: "Handle customers' bank transactions",
      interest: "conventional"
    },
    {
      id: "car_048",
      text: "Organizowanie i planowanie spotkań biurowych",
      text_en: "Organize and schedule office meetings",
      interest: "conventional"
    }
  ]
};
