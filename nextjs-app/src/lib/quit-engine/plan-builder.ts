import type { EngineAnswers, EngineResult, PlanSection, TriggerKey } from './types'
import {
  classifyDependence,
  classifyReadiness,
  computeAqlaSupportIntensity,
  computeHSI,
  hasSuicidalIdeation,
  requiresReferral,
  topTriggerPatterns,
} from './scoring'

type Lang = 'ar' | 'en'

const dependenceText = {
  ar: {
    high: 'يبدو أن النيكوتين يدخل يومك بقوة أو بتكرار مرتفع. خطتك تحتاج دعمًا منظمًا ومتابعة أقرب، مع مناقشة خيارات العلاج المناسبة مع طبيب أو صيدلي إذا رغبت.',
    moderate: 'هناك اعتماد عملي ومحفزات متكررة، لكن هذا قابل للتعامل بخطة واضحة وتغيير الروتين خطوة بخطوة.',
    low_ritual: 'يبدو أن استخدامك مرتبط بمواقف وطقوس محددة أكثر من كونه حاضرًا طوال اليوم. هذا يجعل كسر المحفزات نقطة بداية قوية.',
    complex_mixed: 'لديك أكثر من منتج أو نمط استخدام. الأفضل ترتيب الأولويات بدل محاولة تغيير كل شيء دفعة واحدة.',
  },
  en: {
    high: 'Nicotine appears to be strongly embedded in your day or used frequently. A structured plan and closer follow-up are sensible, with treatment options discussed with a clinician or pharmacist if needed.',
    moderate: 'There is a practical dependence pattern with repeated triggers, but it can be addressed with a clear plan and step-by-step routine changes.',
    low_ritual: 'Your nicotine use seems linked more to specific situations and rituals than to constant use through the day. Breaking those triggers is a strong place to start.',
    complex_mixed: 'You use more than one product or pattern. It is better to prioritise the main sources of nicotine rather than change everything at once.',
  },
} as const

const readinessText = {
  ar: {
    ready_now: 'أنت قريب من البدء. سنركز على خطوة واضحة خلال 24 ساعة، ثم خطة قصيرة لأول أسبوع.',
    wants_but_low_confidence: 'الإقلاع مهم لك، لكن ثقتك أو استعدادك أقل. سنجعل أول خطوة صغيرة وقابلة للتنفيذ بدل طلب قرار كبير.',
    low_importance_high_confidence: 'تبدو قادرًا على التغيير، لكن السبب الشخصي يحتاج أن يصبح أوضح. سنربط الخطة بما يهمك أنت.',
    not_ready: 'لن نضغطك إلى وعد لا تؤمن به. الهدف الآن أن تقترب خطوة واحدة من قرار أفضل.',
  },
  en: {
    ready_now: 'You are close to taking action. We will focus on one clear step in the next 24 hours and a short plan for the first week.',
    wants_but_low_confidence: 'Quitting matters to you, but confidence or readiness is lower. We will make the first step small and achievable rather than demand a big commitment.',
    low_importance_high_confidence: 'You seem capable of change, but your personal reason needs to become clearer. The plan will connect to what matters to you.',
    not_ready: 'AQla will not pressure you into a promise you do not believe in. The aim is to move one useful step closer to change.',
  },
} as const

const triggerPlans: Record<Lang, Partial<Record<TriggerKey, PlanSection>>> = {
  ar: {
    coffee: { title: 'خطة القهوة بلا نيكوتين', steps: ['غيّر مكان القهوة.', 'اشرب ماء معها.', 'بعد القهوة امشِ دقيقتين.', 'تجنب شربها مع مدخنين في الأيام الأولى.'], craving_card: 'هذه ذاكرة مرتبطة بالقهوة وليست أمرًا يجب تنفيذه. سأكمل القهوة بلا نيكوتين وأغيّر المكان.' },
    car: { title: 'خطة السيارة النظيفة', steps: ['أزل أدوات التدخين أو النيكوتين من السيارة.', 'ضع ماء أو علكة في متناولك.', 'غيّر محتوى القيادة أو المسار المعتاد عند الإمكان.', 'إذا اشتدت الرغبة توقف في مكان آمن وخذ استراحة قصيرة.'], craving_card: 'الزحمة لا تحتاج نيكوتين. سأشرب ماء وأكمل القيادة بأمان.' },
    after_meal: { title: 'خطة ما بعد الأكل', steps: ['انهض مباشرة بعد الوجبة.', 'اغسل فمك أو أسنانك.', 'امشِ خمس دقائق.', 'ابتعد عن مكان الاستخدام المعتاد.'], craving_card: 'الوجبة انتهت، ولا أحتاج طقس النيكوتين بعدها. سأتحرك خمس دقائق.' },
    stress: { title: 'خطة التوتر بلا نيكوتين', steps: ['لا تتخذ قرارًا أول 60 ثانية.', 'غيّر المكان.', 'تنفس ببطء عشر مرات.', 'امشِ خمس دقائق أو تواصل مع شخص داعم.'], craving_card: 'أنا متوتر، وهذا لا يعني أنني أحتاج نيكوتين. سأعبر أول عشر دقائق.' },
    anxiety: { title: 'خطة الضغط والقلق', steps: ['أجّل أي قرار عشر دقائق.', 'خذ أنفاسًا بطيئة.', 'قلل المنبهات إذا كانت تزيد القلق.', 'اطلب دعمًا إذا أصبح القلق شديدًا أو متكررًا.'], craving_card: 'الرغبة والقلق موجتان وتخفان. سأنتظر وأتنفس قبل أي قرار.' },
    shisha_session: { title: 'خطة جلسات الشيشة', steps: ['ابتعد عن جلسات الشيشة في البداية.', 'اقترح نشاطًا بديلًا.', 'لا تمسك الخرطوم حتى للمزاح.', 'جهّز جملة رفض قصيرة وواضحة.'], craving_card: 'أستطيع الاستمتاع بالجلسة دون شيشة، أو أختار مكانًا آخر.' },
    social: { title: 'خطة الأصدقاء والمجالس', steps: ['أخبر شخصًا واحدًا بقرارك.', 'اجلس بعيدًا عن مصادر الدخان.', 'جهّز جملة رفض قصيرة.', 'غادر مبكرًا إذا أصبحت الرغبة شديدة.'], craving_card: 'أحب صحبتهم، لكنني لا أحتاج أن أستخدم النيكوتين معهم.' },
  },
  en: {
    coffee: { title: 'Coffee without nicotine', steps: ['Change where you have your coffee.', 'Drink water with it.', 'Walk for two minutes afterwards.', 'Avoid pairing coffee with smoking friends in the first few days.'], craving_card: 'This is a learned coffee cue, not a command. I can finish my coffee without nicotine and change the setting.' },
    car: { title: 'Clean-car plan', steps: ['Remove smoking or nicotine items from the car.', 'Keep water or gum within reach.', 'Change your usual driving audio or route when practical.', 'If the urge is strong, stop somewhere safe and take a short break.'], craving_card: 'Traffic does not require nicotine. I can drink water and continue driving safely.' },
    after_meal: { title: 'After-meal plan', steps: ['Stand up straight after the meal.', 'Brush your teeth or rinse your mouth.', 'Walk for five minutes.', 'Move away from your usual use location.'], craving_card: 'The meal is over; nicotine does not need to follow it. I will move for five minutes.' },
    stress: { title: 'Stress without nicotine', steps: ['Make no decision for the first 60 seconds.', 'Change location.', 'Take ten slow breaths.', 'Walk for five minutes or contact your support person.'], craving_card: 'I am stressed; that does not mean I need nicotine. I can get through the next ten minutes.' },
    anxiety: { title: 'Anxiety and pressure plan', steps: ['Delay any decision for ten minutes.', 'Use slow breathing.', 'Reduce stimulants if they worsen anxiety.', 'Seek support if anxiety becomes severe or persistent.'], craving_card: 'Cravings and anxiety rise and fall. I will wait and breathe before deciding.' },
    shisha_session: { title: 'Shisha-session plan', steps: ['Avoid shisha sessions at the beginning.', 'Suggest a different activity.', 'Do not hold the hose even as a joke.', 'Prepare a short, clear refusal sentence.'], craving_card: 'I can enjoy company without shisha, or choose a different setting.' },
    social: { title: 'Friends and social plan', steps: ['Tell one person about your plan.', 'Sit away from smoke or nicotine use.', 'Prepare a short refusal sentence.', 'Leave early if the craving becomes strong.'], craving_card: 'I can enjoy their company without using nicotine with them.' },
  },
}

const vapePlan: Record<Lang, PlanSection> = {
  ar: { title: 'خطة ضبط الفيب', steps: ['سجّل أوقات الاستخدام بدل تركه تلقائيًا طوال اليوم.', 'امنع الاستخدام في السرير والسيارة والحمام.', 'استخدم فترات خالية من الفيب تتسع تدريجيًا.', 'إذا كنت تحتاج علاجًا أو دعمًا دوائيًا ناقش ذلك مع مختص.'], craving_card: 'السحبة ليست حلًا للمحفز. سأؤجل عشر دقائق وأغيّر النشاط.' },
  en: { title: 'Vape-control plan', steps: ['Track use times instead of letting use become automatic all day.', 'Keep vaping out of the bed, car and bathroom.', 'Build progressively longer vape-free periods.', 'If you need medication or treatment support, discuss it with a qualified clinician or pharmacist.'], craving_card: 'A puff does not solve the trigger. I will delay ten minutes and change activity.' },
}

function buildTriggerPlans(a: EngineAnswers, lang: Lang): PlanSection[] {
  const out: PlanSection[] = []
  const seen = new Set<string>()
  for (const trigger of a.triggers) {
    const template = triggerPlans[lang][trigger]
    if (template && !seen.has(template.title)) {
      out.push(template)
      seen.add(template.title)
    }
    if (out.length >= 3) break
  }
  if (a.product_types.includes('vape') && !seen.has(vapePlan[lang].title)) out.push(vapePlan[lang])
  return out.slice(0, 4)
}

function basePlan(a: EngineAnswers, dependence: string, readiness: string, lang: Lang): PlanSection {
  if (dependence === 'high' || dependence === 'complex_mixed') {
    return lang === 'ar'
      ? { title: 'خطة دعم أقوى', steps: ['رتّب المنتجات حسب الأكثر استخدامًا.', 'اختر المنتج أو الموقف الأول الذي ستغيّره.', 'جهّز خطة للرغبة قبل يوم الإقلاع.', 'اختر شخص دعم واحدًا.', 'ناقش خيارات العلاج مع طبيب أو صيدلي إذا رغبت أو إذا كانت المحاولات صعبة.'] }
      : { title: 'Higher-support plan', steps: ['Rank products by how much you use them.', 'Choose the first product or situation to change.', 'Prepare a craving plan before quit day.', 'Choose one support person.', 'Discuss treatment options with a clinician or pharmacist if you want them or if previous attempts have been difficult.'] }
  }

  if (readiness === 'ready_now' || readiness === 'wants_but_low_confidence') {
    return lang === 'ar'
      ? { title: 'خطة البداية', steps: ['اختر تاريخًا خلال 7–14 يومًا إذا كان الإقلاع الكامل هدفك.', 'سجّل استخدامك قبل التاريخ.', 'نظّف البيت والسيارة من الأدوات المرتبطة بالاستخدام.', 'أخبر شخص دعم واحدًا.', 'جهّز بدائل للرغبة قبل البداية.'] }
      : { title: 'Getting-started plan', steps: ['Choose a date within 7–14 days if full quitting is your goal.', 'Track your use before that date.', 'Remove use-related items from the home and car.', 'Tell one support person.', 'Prepare craving alternatives before you begin.'] }
  }

  return lang === 'ar'
    ? { title: 'خطة الاقتراب من القرار', steps: ['سجّل استخدامك لمدة 7 أيام.', 'اختر محفزًا واحدًا فقط لتغييره.', 'جرّب تأخير أول استخدام.', 'راجع أسبابك الشخصية يوميًا.', 'عد للتقييم عندما يتغير استعدادك.'] }
    : { title: 'Moving closer to change', steps: ['Track your use for 7 days.', 'Choose only one trigger to change first.', 'Experiment with delaying your first use.', 'Review your personal reasons daily.', 'Repeat the assessment when your readiness changes.'] }
}

function firstStep(a: EngineAnswers, lang: Lang): string {
  const ar = lang === 'ar'
  if (a.triggers.includes('coffee')) return ar ? 'غدًا صباحًا: اشرب قهوتك في مكان جديد بلا نيكوتين، ثم امشِ دقيقتين.' : 'Tomorrow morning: have your coffee in a different place without nicotine, then walk for two minutes.'
  if (a.triggers.includes('car')) return ar ? 'اليوم: أخرج أدوات النيكوتين من السيارة وضع ماء أو علكة مكانها.' : 'Today: remove nicotine-related items from the car and replace them with water or gum.'
  if (a.triggers.includes('after_meal')) return ar ? 'بعد أول وجبة اليوم: قم مباشرة وامشِ خمس دقائق بدل طقس النيكوتين المعتاد.' : 'After your next meal today: stand up immediately and walk for five minutes instead of following your usual nicotine routine.'
  if (a.triggers.includes('stress') || a.triggers.includes('anxiety')) return ar ? 'عند أول لحظة ضغط اليوم: أجّل القرار عشر دقائق، غيّر المكان وخذ أنفاسًا بطيئة.' : 'At the first stressful moment today: delay the decision for ten minutes, change location and use slow breathing.'
  if (a.triggers.includes('social') || a.triggers.includes('shisha_session')) return ar ? 'خلال 24 ساعة: أخبر شخصًا واحدًا أنك بدأت خطة جديدة وحدد كيف ستتعامل مع أول جلسة محفزة.' : 'Within 24 hours: tell one person you have started a new plan and decide how you will handle your next high-risk social situation.'
  return ar ? 'اليوم: اكتب أهم ثلاثة أسباب تجعلك تريد تغيير علاقتك بالنيكوتين وضعها في مكان تراه.' : 'Today: write the three strongest reasons you want to change your relationship with nicotine and keep them somewhere visible.'
}

export function buildPlan(a: EngineAnswers, lang: Lang = 'ar'): EngineResult {
  const intensity = computeAqlaSupportIntensity(a)
  const hsi = computeHSI(a)
  const dependence = classifyDependence(a, intensity)
  const readiness = classifyReadiness(a)
  const patterns = topTriggerPatterns(a, lang)
  const referral = requiresReferral(a) || dependence === 'high' || dependence === 'complex_mixed'
  const suicidal = hasSuicidalIdeation(a)
  const ar = lang === 'ar'
  const plans = buildTriggerPlans(a, lang)

  const result: EngineResult = {
    result_title: ar ? 'هذه خريطتك، وليست حكمًا عليك' : 'This is your map, not a judgement',
    human_explanation: dependenceText[lang][dependence],
    pattern_labels: patterns.slice(0, 3),
    primary_trigger_pattern: patterns[0] ?? (ar ? 'لم تُحدد محفزات واضحة بعد' : 'No clear trigger identified yet'),
    secondary_trigger_pattern: patterns[1],
    dependence_category: dependence,
    dependence_text: dependenceText[lang][dependence],
    hsi_score: hsi,
    aqla_support_intensity: intensity,
    aqla_support_intensity_label: ar ? 'مؤشر أقلع لدعم الخطة — أداة داخلية غير تشخيصية وغير معتمدة كمقياس سريري' : 'AQla plan-support indicator — an internal non-diagnostic heuristic, not a validated clinical scale',
    readiness_category: readiness,
    readiness_text: readinessText[lang][readiness],
    first_24h_step: firstStep(a, lang),
    seven_day_plan: ar
      ? [
          { day: 1, task: 'سجّل كل استخدام للنيكوتين خلال اليوم.' },
          { day: 2, task: 'راجع أسبابك الشخصية واختر السبب الأقوى.' },
          { day: 3, task: 'غيّر أقوى محفز لديك.' },
          { day: 4, task: 'اختر شخص دعم واحدًا وأخبره.' },
          { day: 5, task: 'جهّز بدائل للرغبة مثل الماء أو العلكة أو المشي.' },
          { day: 6, task: 'إذا احتجت علاجًا أو دعمًا دوائيًا ناقش الخيارات مع مختص.' },
          { day: 7, task: 'راجع ما نجح وحدد خطوتك التالية.' },
        ]
      : [
          { day: 1, task: 'Track every nicotine use today.' },
          { day: 2, task: 'Review your personal reasons and choose the strongest one.' },
          { day: 3, task: 'Change your strongest trigger.' },
          { day: 4, task: 'Choose one support person and tell them.' },
          { day: 5, task: 'Prepare craving alternatives such as water, gum or a short walk.' },
          { day: 6, task: 'If you want treatment or medication support, discuss options with a qualified professional.' },
          { day: 7, task: 'Review what worked and choose your next step.' },
        ],
    seventy_two_hour_plan: ar
      ? ['ابتعد عن أعلى المواقف خطورة.', 'أزل أدوات الاستخدام من الأماكن القريبة.', 'غيّر روتين القهوة أو القيادة إذا كان محفزًا.', 'بعد الأكل تحرك ونظف فمك.', 'عند الرغبة استخدم بطاقة الرغبة وانتظر عشر دقائق.', 'تواصل مع شخص الدعم مرة يوميًا.']
      : ['Avoid your highest-risk situations.', 'Remove use-related items from nearby places.', 'Change coffee or driving routines if they are triggers.', 'Move and clean your mouth after meals.', 'Use your craving card and wait ten minutes when an urge arrives.', 'Check in with your support person once a day.'],
    trigger_plans: plans,
    base_plan: basePlan(a, dependence, readiness, lang),
    craving_card: plans[0]?.craving_card ?? (ar ? 'الرغبة موجة وليست أمرًا. سأشرب ماء، أغيّر المكان، وأنتظر عشر دقائق.' : 'A craving is a wave, not a command. I will drink water, change location and wait ten minutes.'),
    referral_needed: referral,
    referral_message: referral
      ? (ar ? 'بناءً على إجاباتك، من الأفضل مناقشة خطة الإقلاع وخيارات العلاج مع طبيب أو صيدلي أو عيادة إقلاع، خصوصًا قبل اختيار أي دواء أو جرعة.' : 'Based on your answers, it would be sensible to discuss your quit plan and treatment options with a clinician, pharmacist or cessation service, especially before choosing any medicine or dose.')
      : (ar ? 'لا تظهر من إجاباتك حاجة واضحة لإحالة عاجلة، ويمكنك دائمًا طلب دعم مهني إذا رغبت.' : 'Your answers do not show an obvious need for urgent referral, and you can still seek professional support whenever you want it.'),
    safety_immediate: suicidal
      ? (ar ? 'سلامتك أهم من خطة الإقلاع الآن. إذا كنت تشعر أنك قد تؤذي نفسك أو أنك في خطر، اطلب مساعدة طبية عاجلة الآن أو تواصل فورًا مع شخص موثوق قريب منك. يمكن العودة لخطة الإقلاع بعد تأمين سلامتك.' : 'Your immediate safety is more important than the quit plan. If you feel you may harm yourself or are in danger, seek urgent medical help now or contact a trusted person near you immediately. The quit plan can wait until you are safe.')
      : undefined,
    personal_reasons: a.personal_reasons,
    support_message_template: a.support_person_name
      ? (ar ? 'عندي رغبة الآن. أحتاجك تذكرني بسبب قراري وتساعدني أتجاوز عشر دقائق.' : 'I have a craving right now. Please remind me why I made this decision and help me get through the next ten minutes.')
      : undefined,
    follow_up_schedule: [
      { type: 'day_3', offset_days: 3, label_ar: 'متابعة بعد 3 أيام', label_en: 'Follow-up after 3 days' },
      { type: 'day_7', offset_days: 7, label_ar: 'متابعة بعد 7 أيام', label_en: 'Follow-up after 7 days' },
      { type: 'day_30', offset_days: 30, label_ar: 'متابعة بعد 30 يومًا', label_en: 'Follow-up after 30 days' },
    ],
    share_text: ar
      ? 'بدأت أفهم علاقتي بالنيكوتين بشكل أوضح مع أقلع. النتيجة ليست حكمًا، لكنها خريطة تساعدني على خطوة عملية.'
      : 'I have started understanding my nicotine pattern more clearly with AQla. The result is not a judgement; it is a map for one practical next step.',
  }

  return result
}
