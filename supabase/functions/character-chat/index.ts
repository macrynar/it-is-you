import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SYSTEM_PROMPT } from './prompt.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type ChatRole = 'user' | 'assistant'

type IncomingMessage = {
  role: ChatRole
  content: string
}

function enforceAlexFormat(raw: string, maxSentences = 3): string {
  const text = String(raw ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/^\s*[-*•]+\s+/gm, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return ''

  let endIndex = text.length
  let sentenceCount = 0

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '.' || ch === '!' || ch === '?') {
      const next = text[i + 1]
      const boundary = next === undefined || next === ' ' || next === '"' || next === ')' || next === '”'
      if (boundary) {
        sentenceCount += 1
        if (sentenceCount >= maxSentences) {
          endIndex = i + 1
          break
        }
      }
    }
  }

  return text.slice(0, endIndex).trim()
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, profile_context } = await req.json()

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

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

    const safeMessages: IncomingMessage[] = Array.isArray(messages)
      ? messages
          .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant'))
          .map((m: any) => ({
            role: m.role as ChatRole,
            content: String(m.content ?? '').slice(0, 4000),
          }))
      : []

    const context = typeof profile_context === 'string' ? profile_context.slice(0, 12000) : ''

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openaiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'system',
        content:
          'Dostaniesz też PROFILE_CONTEXT (wyniki i metadane profilu) — to jest źródło prawdy o rezultatach użytkownika. Używaj go do personalizacji i do odpowiadania na pytania o wyniki (podawaj konkretne liczby/pozycje, jeśli są w kontekście). Jeśli w kontekście brakuje danych, powiedz wprost czego brakuje i zadaj jedno konkretne pytanie tylko jeśli jest to konieczne do dalszej analizy. Format odpowiedzi nadal obowiązuje: maksymalnie 3 zdania, bez list, bez nagłówków, jeden akapit.',
      },
    ]

    if (context) {
      openaiMessages.push({
        role: 'system',
        content: `PROFILE_CONTEXT:\n${context}`,
      })
    }

    if (safeMessages.length === 0) {
      openaiMessages.push({
        role: 'user',
        content: 'Zacznij rozmowę zgodnie z zasadami. ',
      })
    } else {
      openaiMessages.push(...safeMessages)
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        temperature: 0.6,
        max_tokens: 220,
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
    const reply = enforceAlexFormat(openaiData.choices?.[0]?.message?.content ?? '')

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Edge function error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
