import { useMemo, useRef, useState } from 'react'
import { invokeEdgeNoAuth } from '../../lib/supabaseClient.js'

const SUGGESTED_PROMPTS = [
  'W jakim zajęciu odnajdę sens?',
  'Jakie jest moje idealne środowisko pracy?',
  'Nad jakim aspektem mojej osobowości powinienem popracować?',
  'Jaką mam odporność na stres?',
  'Z jakimi osobami tworzę synergię?',
  'Jakie zawody byłyby dla mnie najlepsze?',
]

type ChatMsg = {
  role: 'user' | 'assistant'
  content: string
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-[3px] px-1 py-0.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}

export default function CharacterChatBubble({
  profileContext,
  isPremium = false,
}: {
  profileContext: string
  isPremium?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content:
        'Hej. Jestem Alex — czytam ludzi jak kod. Wklej wyniki testów, opisz siebie, powiedz czego się boisz albo zapytaj gdzie zmierzasz. Zaczynam analizę.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const canSend = useMemo(() => !loading && input.trim().length > 0, [loading, input])

  const sendMessage = async (text: string) => {
    if (loading || !text.trim()) return
    setInput('')
    setError(null)
    const nextMessages: ChatMsg[] = [...messages, { role: 'user', content: text.trim() }]
    setMessages(nextMessages)
    setOpen(true)
    setTimeout(scrollToBottom, 80)
    setLoading(true)
    try {
      const data = await invokeEdgeNoAuth('character-chat', {
        profile_context: profileContext,
        messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
      })
      const reply = String(data?.reply ?? '').trim()
      if (!reply) throw new Error('Brak odpowiedzi')
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      scrollToBottom()
    } catch (_e: any) {
      const msg = String(_e?.message ?? '')
      if (/Invalid JWT/i.test(msg)) {
        setError('Sesja wygasła. Zaloguj się ponownie.')
      } else {
        setError('Nie udało się wysłać wiadomości. Spróbuj ponownie.')
      }
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSend = () => sendMessage(input)

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-3xl"
      style={{ filter: 'drop-shadow(0 0 40px rgba(79,70,229,0.18))' }}
    >
      {/* Chat panel — expands above the dock */}
      <div
        className={[
          'mb-2 bg-slate-950/95 backdrop-blur-xl border border-slate-700/70 rounded-2xl overflow-hidden flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.6)]',
          'transition-all duration-300 ease-out origin-bottom',
          open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none',
        ].join(' ')}
        style={open ? { maxHeight: 'min(480px, calc(100dvh - 160px))', minHeight: 260 } : { maxHeight: 0, minHeight: 0 }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">Alex — AI Psychoassistant</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.05]"
            aria-label="Minimalizuj czat"
          >
            <span>Minimalizuj</span>
            <ChevronDownIcon className="w-3 h-3" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 overscroll-contain">
          {messages.map((m, idx) => (
            <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-500/[0.14] border border-indigo-500/20 text-slate-100 px-3.5 py-2.5 text-sm leading-relaxed'
                    : 'max-w-[80%] rounded-2xl rounded-bl-sm bg-white/[0.05] border border-white/[0.08] text-slate-300 px-3.5 py-2.5 text-sm leading-relaxed'
                }
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-white/[0.05] border border-white/[0.08] px-3.5 py-2.5">
                <TypingDots />
              </div>
            </div>
          )}

          {error && <p className="text-center text-xs text-red-400/70 px-2">{error}</p>}
        </div>
      </div>

      {/* Main dock */}
      <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(99,102,241,0.08)] p-3">

        {/* Suggested prompts cloud */}
        {isPremium ? (
          <div
            className="mb-2.5 flex flex-row gap-1.5 overflow-x-auto scroll-smooth snap-x pr-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
              {SUGGESTED_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={loading}
                  onClick={() => sendMessage(q)}
                  className="flex-shrink-0 whitespace-nowrap snap-start bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded-full px-3 py-1.5 transition-all duration-200 hover:bg-indigo-600/30 hover:border-indigo-400/60 hover:text-white hover:shadow-[0_0_14px_-4px_rgba(99,102,241,0.55)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {q}
                </button>
              ))}
          </div>
        ) : (
          <div className="mb-2.5">
            <a
              href="/pricing"
              className="flex items-center gap-2 px-3 py-2 rounded-xl no-underline"
              style={{ background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.20)', color: 'rgba(255,255,255,.50)', fontSize: 12 }}
            >
              <span>🔒</span>
              <span>Chat AI dostępny dla <strong style={{ color: '#f59e0b' }}>Premium</strong></span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>Ulepsz →</span>
            </a>
          </div>
        )}

        {/* Input row */}
        <div className="flex items-center gap-2.5 bg-slate-800/50 rounded-xl px-2 py-1.5">
          {/* AI sparkle icon */}
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-500/[0.15] border border-indigo-500/25 flex items-center justify-center">
            <SparklesIcon className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          </div>

          {/* Text input */}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Zadaj pytanie lub wybierz sugestię powyżej..."
            disabled={!isPremium || loading}
            className="flex-1 min-w-0 bg-transparent border-none outline-none focus:ring-0 text-slate-100 text-sm placeholder:text-slate-500 disabled:cursor-not-allowed"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          />

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!isPremium || !canSend}
            aria-label="Wyślij"
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_16px_-4px_rgba(99,102,241,0.5)] transition-all duration-200 hover:scale-110 hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.7)] disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed"
          >
            <SendIcon className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
