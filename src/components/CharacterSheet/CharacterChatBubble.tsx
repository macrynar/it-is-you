import { useMemo, useRef, useState } from 'react'
import { supabase, SUPABASE_ANON_KEY, getAccessToken } from '../../lib/supabaseClient.js'

type ChatMsg = {
  role: 'user' | 'assistant'
  content: string
}

export default function CharacterChatBubble({ profileContext }: { profileContext: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content:
        'Dzień dobry. Jestem Dr. Aleksandra Wiśniewska. Jestem tu po to, żeby towarzyszyć Ci w myśleniu o sobie — nie żeby dawać gotowe odpowiedzi.\n\nCo sprawiło, że zdecydowałeś/aś się porozmawiać właśnie teraz?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const canSend = useMemo(() => !loading && input.trim().length > 0, [loading, input])

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  const send = async () => {
    if (!canSend) return

    const text = input.trim()
    setInput('')
    setError(null)

    const nextMessages: ChatMsg[] = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    scrollToBottom()

    setLoading(true)
    try {
      const accessToken = await getAccessToken()
      if (!accessToken) throw new Error('Brak sesji')

      const { data, error: fnErr } = await supabase.functions.invoke('character-chat', {
        body: {
          profile_context: profileContext,
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        },
        headers: { Authorization: `Bearer ${accessToken}`, apikey: SUPABASE_ANON_KEY },
      })

      if (fnErr) throw fnErr

      const reply = String(data?.reply ?? '').trim()
      if (!reply) throw new Error('Brak odpowiedzi')

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      scrollToBottom()
    } catch (_e: any) {
      setError('Nie udało się wysłać wiadomości. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {!open ? (
        <div className="flex items-center gap-3">
          <div className="max-w-[220px] px-3 py-2 rounded-full bg-bg-surface/90 border border-white/10 backdrop-blur-xl shadow-lg">
            <div className="text-[10px] tracking-[2px] font-mono text-white/45">AI</div>
            <div className="text-xs font-semibold text-white/80 truncate">AI PsychoAssistant</div>
          </div>

          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute -inset-2 rounded-full bg-brand-primary/20 blur-md animate-pulse"
            />
            <span
              aria-hidden="true"
              className="absolute -inset-1 rounded-full border border-brand-primary/30 animate-ping"
            />
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative w-14 h-14 rounded-full bg-bg-surface/90 border border-white/10 hover:border-brand-primary/50 backdrop-blur-xl shadow-2xl flex items-center justify-center text-white/85 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              aria-label="Otwórz czat: AI PsychoAssistant"
            >
              <span className="text-xl">💬</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-[360px] max-w-[calc(100vw-40px)] h-[520px] max-h-[calc(100vh-140px)] bg-bg-surface/90 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-xs tracking-[2px] font-mono text-white/45">AI PSYCHOASSISTANT</div>
              <div className="text-sm font-semibold text-white/80 truncate">Dr. Aleksandra Wiśniewska</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70"
              aria-label="Zamknij czat"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-4 space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] rounded-2xl rounded-br-md bg-brand-primary/20 border border-brand-primary/30 text-white/85 px-3 py-2 text-sm leading-relaxed'
                      : 'max-w-[85%] rounded-2xl rounded-bl-md bg-white/5 border border-white/10 text-white/75 px-3 py-2 text-sm leading-relaxed'
                  }
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/5 border border-white/10 text-white/55 px-3 py-2 text-sm">
                  Piszę…
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-white/10">
            {error && <div className="mb-2 text-xs text-status-danger/80">{error}</div>}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="Napisz wiadomość…"
                className="flex-1 bg-bg-main/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                disabled={loading}
              />
              <button
                type="button"
                onClick={send}
                disabled={!canSend}
                className="px-3 py-2 rounded-xl bg-brand-primary/30 hover:bg-brand-primary/40 border border-brand-primary/30 text-white/85 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Wyślij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
