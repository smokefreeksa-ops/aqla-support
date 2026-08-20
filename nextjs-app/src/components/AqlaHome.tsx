'use client'

import { useState } from 'react'
import AqlaAssistant from '@/components/AqlaAssistant'

const LOGO_URL = '/aqla-logo.png'
const REDCAP_URL = 'https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM'
const ASSESSMENT_URL = '/aqla/assessment'
const DASHBOARD_URL = '/aqla/dashboard'
const SOS_URL = '/aqla/sos'
const ACADEMY_URL = '/aqla/academy'

export default function AqlaHome({
  signedIn,
  latestPlanId,
}: {
  signedIn: boolean
  latestPlanId?: string
}) {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const ar = lang === 'ar'
  const savedPlanUrl = latestPlanId ? `/aqla/plan/${encodeURIComponent(latestPlanId)}?lang=${lang}` : null
  const assistantLoginUrl = `/auth/login?returnTo=${encodeURIComponent('/aqla#assistant')}`
  const dashboardUrl = signedIn ? `${DASHBOARD_URL}?lang=${lang}` : `/auth/login?returnTo=${encodeURIComponent(`${DASHBOARD_URL}?lang=${lang}`)}`

  function clearPrivateBrowserData() {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      try {
        for (let index = storage.length - 1; index >= 0; index -= 1) {
          const key = storage.key(index)
          if (key?.startsWith('aqla_quit_plan:')) storage.removeItem(key)
        }
        storage.removeItem('aqla_quit_engine_draft_v1')
      } catch {
        // Server-side session sign-out still proceeds if browser storage is unavailable.
      }
    }
  }

  return (
    <div className="aqla-home" dir={ar ? 'rtl' : 'ltr'} lang={lang}>
      <div className="aqla-header">
        <div className="aqla-header-main">
          <a href="/aqla" className="aqla-header-logo">
            <img src={LOGO_URL} alt="Aqla — أقلع" />
            <span className="aqla-header-logo-copy"><strong>{ar ? 'أقلع' : 'Aqla'}</strong><small>Aqla — أقلع</small></span>
          </a>
          <nav className="aqla-nav" aria-label={ar ? 'التنقل الرئيسي' : 'Primary navigation'}>
            <a href="/aqla">{ar ? 'الرئيسية' : 'Home'}</a>
            <a href={ASSESSMENT_URL}>{ar ? 'خطة الإقلاع' : 'Quit plan'}</a>
            <a href={dashboardUrl}>{ar ? 'لوحتي' : 'My Aqla'}</a>
            <a href={`${SOS_URL}?lang=${lang}`}>{ar ? 'مساعدة سريعة' : 'Quick help'}</a>
            <a href={`${ACADEMY_URL}?lang=${lang}`}>{ar ? 'الأكاديمية' : 'Academy'}</a>
            <a href="#assistant">{ar ? 'مساعد أقلع' : 'Aqla Assistant'}</a>
          </nav>
          <div className="aqla-header-actions">
            <button className="aqla-header-button" type="button" aria-label={ar ? 'Switch to English' : 'التبديل إلى العربية'} onClick={() => setLang(ar ? 'en' : 'ar')}>{ar ? 'EN' : 'ع'}</button>
            {signedIn ? (
              <>
                <a className="aqla-header-button" href={`${DASHBOARD_URL}?lang=${lang}`}>{ar ? 'لوحتي' : 'My Aqla'}</a>
                <a className="aqla-header-button" href="/auth/logout" onClick={clearPrivateBrowserData}>{ar ? 'تسجيل الخروج' : 'Sign out'}</a>
              </>
            ) : (
              <a className="aqla-header-button" href={ASSESSMENT_URL}>{ar ? 'ابدأ الآن' : 'Start now'}</a>
            )}
          </div>
        </div>
        <div className="research-strip">
          <div className="research-strip-inner">
            <span className="research-strip-copy">{ar ? 'تجربتك تهمنا وتساهم في البحث العلمي' : 'Your experience matters and contributes to scientific research'}</span>
            <a className="research-strip-primary" href={REDCAP_URL} target="_blank" rel="noopener noreferrer">{ar ? 'شارك الآن في الدراسة' : 'Take part in the study'}</a>
            <a className="research-strip-secondary" href={ASSESSMENT_URL}>{ar ? 'ابدأ خطة الإقلاع الشخصية' : 'Start your personal quit plan'}</a>
          </div>
        </div>
      </div>

      <main>
        <section className="aqla-hero">
          <div className="aqla-hero-panel">
            <a href={ASSESSMENT_URL} className="hero-study-chip">{ar ? 'ابدأ رحلتك مع أقلع' : 'Start your Aqla journey'}</a>
            <img src={LOGO_URL} alt="Aqla — أقلع" className="hero-logo" />
            <h1 className="hero-title"><span className="gradient">{ar ? 'أقلع' : 'Aqla'}</span> {ar ? 'عن التدخين والنيكوتين' : 'smoking and nicotine support'}</h1>
            <p className="hero-lead">{ar ? 'دعم رقمي عملي يساعدك على فهم نمط استخدامك، بناء خطة شخصية، والعودة لمتابعة تقدمك بخطوات واضحة ومحترمة.' : 'Practical digital support to understand your nicotine use, build a personal plan and return to review your progress with clear, respectful next steps.'}</p>
            <div className="hero-actions">
              <a href={ASSESSMENT_URL} className="hero-primary">{ar ? 'ابدأ خطتي الشخصية' : 'Start my personal plan'}</a>
              {signedIn ? (
                <a href={`${DASHBOARD_URL}?lang=${lang}`} className="hero-secondary">{ar ? 'افتح لوحتي' : 'Open My Aqla'}</a>
              ) : savedPlanUrl ? (
                <a href={savedPlanUrl} className="hero-secondary">{ar ? 'افتح خطتي المحفوظة' : 'Open my saved plan'}</a>
              ) : (
                <a href="#assistant" className="hero-secondary">{ar ? 'اسأل مساعد أقلع' : 'Ask Aqla Assistant'}</a>
              )}
            </div>
            <p className="hero-free">{ar ? 'مجانًا • خصوصيتك مهمة • يمكنك البدء قبل تسجيل الدخول' : 'Free to use • Privacy-conscious • You can begin before signing in'}</p>
            <div className="hero-publications">
              <div className="hero-publications-title"><span />{ar ? 'بحث منشور مرتبط بالمجال' : 'Published research in this field'}<span /></div>
              <a className="hero-publication" href="https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1641308/full" target="_blank" rel="noopener noreferrer">
                <div><strong>{ar ? 'أكياس النيكوتين: مراجعة سردية للأدبيات المتاحة' : 'Nicotine pouches: a narrative review of the existing literature'}</strong><small>Frontiers in Public Health · 2025</small></div>
              </a>
            </div>
          </div>
        </section>

        <section id="pathways" className="aqla-section">
          <div className="aqla-section-inner">
            <h2 className="aqla-section-title">{ar ? 'ما الذي يمكنك استخدامه الآن؟' : 'What can you use now?'}</h2>
            <p className="aqla-section-lead">{ar ? 'نعرض هنا فقط الخدمات المتاحة فعليًا في نسخة أقلع الحالية.' : 'Only services that are actually available in the current Aqla experience are shown here.'}</p>
            <div className="pathway-grid">
              <article className="pathway-card">
                <h3>{ar ? 'التقييم وخطة الإقلاع الشخصية' : 'Assessment and personal quit plan'}</h3>
                <p>{ar ? 'ثماني خطوات قصيرة لفهم استخدامك ومحفزاتك واستعدادك، ثم حفظ خطة شخصية في حسابك.' : 'Eight short steps to understand your use, triggers and readiness, then save a personal plan to your account.'}</p>
                <a href={ASSESSMENT_URL}>{ar ? 'ابدأ التقييم' : 'Start assessment'}</a>
              </article>
              <article className="pathway-card">
                <h3>{ar ? 'لوحتي — My Aqla' : 'My Aqla dashboard'}</h3>
                <p>{ar ? 'مكان واحد لفتح خطتك ومراجعة متابعة اليوم 3 و7 و30 وبطاقة الرغبة ومستوى الدعم.' : 'One place for your saved plan, Day 3/7/30 check-ins, craving card and support level.'}</p>
                <a href={dashboardUrl}>{signedIn ? (ar ? 'افتح لوحتي' : 'Open dashboard') : (ar ? 'سجّل الدخول لفتح اللوحة' : 'Sign in for dashboard')}</a>
              </article>
              <article className="pathway-card">
                <h3>{ar ? 'مساعدة سريعة وقت الرغبة أو الزلة' : 'Quick help for cravings or slips'}</h3>
                <p>{ar ? 'خطوات فورية للرغبة الشديدة، الزلة، الانسحاب، الرغبة في شراء النيكوتين، أو الحاجة لدعم أقوى.' : 'Immediate steps for a strong craving, slip, withdrawal, buying urge or need for stronger support.'}</p>
                <a href={`${SOS_URL}?lang=${lang}`}>{ar ? 'أحتاج مساعدة الآن' : 'I need help now'}</a>
              </article>
              <article className="pathway-card">
                <h3>{ar ? 'أكاديمية أقلع' : 'Aqla Academy'}</h3>
                <p>{ar ? 'مكتبة بداية عملية لفهم نمط النيكوتين والمحـفزات والرغبة والانسحاب ومنع الانتكاس.' : 'A practical starter library on nicotine patterns, triggers, cravings, withdrawal and relapse prevention.'}</p>
                <a href={`${ACADEMY_URL}?lang=${lang}`}>{ar ? 'ابدأ التعلم' : 'Start learning'}</a>
              </article>
              <article className="pathway-card">
                <h3>{savedPlanUrl ? (ar ? 'العودة إلى خطتك' : 'Return to your plan') : (ar ? 'مساعد أقلع التثقيفي' : 'Aqla educational assistant')}</h3>
                <p>{savedPlanUrl
                  ? (ar ? 'افتح خطتك المحفوظة وراجع الخطوات وبطاقة التعامل مع الرغبة.' : 'Open your saved plan and review your steps and craving card.')
                  : (ar ? 'اطرح أسئلة عامة عن الإقلاع، المحفزات والاستعداد للخطوة التالية. لا يقدّم تشخيصًا أو وصفات دوائية.' : 'Ask general questions about quitting, triggers and preparing for the next step. It does not diagnose or prescribe.')}</p>
                <a href={savedPlanUrl ?? (signedIn ? '#assistant' : assistantLoginUrl)}>{savedPlanUrl ? (ar ? 'افتح خطتي' : 'Open my plan') : (signedIn ? (ar ? 'تحدث مع المساعد' : 'Talk to the assistant') : (ar ? 'سجّل الدخول لاستخدام المساعد' : 'Sign in to use the assistant'))}</a>
              </article>
            </div>
          </div>
        </section>

        <section id="assistant" className="aqla-section">
          <div className="aqla-section-inner">
            <div className="ai-card">
              <div>
                <h2>{ar ? 'مساعد أقلع' : 'Aqla Assistant'}</h2>
                <p>{ar ? 'دعم تثقيفي عملي لفهم خيارات الإقلاع والتعامل مع المحفزات والاستعداد للخطوة التالية. لا يقدّم تشخيصًا طبيًا أو وصفات أو جرعات دوائية.' : 'Practical educational support for understanding quit options, triggers and your next step. It does not provide medical diagnoses, prescriptions or medication doses.'}</p>
              </div>
              <div>
                {signedIn ? (
                  <button type="button" onClick={() => window.dispatchEvent(new Event('aqla:open-assistant'))}>{ar ? 'تحدث مع مساعد أقلع' : 'Talk to Aqla Assistant'}</button>
                ) : (
                  <a href={assistantLoginUrl}>{ar ? 'سجّل الدخول لاستخدام المساعد' : 'Sign in to use the assistant'}</a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="aqla-footer">
        <span>Aqla — أقلع · {ar ? 'دعم الإقلاع عن التدخين والنيكوتين' : 'Smoking and nicotine cessation support'}</span>
        <span> · <a href={`/info/about?lang=${lang}`}>{ar ? 'عن أقلع' : 'About'}</a> · <a href={`/info/faq?lang=${lang}`}>{ar ? 'الأسئلة الشائعة' : 'FAQ'}</a> · <a href={`/info/privacy?lang=${lang}`}>{ar ? 'الخصوصية' : 'Privacy'}</a> · <a href={`/info/medical-disclaimer?lang=${lang}`}>{ar ? 'التنبيه الطبي' : 'Medical disclaimer'}</a> · <a href={`/info/contact?lang=${lang}`}>{ar ? 'تواصل' : 'Contact'}</a></span>
      </footer>
      {signedIn ? <AqlaAssistant lang={lang} /> : null}
    </div>
  )
}
