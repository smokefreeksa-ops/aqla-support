'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'

const LOGO_URL = '/aqla-logo.png'
const ASSISTANT_LOGIN_URL = `/auth/login?returnTo=${encodeURIComponent('/aqla#assistant')}`

type Msg = { role: 'user' | 'assistant'; content: string }

export default function AqlaAssistant({ lang }: { lang: 'ar' | 'en' }) {
  const ar = lang === 'ar'
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const openAssistant = () => setOpen(true)
    window.addEventListener('aqla:open-assistant', openAssistant)
    return () => window.removeEventListener('aqla:open-assistant', openAssistant)
  }, [])

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: ar
        ? 'يا هلا 👋 أنا مساعد أقلع. أقدر أساعدك بمعلومات عامة عن الإقلاع، فهم المحفزات، والاستعداد للخطوة التالية. لا أقدّم تشخيصًا أو وصفات أو جرعات دوائية.'
        : 'Hi 👋 I’m Aqla Assistant. I can help with general cessation information, understanding triggers and preparing for your next step. I do not diagnose, prescribe or provide medication doses.' }])
    }
  }, [open, ar, messages.length])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, sending])

  async function send(e?: FormEvent) {
    e?.preventDefault()
    const text = input.trim().slice(0, 2000)
    if (!text || sending) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setInput('')
    setSending(true)
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lang, messages: next.slice(-12) }),
      })

      if (res.status === 401) {
        window.location.href = ASSISTANT_LOGIN_URL
        return
      }

      const data = await res.json() as { reply?: string; error?: string }
      if (res.status === 413) {
        setMessages([...next, { role: 'assistant', content: ar ? 'المحادثة أصبحت طويلة. أغلق المساعد وافتحه لبدء محادثة جديدة.' : 'This conversation has become too long. Close and reopen the assistant to start a new conversation.' }])
        return
      }
      if (!res.ok || !data.reply) throw new Error('assistant_failed')
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([...next, { role: 'assistant', content: ar ? 'تعذّر الاتصال بالمساعد الآن. حاول مرة أخرى بعد قليل.' : 'The assistant is unavailable right now. Please try again shortly.' }])
    } finally {
      setSending(false)
    }
  }

  if (!open) {
    return <button className="assistant-launcher" type="button" aria-label={ar ? 'فتح مساعد أقلع' : 'Open Aqla Assistant'} onClick={() => setOpen(true)}>◌</button>
  }

  return (
    <aside className="assistant-panel" dir={ar ? 'rtl' : 'ltr'} lang={lang} aria-label={ar ? 'مساعد أقلع' : 'Aqla Assistant'}>
      <div className="assistant-head">
        <div className="assistant-head-title"><img src={LOGO_URL} alt="" /><span>{ar ? 'مساعد أقلع' : 'Aqla Assistant'}</span></div>
        <button className="assistant-close" type="button" onClick={() => setOpen(false)} aria-label={ar ? 'إغلاق المساعد' : 'Close assistant'}>×</button>
      </div>
      <div className="assistant-messages" aria-live="polite">
        {messages.map((m, i) => <div key={`${m.role}-${i}`} className={`assistant-msg ${m.role}`}>{m.content}</div>)}
        {sending ? <div className="assistant-msg assistant">{ar ? 'جاري إعداد الرد…' : 'Preparing a response…'}</div> : null}
        <div ref={endRef} />
      </div>
      <form className="assistant-form" onSubmit={send}>
        <div className="assistant-form-row">
          <textarea
            rows={1}
            maxLength={2000}
            aria-label={ar ? 'اكتب سؤالك لمساعد أقلع' : 'Type your question for Aqla Assistant'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={ar ? 'اكتب سؤالك…' : 'Type your question…'}
          />
          <button className="assistant-send" type="submit" disabled={sending || !input.trim()} aria-label={ar ? 'إرسال السؤال' : 'Send question'}>↑</button>
        </div>
        <p className="assistant-disclaimer">{ar ? 'دعم تثقيفي فقط — لا يقدّم تشخيصًا أو وصفات.' : 'Educational support only — not diagnosis or prescribing.'}</p>
      </form>
    </aside>
  )
}
