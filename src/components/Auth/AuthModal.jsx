import React, { useState, useEffect } from 'react'
import { Mail, Eye, EyeOff, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { 
  signInWithGoogle, 
  signInWithFacebook, 
  signInWithApple, 
  signInWithEmail,
  signUpWithEmail,
  signInWithMagicLink 
} from '../../lib/supabaseClient'

/**
 * AuthModal Component
 * Cyberpunk-style authentication portal with Glassmorphism design
 * 
 * Features:
 * - OAuth: Google, Facebook, Apple
 * - Email + Password login/signup
 * - Magic Link option
 * - Individual loading states per button
 * - Error handling with user feedback
 * - Smooth animations and transitions
 */
export default function AuthModal({ onAuthSuccess = () => {} }) {
  // ============ STATE MANAGEMENT ============
  const [currentTab, setCurrentTab] = useState('login') // 'login', 'signup', 'magic-link'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [generalError, setGeneralError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Loading states for each provider
  const [loadingStates, setLoadingStates] = useState({
    google: false,
    facebook: false,
    apple: false,
    email: false,
    magicLink: false,
  })

  // Reset messages on tab change
  useEffect(() => {
    setGeneralError(null)
    setSuccessMessage(null)
    setEmail('')
    setPassword('')
  }, [currentTab])

  // ============ HELPER FUNCTIONS ============
  const setLoading = (provider, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [provider]: isLoading
    }))
  }

  const isAnyLoading = Object.values(loadingStates).some(state => state)

  // Helper function to handle post-auth redirect
  const redirectAfterAuth = () => {
    const intendedDestination = sessionStorage.getItem('redirect_after_auth')
    if (intendedDestination) {
      sessionStorage.removeItem('redirect_after_auth')
      window.location.href = intendedDestination
    } else {
      window.location.href = '/user-profile-tests.html'
    }
  }

  // ============ AUTH HANDLERS ============
  const handleGoogleSignIn = async () => {
    setLoading('google', true)
    setGeneralError(null)

    const { data, error } = await signInWithGoogle()

    if (error) {
      setGeneralError(`Google sign-in error: ${error.message}`)
      setLoading('google', false)
    } else {
      setSuccessMessage('Redirecting to Google...')
    }
  }

  const handleFacebookSignIn = async () => {
    setLoading('facebook', true)
    setGeneralError(null)

    const { data, error } = await signInWithFacebook()

    if (error) {
      setGeneralError(`Facebook sign-in error: ${error.message}`)
      setLoading('facebook', false)
    } else {
      setSuccessMessage('Redirecting to Facebook...')
    }
  }

  const handleAppleSignIn = async () => {
    setLoading('apple', true)
    setGeneralError(null)

    const { data, error } = await signInWithApple()

    if (error) {
      setGeneralError(`Apple sign-in error: ${error.message}`)
      setLoading('apple', false)
    } else {
      setSuccessMessage('Redirecting to Apple...')
    }
  }

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    setGeneralError(null)
    setSuccessMessage(null)

    // Validation
    if (!email || !password) {
      setGeneralError('Email and password are required')
      return
    }

    if (!email.includes('@')) {
      setGeneralError('Please enter a valid email address')
      return
    }

    if (password.length < 6) {
      setGeneralError('Password must be at least 6 characters')
      return
    }

    setLoading('email', true)
    const { data, error } = await signInWithEmail(email, password)

    if (error) {
      // Better error messages
      let errorMessage = error.message
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Nieprawidłowy email lub hasło. Jeśli dopiero się zarejestrowałeś, sprawdź czy potwierdziłeś email.'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Potwierdź swój email zanim się zalogujesz. Sprawdź skrzynkę pocztową.'
      }
      setGeneralError(errorMessage)
      setLoading('email', false)
    } else if (!data.session) {
      // No session despite successful login - email confirmation required
      setGeneralError('Potwierdź swój email przed zalogowaniem. Sprawdź skrzynkę pocztową.')
      setLoading('email', false)
    } else {
      // Store auth data in localStorage
      localStorage.setItem('auth_token', data.session.access_token || 'authenticated')
      localStorage.setItem('user_email', data.user?.email || '')
      localStorage.setItem('user_session', JSON.stringify(data.user))
      
      setSuccessMessage('Sign in successful! Redirecting...')
      setTimeout(() => {
        redirectAfterAuth()
      }, 1500)
    }
  }

  const handleEmailSignUp = async (e) => {
    e.preventDefault()
    setGeneralError(null)
    setSuccessMessage(null)

    // Validation
    if (!email || !password) {
      setGeneralError('Email and password are required')
      return
    }

    if (!email.includes('@')) {
      setGeneralError('Please enter a valid email address')
      return
    }

    if (password.length < 6) {
      setGeneralError('Password must be at least 6 characters')
      return
    }

    setLoading('email', true)
    const { data, error } = await signUpWithEmail(email, password)

    if (error) {
      setGeneralError(`Sign up error: ${error.message}`)
      setLoading('email', false)
    } else {
      // Check if email confirmation is required
      if (data.session) {
        // Session exists - user can login immediately
        localStorage.setItem('auth_token', data.session.access_token || 'authenticated')
        localStorage.setItem('user_email', data.user?.email || '')
        localStorage.setItem('user_session', JSON.stringify(data.user))
        
        setSuccessMessage('Sign up successful! Redirecting...')
        setTimeout(() => {
          redirectAfterAuth()
        }, 1500)
      } else {
        // No session - email confirmation required
        setLoading('email', false)
        setSuccessMessage(
          'Registration successful! Please check your email to confirm your account before logging in.'
        )
        // Switch to login tab after 3 seconds
        setTimeout(() => {
          setActiveTab('login')
          setSuccessMessage(null)
        }, 5000)
      }
    }
  }

  const handleMagicLink = async (e) => {
    e.preventDefault()
    setGeneralError(null)
    setSuccessMessage(null)

    if (!email) {
      setGeneralError('Email is required')
      return
    }

    if (!email.includes('@')) {
      setGeneralError('Please enter a valid email address')
      return
    }

    setLoading('magicLink', true)
    const { data, error } = await signInWithMagicLink(email)

    if (error) {
      setGeneralError(`Magic link error: ${error.message}`)
      setLoading('magicLink', false)
    } else {
      setSuccessMessage('Magic link sent! Check your email.')
      setEmail('')
    }
  }

  // ============ RENDER ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Main Modal */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold brand-font mb-2 bg-gradient-to-r from-white via-indigo-300 to-white bg-clip-text text-transparent">
            It Is You
          </h1>
          <p className="text-slate-400 text-sm">Portal do Twojej Duszy</p>
          <p className="text-slate-500 text-xs mt-1">Zaloguj się aby odkryć kim naprawdę jesteś</p>
        </div>

        {/* Glass Panel */}
        <div className="glass-panel p-8 rounded-2xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-slate-900/20 p-1 rounded-lg">
            <button
              onClick={() => setCurrentTab('login')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                currentTab === 'login'
                  ? 'bg-indigo-500/40 text-white border border-indigo-400/50'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Logowanie
            </button>
            <button
              onClick={() => setCurrentTab('signup')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                currentTab === 'signup'
                  ? 'bg-indigo-500/40 text-white border border-indigo-400/50'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Rejestracja
            </button>
            <button
              onClick={() => setCurrentTab('magic-link')}
              className={`flex-1 py-2 px-4 rounded-md transition-all text-xs ${
                currentTab === 'magic-link'
                  ? 'bg-indigo-500/40 text-white border border-indigo-400/50'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* Error Message */}
          {generalError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3 items-start animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{generalError}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex gap-3 items-start animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-300 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isAnyLoading}
              className="glass-button py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loadingStates.google ? (
                <Loader className="w-5 h-5 animate-spin-slow" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-xs font-medium text-white">Google</span>
                </>
              )}
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookSignIn}
              disabled={isAnyLoading}
              className="glass-button py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingStates.facebook ? (
                <Loader className="w-5 h-5 animate-spin-slow" />
              ) : (
                <>
                  <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-xs font-medium text-white">Facebook</span>
                </>
              )}
            </button>

            {/* Apple */}
            <button
              onClick={handleAppleSignIn}
              disabled={isAnyLoading}
              className="glass-button py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingStates.apple ? (
                <Loader className="w-5 h-5 animate-spin-slow" />
              ) : (
                <>
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.12-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.05 2.29.89 3.08.89.79 0 2.33-1.1 3.8-.92 2.08.18 2.87 2.11 2.86 2.12-1.72 1.08-1.38 3.59.3 4.28-1.15 1.43-2.27 1.94-3.84 2.16m-9.52-5.48c-1.12-1.55-.04-3.62 1.31-3.82 1.48-.23 2.83.82 2.76 3.66-1.79 1.38-3.92.05-4.07-3.84z"/>
                  </svg>
                  <span className="text-xs font-medium text-white">Apple</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-400">lub</span>
            </div>
          </div>

          {/* Email/Password Login */}
          {currentTab === 'login' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj@email.com"
                    className="w-full bg-slate-900/30 border border-slate-700/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    disabled={isAnyLoading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Hasło
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/30 border border-slate-700/50 rounded-lg px-4 py-3 pr-10 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    disabled={isAnyLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                    disabled={isAnyLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAnyLoading}
                className="w-full glass-button py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStates.email ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin-slow" />
                    Logowanie...
                  </>
                ) : (
                  'Zaloguj się'
                )}
              </button>
            </form>
          )}

          {/* Email/Password Signup */}
          {currentTab === 'signup' && (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj@email.com"
                    className="w-full bg-slate-900/30 border border-slate-700/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    disabled={isAnyLoading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Hasło (min. 6 znaków)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/30 border border-slate-700/50 rounded-lg px-4 py-3 pr-10 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    disabled={isAnyLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                    disabled={isAnyLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAnyLoading}
                className="w-full glass-button py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStates.email ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin-slow" />
                    Rejestracja...
                  </>
                ) : (
                  'Utwórz konto'
                )}
              </button>

              {/* Terms */}
              <p className="text-xs text-slate-500 text-center">
                Rejestrując się, akceptujesz nasze{' '}
                <a href="#" className="text-indigo-400 hover:text-indigo-300">
                  warunki użytkowania
                </a>
              </p>
            </form>
          )}

          {/* Magic Link */}
          {currentTab === 'magic-link' && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <p className="text-sm text-slate-400 mb-4">
                Wyślemy Ci "magiczny link" na email - wystarczy kliknąć aby się zalogować.
              </p>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj@email.com"
                    className="w-full bg-slate-900/30 border border-slate-700/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    disabled={isAnyLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAnyLoading}
                className="w-full glass-button py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStates.magicLink ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin-slow" />
                    Wysyłanie...
                  </>
                ) : (
                  'Wyślij Magic Link'
                )}
              </button>
            </form>
          )}

          {/* Footer Text */}
          <div className="mt-6 text-center text-xs text-slate-500">
            <p>Chronione SSL • Baza danych z szyfrrowaniem end-to-end</p>
          </div>
        </div>

        {/* Side Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Bezpieczna autentykacja zasilana przez{' '}
            <span className="text-indigo-400 font-medium">Supabase</span>
          </p>
        </div>
      </div>
    </div>
  )
}
