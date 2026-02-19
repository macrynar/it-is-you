// ============================================================
// Edge Function: stripe-webhook
// POST /functions/v1/stripe-webhook
// Verifies Stripe signature, handles events, updates DB
//
// Required secrets (set via: supabase secrets set KEY=value):
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  // @ts-ignore – Deno compat
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2024-04-10',
})

serve(async (req) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // ── 1. Read raw body for signature verification ──────────
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  // ── 2. Verify webhook signature ──────────────────────────
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    )
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err)
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 })
  }

  console.log(`[stripe-webhook] Received event: ${event.type}`)

  // ── 3. Admin Supabase client (bypasses RLS) ──────────────
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // ── 4. Handle events ─────────────────────────────────────
  switch (event.type) {
    // ── One-time payment completed ──
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId  = session.metadata?.supabase_user_id
      const customerId = session.customer as string

      if (!userId) {
        console.error('[stripe-webhook] checkout.session.completed: missing supabase_user_id in metadata')
        break
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          is_premium:           true,
          stripe_customer_id:   customerId,
          stripe_subscription_id: session.subscription as string | null,
          subscription_status:  'active',
          updated_at:           new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) {
        console.error('[stripe-webhook] DB update error (checkout.session.completed):', error)
      } else {
        console.log(`[stripe-webhook] User ${userId} upgraded to Premium ✅`)
      }
      break
    }

    // ── Subscription status changed ──
    case 'customer.subscription.updated': {
      const sub        = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const status     = sub.status          // 'active' | 'canceled' | 'past_due' | ...
      const isPremium  = status === 'active' || status === 'trialing'

      const { error } = await supabase
        .from('profiles')
        .update({
          stripe_subscription_id: sub.id,
          subscription_status:    status,
          is_premium:             isPremium,
          updated_at:             new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId)

      if (error) {
        console.error('[stripe-webhook] DB update error (customer.subscription.updated):', error)
      } else {
        console.log(`[stripe-webhook] Subscription ${sub.id} updated → status=${status}, isPremium=${isPremium}`)
      }
      break
    }

    // ── Subscription cancelled / deleted ──
    case 'customer.subscription.deleted': {
      const sub        = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status:    'canceled',
          is_premium:             false,
          stripe_subscription_id: null,
          updated_at:             new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId)

      if (error) {
        console.error('[stripe-webhook] DB update error (customer.subscription.deleted):', error)
      } else {
        console.log(`[stripe-webhook] Subscription cancelled for customer ${customerId}`)
      }
      break
    }

    // ── Invoice payment failed ──
    case 'invoice.payment_failed': {
      const invoice    = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      await supabase
        .from('profiles')
        .update({
          subscription_status: 'past_due',
          is_premium:          false,
          updated_at:          new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId)

      console.log(`[stripe-webhook] Payment failed for customer ${customerId}`)
      break
    }

    default:
      console.log(`[stripe-webhook] Unhandled event type: ${event.type}`)
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
