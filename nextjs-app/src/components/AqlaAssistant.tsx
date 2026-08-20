'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'

const LOGO_URL = '/aqla-logo.png'

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
        ? 'يا هلا 👋 أنا مساعد أقلع الذكي. أقدر أساعدك بمعلومات عامة عن الإقلاع، فهم خياراتك، أو اختيار المسار المناسب. لا أقدّم تشخيصًا أو وصفات أو جرعات دوائية.'
        : 'Hi 👋 I’m Aqla Smart Assistant. I can help with general quit-smoking information, understanding your options, or choosing the right pathway. I do not diagnose, prescribe, or provide medication doses.' }])
    }
  }, [open, ar, messages.length])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, sending])

  async function send(e?: FormEvent) {
    e?.preventDefault()
    const text = input.trim()
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
      const data = await res.json() as { reply?: string }
      if (!res.ok || !data.reply) throw new Error('assistant_failed')
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([...next, { role: 'assistant', content: ar ? 'تعذّر الاتصال بالمساعد الآن. حاول مرة أخرى بعد قليل.' : 'The assistant is unavailable right now. Please try again shortly.' }])
    } finally {
      setSending(false)
    }
  }

  if (!open) {
    return <button className="assistant-launcher" type="button" aria-label={ar ? 'مساعد أقلع' : 'Aqla Assistant'} onClick={() => setOpen(true)}>◌</button>
  }

  return (
    <aside className="assistant-panel" dir={ar ? 'rtl' : 'ltr'}>
      <div className="assistant-head">
        <div className="assistant-head-title"><img src={LOGO_URL} alt="Aqla" /><span>{ar ? 'مساعد أقلع الذكي' : 'Aqla Smart Assistant'}</span></div>
        <button className="assistant-close" type="button" onClick={() => setOpen(false)} aria-label={ar ? 'إغلاق' : 'Close'}>×</button>
      </div>
      <div className="assistant-messages">
        {messages.map((m, i) => <div key={i} className={`assistant-msg ${m.role}`}>{m.content}</div>)}
        {sending ? <div className="assistant-msg assistant">{ar ? 'يكتب…' : 'Thinking…'}</div> : null}
        <div ref={endRef} />
      </div>
      <form className="assistant-form" onSubmit={send}>
        <div className="assistant-form-row">
          <textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)} placeholder={ar ? 'اكتب سؤالك…' : 'Type your question…'} />
          <button className="assistant-send" type="submit" disabled={sending || !input.trim()}>↑</button>
        </div>
        <p className="assistant-disclaimer">{ar ? 'معلومات تثقيفية فقط — ليست استشارة طبية.' : 'Educational information only — not medical advice.'}</p>
      </form>
    </aside>
  )
}
