// ============================================================
// Edge Function: verify-payment
// POST /functions/v1/verify-payment
// Body: { session_id: string }
// Verifies Stripe payment and sets is_premium=true for user
// Called from frontend after returning from Stripe Checkout
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── 1. Authenticate user ────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // ── 2. Parse session_id ─────────────────────────────────
    const body = await req.json().catch(() => ({}))
    const sessionId: string = body.session_id ?? ''

    if (!sessionId || !sessionId.startsWith('cs_')) {
      return json({ error: 'Invalid session_id' }, 400)
    }

    // ── 3. Verify payment with Stripe ───────────────────────
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      // @ts-ignore – Deno compat
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: '2024-04-10',
    })

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify the session belongs to this user
    const sessionUserId = session.metadata?.supabase_user_id
    if (sessionUserId !== user.id) {
      console.error(`[verify-payment] User mismatch: ${user.id} vs ${sessionUserId}`)
      return json({ error: 'Session does not belong to this user' }, 403)
    }

    // Verify payment was actually completed
    if (session.payment_status !== 'paid') {
      console.log(`[verify-payment] Payment not completed yet: ${session.payment_status}`)
      return json({ is_premium: false, reason: 'payment_not_completed' }, 200)
    }

    // ── 4. Update profiles with admin client (bypasses RLS) ─
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        is_premium: true,
        stripe_customer_id: session.customer as string,
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (upsertError) {
      console.error('[verify-payment] DB upsert error:', upsertError)
      return json({ error: 'DB update failed', detail: upsertError.message }, 500)
    }

    console.log(`[verify-payment] User ${user.id} upgraded to Premium ✅`)
    return json({ is_premium: true })

  } catch (err) {
    console.error('[verify-payment] Error:', err)
    return json({ error: (err as Error).message }, 500)
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
