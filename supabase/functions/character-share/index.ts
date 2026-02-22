import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type CreateRequest = { action: 'create' }

type FetchRequest = { action: 'fetch'; token: string }

type ReqBody = CreateRequest | FetchRequest | { action?: string; token?: unknown }

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!url || !anonKey || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json().catch(() => ({}))) as ReqBody
    const action = String((body as any)?.action ?? '')

    const service = createClient(url, serviceKey)

    if (action === 'create') {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const authed = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } })
      const {
        data: { user },
        error: userError,
      } = await authed.auth.getUser()

      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const token = crypto.randomUUID()

      const { error: upErr } = await service
        .from('profiles')
        .update({ share_token: token })
        .eq('id', user.id)

      if (upErr) {
        return new Response(JSON.stringify({ error: 'Failed to save token' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ token }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'fetch') {
      const token = String((body as any)?.token ?? '').trim()
      if (!token) {
        return new Response(JSON.stringify({ error: 'Missing token' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: profile, error: pErr } = await service
        .from('profiles')
        .select('id, full_name, avatar_url, is_premium')
        .eq('share_token', token)
        .maybeSingle()

      if (pErr || !profile?.id) {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Enrich name/avatar from auth.users metadata when profile table has nulls
      let fullName: string | null = profile.full_name ?? null
      let avatarUrl: string | null = profile.avatar_url ?? null
      if (!fullName || !avatarUrl) {
        const { data: authUser } = await service.auth.admin.getUserById(profile.id)
        const meta = (authUser?.user?.user_metadata ?? {}) as Record<string, unknown>
        if (!fullName) fullName = (meta.full_name as string) || (meta.name as string) || null
        if (!avatarUrl) avatarUrl = (meta.avatar_url as string) || (meta.picture as string) || null
      }

      const { data: psychometrics } = await service
        .from('user_psychometrics')
        .select('test_type, raw_scores, percentile_scores, report, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

      const { data: cache } = await service
        .from('character_card_cache')
        .select('generated_at, content')
        .eq('user_id', profile.id)
        .maybeSingle()

      return new Response(
        JSON.stringify({
          user_id: profile.id,
          profile: {
            full_name: fullName,
            avatar_url: avatarUrl,
            is_premium: profile.is_premium ?? false,
          },
          psychometrics: psychometrics ?? [],
          character_card_cache: cache ?? null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
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
