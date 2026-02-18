import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { test_type, percentile_scores, raw_scores, report } = await req.json()

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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Admin client for cache reads/writes (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check interpretation cache
    const { data: cached } = await supabaseAdmin
      .from('ai_interpretations')
      .select('interpretation')
      .eq('user_id', user.id)
      .eq('test_type', test_type)
      .single()

    if (cached?.interpretation) {
      return new Response(JSON.stringify({ interpretation: cached.interpretation, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
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
      interpretation
    }, { onConflict: 'user_id,test_type' })

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
- Zachowaj DOKŁADNIE podaną strukturę Markdown (##, **, ---, *)`
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
- Zachowaj DOKŁADNIE podaną strukturę Markdown (##, **, ---, *)`
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
- Zachowaj DOKŁADNIE podaną strukturę Markdown (##, **, ---, *)`
  }

  return `Napisz krótką interpretację wyników psychometrycznych dla testu "${testType}" w języku polskim.`
}
