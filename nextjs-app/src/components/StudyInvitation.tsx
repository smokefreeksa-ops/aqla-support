'use client'

import { useEffect, useState } from 'react'

const REDCAP_URL = 'https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM'
const LOGO_URL = '/aqla-logo.png'
const ASSESSMENT_URL = '/aqla/assessment'
const DISMISS_KEY = 'aqla_study_invitation_dismissed_v1'

const copy = {
  ar: {
    dir: 'rtl' as const,
    lang: 'ar',
    switch: 'English',
    banner: 'تجربتك تهمنا وتساهم في البحث العلمي',
    joinNow: 'شارك الآن في الدراسة',
    quickPlan: 'ابدأ خطة الإقلاع الشخصية',
    eyebrow: 'دراسة علمية',
    university: 'جامعة الملك عبدالعزيز',
    title: 'شارك برأيك حول دور منتجات النيكوتين الخالية من التبغ في الحد من أضرار التدخين',
    prize: 'شارك في الاستبيان وادخل السحب للفوز بـ ٥٠٠ ريال سعودي',
    participate: 'شارك في الدراسة',
    continue: 'متابعة إلى أقلع بدون المشاركة',
    skip: 'تخطي',
    details: 'تفاصيل الدراسة',
    p1: 'هذه دراسة بحثية من جامعة الملك عبدالعزيز تهدف إلى فهم آراء وتجارب البالغين حول استخدام منتجات النيكوتين الخالية من التبغ ودورها المحتمل في الحد من أضرار التدخين.',
    p2: 'المشاركة طوعية، وستُعامل إجاباتك بسرية وتُستخدم لأغراض البحث العلمي فقط. يمكنك استخدام خدمات أقلع دون المشاركة في الدراسة.',
    ethics: 'تمت الموافقة على الدراسة من لجنة أخلاقيات البحث بجامعة الملك عبدالعزيز. رقم الموافقة: 26-162',
    contact: 'للمزيد من المعلومات: smokefreeksa@gmail.com',
    tags: ['المشاركة تطوعية', 'إجابات سرية', 'سحب على ٥٠٠ ريال سعودي'],
  },
  en: {
    dir: 'ltr' as const,
    lang: 'en',
    switch: 'العربية',
    banner: 'Your experience matters and contributes to scientific research',
    joinNow: 'Take part in the study',
    quickPlan: 'Start your personal quit plan',
    eyebrow: 'Scientific study',
    university: 'King Abdulaziz University',
    title: 'Share your view on the role of tobacco-free nicotine products in reducing smoking harm',
    prize: 'Take the survey and enter the draw to win SAR 500',
    participate: 'Take part in the study',
    continue: 'Continue to Aqla without taking part',
    skip: 'Skip',
    details: 'Study details',
    p1: 'This King Abdulaziz University research study aims to understand adults’ opinions and experiences regarding tobacco-free nicotine products and their potential role in reducing smoking harm.',
    p2: 'Participation is voluntary. Your responses will be treated confidentially and used for research purposes only. You can use Aqla without taking part in the study.',
    ethics: 'Approved by the Research Ethics Committee at King Abdulaziz University. Approval number: 26-162',
    contact: 'For more information: smokefreeksa@gmail.com',
    tags: ['Voluntary participation', 'Confidential responses', 'SAR 500 prize draw'],
  },
}

export default function StudyInvitation({ overlay = false }: { overlay?: boolean }) {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [visible, setVisible] = useState(true)
  const t = copy[lang]

  useEffect(() => {
    if (!overlay) return
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === '1') setVisible(false)
    } catch { /* show invitation when storage is unavailable */ }
  }, [overlay])

  function dismiss() {
    if (overlay) {
      try { window.localStorage.setItem(DISMISS_KEY, '1') } catch { /* no-op */ }
      setVisible(false)
    }
  }

  if (!visible) return null

  return (
    <main
      className="study-screen"
      dir={t.dir}
      lang={t.lang}
      role={overlay ? 'dialog' : undefined}
      aria-modal={overlay ? 'true' : undefined}
      aria-label={overlay ? t.eyebrow : undefined}
      style={overlay ? {
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        overflowY: 'auto',
        background: 'rgba(1, 27, 21, 0.78)',
        backdropFilter: 'blur(5px)',
      } : undefined}
    >
      {!overlay ? <div className="research-strip">
        <div className="research-strip-inner">
          <span className="research-strip-copy">{t.banner}</span>
          <a className="research-strip-primary" href={REDCAP_URL} target="_blank" rel="noopener noreferrer">{t.joinNow}</a>
          <a className="research-strip-secondary" href={ASSESSMENT_URL}>{t.quickPlan}</a>
        </div>
      </div> : null}

      {!overlay ? <><div className="study-environment" aria-hidden="true" /><div className="study-flag-texture" aria-hidden="true" /></> : null}

      <button
        className="study-language"
        type="button"
        aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        style={overlay ? { position: 'fixed', top: 18, insetInlineEnd: 18, zIndex: 92 } : undefined}
      >
        {t.switch}
      </button>

      <section className="study-stage" style={overlay ? { minHeight: '100vh', paddingTop: 64, paddingBottom: 32 } : undefined}>
        <div className="study-card" style={overlay ? { boxShadow: '0 30px 90px rgba(0,0,0,.45)' } : undefined}>
          <div className="study-card-shine" aria-hidden="true" />
          <div className="study-content">
            <div className="study-logo-box">
              <img src={LOGO_URL} alt="Aqla — أقلع" className="study-logo" />
            </div>

            <div className="study-eyebrow"><span />{t.eyebrow}<span /></div>
            <div className="study-university">{t.university}</div>

            <h1 className="study-title">{t.title}</h1>
            <p className="study-prize">{t.prize}</p>

            <a className="study-primary-button" href={REDCAP_URL} target="_blank" rel="noopener noreferrer" onClick={dismiss}>
              {t.participate}
            </a>
            {overlay ? <button type="button" className="study-secondary-button" onClick={dismiss}>{t.skip}</button> : <a className="study-secondary-button" href="/aqla">{t.continue}</a>}

            <details className="study-details">
              <summary>{t.details}</summary>
              <div className="study-details-body">
                <p>{t.p1}</p>
                <p>{t.p2}</p>
                <p className="study-details-strong">{t.ethics}</p>
                <p>{t.contact}</p>
                <div className="study-tags">
                  {t.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
            </details>
          </div>
        </div>
      </section>
    </main>
  )
}
