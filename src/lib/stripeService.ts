// ============================================================
// stripeService.ts
// Handles Stripe Checkout from the React frontend.
// ============================================================

import { supabase } from './supabaseClient.js'

const SUPABASE_URL = 'https://uvzilorpyuqicuwkufky.supabase.co'

// ── Types ───────────────────────────────────────────────────────────────────

export interface UserPremiumStatus {
  isPremium: boolean
  subscriptionStatus: string | null
  stripeCustomerId: string | null
}

// ── Fetch premium status ─────────────────────────────────────────────────────

/**
 * Returns the current user's premium status from the `profiles` table.
 * Returns null when not authenticated.
 */
export async function getUserPremiumStatus(): Promise<UserPremiumStatus | null> {
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('is_premium, subscription_status, stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('[stripeService] Error fetching profile:', error)
    return null
  }

  return {
    isPremium:          data?.is_premium ?? false,
    subscriptionStatus: data?.subscription_status ?? null,
    stripeCustomerId:   data?.stripe_customer_id ?? null,
  }
}

// ── Checkout ─────────────────────────────────────────────────────────────────

/**
 * Creates a Stripe Checkout session for the Dark Triad SD3 unlock
 * and redirects the user to the Stripe payment page.
 *
 * Optionally pass a `priceId` to override the default price configured
 * via the STRIPE_DARK_TRIAD_PRICE_ID edge-function secret.
 */
export async function handleUpgradeToPremium(priceId?: string): Promise<void> {
  try {
    const { data: { session }, error: sessionErr } = await supabase.auth.getSession()
    if (sessionErr || !session?.access_token) {
      alert('Musisz być zalogowany, aby przejść na konto Premium.')
      return
    }

    // Call the Edge Function
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(priceId ? { price_id: priceId } : {}),
      }
    )

    const result = await response.json()

    if (!response.ok || !result.url) {
      console.error('[stripeService] Checkout session error:', result)
      alert(`Błąd podczas tworzenia sesji płatności: ${result.error ?? 'Nieznany błąd'}`)
      return
    }

    // Redirect to Stripe Checkout
    window.location.href = result.url
  } catch (err) {
    console.error('[stripeService] Unexpected error:', err)
    alert('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.')
  }
}
