import { useState, useEffect } from 'react'
import { getUserPremiumStatus } from '../lib/stripeService'

/**
 * React hook that resolves the current user's premium status.
 * Uses getUserPremiumStatus() from stripeService which reads profiles table.
 */
export function useIsPremium(): { isPremium: boolean; loading: boolean } {
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserPremiumStatus().then((status) => {
      setIsPremium(status?.isPremium ?? false)
      setLoading(false)
    })
  }, [])

  return { isPremium, loading }
}
