import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Client Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Sign up at https://supabase.com
 * 2. Create a new project
 * 3. Go to Project Settings > API
 * 4. Copy your URL and anon key
 * 5. Create .env.local file in project root:
 *    VITE_SUPABASE_URL=your-url
 *    VITE_SUPABASE_ANON_KEY=your-key
 */

// Hardcoded fallback values (safe to commit - anon key is public)
const FALLBACK_URL = 'https://uvzilorpyuqicuwkufky.supabase.co'
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2emlsb3JweXVxaWN1d2t1Zmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDQzNTAsImV4cCI6MjA4NjkyMDM1MH0.jNIkqASHNl_7WbLq0jBZ86kRDmRP2jzIbI-db9l9teA'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY

// Debug log for production
console.log('🔧 Supabase Config Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlPrefix: supabaseUrl?.slice(0, 30) + '...',
  env: import.meta.env.MODE,
  usingFallback: !import.meta.env.VITE_SUPABASE_URL
})

/**
 * Initialize Supabase client
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Canonical app URL used for OAuth callback redirects.
 * In production this reads VITE_APP_URL from .env.production (https://it-is-you1.vercel.app).
 * Falls back to window.location.origin for local development / any other environment.
 */
const APP_URL = import.meta.env.VITE_APP_URL?.replace(/\/$/, '') || window.location.origin

/**
 * Helper function to sign in with Google
 */
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${APP_URL}/auth/callback`,
      },
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Google sign-in error:', error)
    return { data: null, error }
  }
}

/**
 * Helper function to sign in with Facebook
 */
export const signInWithFacebook = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${APP_URL}/auth/callback`,
      },
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Facebook sign-in error:', error)
    return { data: null, error }
  }
}

/**
 * Helper function to sign in with Apple
 */
export const signInWithApple = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${APP_URL}/auth/callback`,
      },
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Apple sign-in error:', error)
    return { data: null, error }
  }
}

/**
 * Helper function to sign in with Email + Password
 */
export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Email sign-in error:', error)
    return { data: null, error }
  }
}

/**
 * Helper function to sign up with Email + Password
 */
export const signUpWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${APP_URL}/auth/callback`,
      },
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Email sign-up error:', error)
    return { data: null, error }
  }
}

/**
 * Helper function to send Magic Link
 */
export const signInWithMagicLink = async (email) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${APP_URL}/auth/callback`,
      },
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Magic link error:', error)
    return { data: null, error }
  }
}

/**
 * Helper function to sign out
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Sign out error:', error)
    return { error }
  }
}

/**
 * Helper function to get current user session
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) throw error
    return { user, error: null }
  } catch (error) {
    console.error('Get current user error:', error)
    return { user: null, error }
  }
}

/**
 * Helper function to listen to auth state changes
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback({ event, session })
  })
}
