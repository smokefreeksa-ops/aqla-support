const REDCAP_URL = 'https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM'

const copy = {
  ar: {
    dir: 'rtl' as const,
    lang: 'ar',
    languageHref: '/?lang=en',
    languageLabel: 'English',
    visitorLabel: 'زائرًا لمنصة أقلع',
    visitorNote: 'إحصائية حقيقية للمنصة حتى ١٨ أغسطس ٢٠٢٦',
    eyebrow: 'دراسة علمية',
    university: 'جامعة الملك عبدالعزيز',
    title: 'شارك برأيك حول دور منتجات النيكوتين الخالية من التبغ في الحد من أضرار التدخين',
    prize: 'شارك في الاستبيان وادخل السحب للفوز بـ ٥٠٠ ريال سعودي',
    participate: 'شارك في الدراسة',
    details: 'تفاصيل الدراسة',
    p1: 'هذه دراسة بحثية من جامعة الملك عبدالعزيز تهدف إلى فهم آراء وتجارب البالغين حول استخدام منتجات النيكوتين الخالية من التبغ ودورها المحتمل في الحد من أضرار التدخين.',
    p2: 'المشاركة طوعية، وستُعامل إجاباتك بسرية وتُستخدم لأغراض البحث العلمي فقط.',
    ethics: 'تمت الموافقة على الدراسة من لجنة أخلاقيات البحث بجامعة الملك عبدالعزيز. رقم الموافقة 26-162.',
    skip: 'تخطي والانتقال إلى أقلع',
    skipNote: 'يمكنك تخطي الدراسة والوصول مباشرة إلى نظام أقلع لدعم الإقلاع عن التدخين والنيكوتين.',
    trust: ['المشاركة تطوعية', 'إجابات سرية', 'للبالغين', 'بحث علمي'],
  },
  en: {
    dir: 'ltr' as const,
    lang: 'en',
    languageHref: '/',
    languageLabel: 'العربية',
    visitorLabel: 'visitors to AQla',
    visitorNote: 'Verified platform analytics through 18 August 2026',
    eyebrow: 'Scientific study',
    university: 'King Abdulaziz University',
    title: 'Share your view on the role of tobacco-free nicotine products in reducing smoking harm',
    prize: 'Take the survey and enter the draw to win SAR 500',
    participate: 'Take part in the study',
    details: 'Study details',
    p1: 'This King Abdulaziz University research study aims to understand adults’ opinions and experiences regarding tobacco-free nicotine products and their potential role in reducing smoking harm.',
    p2: 'Participation is voluntary. Your responses will be treated confidentially and used for research purposes only.',
    ethics: 'Approved by the Research Ethics Committee at King Abdulaziz University. Approval number 26-162.',
    skip: 'Skip and continue to AQla',
    skipNote: 'You can skip the study and go directly to the AQla smoking and nicotine cessation support system.',
    trust: ['Voluntary', 'Confidential', 'Adults', 'Scientific research'],
  },
}

type Props = {
  searchParams: Promise<{ lang?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams
  const t = params.lang === 'en' ? copy.en : copy.ar
  const visitorCount = t.lang === 'ar' ? '٥٧٢' : '572'

  return (
    <main className="aqla-study-page" dir={t.dir} lang={t.lang}>
      <div className="aqla-study-glow" aria-hidden="true" />
      <div className="aqla-study-grid" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <a
            href={t.languageHref}
            className="rounded-full border border-[#c9a84c]/55 bg-[#06381f]/75 px-4 py-2 text-xs font-semibold tracking-wide text-[#faf1d8] backdrop-blur-sm transition hover:bg-[#0d4a2e]"
          >
            {t.languageLabel}
          </a>

          <div className="aqla-wordmark" aria-label="AQla">
            <span className="aqla-wordmark-ar">أقلع</span>
            <span className="aqla-wordmark-en">AQla</span>
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-7 sm:py-10">
          <div className="mb-5 text-center sm:mb-7">
            <div className="aqla-visitor-number">{visitorCount}</div>
            <p className="mt-1 text-sm font-semibold text-[#d7eadf] sm:text-base">{t.visitorLabel}</p>
            <p className="mt-1 text-[10px] text-[#8fb5a2] sm:text-xs">{t.visitorNote}</p>
          </div>

          <div className="aqla-study-card w-full max-w-[860px]">
            <div className="relative z-10 flex flex-col items-center px-5 py-7 text-center sm:px-10 sm:py-10">
              <div className="mb-5 inline-flex items-center justify-center rounded-2xl bg-[#f7fdf9] px-7 py-3 shadow-[0_12px_30px_-16px_rgba(0,0,0,0.8)] ring-1 ring-[#c9a84c]/35">
                <div className="aqla-wordmark aqla-wordmark-dark">
                  <span className="aqla-wordmark-ar">أقلع</span>
                  <span className="aqla-wordmark-en">AQla</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#e6c97a]">
                <span className="h-px w-7 bg-[#c9a84c]/60" />
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] sm:text-xs">{t.eyebrow}</span>
                <span className="h-px w-7 bg-[#c9a84c]/60" />
              </div>
              <p className="mt-2 text-xs tracking-wide text-[#bcd8c9] sm:text-sm">{t.university}</p>

              <h1 className="mt-5 max-w-[34ch] text-balance text-[24px] font-bold leading-[1.65] tracking-tight text-[#f4fbf7] sm:text-[31px] sm:leading-[1.55]">
                {t.title}
              </h1>

              <p className="mt-4 text-sm font-bold text-[#f0d98e] sm:text-base">{t.prize}</p>

              <div className="mt-7 w-full max-w-2xl space-y-3">
                <a
                  href={REDCAP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="aqla-primary-button flex min-h-[64px] w-full items-center justify-center rounded-2xl px-6 text-lg font-bold text-[#fff4d6] sm:min-h-[70px] sm:text-xl"
                >
                  {t.participate}
                </a>

                <details className="aqla-details group w-full text-start">
                  <summary className="flex min-h-[50px] cursor-pointer list-none items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.045] px-5 text-sm font-semibold text-[#eaf6ef] transition hover:bg-white/[0.075]">
                    {t.details}
                    <span className="text-[#c9a84c] transition group-open:rotate-180">⌄</span>
                  </summary>
                  <div className="mt-2 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm leading-7 text-[#cfe6da] sm:p-6">
                    <p>{t.p1}</p>
                    <p className="mt-3">{t.p2}</p>
                    <p className="mt-3 font-medium text-[#e8f4ed]">{t.ethics}</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {t.trust.map((item) => (
                        <span key={item} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs text-[#bfd8cc]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </details>

                <div className="pt-2">
                  <a
                    href="/aqla"
                    className="inline-flex min-h-[46px] items-center justify-center rounded-full px-6 text-sm font-semibold text-[#b7d0c4] underline decoration-[#b7d0c4]/35 underline-offset-4 transition hover:text-white"
                  >
                    {t.skip}
                  </a>
                  <p className="mx-auto mt-1 max-w-xl text-xs leading-6 text-[#769a88]">{t.skipNote}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="pb-2 text-center text-[11px] text-[#648b77]">
          AQla · أقلع
        </footer>
      </div>
    </main>
  )
}
