import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SYSTEM_PROMPT } from './prompt.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type CharacterCardContent = {
  archetype_name: string
  archetype_subtitle: string
  tags_fundamental: string[]
  tags_style: string[]
  tags_values: string[]
  hexaco_interpretations: {
    honesty_humility: string
    emotionality: string
    extraversion: string
    agreeableness: string
    conscientiousness: string
    openness: string
  }
  enneagram_motivation_text: string
  strengths_top1_interpretation: string
  riasec_environment_text: string
  schwartz_values_text: string
  portrait_essence: string
  portrait_environment: string
  portrait_superpowers: string
  portrait_blindspots: string
  darktriad_synthesis: string
  popculture: Array<{ context: string; name: string; reason: string }>
}

function extractJson(text: string): string {
  const s = String(text ?? '').trim()
  if (!s) return ''
  if (s.startsWith('{') && s.endsWith('}')) return s
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start >= 0 && end > start) return s.slice(start, end + 1)
  return ''
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => ({}))
    const force = Boolean((body as any)?.force)
    const input = (body as any)?.input ?? null

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      const reason = userError?.message ?? 'No user from auth token'
      return new Response(JSON.stringify({ error: 'Unauthorized', reason }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!force) {
      const { data: cached, error: cacheErr } = await supabaseClient
        .from('character_card_cache')
        .select('generated_at, content')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!cacheErr && cached?.content) {
        return new Response(
          JSON.stringify({ from_cache: true, generated_at: cached.generated_at, content: cached.content }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const schemaHint = {
      archetype_name: 'string',
      archetype_subtitle: 'string',
      tags_fundamental: ['string'],
      tags_style: ['string'],
      tags_values: ['string'],
      hexaco_interpretations: {
        honesty_humility: 'string',
        emotionality: 'string',
        extraversion: 'string',
        agreeableness: 'string',
        conscientiousness: 'string',
        openness: 'string',
      },
      enneagram_motivation_text: 'string',
      strengths_top1_interpretation: 'string',
      riasec_environment_text: 'string',
      schwartz_values_text: 'string',
      portrait_essence: 'string',
      portrait_environment: 'string',
      portrait_superpowers: 'string',
      portrait_blindspots: 'string',
      darktriad_synthesis: 'string',
      popculture: [{ context: 'string', name: 'string', reason: 'string' }],
    }

    const userPayload = {
      user_id: user.id,
      input,
      schema: schemaHint,
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        max_tokens: 900,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content:
              'Wygeneruj JSON zgodny ze schematem. Dane wejściowe i schemat poniżej. Zwróć WYŁĄCZNIE JSON.\n\n' +
              JSON.stringify(userPayload),
          },
        ],
      }),
    })

    if (!openaiRes.ok) {
      const errText = await openaiRes.text()
      console.error('OpenAI error:', errText)
      return new Response(JSON.stringify({ error: 'LLM request failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openaiData = await openaiRes.json()
    const rawText = String(openaiData.choices?.[0]?.message?.content ?? '')
    const jsonText = extractJson(rawText)

    let content: CharacterCardContent | null = null
    try {
      content = JSON.parse(jsonText) as CharacterCardContent
    } catch (_e) {
      content = null
    }

    if (!content) {
      console.error('LLM returned non-JSON:', rawText)
      return new Response(JSON.stringify({ error: 'LLM returned invalid JSON' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const generatedAt = new Date().toISOString()

    const { error: upsertErr } = await supabaseClient
      .from('character_card_cache')
      .upsert({ user_id: user.id, generated_at: generatedAt, content }, { onConflict: 'user_id' })

    if (upsertErr) {
      console.error('Cache upsert error:', upsertErr)
    }

    return new Response(
      JSON.stringify({ from_cache: false, generated_at: generatedAt, content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('Edge function error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
