# HEXACO-60 Test Implementation Guide

## 📋 Przegląd

Zaimplementowano pierwszy test psychometryczny **HEXACO-60** dla aplikacji "It Is You". Test bada 6 wymiarów osobowości na podstawie 60 pytań z 5-stopniową skalą Likerta.

## 🎯 Zaimplementowane komponenty

### 1. **Dane testowe** (`src/data/tests/hexaco.js`)
- ✅ 60 pytań przetłumaczonych na polski
- ✅ 6 wymiarów osobowości (H-E-X-A-C-O)
- ✅ Flagi reverse scoring dla odpowiednich pytań
- ✅ Metadane testu i etykiety skali

### 2. **Logika kalkulacji** (`src/utils/scoring.js`)
- ✅ Funkcja `calculateHexacoScore()` - oblicza wyniki z obsługą reverse scoring
- ✅ Funkcja `generateHexacoReport()` - generuje pełny raport z interpretacjami
- ✅ Funkcja `getHexacoInterpretation()` - zwraca interpretacje wymiarów (niski/średni/wysoki)

### 3. **UI Wizarda testowego** (`src/components/Test/TestWizard.jsx`)
- ✅ Wyświetlanie po 1 pytaniu na raz
- ✅ Pasek postępu (real-time)
- ✅ 5 przycisków Likerta do odpowiedzi
- ✅ Nawigacja (Wstecz/Dalej/Zakończ)
- ✅ Wizualne wskaźniki odpowiedzi (kropki na dole)
- ✅ Nawigacja klawiaturą (1-5, strzałki, Enter)
- ✅ Charakterystyczne kolory dla każdego wymiaru
- ✅ Integracja z Supabase (zapis wyników)
- ✅ Przekierowanie do profilu po zakończeniu

### 4. **Routing** (`src/App.jsx`)
- ✅ Dodano route `/test` renderujący `TestWizard`
- ✅ Wymóg autoryzacji (redirect do `/auth` jeśli niezalogowany)

### 5. **Integracja z profilem** (`public/user-profile.html`)
- ✅ Przycisk "ROZPOCZNIJ TEST OSOBOWOŚCI" przekierowuje do `/test`

### 6. **Schema bazy danych** (`supabase/schema.sql`)
- ✅ Tabela `user_psychometrics` z pełną strukturą
- ✅ RLS policies (każdy user widzi tylko swoje wyniki)
- ✅ Indeksy dla wydajności
- ✅ Trigger `updated_at`

---

## 🚀 Instrukcja uruchomienia

### Krok 1: Utwórz tabelę w Supabase

1. Zaloguj się do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz swój projekt "It Is You"
3. Przejdź do **SQL Editor** (ikona `</>` w lewym menu)
4. Skopiuj zawartość pliku `supabase/schema.sql`
5. Wklej do edytora i kliknij **RUN**
6. Sprawdź czy tabela `user_psychometrics` została utworzona (zakładka **Table Editor**)

### Krok 2: Uruchom dev server

```bash
cd ~/projects/it-is-you
npm run dev
```

Server uruchomi się na `http://localhost:5173`

### Krok 3: Testowanie pełnego flow

1. Otwórz `http://localhost:5173/index2.html` (landing page)
2. Kliknij **"Zaloguj"** i zaloguj się (OAuth lub Email)
3. Zostaniesz przekierowany do `/user-profile.html`
4. Kliknij przycisk **"🚀 ROZPOCZNIJ TEST OSOBOWOŚCI (15 min)"**
5. Wypełnij test (60 pytań, nawigacja strzałkami lub przyciskami)
6. Po zakończeniu wyniki zapisują się do Supabase
7. Przekierowanie z powrotem do profilu

---

## 📊 Wymiary HEXACO-60

| Wymiar | Polski | Angielski | Opis |
|--------|--------|-----------|------|
| **H** | Szczerość-Pokora | Honesty-Humility | Uczciwość, skromność, unikanie manipulacji |
| **E** | Emocjonalność | Emotionality | Wrażliwość emocjonalna, lęk, potrzeba wsparcia |
| **X** | Ekstrawersja | eXtraversion | Energia społeczna, pewność siebie |
| **A** | Ugodowość | Agreeableness | Wyrozumiałość, cierpliwość, współpraca |
| **C** | Sumienność | Conscientiousness | Organizacja, dokładność, dyscyplina |
| **O** | Otwartość | Openness | Ciekawość intelektualna, docenianie sztuki |

---

## 🎨 UI Features

- **Glassmorphic design** - spójny z resztą aplikacji
- **Gradient backgrounds** - różne kolory dla każdego wymiaru
- **Progress visualization** - pasek + licznik pytań
- **Keyboard shortcuts**:
  - `1-5` - wybór odpowiedzi
  - `← →` - nawigacja między pytaniami
  - `Enter` - dalej / zakończ test
- **Visual feedback** - zielone kropki dla odpowiedzianych pytań
- **Responsive** - działa na desktop i mobile

---

## 🔒 Bezpieczeństwo danych

- **Row Level Security (RLS)** włączony
- Użytkownicy widzą **tylko swoje** wyniki
- Polityki:
  - `SELECT` - tylko własne rekordy
  - `INSERT` - tylko swój `user_id`
  - `UPDATE` - tylko własne rekordy
- Wszystkie zapytania są chronione przez Supabase auth

---

## 📁 Struktura plików

```
it-is-you/
├── src/
│   ├── components/
│   │   └── Test/
│   │       └── TestWizard.jsx          # UI wizarda testów
│   ├── data/
│   │   └── tests/
│   │       └── hexaco.js               # Dane testowe HEXACO-60
│   ├── utils/
│   │   └── scoring.js                  # Logika kalkulacji wyników
│   └── App.jsx                         # Routing (dodano /test)
├── public/
│   └── user-profile.html               # Profil użytkownika (przycisk startu)
└── supabase/
    └── schema.sql                      # SQL schema dla Supabase
```

---

## 🔄 Flow danych

1. **User kliknie "Rozpocznij test"** → Redirect do `/test`
2. **TestWizard renderuje pytania** → Stan w React (`useState`)
3. **User odpowiada na 60 pytań** → Przechowywane w `responses` object
4. **Kliknięcie "Zakończ test"** →
   - Wywołanie `calculateHexacoScore(responses)`
   - Wywołanie `generateHexacoReport(scores)`
   - Zapis do Supabase: `user_psychometrics` table
   - `localStorage.setItem('has_profile', 'true')`
   - Redirect: `/user-profile.html?test_completed=hexaco`

---

## 🐛 Troubleshooting

### 1. Błąd: "user_psychometrics table does not exist"
**Rozwiązanie**: Uruchom SQL z pliku `supabase/schema.sql` w Supabase Dashboard

### 2. Błąd: "Not authenticated"
**Rozwiązanie**: Zaloguj się ponownie przez `/auth`

### 3. Błąd: "Missing response for question hex_XXX"
**Rozwiązanie**: Upewnij się, że wszystkie 60 pytań zostały odpowiedzi. UI blokuje przycisk "Zakończ" dopóki wszystkie pytania nie zostaną odpowiedziane.

### 4. Test nie zapisuje się do bazy
**Rozwiązanie**: 
- Sprawdź polityki RLS w Supabase Dashboard
- Sprawdź czy user jest zalogowany (`localStorage` ma `user_session`)
- Sprawdź console w DevTools (`F12`) dla szczegółów błędu

---

## 🚀 Następne kroki (opcjonalne rozszerzenia)

1. **Strona wyników** - dedykowany widok z wykresami radarowymi wymiarów
2. **Historia testów** - lista wszystkich wykonanych testów z datami
3. **Porównanie wyników** - jeśli user robi test ponownie
4. **Eksport PDF** - raport do pobrania
5. **Shareable results** - link do udostępnienia wyników (opcjonalnie)
6. **Więcej testów**: Big Five, Dark Triad, Strengths, Career Interests (struktury już są w danych)

---

## 📝 Notatki techniczne

### Reverse Scoring
Niektóre pytania mają flagę `reverse: true`. W kalkulacji:
- Normalne pytanie: `score = response` (1-5)
- Odwrócone pytanie: `score = 6 - response`
  - Odpowiedź 1 → score 5
  - Odpowiedź 5 → score 1

### Skalowanie wyników
- **Raw scores**: średnia z pytań dla danego wymiaru (1.0 - 5.0)
- **Percentile scores**: mapowanie do 0-100 dla wizualizacji
  - 1.0 → 0%
  - 3.0 → 50%
  - 5.0 → 100%

### Interpretacje
Progi dla interpretacji:
- **Niski**: < 2.5
- **Średni**: 2.5 - 3.5
- **Wysoki**: > 3.5

---

## 💡 Tips dla developera

- Test używa **66+ state updates** podczas wypełniania (każda odpowiedź)
- **Keyboard navigation** znacznie przyspiesza wypełnianie testu
- **Auto-save** (opcjonalnie): możesz dodać `localStorage` backup odpowiedzi
- **Timer**: możesz dodać timer pokazujący ile czasu minęło (obecnie 15min estimate)
- **Mobile gestures**: możesz dodać swipe left/right do nawigacji

---

## ✅ Status implementacji

✅ **GOTOWE DO TESTOWANIA** - wszystkie komponenty zaimplementowane i zintegrowane.

**Co musisz zrobić**:
1. Uruchom SQL z `supabase/schema.sql` w Supabase Dashboard
2. Uruchom `npm run dev`
3. Przetestuj pełny flow: login → user-profile → test → results

Powodzenia! 🎉
