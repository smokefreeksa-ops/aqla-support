export const dynamic = 'force-dynamic'

const modules = [
  {
    titleAr: 'افهم نمط النيكوتين', titleEn: 'Understand your nicotine pattern',
    bodyAr: 'الاعتماد ليس رقمًا واحدًا. الوقت لأول استخدام، الروتين، المواقف الاجتماعية، وشدة الاستخدام كلها تساعدك على فهم أين تبدأ.',
    bodyEn: 'Dependence is not a single number. Time to first use, routines, social situations and intensity all help identify where to begin.',
    tipsAr: ['راقب متى تبدأ الرغبة بدل التركيز على عدد مرات الاستخدام فقط.', 'حدد المنتج الأساسي إذا كنت تستخدم أكثر من منتج.', 'استخدم التقييم الشخصي عندما تريد خطة مرتبطة بنمطك.'],
    tipsEn: ['Notice when cravings start, not only how often you use.', 'Identify a primary product if you use more than one.', 'Use the personal assessment when you want a plan linked to your pattern.'],
  },
  {
    titleAr: 'اعرف محفزاتك', titleEn: 'Know your triggers',
    bodyAr: 'المحفز قد يكون وجبة، قهوة، سيارة، جلسة اجتماعية، ضغطًا نفسيًا أو مجرد عادة متكررة. تسمية المحفز تجعل التخطيط له أسهل.',
    bodyEn: 'A trigger may be a meal, coffee, driving, a social setting, stress or a repeated routine. Naming the trigger makes it easier to plan for it.',
    tipsAr: ['اختر محفزين متكررين وغيّر روتينهما أولًا.', 'جهّز بديلًا واضحًا قبل الموقف وليس أثناءه.', 'بعد كل زلة، اسأل: ما المحفز الذي سبقها؟'],
    tipsEn: ['Choose two frequent triggers and change those routines first.', 'Prepare a clear alternative before the situation, not during it.', 'After a slip, ask what trigger came immediately before it.'],
  },
  {
    titleAr: 'تعامل مع الرغبة', titleEn: 'Handle a craving',
    bodyAr: 'الرغبة يمكن التعامل معها كحدث قصير يحتاج خطة عملية: تأخير القرار، تغيير المكان أو النشاط، والانشغال بخطوة بسيطة حتى تمر الموجة.',
    bodyEn: 'A craving can be treated as a short event needing a practical plan: delay the decision, change place or activity, and use a simple action while the urge passes.',
    tipsAr: ['أجّل القرار عشر دقائق وابتعد عن مصدر النيكوتين.', 'غيّر المكان أو ابدأ نشاطًا قصيرًا يشغل يديك وذهنك.', 'افتح بطاقة الرغبة في خطتك أو صفحة المساعدة السريعة.'],
    tipsEn: ['Delay the decision for ten minutes and move away from the nicotine source.', 'Change location or start a short activity that occupies your hands and attention.', 'Open your craving card or the quick-support page.'],
  },
  {
    titleAr: 'توقع أعراض الانسحاب', titleEn: 'Expect withdrawal symptoms',
    bodyAr: 'قد يشعر بعض الأشخاص بعصبية، صعوبة تركيز، تغير في النوم أو زيادة في الرغبة بعد التوقف أو الخفض. شدة التجربة تختلف بين الأشخاص.',
    bodyEn: 'Some people notice irritability, difficulty concentrating, sleep changes or stronger urges after quitting or cutting down. The experience varies between people.',
    tipsAr: ['خطط لأيامك الأولى بدل الاعتماد على قوة الإرادة وحدها.', 'إذا كانت الأعراض شديدة أو غير معتادة أو تقلقك، اطلب تقييمًا مهنيًا.', 'لا تستخدم أقلع كبديل للطوارئ أو التقييم الطبي.'],
    tipsEn: ['Plan your first days rather than relying on willpower alone.', 'If symptoms are severe, unusual or concerning, seek professional assessment.', 'Do not use Aqla as a substitute for emergency or medical assessment.'],
  },
  {
    titleAr: 'تعافَ من الزلة بسرعة', titleEn: 'Recover quickly from a slip',
    bodyAr: 'استخدام مرة واحدة لا يلغي ما تعلمته. الهدف هو إيقاف التحول من زلة قصيرة إلى عودة كاملة للنمط القديم.',
    bodyEn: 'One episode of use does not erase what you learned. The goal is to stop a short slip becoming a full return to the old pattern.',
    tipsAr: ['أوقف الاستخدام التالي بدل انتظار يوم جديد أو أسبوع جديد.', 'حدد سبب الزلة وعدّل خطوة واحدة في الخطة.', 'ارجع إلى المتابعة ولا تخفِ الزلة عن نفسك.'],
    tipsEn: ['Stop the next use rather than waiting for a new day or week.', 'Identify what caused the slip and change one plan step.', 'Return to your check-in and record the slip honestly.'],
  },
  {
    titleAr: 'حافظ على التقدم', titleEn: 'Maintain progress',
    bodyAr: 'بعد الأيام الأولى، ركز على المواقف التي ما زالت تعيد الرغبة، وعلى بناء روتين جديد يمكن الاستمرار عليه.',
    bodyEn: 'After the early days, focus on situations that still trigger urges and on building a replacement routine you can sustain.',
    tipsAr: ['راجع المتابعة في اليوم 3 و7 و30 عندما تصبح متاحة.', 'احتفظ بسبب شخصي واضح للاستمرار.', 'اطلب دعمًا مهنيًا إذا كانت المحاولات المتكررة لا تستمر أو كان الاستخدام شديدًا ومتعددًا.'],
    tipsEn: ['Complete Day 3, 7 and 30 check-ins when they become available.', 'Keep one clear personal reason for continuing.', 'Seek professional support if repeated attempts do not last or use is heavy and mixed.'],
  },
]

export default async function AcademyPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const query = await searchParams
  const lang = query.lang === 'en' ? 'en' : 'ar'
  const ar = lang === 'ar'

  return (
    <main className="ax-page" dir={ar ? 'rtl' : 'ltr'} lang={lang}>
      <header className="ax-topbar">
        <a className="ax-brand" href="/aqla"><img src="/aqla-logo.png" alt="Aqla — أقلع" /><span>{ar ? 'أقلع' : 'Aqla'}</span></a>
        <nav className="ax-nav" aria-label={ar ? 'التنقل' : 'Navigation'}>
          <a href="/aqla">{ar ? 'الرئيسية' : 'Home'}</a>
          <a href={`/aqla/dashboard?lang=${lang}`}>{ar ? 'لوحتي' : 'My Aqla'}</a>
          <a href={`/aqla/sos?lang=${lang}`}>{ar ? 'مساعدة سريعة' : 'Quick help'}</a>
          <a href={`/aqla/academy?lang=${ar ? 'en' : 'ar'}`}>{ar ? 'EN' : 'ع'}</a>
        </nav>
      </header>

      <div className="ax-shell">
        <section className="ax-hero">
          <span className="ax-eyebrow">{ar ? 'أكاديمية أقلع' : 'Aqla Academy'}</span>
          <h1>{ar ? 'معرفة عملية تساعدك على اتخاذ الخطوة التالية' : 'Practical knowledge for your next step'}</h1>
          <p>{ar ? 'مكتبة بداية مختصرة لفهم الاستخدام والمحـفزات والرغبة والانسحاب والزلات والحفاظ على التقدم. لا توجد شهادات أو نسب إنجاز وهمية؛ المحتوى هنا للتعلم فقط.' : 'A concise starter library on use patterns, triggers, cravings, withdrawal, slips and maintaining progress. There are no fake certificates or progress scores; this content is for learning.'}</p>
          <div className="ax-hero-actions">
            <a className="ax-button primary" href="/aqla/assessment">{ar ? 'ابنِ خطتي الشخصية' : 'Build my personal plan'}</a>
            <a className="ax-button secondary" href={`/aqla/sos?lang=${lang}`}>{ar ? 'مساعدة سريعة الآن' : 'Quick help now'}</a>
          </div>
        </section>

        <div className="ax-grid ax-academy-grid">
          {modules.map((module, index) => (
            <article className="ax-card ax-module" key={module.titleEn}>
              <span className="ax-module-number">{String(index + 1).padStart(2, '0')}</span>
              <h2>{ar ? module.titleAr : module.titleEn}</h2>
              <p>{ar ? module.bodyAr : module.bodyEn}</p>
              <ul>{(ar ? module.tipsAr : module.tipsEn).map((tip) => <li key={tip}>{tip}</li>)}</ul>
            </article>
          ))}
        </div>

        <section className="ax-alert neutral">
          <strong>{ar ? 'تعلم ثم طبّق على خطتك' : 'Learn, then apply it to your plan'}</strong>
          <p>{ar ? 'الأكاديمية لا تستبدل تقييمك الشخصي. استخدم التقييم عندما تريد أن يحول أقلع هذه المبادئ إلى خطوات مرتبطة بنمطك أنت.' : 'The Academy does not replace your personal assessment. Use the assessment when you want Aqla to turn these principles into steps linked to your own pattern.'}</p>
        </section>
      </div>
    </main>
  )
}
