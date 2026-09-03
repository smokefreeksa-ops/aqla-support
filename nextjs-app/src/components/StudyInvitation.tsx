'use client'

import { useEffect, useRef, useState } from 'react'

const REDCAP_URL = 'https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM'
const LOGO_URL = '/aqla-logo.png'

const copy = {
  ar: {
    dir: 'rtl' as const,
    lang: 'ar',
    dialogLabel: 'دعوة للمشاركة في الدراسة العلمية',
    closeLabel: 'إغلاق دعوة الدراسة والمتابعة إلى أقلع',
    headline: 'شارك في الدراسة',
    explanationTop: 'رأيك يهمنا في فهم دور منتجات النيكوتين الخالية من التبغ',
    explanationBottom: 'في الحد من أضرار التدخين',
    incentive: 'أكمل الاستبيان وادخل السحب للفوز بـ ٥٠٠ ريال سعودي',
    question: 'هل ستشارك في دراستنا؟',
    cta: 'نعم، سأشارك الآن',
    details: 'تفاصيل الدراسة',
    goalTitle: 'هدف الدراسة',
    goalBody: 'فهم آراء وتجارب البالغين حول منتجات النيكوتين الخالية من التبغ ودورها المحتمل في الحد من أضرار التدخين.',
    participationTitle: 'المشاركة',
    participationBody: 'المشاركة طوعية، وستُعامل إجاباتك بسرية وتُستخدم لأغراض البحث العلمي فقط. يمكنك إغلاق هذه النافذة واستخدام خدمات أقلع دون المشاركة في الدراسة.',
    incentiveTitle: 'الاستبيان والمكافأة',
    incentiveBody: 'بعد إكمال الاستبيان، يمكنك الدخول في السحب للفوز بـ ٥٠٠ ريال سعودي.',
    ethicsTitle: 'الموافقة الأخلاقية',
    ethicsBody: 'تمت الموافقة على الدراسة من لجنة أخلاقيات البحث بجامعة الملك عبدالعزيز. رقم الموافقة: 26-162.',
    contactTitle: 'للمزيد من المعلومات',
    contactBody: 'smokefreeksa@gmail.com',
  },
  en: {
    dir: 'ltr' as const,
    lang: 'en',
    dialogLabel: 'Scientific study invitation',
    closeLabel: 'Close the study invitation and continue to Aqla',
    headline: 'Take part in the study',
    explanationTop: 'Your views matter in helping us understand the role of tobacco-free nicotine products',
    explanationBottom: 'in reducing smoking-related harm',
    incentive: 'Complete the survey and enter the draw to win SAR 500',
    question: 'Will you take part in our study?',
    cta: 'Yes, I’ll take part now',
    details: 'Study details',
    goalTitle: 'Study aim',
    goalBody: 'To understand adults’ views and experiences regarding tobacco-free nicotine products and their potential role in reducing smoking-related harm.',
    participationTitle: 'Participation',
    participationBody: 'Participation is voluntary. Your responses will be treated confidentially and used for research purposes only. You can close this invitation and use Aqla without taking part in the study.',
    incentiveTitle: 'Survey and prize draw',
    incentiveBody: 'After completing the survey, you can enter the draw to win SAR 500.',
    ethicsTitle: 'Ethics approval',
    ethicsBody: 'Approved by the Research Ethics Committee at King Abdulaziz University. Approval number: 26-162.',
    contactTitle: 'For more information',
    contactBody: 'smokefreeksa@gmail.com',
  },
}

export default function StudyInvitation({ overlay = false }: { overlay?: boolean }) {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [visible, setVisible] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const detailsRef = useRef<HTMLDivElement>(null)
  const t = copy[lang]

  useEffect(() => {
    if (!overlay || !visible) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [overlay, visible])

  useEffect(() => {
    if (!detailsOpen) return
    function closeDetailsOnOutsidePress(event: PointerEvent) {
      const target = event.target
      if (target instanceof Node && detailsRef.current && !detailsRef.current.contains(target)) setDetailsOpen(false)
    }
    document.addEventListener('pointerdown', closeDetailsOnOutsidePress)
    return () => document.removeEventListener('pointerdown', closeDetailsOnOutsidePress)
  }, [detailsOpen])

  useEffect(() => {
    if (!visible) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (detailsOpen) {
        setDetailsOpen(false)
        return
      }
      dismiss()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  })

  function dismiss() {
    if (overlay) {
      setVisible(false)
      return
    }
    window.location.href = '/aqla'
  }

  if (!visible) return null

  return (
    <main className={`study-v2-screen ${overlay ? 'study-v2-overlay' : 'study-v2-standalone'}`} dir={t.dir} lang={t.lang} role="dialog" aria-modal={overlay ? 'true' : undefined} aria-label={t.dialogLabel}>
      <section className="study-v2-modal">
        <img src={LOGO_URL} alt="AQla — أقلع" className="study-v2-logo" />
        <div className="study-v2-language" dir="ltr" aria-label="Language">
          <button type="button" className={lang === 'ar' ? 'active' : ''} aria-pressed={lang === 'ar'} aria-label="العربية" onClick={() => setLang('ar')}>A</button>
          <span aria-hidden="true" />
          <button type="button" className={lang === 'en' ? 'active' : ''} aria-pressed={lang === 'en'} aria-label="English" onClick={() => setLang('en')}>E</button>
        </div>
        <div className="study-v2-content">
          <h1 className="study-v2-headline">{t.headline}</h1>
          <p className="study-v2-explanation"><span>{t.explanationTop}</span><span>{t.explanationBottom}</span></p>
          <p className="study-v2-incentive">{t.incentive}</p>
          <p className="study-v2-question">{t.question}</p>
          <a className="study-v2-primary" href={REDCAP_URL} target="_blank" rel="noopener noreferrer" onClick={dismiss}>{t.cta}</a>
        </div>
        <div className="study-v2-details-wrap" ref={detailsRef}>
          {detailsOpen ? (
            <div className="study-v2-details-panel" role="region" aria-label={t.details}>
              <h2>{t.details}</h2>
              <section><h3>{t.goalTitle}</h3><p>{t.goalBody}</p></section>
              <section><h3>{t.participationTitle}</h3><p>{t.participationBody}</p></section>
              <section><h3>{t.incentiveTitle}</h3><p>{t.incentiveBody}</p></section>
              <section><h3>{t.ethicsTitle}</h3><p>{t.ethicsBody}</p></section>
              <section><h3>{t.contactTitle}</h3><p dir="ltr">{t.contactBody}</p></section>
            </div>
          ) : null}
          <button type="button" className="study-v2-details-toggle" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((open) => !open)}>{t.details} <span aria-hidden="true">{detailsOpen ? '▴' : '▾'}</span></button>
        </div>
      </section>
      <button type="button" className="study-v2-close" aria-label={t.closeLabel} onClick={dismiss}><svg viewBox="0 0 44 44" aria-hidden="true"><path d="M8 8L36 36M36 8L8 36" /></svg></button>
    </main>
  )
}
