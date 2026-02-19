// ============================================================
// Edge Function: create-checkout-session
// POST /functions/v1/create-checkout-session
// Body: { price_id?: string }
// Returns: { url: string }
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

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

    // ── 2. Parse request body ───────────────────────────────
    const body = await req.json().catch(() => ({}))
    const action: string = body.action ?? 'create'

    // ── Admin client (bypass RLS) ────────────────────────────
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-04-10',
    })

    // ══════════════════════════════════════════════════════════
    // ACTION: verify — called after returning from Stripe
    // ══════════════════════════════════════════════════════════
    if (action === 'verify') {
      const sessionId: string = body.session_id ?? ''
      if (!sessionId || !sessionId.startsWith('cs_')) {
        return json({ error: 'Invalid session_id' }, 400)
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId)

      // Verify this session belongs to the requesting user
      if (session.metadata?.supabase_user_id !== user.id) {
        return json({ error: 'Session does not belong to this user' }, 403)
      }

      if (session.payment_status !== 'paid') {
        return json({ is_premium: false, reason: 'payment_not_completed' })
      }

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
        console.error('[verify] DB upsert error:', upsertError)
        return json({ error: 'DB update failed' }, 500)
      }

      console.log(`[verify] User ${user.id} upgraded to Premium ✅`)
      return json({ is_premium: true })
    }

    // ══════════════════════════════════════════════════════════
    // ACTION: create (default) — create Stripe Checkout session
    // ══════════════════════════════════════════════════════════
    const priceId: string =
      body.price_id ?? Deno.env.get('STRIPE_DARK_TRIAD_PRICE_ID') ?? ''

    if (!priceId) {
      return json({ error: 'No Stripe Price ID configured. Set STRIPE_DARK_TRIAD_PRICE_ID secret.' }, 500)
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, is_premium')
      .eq('id', user.id)
      .single()

    if (profile?.is_premium) {
      return json({ error: 'User is already premium' }, 400)
    }

    let customerId: string = profile?.stripe_customer_id ?? ''

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await supabaseAdmin
        .from('profiles')
        .upsert(
          { id: user.id, email: user.email, stripe_customer_id: customerId },
          { onConflict: 'id' }
        )
    }

    // ── 6. Create Checkout Session ──────────────────────────
    // Strip trailing slash to avoid double-slash in redirect URLs
    const appUrl = (Deno.env.get('APP_URL') ?? 'https://psycher.vercel.app').replace(/\/$/, '')

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',              // one-time payment (change to 'subscription' if recurring)
      success_url: `${appUrl}/user-profile-tests.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/user-profile-tests.html?payment=cancelled`,
      metadata: { supabase_user_id: user.id },
      allow_promotion_codes: true,
    })

    return json({ url: session.url })
  } catch (err) {
    console.error('[create-checkout-session] Error:', err)
    return json({ error: (err as Error).message }, 500)
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
