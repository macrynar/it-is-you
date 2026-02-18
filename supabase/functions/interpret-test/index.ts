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
    const { test_type, percentile_scores, raw_scores } = await req.json()

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
    const prompt = buildPrompt(test_type, percentile_scores, raw_scores)

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
        max_tokens: 900
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

function buildPrompt(testType: string, percentile_scores: Record<string, number>, _raw_scores: Record<string, number>): string {
  if (testType === 'HEXACO') {
    const H = Math.round(percentile_scores.honesty_humility ?? 50)
    const E = Math.round(percentile_scores.emotionality ?? 50)
    const X = Math.round(percentile_scores.extraversion ?? 50)
    const A = Math.round(percentile_scores.agreeableness ?? 50)
    const C = Math.round(percentile_scores.conscientiousness ?? 50)
    const O = Math.round(percentile_scores.openness ?? 50)

    return `Jesteś doświadczonym psychologiem specjalizującym się w psychologii osobowości. Na podstawie wyników testu HEXACO-60 napisz szczegółową, narracyjną interpretację osobowości tej osoby w języku polskim.

Wyniki (skala percentylowa 0–100, gdzie 50 = dokładna średnia populacji):
- Uczciwość-Pokora (Honesty-Humility): ${H}%
- Emocjonalność (Emotionality): ${E}%
- Ekstrawersja (Extraversion): ${X}%
- Ugodowość (Agreeableness): ${A}%
- Sumienność (Conscientiousness): ${C}%
- Otwartość na doświadczenia (Openness): ${O}%

Napisz interpretację złożoną z 4 akapitów:
1. Ogólny profil osobowości — co te wyniki mówią o tej osobie jako całości
2. Mocne strony i dominujące cechy — co wyróżnia tę osobę positywnie (skup się na 2–3 cechach z najwyższymi wynikami)
3. Obszary do refleksji i rozwoju — co sprawia wyzwanie (skup się na cechach z niższymi wynikami, bez oceniania)
4. Praktyczne wskazówki — jedno konkretne zalecenie dotyczące relacji, pracy lub samorozwoju

Zasady pisania:
- Pisz bezpośrednio do osoby, w 2. osobie: "Twój profil...", "Wykazujesz...", "Masz tendencję do..."
- Nie używaj sformułowań takich jak "wyniki testu wskazują", "na podstawie testu"
- Bądź ciepły, precyzyjny psychologicznie i konkretny — unikaj ogólników
- Każdy akapit ma 3–5 zdań
- Nie używaj list punktowych — piszez ciągłym tekstem
- Na samym końcu (po pustej linii, po ostatnim akapicie) dodaj jedną kursywę: jedno zdanie będące psychologiczną "esencją" profilu, np. *Twoja siła tkwi w...*`
  }

  return `Napisz krótką interpretację wyników psychometrycznych dla testu "${testType}" na podstawie danych: ${JSON.stringify(percentile_scores)}`
}
