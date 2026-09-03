'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const LOGO_URL = '/aqla-logo.png'
const REDCAP_URL = 'https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM'
const FRONTIERS_URL = 'https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1641308/full'
const ASSESSMENT_URL = '/aqla/assessment'
const OS_URL = '/aqla/os'

type Lang = 'ar' | 'en'
type Theme = 'light' | 'dim' | 'night'
type Localised = { ar: string; en: string }

type Card = {
  title: Localised
  text: Localised
  href: string
  cta: Localised
}

const NAV = [
  { ar: 'الرئيسية', en: 'Home', href: '/' },
  { ar: 'خطة الإقلاع', en: 'Quit plan', href: ASSESSMENT_URL },
  { ar: 'الأدوات', en: 'Tools', href: '/aqla/tools' },
  { ar: 'الأكاديمية', en: 'Academy', href: '/aqla/academy' },
  { ar: 'مساعدة شخص', en: 'Help someone', href: '/aqla/help-someone' },
  { ar: 'المجتمع والتحديات', en: 'Community', href: '/aqla/challenges' },
  { ar: 'عن أقلع', en: 'About', href: '/info/about' },
] as const

const PATHWAYS: Card[] = [
  {
    title: { ar: 'مركز أقلع الافتراضي لدعم الإقلاع', en: 'Aqla Virtual Quit Center' },
    text: { ar: 'مسار منظم يبدأ بفهم استخدام التدخين أو النيكوتين، ثم التقييم، وبناء الخطة، والمتابعة وطلب الدعم عند الحاجة.', en: 'A structured pathway from understanding nicotine use to assessment, planning, follow-up and support.' },
    href: ASSESSMENT_URL,
    cta: { ar: 'ابدأ مسار الإقلاع', en: 'Start the quit pathway' },
  },
  {
    title: { ar: 'أكاديمية أقلع للتعلم والتدريب', en: 'Aqla Academy for Learning and Training' },
    text: { ar: 'مكتبة ثنائية اللغة تقدم وحدات تعليمية وإرشادات عملية لفهم النيكوتين والمحـفزات والرغبة والانسحاب والسلامة والانتكاس.', en: 'A bilingual learning library with practical guidance on nicotine use, triggers, cravings, withdrawal, safety and relapse.' },
    href: '/aqla/academy',
    cta: { ar: 'ادخل الأكاديمية', en: 'Enter the academy' },
  },
  {
    title: { ar: 'مسار مساعدة شخص يهمك', en: 'Help Someone Pathway' },
    text: { ar: 'دعم صديق أو قريب أو طالب أو زميل برسالة أو خطة مساعدة تحترم الخصوصية والاستقلالية.', en: 'Support a friend, relative, student or colleague with privacy-conscious, respectful guidance.' },
    href: '/aqla/help-someone',
    cta: { ar: 'ابدأ مسار المساعدة', en: 'Start the help pathway' },
  },
  {
    title: { ar: 'مجتمع وتحديات أقلع', en: 'Aqla Community and Challenges' },
    text: { ar: 'أنشطة وتحديات للتعلم والمشاركة المجتمعية دون مكافأة الحالة الصحية أو إظهار بيانات فردية.', en: 'Learning and community challenges without rewarding health status or exposing individual health data.' },
    href: '/aqla/challenges',
    cta: { ar: 'استكشف المجتمع', en: 'Explore the community' },
  },
]

const FEATURES = [
  { ar: 'متاح عبر الإنترنت على مدار الساعة', en: 'Available online around the clock' },
  { ar: 'مبني على البيانات والتقييم المنظم', en: 'Structured assessment and data-informed support' },
  { ar: 'قابل للتوسع لخدمة أعداد كبيرة من المستخدمين', en: 'Designed to scale for large participant volumes' },
  { ar: 'دعم سلوكي عملي للمحفزات والرغبة والانتكاس', en: 'Practical behavioural support for triggers, cravings and relapse' },
  { ar: 'تعليم وقائي عن التبغ والنيكوتين', en: 'Preventive education about tobacco and nicotine' },
  { ar: 'فصل واضح بين الدعم الرقمي والقرار الطبي', en: 'Clear separation between digital support and medical decisions' },
]

const MODULES = [
  { no: '01', ar: 'افهم نمط النيكوتين', en: 'Understand your nicotine pattern', descAr: 'لاحظ توقيت الاستخدام والروتين وحدد المنتج الأساسي إذا كنت تستخدم أكثر من منتج.', descEn: 'Notice timing and routines, and identify a primary product if you use more than one.' },
  { no: '02', ar: 'اعرف محفزاتك', en: 'Know your triggers', descAr: 'تعرف على المواقف المتكررة التي ترتبط بالاستخدام وخطط لتغيير روتين واحد في كل مرة.', descEn: 'Identify repeated situations linked to use and plan to change one routine at a time.' },
  { no: '03', ar: 'تعامل مع الرغبة', en: 'Handle a craving', descAr: 'استخدم التأخير وتغيير المكان أو النشاط وخطوات قصيرة حتى تمر موجة الرغبة.', descEn: 'Use delay, a change of place or activity, and short practical steps while the urge passes.' },
  { no: '04', ar: 'توقع أعراض الانسحاب', en: 'Expect withdrawal symptoms', descAr: 'افهم الأعراض الشائعة وخطط للأيام الأولى واطلب تقييمًا مهنيًا عند وجود أعراض شديدة أو مقلقة.', descEn: 'Understand common symptoms, plan for the early days, and seek professional assessment for severe or concerning symptoms.' },
  { no: '05', ar: 'تعافَ من الزلة بسرعة', en: 'Recover quickly from a slip', descAr: 'تعامل مع الزلة كمعلومة تساعدك على تعديل الخطة بدل اعتبارها نهاية للمحاولة.', descEn: 'Treat a slip as information for adjusting the plan rather than the end of the attempt.' },
  { no: '06', ar: 'حافظ على التقدم', en: 'Maintain progress', descAr: 'راجع المواقف عالية الخطورة وابنِ روتينًا بديلًا يمكن الاستمرار عليه واطلب الدعم عند الحاجة.', descEn: 'Review higher-risk situations, build sustainable replacement routines and seek support when needed.' },
]

const SELF_TOOLS: Card[] = [
  { title: { ar: 'عدّاد المال', en: 'Money counter' }, text: { ar: 'قدّر ما تنفقه على منتجات التدخين أو النيكوتين.', en: 'Estimate spending on smoking or nicotine products.' }, href: '/aqla/tools', cta: { ar: 'افتح الأداة', en: 'Open tool' } },
  { title: { ar: 'فحص نمط الاعتماد', en: 'Dependence pattern check' }, text: { ar: 'استكشف نمط علاقتك بالنيكوتين دون اعتبار النتيجة تشخيصًا.', en: 'Explore your nicotine-use pattern without treating the result as a diagnosis.' }, href: '/aqla/tools', cta: { ar: 'افتح الأداة', en: 'Open tool' } },
  { title: { ar: 'المرآة السلوكية', en: 'Behavioural mirror' }, text: { ar: 'تعرف على المواقف والعادات التي تحافظ على الاستخدام.', en: 'Identify situations and routines that keep nicotine use going.' }, href: '/aqla/tools', cta: { ar: 'افتح الأداة', en: 'Open tool' } },
  { title: { ar: 'مؤشر الاستعداد', en: 'Readiness check' }, text: { ar: 'استكشف مدى استعدادك لخطوة عملية في الوقت الحالي.', en: 'Explore your readiness for a practical next step.' }, href: '/aqla/tools', cta: { ar: 'افتح الأداة', en: 'Open tool' } },
  { title: { ar: 'تحدي كسر العادة', en: 'Break-the-habit challenge' }, text: { ar: 'نشاط قصير للتوعية والانتباه إلى السلوك التلقائي المرتبط بالتدخين.', en: 'A short awareness activity focused on automatic smoking-related behaviour.' }, href: '/aqla/challenges', cta: { ar: 'ابدأ التحدي', en: 'Start challenge' } },
]

function t(value: Localised, lang: Lang) { return value[lang] }

function SectionHeading({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return <div className="aqla-section-heading">
    {eyebrow ? <small>{eyebrow}</small> : null}
    <h2>{title}</h2>
    {text ? <p>{text}</p> : null}
  </div>
}

function track(metric: 'research_clicks' | 'support_entry_clicks') {
  void fetch('/api/analytics/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ metric }), keepalive: true }).catch(() => undefined)
}

export default function AqlaPublicLandingInstitutional({ signedIn, latestPlanId, initialVisitCount }: { signedIn: boolean; latestPlanId?: string; initialVisitCount: number }) {
  const [lang, setLang] = useState<Lang>('ar')
  const [theme, setTheme] = useState<Theme>('night')
  const [menuOpen, setMenuOpen] = useState(false)
  const [visitCount, setVisitCount] = useState(initialVisitCount)
  const visitSent = useRef(false)
  const ar = lang === 'ar'
  const savedPlanUrl = latestPlanId ? `/aqla/plan/${encodeURIComponent(latestPlanId)}?lang=${lang}` : '/aqla/dashboard'
  const formattedVisits = new Intl.NumberFormat(ar ? 'ar-SA' : 'en-GB').format(visitCount)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aqla_display_mode') as Theme | null
      if (saved === 'light' || saved === 'dim' || saved === 'night') setTheme(saved)
    } catch { /* use night */ }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.aqlaTheme = theme
    try { localStorage.setItem('aqla_display_mode', theme) } catch { /* preference is optional */ }
  }, [theme])

  useEffect(() => {
    if (visitSent.current) return
    visitSent.current = true
    void fetch('/api/analytics/visit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}', keepalive: true })
      .then(async (response) => {
        if (!response.ok) return
        const payload = await response.json() as { visits?: number }
        if (typeof payload.visits === 'number' && Number.isFinite(payload.visits)) setVisitCount(payload.visits)
      })
      .catch(() => undefined)
  }, [])

  function clearPrivateBrowserData() {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      try {
        for (let index = storage.length - 1; index >= 0; index -= 1) {
          const key = storage.key(index)
          if (key?.startsWith('aqla_quit_plan:') || key?.startsWith('aqla_adaptive_plan_')) storage.removeItem(key)
        }
      } catch { /* server logout still proceeds */ }
    }
  }

  const themeLabels: Record<Theme, Localised> = {
    light: { ar: 'فاتح', en: 'Light' },
    dim: { ar: 'خافت', en: 'Dim' },
    night: { ar: 'ليلي', en: 'Night' },
  }

  return <div className="aqla-site" dir={ar ? 'rtl' : 'ltr'} lang={lang}>
    <div className="aqla-utility-strip">
      <div className="aqla-utility-inner">
        <span className="aqla-utility-copy">{ar ? 'تجربتك تهمنا وتساهم في البحث العلمي' : 'Your experience matters and contributes to scientific research'}</span>
        <a className="aqla-utility-link" href={REDCAP_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('research_clicks')}>{ar ? 'شارك الآن في الدراسة' : 'Take part in the study'}</a>
        <Link className="aqla-utility-link" href={ASSESSMENT_URL} onClick={() => track('support_entry_clicks')}>{ar ? 'ابدأ خطة الإقلاع السريعة مع د. مالك' : 'Start a quick quit plan with Dr Malik'}</Link>
        <Link className="aqla-utility-link" href="/aqla/share">{ar ? 'أنشئ بطاقة إنجازك' : 'Create your progress card'}</Link>
        <span className="aqla-utility-visits" aria-live="polite">{formattedVisits} {ar ? 'زيارة' : 'visits'}</span>
        <button type="button" className="aqla-language-button" onClick={() => setLang(ar ? 'en' : 'ar')}>{ar ? 'English' : 'العربية'}</button>
      </div>
    </div>

    <header className="aqla-main-header">
      <div className="aqla-main-header-inner">
        <Link href="/" className="aqla-brand-lockup">
          <Image src={LOGO_URL} alt="Aqla — أقلع" width={400} height={225} priority />
          <div className="aqla-brand-copy"><strong>{ar ? 'أقلع' : 'Aqla'}</strong><span>{ar ? 'دعم رقمي منظم للإقلاع عن التدخين والنيكوتين' : 'Structured digital smoking and nicotine cessation support'}</span></div>
        </Link>

        <nav className="aqla-primary-nav" aria-label={ar ? 'التنقل الرئيسي' : 'Primary navigation'}>
          {NAV.map((item) => <Link key={item.href} href={item.href}>{ar ? item.ar : item.en}</Link>)}
        </nav>

        <div className="aqla-header-controls">
          <div className="aqla-theme-control" aria-label={ar ? 'نمط العرض' : 'Display mode'}>
            {(['light', 'dim', 'night'] as Theme[]).map((mode) => <button key={mode} type="button" data-active={theme === mode} onClick={() => setTheme(mode)}>{t(themeLabels[mode], lang)}</button>)}
          </div>
          {signedIn ? <>
            <Link className="aqla-text-button" href={savedPlanUrl}>{ar ? 'لوحتي' : 'My Aqla'}</Link>
            <Link className="aqla-account-button" href="/auth/logout" onClick={clearPrivateBrowserData}>{ar ? 'تسجيل الخروج' : 'Sign out'}</Link>
          </> : <>
            <Link className="aqla-account-button" href="/auth/login?returnTo=%2Faqla%2Fassessment">{ar ? 'دخول / إنشاء حساب' : 'Sign in / Create account'}</Link>
            <Link className="aqla-staff-button" href="/auth/login?returnTo=%2Faqla%2Fadmin">{ar ? 'دخول الموظفين' : 'Staff login'}</Link>
          </>}
          <button className="aqla-text-button" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>{ar ? 'القائمة' : 'Menu'}</button>
        </div>
      </div>
      <nav className="aqla-mobile-nav" data-open={menuOpen} aria-label={ar ? 'القائمة المتنقلة' : 'Mobile navigation'}>
        {NAV.map((item) => <Link key={`mobile-${item.href}`} href={item.href} onClick={() => setMenuOpen(false)}>{ar ? item.ar : item.en}</Link>)}
        <div className="aqla-theme-control" style={{ marginTop: 8 }}>
          {(['light', 'dim', 'night'] as Theme[]).map((mode) => <button key={`mobile-${mode}`} type="button" data-active={theme === mode} onClick={() => setTheme(mode)}>{t(themeLabels[mode], lang)}</button>)}
        </div>
      </nav>
    </header>

    <main>
      <section className="aqla-hero-institutional">
        <div className="aqla-hero-inner">
          <Image className="aqla-hero-logo" src={LOGO_URL} alt="Aqla — أقلع" width={400} height={225} priority />
          <div className="aqla-eyebrow">{ar ? 'منصة أقلع' : 'Aqla platform'}</div>
          <h1 className="aqla-hero-title">{ar ? 'دعم منظم للإقلاع عن التدخين والنيكوتين' : 'Structured support for smoking and nicotine cessation'}</h1>
          <p className="aqla-hero-copy">{ar ? 'منصة علمية رقمية تجمع بين التقييم التكيفي، الخطة الشخصية، المتابعة، الأدوات التعليمية، ومسارات الدعم مع الحفاظ على حدود واضحة للسلامة والقرار الطبي.' : 'A digital, evidence-informed platform combining adaptive assessment, personal planning, follow-up, learning tools and support pathways while maintaining clear clinical safety boundaries.'}</p>
          <div className="aqla-action-row">
            <Link className="aqla-primary-action" href={ASSESSMENT_URL} onClick={() => track('support_entry_clicks')}>{ar ? 'ابدأ خطة الإقلاع' : 'Start a quit plan'}</Link>
            <Link className="aqla-secondary-action" href="/aqla/academy">{ar ? 'التعلم والتدريب' : 'Learning and training'}</Link>
          </div>
          <div className="aqla-hero-note">{ar ? 'يمكنك البدء كضيف. التسجيل مطلوب فقط للحفظ طويل المدى والبريد والمتابعة داخل الحساب.' : 'You can start as a guest. Registration is only required for long-term saving, email and account-based follow-up.'}</div>
        </div>
      </section>

      <section className="aqla-section" data-tone="strong">
        <div className="aqla-section-inner">
          <SectionHeading eyebrow={ar ? 'البحث العلمي' : 'Research'} title={ar ? 'أحدث أبحاثنا المنشورة' : 'Recent published research'} />
          <a className="aqla-card aqla-research-card" href={FRONTIERS_URL} target="_blank" rel="noopener noreferrer">
            <strong>{ar ? 'انتشار استخدام التبغ وأنماطه بين البالغين السعوديين' : 'Published research on tobacco-use patterns among Saudi adults'}</strong>
            <span>Frontiers in Public Health · 2025</span>
          </a>
          <div className="aqla-grid three" style={{ marginTop: 16 }}>
            {SELF_TOOLS.slice(0, 3).map((item, index) => <article className="aqla-card" key={item.title.ar}><span className="aqla-card-number">{String(index + 1).padStart(2, '0')}</span><h3>{t(item.title, lang)}</h3><p>{t(item.text, lang)}</p><Link className="aqla-card-link" href={item.href}>{t(item.cta, lang)}</Link></article>)}
          </div>
        </div>
      </section>

      <section className="aqla-section">
        <div className="aqla-section-inner">
          <SectionHeading eyebrow={ar ? 'المسارات الرئيسية' : 'Core pathways'} title={ar ? 'اختر المسار الذي يناسب احتياجك الآن' : 'Choose the pathway that fits what you need now'} text={ar ? 'كل مسار له غرض واضح، مع إبقاء التنقل الرئيسي بسيطًا ومنظمًا.' : 'Each pathway has a clear purpose while keeping the main navigation simple and structured.'} />
          <div className="aqla-grid four">
            {PATHWAYS.map((item, index) => <article className="aqla-card" data-emphasis={index === 0 ? 'true' : 'false'} key={item.href}><span className="aqla-card-number">{String(index + 1).padStart(2, '0')}</span><h3>{t(item.title, lang)}</h3><p>{t(item.text, lang)}</p><Link className="aqla-card-link" href={item.href} onClick={item.href === ASSESSMENT_URL ? () => track('support_entry_clicks') : undefined}>{t(item.cta, lang)}</Link></article>)}
          </div>
        </div>
      </section>

      <section className="aqla-section" data-tone="deep">
        <div className="aqla-section-inner aqla-grid two">
          <div>
            <SectionHeading eyebrow={ar ? 'الدعم الذكي' : 'Adaptive support'} title={ar ? 'دكتور مالك — مدرب أقلع الذكي' : 'Dr Malik — Aqla adaptive coach'} text={ar ? 'يستخدم بيانات التقييم المنظمة لتخصيص الدعم للسجائر أو الفيب أو أكياس النيكوتين أو الاستخدام المختلط، مع بقاء قواعد السلامة والفرز والمقاييس المحددة مسبقًا أعلى من الذكاء الاصطناعي.' : 'Uses structured assessment data to tailor support for cigarettes, vaping, nicotine pouches or mixed use, while deterministic safety, triage and scoring remain authoritative.'} />
            <ul className="aqla-text-list">
              <li>{ar ? 'تخصيص مبني على نوع المنتج ونمط الاستخدام والمحفزات.' : 'Personalisation based on product type, use pattern and triggers.'}</li>
              <li>{ar ? 'لا يقدم تشخيصًا أو وصفة أو جرعة دوائية.' : 'Does not diagnose, prescribe or choose medication doses.'}</li>
              <li>{ar ? 'يعمل مع مسارات متابعة منظمة عند تسجيل المستخدم وموافقته.' : 'Supports structured follow-up when the user registers and opts in.'}</li>
              <li>{ar ? 'يراعي السياق السعودي واللغة العربية.' : 'Designed for Saudi context and Arabic-first use.'}</li>
            </ul>
            <div className="aqla-action-row" style={{ justifyContent: ar ? 'flex-start' : 'flex-start' }}><Link className="aqla-primary-action" href={OS_URL}>{ar ? 'ابدأ محادثة' : 'Start a conversation'}</Link></div>
          </div>
          <div className="aqla-card" data-emphasis="true">
            <span className="aqla-card-number">{ar ? 'هيكل الدعم' : 'Support structure'}</span>
            <h3>{ar ? 'تقييم ثم فرز ثم خطة ثم متابعة' : 'Assessment, triage, plan and follow-up'}</h3>
            <p>{ar ? 'لا تعتمد أقلع على محادثة عامة فقط. الأسئلة تتغير حسب المنتج، ثم يتم إنشاء ملف فرز متعدد الأبعاد يوجه الخطة والمتابعة.' : 'Aqla does not rely on general chat alone. Questions branch by product, then a multidimensional triage profile guides the plan and follow-up.'}</p>
          </div>
        </div>
      </section>

      <section className="aqla-section" id="about-founder">
        <div className="aqla-section-inner">
          <SectionHeading eyebrow={ar ? 'مؤسس البرنامج' : 'Programme founder'} title={ar ? 'الدكتور مالك الذبياني' : 'Dr Malik Althobiani'} />
          <div className="aqla-card aqla-founder-layout">
            <div className="aqla-founder-mark"><Image src={LOGO_URL} alt="Aqla — أقلع" width={400} height={225} /><strong>{ar ? 'الدكتور مالك الذبياني' : 'Dr Malik Althobiani'}</strong><span>{ar ? 'مؤسس برنامج أقلع' : 'Founder of Aqla'}</span></div>
            <div className="aqla-founder-copy">
              <p>{ar ? 'الدكتور مالك الذبياني باحث في أمراض الجهاز التنفسي ومحاضر شرفي في جامعة كوليدج لندن.' : 'Dr Malik Althobiani is a respiratory researcher and an Honorary Lecturer at University College London.'}</p>
              <p>{ar ? 'حاصل على دكتوراه الفلسفة من جامعة كوليدج لندن عام ٢٠٢٤، مع خلفية أكاديمية في رعاية الجهاز التنفسي والعلاج التنفسي والصيدلة.' : 'He completed his PhD at University College London in 2024, with academic training in respiratory care, respiratory therapy and pharmacy.'}</p>
              <Link className="aqla-card-link" href="/info/about">{ar ? 'تعرف أكثر على المؤسس' : 'Learn more about the founder'}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="aqla-section" data-tone="strong">
        <div className="aqla-section-inner">
          <SectionHeading eyebrow={ar ? 'مميزات البرنامج' : 'Programme features'} title={ar ? 'تصميم يجمع بين الوضوح والبيانات والدعم' : 'A design built around clarity, data and support'} />
          <div className="aqla-grid three">{FEATURES.map((item, index) => <article className="aqla-card" key={item.ar}><span className="aqla-card-number">{String(index + 1).padStart(2, '0')}</span><h3>{ar ? item.ar : item.en}</h3></article>)}</div>
        </div>
      </section>

      <section className="aqla-section">
        <div className="aqla-section-inner">
          <SectionHeading eyebrow={ar ? 'المسار التعليمي' : 'Learning pathway'} title={ar ? 'الوحدات التعليمية' : 'Learning modules'} text={ar ? 'ست وحدات تعليمية قصيرة تعكس المحتوى المتاح حاليًا داخل أكاديمية أقلع.' : 'Six concise modules reflecting the learning content currently available in the Aqla Academy.'} />
          <div className="aqla-grid three">
            {MODULES.map((module) => <article className="aqla-card" key={module.no}><span className="aqla-card-number">{ar ? `الوحدة ${module.no}` : `Module ${module.no}`}</span><h3>{ar ? module.ar : module.en}</h3><p>{ar ? module.descAr : module.descEn}</p><Link className="aqla-card-link" href="/aqla/academy">{ar ? 'ابدأ التعلم' : 'Start learning'}</Link></article>)}
          </div>
        </div>
      </section>

      <section className="aqla-section" data-tone="deep">
        <div className="aqla-section-inner">
          <SectionHeading eyebrow={ar ? 'الأدوات التفاعلية' : 'Interactive tools'} title={ar ? 'أدوات قصيرة ومباشرة' : 'Short, focused tools'} text={ar ? 'التنظيم يعتمد على عناوين واضحة وأرقام وتسلسل بصري، لا على الرموز أو الصور الزخرفية.' : 'Organisation relies on headings, numbering and visual hierarchy rather than decorative icons or imagery.'} />
          <div className="aqla-grid three">{SELF_TOOLS.map((item, index) => <article className="aqla-card" key={item.title.ar}><span className="aqla-card-number">{String(index + 1).padStart(2, '0')}</span><h3>{t(item.title, lang)}</h3><p>{t(item.text, lang)}</p><Link className="aqla-card-link" href={item.href}>{t(item.cta, lang)}</Link></article>)}</div>
        </div>
      </section>

      <section className="aqla-section">
        <div className="aqla-section-inner"><div className="aqla-notice">{ar ? 'أقلع يقدم التوعية والدعم ولا يقدم تشخيصًا أو علاجًا أو وصفة طبية. اختيار بدائل النيكوتين أو أدوية الإقلاع أو جرعاتها يحتاج مراجعة مختص أو صيدلي.' : 'Aqla provides awareness and support and does not diagnose, prescribe or choose medication doses. Medication decisions require an appropriate clinician or pharmacist.'}</div></div>
      </section>

      <section className="aqla-final-cta">
        <h2>{ar ? 'ابدأ رحلتك مع أقلع' : 'Start your Aqla journey'}</h2>
        <p>{ar ? 'يمكنك تجربة الأدوات والخطة كضيف. إذا أردت الحفظ والمتابعة عبر البريد ولوحة أقلع، يمكنك إنشاء حساب في أي وقت.' : 'Use the tools and quit plan as a guest. Create an account at any time for saving, email follow-up and My Aqla.'}</p>
        <div className="aqla-action-row"><Link className="aqla-primary-action" href={ASSESSMENT_URL}>{ar ? 'ابدأ الآن' : 'Start now'}</Link><Link className="aqla-secondary-action" href="/aqla/tools">{ar ? 'استكشف الأدوات' : 'Explore tools'}</Link></div>
      </section>
    </main>

    <footer className="aqla-footer-institutional">
      <div className="aqla-footer-inner">
        <div><strong>Aqla — أقلع</strong><div style={{ marginTop: 7, fontSize: 12 }}>{ar ? 'منصة للتوعية والدعم — ليست خدمة طوارئ' : 'Awareness and support platform — not an emergency service'}</div><div style={{ marginTop: 4, fontSize: 11 }}>{ar ? 'جدة، المملكة العربية السعودية' : 'Jeddah, Saudi Arabia'}</div></div>
        <div className="aqla-footer-links"><Link href="/info/about">{ar ? 'عن أقلع' : 'About'}</Link><Link href="/aqla/community">{ar ? 'أثر أقلع' : 'Impact'}</Link><Link href="/info/contact">{ar ? 'تواصل معنا' : 'Contact'}</Link><Link href="/info/faq">{ar ? 'الأسئلة الشائعة' : 'FAQ'}</Link><Link href="/info/privacy">{ar ? 'الخصوصية' : 'Privacy'}</Link><Link href="/info/terms">{ar ? 'الشروط' : 'Terms'}</Link><Link href="/info/medical-disclaimer">{ar ? 'التنبيه الطبي' : 'Medical disclaimer'}</Link><Link href="/info/accessibility">{ar ? 'إمكانية الوصول' : 'Accessibility'}</Link></div>
      </div>
      <div className="aqla-footer-note">{ar ? 'لا نعرض بياناتك الصحية في المشاركات العامة. أقلع لا يقدم تشخيصًا أو علاجًا أو وصفة طبية.' : 'Aqla does not expose health details in public sharing and does not provide diagnosis or prescriptions.'}</div>
    </footer>
  </div>
}
