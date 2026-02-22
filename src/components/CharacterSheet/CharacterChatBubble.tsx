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

    if (!open) setOpen(true)

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
    <>
      {/* DOCKED ISLAND (bottom-center, input always visible) */}
      {!open && (
        <div className="fixed inset-x-0 bottom-4 z-[60] flex justify-center px-3">
          <div className="w-[min(820px,calc(100vw-24px))] card-neural card-neural-highlight overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-brand-primary/50 via-brand-secondary/40 to-brand-primary/50" />
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                  <span aria-hidden="true" className="absolute -inset-2 bg-brand-primary/20 blur-lg animate-pulse" />
                  <span aria-hidden="true" className="relative w-2.5 h-2.5 rounded-full bg-brand-primary/80 shadow" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] tracking-[2px] font-mono text-white/45">AI PSYCHOASSISTANT</div>
                  <div className="text-xs text-white/70 truncate">Zapytaj o pracę, relacje, kierunek rozwoju…</div>
                </div>
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-2 w-[min(520px,55vw)]">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  placeholder="Napisz pytanie…"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/85 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  disabled={loading}
                />
                <button type="button" onClick={send} disabled={!canSend} className="btn-neural disabled:opacity-50">
                  Zapytaj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDE PANEL (opens after first message) */}
      <div
        className={
          open
            ? 'fixed right-4 bottom-4 top-20 z-[70] w-[420px] max-w-[calc(100vw-24px)] transition-transform duration-300'
            : 'fixed right-4 bottom-4 top-20 z-[70] w-[420px] max-w-[calc(100vw-24px)] translate-x-[110%] transition-transform duration-300 pointer-events-none'
        }
      >
        <div className="h-full card-neural overflow-hidden flex flex-col">
          <div className="h-[3px] bg-gradient-to-r from-brand-primary/50 via-brand-secondary/40 to-brand-primary/50" />

          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] tracking-[2px] font-mono text-white/45">AI PSYCHOASSISTANT</div>
              <div className="text-sm font-semibold text-white/80 truncate">Dr. Aleksandra Wiśniewska</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost-neural px-3" aria-label="Zminimalizuj czat">
              Minimalizuj
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-4 space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] rounded-2xl rounded-br-md bg-brand-primary/15 border border-brand-primary/25 text-white/85 px-3 py-2 text-sm leading-relaxed'
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
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/85 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                disabled={loading}
              />
              <button type="button" onClick={send} disabled={!canSend} className="btn-neural disabled:opacity-50">
                Wyślij
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
