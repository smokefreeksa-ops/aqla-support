'use client'

import { FormEvent, useMemo, useRef, useState } from 'react'

const LOGO_URL = '/aqla-logo.png'

type Lang = 'ar' | 'en'
type Mode = 'quit' | 'academy' | 'clinician' | 'admin'
type Action = 'none' | 'start_assessment' | 'open_craving_support' | 'open_latest_plan' | 'open_progress' | 'open_academy' | 'email_latest_plan'
type Message = { role: 'user' | 'assistant'; content: string; action?: Action }
type Conversation = { conversation_id: string; title: string; mode: Mode; created_at: string; updated_at: string }
type TwinSummary = {
  products?: string[]
  triggers?: string[]
  confidence?: number
  readiness?: number
  current_plan_created_at?: string
  followup_count?: number
}

type SpeechRecognitionEventLike = {
  results: ArrayLike<{ 0: { transcript: string } }>
}
type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function speechCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const candidate = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }
  return candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition ?? null
}

const modeCopy = {
  ar: {
    quit: ['أقلع للأفراد', 'خطتك، الرغبة، التحديات والمتابعة'],
    academy: ['أكاديمية أقلع', 'تعلّم واسأل وتدرّب'],
    clinician: ['بوابة الممارس', 'أدوات الممارس المصرّح بها'],
    admin: ['بوابة الإدارة', 'التحليلات والحوكمة والتشغيل'],
  },
  en: {
    quit: ['Aqla Quit', 'Plans, cravings, challenges and follow-up'],
    academy: ['Aqla Academy', 'Learn, ask and practise'],
    clinician: ['Clinician Portal', 'Authorised clinician tools'],
    admin: ['Admin Portal', 'Analytics, governance and operations'],
  },
} as const

const quickPrompts = {
  ar: {
    quit: ['ابنِ خطة الإقلاع الخاصة بي', 'الرغبة قوية الآن', 'حدثت زلة اليوم', 'أعطني تحدي اليوم', 'راجع تقدمي', 'أرسل خطتي إلى بريدي الإلكتروني'],
    academy: ['علّمني لماذا تزداد الرغبة بعد القهوة', 'ما المتوقع عند الانسحاب؟', 'اختبر معرفتي عن النيكوتين', 'اشرح لي المحفزات بطريقة بسيطة'],
    clinician: ['لخّص حالة المشارك المصرّح لي بها', 'اعرض لي ما يحتاج متابعة', 'اشرح حدود دعم أقلع للممارس'],
    admin: ['أعطني ملخص مؤشرات أقلع', 'ما الذي يحتاج انتباهي تشغيليًا؟', 'اشرح تعريفات مؤشرات المتابعة'],
  },
  en: {
    quit: ['Build my quit plan', 'My craving is strong right now', 'I slipped today', 'Give me today’s challenge', 'Review my progress', 'Email me my saved plan'],
    academy: ['Teach me why coffee triggers cravings', 'What should I expect from withdrawal?', 'Quiz me about nicotine', 'Explain triggers simply'],
    clinician: ['Summarise an authorised participant journey', 'Show what needs follow-up', 'Explain Aqla clinician-support boundaries'],
    admin: ['Summarise Aqla KPIs', 'What needs operational attention?', 'Explain the follow-up KPI definitions'],
  },
} as const

export default function AqlaOS({
  signedIn,
  canClinician,
  canAdmin,
  latestPlanId,
  initialConversations,
  twinSummary,
}: {
  signedIn: boolean
  canClinician: boolean
  canAdmin: boolean
  latestPlanId?: string
  initialConversations: Conversation[]
  twinSummary?: TwinSummary
}) {
  const [lang, setLang] = useState<Lang>('ar')
  const [mode, setMode] = useState<Mode>('quit')
  const [conversations, setConversations] = useState(initialConversations)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [listening, setListening] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const ar = lang === 'ar'
  const availableSpeech = useMemo(() => Boolean(speechCtor()), [])

  const activeModeCopy = modeCopy[lang][mode]
  const loginUrl = `/auth/login?returnTo=${encodeURIComponent('/aqla/os')}`

  function newConversation() {
    setConversationId(undefined)
    setMessages([])
    setInput('')
    setSidebarOpen(false)
  }

  async function refreshConversationList() {
    if (!signedIn) return
    try {
      const response = await fetch('/api/assistant/conversations', { cache: 'no-store' })
      if (!response.ok) return
      const data = await response.json() as { conversations?: Conversation[] }
      if (Array.isArray(data.conversations)) setConversations(data.conversations)
    } catch {
      // Conversation history is helpful but must not break the live conversation.
    }
  }

  async function openConversation(item: Conversation) {
    if (!signedIn) return
    try {
      const response = await fetch(`/api/assistant/conversations/${encodeURIComponent(item.conversation_id)}`, { cache: 'no-store' })
      if (!response.ok) return
      const data = await response.json() as { conversation_id: string; messages?: Array<{ role: 'user' | 'assistant'; content: string; action?: Action }> }
      setConversationId(data.conversation_id)
      setMessages((data.messages ?? []).map((message) => ({ role: message.role, content: message.content, action: message.action })))
      if ((item.mode === 'quit' || item.mode === 'academy') || (item.mode === 'clinician' && canClinician) || (item.mode === 'admin' && canAdmin)) setMode(item.mode)
      setSidebarOpen(false)
    } catch {
      // Keep current conversation if history cannot be loaded.
    }
  }

  function routeForAction(action?: Action) {
    if (!action || action === 'none' || action === 'email_latest_plan') return null
    if (action === 'start_assessment') return '/aqla/assessment'
    if (action === 'open_craving_support') return `/aqla/sos?lang=${lang}`
    if (action === 'open_latest_plan') return latestPlanId ? `/aqla/plan/${encodeURIComponent(latestPlanId)}?lang=${lang}` : '/aqla/assessment'
    if (action === 'open_progress') return `/aqla/dashboard?lang=${lang}`
    if (action === 'open_academy') return null
    return null
  }

  function actionLabel(action?: Action) {
    if (action === 'start_assessment') return ar ? 'ابدأ التقييم' : 'Start assessment'
    if (action === 'open_craving_support') return ar ? 'افتح دعم الرغبة الآن' : 'Open craving support'
    if (action === 'open_latest_plan') return latestPlanId ? (ar ? 'افتح خطتي' : 'Open my plan') : (ar ? 'أنشئ خطة' : 'Create a plan')
    if (action === 'open_progress') return ar ? 'راجع تقدمي' : 'Review progress'
    if (action === 'open_academy') return ar ? 'افتح أكاديمية أقلع' : 'Open Aqla Academy'
    return null
  }

  async function sendPrompt(text: string) {
    const clean = text.trim().slice(0, 2400)
    if (!clean || sending) return
    if (!signedIn) {
      window.location.href = loginUrl
      return
    }

    const next: Message[] = [...messages, { role: 'user', content: clean }]
    setMessages(next)
    setInput('')
    setSending(true)

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          lang,
          mode,
          conversation_id: conversationId,
          messages: next.slice(-14),
        }),
      })

      if (response.status === 401) {
        window.location.href = loginUrl
        return
      }

      const data = await response.json() as { reply?: string; action?: Action; conversation_id?: string; error?: string }
      if (response.status === 403) {
        setMessages([...next, { role: 'assistant', content: ar ? 'هذا الوضع يحتاج صلاحية حساب إضافية.' : 'This mode requires additional account permission.' }])
        return
      }
      if (!response.ok || !data.reply) throw new Error('assistant_failed')

      setMessages([...next, { role: 'assistant', content: data.reply, action: data.action }])
      if (data.conversation_id && data.conversation_id !== conversationId) {
        setConversationId(data.conversation_id)
        void refreshConversationList()
      }
      if (data.action === 'open_academy') setMode('academy')
    } catch {
      setMessages([...next, { role: 'assistant', content: ar ? 'تعذّر الاتصال بأقلع الآن. ما زالت أدوات الخطة والدعم المباشر متاحة من الأزرار أدناه.' : 'Aqla could not connect right now. Your plan and direct support tools are still available from the actions below.' }])
    } finally {
      setSending(false)
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void sendPrompt(input)
  }

  function startVoice() {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const Ctor = speechCtor()
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = ar ? 'ar-SA' : 'en-GB'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim()
      if (transcript) setInput((current) => current ? `${current} ${transcript}` : transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }
    recognitionRef.current = recognition
    setListening(true)
    recognition.start()
  }

  function selectMode(nextMode: Mode) {
    if (nextMode === 'clinician' && !canClinician) return
    if (nextMode === 'admin' && !canAdmin) return
    setMode(nextMode)
    newConversation()
  }

  const twinLine = twinSummary
    ? ar
      ? [twinSummary.products?.length ? `${twinSummary.products.length} نوع/أنواع نيكوتين` : null, typeof twinSummary.confidence === 'number' ? `الثقة ${twinSummary.confidence}/10` : null, twinSummary.followup_count ? `${twinSummary.followup_count} متابعة مكتملة` : null].filter(Boolean).join(' · ')
      : [twinSummary.products?.length ? `${twinSummary.products.length} nicotine product${twinSummary.products.length > 1 ? 's' : ''}` : null, typeof twinSummary.confidence === 'number' ? `confidence ${twinSummary.confidence}/10` : null, twinSummary.followup_count ? `${twinSummary.followup_count} completed check-ins` : null].filter(Boolean).join(' · ')
    : ''

  return (
    <main className="os-page" dir={ar ? 'rtl' : 'ltr'} lang={lang}>
      <button className="os-mobile-menu" type="button" onClick={() => setSidebarOpen(true)} aria-label={ar ? 'فتح المحادثات' : 'Open conversations'}>☰</button>

      <aside className={`os-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="os-sidebar-brand">
          <a href="/aqla" aria-label={ar ? 'العودة إلى أقلع' : 'Back to Aqla'}><img src={LOGO_URL} alt="Aqla — أقلع" /></a>
          <button type="button" className="os-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label={ar ? 'إغلاق القائمة' : 'Close menu'}>×</button>
        </div>
        <button className="os-new-chat" type="button" onClick={newConversation}>＋ {ar ? 'محادثة جديدة' : 'New conversation'}</button>

        <div className="os-history-label">{ar ? 'المحادثات السابقة' : 'Previous conversations'}</div>
        <div className="os-history">
          {signedIn && conversations.length ? conversations.map((item) => (
            <button key={item.conversation_id} type="button" className={item.conversation_id === conversationId ? 'active' : ''} onClick={() => void openConversation(item)}>
              <span>{item.title}</span><small>{modeCopy[lang][item.mode][0]}</small>
            </button>
          )) : <p>{signedIn ? (ar ? 'ابدأ محادثتك الأولى مع أقلع.' : 'Start your first Aqla conversation.') : (ar ? 'سجّل الدخول لحفظ المحادثات والعودة إليها.' : 'Sign in to save and return to conversations.')}</p>}
        </div>

        <div className="os-sidebar-bottom">
          {signedIn ? <a href="/auth/logout">{ar ? 'تسجيل الخروج' : 'Sign out'}</a> : <a href={loginUrl}>{ar ? 'تسجيل الدخول' : 'Sign in'}</a>}
          <button type="button" onClick={() => setLang(ar ? 'en' : 'ar')}>{ar ? 'English' : 'العربية'}</button>
        </div>
      </aside>

      {sidebarOpen ? <button className="os-sidebar-scrim" type="button" onClick={() => setSidebarOpen(false)} aria-label={ar ? 'إغلاق القائمة' : 'Close menu'} /> : null}

      <section className="os-workspace">
        <header className="os-topbar">
          <div className="os-mode-select-wrap">
            <label htmlFor="aqla-mode" className="sr-only">{ar ? 'وضع أقلع' : 'Aqla mode'}</label>
            <select id="aqla-mode" className="os-mode-select" value={mode} onChange={(event) => selectMode(event.target.value as Mode)}>
              <option value="quit">{modeCopy[lang].quit[0]}</option>
              <option value="academy">{modeCopy[lang].academy[0]}</option>
              <option value="clinician" disabled={!canClinician}>{modeCopy[lang].clinician[0]}{canClinician ? '' : (ar ? ' — يتطلب صلاحية' : ' — permission required')}</option>
              <option value="admin" disabled={!canAdmin}>{modeCopy[lang].admin[0]}{canAdmin ? '' : (ar ? ' — يتطلب صلاحية' : ' — permission required')}</option>
            </select>
            <span className="os-mode-subtitle">{activeModeCopy[1]}</span>
          </div>
          {twinLine && mode === 'quit' ? <div className="os-twin-pill" title={ar ? 'ملخص من حالة أقلع الشخصية المحفوظة' : 'Summary from your saved Aqla personal state'}><span>◉</span>{twinLine}</div> : null}
        </header>

        <div className="os-conversation" aria-live="polite">
          {messages.length === 0 ? (
            <div className="os-empty-state">
              <img src={LOGO_URL} alt="" />
              <span className="os-eyebrow">Aqla OS</span>
              <h1>{ar ? 'كيف أقدر أساعدك اليوم؟' : 'How can Aqla help today?'}</h1>
              <p>{mode === 'quit'
                ? (ar ? 'تحدث بطريقتك. أقلع يوجّهك إلى الخطة، دعم الرغبة، التحديات والمتابعة عند الحاجة.' : 'Speak naturally. Aqla can bring your plan, craving support, challenges and follow-up into one conversation.')
                : mode === 'academy'
                  ? (ar ? 'اسأل وتعلّم داخل نفس تجربة أقلع.' : 'Ask and learn inside the same Aqla experience.')
                  : activeModeCopy[1]}</p>
              <div className="os-quick-grid">
                {quickPrompts[lang][mode].map((prompt) => <button type="button" key={prompt} onClick={() => void sendPrompt(prompt)}>{prompt}</button>)}
              </div>
            </div>
          ) : (
            <div className="os-message-list">
              {messages.map((message, index) => {
                const href = routeForAction(message.action)
                const label = actionLabel(message.action)
                return (
                  <article key={`${message.role}-${index}`} className={`os-message ${message.role}`}>
                    {message.role === 'assistant' ? <div className="os-assistant-avatar"><img src={LOGO_URL} alt="" /></div> : null}
                    <div className="os-message-body">
                      <p>{message.content}</p>
                      {message.action === 'open_academy' ? <button className="os-inline-action" type="button" onClick={() => selectMode('academy')}>{label}</button> : href && label ? <a className="os-inline-action" href={href}>{label}</a> : null}
                    </div>
                  </article>
                )
              })}
              {sending ? <article className="os-message assistant"><div className="os-assistant-avatar"><img src={LOGO_URL} alt="" /></div><div className="os-message-body"><p className="os-thinking">{ar ? 'أقلع يفكر في الخطوة الأنسب…' : 'Aqla is preparing the next step…'}</p></div></article> : null}
            </div>
          )}
        </div>

        <div className="os-composer-zone">
          <form className="os-composer" onSubmit={onSubmit}>
            <textarea
              rows={1}
              maxLength={2400}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void sendPrompt(input)
                }
              }}
              placeholder={ar ? 'اكتب لأقلع ما الذي تحتاجه…' : 'Tell Aqla what you need…'}
              aria-label={ar ? 'رسالتك إلى أقلع' : 'Your message to Aqla'}
            />
            <div className="os-composer-actions">
              <button
                type="button"
                className={`os-mic ${listening ? 'is-listening' : ''}`}
                onClick={startVoice}
                disabled={!availableSpeech}
                title={availableSpeech ? (ar ? 'إملاء صوتي — لا يحفظ أقلع التسجيل الصوتي' : 'Voice dictation — Aqla does not save the audio recording') : (ar ? 'الإملاء الصوتي غير مدعوم في هذا المتصفح' : 'Voice dictation is not supported in this browser')}
                aria-label={ar ? 'الإملاء الصوتي' : 'Voice dictation'}
              >{listening ? '■' : '●'}</button>
              <button className="os-send" type="submit" disabled={sending || !input.trim()} aria-label={ar ? 'إرسال' : 'Send'}>↑</button>
            </div>
          </form>
          <p className="os-composer-note">{ar ? 'أقلع يستخدم الذكاء الاصطناعي للتخصيص، مع بقاء قواعد السلامة والقرارات الحساسة خارج سيطرة النموذج.' : 'Aqla uses AI for personalisation while safety rules and sensitive decisions remain outside model control.'}</p>
          <div className="os-tool-links">
            <a href="/aqla/assessment">{ar ? 'التقييم' : 'Assessment'}</a>
            <a href={`/aqla/sos?lang=${lang}`}>{ar ? 'مساعدة عاجلة للرغبة' : 'Craving support'}</a>
            {latestPlanId ? <a href={`/aqla/plan/${encodeURIComponent(latestPlanId)}?lang=${lang}`}>{ar ? 'خطتي' : 'My plan'}</a> : null}
            <a href={`/aqla/dashboard?lang=${lang}`}>{ar ? 'التقدم' : 'Progress'}</a>
          </div>
        </div>
      </section>
    </main>
  )
}
