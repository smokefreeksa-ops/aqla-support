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
type Localised = { ar: string; en: string }
type NavItem = Localised & { href: string }

type CardItem = {
  title: Localised
  text: Localised
  href: string
  cta: Localised
  icon?: string
}

const NAV: NavItem[] = [
  { ar: 'الرئيسية', en: 'Home', href: '/' },
  { ar: 'مسار الإقلاع', en: 'Quit Pathway', href: ASSESSMENT_URL },
  { ar: 'مسار المساعدة', en: 'Help Someone', href: '/aqla/help-someone' },
  { ar: 'التحديات والأنشطة', en: 'Challenges & Activities', href: '/aqla/challenges' },
  { ar: 'أقلع الشخصي', en: 'Personal Aqla', href: OS_URL },
  { ar: 'المساعد الصوتي', en: 'Voice Assistant', href: OS_URL },
  { ar: 'فحص الرغبة الصوتي', en: 'Voice Craving Scan', href: '/aqla/tools' },
  { ar: 'التعلم والتدريب', en: 'Learn & Train', href: '/aqla/academy' },
  { ar: 'الشهادات', en: 'Certificates', href: '/aqla/academy' },
  { ar: 'طلب الدعم', en: 'Request Support', href: OS_URL },
  { ar: 'أثر أقلع', en: 'Impact', href: '/aqla/community' },
  { ar: 'عن أقلع', en: 'About', href: '/info/about' },
  { ar: 'الأسئلة الشائعة', en: 'FAQ', href: '/info/faq' },
]

const PATHWAYS: CardItem[] = [
  {
    icon: '✦',
    title: { ar: 'مركز أقلع الافتراضي لدعم الإقلاع', en: 'Aqla Virtual Quit Center' },
    text: {
      ar: 'تجربة تفاعلية تقودك من فهم استخدامك للتدخين أو النيكوتين، إلى التقييم، وبناء الخطة، والمتابعة، وطلب الدعم عند الحاجة.',
      en: 'An interactive journey from understanding nicotine use to assessment, planning, follow-up and support.',
    },
    href: ASSESSMENT_URL,
    cta: { ar: 'ادخل مركز الإقلاع', en: 'Enter Quit Center' },
  },
  {
    icon: '🎓',
    title: { ar: 'أكاديمية أقلع للتدريب والشهادات', en: 'Aqla Academy for Training & Certification' },
    text: {
      ar: 'مركز تعليمي تفاعلي للتدريب، السيناريوهات، الاختبارات، والشهادات القابلة للتحميل والمشاركة والتحقق.',
      en: 'Interactive learning, scenarios, assessments and certificate pathways.',
    },
    href: '/aqla/academy',
    cta: { ar: 'ادخل الأكاديمية', en: 'Enter Academy' },
  },
  {
    icon: '🤝',
    title: { ar: 'مسار أقلع لمساعدة شخص يهمك', en: 'Aqla Help Pathway' },
    text: {
      ar: 'لمن يريد دعم صديق، قريب، طالب، زميل، أو شخص يهتم لأمره برسالة أو بطاقة دعم محترمة وآمنة.',
      en: 'Support a friend, relative, student or colleague with a respectful and safe message or card.',
    },
    href: '/aqla/help-someone',
    cta: { ar: 'ابدأ مسار المساعدة', en: 'Start Help Pathway' },
  },
  {
    icon: '🏆',
    title: { ar: 'مجتمع وتحديات أقلع', en: 'Aqla Community & Challenges' },
    text: {
      ar: 'للتحديات، الألعاب التوعوية، الهاشتاقات، دعوة الأصدقاء، النقاط، الأوسمة، بطاقات التوعية، وأثر أقلع المجتمعي.',
      en: 'Challenges, awareness activities, participation points, cards and community impact.',
    },
    href: '/aqla/challenges',
    cta: { ar: 'ادخل التحديات والمجتمع', en: 'Enter Community & Challenges' },
  },
]

const FEATURES: { title: Localised; text: Localised }[] = [
  {
    title: { ar: 'متاح 24/7', en: 'Available 24/7' },
    text: { ar: 'يمكنك الوصول إلى البرنامج في أي وقت ومن أي مكان عبر الإنترنت.', en: 'Access Aqla online whenever you need it.' },
  },
  {
    title: { ar: 'مستدام', en: 'Sustainable' },
    text: { ar: 'برنامج مستدام ذاتياً يضمن المشاركة المستمرة ويحافظ على فعاليته.', en: 'Designed for continued digital engagement.' },
  },
  {
    title: { ar: 'قابل للتوسع', en: 'Scalable' },
    text: { ar: 'يتكيف بسهولة مع زيادة عدد المستخدمين دون الحاجة لموارد إضافية مماثلة.', en: 'AWS-native architecture designed to scale with demand.' },
  },
  {
    title: { ar: 'مبني على البيانات', en: 'Data-informed' },
    text: { ar: 'يستخدم مؤشرات أداء لقياس فعالية البرنامج وتحسينه باستمرار.', en: 'Uses structured metrics to support ongoing improvement.' },
  },
  {
    title: { ar: 'تثقيف وقائي', en: 'Preventive education' },
    text: { ar: 'تعليم شامل عن مخاطر التدخين والوقاية لتعزيز الوعي الصحي المجتمعي.', en: 'Educational content supporting tobacco and nicotine awareness.' },
  },
  {
    title: { ar: 'دعم سلوكي', en: 'Behavioural support' },
    text: { ar: 'أدوات وتقنيات لإدارة التوتر واتخاذ القرار لتجاوز التحديات السلوكية.', en: 'Practical tools for triggers, cravings and decision-making.' },
  },
]

const MODULES = [
  { no: '01', mins: '20', ar: 'أساسيات التبغ والنيكوتين والصحة العامة', en: 'Tobacco, nicotine & public-health fundamentals', desc: 'حقائق موثقة من WHO وCDC حول التبغ ودور المتطوع التوعوي.', tags: '#WHO  #CDC', questions: '8' },
  { no: '02', mins: '20', ar: 'الاعتماد والانسحاب واستخدام المنتجات', en: 'Dependence, withdrawal & product use', desc: 'علامات الاعتماد، الانسحاب، والاستخدام المزدوج، والفرق بين الفرز والتشخيص.', tags: '#dependence', questions: '8' },
  { no: '03', mins: '18', ar: 'مهارات التواصل', en: 'Communication skills', desc: 'طلب الإذن، الأسئلة المفتوحة، الاستماع العاكس، واحترام الاستقلالية.', tags: '#communication', questions: '8' },
  { no: '04', mins: '22', ar: 'الاستعداد والتخطيط للإقلاع', en: 'Readiness & quit planning', desc: 'تقييم الاستعداد، اختيار يوم الإقلاع، وتحديد المحفزات وطرق التعامل.', tags: '#planning', questions: '8' },
  { no: '05', mins: '18', ar: 'الرغبة والانتكاسة والدعم اللطيف', en: 'Cravings, relapse & compassionate support', desc: 'التعامل مع الرغبة والانتكاسة دون لوم أو وصم.', tags: '#coping', questions: '8' },
  { no: '06', mins: '25', ar: 'السلامة والحدود والإحالة', en: 'Safety, boundaries & referral', desc: 'الطوارئ، حماية القُصّر، الحمل، الأدوية، وحدود السرية.', tags: '#safety', questions: '8' },
  { no: '07', mins: '20', ar: 'التطبيق المجتمعي ومسارات أقلع', en: 'Community application & Aqla pathways', desc: 'أخلاقيات الفعاليات، الخصوصية، والإحالة إلى المسارات الرسمية.', tags: '#outreach', questions: '8' },
]

const QUICK_TOOLS: CardItem[] = [
  { icon: '💸', title: { ar: 'عدّاد المال', en: 'Money counter' }, text: { ar: 'شاهد كم يكلفك التدخين فعلاً.', en: 'Estimate what nicotine use costs you.' }, href: '/aqla/tools', cta: { ar: '⏱ ≈ دقيقة', en: '⏱ ≈ 1 minute' } },
  { icon: '🧲', title: { ar: 'اختبار القبضة', en: 'Dependence grip' }, text: { ar: 'كم قبضة النيكوتين عليك؟', en: 'Explore your nicotine-use pattern.' }, href: '/aqla/tools', cta: { ar: '⏱ ≈ دقيقة', en: '⏱ ≈ 1 minute' } },
  { icon: '🪞', title: { ar: 'المرآة', en: 'The mirror' }, text: { ar: 'أي جوانبك تبقي التدخين مشتعلاً؟', en: 'Reflect on what keeps nicotine use going.' }, href: '/aqla/tools', cta: { ar: '⏱ ≈ دقيقة', en: '⏱ ≈ 1 minute' } },
  { icon: '🧭', title: { ar: 'البوصلة', en: 'The compass' }, text: { ar: 'كم أنت مستعد للإقلاع فعلاً؟', en: 'Explore your current readiness.' }, href: '/aqla/tools', cta: { ar: '⏱ ≈ دقيقة', en: '⏱ ≈ 1 minute' } },
]

function t(value: Localised, lang: Lang) {
  return value[lang]
}

function track(metric: 'research_clicks' | 'support_entry_clicks') {
  void fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ metric }),
    keepalive: true,
  }).catch(() => undefined)
}

function SectionTitle({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      {eyebrow ? <div className="text-xs font-bold tracking-[0.18em] text-[#d6b45f]">{eyebrow}</div> : null}
      <h2 className="mt-2 text-3xl font-bold text-[#fffaf0] sm:text-4xl">{title}</h2>
      {text ? <p className="mt-3 leading-7 text-[#e8dfc8]/75">{text}</p> : null}
    </div>
  )
}

function Logo({ className = 'h-10 w-auto' }: { className?: string }) {
  return <Image src={LOGO_URL} alt="Aqla — أقلع" width={400} height={225} className={className} priority />
}

export default function AqlaPublicLandingV2({
  signedIn,
  latestPlanId,
  initialVisitCount,
}: {
  signedIn: boolean
  latestPlanId?: string
  initialVisitCount: number
}) {
  const [lang, setLang] = useState<Lang>('ar')
  const [menuOpen, setMenuOpen] = useState(false)
  const [visitCount, setVisitCount] = useState(initialVisitCount)
  const visitSent = useRef(false)
  const ar = lang === 'ar'
  const savedPlanUrl = latestPlanId ? `/aqla/plan/${encodeURIComponent(latestPlanId)}?lang=${lang}` : undefined
  const formattedVisits = new Intl.NumberFormat(ar ? 'ar-SA' : 'en-GB').format(visitCount)

  useEffect(() => {
    if (visitSent.current) return
    visitSent.current = true
    void fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
      keepalive: true,
    }).then(async (response) => {
      if (!response.ok) return
      const payload = await response.json() as { visits?: number }
      if (typeof payload.visits === 'number' && Number.isFinite(payload.visits)) setVisitCount(payload.visits)
    }).catch(() => undefined)
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

  return (
    <div dir={ar ? 'rtl' : 'ltr'} lang={lang} className="min-h-screen bg-[#042f23] text-[#f7f0dc]">
      <header className="sticky top-0 z-40 border-b border-[#d6b45f]/20 bg-[#052f24]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
            <div className="leading-tight">
              <strong className="block text-sm">{ar ? 'أقلع' : 'Aqla'}</strong>
              <span className="text-[10px] text-[#e8dfc8]/60">Aqla — أقلع</span>
            </div>
          </Link>

          <nav className="hidden max-w-[830px] flex-wrap items-center justify-center gap-x-3 gap-y-1 xl:flex" aria-label={ar ? 'التنقل الرئيسي' : 'Primary navigation'}>
            {NAV.map((item) => <Link key={`${item.href}-${item.ar}`} href={item.href} className="text-[12px] font-medium text-[#f7f0dc]/75 transition hover:text-[#d6b45f]">{t(item, lang)}</Link>)}
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setLang(ar ? 'en' : 'ar')} className="rounded-lg border border-[#d6b45f]/30 px-3 py-2 text-xs font-semibold">{ar ? 'EN' : 'ع'}</button>
            {signedIn ? (
              <>
                <Link href={savedPlanUrl ?? '/aqla/dashboard'} className="hidden rounded-lg border border-[#d6b45f]/30 px-3 py-2 text-xs sm:block">{ar ? 'لوحتي' : 'Dashboard'}</Link>
                <Link href="/auth/logout" onClick={clearPrivateBrowserData} className="hidden rounded-lg bg-[#d6b45f] px-3 py-2 text-xs font-bold text-[#042f23] sm:block">{ar ? 'تسجيل الخروج' : 'Sign out'}</Link>
              </>
            ) : (
              <>
                <Link href="/auth/login?returnTo=%2Faqla%2Fadmin" className="hidden rounded-lg border border-[#d6b45f]/30 px-3 py-2 text-xs md:block">{ar ? 'دخول الموظفين' : 'Staff login'}</Link>
                <Link href={ASSESSMENT_URL} className="hidden rounded-lg bg-[#d6b45f] px-3 py-2 text-xs font-bold text-[#042f23] sm:block">{ar ? 'ابدأ الآن' : 'Start now'}</Link>
              </>
            )}
            <button type="button" aria-label={ar ? 'فتح القائمة' : 'Open menu'} onClick={() => setMenuOpen((value) => !value)} className="rounded-lg border border-[#d6b45f]/30 px-3 py-2 xl:hidden">☰</button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="grid max-h-[70vh] gap-1 overflow-y-auto border-t border-[#d6b45f]/15 px-4 py-3 xl:hidden">
            {NAV.map((item) => <Link key={`mobile-${item.href}-${item.ar}`} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-white/5">{t(item, lang)}</Link>)}
          </nav>
        ) : null}

        <div className="bg-[#d6b45f] text-[#052f24]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-2 text-center text-xs font-bold sm:text-sm">
            <span>{ar ? 'تجربتك تهمنا وتساهم في البحث العلمي' : 'Your experience matters and contributes to scientific research'}</span>
            <a href={REDCAP_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('research_clicks')} className="underline underline-offset-2">{ar ? 'شارك الآن في الدراسة' : 'Take part in the study'}</a>
          </div>
        </div>

        <div className="border-t border-white/5 bg-[#07382b]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-2 text-xs text-[#f7f0dc]/85">
            <Link href={ASSESSMENT_URL} onClick={() => track('support_entry_clicks')} className="font-semibold hover:text-[#d6b45f]">{ar ? 'ابدأ خطة الإقلاع السريعة مع د. مالك' : 'Start a quick Aqla quit plan'}</Link>
            <Link href="/aqla/share" className="font-semibold hover:text-[#d6b45f]">{ar ? 'أنشئ بطاقة إنجازك' : 'Create your progress card'}</Link>
            <span aria-live="polite" className="font-bold text-[#d6b45f]">{formattedVisits} {ar ? 'زيارة' : 'visits'}</span>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,180,95,0.14),transparent_48%)]" />
          <div className="relative mx-auto max-w-5xl text-center">
            <Logo className="mx-auto h-28 w-auto object-contain sm:h-36" />
            <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-7xl">{ar ? 'أقلع عن التدخين' : 'Quit smoking with Aqla'}</h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#e8dfc8]/80">{ar ? 'منصة علمية متكاملة لدعم الإقلاع عن التدخين — مبنية على أحدث الأدلة السريرية وتجمع بين التقنية والرعاية الشخصية لتحقيق نتائج مستدامة.' : 'An evidence-informed digital platform combining technology, structured assessment and personalised cessation support.'}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={ASSESSMENT_URL} onClick={() => track('support_entry_clicks')} className="rounded-xl bg-[#d6b45f] px-6 py-3 font-bold text-[#042f23]">{ar ? 'أريد أن أتوقف عن التدخين' : 'I want to quit'}</Link>
              <Link href="/aqla/academy" className="rounded-xl border border-[#d6b45f]/50 px-6 py-3 font-bold">{ar ? 'شهادات ودورات الأخصائي المعتمد' : 'Training & certificates'}</Link>
            </div>
            <p className="mt-4 text-sm text-[#e8dfc8]/60">{ar ? 'مجاناً تماماً • مدعوم بالأدلة العلمية • ابدأ الآن' : 'Free to use • Evidence-informed • Start now'}</p>
            <Link href="/info/about" className="mt-8 inline-block text-sm font-semibold text-[#d6b45f] underline underline-offset-4">{ar ? 'شاهد الفيديو التعريفي' : 'Learn about Aqla'}</Link>
          </div>
        </section>

        <section className="border-y border-[#d6b45f]/15 bg-[#06382a] px-4 py-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 text-center text-sm font-semibold text-[#d6b45f]">{ar ? 'أحدث أبحاثنا المنشورة' : 'Recent published research'}</div>
            <a href={FRONTIERS_URL} target="_blank" rel="noopener noreferrer" className="mx-auto block max-w-2xl rounded-2xl border border-[#d6b45f]/20 bg-black/10 p-5 text-center hover:border-[#d6b45f]/50">
              <strong>{ar ? 'انتشار استخدام التبغ وأنماطه بين البالغين السعوديين' : 'Published tobacco and nicotine research'}</strong>
              <div className="mt-1 text-xs text-[#e8dfc8]/60">Frontiers in Public Health · 2025</div>
            </a>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['🧲', ar ? 'اختبار الإدمان' : 'Dependence check', '/aqla/tools'],
                ['💸', ar ? 'عدّاد المال' : 'Money counter', '/aqla/tools'],
                ['🎯', ar ? 'تحدي كسر عادة التدخين' : 'Break-the-habit challenge', '/aqla/challenges'],
              ].map(([icon, label, href]) => <Link key={label} href={href} className="rounded-xl border border-white/10 p-4 text-center"><div className="text-2xl">{icon}</div><strong>{label}</strong><div className="text-xs text-[#d6b45f]">{ar ? 'جرّبها الآن ←' : 'Try now →'}</div></Link>)}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:py-20">
          <SectionTitle title={ar ? 'مسارات أقلع' : 'Aqla pathways'} text={ar ? 'اختر المسار الذي يناسب احتياجك الآن.' : 'Choose the pathway that fits what you need now.'} />
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PATHWAYS.map((item) => (
              <article key={item.href} className="flex min-h-[260px] flex-col rounded-3xl border border-[#d6b45f]/20 bg-[#07382b] p-6 shadow-xl">
                <div className="text-3xl">{item.icon}</div>
                <h3 className="mt-4 text-xl font-bold">{t(item.title, lang)}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-[#e8dfc8]/70">{t(item.text, lang)}</p>
                <Link href={item.href} onClick={item.href === ASSESSMENT_URL ? () => track('support_entry_clicks') : undefined} className="mt-5 rounded-xl bg-[#d6b45f] px-4 py-3 text-center text-sm font-bold text-[#042f23]">{t(item.cta, lang)}</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#d6b45f]/15 bg-[#06382a] px-4 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-[#d6b45f] px-3 py-1 text-xs font-black text-[#042f23]">{ar ? 'متاح الآن' : 'Available now'}</span>
              <h2 className="mt-4 text-4xl font-black">{ar ? 'مدرّبك الذكي المتخصص' : 'Your specialised intelligent coach'}</h2>
              <div className="mt-2 text-2xl font-bold text-[#d6b45f]">{ar ? 'دكتور مالك' : 'Dr Malik'}</div>
              <p className="mt-5 leading-8 text-[#e8dfc8]/80">{ar ? 'مساعدك الذكي المتخصص في الإقلاع عن التدخين — يفهم رحلتك، يدعمك في لحظات الضعف، ويقدم لك دعماً شخصياً مبنياً على بيانات تقييمك والأدلة المتاحة.' : 'An Aqla intelligent assistant using your structured assessment to provide personalised, evidence-informed support.'}</p>
              <ul className="mt-5 space-y-2 text-sm text-[#e8dfc8]/85">
                <li>✓ {ar ? 'مدرّب بأحدث بروتوكولات العلاج السلوكي المعرفي' : 'Behavioural-support principles'}</li>
                <li>✓ {ar ? 'آمن، سري، ومبني على الأدلة العلمية' : 'Privacy-conscious and evidence-informed'}</li>
                <li>✓ {ar ? 'متاح على مدار الساعة — في أي لحظة تحتاجه' : 'Available online around the clock'}</li>
                <li>✓ {ar ? 'يراعي قيمك الإسلامية وثقافتك السعودية' : 'Designed for Saudi cultural context'}</li>
              </ul>
              <Link href={OS_URL} className="mt-7 inline-block rounded-xl bg-[#d6b45f] px-5 py-3 font-bold text-[#042f23]">{ar ? 'ابدأ محادثة مع دكتور مالك' : 'Start a conversation'}</Link>
              <div className="mt-2 text-xs text-[#e8dfc8]/55">{ar ? 'مجاني تماماً · يمكنك البدء قبل تسجيل الدخول' : 'Free · You can begin before signing in'}</div>
            </div>
            <div className="rounded-[32px] border border-[#d6b45f]/25 bg-[#042f23] p-8 text-center">
              <Logo className="mx-auto h-40 w-auto" />
              <div className="mt-5 text-sm text-[#d6b45f]">Aqla Intelligent Support</div>
            </div>
          </div>
        </section>

        <section id="about-founder" className="scroll-mt-36 px-4 py-16 sm:py-20">
          <SectionTitle eyebrow={ar ? 'نبذة عن مؤسس البرنامج' : 'About the founder'} title={ar ? 'تعرف على مؤسس برنامج أقلع ورؤيته في مساعدة الناس على تحقيق حياة خالية من التدخين.' : 'Meet the founder of Aqla'} />
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#d6b45f]/20 bg-[#07382b] p-7 sm:p-10">
            <div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-start">
              <div className="rounded-3xl border border-[#d6b45f]/20 bg-[#042f23] p-6 text-center">
                <Logo className="mx-auto h-28 w-auto" />
                <div className="mt-4 text-xl font-black">{ar ? 'الدكتور مالك الذبياني' : 'Dr Malik Althobiani'}</div>
                <div className="mt-1 text-xs text-[#d6b45f]">{ar ? 'مؤسس برنامج أقلع للإقلاع عن التدخين' : 'Founder of Aqla'}</div>
              </div>
              <div className="space-y-4 leading-8 text-[#e8dfc8]/80">
                <p>{ar ? 'الدكتور مالك الذبياني باحث في أمراض الجهاز التنفسي، ومحاضر شرفي في جامعة كوليدج لندن في المملكة المتحدة ضمن قسم الطب في مستشفى رويال فري.' : 'Dr Malik Althobiani is a respiratory researcher and an Honorary Lecturer at University College London.'}</p>
                <p>{ar ? 'حاصل على دكتوراه الفلسفة (PhD) من جامعة كوليدج لندن (UCL) في المملكة المتحدة عام ٢٠٢٤، وهي أعلى مؤهل أكاديمي يؤسس عمله البحثي والتعليمي في مجال الإقلاع عن التدخين وأمراض الجهاز التنفسي.' : 'He completed his PhD at University College London in 2024, supporting his research and educational work in respiratory health and tobacco control.'}</p>
                <p>{ar ? 'يحمل بكالوريوس علوم في رعاية الجهاز التنفسي من جامعة توليدو بمعدل ٣.٩٥، وماجستير علوم في العلاج التنفسي من جامعة ولاية جورجيا بمعدل ٤ من ٤، إضافة إلى دبلوم صيدلة بتقدير ممتاز مع مرتبة الشرف.' : 'His academic training also includes respiratory care, respiratory therapy and pharmacy.'}</p>
                <Link href="/info/about" className="inline-block font-bold text-[#d6b45f]">{ar ? 'تعرف أكثر على الدكتور مالك ←' : 'Learn more →'}</Link>
              </div>
            </div>
            <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['0+', ar ? 'الخبرة' : 'Experience'],
                ['0+', ar ? 'البحث' : 'Research'],
                ['0%', ar ? 'معدل النجاح' : 'Success rate'],
                ['0+', ar ? 'المرضى المساعدون' : 'People supported'],
              ].map(([value, label]) => <div key={label} className="rounded-2xl bg-black/10 p-4 text-center"><div className="text-3xl font-black">{value}</div><span className="text-xs text-[#e8dfc8]/60">{label}</span></div>)}
            </div>
          </div>
        </section>

        <section className="border-y border-[#d6b45f]/15 bg-[#06382a] px-4 py-16">
          <SectionTitle eyebrow={ar ? 'المميزات' : 'Features'} title={ar ? 'مميزات البرنامج' : 'Programme features'} text={ar ? 'برنامج مستدام يجمع بين التوعية والبيانات والدعم' : 'Awareness, structured data and digital support in one platform.'} />
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((item) => <article key={item.title.ar} className="rounded-2xl border border-white/10 bg-[#042f23]/60 p-5"><h3 className="font-bold text-[#d6b45f]">{t(item.title, lang)}</h3><p className="mt-2 text-sm leading-7 text-[#e8dfc8]/70">{t(item.text, lang)}</p></article>)}
          </div>
        </section>

        <section className="px-4 py-16 sm:py-20">
          <SectionTitle eyebrow={ar ? 'المسار التعليمي' : 'Learning pathway'} title={ar ? 'الوحدات التعليمية' : 'Learning modules'} text={ar ? 'منهج ثنائي اللغة مبني على مصادر منظمة الصحة العالمية (WHO) ومراكز مكافحة الأمراض الأمريكية (CDC).' : 'A bilingual learning pathway informed by WHO and CDC sources.'} />
          <div className="mx-auto mb-6 max-w-5xl text-center text-sm text-[#d6b45f]">{ar ? 'ابدأ بالوحدة الأولى • 15 دقيقة فقط' : 'Start with module one'}</div>
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-3">
            {MODULES.map((module) => (
              <article key={module.no} className="rounded-3xl border border-[#d6b45f]/20 bg-[#07382b] p-6">
                <div className="flex items-center justify-between"><span className="text-xs font-bold text-[#d6b45f]">{ar ? `الوحدة ${module.no}` : `Module ${module.no}`}</span><span className="text-xs text-[#e8dfc8]/55">{module.mins} {ar ? 'دقيقة' : 'min'}</span></div>
                <h3 className="mt-4 text-lg font-bold">{ar ? module.ar : module.en}</h3>
                <p className="mt-3 text-sm leading-7 text-[#e8dfc8]/70">{module.desc}</p>
                <div className="mt-4 flex items-center justify-between text-xs"><span className="text-[#d6b45f]">{module.tags}</span><span>{module.questions} {ar ? 'أسئلة' : 'questions'}</span></div>
                <Link href="/aqla/academy" className="mt-5 block rounded-xl border border-[#d6b45f]/30 px-4 py-2 text-center text-sm font-bold hover:bg-[#d6b45f] hover:text-[#042f23]">{ar ? 'ابدأ التعلم' : 'Start learning'}</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#d6b45f]/15 bg-[#06382a] px-4 py-16">
          <SectionTitle eyebrow={ar ? 'الأدوات التفاعلية' : 'Interactive tools'} title={ar ? 'مارس ما تتعلمه' : 'Practise what you learn'} text={ar ? 'بعد كل وحدة، استخدم هذه الأدوات لممارسة المهارات: تدرب على السيناريوهات، حدد الأهداف، واختبر معرفتك.' : 'Use scenarios, goal setting and quizzes to practise.'} />
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Popular', ar ? 'سيناريوهات الحياة الواقعية' : 'Real-life scenarios', '#Video #Practice', '/aqla/academy'],
              ['New', ar ? 'تمارين رفض التدخين' : 'Refusal practice', '#Communication', '/aqla/academy'],
              ['Active', ar ? 'تحديد أهداف الإقلاع' : 'Quit goals', '#Goals', '/aqla/tools'],
              ['Active', ar ? 'اختبارات تفاعلية' : 'Interactive quizzes', '#Quiz', '/aqla/academy'],
            ].map(([badge, title, tags, href]) => <Link key={title} href={href} className="rounded-2xl border border-white/10 p-5"><span className="text-xs text-[#d6b45f]">{badge}</span><h3 className="mt-2 font-bold">{title}</h3><p className="mt-2 text-xs text-[#e8dfc8]/60">{tags}</p></Link>)}
          </div>
          <div className="mt-6 text-center"><Link href="/aqla/tools" className="text-sm font-bold text-[#d6b45f]">{ar ? 'عرض جميع الأدوات التفاعلية' : 'View all interactive tools'}</Link></div>
        </section>

        <section className="px-4 py-8">
          <p className="mx-auto max-w-4xl text-center text-xs leading-6 text-[#e8dfc8]/60">{ar ? 'أقلع يقدم التوعية والدعم، ولا يقدم تشخيصًا أو علاجًا أو وصفة طبية. اختيار بدائل النيكوتين أو أدوية الإقلاع أو جرعاتها يحتاج مراجعة مختص أو صيدلي.' : 'Aqla provides awareness and support. It does not diagnose, prescribe or choose medication doses; medication decisions require an appropriate clinician or pharmacist.'}</p>
        </section>

        <section className="border-y border-[#d6b45f]/15 bg-[#06382a] px-4 py-14">
          <SectionTitle title={ar ? 'أثر أقلع حتى الآن' : 'Aqla impact so far'} text={ar ? 'مؤشرات مجمعة دون عرض أي بيانات شخصية.' : 'Aggregate indicators without displaying personal data.'} />
          <div className="mx-auto max-w-xl rounded-3xl border border-[#d6b45f]/20 bg-[#042f23] p-7 text-center"><div className="text-5xl font-black">0</div><div className="mt-2 text-sm text-[#e8dfc8]/70">{ar ? 'المدن المشاركة' : 'Participating cities'}</div><p className="mt-4 text-xs text-[#e8dfc8]/50">{ar ? 'تعرض هذه الأرقام بشكل إجمالي فقط، وقد تتغير مع تحديث نظام التحليلات.' : 'These numbers are aggregate only and may change as analytics are updated.'}</p></div>
        </section>

        <section className="px-4 py-16 sm:py-20">
          <SectionTitle title={ar ? 'أربع طرق سريعة لتعرف حياتك مع التدخين' : 'Four quick ways to understand your smoking life'} text={ar ? 'كل أداة مستقلة، تستغرق دقيقة، وتعطيك إجابتك فوراً.' : 'Each quick tool is independent and takes about a minute.'} />
          <p className="mx-auto mb-7 max-w-3xl text-center text-sm text-[#d6b45f]">{ar ? 'إجاباتك لا تغادر هذه الصفحة في الأدوات المحلية. كل أداة تُكملها تحرق ربع هذه السيجارة — أول سيجارة تنهيها دون أن تدخنها.' : 'Local quick-tool answers stay in the browser.'}</p>
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_TOOLS.map((tool) => <Link key={tool.title.ar} href={tool.href} className="rounded-3xl border border-[#d6b45f]/20 bg-[#07382b] p-6"><div className="text-3xl">{tool.icon}</div><h3 className="mt-4 text-lg font-bold">{t(tool.title, lang)}</h3><p className="mt-2 text-sm text-[#e8dfc8]/65">{t(tool.text, lang)}</p><div className="mt-4 text-xs text-[#d6b45f]">{t(tool.cta, lang)}</div></Link>)}
          </div>
          <Link href="/aqla/challenges" className="mx-auto mt-5 block max-w-2xl rounded-3xl border border-[#d6b45f]/20 bg-[#07382b] p-6 text-center"><div className="text-3xl">🎯</div><h3 className="mt-2 text-lg font-bold">{ar ? 'تحدي كسر عادة التدخين' : 'Break-the-habit challenge'}</h3><p className="mt-2 text-sm text-[#e8dfc8]/65">{ar ? '٣٠ ثانية. صوّب على السجائر المولّعة. حطّم أكثر من الزجاج.' : 'A short awareness challenge.'}</p><div className="mt-3 text-xs text-[#d6b45f]">⏱ {ar ? '٣٠ ثانية' : '30 seconds'}</div></Link>
          <p className="mx-auto mt-5 max-w-4xl text-center text-xs leading-6 text-[#e8dfc8]/50">{ar ? 'هذه الأداة تعليمية. أسئلة الاعتماد والمقاييس المعتمدة تعرض باسمها وحدود استخدامها داخل التقييم؛ وهي ليست تشخيصاً طبياً.' : 'These tools are educational and are not medical diagnoses. Validated dependence measures are labelled separately within the assessment.'}</p>
        </section>

        <section className="border-t border-[#d6b45f]/20 bg-[#021f18] px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <Logo className="mx-auto h-20 w-auto" />
            <div className="mt-4 text-sm text-[#d6b45f]">Aqla</div>
            <h2 className="mt-4 text-4xl font-black">{ar ? 'انضم إلى برنامج أقلع' : 'Join Aqla'}</h2>
            <p className="mt-2 text-2xl font-bold">{ar ? 'ابدأ رحلتك نحو حياة صحية خالية من التدخين' : 'Start your journey toward a smoke-free life'}</p>
            <p className="mx-auto mt-5 max-w-2xl leading-8 text-[#e8dfc8]/70">{ar ? 'برنامج تعليمي شامل يساعدك على الإقلاع عن التدخين بطريقة علمية ومدروسة.' : 'Digital education and structured support for a thoughtful quit journey.'}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href={ASSESSMENT_URL} onClick={() => track('support_entry_clicks')} className="rounded-xl bg-[#d6b45f] px-6 py-3 font-black text-[#042f23]">{ar ? 'ابدأ الآن مجاناً' : 'Start free'}</Link><Link href="/aqla/academy" className="rounded-xl border border-[#d6b45f]/40 px-6 py-3 font-bold">{ar ? 'استكشف المحتوى' : 'Explore content'}</Link></div>
            <div className="mt-4 text-xs text-[#e8dfc8]/50">{ar ? 'مجاناً تماماً • لا يلزم بطاقة ائتمان • ابدأ فوراً' : 'Free • No payment card required'}</div>
            <div className="mx-auto mt-10 grid max-w-3xl gap-2 text-sm text-[#e8dfc8]/75 sm:grid-cols-2">
              <div>✓ {ar ? 'محتوى معتمد علمياً من متخصصين' : 'Evidence-informed specialist content'}</div>
              <div>✓ {ar ? 'مجاني تماماً بدون أي رسوم' : 'Free to use'}</div>
              <div>✓ {ar ? 'شهادة إتمام معتمدة' : 'Completion-certificate pathway'}</div>
              <div>✓ {ar ? 'دعم متواصل على مدار الساعة' : 'Always-available digital support'}</div>
              <div>✓ {ar ? '7 وحدات تعليمية شاملة' : 'Seven learning modules'}</div>
              <div>✓ {ar ? 'أدوات تفاعلية متطورة' : 'Interactive tools'}</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d6b45f]/15 bg-[#011b15] px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-7 md:grid-cols-[1fr_auto]">
          <div>
            <div className="font-bold">Aqla</div>
            <p className="mt-2 text-sm text-[#e8dfc8]/60">© 2026 {ar ? 'أقلع — Aqla' : 'Aqla — أقلع'}</p>
            <p className="mt-1 text-xs text-[#e8dfc8]/50">{ar ? 'منصة مجانية للتوعية والدعم — ليست خدمة طوارئ' : 'Free awareness and support platform — not an emergency service'}</p>
            <p className="mt-1 text-xs text-[#e8dfc8]/50">{ar ? 'بالانتساب إلى جامعة الملك عبدالعزيز — جدة، المملكة العربية السعودية' : 'Jeddah, Saudi Arabia'}</p>
          </div>
          <div className="flex flex-wrap content-start gap-x-5 gap-y-2 text-sm">
            <Link href="/info/about">{ar ? 'عن أقلع' : 'About'}</Link>
            <Link href="/aqla/community">{ar ? 'أثر أقلع' : 'Impact'}</Link>
            <Link href="/info/contact">{ar ? 'تواصل معنا' : 'Contact'}</Link>
            <Link href="/info/faq">{ar ? 'الأسئلة الشائعة' : 'FAQ'}</Link>
          </div>
        </div>
        <div className="mx-auto mt-7 max-w-7xl border-t border-white/5 pt-5 text-xs text-[#e8dfc8]/45">{ar ? 'لا نعرض بياناتك الصحية في المشاركات العامة. أقلع لا يقدم تشخيصًا أو علاجًا أو وصفة طبية.' : 'Aqla does not expose health details in public sharing. It does not provide diagnosis or prescriptions.'}</div>
      </footer>
    </div>
  )
}
