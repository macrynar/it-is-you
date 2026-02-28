import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GLOBAL_GUIDELINES, PROMPT_VERSION } from './promptConfig.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { test_type, percentile_scores, raw_scores, report, force } = await req.json()

    // Auth: get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      const reason = userError?.message ?? 'No user from auth token'
      return new Response(JSON.stringify({ error: 'Unauthorized', reason }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Admin client for cache reads/writes (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check interpretation cache (unless force regeneration requested)
    if (!force) {
      const { data: cached } = await supabaseAdmin
        .from('ai_interpretations')
        .select('interpretation')
        .eq('user_id', user.id)
        .eq('test_type', test_type)
        .eq('prompt_version', PROMPT_VERSION)
        .single()

      if (cached?.interpretation) {
        return new Response(JSON.stringify({ interpretation: cached.interpretation, cached: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Build prompt
    const prompt = buildPrompt(test_type, percentile_scores, raw_scores, report)

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Call OpenAI GPT-4o-mini
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1400
      })
    })

    if (!openaiRes.ok) {
      const errText = await openaiRes.text()
      console.error('OpenAI error:', errText)
      return new Response(JSON.stringify({ error: 'LLM request failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const openaiData = await openaiRes.json()
    const interpretation = openaiData.choices?.[0]?.message?.content ?? ''

    // Cache the result
    await supabaseAdmin.from('ai_interpretations').upsert({
      user_id: user.id,
      test_type,
      prompt_version: PROMPT_VERSION,
      interpretation
    }, { onConflict: 'user_id,test_type,prompt_version' })

    return new Response(JSON.stringify({ interpretation, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function buildPrompt(testType: string, percentile_scores: Record<string, number>, _raw_scores: Record<string, number>, report?: Record<string, unknown>): string {
  if (testType === 'HEXACO') {
    const H = Math.round(percentile_scores.honesty_humility ?? 50)
    const E = Math.round(percentile_scores.emotionality ?? 50)
    const X = Math.round(percentile_scores.extraversion ?? 50)
    const A = Math.round(percentile_scores.agreeableness ?? 50)
    const C = Math.round(percentile_scores.conscientiousness ?? 50)
    const O = Math.round(percentile_scores.openness ?? 50)

    return `Jesteś doświadczonym psychologiem specjalizującym się w psychologii osobowości. Na podstawie wyników testu HEXACO-60 napisz szczegółową, spersonalizowaną interpretację osobowości w języku polskim.

Wyniki (skala percentylowa 0–100, gdzie 50 = dokładna średnia populacji):
- Uczciwość-Pokora (Honesty-Humility): ${H}%
- Emocjonalność (Emotionality): ${E}%
- Ekstrawersja (Extraversion): ${X}%
- Ugodowość (Agreeableness): ${A}%
- Sumienność (Conscientiousness): ${C}%
- Otwartość na doświadczenia (Openness): ${O}%

Napisz interpretację w formacie Markdown z DOKŁADNIE następującą strukturą — użyj tych nagłówków dosłownie:

## Twój profil osobowości

[2–3 zdania opisujące ogólny obraz osobowości, co charakteryzuje tę osobę jako całość]

## Twoje mocne strony

[Opisz 2–3 dominujące cechy (z najwyższymi wynikami). Dla każdej: bold tytuł + 1–2 zdania. Przykład: **Uczciwość i integralność** Twoja wyjątkowo wysoka uczciwość...]

## Obszary do refleksji

[Opisz 1–2 cechy z niższymi wynikami jako przestrzeń do wzrostu, NIE jako wady. Bold tytuł każdej.]

## Wskazówki dla Ciebie

[2–3 konkretne praktyczne wskazówki dotyczące pracy, relacji lub samorozwoju. Każda zaczyna się od bold tytułu: **W pracy:** tekst]

---
*[Jedno zdanie — psychologiczna "esencja" profilu, np. "Twoja siła tkwi w..."]*

Zasady:
- Pisz bezpośrednio do osoby, w 2. osobie: "Twój...", "Wykazujesz...", "Masz tendencję do..."
- Nie pisz "wyniki testu wskazują" ani "na podstawie testu"
- Bądź ciepły, precyzyjny psychologicznie i konkretny — unikaj ogólników
- Zachowaj DOKŁADNIE podaną strukturę Markdown (##, **, ---, *)

${GLOBAL_GUIDELINES}`
  }

  if (testType === 'ENNEAGRAM') {
    const pt = (report as any)?.primary_type
    const typeNum = pt?.type ?? '?'
    const typeName = pt?.name ?? ''
    const typeNameEn = pt?.name_en ?? ''
    const wing = (report as any)?.wing?.type ?? null
    const motivation = pt?.core_motivation ?? ''
    const fear = pt?.basic_fear ?? ''

    const scores = Object.entries(_raw_scores ?? {})
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .map(([t, s]) => `Typ ${t}: ${s}`)
      .join(', ')

    return `Jesteś doświadczonym psychologiem specjalizującym się w typologii Enneagram. Na podstawie wyników napisz głęboką, spersonalizowaną interpretację w języku polskim.

Typ dominujący: **${typeNum} – ${typeName}** (${typeNameEn})${wing ? `\nSkrzydło: ${wing}` : ''}
Podstawowa motywacja: ${motivation}
Podstawowy lęk: ${fear}
Wyniki wszystkich typów (malejąco): ${scores}

Napisz interpretację w formacie Markdown z DOKŁADNIE następującą strukturą:

## Kim jesteś

[2–3 zdania opisujące esencję tego typu — jak ta osoba postrzega świat, co nią kieruje]

## Twoje supermoce

[Opisz 2–3 naturalne talenty i mocne strony tego typu. Dla każdej: bold tytuł + 1–2 zdania. Przykład: **Głęboka empatia** Masz wrodzoną zdolność...]

## Twoje cienie

[1–2 wyzwania charakterystyczne dla tego typu — bez oceniania, ze zrozumieniem. Bold tytuł każdego.]

## Twoja ścieżka wzrostu

[2–3 konkretne wskazówki dotyczące osobistego rozwoju, relacji i pracy. Każda zaczyna się od bold tytułu: **W relacjach:** tekst]

## Twój potencjał

[Jedno motywujące zdanie lub krótki akapit o tym, dokąd może prowadzić ta ścieżka w najlepszym wydaniu]

---
*[Jedno zdanie — psychologiczna "esencja" tego profilu Enneagram]*

Zasady:
- Pisz bezpośrednio do osoby, w 2. osobie
- Nie pisz "wyniki wskazują", "test pokazuje" itp.
- Bądź głęboki, precyzyjny psychologicznie, ciepły i motywujący
- Zachowaj DOKŁADNIE podaną strukturę Markdown (##, **, ---, *)

${GLOBAL_GUIDELINES}`
  }

  if (testType === 'DARK_TRIAD') {
    const ps = percentile_scores ?? {}
    const P = Math.round(ps.psychopathy ?? ps.Psychopathy ?? 50)
    const M = Math.round(ps.machiavellianism ?? ps.Machiavellianism ?? 50)
    const N = Math.round(ps.narcissism ?? ps.Narcissism ?? 50)

    return `Jesteś doświadczonym psychologiem klinicznym specjalizującym się w ciemnej triadzie osobowości. Na podstawie wyników testu SD3 napisz wnikliwą, spersonalizowaną interpretację w języku polskim.

Wyniki (skala percentylowa 0–100, gdzie 50 = średnia populacji):
- Psychopatia: ${P}%
- Makiawelizm: ${M}%
- Narcyzm: ${N}%

Napisz interpretację w formacie Markdown z DOKŁADNIE następującą strukturą:

## Twój profil Dark Triad

[2–3 zdania opisujące ogólny obraz — jak te cechy kształtują sposób działania tej osoby w świecie]

## Dominujące wzorce

[Opisz 1–3 najwyższe cechy (powyżej 40%) w kontekście ich roli w życiu codziennym. Dla każdej: bold tytuł + 1–2 zdania. Zachowaj neutralny, analityczny ton. Przykład: **Strategiczne myślenie (Makiawelizm)** Twoja wyjątkowa zdolność...]

## Obszary ryzyka

[Opisz potencjalne pułapki tych cech w relacjach, pracy lub samorozwoju — bez moralizowania, ze zrozumieniem. Bold tytuł każdego.]

## Ścieżka świadomości

[2–3 konkretne wskazówki, jak rozwijać samowiedzę i budować zdrowe relacje, uwzględniając te cechy. Każda zaczyna się od bold tytułu: **W pracy:** tekst]

---
*[Jedno zdanie — psychologiczna "esencja" tego profilu, np. "Twoja siła leży w..."]*

Zasady:
- Pisz bezpośrednio do osoby, w 2. osobie
- Zachowaj NEUTRALNY i analityczny ton — nie oceniaj moralnie
- Niskie wyniki (poniżej 30%) pomijaj lub wspomnij skrótowo jako zasoby
- Bądź precyzyjny psychologicznie i konstruktywny
- Zachowaj DOKŁADNIE podaną strukturę Markdown (##, **, ---, *)

${GLOBAL_GUIDELINES}`
  }

  if (testType === 'STRENGTHS') {
    const top5 = (report?.top_5 as Array<{ name: string; name_en?: string; category: string; score?: number }> | undefined) ?? []
    const talentList = top5.map((t, i) =>
      `${i + 1}. **${t.name}** (${t.name_en ?? ''}) — kategoria: ${t.category}, wynik: ${t.score?.toFixed(2) ?? '?'}/5.00`
    ).join('\n')

    return `Jesteś doświadczonym coachem kariery i psychologiem specjalizującym się w odkrywaniu talentów oraz mocnych stronach osobowości. Na podstawie wyników testu talentów napisz głęboką, spersonalizowaną interpretację w języku polskim.

Top 5 talentów badanej osoby:
${talentList}

Napisz interpretację w formacie Markdown z DOKŁADNIE następującą strukturą:

## Twój unikalny profil talentów

[2–3 zdania opisujące ogólny wzorzec — jak te 5 talentów razem tworzy spójny obraz tej osoby i jej naturalnego sposobu działania]

## Dominujące mocne strony

[Opisz 2–3 najwyżej wypadające talenty (z listy Top 5). Dla każdego: bold tytuł + 1–2 zdania pokazujące, jak ten talent przejawia się w codziennym życiu, pracy i relacjach. Przykład: **Analityk** Twój umysł naturalnie szuka danych i dowodów...]

## Jak te talenty współpracują

[Opisz synergie między talentami — jak jeden talent wzmacnia lub uzupełnia drugi. Pokaż, jak razem tworzą unikalny styl działania.]

## Twoje naturalne środowiska

[Opisz 2–3 typy środowisk, sytuacji lub ról, w których ta osoba będzie rozkwitać, korzystając ze swoich talentów. Każde z bold tytułem: **W pracy:** tekst]

## Obszary do świadomego rozwoju

[1–2 potencjalne ślepe plamki lub tendencje, na które warto zwrócić uwagę. Bez negatywnej oceny — jako informacja o balansie.]

---
*[Jedno zdanie — krótka "esencja" tego profilu talentów, np. "Jesteś osobą, która..."]*

Zasady:
- Pisz bezpośrednio do osoby, w 2. osobie
- Ton: inspirujący, wzmacniający, psychologicznie precyzyjny
- Koncentruj się na mocnych stronach i potencjale
- Zachowaj DOKŁADNIE podaną strukturę Markdown (##, **, ---, *)

${GLOBAL_GUIDELINES}`
  }

  if (testType === 'VALUES') {
    const top3 = ((report as any)?.top_3 as Array<{ name: string; name_en?: string; score?: number }> | undefined) ?? []
    const bottom3 = ((report as any)?.bottom_3 as Array<{ name: string; score?: number }> | undefined) ?? []
    const allValues = ((report as any)?.all_values as Array<{ name: string; centered_score?: number; motivational_goal?: string }> | undefined) ?? []

    const topList = top3.map((v, i) =>
      `${i + 1}. **${v.name}** (${v.name_en ?? ''}) — wynik MRAT: +${typeof v.score === 'number' ? v.score.toFixed(2) : '?'}`
    ).join('\n')

    const allRanking = allValues.map((v, i) =>
      `${i + 1}. ${v.name}: ${typeof v.centered_score === 'number' ? (v.centered_score > 0 ? '+' : '') + v.centered_score.toFixed(2) : '?'}`
    ).join(', ')

    const bottomList = bottom3.map(v => v.name).join(', ')

    return `Jesteś doświadczonym psychologiem i coachem specjalizującym się w teoriach wartości osobistych. Na podstawie wyników testu Schwartz PVQ napisz głęboką, spersonalizowaną interpretację systemu wartości w języku polskim.

Top 3 priorytety wartości (teoria Schwartza, wyniki MRAT):
${topList}

Ranking wszystkich wartości: ${allRanking}

Wartości mniej istotne: ${bottomList}

Napisz interpretację w formacie Markdown z DOKŁADNIE następującą strukturą — użyj tych nagłówków dosłownie:

## Twój kompas wartości

[2–3 zdania opisujące ogólny obraz systemu wartości tej osoby — co nim kieruje, jakie jest jej esencjalne "dlaczego" w podejmowaniu decyzji]

## Twoje fundamentalne priorytety

[Opisz 2–3 najwyższych wartości. Dla każdej: bold tytuł + 1–2 zdania pokazujące, jak ta wartość przejawia się w życiu codziennym, pracy, decyzjach i relacjach. Przykład: **Samokierowanie** Niezależność myślenia i działania to dla Ciebie nie przywilej, ale konieczność...]

## Napięcia i równowaga

[Opisz jak różne wartości mogą ze sobą współgrać lub tworzyć napięcia. Pokaż, jak ta konkretna konfiguracja wartości tworzy unikalny rdzeń osobowości.]

## Jak te wartości kształtują Twoje wybory

[2–3 konkretne obszary życia (np. praca, relacje, styl życia), w których te wartości szczególnie widać. Każdy z bold tytułem: **W pracy:** tekst]

## Wartości jako przewodnik

[Jeden motywujący akapit o tym, jak świadome rozumienie własnych wartości może wzmacniać autentyczne decyzje i poczucie sensu]

---
*[Jedno zdanie — esencja systemu wartości tej osoby, np. "Jesteś osobą, dla której..."]*

Zasady:
- Pisz bezpośrednio do osoby, w 2. osobie: "Twoje...", "Dla Ciebie..."
- Ton: refleksyjny, ciepły, psychologicznie precyzyjny — jak mądry psycholog
- Nie pisz "wyniki wskazują", "test pokazuje" itp.
- Odwołuj się do konkretnych nazw wartości z teorii Schwartza
- Zachowaj DOKŁADNIE podaną strukturę Markdown (##, **, ---, *)

${GLOBAL_GUIDELINES}`
  }

  if (testType === 'CAREER') {
    const hollandCode = (report as any)?.holland_code ?? '???'
    const top3 = ((report as any)?.top_3 as Array<{ name: string; name_en?: string; letter: string; score?: number }>) ?? []
    const allScores = (report as any)?.all_scores ?? {}
    const topList = top3.map((t, i) =>
      `${i + 1}. **${t.name}** (${t.name_en ?? ''}, litera: ${t.letter}) — wynik: ${typeof t.score === 'number' ? t.score.toFixed(2) : '?'}/5.00`
    ).join('\n')
    const allList = Object.entries(allScores)
      .sort((a: any, b: any) => (b[1] as any).raw_score - (a[1] as any).raw_score)
      .map(([, d]: any) => `${d.letter} (${d.name}): ${d.raw_score?.toFixed(2) ?? '?'}`)
      .join(', ')

    return `Jesteś doświadczonym doradcą kariery i psychologiem specjalizującym się w typologii zawodowej RIASEC (model Hollanda). Na podstawie wyników testu zainteresowań zawodowych napisz głęboką, spersonalizowaną interpretację w języku polskim.

Kod Hollanda: **${hollandCode}**
Top 3 zainteresowania:
${topList}
Wszystkie wyniki (malejąco): ${allList}

Napisz interpretację w formacie Markdown z DOKŁADNIE następującą strukturą — użyj tych nagłówków dosłownie:

## Twój profil zawodowy

[2–3 zdania opisujące ogólny obraz — co ten kod Hollanda mówi o tej osobie, jak naturalnie podchodzi do pracy i środowiska zawodowego]

## Twoje dominujące zainteresowania

[Opisz 2–3 najsilniejsze typy zainteresowań z Top 3. Dla każdego: bold tytuł + 1–2 zdania pokazujące, jak te zainteresowania przejawiają się w preferencjach zawodowych i codziennym działaniu. Przykład: **Analityk (I)** Twój umysł naturalnie szuka zrozumienia złożonych zjawisk...]

## Jak te zainteresowania współpracują

[Opisz synergię między dominującymi typami — jak razem tworzą unikalny styl pracy i podejście do kariery. Co sprawia, że ta kombinacja jest wyjątkowa i co daje tej osobie przewagę?]

## Twoje idealne środowiska pracy

[Opisz 2–3 typy środowisk, organizacji lub ról, w których ta osoba będzie się rozwijać najlepiej. Każde z bold tytułem: **W projektach badawczych:** tekst]

## Ścieżki kariery warte rozważenia

[1–2 akapity lub lista sugerująca konkretne kierunki kariery, branże lub role zawodowe pasujące do profilu. Bądź konkretny i inspirujący.]

---
*[Jedno zdanie — zawodowa "esencja" tego profilu, np. "Twoja siła zawodowa tkwi w..."]*

Zasady:
- Pisz bezpośrednio do osoby, w 2. osobie: "Twój...", "Naturalne dla Ciebie..."
- Ton: motywujący, profesjonalny, konkretny — jak dobry doradca kariery
- Nie pisz "wyniki wskazują", "test pokazuje" itp.
- Odwołuj się do kodu Hollanda i liter RIASEC w naturalny sposób
- Zachowaj DOKŁADNIE podaną strukturę Markdown (##, **, ---, *)

${GLOBAL_GUIDELINES}`
  }

  if (testType === 'CAREER_DNA') {
    const rs = (_raw_scores as any) ?? {}
    const norm = rs.normalized_scores ?? {}
    const profile = rs.profile ?? {}
    const sorted = (rs.sorted_dimensions as Array<{ id: string; score: number }>) ?? []

    const DIM_NAMES: Record<string, string> = {
      AN: 'Analityczność',
      SO: 'Praca z ludźmi',
      CR: 'Kreatywność',
      ST: 'Ustrukturyzowanie',
      LE: 'Przywództwo',
      HO: 'Praktyczność',
    }

    const dimList = sorted.map(({ id, score }: { id: string; score: number }) =>
      `${DIM_NAMES[id] ?? id}: ${score}%`
    ).join('\n')

    const profileName = profile.name ?? (report as any)?.profile_name ?? 'Nieznany'
    const profileTagline = profile.tagline ?? (report as any)?.profile_tagline ?? ''

    return `Jesteś ekspertem od doradztwa kariery. Na podstawie wyników testu DNA Kariery użytkownika, wygeneruj WYŁĄCZNIE odpowiedź jako obiekt JSON (bez żadnego dodatkowego tekstu, markdown ani wyjaśnień) w następującym formacie:

{
  "opis": "2-3 zdania opisujące tę osobę zawodowo, jej naturalne predyspozycje i styl pracy",
  "zawody": [
    { "nazwa": "Nazwa zawodu/roli", "uzasadnienie": "1 zdanie dlaczego pasuje do profilu" },
    ... (6 zawodów łącznie)
  ],
  "kursy": [
    { "nazwa": "Nazwa kursu", "platforma": "Udemy / Coursera / LinkedIn Learning / inne", "poziom": "Początkujący / Średniozaawansowany / Zaawansowany" },
    ... (4 kursy łącznie)
  ],
  "czego_unikac": "1 zdanie opisujące typy ról lub środowisk pracy, które mogą nie odpowiadać temu profilowi"
}

Dane użytkownika:
- Profil DNA Kariery: **${profileName}** — ${profileTagline}
- Wyniki wymiarów (0-100%):
${dimList}

Zasady:
- Odpowiedź MUSI być poprawnym JSON-em, bez żadnego tekstu przed ani po
- Zawody powinny być konkretne i zróżnicowane (różne branże)
- Kursy powinny być prawdziwymi, istniejącymi kursami z popularnych platform
- Pisz po polsku, w stylu motywującym i profesjonalnym
- Dopasuj rekomendacje ściśle do dominujących wymiarów (${sorted.slice(0,2).map((d: any) => DIM_NAMES[d.id] ?? d.id).join(', ')})`
  }

  return `Napisz krótką interpretację wyników psychometrycznych dla testu "${testType}" w języku polskim.

${GLOBAL_GUIDELINES}`
}
