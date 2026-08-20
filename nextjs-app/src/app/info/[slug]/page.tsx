import { notFound } from 'next/navigation'
import { isPublicPageKey, publicPageContent } from '@/lib/public-content'

export const dynamic = 'force-dynamic'

export default async function InfoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const { slug } = await params
  const query = await searchParams
  const lang = query.lang === 'en' ? 'en' : 'ar'
  const ar = lang === 'ar'

  if (!isPublicPageKey(slug)) notFound()
  const page = publicPageContent[slug]

  return (
    <main className="ax-page" dir={ar ? 'rtl' : 'ltr'} lang={lang}>
      <header className="ax-topbar">
        <a className="ax-brand" href="/aqla"><img src="/aqla-logo.png" alt="Aqla — أقلع" /><span>{ar ? 'أقلع' : 'Aqla'}</span></a>
        <nav className="ax-nav" aria-label={ar ? 'التنقل' : 'Navigation'}>
          <a href="/aqla">{ar ? 'الرئيسية' : 'Home'}</a>
          <a href={`/aqla/academy?lang=${lang}`}>{ar ? 'الأكاديمية' : 'Academy'}</a>
          <a href={`/aqla/sos?lang=${lang}`}>{ar ? 'مساعدة سريعة' : 'Quick help'}</a>
          <a href={`/info/${slug}?lang=${ar ? 'en' : 'ar'}`}>{ar ? 'EN' : 'ع'}</a>
        </nav>
      </header>

      <div className="ax-shell ax-narrow">
        <section className="ax-hero">
          <span className="ax-eyebrow">Aqla — أقلع</span>
          <h1>{ar ? page.titleAr : page.titleEn}</h1>
          <p>{ar ? page.introAr : page.introEn}</p>
        </section>

        <div className="ax-stack">
          {page.sections.map((section) => (
            <section className="ax-card" key={section.titleEn}>
              <h2>{ar ? section.titleAr : section.titleEn}</h2>
              <p>{ar ? section.bodyAr : section.bodyEn}</p>
            </section>
          ))}
        </div>

        <nav className="ax-footer-links" aria-label={ar ? 'روابط المعلومات' : 'Information links'}>
          <a href={`/info/about?lang=${lang}`}>{ar ? 'عن أقلع' : 'About'}</a>
          <a href={`/info/faq?lang=${lang}`}>{ar ? 'الأسئلة الشائعة' : 'FAQ'}</a>
          <a href={`/info/contact?lang=${lang}`}>{ar ? 'تواصل معنا' : 'Contact'}</a>
          <a href={`/info/privacy?lang=${lang}`}>{ar ? 'الخصوصية' : 'Privacy'}</a>
          <a href={`/info/terms?lang=${lang}`}>{ar ? 'الشروط' : 'Terms'}</a>
          <a href={`/info/medical-disclaimer?lang=${lang}`}>{ar ? 'التنبيه الطبي' : 'Medical disclaimer'}</a>
          <a href={`/info/accessibility?lang=${lang}`}>{ar ? 'إمكانية الوصول' : 'Accessibility'}</a>
        </nav>
      </div>
    </main>
  )
}
