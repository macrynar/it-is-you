import { useState, useEffect } from 'react'
import AuthModal from './components/Auth/AuthModal'
import TestWizard from './components/Test/TestWizard'
import HexacoResults from './components/Test/HexacoResults'
import EnneagramResults from './components/Test/EnneagramResults'
import DarkTriadResults from './components/Test/DarkTriadResults'
import StrengthsResults from './components/Test/StrengthsResults'
import CareerResults from './components/Test/CareerResults'
import ValuesResults from './components/Test/ValuesResults'
import { supabase, onAuthStateChange } from './lib/supabaseClient'

/**
 * Main App Component
 * Handles auth state and routing
 */
function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isCallbackRoute, setIsCallbackRoute] = useState(false)
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname)

  // Check for OAuth callback
  useEffect(() => {
    const pathname = window.location.pathname
    setCurrentRoute(pathname)
    
    if (pathname === '/auth/callback' || pathname === '/auth/callback/') {
      setIsCallbackRoute(true)
      // Supabase will set the session automatically
      // Just redirect after a moment
      setTimeout(() => {
        const session = localStorage.getItem('user_session')
        const intendedDestination = sessionStorage.getItem('redirect_after_auth')
        const redirectUrl = intendedDestination || '/user-profile-tests.html'
        
        if (intendedDestination) {
          sessionStorage.removeItem('redirect_after_auth')
        }
        
        if (session) {
          window.location.href = redirectUrl
        } else {
          // Wait a bit longer for session to be set
          const checkInterval = setInterval(() => {
            const storedSession = localStorage.getItem('user_session')
            if (storedSession) {
              clearInterval(checkInterval)
              window.location.href = redirectUrl
            }
          }, 500)
          setTimeout(() => clearInterval(checkInterval), 5000)
        }
      }, 500)
      return
    }
  }, [])

  // Listen to auth state changes
  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }
      setLoading(false)
    }
    
    checkSession()
    
    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange(({ event, session }) => {
      setUser(session?.user || null)
      setLoading(false)
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.email)
        // Store session in localStorage for later access
        localStorage.setItem('user_session', JSON.stringify(session?.user))
        localStorage.setItem('auth_token', session?.access_token || 'authenticated')
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        localStorage.removeItem('user_session')
        localStorage.removeItem('auth_token')
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  // Handle /test/hexaco/results route - show test results
  if (currentRoute === '/test/hexaco/results' || currentRoute === '/test/hexaco/results/') {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Ładowanie...</p>
          </div>
        </div>
      )
    }
    
    if (!user) {
      window.location.href = '/auth'
      return null
    }
    
    return <HexacoResults />
  }

  // Handle /test/enneagram/results route - show enneagram results
  if (currentRoute === '/test/enneagram/results' || currentRoute === '/test/enneagram/results/') {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Ładowanie...</p>
          </div>
        </div>
      )
    }
    
    if (!user) {
      window.location.href = '/auth'
      return null
    }
    
    return <EnneagramResults />
  }

  // Handle /test/dark-triad/results route - show dark triad results
  if (currentRoute === '/test/dark-triad/results' || currentRoute === '/test/dark-triad/results/') {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Ładowanie...</p>
          </div>
        </div>
      )
    }
    
    if (!user) {
      window.location.href = '/auth'
      return null
    }
    
    return <DarkTriadResults />
  }

  // Handle /test/strengths/results route - show strengths results
  if (currentRoute === '/test/strengths/results' || currentRoute === '/test/strengths/results/') {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Ładowanie...</p>
          </div>
        </div>
      )
    }
    
    if (!user) {
      window.location.href = '/auth'
      return null
    }
    
    return <StrengthsResults />
  }

  // Handle /test/career/results route - show career results
  if (currentRoute === '/test/career/results' || currentRoute === '/test/career/results/') {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Ładowanie...</p>
          </div>
        </div>
      )
    }
    
    if (!user) {
      window.location.href = '/auth'
      return null
    }
    
    return <CareerResults />
  }

  // Handle /test/values/results route - show values results
  if (currentRoute === '/test/values/results' || currentRoute === '/test/values/results/') {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-cyan-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Ładowanie...</p>
          </div>
        </div>
      )
    }
    
    if (!user) {
      window.location.href = '/auth'
      return null
    }
    
    return <ValuesResults />
  }

  // Handle /test route - require authentication & check for test type
  if (currentRoute === '/test' || currentRoute === '/test/') {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Sprawdzanie autoryzacji...</p>
          </div>
        </div>
      )
    }
    
    if (!user) {
      sessionStorage.setItem('redirect_after_auth', '/test')
      window.location.href = '/auth'
      return null
    }
    
    // Check for test type in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const testType = urlParams.get('type') || 'hexaco' // default to hexaco
    
    return <TestWizard testType={testType} />
  }

  // Loading state or OAuth callback processing
  if (loading || isCallbackRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">{isCallbackRoute ? 'Przetwarzanie logowania...' : 'Ładowanie...'}</p>
        </div>
      </div>
    )
  }

  // User is logged in - show dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="glass-panel p-8 rounded-2xl text-center">
            <h1 className="text-4xl font-bold brand-font text-white mb-4">
              Witaj, {user.email}! 👋
            </h1>
            <p className="text-slate-300 mb-6">
              Zostałeś pomyślnie zalogowany do portalu "It Is You"
            </p>
            
            {/* User Info */}
            <div className="bg-slate-900/50 p-6 rounded-lg mb-6 text-left">
              <h2 className="text-sm font-medium text-slate-300 mb-3">Informacje o koncie:</h2>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><strong>Email:</strong> {user.email}</li>
                <li><strong>Identyfikator:</strong> {user.id}</li>
                <li><strong>Zalogowany od:</strong> {new Date(user.created_at).toLocaleDateString('pl-PL')}</li>
              </ul>
            </div>

            {/* Navigation & Sign Out Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <a 
                href="/user-profile-tests.html"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
              >
                Dashboard Testów
              </a>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  localStorage.removeItem('user_session')
                  localStorage.removeItem('auth_token')
                  setUser(null)
                  window.location.href = '/index2.html'
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                Wyloguj się
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Następne kroki:</h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>✓ Autoryzacja Supabase wdrożona</li>
              <li>✓ Test HEXACO-60 gotowy</li>
              <li>✓ Dashboard z 7 testami psychometrycznymi  </li>
              <li>→ Wypełnij test HEXACO i zobacz wyniki</li>
              <li>→ Więcej testów wkrótce...</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // User not logged in - show auth modal
  return <AuthModal onAuthSuccess={() => setUser(true)} />
}

export default App
