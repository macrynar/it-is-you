// ============================================================
// Edge Function: create-checkout-session
// POST /functions/v1/create-checkout-session
// Body: { price_id?: string }
// Returns: { url: string }
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

    // ── 2. Parse request body ───────────────────────────────
    const body = await req.json().catch(() => ({}))
    // Default price: Dark Triad SD3 one-time access
    // Set STRIPE_DARK_TRIAD_PRICE_ID in Supabase Edge Function secrets
    const priceId: string =
      body.price_id ?? Deno.env.get('STRIPE_DARK_TRIAD_PRICE_ID') ?? ''

    if (!priceId) {
      return json({ error: 'No Stripe Price ID configured. Set STRIPE_DARK_TRIAD_PRICE_ID secret.' }, 500)
    }

    // ── 3. Init Stripe ──────────────────────────────────────
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      // @ts-ignore – Deno compat
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: '2024-04-10',
    })

    // ── 4. Admin client (bypass RLS) ────────────────────────
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // ── 5. Get or create Stripe customer ────────────────────
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
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // ── 6. Create Checkout Session ──────────────────────────
    const appUrl = Deno.env.get('APP_URL') ?? 'https://psycher.vercel.app'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',              // one-time payment (change to 'subscription' if recurring)
      success_url: `${appUrl}/user-profile-tests.html?payment=success`,
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
