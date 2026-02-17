# It Is You - Aplikacja Psychometryczna z Gamifikacją

## 🚀 Quick Start

### 1. Instalacja zależności
```bash
npm install
```

### 2. Konfiguracja Supabase

#### 2a. Stwórz konto na Supabase
1. Przejdź na https://supabase.com
2. Kliknij "Sign Up"
3. Zaloguj się (GitHub, Google lub email)

#### 2b. Stwórz nowy projekt
1. Kliknij "New Project"
2. Wybierz organizację
3. Nadaj nazwę projektu (np. "it-is-you")
4. Ustaw hasło do bazy danych
5. Wybierz region (najlepiej Europa)
6. Kliknij "Create new project"
7. Czekaj aż projekt się załaduje (~5 minut)

#### 2c. Pobrać klucze API
1. Wejdź do "Project Settings" (ikona koła zębatego)
2. Kliknij na "API" w lewym menu
3. Widoczne są:
   - **Project URL** → skopiuj to do `VITE_SUPABASE_URL`
   - **anon public** → skopiuj to do `VITE_SUPABASE_ANON_KEY`

#### 2d. Konfiguruj zmienne środowiskowe
Utwórz plik `.env.local` w głównym folderze projektu:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
```

**Przykład:**
```env
VITE_SUPABASE_URL=https://abcdefg1234567.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsIm...
```

### 3. Konfiguracja OAuth (Google, Facebook, Apple)

#### 3a. Google OAuth

1. Wejdź do Supabase Dashboard
2. Przejdź do "Authentication" > "Providers"
3. Kliknij na "Google"
4. Włącz provider (toggle)
5. Wejdź na https://console.cloud.google.com
6. Utwórz nowy projekt
7. Wejdź do "APIs & Services" > "Credentials"
8. Kliknij "Create Credentials" > "OAuth 2.0 Client ID"
9. Wybierz "Web application"
10. Dodaj do "Authorized redirect URIs":
    - `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
    - `http://localhost:5173` (dla testów)
11. Skopiuj "Client ID" i "Client Secret"
12. Wklejde do formularza w Supabase
13. Kliknij "Save"

#### 3b. Facebook OAuth

1. Wejdź na https://developers.facebook.com
2. Stwórz nową aplikację (Developer Tools > My Apps > Create App)
3. Wybierz "Consumer"
4. Kliknij na aplikację
5. Wejdź do "Settings" > "Basic"
6. Skopiuj "App ID" i "App Secret"
7. Wejdź do "Products" > dodaj "Facebook Login"
8. W "Facebook Login Settings" dodaj do "Valid OAuth Redirect URIs":
   - `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
9. Wróć do Supabase, włącz Facebook provider
10. Wklejde App ID i App Secret
11. Kliknij "Save"

#### 3c. Apple OAuth

1. Wejdź na https://developer.apple.com
2. Idź do "Certificates, Identifiers & Profiles"
3. Wybierz "Identifiers"
4. Kliknij "+" aby dodać nowy identifier
5. Wybierz "App IDs"
6. Kliknij "Register an App ID"
7. Opisz aplikację (Bundle ID: com.itisyou.app)
8. Zaznacz "Sign in with Apple"
9. Utwórz "Services ID" dla Apple Login
10. W konfiguracji dodaj Redirect URI:
    - `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
11. Wróć do Supabase, włącz Apple provider
12. Wklejde Team ID, Service ID, Key ID i Private Key
13. Kliknij "Save"

### 4. Uruchomienie aplikacji

```bash
npm run dev
```

Aplikacja otworzy się automatycznie na http://localhost:5173

## 📁 Struktura projektu

```
it-is-you/
├── src/
│   ├── components/
│   │   └── Auth/
│   │       └── AuthModal.jsx          # Modal logowania
│   ├── lib/
│   │   └── supabaseClient.js           # Konfiguracja Supabase
│   ├── App.jsx                         # Główny komponent
│   ├── main.jsx                        # Entry point
│   └── index.css                       # Tailwind + custom styles
├── .env.example                        # Szablon zmiennych
├── .env.local                          # Twoje zmienne (gitignored)
├── vite.config.js
├── tailwind.config.js
├── package.json
└── index.html
```

## 🎨 Cechy UI/UX

- ✨ **Glassmorphism Design** - nowoczesna przezroczystość i blur
- 🌙 **Dark Theme** - wygodny dla oczu
- 🎯 **Cyberpunk RPG Style** - futurystyczny portal
- 📱 **Responsive** - działa na mobile i desktop
- ⚡ **Loading States** - indywidualne dla każdego przycisku
- 🔐 **Secure** - all-in-one Supabase auth

## 🔑 Dostępne metody autentykacji

1. **Google OAuth** - szybko i bezpiecznie
2. **Facebook OAuth** - integracja z profilem
3. **Apple OAuth** - dla użytkowników Apple Device
4. **Email + Password** - tradycyjne logowanie
5. **Magic Link** - logowanie bez hasła (send link na email)

## 🛠️ Przydatne komendy

```bash
# Uruchom deweloperski serwer
npm run dev

# Build do produkcji
npm run build

# Preview build
npm run preview
```

## 🔒 Bezpieczeństwo

- Klucz ANON jest publiczny - to **nie** jest tajny
- Nigdy nie dzial się real private key do repo
- Zawsze używaj `.env.local` (gitignored)
- Supabase RLS (Row Level Security) chroni dane

## 📚 Dokumentacja

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Supabase OAuth**: https://supabase.com/docs/guides/auth/social-login
- **Tailwind CSS**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev

## 🚀 Następne kroki

1. **Testy psychometryczne** - dodaj komponenty testów
2. **RPG Gamifikacja** - stwórz postać gracza
3. **User Profile** - przechowuj dane użytkownika w tabeli `users`
4. **Wyniki testów** - tabela `test_results` w Supabase
5. **Leaderboard** - porównuj wyniki graczy
6. **Achievements** - system osiągnięć (badges, levels)

## 💬 Support

Jeśli coś nie drażał:
1. Sprawdź konsole (F12 > Console)
2. Pewnie klucze w `.env.local` są błędne
3. Sprawdź czy Supabase projekt jest live
4. Sprawdź czy OAuth providers są włączeni

---

**Made with ❤️ for It Is You project**
