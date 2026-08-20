import type { EngineAnswers } from '@/lib/quit-engine/types'

export type SupportKnowledge = 'none' | 'little' | 'fair' | 'strong'
export type PreviousQuitSupportMethod =
  | 'willpower_only'
  | 'clinician'
  | 'cessation_clinic'
  | 'pharmacist'
  | 'nrt'
  | 'prescribed_medicine'
  | 'vaping_as_quit_aid'
  | 'digital_support'
  | 'family_friend'
  | 'behavioural_support'
  | 'other'
  | 'dont_remember'

export type TreatmentInterest =
  | 'nrt'
  | 'prescribed_medicine'
  | 'behavioural_support'
  | 'clinician_pharmacist'
  | 'digital_support'
  | 'product_specific'
  | 'not_sure'
  | 'none_now'

export type SupportChannel =
  | 'aqla_digital'
  | 'doctor_clinic'
  | 'pharmacist'
  | 'phone_video'
  | 'family_friend'
  | 'community_peer'
  | 'self_guided'
  | 'not_sure'
  | 'none_now'

export type ChangeGoalType = 'quit' | 'reduce' | 'maintain_abstinence' | 'explore'
export type QuitDateChoice = 'today' | 'within_7' | 'specific' | 'not_ready'
export type SpendPeriod = 'day' | 'week' | 'month'
export type CigaretteQuantityPeriod = 'day' | 'week'
export type CigaretteForm = 'manufactured' | 'roll_your_own' | 'both' | 'other'
export type AdditionalTrigger =
  | 'alcohol'
  | 'hunger'
  | 'seeing_nicotine'
  | 'being_offered'
  | 'morning_waking'
  | 'living_with_user'
  | 'work_break'
  | 'other'
  | 'not_sure'

export type AdditionalMotivation =
  | 'breathe_easier'
  | 'role_model_children'
  | 'appearance_teeth_skin'
  | 'healthcare_advice'
  | 'reduce_serious_illness_risk'
  | 'feel_in_control'
  | 'no_longer_enjoy'
  | 'other'
  | 'not_sure'

export interface PersonalPlanV2Answers {
  cigarette_form?: CigaretteForm
  cigarette_quantity?: number
  cigarette_quantity_period?: CigaretteQuantityPeriod
  estimated_cigarettes_per_day?: number
  nicotine_spend_amount?: number
  nicotine_spend_period?: SpendPeriod
  previous_quit_support_methods: PreviousQuitSupportMethod[]
  cessation_support_knowledge: SupportKnowledge
  treatment_info_interests: TreatmentInterest[]
  preferred_support_channels: SupportChannel[]
  additional_triggers: AdditionalTrigger[]
  other_trigger_text?: string
  additional_motivations: AdditionalMotivation[]
  other_motivation_text?: string
  change_goal_type: ChangeGoalType
  quit_date_choice: QuitDateChoice
  target_quit_date?: string
  reduction_target_percent?: 25 | 50 | 75
  support_person_relationship?: string
  plan_email_opt_in: boolean
  followup_email_opt_in: boolean
}

export interface SavingsProjection {
  currency: 'SAR'
  basis: string
  reduction_factor: number
  weekly: number
  monthly: number
  three_months: number
  six_months: number
  yearly: number
}

export interface PersonalPlanV2Enrichment {
  schema_version: 1
  goal_label: string
  quit_date_label?: string
  savings?: SavingsProjection
  previous_attempt_learning: string[]
  treatment_learning: string[]
  support_network: string[]
  trigger_coaching: string[]
  motivation_labels: string[]
  communication: {
    plan_email_opt_in: boolean
    followup_email_opt_in: boolean
  }
}

export type PersonalPlanV2StoredPlan = {
  answers: EngineAnswers & { personal_plan_v2?: PersonalPlanV2Answers }
  result: { personal_plan_v2?: PersonalPlanV2Enrichment }
}

export const SUPPORT_KNOWLEDGE_OPTIONS = [
  { value: 'none', ar: 'لا أعرف عنها تقريبًا', en: 'I know almost nothing about them' },
  { value: 'little', ar: 'أعرف القليل', en: 'I know a little' },
  { value: 'fair', ar: 'لدي معرفة معقولة', en: 'I know a fair amount' },
  { value: 'strong', ar: 'لدي معرفة جيدة', en: 'I know quite a lot' },
] as const

export const PREVIOUS_SUPPORT_OPTIONS = [
  { value: 'willpower_only', ar: 'اعتمدت على نفسي فقط', en: 'I relied on willpower alone' },
  { value: 'clinician', ar: 'طبيب أو مختص صحي', en: 'Doctor or healthcare professional' },
  { value: 'cessation_clinic', ar: 'عيادة إقلاع عن التدخين', en: 'Smoking-cessation clinic' },
  { value: 'pharmacist', ar: 'صيدلي', en: 'Pharmacist' },
  { value: 'nrt', ar: 'بدائل النيكوتين مثل اللصقات أو العلكة', en: 'Nicotine replacement such as patches or gum' },
  { value: 'prescribed_medicine', ar: 'دواء موصوف للإقلاع', en: 'Prescribed cessation medicine' },
  { value: 'vaping_as_quit_aid', ar: 'استخدمت الفيب لمحاولة ترك السجائر', en: 'Used vaping as a way to stop smoking' },
  { value: 'digital_support', ar: 'تطبيق أو دعم رقمي', en: 'App or digital support' },
  { value: 'family_friend', ar: 'دعم من الأسرة أو صديق', en: 'Family or friend support' },
  { value: 'behavioural_support', ar: 'جلسات أو دعم سلوكي', en: 'Counselling or behavioural support' },
  { value: 'other', ar: 'شيء آخر', en: 'Something else' },
  { value: 'dont_remember', ar: 'لا أتذكر', en: 'I do not remember' },
] as const

export const TREATMENT_INTEREST_OPTIONS = [
  { value: 'nrt', ar: 'بدائل النيكوتين', en: 'Nicotine replacement therapy' },
  { value: 'prescribed_medicine', ar: 'الأدوية الموصوفة للإقلاع', en: 'Prescribed cessation medicines' },
  { value: 'behavioural_support', ar: 'الدعم السلوكي', en: 'Behavioural support' },
  { value: 'clinician_pharmacist', ar: 'مناقشة الخيارات مع طبيب أو صيدلي', en: 'Discussing options with a clinician or pharmacist' },
  { value: 'digital_support', ar: 'الدعم الرقمي', en: 'Digital support' },
  { value: 'product_specific', ar: 'ما يناسب نوع النيكوتين الذي أستخدمه', en: 'Options relevant to the nicotine product I use' },
  { value: 'not_sure', ar: 'لست متأكدًا بعد', en: 'I am not sure yet' },
  { value: 'none_now', ar: 'لا أريد معلومات علاجية الآن', en: 'I do not want treatment information right now' },
] as const

export const SUPPORT_CHANNEL_OPTIONS = [
  { value: 'aqla_digital', ar: 'دعم أقلع الرقمي', en: 'Aqla digital support' },
  { value: 'doctor_clinic', ar: 'طبيب أو عيادة إقلاع', en: 'Doctor or cessation clinic' },
  { value: 'pharmacist', ar: 'صيدلي', en: 'Pharmacist' },
  { value: 'phone_video', ar: 'اتصال أو فيديو', en: 'Telephone or video support' },
  { value: 'family_friend', ar: 'أسرة أو صديق', en: 'Family or friend' },
  { value: 'community_peer', ar: 'مجتمع أو دعم من أشخاص يمرون بتجربة مشابهة', en: 'Community or peer support' },
  { value: 'self_guided', ar: 'مواد أستخدمها بنفسي', en: 'Self-guided resources' },
  { value: 'not_sure', ar: 'لست متأكدًا بعد', en: 'I am not sure yet' },
  { value: 'none_now', ar: 'لا أريد دعمًا إضافيًا الآن', en: 'I do not want extra support right now' },
] as const

export const ADDITIONAL_TRIGGER_OPTIONS = [
  { value: 'alcohol', ar: 'عند شرب الكحول', en: 'When drinking alcohol' },
  { value: 'hunger', ar: 'عند الجوع', en: 'When hungry' },
  { value: 'seeing_nicotine', ar: 'عندما أرى التدخين أو منتج النيكوتين', en: 'When I see smoking or a nicotine product' },
  { value: 'being_offered', ar: 'عندما يعرض عليّ شخص منتج نيكوتين', en: 'When someone offers me nicotine' },
  { value: 'morning_waking', ar: 'مباشرة بعد الاستيقاظ', en: 'Soon after waking' },
  { value: 'living_with_user', ar: 'العيش مع شخص يستخدم التبغ أو النيكوتين', en: 'Living with someone who uses tobacco or nicotine' },
  { value: 'work_break', ar: 'وقت الاستراحة في العمل أو الدراسة', en: 'During a work or study break' },
  { value: 'other', ar: 'محفز آخر', en: 'Another trigger' },
  { value: 'not_sure', ar: 'لست متأكدًا', en: 'I am not sure' },
] as const

export const ADDITIONAL_MOTIVATION_OPTIONS = [
  { value: 'breathe_easier', ar: 'أتنفس بسهولة أكبر', en: 'To breathe more easily' },
  { value: 'role_model_children', ar: 'أكون قدوة جيدة لأطفالي', en: 'To set a good example for my children' },
  { value: 'appearance_teeth_skin', ar: 'تحسين الأسنان والبشرة والمظهر', en: 'To improve my teeth, skin or appearance' },
  { value: 'healthcare_advice', ar: 'نصحني مختص صحي بالتوقف', en: 'A healthcare professional advised me to stop' },
  { value: 'reduce_serious_illness_risk', ar: 'تقليل خطر الأمراض الخطيرة', en: 'To reduce my risk of serious illness' },
  { value: 'feel_in_control', ar: 'أشعر أنني مسيطر على قراري', en: 'To feel more in control' },
  { value: 'no_longer_enjoy', ar: 'لم أعد أستمتع باستخدامه', en: 'I no longer enjoy using it' },
  { value: 'other', ar: 'سبب آخر', en: 'Another reason' },
  { value: 'not_sure', ar: 'لست متأكدًا', en: 'I am not sure' },
] as const

const previousSupportValues = new Set(PREVIOUS_SUPPORT_OPTIONS.map((item) => item.value))
const treatmentValues = new Set(TREATMENT_INTEREST_OPTIONS.map((item) => item.value))
const channelValues = new Set(SUPPORT_CHANNEL_OPTIONS.map((item) => item.value))
const triggerValues = new Set(ADDITIONAL_TRIGGER_OPTIONS.map((item) => item.value))
const motivationValues = new Set(ADDITIONAL_MOTIVATION_OPTIONS.map((item) => item.value))
const knowledgeValues = new Set(SUPPORT_KNOWLEDGE_OPTIONS.map((item) => item.value))
const goalValues = new Set<ChangeGoalType>(['quit', 'reduce', 'maintain_abstinence', 'explore'])
const dateChoiceValues = new Set<QuitDateChoice>(['today', 'within_7', 'specific', 'not_ready'])
const spendPeriods = new Set<SpendPeriod>(['day', 'week', 'month'])
const quantityPeriods = new Set<CigaretteQuantityPeriod>(['day', 'week'])
const cigaretteForms = new Set<CigaretteForm>(['manufactured', 'roll_your_own', 'both', 'other'])

function clippedText(value: unknown, max = 160): string | undefined {
  if (typeof value !== 'string') return undefined
  const text = value.trim().slice(0, max)
  return text || undefined
}

function list<T extends string>(value: unknown, allowed: Set<T>, max: number): T[] {
  if (!Array.isArray(value)) return []
  return Array.from(new Set(value.filter((item): item is T => typeof item === 'string' && allowed.has(item as T)))).slice(0, max)
}

function numeric(value: unknown, min: number, max: number): number | undefined {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN
  if (!Number.isFinite(n) || n < min || n > max) return undefined
  return Math.round(n * 100) / 100
}

export function deriveCigaretteBand(quantity?: number, period?: CigaretteQuantityPeriod): EngineAnswers['cigarettes_per_day'] {
  if (quantity === undefined || !period) return undefined
  const daily = period === 'day' ? quantity : quantity / 7
  if (daily <= 0) return 'not_daily'
  if (daily <= 10) return '1_10'
  if (daily <= 20) return '11_20'
  if (daily <= 30) return '21_30'
  return 'gt_30'
}

function validDate(value: unknown): string | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const timestamp = Date.parse(`${value}T12:00:00Z`)
  if (!Number.isFinite(timestamp)) return undefined
  const today = new Date()
  const min = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 1)).getTime()
  const max = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 90)).getTime()
  return timestamp >= min && timestamp <= max ? value : undefined
}

export function validatePersonalPlanV2Answers(input: unknown, base: EngineAnswers): PersonalPlanV2Answers {
  if (!input || typeof input !== 'object') throw new Error('invalid_personal_plan_v2')
  const raw = input as Record<string, unknown>
  const cigaretteQuantity = numeric(raw.cigarette_quantity, 0.1, 500)
  const cigaretteQuantityPeriod = typeof raw.cigarette_quantity_period === 'string' && quantityPeriods.has(raw.cigarette_quantity_period as CigaretteQuantityPeriod)
    ? raw.cigarette_quantity_period as CigaretteQuantityPeriod
    : undefined
  const cigaretteForm = typeof raw.cigarette_form === 'string' && cigaretteForms.has(raw.cigarette_form as CigaretteForm)
    ? raw.cigarette_form as CigaretteForm
    : undefined
  const knowledge = typeof raw.cessation_support_knowledge === 'string' && knowledgeValues.has(raw.cessation_support_knowledge as SupportKnowledge)
    ? raw.cessation_support_knowledge as SupportKnowledge
    : 'little'
  let goal = typeof raw.change_goal_type === 'string' && goalValues.has(raw.change_goal_type as ChangeGoalType)
    ? raw.change_goal_type as ChangeGoalType
    : 'explore'
  if (base.relapse_prevention_mode) goal = 'maintain_abstinence'
  const dateChoice = typeof raw.quit_date_choice === 'string' && dateChoiceValues.has(raw.quit_date_choice as QuitDateChoice)
    ? raw.quit_date_choice as QuitDateChoice
    : 'not_ready'
  const targetDate = validDate(raw.target_quit_date)
  if (dateChoice === 'specific' && !targetDate) throw new Error('target_quit_date_required')
  const reduction = raw.reduction_target_percent === 25 || raw.reduction_target_percent === 50 || raw.reduction_target_percent === 75
    ? raw.reduction_target_percent
    : undefined
  if (goal === 'reduce' && !reduction) throw new Error('reduction_target_required')

  return {
    cigarette_form: base.product_types.includes('cigarettes') ? cigaretteForm : undefined,
    cigarette_quantity: base.product_types.includes('cigarettes') ? cigaretteQuantity : undefined,
    cigarette_quantity_period: base.product_types.includes('cigarettes') ? cigaretteQuantityPeriod : undefined,
    estimated_cigarettes_per_day: base.product_types.includes('cigarettes') && cigaretteQuantity && cigaretteQuantityPeriod
      ? Math.round((cigaretteQuantityPeriod === 'day' ? cigaretteQuantity : cigaretteQuantity / 7) * 100) / 100
      : undefined,
    nicotine_spend_amount: numeric(raw.nicotine_spend_amount, 0, 100000),
    nicotine_spend_period: typeof raw.nicotine_spend_period === 'string' && spendPeriods.has(raw.nicotine_spend_period as SpendPeriod)
      ? raw.nicotine_spend_period as SpendPeriod
      : undefined,
    previous_quit_support_methods: base.previous_quit_attempts === 'none' ? [] : list(raw.previous_quit_support_methods, previousSupportValues, 12),
    cessation_support_knowledge: knowledge,
    treatment_info_interests: list(raw.treatment_info_interests, treatmentValues, 8),
    preferred_support_channels: list(raw.preferred_support_channels, channelValues, 9),
    additional_triggers: list(raw.additional_triggers, triggerValues, 9),
    other_trigger_text: clippedText(raw.other_trigger_text),
    additional_motivations: list(raw.additional_motivations, motivationValues, 9),
    other_motivation_text: clippedText(raw.other_motivation_text),
    change_goal_type: goal,
    quit_date_choice: goal === 'maintain_abstinence' ? 'not_ready' : dateChoice,
    target_quit_date: goal === 'maintain_abstinence' ? undefined : targetDate,
    reduction_target_percent: goal === 'reduce' ? reduction : undefined,
    support_person_relationship: clippedText(raw.support_person_relationship, 80),
    plan_email_opt_in: raw.plan_email_opt_in === true,
    followup_email_opt_in: raw.followup_email_opt_in === true,
  }
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

export function calculateSavings(input: PersonalPlanV2Answers): SavingsProjection | undefined {
  if (input.nicotine_spend_amount === undefined || !input.nicotine_spend_period || input.nicotine_spend_amount <= 0) return undefined
  const daily = input.nicotine_spend_period === 'day'
    ? input.nicotine_spend_amount
    : input.nicotine_spend_period === 'week'
      ? input.nicotine_spend_amount / 7
      : input.nicotine_spend_amount / 30.4375
  const factor = input.change_goal_type === 'quit' ? 1 : input.change_goal_type === 'reduce' ? (input.reduction_target_percent ?? 0) / 100 : 0
  if (factor <= 0) return undefined
  return {
    currency: 'SAR',
    basis: 'Based on your self-reported nicotine spending; this is an estimate, not a guaranteed saving.',
    reduction_factor: factor,
    weekly: roundMoney(daily * 7 * factor),
    monthly: roundMoney(daily * 30.4375 * factor),
    three_months: roundMoney(daily * 91.3125 * factor),
    six_months: roundMoney(daily * 182.625 * factor),
    yearly: roundMoney(daily * 365.25 * factor),
  }
}

function optionLabel<T extends string>(options: readonly { value: T; ar: string; en: string }[], value: T, lang: 'ar' | 'en') {
  return options.find((item) => item.value === value)?.[lang] ?? value
}

const triggerCoaching: Record<AdditionalTrigger, { ar: string; en: string }> = {
  alcohol: { ar: 'إذا كان الكحول مرتبطًا بالنيكوتين لديك، تجنب هذا السياق في الأيام الأولى أو ضع خطة خروج واضحة قبل الذهاب.', en: 'If alcohol is strongly linked to nicotine use for you, avoid that setting early on or decide your exit plan before you go.' },
  hunger: { ar: 'لا تترك الجوع يتحول إلى محفز: جهّز وجبة خفيفة أو ماءً وخطط لوقت الأكل.', en: 'Do not let hunger become a nicotine cue: keep water or a simple snack available and plan meal times.' },
  seeing_nicotine: { ar: 'قلل رؤية أدوات أو منتجات النيكوتين في محيطك، وغيّر مكانك عند ظهور هذا المحفز.', en: 'Reduce visible nicotine cues around you and change location when this cue appears.' },
  being_offered: { ar: 'جهّز جملة رفض قصيرة قبل أن يعرض عليك أحد: «لا شكرًا، أنا ملتزم بخطتي الآن».', en: 'Prepare a short refusal before someone offers: “No thanks, I am sticking with my plan today.”' },
  morning_waking: { ar: 'غيّر أول عشر دقائق بعد الاستيقاظ: ماء، حركة، والاستعداد لليوم قبل أي قرار متعلق بالنيكوتين.', en: 'Change the first ten minutes after waking: water, movement and getting ready before any nicotine decision.' },
  living_with_user: { ar: 'اطلب من الشخص الذي يعيش معك ألا يعرض عليك المنتج وألا يترك أدواته في الأماكن المشتركة قدر الإمكان.', en: 'Ask the person you live with not to offer nicotine and, where practical, to keep products out of shared spaces.' },
  work_break: { ar: 'غيّر مكان الاستراحة أو نشاطها مؤقتًا؛ امشِ أو اشرب شيئًا بدل الذهاب تلقائيًا لمكان الاستخدام.', en: 'Temporarily change where or how you take breaks; walk or get a drink instead of automatically going to the usual use area.' },
  other: { ar: 'اكتب المحفز بوضوح وحدد خطوة بديلة واحدة يمكن تنفيذها فور ظهوره.', en: 'Name the trigger clearly and choose one alternative action you can take as soon as it appears.' },
  not_sure: { ar: 'راقب وقت ومكان كل رغبة لمدة يومين لتكتشف المحفزات التي تتكرر.', en: 'Track the time and place of each craving for two days to identify repeating cues.' },
}

export function buildPersonalPlanV2Enrichment(input: PersonalPlanV2Answers, lang: 'ar' | 'en'): PersonalPlanV2Enrichment {
  const ar = lang === 'ar'
  const goalLabel = input.change_goal_type === 'quit'
    ? (ar ? 'الإقلاع الكامل' : 'Quit completely')
    : input.change_goal_type === 'reduce'
      ? (ar ? `تقليل الاستخدام بنسبة ${input.reduction_target_percent ?? 0}%` : `Reduce use by ${input.reduction_target_percent ?? 0}%`)
      : input.change_goal_type === 'maintain_abstinence'
        ? (ar ? 'الحفاظ على الامتناع ومنع الانتكاسة' : 'Maintain abstinence and prevent relapse')
        : (ar ? 'استكشاف الخطوة المناسبة دون ضغط' : 'Explore the right next step without pressure')

  const quitDateLabel = input.change_goal_type === 'maintain_abstinence' || input.change_goal_type === 'explore'
    ? undefined
    : input.quit_date_choice === 'today'
      ? (ar ? 'اليوم' : 'Today')
      : input.quit_date_choice === 'within_7'
        ? (ar ? 'خلال الأيام السبعة القادمة' : 'Within the next 7 days')
        : input.quit_date_choice === 'specific' && input.target_quit_date
          ? input.target_quit_date
          : (ar ? 'لم أحدد تاريخًا بعد' : 'No date chosen yet')

  const previousAttemptLearning = input.previous_quit_support_methods.map((value) => optionLabel(PREVIOUS_SUPPORT_OPTIONS, value, lang))
  const treatmentLearning = input.treatment_info_interests.map((value) => optionLabel(TREATMENT_INTEREST_OPTIONS, value, lang))
  const supportNetwork = input.preferred_support_channels.map((value) => optionLabel(SUPPORT_CHANNEL_OPTIONS, value, lang))
  const motivationLabels = input.additional_motivations.map((value) => optionLabel(ADDITIONAL_MOTIVATION_OPTIONS, value, lang))
  if (input.other_motivation_text) motivationLabels.push(input.other_motivation_text)
  const coaching = input.additional_triggers.map((value) => triggerCoaching[value][lang])
  if (input.other_trigger_text) coaching.push(ar ? `محفزك الإضافي: ${input.other_trigger_text}. اختر له بديلًا واضحًا قبل أن يظهر.` : `Your additional trigger: ${input.other_trigger_text}. Decide one clear alternative before it appears.`)

  return {
    schema_version: 1,
    goal_label: goalLabel,
    quit_date_label: quitDateLabel,
    savings: calculateSavings(input),
    previous_attempt_learning: previousAttemptLearning,
    treatment_learning: treatmentLearning,
    support_network: supportNetwork,
    trigger_coaching: coaching,
    motivation_labels: motivationLabels,
    communication: {
      plan_email_opt_in: input.plan_email_opt_in,
      followup_email_opt_in: input.followup_email_opt_in,
    },
  }
}
