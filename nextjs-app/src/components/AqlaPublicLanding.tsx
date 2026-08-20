'use client'

import { useEffect, useRef, useState } from 'react'

const LOGO_URL = '/aqla-logo.png'
const REDCAP_URL = 'https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM'
const ASSESSMENT_URL = '/aqla/assessment'
const OS_URL = '/aqla/os'

const nav = [
  { ar: 'الرئيسية', en: 'Home', href: '/' },
  { ar: 'مسار الإقلاع', en: 'Quit Pathway', href: ASSESSMENT_URL },
  { ar: 'مسار المساعدة', en: 'Help Someone', href: '/aqla/help-someone' },
  { ar: 'التحديات والأنشطة', en: 'Challenges & Activities', href: '/aqla/challenges' },
  { ar: 'أقلع الشخصي', en: 'Personal Aqla', href: OS_URL },
  { ar: 'المساعد الصوتي', en: 'Voice Assistant', href: OS_URL },
  { ar: 'فحص الرغبة الصوتي', en: 'Craving Tools', href: '/aqla/tools' },
  { ar: 'التعلم والتدريب', en: 'Learn & Train', href: '/aqla/academy' },
  { ar: 'الشهادات', en: 'Certificates', href: '/aqla/academy' },
  { ar: 'طلب الدعم', en: 'Request Support', href: '/aqla/os' },
  { ar: 'أثر أقلع', en: 'Aqla Impact', href: '/aqla/community' },
  { ar: 'عن أقلع', en: 'About Aqla', href: '/info/about' },
  { ar: 'الأسئلة الشائعة', en: 'FAQ', href: '/info/faq' },
] as const

const pathways = [
  {
    arTitle: 'مركز أقلع الافتراضي لدعم الإقلاع',
    enTitle: 'Aqla Virtual Quit Center',
    arText: 'تجربة تفاعلية تقودك من فهم استخدامك للتدخين أو النيكوتين، إلى التقييم، وبناء الخطة، والمتابعة، وطلب الدعم عند الحاجة.',
    enText: 'An interactive journey from understanding nicotine use to assessment, planning, follow-up and support.',
    arCta: 'ادخل مركز الإقلاع', enCta: 'Enter Quit Center', href: ASSESSMENT_URL, icon: '✦',
  },
  {
    arTitle: 'أكاديمية أقلع للتدريب والشهادات',
    enTitle: 'Aqla Academy for Training & Certification',
    arText: 'مركز تعليمي تفاعلي للتدريب، السيناريوهات، الاختبارات، والشهادات القابلة للتحميل والمشاركة والتحقق.',
    enText: 'Interactive learning, scenarios, assessments and certificate pathways.',
    arCta: 'ادخل الأكاديمية', enCta: 'Enter Academy', href: '/aqla/academy', icon: '🎓',
  },
  {
    arTitle: 'مسار أقلع لمساعدة شخص يهمك',
    enTitle: 'Aqla Help Pathway',
    arText: 'لمن يريد دعم صديق، قريب، طالب، زميل، أو شخص يهتم لأمره برسالة أو بطاقة دعم محترمة وآمنة.',
    enText: 'Support a friend, relative, student or colleague with a respectful, safe message or card.',
    arCta: 'ابدأ مسار المساعدة', enCta: 'Start Help Pathway', href: '/aqla/help-someone', icon: '🤝',
  },
  {
    arTitle: 'مجتمع وتحديات أقلع',
    enTitle: 'Aqla Community & Challenges',
    arText: 'للتحديات، الألعاب التوعوية، الهاشتاقات، دعوة الأصدقاء، النقاط، الأوسمة، بطاقات التوعية، وأثر أقلع المجتمعي.',
    enText: 'Challenges, awareness activities, participation points, cards and community impact.',
    arCta: 'ادخل التحديات والمجتمع', enCta: 'Enter Community', href: '/aqla/challenges', icon: '🏆',
  },
] as const

const features = [
  ['متاح 24/7', 'يمكنك الوصول إلى البرنامج في أي وقت ومن أي مكان عبر الإنترنت.', 'Available 24/7', 'Access Aqla online whenever you need it.'],
  ['مستدام', 'برنامج مستدام ذاتياً يضمن المشاركة المستمرة ويحافظ على فعاليته.', 'Sustainable', 'Designed for continued digital engagement.'],
  ['قابل للتوسع', 'يتكيف بسهولة مع زيادة عدد المستخدمين دون الحاجة لموارد إضافية مماثلة.', 'Scalable', 'AWS-native architecture designed to scale with demand.'],
  ['مبني على البيانات', 'يستخدم مؤشرات أداء لقياس فعالية البرنامج وتحسينه باستمرار.', 'Data-informed', 'Uses structured metrics to support ongoing improvement.'],
  ['تثقيف وقائي', 'تعليم شامل عن مخاطر التدخين والوقاية لتعزيز الوعي الصحي المجتمعي.', 'Preventive education', 'Educational content supporting tobacco and nicotine awareness.'],
  ['دعم سلوكي', 'أدوات وتقنيات لإدارة التوتر واتخاذ القرار لتجاوز التحديات السلوكية.', 'Behavioural support', 'Practical tools for triggers, cravings and decision-making.'],
] as const

const modules = [
  ['01', '20 دقيقة', 'أساسيات التبغ والنيكوتين والصحة العامة', 'حقائق موثقة من WHO وCDC حول التبغ ودور المتطوع التوعوي.', '#WHO  #CDC', '8 أسئلة', 'Tobacco, nicotine & public-health fundamentals'],
  ['02', '20 دقيقة', 'الاعتماد والانسحاب واستخدام المنتجات', 'علامات الاعتماد، الانسحاب، والاستخدام المزدوج، والفرق بين الفرز والتشخيص.', '#dependence', '8 أسئلة', 'Dependence, withdrawal & product use'],
  ['03', '18 دقيقة', 'مهارات التواصل', 'طلب الإذن، الأسئلة المفتوحة، الاستماع العاكس، واحترام الاستقلالية.', '#communication', '8 أسئلة', 'Communication skills'],
  ['04', '22 دقيقة', 'الاستعداد والتخطيط للإقلاع', 'تقييم الاستعداد، اختيار يوم الإقلاع، وتحديد المحفزات وطرق التعامل.', '#planning', '8 أسئلة', 'Readiness & quit planning'],
  ['05', '18 دقيقة', 'الرغبة والانتكاسة والدعم اللطيف', 'التعامل مع الرغبة والانتكاسة دون لوم أو وصم.', '#coping', '8 أسئلة', 'Cravings, relapse & compassionate support'],
  ['06', '25 دقيقة', 'السلامة والحدود والإحالة', 'الطوارئ، حماية القُصّر، الحمل، الأدوية، وحدود السرية.', '#safety', '8 أسئلة', 'Safety, boundaries & referral'],
  ['07', '20 دقيقة', 'التطبيق المجتمعي ومسارات أقلع', 'أخلاقيات الفعاليات، الخصوصية، والإحالة إلى المسارات الرسمية.', '#outreach', '8 أسئلة', 'Community application & Aqla pathways'],
] as const

function track(metric: 'research_clicks' | 'support_entry_clicks') {
  void fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ metric }),
    keepalive: true,
  }).catch(() => undefined)
}

function SectionTitle({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return <div className="mx-auto mb-8 max-w-3xl text-center"><div className="text-xs font-bold tracking-[0.18em] text-[#d6b45f]">{eyebrow}</div><h2 className="mt-2 text-3xl font-bold text-[#fffaf0] sm:text-4xl">{title}</h2>{text ? <p className="mt-3 leading-7 text-[#e8dfc8]/75">{text}</p> : null}</div>
}

export default function AqlaPublicLanding({
  signedIn,
  latestPlanId,
  initialVisitCount,
}: {
  signedIn: boolean
  latestPlanId?: string
  initialVisitCount: number
}) {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [menuOpen, setMenuOpen] = useState(false)
  const [visitCount, setVisitCount] = useState(initialVisitCount)
  const visitSent = useRef(false)
  const ar = lang === 'ar'
  const savedPlanUrl = latestPlanId ? `/aqla/plan/${encodeURIComponent(latestPlanId)}?lang=${lang}` : undefined
  const number = new Intl.NumberFormat(ar ? 'ar-SA' : 'en-GB').format(visitCount)

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

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
          <a href="/" className="flex items-center gap-3"><img src={LOGO_URL} alt="Aqla — أقلع" className="h-10 w-auto" /><div className="leading-tight"><strong className="block text-sm">{ar ? 'أقلع' : 'Aqla'}</strong><span className="text-[10px] text-[#e8dfc8]/60">Aqla — أقلع</span></div></a>
          <nav className="hidden max-w-[830px] flex-wrap items-center justify-center gap-x-3 gap-y-1 xl:flex" aria-label={ar ? 'التنقل الرئيسي' : 'Primary navigation'}>{nav.map((item) => <a key={item.ar} href={item.href} className="text-[12px] font-medium text-[#f7f0dc]/75 transition hover:text-[#d6b45f]">{ar ? item.ar : item.en}</a>)}</nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setLang(ar ? 'en' : 'ar')} className="rounded-lg border border-[#d6b45f]/30 px-3 py-2 text-xs font-semibold">{ar ? 'EN' : 'ع'}</button>
            {signedIn ? <><a href={savedPlanUrl ?? '/aqla/dashboard'} className="hidden rounded-lg border border-[#d6b45f]/30 px-3 py-2 text-xs sm:block">{ar ? 'لوحتي' : 'Dashboard'}</a><a href="/auth/logout" onClick={clearPrivateBrowserData} className="hidden rounded-lg bg-[#d6b45f] px-3 py-2 text-xs font-bold text-[#042f23] sm:block">{ar ? 'تسجيل الخروج' : 'Sign out'}</a></> : <><a href="/auth/login?returnTo=%2Faqla%2Fadmin" className="hidden rounded-lg border border-[#d6b45f]/30 px-3 py-2 text-xs md:block">{ar ? 'دخول الموظفين' : 'Staff login'}</a><a href={ASSESSMENT_URL} className="hidden rounded-lg bg-[#d6b45f] px-3 py-2 text-xs font-bold text-[#042f23] sm:block">{ar ? 'ابدأ الآن' : 'Start now'}</a></>}
            <button type="button" aria-label={ar ? 'فتح القائمة' : 'Open menu'} onClick={() => setMenuOpen((value) => !value)} className="rounded-lg border border-[#d6b45f]/30 px-3 py-2 xl:hidden">☰</button>
          </div>
        </div>
        {menuOpen ? <nav className="grid max-h-[70vh] gap-1 overflow-y-auto border-t border-[#d6b45f]/15 px-4 py-3 xl:hidden">{nav.map((item) => <a key={item.ar} href={item.href} className="rounded-lg px-3 py-2 text-sm hover:bg-white/5">{ar ? item.ar : item.en}</a>)}</nav> : null}
        <div className="bg-[#d6b45f] text-[#052f24]"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-2 text-center text-xs font-bold sm:text-sm"><span>{ar ? 'تجربتك تهمنا وتساهم في البحث العلمي' : 'Your experience matters and contributes to scientific research'}</span><a href={REDCAP_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('research_clicks')} className="underline underline-offset-2">{ar ? 'شارك الآن في الدراسة' : 'Take part in the study'}</a></div></div>
        <div className="border-t border-white/5 bg-[#07382b]"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-2 text-xs text-[#f7f0dc]/85"><a href={ASSESSMENT_URL} onClick={() => track('support_entry_clicks')} className="font-semibold hover:text-[#d6b45f]">{ar ? 'ابدأ خطة الإقلاع السريعة مع د. مالك' : 'Start a quick Aqla quit plan'}</a><a href="/aqla/share" className="font-semibold hover:text-[#d6b45f]">{ar ? 'أنشئ بطاقة إنجازك' : 'Create your progress card'}</a><span aria-live="polite" className="font-bold text-[#d6b45f]">{number} {ar ? 'زيارة' : 'visits'}</span></div></div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-16 sm:py-24"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,180,95,0.14),transparent_48%)]" /><div className="relative mx-auto max-w-5xl text-center"><img src={LOGO_URL} alt="شعار أقلع — Aqla Logo" className="mx-auto h-28 w-auto object-contain sm:h-36" /><h1 className="mt-6 text-5xl font-black tracking-tight sm:text-7xl">{ar ? 'أقلع عن التدخين' : 'Quit smoking with Aqla'}</h1><p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#e8dfc8]/80">{ar ? 'منصة علمية متكاملة لدعم الإقلاع عن التدخين — مبنية على أحدث الأدلة السريرية وتجمع بين التقنية والرعاية الشخصية لتحقيق نتائج مستدامة.' : 'An evidence-informed digital platform combining technology, structured assessment and personalised cessation support.'}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><a href={ASSESSMENT_URL} onClick={() => track('support_entry_clicks')} className="rounded-xl bg-[#d6b45f] px-6 py-3 font-bold text-[#042f23]">{ar ? 'أريد أن أتوقف عن التدخين' : 'I want to quit'}</a><a href="/aqla/academy" className="rounded-xl border border-[#d6b45f]/50 px-6 py-3 font-bold">{ar ? 'شهادات ودورات الأخصائي المعتمد' : 'Training & certificates'}</a></div><p className="mt-4 text-sm text-[#e8dfc8]/60">{ar ? 'مجاناً تماماً • مدعوم بالأدلة العلمية • ابدأ الآن' : 'Free to use • Evidence-informed • Start now'}</p><button type="button" onClick={() => scrollTo('about-founder')} className="mt-8 text-sm font-semibold text-[#d6b45f] underline underline-offset-4">{ar ? 'شاهد الفيديو التعريفي' : 'Learn about Aqla'}</button></div></section>

        <section className="border-y border-[#d6b45f]/15 bg-[#06382a] px-4 py-8"><div className="mx-auto max-w-6xl"><div className="mb-5 text-center text-sm font-semibold text-[#d6b45f]">{ar ? 'أحدث أبحاثنا المنشورة' : 'Recent published research'}</div><a href="https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1641308/full" target="_blank" rel="noopener noreferrer" className="mx-auto block max-w-2xl rounded-2xl border border-[#d6b45f]/20 bg-black/10 p-5 text-center hover:border-[#d6b45f]/50"><strong>{ar ? 'انتشار استخدام التبغ وأنماطه بين البالغين السعوديين' : 'Published tobacco and nicotine research'}</strong><div className="mt-1 text-xs text-[#e8dfc8]/60">Frontiers in Public Health · 2025</div></a><div className="mt-6 grid gap-3 sm:grid-cols-3"><a href="/aqla/tools" className="rounded-xl border border-white/10 p-4 text-center"><div className="text-2xl">🧲</div><strong>{ar ? 'اختبار الإدمان' : 'Dependence check'}</strong><div className="text-xs text-[#d6b45f]">{ar ? 'جرّبها الآن ←' : 'Try now →'}</div></a><a href="/aqla/tools" className="rounded-xl border border-white/10 p-4 text-center"><div className="text-2xl">💸</div><strong>{ar ? 'عدّاد المال' : 'Money counter'}</strong><div className="text-xs text-[#d6b45f]">{ar ? 'جرّبها الآن ←' : 'Try now →'}</div></a><a href="/aqla/challenges" className="rounded-xl border border-white/10 p-4 text-center"><div className="text-2xl">🎯</div><strong>{ar ? 'تحدي كسر عادة التدخين' : 'Break-the-habit challenge'}</strong><div className="text-xs text-[#d6b45f]">{ar ? 'جرّبها الآن ←' : 'Try now →'}</div></a></div></div></section>

        <section className="px-4 py-16 sm:py-20"><SectionTitle title={ar ? 'مسارات أقلع' : 'Aqla pathways'} text={ar ? 'اختر المسار الذي يناسب احتياجك الآن.' : 'Choose the pathway that fits what you need now.'} /><div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">{pathways.map((item) => <article key={item.arTitle} className="flex min-h-[260px] flex-col rounded-3xl border border-[#d6b45f]/20 bg-[#07382b] p-6 shadow-xl"><div className="text-3xl">{item.icon}</div><h3 className="mt-4 text-xl font-bold">{ar ? item.arTitle : item.enTitle}</h3><p className="mt-3 flex-1 text-sm leading-7 text-[#e8dfc8]/70">{ar ? item.arText : item.enText}</p><a href={item.href} onClick={item.href === ASSESSMENT_URL ? () => track('support_entry_clicks') : undefined} className="mt-5 rounded-xl bg-[#d6b45f] px-4 py-3 text-center text-sm font-bold text-[#042f23]">{ar ? item.arCta : item.enCta}</a></article>)}</div></section>

        <section className="border-y border-[#d6b45f]/15 bg-[#06382a] px-4 py-16"><div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center"><div><span className="inline-flex rounded-full bg-[#d6b45f] px-3 py-1 text-xs font-black text-[#042f23]">{ar ? 'متاح الآن' : 'Available now'}</span><h2 className="mt-4 text-4xl font-black">{ar ? 'مدرّبك الذكي المتخصص' : 'Your specialised intelligent coach'}</h2><div className="mt-2 text-2xl font-bold text-[#d6b45f]">{ar ? 'دكتور مالك' : 'Dr Malik'}</div><p className="mt-5 leading-8 text-[#e8dfc8]/80">{ar ? 'مساعدك الذكي المتخصص في الإقلاع عن التدخين — يفهم رحلتك، يدعمك في لحظات الضعف، ويقدم لك دعماً شخصياً مبنياً على بيانات تقييمك والأدلة المتاحة.' : 'An Aqla intelligent assistant using your structured assessment to provide personalised, evidence-informed support.'}</p><ul className="mt-5 space-y-2 text-sm text-[#e8dfc8]/85"><li>✓ {ar ? 'مدرّب بأحدث بروتوكولات العلاج السلوكي المعرفي' : 'Behavioural-support principles'}</li><li>✓ {ar ? 'آمن، سري، ومبني على الأدلة العلمية' : 'Privacy-conscious and evidence-informed'}</li><li>✓ {ar ? 'متاح على مدار الساعة — في أي لحظة تحتاجه' : 'Available online around the clock'}</li><li>✓ {ar ? 'يراعي قيمك الإسلامية وثقافتك السعودية' : 'Designed for Saudi cultural context'}</li></ul><a href={OS_URL} className="mt-7 inline-block rounded-xl bg-[#d6b45f] px-5 py-3 font-bold text-[#042f23]">{ar ? 'ابدأ محادثة مع دكتور مالك' : 'Start a conversation'}</a><div className="mt-2 text-xs text-[#e8dfc8]/55">{ar ? 'مجاني تماماً · يمكنك البدء قبل تسجيل الدخول' : 'Free · You can begin before signing in'}</div></div><div className="rounded-[32px] border border-[#d6b45f]/25 bg-[#042f23] p-8 text-center"><img src={LOGO_URL} alt="Aqla" className="mx-auto h-40 w-auto" /><div className="mt-5 text-sm text-[#d6b45f]">Aqla Intelligent Support</div></div></div></section>

        <section id="about-founder" className="scroll-mt-36 px-4 py-16 sm:py-20"><SectionTitle eyebrow={ar ? 'نبذة عن مؤسس البرنامج' : 'About the founder'} title={ar ? 'تعرف على مؤسس برنامج أقلع ورؤيته' : 'Meet the founder of Aqla'} /><div className="mx-auto max-w-5xl rounded-3xl border border-[#d6b45f]/20 bg-[#07382b] p-7 sm:p-10"><div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-start"><div className="rounded-3xl border border-[#d6b45f]/20 bg-[#042f23] p-6 text-center"><img src={LOGO_URL} alt="Aqla" className="mx-auto h-28 w-auto" /><div className="mt-4 text-xl font-black">{ar ? 'الدكتور مالك الذبياني' : 'Dr Malik Althobiani'}</div><div className="mt-1 text-xs text-[#d6b45f]">{ar ? 'مؤسس برنامج أقلع للإقلاع عن التدخين' : 'Founder of Aqla'}</div></div><div className="space-y-4 leading-8 text-[#e8dfc8]/80"><p>{ar ? 'الدكتور مالك الذبياني باحث في أمراض الجهاز التنفسي، ومحاضر شرفي في جامعة كوليدج لندن في المملكة المتحدة ضمن قسم الطب في مستشفى رويال فري.' : 'Dr Malik Althobiani is a respiratory researcher and an Honorary Lecturer at University College London.'}</p><p>{ar ? 'حاصل على دكتوراه الفلسفة (PhD) من جامعة كوليدج لندن (UCL) في المملكة المتحدة عام ٢٠٢٤، وهي أعلى مؤهل أكاديمي يؤسس عمله البحثي والتعليمي في مجال الإقلاع عن التدخين وأمراض الجهاز التنفسي.' : 'He completed his PhD at University College London in 2024, supporting his research and educational work in respiratory health and tobacco control.'}</p><p>{ar ? 'يحمل بكالوريوس علوم في رعاية الجهاز التنفسي من جامعة توليدو بمعدل ٣.٩٥، وماجستير علوم في العلاج التنفسي من جامعة ولاية جورجيا بمعدل ٤ من ٤، إضافة إلى دبلوم صيدلة بتقدير ممتاز مع مرتبة الشرف.' : 'His academic training also includes respiratory care, respiratory therapy and pharmacy.'}</p><a href="/info/about" className="inline-block font-bold text-[#d6b45f]">{ar ? 'تعرف أكثر على الدكتور مالك ←' : 'Learn more →'}</a></div></div><div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-2xl bg-black/10 p-4 text-center"><div className="text-3xl font-black">0+</div><span className="text-xs text-[#e8dfc8]/60">{ar ? 'الخبرة' : 'Experience'}</span></div><div className="rounded-2xl bg-black/10 p-4 text-center"><div className="text-3xl font-black">0+</div><span className="text-xs text-[#e8dfc8]/60">{ar ? 'البحث' : 'Research'}</span></div><div className="rounded-2xl bg-black/10 p-4 text-center"><div className="text-3xl font-black">0%</div><span className="text-xs text-[#e8dfc8]/60">{ar ? 'معدل النجاح' : 'Success rate'}</span></div><div className="rounded-2xl bg-black/10 p-4 text-center"><div className="text-3xl font-black">0+</div><span className="text-xs text-[#e8dfc8]/60">{ar ? 'المرضى المساعدون' : 'People supported'}</span></div></div></div></section>

        <section className="border-y border-[#d6b45f]/15 bg-[#06382a] px-4 py-16"><SectionTitle eyebrow={ar ? 'المميزات' : 'Features'} title={ar ? 'مميزات البرنامج' : 'Programme features'} text={ar ? 'برنامج مستدام يجمع بين التوعية والبيانات والدعم' : 'Awareness, structured data and digital support in one platform.'} /><div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map((item) => <article key={item[0]} className="rounded-2xl border border-white/10 bg-[#042f23]/60 p-5"><h3 className="font-bold text-[#d6b45f]">{ar ? item[0] : item[2]}</h3><p className="mt-2 text-sm leading-7 text-[#e8dfc8]/70">{ar ? item[1] : item[3]}</p></article>)}</div></section>

        <section className="px-4 py-16 sm:py-20"><SectionTitle eyebrow={ar ? 'المسار التعليمي' : 'Learning pathway'} title={ar ? 'الوحدات التعليمية' : 'Learning modules'} text={ar ? 'منهج ثنائي اللغة مبني على مصادر منظمة الصحة العالمية (WHO) ومراكز مكافحة الأمراض الأمريكية (CDC).' : 'A bilingual learning pathway informed by WHO and CDC sources.'} /><div className="mx-auto mb-6 max-w-5xl text-center text-sm text-[#d6b45f]">{ar ? 'ابدأ بالوحدة الأولى • 15 دقيقة فقط' : 'Start with module one'}</div><div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-3">{modules.map((m) => <article key={m[0]} className="rounded-3xl border border-[#d6b45f]/20 bg-[#07382b] p-6"><div className="flex items-center justify-between"><span className="text-xs font-bold text-[#d6b45f]">{ar ? `الوحدة ${m[0]}` : `Module ${m[0]}`}</span><span className="text-xs text-[#e8dfc8]/55">{m[1]}</span></div><h3 className="mt-4 text-lg font-bold">{ar ? m[2] : m[6]}</h3><p className="mt-3 text-sm leading-7 text-[#e8dfc8]/70">{ar ? m[3] : m[3]}</p><div className="mt-4 flex items-center justify-between text-xs"><span className="text-[#d6b45f]">{m[4]}</span><span>{m[5]}</span></div><a href="/aqla/academy" className="mt-5 block rounded-xl border border-[#d6b45f]/30 px-4 py-2 text-center text-sm font-bold hover:bg-[#d6b45f] hover:text-[#042f23]">{ar ? 'ابدأ التعلم' : 'Start learning'}</a></article>)}</div></section>

        <section className="border-y border-[#d6b45f]/15 bg-[#06382a] px-4 py-16"><SectionTitle eyebrow={ar ? 'الأدوات التفاعلية' : 'Interactive tools'} title={ar ? 'مارس ما تتعلمه' : 'Practise what you learn'} text={ar ? 'بعد كل وحدة، استخدم هذه الأدوات لممارسة المهارات: تدرب على السيناريوهات، حدد الأهداف، واختبر معرفتك.' : 'Use scenarios, goal setting and quizzes to practise.'} /><div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4"><a href="/aqla/academy" className="rounded-2xl border border-white/10 p-5"><span className="text-xs text-[#d6b45f]">Popular</span><h3 className="mt-2 font-bold">{ar ? 'سيناريوهات الحياة الواقعية' : 'Real-life scenarios'}</h3><p className="mt-2 text-xs text-[#e8dfc8]/60">#Video #Practice</p></a><a href="/aqla/academy" className="rounded-2xl border border-white/10 p-5"><span className="text-xs text-[#d6b45f]">New</span><h3 className="mt-2 font-bold">{ar ? 'تمارين رفض التدخين' : 'Refusal practice'}</h3><p className="mt-2 text-xs text-[#e8dfc8]/60">#Communication</p></a><a href="/aqla/tools" className="rounded-2xl border border-white/10 p-5"><span className="text-xs text-[#d6b45f]">Active</span><h3 className="mt-2 font-bold">{ar ? 'تحديد أهداف الإقلاع' : 'Quit goals'}</h3><p className="mt-2 text-xs text-[#e8dfc8]/60">#Goals</p></a><a href="/aqla/academy" className="rounded-2xl border border-white/10 p-5"><span className="text-xs text-[#d6b45f]">Active</span><h3 className="mt-2 font-bold">{ar ? 'اختبارات تفاعلية' : 'Interactive quizzes'}</h3><p className="mt-2 text-xs text-[#e8dfc8]/60">#Quiz</p></a></div><div className="mt-6 text-center"><a href="/aqla/tools" className="text-sm font-bold text-[#d6b45f]">{ar ? 'عرض جميع الأدوات التفاعلية' : 'View all interactive tools'}</a></div></section>

        <section className="px-4 py-8"><p className="mx-auto max-w-4xl text-center text-xs leading-6 text-[#e8dfc8]/60">{ar ? 'أقلع يقدم التوعية والدعم، ولا يقدم تشخيصًا أو علاجًا أو وصفة طبية. اختيار بدائل النيكوتين أو أدوية الإقلاع أو جرعاتها يحتاج مراجعة مختص أو صيدلي.' : 'Aqla provides awareness and support. It does not diagnose, prescribe or choose medication doses; medication decisions require an appropriate clinician or pharmacist.'}</p></section>

        <section className="border-y border-[#d6b45f]/15 bg-[#06382a] px-4 py-14"><SectionTitle title={ar ? 'أثر أقلع حتى الآن' : 'Aqla impact so far'} text={ar ? 'مؤشرات مجمعة دون عرض أي بيانات شخصية.' : 'Aggregate indicators without displaying personal data.'} /><div className="mx-auto max-w-xl rounded-3xl border border-[#d6b45f]/20 bg-[#042f23] p-7 text-center"><div className="text-5xl font-black">0</div><div className="mt-2 text-sm text-[#e8dfc8]/70">{ar ? 'المدن المشاركة' : 'Participating cities'}</div><p className="mt-4 text-xs text-[#e8dfc8]/50">{ar ? 'تعرض هذه الأرقام بشكل إجمالي فقط، وقد تتغير مع تحديث نظام التحليلات.' : 'These numbers are aggregate only and may change as analytics are updated.'}</p></div></section>

        <section className="px-4 py-16 sm:py-20"><SectionTitle title={ar ? 'أربع طرق سريعة لتعرف حياتك مع التدخين' : 'Four quick ways to understand your smoking life'} text={ar ? 'كل أداة مستقلة، تستغرق دقيقة، وتعطيك إجابتك فوراً. إجاباتك لا تغادر هذه الصفحة في الأدوات المحلية.' : 'Each quick tool is independent and takes about a minute.'} /><p className="mx-auto mb-7 max-w-3xl text-center text-sm text-[#d6b45f]">{ar ? 'كل أداة تُكملها تحرق ربع هذه السيجارة — أول سيجارة تنهيها دون أن تدخنها.' : 'Complete the tools one by one as your first small step.'}</p><div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4"><a href="/aqla/tools" className="rounded-3xl border border-[#d6b45f]/20 bg-[#07382b] p-6"><div className="text-3xl">💸</div><h3 className="mt-4 text-lg font-bold">{ar ? 'عدّاد المال' : 'Money counter'}</h3><p className="mt-2 text-sm text-[#e8dfc8]/65">{ar ? 'شاهد كم يكلفك التدخين فعلاً.' : 'Estimate what nicotine use costs you.'}</p><div className="mt-4 text-xs text-[#d6b45f]">⏱ ≈ {ar ? 'دقيقة' : '1 minute'}</div></a><a href="/aqla/tools" className="rounded-3xl border border-[#d6b45f]/20 bg-[#07382b] p-6"><div className="text-3xl">🧲</div><h3 className="mt-4 text-lg font-bold">{ar ? 'اختبار القبضة' : 'Dependence grip'}</h3><p className="mt-2 text-sm text-[#e8dfc8]/65">{ar ? 'كم قبضة النيكوتين عليك؟' : 'Explore your nicotine-use pattern.'}</p><div className="mt-4 text-xs text-[#d6b45f]">⏱ ≈ {ar ? 'دقيقة' : '1 minute'}</div></a><a href="/aqla/tools" className="rounded-3xl border border-[#d6b45f]/20 bg-[#07382b] p-6"><div className="text-3xl">🪞</div><h3 className="mt-4 text-lg font-bold">{ar ? 'المرآة' : 'The mirror'}</h3><p className="mt-2 text-sm text-[#e8dfc8]/65">{ar ? 'أي جوانبك تبقي التدخين مشتعلاً؟' : 'Reflect on what keeps nicotine use going.'}</p><div className="mt-4 text-xs text-[#d6b45f]">⏱ ≈ {ar ? 'دقيقة' : '1 minute'}</div></a><a href="/aqla/tools" className="rounded-3xl border border-[#d6b45f]/20 bg-[#07382b] p-6"><div className="text-3xl">🧭</div><h3 className="mt-4 text-lg font-bold">{ar ? 'البوصلة' : 'The compass'}</h3><p className="mt-2 text-sm text-[#e8dfc8]/65">{ar ? 'كم أنت مستعد للإقلاع فعلاً؟' : 'Explore your current readiness.'}</p><div className="mt-4 text-xs text-[#d6b45f]">⏱ ≈ {ar ? 'دقيقة' : '1 minute'}</div></a></div><a href="/aqla/challenges" className="mx-auto mt-5 block max-w-2xl rounded-3xl border border-[#d6b45f]/20 bg-[#07382b] p-6 text-center"><div className="text-3xl">🎯</div><h3 className="mt-2 text-lg font-bold">{ar ? 'تحدي كسر عادة التدخين' : 'Break-the-habit challenge'}</h3><p className="mt-2 text-sm text-[#e8dfc8]/65">{ar ? '٣٠ ثانية. صوّب على السجائر المولّعة. حطّم أكثر من الزجاج.' : 'A short awareness challenge.'}</p><div className="mt-3 text-xs text-[#d6b45f]">⏱ {ar ? '٣٠ ثانية' : '30 seconds'}</div></a><p className="mx-auto mt-5 max-w-4xl text-center text-xs leading-6 text-[#e8dfc8]/50">{ar ? 'هذه الأدوات تعليمية وليست تشخيصاً طبياً. أي مقاييس اعتماد معتمدة تُعرض باسمها وحدود استخدامها داخل التقييم.' : 'These tools are educational and are not medical diagnoses. Validated dependence measures are labelled separately within the assessment.'}</p></section>

        <section className="border-t border-[#d6b45f]/20 bg-[#021f18] px-4 py-20"><div className="mx-auto max-w-4xl text-center"><img src={LOGO_URL} alt="Aqla" className="mx-auto h-20 w-auto" /><div className="mt-4 text-sm text-[#d6b45f]">Aqla</div><h2 className="mt-4 text-4xl font-black">{ar ? 'انضم إلى برنامج أقلع' : 'Join Aqla'}</h2><p className="mt-2 text-2xl font-bold">{ar ? 'ابدأ رحلتك نحو حياة صحية خالية من التدخين' : 'Start your journey toward a smoke-free life'}</p><p className="mx-auto mt-5 max-w-2xl leading-8 text-[#e8dfc8]/70">{ar ? 'برنامج تعليمي ودعم رقمي يساعدك على الإقلاع عن التدخين بطريقة علمية ومدروسة.' : 'Digital education and structured support for a thoughtful quit journey.'}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><a href={ASSESSMENT_URL} onClick={() => track('support_entry_clicks')} className="rounded-xl bg-[#d6b45f] px-6 py-3 font-black text-[#042f23]">{ar ? 'ابدأ الآن مجاناً' : 'Start free'}</a><button type="button" onClick={() => scrollTo('about-founder')} className="rounded-xl border border-[#d6b45f]/40 px-6 py-3 font-bold">{ar ? 'استكشف المحتوى' : 'Explore content'}</button></div><div className="mt-4 text-xs text-[#e8dfc8]/50">{ar ? 'مجاناً تماماً • لا يلزم بطاقة ائتمان • ابدأ فوراً' : 'Free • No payment card required'}</div><div className="mx-auto mt-10 grid max-w-3xl gap-2 text-sm text-[#e8dfc8]/75 sm:grid-cols-2"><div>✓ {ar ? 'محتوى مبني على الأدلة' : 'Evidence-informed content'}</div><div>✓ {ar ? 'مجاني تماماً بدون أي رسوم' : 'Free to use'}</div><div>✓ {ar ? 'مسار تعلم وشهادات' : 'Learning and certificates pathway'}</div><div>✓ {ar ? 'دعم متواصل على مدار الساعة' : 'Always-available digital support'}</div><div>✓ {ar ? '7 وحدات تعليمية شاملة' : 'Seven learning modules'}</div><div>✓ {ar ? 'أدوات تفاعلية متطورة' : 'Interactive tools'}</div></div></div></section>
      </main>

      <footer className="border-t border-[#d6b45f]/15 bg-[#011b15] px-4 py-10"><div className="mx-auto grid max-w-7xl gap-7 md:grid-cols-[1fr_auto]"><div><div className="font-bold">Aqla</div><p className="mt-2 text-sm text-[#e8dfc8]/60">© 2026 {ar ? 'أقلع — Aqla' : 'Aqla — أقلع'}</p><p className="mt-1 text-xs text-[#e8dfc8]/50">{ar ? 'منصة مجانية للتوعية والدعم — ليست خدمة طوارئ' : 'Free awareness and support platform — not an emergency service'}</p><p className="mt-1 text-xs text-[#e8dfc8]/50">{ar ? 'بالانتساب إلى جامعة الملك عبدالعزيز — جدة، المملكة العربية السعودية' : 'Jeddah, Saudi Arabia'}</p></div><div className="flex flex-wrap content-start gap-x-5 gap-y-2 text-sm"><a href="/info/about">{ar ? 'عن أقلع' : 'About'}</a><a href="/aqla/community">{ar ? 'أثر أقلع' : 'Impact'}</a><a href="/info/contact">{ar ? 'تواصل معنا' : 'Contact'}</a><a href="/info/faq">{ar ? 'الأسئلة الشائعة' : 'FAQ'}</a></div></div><div className="mx-auto mt-7 max-w-7xl border-t border-white/5 pt-5 text-xs text-[#e8dfc8]/45">{ar ? 'لا نعرض بياناتك الصحية في المشاركات العامة. أقلع لا يقدم تشخيصًا أو علاجًا أو وصفة طبية.' : 'Aqla does not expose health details in public sharing. It does not provide diagnosis or prescriptions.'}</div></footer>
    </div>
  )
}
