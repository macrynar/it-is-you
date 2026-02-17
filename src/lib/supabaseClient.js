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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug log for production (will be removed after verification)
console.log('🔧 Supabase Config Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlPrefix: supabaseUrl?.slice(0, 30) + '...',
  env: import.meta.env.MODE
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Supabase configuration missing!',
    'VITE_SUPABASE_URL:', supabaseUrl,
    'VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '[EXISTS]' : '[MISSING]'
  )
  throw new Error('Missing Supabase environment variables. Check Vercel Settings → Environment Variables')
}

/**
 * Initialize Supabase client
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Helper function to sign in with Google
 */
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
        redirectTo: `${window.location.origin}/auth/callback`,
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
        redirectTo: `${window.location.origin}/auth/callback`,
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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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
