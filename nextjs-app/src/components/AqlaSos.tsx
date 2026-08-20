'use client'

import { useMemo, useState } from 'react'

type Lang = 'ar' | 'en'
type RescueKey = 'craving' | 'slip' | 'withdrawal' | 'buying' | 'professional' | 'urgent'

const rescueContent: Record<RescueKey, {
  titleAr: string
  titleEn: string
  introAr: string
  introEn: string
  stepsAr: string[]
  stepsEn: string[]
}> = {
  craving: {
    titleAr: 'الرغبة شديدة الآن', titleEn: 'The craving is strong right now',
    introAr: 'لا تحتاج أن تحسم بقية حياتك الآن. ركّز فقط على الدقائق العشر القادمة.',
    introEn: 'You do not need to decide the rest of your life right now. Focus only on the next ten minutes.',
    stepsAr: ['أجّل قرار الاستخدام عشر دقائق.', 'ابتعد عن مصدر النيكوتين أو غيّر المكان فورًا.', 'اشغل يديك وذهنك بمهمة قصيرة ومحددة.', 'اقرأ بطاقة الرغبة الشخصية أدناه إذا كانت لديك خطة محفوظة.'],
    stepsEn: ['Delay the decision to use for ten minutes.', 'Move away from the nicotine source or change location now.', 'Occupy your hands and attention with one short, specific task.', 'Read your personal craving card below if you have a saved plan.'],
  },
  slip: {
    titleAr: 'حدثت زلة', titleEn: 'I had a slip',
    introAr: 'الزلة لا تعني أن الخطة انتهت. أهم خطوة هي منع الاستخدام التالي من أن يتحول إلى عودة كاملة للنمط القديم.',
    introEn: 'A slip does not mean the plan is over. The most useful step is preventing the next use from turning into a full return to the old pattern.',
    stepsAr: ['أوقف السلسلة الآن بدل انتظار الغد.', 'حدد الموقف أو المحفز الذي سبق الزلة.', 'غيّر خطوة واحدة في خطتك لهذا المحفز.', 'ارجع إلى المتابعة وسجل ما حدث عندما تصبح نقطة المتابعة متاحة.'],
    stepsEn: ['Stop the chain now rather than waiting for tomorrow.', 'Identify the situation or trigger immediately before the slip.', 'Change one plan step for that trigger.', 'Return to your check-in and record what happened when it becomes available.'],
  },
  withdrawal: {
    titleAr: 'أعراض الانسحاب مزعجة', titleEn: 'Withdrawal feels difficult',
    introAr: 'قد تحدث تغيرات في المزاج والتركيز والنوم والرغبة بعد التوقف أو الخفض، وتختلف شدتها بين الأشخاص.',
    introEn: 'Mood, concentration, sleep and craving changes can occur after quitting or cutting down, and severity varies between people.',
    stepsAr: ['خفف المطالب غير الضرورية على نفسك خلال الفترة الصعبة.', 'حافظ على وجبات ونوم وروتين يومي منتظم قدر الإمكان.', 'استخدم خطة المحفزات وبطاقة الرغبة بدل اتخاذ قرار تحت ضغط اللحظة.', 'إذا كانت الأعراض شديدة أو غير معتادة أو تقلقك، اطلب تقييمًا من مختص صحي.'],
    stepsEn: ['Reduce unnecessary demands on yourself during the difficult period.', 'Keep meals, sleep and daily routine as regular as practical.', 'Use your trigger plan and craving card instead of deciding under pressure.', 'If symptoms are severe, unusual or concerning, seek assessment from a healthcare professional.'],
  },
  buying: {
    titleAr: 'أنا على وشك شراء النيكوتين', titleEn: 'I am about to buy nicotine',
    introAr: 'غيّر البيئة قبل أن تعتمد على قوة الإرادة. الهدف هو خلق مسافة قصيرة بين الرغبة والشراء.',
    introEn: 'Change the environment before relying on willpower. The goal is to create a short gap between the urge and the purchase.',
    stepsAr: ['غادر المكان أو غيّر مسارك إذا كان ذلك آمنًا.', 'أجّل الشراء عشر دقائق فقط.', 'اتصل أو أرسل رسالة لشخص دعم إذا كان لديك شخص محدد.', 'افتح خطتك وراجع سببك الشخصي وأول خطوة فيها.'],
    stepsEn: ['Leave the location or change route if it is safe to do so.', 'Delay the purchase for just ten minutes.', 'Call or message a support person if you have one.', 'Open your plan and review your personal reason and first step.'],
  },
  professional: {
    titleAr: 'أحتاج دعمًا أقوى', titleEn: 'I need stronger support',
    introAr: 'طلب الدعم المهني خطوة عملية، خصوصًا مع الاستخدام الشديد أو المتعدد أو المحاولات المتكررة التي لم تستمر.',
    introEn: 'Professional support is a practical next step, especially with heavy or mixed use or repeated attempts that did not last.',
    stepsAr: ['تواصل مع طبيب أو صيدلي أو خدمة متخصصة بالإقلاع عن التدخين والنيكوتين.', 'اذكر المنتجات التي تستخدمها وتكرار الاستخدام والمحاولات السابقة.', 'إذا كنت تستخدم أدوية منتظمة أو لديك حالة صحية، شارك هذه المعلومات مع المختص.', 'لا تغيّر جرعات الأدوية أو تبدأ علاجًا دوائيًا اعتمادًا على أقلع وحده.'],
    stepsEn: ['Contact a doctor, pharmacist or specialist smoking/nicotine cessation service.', 'Explain which products you use, frequency and previous attempts.', 'If you take regular medicines or have a health condition, share this with the professional.', 'Do not change medication doses or start drug treatment based on Aqla alone.'],
  },
  urgent: {
    titleAr: 'هناك مشكلة سلامة عاجلة', titleEn: 'There is an urgent safety concern',
    introAr: 'أقلع ليس خدمة طوارئ. بعض الأعراض أو المخاطر تحتاج مساعدة مباشرة ولا ينبغي انتظار خطة رقمية.',
    introEn: 'Aqla is not an emergency service. Some symptoms or risks need direct help and should not wait for a digital plan.',
    stepsAr: ['إذا كان هناك خطر فوري، اطلب خدمات الطوارئ المحلية الآن.', 'إذا كان لديك ألم صدر شديد، صعوبة تنفس شديدة، فقدان وعي، أو أفكار جادة بإيذاء النفس، اطلب مساعدة طارئة فورًا.', 'إذا كنت تستطيع، ابقَ مع شخص موثوق أو اطلب منه البقاء معك حتى تصل المساعدة.', 'لا تستخدم المساعد أو خطة أقلع بدل التقييم العاجل.'],
    stepsEn: ['If there is immediate danger, contact your local emergency service now.', 'For severe chest pain, severe breathing difficulty, loss of consciousness or serious thoughts of self-harm, seek emergency help immediately.', 'If possible, stay with a trusted person or ask them to remain with you until help arrives.', 'Do not use the assistant or Aqla plan instead of urgent assessment.'],
  },
}

export default function AqlaSos({
  initialLang,
  signedIn,
  personalCravingCard,
  referralMessage,
  safetyImmediate,
}: {
  initialLang: Lang
  signedIn: boolean
  personalCravingCard?: string
  referralMessage?: string
  safetyImmediate?: string
}) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [selected, setSelected] = useState<RescueKey>('craving')
  const ar = lang === 'ar'
  const current = rescueContent[selected]
  const options = useMemo(() => (Object.keys(rescueContent) as RescueKey[]), [])

  return (
    <main className="ax-page ax-sos-page" dir={ar ? 'rtl' : 'ltr'} lang={lang}>
      <header className="ax-topbar">
        <a className="ax-brand" href="/aqla"><img src="/aqla-logo.png" alt="Aqla — أقلع" /><span>{ar ? 'أقلع' : 'Aqla'}</span></a>
        <nav className="ax-nav" aria-label={ar ? 'التنقل' : 'Navigation'}>
          <a href="/aqla">{ar ? 'الرئيسية' : 'Home'}</a>
          {signedIn ? <a href={`/aqla/dashboard?lang=${lang}`}>{ar ? 'لوحتي' : 'My Aqla'}</a> : null}
          <a href={`/aqla/academy?lang=${lang}`}>{ar ? 'الأكاديمية' : 'Academy'}</a>
          <button type="button" onClick={() => setLang(ar ? 'en' : 'ar')}>{ar ? 'EN' : 'ع'}</button>
        </nav>
      </header>

      <div className="ax-shell ax-narrow">
        <section className="ax-hero ax-sos-hero">
          <span className="ax-eyebrow">{ar ? 'مساعدة سريعة' : 'Quick support'}</span>
          <h1>{ar ? 'ما الذي يحدث الآن؟' : 'What is happening right now?'}</h1>
          <p>{ar ? 'اختر الموقف الأقرب لما تمر به. هذه الصفحة تعطيك خطوة عملية مباشرة ولا تحتاج إلى تسجيل الدخول.' : 'Choose the situation closest to what you are experiencing. This page gives an immediate practical next step and does not require sign-in.'}</p>
        </section>

        {safetyImmediate ? <section className="ax-alert danger"><strong>{ar ? 'تنبيه سلامة من خطتك' : 'Safety note from your plan'}</strong><p>{safetyImmediate}</p></section> : null}

        <div className="ax-choice-grid" role="list" aria-label={ar ? 'اختر نوع المساعدة' : 'Choose support type'}>
          {options.map((key) => {
            const item = rescueContent[key]
            return <button key={key} type="button" className={selected === key ? 'selected' : ''} onClick={() => setSelected(key)}>{ar ? item.titleAr : item.titleEn}</button>
          })}
        </div>

        <section className={`ax-card ax-rescue-card ${selected === 'urgent' ? 'urgent' : ''}`} aria-live="polite">
          <span className="ax-eyebrow">{ar ? 'الخطوة التالية' : 'Next step'}</span>
          <h2>{ar ? current.titleAr : current.titleEn}</h2>
          <p className="ax-rescue-intro">{ar ? current.introAr : current.introEn}</p>
          <ol className="ax-rescue-steps">{(ar ? current.stepsAr : current.stepsEn).map((step) => <li key={step}>{step}</li>)}</ol>
        </section>

        {personalCravingCard && selected !== 'urgent' ? (
          <section className="ax-card ax-personal-card">
            <span className="ax-eyebrow">{ar ? 'من خطتك الشخصية' : 'From your personal plan'}</span>
            <h2>{ar ? 'بطاقة الرغبة الخاصة بك' : 'Your craving card'}</h2>
            <p>{personalCravingCard}</p>
          </section>
        ) : null}

        {referralMessage && selected === 'professional' ? (
          <section className="ax-card"><h2>{ar ? 'توجيه الدعم في خطتك' : 'Support guidance in your plan'}</h2><p>{referralMessage}</p></section>
        ) : null}

        <div className="ax-hero-actions ax-centered-actions">
          {signedIn ? <a className="ax-button primary" href={`/aqla/dashboard?lang=${lang}`}>{ar ? 'العودة إلى لوحتي' : 'Back to My Aqla'}</a> : <a className="ax-button primary" href="/aqla/assessment">{ar ? 'ابدأ خطتي الشخصية' : 'Start my personal plan'}</a>}
          <a className="ax-button secondary" href={`/info/medical-disclaimer?lang=${lang}`}>{ar ? 'متى أطلب مساعدة طبية؟' : 'When should I seek medical help?'}</a>
        </div>
      </div>
    </main>
  )
}
