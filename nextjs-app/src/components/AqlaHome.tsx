'use client'

import { useState } from 'react'
import AqlaAssistant from '@/components/AqlaAssistant'

const LOGO_URL = '/aqla-logo.png'
const REDCAP_URL = 'https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM'
const ASSESSMENT_URL = '/aqla/assessment'
const ASSESSMENT_LOGIN_URL = `/auth/login?returnTo=${encodeURIComponent(ASSESSMENT_URL)}`

export default function AqlaHome({ signedIn, email }: { signedIn: boolean; email?: string }) {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const ar = lang === 'ar'

  function prepareSignOut() {
    try {
      for (let index = localStorage.length - 1; index >= 0; index -= 1) {
        const key = localStorage.key(index)
        if (key?.startsWith('aqla_quit_plan:')) localStorage.removeItem(key)
      }
      localStorage.removeItem('aqla_quit_engine_draft_v1')
    } catch {
      // Cookie/session sign-out still proceeds if browser storage is unavailable.
    }
  }

  const pathways = ar ? [
    ['مركز أقلع الافتراضي لدعم الإقلاع','تجربة تفاعلية تقودك من فهم استخدامك للتدخين أو النيكوتين، إلى التقييم، وبناء الخطة، والمتابعة، وطلب الدعم عند الحاجة.','ابدأ مسار الإقلاع'],
    ['أكاديمية أقلع للتدريب والشهادات','مركز تعليمي تفاعلي للتدريب، السيناريوهات، الاختبارات، والشهادات القابلة للتحميل والمشاركة والتحقق.','ادخل الأكاديمية'],
    ['مسار أقلع لمساعدة شخص يهمك','لمن يريد دعم صديق، قريب، طالب، زميل، أو شخص يهتم لأمره برسالة أو بطاقة دعم محترمة وآمنة.','ابدأ مسار المساعدة'],
    ['مجتمع وتحديات أقلع','للتحديات، الألعاب التوعوية، الهاشتاقات، دعوة الأصدقاء، النقاط، الأوسمة، بطاقات التوعية، وأثر أقلع المجتمعي.','ادخل التحديات والمجتمع'],
  ] : [
    ['Aqla Virtual Quit Center','Understand your nicotine use, complete an assessment, build a personalised plan, follow up and request support when needed.','Start quit pathway'],
    ['Aqla Academy for Training & Certification','Interactive learning, scenarios, assessments and verifiable certificates.','Enter academy'],
    ['Aqla Help Pathway','Support someone you care about with respectful and safe guidance.','Help someone'],
    ['Aqla Community & Challenges','Challenges, awareness activities, invites, points, medals and community impact.','Enter community'],
  ]

  return (
    <div className="aqla-home" dir={ar ? 'rtl' : 'ltr'} lang={lang}>
      <div className="aqla-header">
        <div className="aqla-header-main">
          <a href="/aqla" className="aqla-header-logo">
            <img src={LOGO_URL} alt="Aqla — أقلع" />
            <span className="aqla-header-logo-copy"><strong>{ar ? 'أقلع' : 'Aqla'}</strong><small>Aqla — أقلع</small></span>
          </a>
          <nav className="aqla-nav">
            <a href="/aqla">{ar ? 'الرئيسية' : 'Home'}</a>
            <a href={ASSESSMENT_URL}>{ar ? 'مسار الإقلاع' : 'Quit Pathway'}</a>
            <a href="#pathways">{ar ? 'مسار المساعدة' : 'Help Someone'}</a>
            <a href="#pathways">{ar ? 'التحديات والأنشطة' : 'Challenges'}</a>
            <a href="#assistant">{ar ? 'المساعد الذكي' : 'AI Assistant'}</a>
          </nav>
          <div className="aqla-header-actions">
            <button className="aqla-header-button" type="button" aria-label={ar ? 'Switch to English' : 'التبديل إلى العربية'} onClick={() => setLang(ar ? 'en' : 'ar')}>{ar ? 'EN' : 'ع'}</button>
            {signedIn ? <><a className="aqla-header-button" href={ASSESSMENT_URL}>{ar ? 'ابدأ خطتي' : 'My plan'}</a><a className="aqla-header-button" href="/auth/logout" onClick={prepareSignOut}>{ar ? 'تسجيل الخروج' : 'Sign out'}</a></> : <a className="aqla-header-button" href={ASSESSMENT_LOGIN_URL}>{ar ? 'ابدأ الآن' : 'Start now'}</a>}
          </div>
        </div>
        <div className="research-strip">
          <div className="research-strip-inner">
            <span className="research-strip-copy">{ar ? 'تجربتك تهمنا وتساهم في البحث العلمي' : 'Your experience matters and contributes to scientific research'}</span>
            <a className="research-strip-primary" href={REDCAP_URL} target="_blank" rel="noreferrer">{ar ? 'شارك الآن في الدراسة' : 'Take part in the study'}</a>
            <a className="research-strip-secondary" href={ASSESSMENT_URL}>{ar ? 'ابدأ خطة الإقلاع الشخصية' : 'Start your personal quit plan'}</a>
            <span className="research-strip-count"><span className="live-dot" />{ar ? '٥٧٢ زيارة' : '572 visits'}</span>
          </div>
        </div>
      </div>

      <main>
        <section className="aqla-hero">
          <div className="aqla-hero-panel">
            <a href={ASSESSMENT_URL} className="hero-study-chip">{ar ? 'ابدأ رحلتك في مركز الإقلاع الافتراضي' : 'Start your journey in the virtual quit center'}</a>
            <img src={LOGO_URL} alt="Aqla — أقلع" className="hero-logo" />
            <h1 className="hero-title"><span className="gradient">{ar ? 'أقلع' : 'Aqla'}</span> {ar ? 'عن التدخين' : 'from smoking'}</h1>
            <p className="hero-lead">{ar ? 'منصة علمية متكاملة لدعم الإقلاع عن التدخين — مبنية على أحدث الأدلة السريرية وتجمع بين التقنية والرعاية الشخصية لتحقيق نتائج مستدامة.' : 'An integrated scientific platform for smoking and nicotine cessation support, combining evidence, technology and personalised care.'}</p>
            <div className="hero-actions">
              <a href={signedIn ? ASSESSMENT_URL : ASSESSMENT_LOGIN_URL} className="hero-primary">{ar ? 'أريد أن أتوقف عن التدخين' : 'I want to quit smoking'}</a>
              <a href="#pathways" className="hero-secondary">{ar ? 'شهادات ودورات الأخصائي المعتمد' : 'Training & certificates'}</a>
            </div>
            <p className="hero-free">{ar ? 'مجاناً تماماً • مدعوم بالأدلة العلمية • ابدأ الآن' : 'Completely free • Evidence-based • Start now'}</p>
            <a className="hero-video" href="https://www.youtube.com/@aqla_program" target="_blank" rel="noreferrer">▶ {ar ? 'شاهد الفيديو التعريفي' : 'Watch introduction video'}</a>
            <div className="hero-publications">
              <div className="hero-publications-title"><span />{ar ? 'أحدث أبحاثنا المنشورة' : 'Latest published research'}<span /></div>
              <a className="hero-publication" href="https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1641308/full" target="_blank" rel="noreferrer">
                <div><strong>{ar ? 'انتشار استخدام التبغ وأنماطه بين البالغين السعوديين' : 'Tobacco use prevalence and patterns among Saudi adults'}</strong><small>Frontiers in Public Health · 2025</small></div>
              </a>
            </div>
          </div>
        </section>

        <section id="pathways" className="aqla-section">
          <div className="aqla-section-inner">
            <h2 className="aqla-section-title">{ar ? 'اختر مسارك في أقلع' : 'Choose your Aqla pathway'}</h2>
            <p className="aqla-section-lead">{ar ? 'أقلع يدعمك سواء كنت جاهزًا للإقلاع الآن، تفكر فيه، تريد التقليل أولًا، أو ترغب في تعلم كيفية دعم الآخرين.' : 'Aqla supports you whether you are ready to quit, considering it, reducing first, or learning to support others.'}</p>
            <div className="pathway-grid">
              {pathways.map(([title, desc, cta], i) => (
                <article className="pathway-card" key={title}>
                  <h3>{title}</h3><p>{desc}</p>
                  <a href={i === 0 ? (signedIn ? ASSESSMENT_URL : ASSESSMENT_LOGIN_URL) : '#assistant'}>{cta}</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="assistant" className="aqla-section">
          <div className="aqla-section-inner">
            <div className="ai-card">
              <div>
                <h2>{ar ? 'مساعد أقلع الذكي' : 'Aqla Smart Assistant'}</h2>
                <p>{ar ? 'المساعد يعمل من داخل AWS باستخدام مشروع OpenAI الخاص ببيئة Aqla staging. يحافظ أقلع على قواعد السلامة والمنطق السريري بينما يستخدم النموذج لتخصيص الحوار والمحتوى.' : 'The assistant runs from AWS using the dedicated Aqla staging OpenAI project. Aqla controls safety and clinical logic while the model personalises the conversation.'}</p>
                {signedIn && email ? <p style={{fontSize:12,opacity:.7}}>{ar ? `تم تسجيل الدخول باسم ${email}` : `Signed in as ${email}`}</p> : null}
              </div>
              <div><button type="button" onClick={() => window.dispatchEvent(new Event('aqla:open-assistant'))}>{ar ? 'تحدث مع مساعد أقلع' : 'Talk to Aqla Assistant'}</button></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="aqla-footer">Aqla — أقلع · {ar ? 'دعم الإقلاع عن التدخين والنيكوتين' : 'Smoking and nicotine cessation support'}</footer>
      <AqlaAssistant lang={lang} />
    </div>
  )
}
