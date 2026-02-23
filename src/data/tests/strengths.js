/**
 * Strengths Assessment Test Data
 * Polish Translation - Test Talentów
 * 
 * 48 questions measuring 16 personal strengths across 4 categories
 * Based on CliftonStrengths/StrengthsFinder methodology
 */

export const STRENGTHS_TEST = {
  test_id: "strengths_assessment",
  test_name: "Test Talentów",
  test_name_en: "Personal Strengths Assessment",
  test_type: "strengths",
  time_estimate_minutes: 12,
  question_count: 48,
  scale_type: "likert_5",
  scale_labels: {
    1: "Zdecydowanie nie do mnie",
    2: "Nie do mnie",
    3: "Neutralnie",
    4: "Do mnie",
    5: "Bardzo do mnie"
  },
  
  // Categories with assigned colors
  categories: [
    {
      id: "strategic_thinking",
      name: "Myślenie Strategiczne",
      name_en: "Strategic Thinking",
      description: "Talenty pomagające w analizie informacji i podejmowaniu lepszych decyzji",
      color: "emerald-500",
      icon: "🧠"
    },
    {
      id: "executing",
      name: "Wykonywanie",
      name_en: "Executing",
      description: "Talenty pomagające w realizacji planów i osiąganiu celów",
      color: "purple-500",
      icon: "⚡"
    },
    {
      id: "influencing",
      name: "Wpływ",
      name_en: "Influencing",
      description: "Talenty pomagające w dotarciu do innych i wywieraniu wpływu",
      color: "amber-500",
      icon: "🎯"
    },
    {
      id: "relationship_building",
      name: "Budowanie Relacji",
      name_en: "Relationship Building",
      description: "Talenty pomagające w tworzeniu więzi i spajaniu zespołów",
      color: "blue-500",
      icon: "🤝"
    }
  ],
  
  // 16 Strengths definitions
  strengths: [
    {
      id: "analytical",
      name: "Analityk",
      name_en: "Analytical",
      category: "strategic_thinking",
      description: "Potrzebujesz danych i dowodów. Kwestionujesz założenia i szukasz przyczyn.",
      keywords: ["Logiczny", "dociekliwy", "obiektywny"]
    },
    {
      id: "strategic",
      name: "Strateg",
      name_en: "Strategic",
      category: "strategic_thinking",
      description: "Widzisz alternatywne ścieżki i możliwe scenariusze. Planujesz długofalowo.",
      keywords: ["Planujący", "przewidujący", "dalekowzroczny"]
    },
    {
      id: "learner",
      name: "Uczący się",
      name_en: "Learner",
      category: "strategic_thinking",
      description: "Uwielbiasz się uczyć. Sam proces zdobywania wiedzy Cię fascynuje.",
      keywords: ["Ciekawy", "rozwijający się", "poszukujący"]
    },
    {
      id: "ideation",
      name: "Pomysłodawca",
      name_en: "Ideation",
      category: "strategic_thinking",
      description: "Fascynują Cię idee. Widzisz połączenia między różnymi zjawiskami.",
      keywords: ["Kreatywny", "innowacyjny", "oryginalny"]
    },
    {
      id: "achiever",
      name: "Realizator",
      name_en: "Achiever",
      category: "executing",
      description: "Pracujesz ciężko i odnosisz satysfakcję z bycia produktywnym.",
      keywords: ["Wytrwały", "pracowity", "energiczny"]
    },
    {
      id: "disciplined",
      name: "Zdyscyplinowany",
      name_en: "Disciplined",
      category: "executing",
      description: "Tworzysz strukturę i porządek. Lubisz rutynę i przewidywalność.",
      keywords: ["Uporządkowany", "systematyczny", "metodyczny"]
    },
    {
      id: "focus",
      name: "Skoncentrowany",
      name_en: "Focus",
      category: "executing",
      description: "Potrzebujesz jasnego kierunku. Priorytetujesz i trzymasz się kursu.",
      keywords: ["Celowy", "zdeterminowany", "niezachwiany"]
    },
    {
      id: "responsibility",
      name: "Odpowiedzialny",
      name_en: "Responsibility",
      category: "executing",
      description: "Bierzesz na siebie pełną odpowiedzialność za swoje zobowiązania. Dotrzymujesz obietnic.",
      keywords: ["Niezawodny", "rzetelny", "uczciwy"]
    },
    {
      id: "communication",
      name: "Komunikator",
      name_en: "Communication",
      category: "influencing",
      description: "Łatwo znajdujesz słowa. Potrafisz wyjaśniać, opisywać, przekonywać.",
      keywords: ["Elokwentny", "ekspresyjny", "angażujący"]
    },
    {
      id: "competition",
      name: "Konkurencyjny",
      name_en: "Competition",
      category: "influencing",
      description: "Mierzysz swoje wyniki z innymi. Konkurencja Cię motywuje.",
      keywords: ["Rywalizujący", "ambitny", "nastawiony na wygraną"]
    },
    {
      id: "maximizer",
      name: "Maksymalizator",
      name_en: "Maximizer",
      category: "influencing",
      description: "Koncentrujesz się na mocnych stronach jako drodze do doskonałości.",
      keywords: ["Doskonalący", "optymalizujący", "dążący do perfekcji"]
    },
    {
      id: "self_assurance",
      name: "Pewny Siebie",
      name_en: "Self-Assurance",
      category: "influencing",
      description: "Ufasz swoim osądom. Masz wewnętrzny kompas prowadzący Twoje decyzje.",
      keywords: ["Pewny", "niezależny", "odważny"]
    },
    {
      id: "adaptability",
      name: "Elastyczny",
      name_en: "Adaptability",
      category: "relationship_building",
      description: "Żyjesz chwilą. Dobrze radzisz sobie ze zmiennością.",
      keywords: ["Giętki", "spontaniczny", "elastyczny"]
    },
    {
      id: "developer",
      name: "Rozwijający",
      name_en: "Developer",
      category: "relationship_building",
      description: "Widzisz potencjał w innych. Pomagasz im się rozwijać.",
      keywords: ["Wspierający", "mentorski", "cierpliwy"]
    },
    {
      id: "empathy",
      name: "Empatyczny",
      name_en: "Empathy",
      category: "relationship_building",
      description: "Wyczuwasz emocje innych ludzi. Potrafisz się w nich wczuć.",
      keywords: ["Wrażliwy", "intuicyjny", "troskliwy"]
    },
    {
      id: "harmony",
      name: "Harmonizujący",
      name_en: "Harmony",
      category: "relationship_building",
      description: "Szukasz obszarów zgody. Unikasz konfrontacji i szukasz konsensusu.",
      keywords: ["Pokojowy", "dyplomatyczny", "łagodzący"]
    }
  ],
  
  // 48 Questions (3 per strength)
  questions: [
    // Analytical (3 questions)
    { id: "str_001", text: "Lubię rozkładać złożone problemy na mniejsze części", strength: "analytical" },
    { id: "str_017", text: "Kwestionuję założenia i szukam ukrytych przyczyn", strength: "analytical" },
    { id: "str_033", text: "Potrzebuję danych i dowodów przed wyciągnięciem wniosków", strength: "analytical" },
    
    // Strategic (3 questions)
    { id: "str_002", text: "Naturalnie myślę o przyszłych scenariuszach i możliwościach", strength: "strategic" },
    { id: "str_018", text: "Rozważam wiele ścieżek działania przed podjęciem decyzji", strength: "strategic" },
    { id: "str_034", text: "Przewiduję przeszkody i planuję alternatywne trasy", strength: "strategic" },
    
    // Learner (3 questions)
    { id: "str_003", text: "Uwielbiam się uczyć nowych rzeczy, nawet jeśli nigdy ich nie użyję", strength: "learner" },
    { id: "str_019", text: "Proces uczenia się ekscytuje mnie bardziej niż końcowy rezultat", strength: "learner" },
    { id: "str_035", text: "Aktywnie szukam możliwości rozwoju zawodowego", strength: "learner" },
    
    // Ideation (3 questions)
    { id: "str_004", text: "Często wymyślam kreatywne pomysły i połączenia", strength: "ideation" },
    { id: "str_020", text: "Lubię sesje burzy mózgów i generowanie nowych koncepcji", strength: "ideation" },
    { id: "str_036", text: "Dostrzegam wzorce i związki, których inni nie widzą", strength: "ideation" },
    
    // Achiever (3 questions)
    { id: "str_005", text: "Czuję satysfakcję, gdy ukończę zadania i odhaczę je z listy", strength: "achiever" },
    { id: "str_021", text: "Muszę każdego dnia osiągnąć coś konkretnego", strength: "achiever" },
    { id: "str_037", text: "Czuję się niespokojny, kiedy nie pracuję nad jakimś celem", strength: "achiever" },
    
    // Disciplined (3 questions)
    { id: "str_006", text: "Tworzę strukturę i rutynę w moim codziennym życiu", strength: "disciplined" },
    { id: "str_022", text: "Wolę mieć jasne procesy i procedury do naśladowania", strength: "disciplined" },
    { id: "str_038", text: "Wprowadzam porządek w chaotycznych sytuacjach", strength: "disciplined" },
    
    // Focus (3 questions)
    { id: "str_007", text: "Potrafię koncentrować się na jednej rzeczy przez długi czas", strength: "focus" },
    { id: "str_023", text: "Priorytetuję zadania i eliminuję rozproszenia, aby pozostać na kursie", strength: "focus" },
    { id: "str_039", text: "Opieram się pokusie wielozadaniowości i koncentruję się na jednym priorytecie", strength: "focus" },
    
    // Responsibility (3 questions)
    { id: "str_008", text: "Biorę odpowiedzialność za moje zobowiązania i realizuję je", strength: "responsibility" },
    { id: "str_024", text: "Ludzie opisują mnie jako osobę godną zaufania i niezawodną", strength: "responsibility" },
    { id: "str_040", text: "Rozliczam się z siebie, gdy coś pójdzie nie tak", strength: "responsibility" },
    
    // Communication (3 questions)
    { id: "str_009", text: "Potrafię wyjaśniać złożone tematy w sposób zrozumiały dla innych", strength: "communication" },
    { id: "str_025", text: "Zawsze znajduję odpowiednie słowa, aby przykuć uwagę słuchaczy", strength: "communication" },
    { id: "str_041", text: "Potrafię jasno wyrażać swoje myśli w mowie i piśmie", strength: "communication" },
    
    // Competition (3 questions)
    { id: "str_010", text: "Lubię rywalizować i mierzyć swoje postępy z innymi", strength: "competition" },
    { id: "str_026", text: "Porównuję swoje wyniki z innymi jako sposób na poprawę", strength: "competition" },
    { id: "str_042", text: "Zwycięstwo ma dla mnie znaczenie, nawet w przyjacielskich zawodach", strength: "competition" },
    
    // Maximizer (3 questions)
    { id: "str_011", text: "Motywuję siebie i innych do osiągania doskonałości", strength: "maximizer" },
    { id: "str_027", text: "Wystarczająco dobre nigdy nie jest dla mnie wystarczające; chcę wyjątkowego", strength: "maximizer" },
    { id: "str_043", text: "Koncentruję się na wykorzystywaniu mocnych stron zamiast naprawianiu słabości", strength: "maximizer" },
    
    // Self-Assurance (3 questions)
    { id: "str_012", text: "Ufam swojemu osądowi i czuję się pewnie w swoich decyzjach", strength: "self_assurance" },
    { id: "str_028", text: "Rzadko kwestionuję swoje wybory po ich podjęciu", strength: "self_assurance" },
    { id: "str_044", text: "Podejmuję ryzyko, którego inni unikają, ponieważ ufam sobie", strength: "self_assurance" },
    
    // Adaptability (3 questions)
    { id: "str_013", text: "Łatwo dostosowuję się do zmieniających się okoliczności", strength: "adaptability" },
    { id: "str_029", text: "Mogę zmieniać priorytety bez poczucia stresu", strength: "adaptability" },
    { id: "str_045", text: "Żyję w teraźniejszości i reaguję na moment", strength: "adaptability" },
    
    // Developer (3 questions)
    { id: "str_014", text: "Widzę potencjał w innych i lubię pomagać im się rozwijać", strength: "developer" },
    { id: "str_030", text: "Zauważam małe postępy w umiejętnościach innych", strength: "developer" },
    { id: "str_046", text: "Cieszę się z sukcesów innych tak samo jak z własnych", strength: "developer" },
    
    // Empathy (3 questions)
    { id: "str_015", text: "Potrafię wyczuwać, co inni czują, nie mówiąc tego wprost", strength: "empathy" },
    { id: "str_031", text: "Naturalnie dostrajam się do stanów emocjonalnych innych", strength: "empathy" },
    { id: "str_047", text: "Ludzie przychodzą do mnie, gdy potrzebują wsparcia emocjonalnego", strength: "empathy" },
    
    // Harmony (3 questions)
    { id: "str_016", text: "Szukam obszarów zgody i staram się unikać konfliktów", strength: "harmony" },
    { id: "str_032", text: "Szukam wspólnej płaszczyzny w sporach", strength: "harmony" },
    { id: "str_048", text: "Pomagam innym znaleźć konsensus", strength: "harmony" }
  ]
};
