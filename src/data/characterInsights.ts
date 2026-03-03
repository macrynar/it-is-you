/**
 * Character Insights Lookup
 * Maps archetype names → high-impact, relatable copy for social sharing.
 *
 * Content philosophy:
 *  - roastLine:       Funny, self-aware observation about the cliché of this archetype.
 *  - superpowerLine:  One punchy sentence — what they're genuinely great at.
 *  - kryptoniteLine:  The honest weakness; operational, not vague.
 *  - mostLikelyTo:    The "Most Likely To…" yearbook-style truth.
 *  - leastLikelyTo:   The inverse — what they'd never do.
 *  - workPreference:  Operational instruction for collaborators.
 *  - workConstraint:  What to avoid when working with them.
 *  - commsStyle:      How they prefer to communicate.
 *  - deepWorkHours:   When they're "in the zone" (default shown in badge).
 */
export interface CharacterInsight {
  roastLine: string;
  superpowerLine: string;
  kryptoniteLine: string;
  mostLikelyTo: string;
  leastLikelyTo: string;
  workPreference: string;
  workConstraint: string;
  commsStyle: string;
  deepWorkHours: string;
}

const INSIGHTS: Record<string, CharacterInsight> = {
  'INNOWATOR': {
    roastLine: "Mój mózg produkuje 10 genialnych pomysłów na minutę. Niestety żaden z nich nie obejmuje 'odpisania na maila'.",
    superpowerLine: "Widzę rozwiązania, zanim inni zobaczą problem.",
    kryptoniteLine: "Excel, rutyna i spotkania, które mogły być mailem.",
    mostLikelyTo: "Zmienić całą strategię projektu na dzień przed deadline'em, bo 'tak jest lepiej'.",
    leastLikelyTo: "Przeczytać instrukcję obsługi przed użyciem.",
    workPreference: "Szybkie burze mózgów, potem cisza na egzekucję.",
    workConstraint: "Mikrozarządzanie i feedback publiczny na forum.",
    commsStyle: "Slack (krótko i konkretnie). Nie dzwoń bez uprzedzenia.",
    deepWorkHours: "9:00–12:00",
  },
  'INNOVATOR': {
    roastLine: "Mój mózg produkuje 10 genialnych pomysłów na minutę. Niestety żaden z nich nie obejmuje 'odpisania na maila'.",
    superpowerLine: "Widzę rozwiązania, zanim inni zobaczą problem.",
    kryptoniteLine: "Excel, rutyna i spotkania, które mogły być mailem.",
    mostLikelyTo: "Zmienić całą strategię projektu na dzień przed deadline'em, bo 'tak jest lepiej'.",
    leastLikelyTo: "Przeczytać instrukcję obsługi przed użyciem.",
    workPreference: "Szybkie burze mózgów, potem cisza na egzekucję.",
    workConstraint: "Mikrozarządzanie i feedback publiczny na forum.",
    commsStyle: "Slack (krótko i konkretnie). Nie dzwoń bez uprzedzenia.",
    deepWorkHours: "9:00–12:00",
  },
  'STRAŻNIK': {
    roastLine: "Uratuję projekt przed katastrofą, ale najpierw poprawię literówki w Twoim Slacku.",
    superpowerLine: "Widzę zagrożenia, zanim staną się kryzysem.",
    kryptoniteLine: "Chaos, brak procedur i decyzje 'na czuja'.",
    mostLikelyTo: "Stworzyć 47-punktową checklistę dla 'prostego' zadania.",
    leastLikelyTo: "Zignorować błąd w dokumentacji, bo 'i tak nikt nie czyta'.",
    workPreference: "Jasne priorytety i czas na dokładną weryfikację.",
    workConstraint: "Nagłe zmiany bez uzasadnienia i praca bez planu.",
    commsStyle: "Email z agendą przed spotkaniem. Prosi o pisemne potwierdzenia.",
    deepWorkHours: "8:00–11:00",
  },
  'GUARDIAN': {
    roastLine: "Uratuję projekt przed katastrofą, ale najpierw poprawię literówki w Twoim Slacku.",
    superpowerLine: "Widzę zagrożenia, zanim staną się kryzysem.",
    kryptoniteLine: "Chaos, brak procedur i decyzje 'na czuja'.",
    mostLikelyTo: "Stworzyć 47-punktową checklistę dla 'prostego' zadania.",
    leastLikelyTo: "Zignorować błąd w dokumentacji, bo 'i tak nikt nie czyta'.",
    workPreference: "Jasne priorytety i czas na dokładną weryfikację.",
    workConstraint: "Nagłe zmiany bez uzasadnienia i praca bez planu.",
    commsStyle: "Email z agendą przed spotkaniem. Prosi o pisemne potwierdzenia.",
    deepWorkHours: "8:00–11:00",
  },
  'EMPATA': {
    roastLine: "Wiem, że jesteś smutny, zanim Ty to wiesz. Ale płaczę na reklamach pieluch.",
    superpowerLine: "Rozumiem ludzi na głębokim poziomie i buduję trwałe relacje.",
    kryptoniteLine: "Konflikty, zimna komunikacja i środowiska bez empatii.",
    mostLikelyTo: "Przejąć emocjonalny ciężar całego zespołu i zapomnieć o sobie.",
    leastLikelyTo: "Powiedzieć komuś prosto w twarz, że jego pomysł jest zły.",
    workPreference: "Harmonijna atmosfera i czas na rozmowy 1:1.",
    workConstraint: "Agresywna rywalizacja i feedback bez szacunku.",
    commsStyle: "Rozmowy zamiast maili. Docenia check-in na początku.",
    deepWorkHours: "10:00–13:00",
  },
  'EMPATH': {
    roastLine: "Wiem, że jesteś smutny, zanim Ty to wiesz. Ale płaczę na reklamach pieluch.",
    superpowerLine: "Rozumiem ludzi na głębokim poziomie i buduję trwałe relacje.",
    kryptoniteLine: "Konflikty, zimna komunikacja i środowiska bez empatii.",
    mostLikelyTo: "Przejąć emocjonalny ciężar całego zespołu i zapomnieć o sobie.",
    leastLikelyTo: "Powiedzieć komuś prosto w twarz, że jego pomysł jest zły.",
    workPreference: "Harmonijna atmosfera i czas na rozmowy 1:1.",
    workConstraint: "Agresywna rywalizacja i feedback bez szacunku.",
    commsStyle: "Rozmowy zamiast maili. Docenia check-in na początku.",
    deepWorkHours: "10:00–13:00",
  },
  'LIDER': {
    roastLine: "Motywuję innych do szczytów, które sam wyznaczam — zazwyczaj bez pytania, czy chcą tam dotrzeć.",
    superpowerLine: "Przemieniam wizję w ruch i naturalnie pociągam za sobą innych.",
    kryptoniteLine: "Biurokracja, slow decision-making i obrona status quo.",
    mostLikelyTo: "Zaproponować ambitniejszy cel niż ustalony, bo 'możemy zrobić więcej'.",
    leastLikelyTo: "Czekać na oficjalne zielone światło, gdy widzi, że trzeba działać.",
    workPreference: "Autonomia decyzyjna i jasna odpowiedzialność za wynik.",
    workConstraint: "Zbyt wiele warstw decyzyjnych i brak wpływu na kierunek.",
    commsStyle: "Bezpośrednio i konkretnie. Bez owijania w bawełnę.",
    deepWorkHours: "7:00–10:00",
  },
  'LEADER': {
    roastLine: "Motywuję innych do szczytów, które sam wyznaczam — zazwyczaj bez pytania, czy chcą tam dotrzeć.",
    superpowerLine: "Przemieniam wizję w ruch i naturalnie pociągam za sobą innych.",
    kryptoniteLine: "Biurokracja, slow decision-making i obrona status quo.",
    mostLikelyTo: "Zaproponować ambitniejszy cel niż ustalony, bo 'możemy zrobić więcej'.",
    leastLikelyTo: "Czekać na oficjalne zielone światło, gdy widzi, że trzeba działać.",
    workPreference: "Autonomia decyzyjna i jasna odpowiedzialność za wynik.",
    workConstraint: "Zbyt wiele warstw decyzyjnych i brak wpływu na kierunek.",
    commsStyle: "Bezpośrednio i konkretnie. Bez owijania w bawełnę.",
    deepWorkHours: "7:00–10:00",
  },
  'ANALITYK': {
    roastLine: "Mam dane na poparcie każdej decyzji. Zbieranie tych danych zajmuje tyle czasu, że decyzja staje się nieaktualna.",
    superpowerLine: "Dostrzegam wzorce w danych, które innym całkowicie umykają.",
    kryptoniteLine: "Decyzje 'na przeczucie' i presja na szybką odpowiedź bez analizy.",
    mostLikelyTo: "Spędzić 3 godziny na doskonaleniu wykresu, który i tak nikt nie przeczyta uważnie.",
    leastLikelyTo: "Powiedzieć 'wystarczy' i oddać niedoskonały raport.",
    workPreference: "Czas na deep work i dostęp do pełnych danych.",
    workConstraint: "Powierzchowna analiza i ciągłe przerwy w trakcie pracy.",
    commsStyle: "Email z załącznikami. Nie przeszkadzać między 9–12.",
    deepWorkHours: "9:00–12:00",
  },
  'ANALYST': {
    roastLine: "Mam dane na poparcie każdej decyzji. Zbieranie tych danych zajmuje tyle czasu, że decyzja staje się nieaktualna.",
    superpowerLine: "Dostrzegam wzorce w danych, które innym całkowicie umykają.",
    kryptoniteLine: "Decyzje 'na przeczucie' i presja na szybką odpowiedź bez analizy.",
    mostLikelyTo: "Spędzić 3 godziny na doskonaleniu wykresu, który i tak nikt nie przeczyta uważnie.",
    leastLikelyTo: "Powiedzieć 'wystarczy' i oddać niedoskonały raport.",
    workPreference: "Czas na deep work i dostęp do pełnych danych.",
    workConstraint: "Powierzchowna analiza i ciągłe przerwy w trakcie pracy.",
    commsStyle: "Email z załącznikami. Nie przeszkadzać między 9–12.",
    deepWorkHours: "9:00–12:00",
  },
  'KREATOR': {
    roastLine: "Tworzę rzeczy piękne i niepowtarzalne. Reprodukowanie czyichś pomysłów to dla mnie kara dożywotnia.",
    superpowerLine: "Przekształcam surowe idee w rzeczy, które wzruszają i inspirują.",
    kryptoniteLine: "Odgórne szablony, korporacyjna estetyka i 'zróbmy to jak poprzednio'.",
    mostLikelyTo: "Całkowicie przebudować projekt na lepszy tuż przed prezentacją.",
    leastLikelyTo: "Użyć gotowego szablonu bez żadnych modyfikacji.",
    workPreference: "Przestrzeń twórcza bez zbędnych ograniczeń formalnych.",
    workConstraint: "Korporacyjna estetyka i brak swobody twórczej.",
    commsStyle: "Wizualnie i kontekstowo. Pokaż mi, nie opisuj.",
    deepWorkHours: "11:00–15:00",
  },
  'CREATOR': {
    roastLine: "Tworzę rzeczy piękne i niepowtarzalne. Reprodukowanie czyichś pomysłów to dla mnie kara dożywotnia.",
    superpowerLine: "Przekształcam surowe idee w rzeczy, które wzruszają i inspirują.",
    kryptoniteLine: "Odgórne szablony, korporacyjna estetyka i 'zróbmy to jak poprzednio'.",
    mostLikelyTo: "Całkowicie przebudować projekt na lepszy tuż przed prezentacją.",
    leastLikelyTo: "Użyć gotowego szablonu bez żadnych modyfikacji.",
    workPreference: "Przestrzeń twórcza bez zbędnych ograniczeń formalnych.",
    workConstraint: "Korporacyjna estetyka i brak swobody twórczej.",
    commsStyle: "Wizualnie i kontekstowo. Pokaż mi, nie opisuj.",
    deepWorkHours: "11:00–15:00",
  },
  'DYPLOMATA': {
    roastLine: "Znajduję kompromis tam, gdzie inni widzą wojnę. Tylko nikt nie pyta, z czym ja sam/a musiałem/am się pogodzić.",
    superpowerLine: "Wygładzam konflikty i buduję mosty między różnymi perspektywami.",
    kryptoniteLine: "Zaciśnięte pozycje, agresja i brak woli do rozmowy.",
    mostLikelyTo: "Zrezygnować z własnego pomysłu, żeby wszyscy byli zadowoleni.",
    leastLikelyTo: "Stanąć twardo po jednej stronie i nie ustąpić ani kroku.",
    workPreference: "Środowisko dialogu i czas na budowanie konsensusu.",
    workConstraint: "Jednostronne decyzje i ignorowanie perspektyw zespołu.",
    commsStyle: "Preferuje spotkania twarzą w twarz lub video call.",
    deepWorkHours: "10:00–13:00",
  },
  'DIPLOMAT': {
    roastLine: "Znajduję kompromis tam, gdzie inni widzą wojnę. Tylko nikt nie pyta, z czym ja sam/a musiałem/am się pogodzić.",
    superpowerLine: "Wygładzam konflikty i buduję mosty między różnymi perspektywami.",
    kryptoniteLine: "Zaciśnięte pozycje, agresja i brak woli do rozmowy.",
    mostLikelyTo: "Zrezygnować z własnego pomysłu, żeby wszyscy byli zadowoleni.",
    leastLikelyTo: "Stanąć twardo po jednej stronie i nie ustąpić ani kroku.",
    workPreference: "Środowisko dialogu i czas na budowanie konsensusu.",
    workConstraint: "Jednostronne decyzje i ignorowanie perspektyw zespołu.",
    commsStyle: "Preferuje spotkania twarzą w twarz lub video call.",
    deepWorkHours: "10:00–13:00",
  },
};

const DEFAULT_INSIGHT: CharacterInsight = {
  roastLine: "Rozumiem sytuację szybciej niż wszyscy — ale wyjaśniam ją wolniej niż wszyscy tego chcą.",
  superpowerLine: "Widzę pełny obraz tam, gdzie inni widzą tylko fragmenty.",
  kryptoniteLine: "Brak autonomii i decyzje narzucane bez kontekstu.",
  mostLikelyTo: "Zaproponować lepsze rozwiązanie niż to, o które ktokolwiek prosił.",
  leastLikelyTo: "Przyjąć pierwsze rozwiązanie bez zadania choćby jednego pytania.",
  workPreference: "Autonomia + jasny cel = przestrzeń do bycia najlepszą wersją siebie.",
  workConstraint: "Mikrozarządzanie i spotkania bez agendy.",
  commsStyle: "Krótko i konkretnie — najlepiej na piśmie przed telefonem.",
  deepWorkHours: "9:00–12:00",
};

/**
 * Returns insight copy for a given archetype name.
 * Tries exact match, then partial match, then returns defaults.
 */
export function getInsight(archetypeName: string): CharacterInsight {
  if (!archetypeName) return DEFAULT_INSIGHT;
  const upper = archetypeName.trim().toUpperCase();

  // Exact match
  if (INSIGHTS[upper]) return INSIGHTS[upper];

  // Partial match — archetype name contains or is contained in key
  for (const [key, val] of Object.entries(INSIGHTS)) {
    if (upper.includes(key) || key.includes(upper)) return val;
  }

  // First word match (e.g. "Innowator Typ 5" → "INNOWATOR")
  const firstWord = upper.split(/[\s\-_]+/)[0];
  if (firstWord && INSIGHTS[firstWord]) return INSIGHTS[firstWord];

  return DEFAULT_INSIGHT;
}
