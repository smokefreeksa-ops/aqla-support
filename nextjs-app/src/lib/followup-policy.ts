export const FOLLOWUP_POLICY_VERSION = 2

export const FOLLOWUP_DEFINITIONS = [
  { type: 'day_1', offset_days: 1, kind: 'support', label_ar: 'متابعة اليوم الأول', label_en: 'Day 1 check-in' },
  { type: 'day_3', offset_days: 3, kind: 'support', label_ar: 'متابعة اليوم الثالث', label_en: 'Day 3 check-in' },
  { type: 'day_7', offset_days: 7, kind: 'support', label_ar: 'متابعة الأسبوع الأول', label_en: 'Week 1 check-in' },
  { type: 'day_14', offset_days: 14, kind: 'support', label_ar: 'متابعة الأسبوع الثاني', label_en: 'Week 2 check-in' },
  { type: 'day_21', offset_days: 21, kind: 'support', label_ar: 'متابعة الأسبوع الثالث', label_en: 'Week 3 check-in' },
  { type: 'day_30', offset_days: 30, kind: 'outcome', label_ar: 'متابعة الشهر الأول', label_en: 'Month 1 check-in' },
  { type: 'day_60', offset_days: 60, kind: 'support', label_ar: 'متابعة الشهر الثاني', label_en: 'Month 2 check-in' },
  { type: 'day_90', offset_days: 90, kind: 'outcome', label_ar: 'متابعة 3 أشهر', label_en: '3-month check-in' },
  { type: 'month_6', offset_days: 180, kind: 'outcome', label_ar: 'متابعة 6 أشهر', label_en: '6-month check-in' },
  { type: 'month_12', offset_days: 365, kind: 'outcome', label_ar: 'متابعة 12 شهرًا', label_en: '12-month check-in' },
] as const

export type FollowupType = typeof FOLLOWUP_DEFINITIONS[number]['type']
export type FollowupKind = typeof FOLLOWUP_DEFINITIONS[number]['kind']

export const FOLLOWUP_TYPES = FOLLOWUP_DEFINITIONS.map((item) => item.type) as FollowupType[]

export function isFollowupType(value: string): value is FollowupType {
  return FOLLOWUP_TYPES.includes(value as FollowupType)
}

export function followupDefinition(type: FollowupType) {
  return FOLLOWUP_DEFINITIONS.find((item) => item.type === type)!
}

export function previousFollowupTypes(type: FollowupType): FollowupType[] {
  const index = FOLLOWUP_TYPES.indexOf(type)
  if (index <= 0) return []
  return FOLLOWUP_TYPES.slice(0, index).reverse()
}
