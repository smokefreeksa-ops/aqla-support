export type PersonalPlanV2DataClass = 'clinical' | 'behavioural' | 'operational' | 'derived'

export interface PersonalPlanV2DictionaryEntry {
  variable: string
  labelAr: string
  labelEn: string
  type: 'string' | 'number' | 'boolean' | 'enum' | 'string[]' | 'date'
  dataClass: PersonalPlanV2DataClass
  required: boolean
  researchEligible: boolean
  identifiableOrSensitive: boolean
  purpose: string
  notes?: string
}

export const PERSONAL_PLAN_V2_DATA_DICTIONARY_VERSION = 1

export const PERSONAL_PLAN_V2_DATA_DICTIONARY: PersonalPlanV2DictionaryEntry[] = [
  { variable: 'personal_plan_v2.cigarette_form', labelAr: 'شكل السجائر', labelEn: 'Cigarette form', type: 'enum', dataClass: 'behavioural', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Product-use context and cost interpretation' },
  { variable: 'personal_plan_v2.cigarette_quantity', labelAr: 'عدد السجائر المبلغ عنه', labelEn: 'Self-reported cigarette quantity', type: 'number', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Exact consumption, reduction planning and HSI-category derivation' },
  { variable: 'personal_plan_v2.cigarette_quantity_period', labelAr: 'فترة عدد السجائر', labelEn: 'Cigarette quantity period', type: 'enum', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Normalise daily/weekly cigarette quantity' },
  { variable: 'personal_plan_v2.estimated_cigarettes_per_day', labelAr: 'السجائر اليومية المقدرة', labelEn: 'Estimated cigarettes per day', type: 'number', dataClass: 'derived', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Derived consumption metric; participant is not asked a duplicate categorical quantity question' },
  { variable: 'personal_plan_v2.nicotine_spend_amount', labelAr: 'إنفاق النيكوتين المبلغ عنه', labelEn: 'Self-reported nicotine spending', type: 'number', dataClass: 'behavioural', required: false, researchEligible: false, identifiableOrSensitive: true, purpose: 'Participant-facing savings estimate only', notes: 'Financial data is excluded from default research export and is not sent to the AI personalisation service.' },
  { variable: 'personal_plan_v2.nicotine_spend_period', labelAr: 'فترة الإنفاق', labelEn: 'Spending period', type: 'enum', dataClass: 'behavioural', required: false, researchEligible: false, identifiableOrSensitive: true, purpose: 'Normalise self-reported spending for savings estimates' },
  { variable: 'personal_plan_v2.previous_quit_support_methods', labelAr: 'وسائل الدعم في المحاولات السابقة', labelEn: 'Support methods used in previous attempts', type: 'string[]', dataClass: 'behavioural', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Avoid blindly repeating previous strategies and support relapse-prevention tailoring' },
  { variable: 'personal_plan_v2.cessation_support_knowledge', labelAr: 'المعرفة بخيارات الإقلاع', labelEn: 'Knowledge of cessation support options', type: 'enum', dataClass: 'behavioural', required: true, researchEligible: true, identifiableOrSensitive: false, purpose: 'Adjust educational depth without duplicating confidence/readiness' },
  { variable: 'personal_plan_v2.treatment_info_interests', labelAr: 'اهتمامات معلومات العلاج والدعم', labelEn: 'Treatment/support information interests', type: 'string[]', dataClass: 'behavioural', required: true, researchEligible: true, identifiableOrSensitive: true, purpose: 'Tailor educational content; never used by itself to prescribe treatment or dose' },
  { variable: 'personal_plan_v2.preferred_support_channels', labelAr: 'قنوات الدعم المفضلة', labelEn: 'Preferred support channels', type: 'string[]', dataClass: 'behavioural', required: true, researchEligible: true, identifiableOrSensitive: false, purpose: 'Tailor support-network section and future service routing' },
  { variable: 'personal_plan_v2.additional_triggers', labelAr: 'محفزات إضافية', labelEn: 'Additional triggers', type: 'string[]', dataClass: 'behavioural', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Capture useful triggers not represented in the original Saudi-specific trigger list' },
  { variable: 'personal_plan_v2.other_trigger_text', labelAr: 'محفز آخر بنص حر', labelEn: 'Other trigger free text', type: 'string', dataClass: 'behavioural', required: false, researchEligible: false, identifiableOrSensitive: true, purpose: 'Participant personalisation only', notes: 'Free text is excluded from default research export because it may contain identifiers or sensitive context.' },
  { variable: 'personal_plan_v2.additional_motivations', labelAr: 'دوافع إضافية', labelEn: 'Additional motivations', type: 'string[]', dataClass: 'behavioural', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Broaden motivation coverage while retaining Aqla-specific reasons' },
  { variable: 'personal_plan_v2.other_motivation_text', labelAr: 'سبب آخر بنص حر', labelEn: 'Other motivation free text', type: 'string', dataClass: 'behavioural', required: false, researchEligible: false, identifiableOrSensitive: true, purpose: 'Participant personalisation only', notes: 'Free text is excluded from default research export.' },
  { variable: 'personal_plan_v2.change_goal_type', labelAr: 'نوع هدف التغيير', labelEn: 'Change goal type', type: 'enum', dataClass: 'clinical', required: true, researchEligible: true, identifiableOrSensitive: true, purpose: 'Distinguish quitting, reduction, relapse prevention and exploratory pathways' },
  { variable: 'personal_plan_v2.quit_date_choice', labelAr: 'اختيار توقيت الإقلاع/التغيير', labelEn: 'Quit/change date choice', type: 'enum', dataClass: 'behavioural', required: true, researchEligible: true, identifiableOrSensitive: true, purpose: 'Personalise preparation without pressuring participants who are not ready' },
  { variable: 'personal_plan_v2.target_quit_date', labelAr: 'تاريخ الإقلاع/التغيير المستهدف', labelEn: 'Target quit/change date', type: 'date', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Plan preparation and milestone language', notes: 'Operational follow-up cadence remains anchored to the established Aqla policy until a separate governance decision changes it.' },
  { variable: 'personal_plan_v2.reduction_target_percent', labelAr: 'هدف التقليل', labelEn: 'Reduction target percent', type: 'number', dataClass: 'clinical', required: false, researchEligible: true, identifiableOrSensitive: true, purpose: 'Prevent full-quit savings claims when the participant selected a reduction pathway' },
  { variable: 'personal_plan_v2.support_person_relationship', labelAr: 'علاقة شخص الدعم', labelEn: 'Support-person relationship', type: 'string', dataClass: 'operational', required: false, researchEligible: false, identifiableOrSensitive: true, purpose: 'Personalise support messaging without requiring third-party contact details' },
  { variable: 'personal_plan_v2.plan_email_opt_in', labelAr: 'موافقة إرسال رابط الخطة بالبريد', labelEn: 'Plan-link email opt-in', type: 'boolean', dataClass: 'operational', required: true, researchEligible: false, identifiableOrSensitive: true, purpose: 'Granular consent for requested plan notification' },
  { variable: 'personal_plan_v2.followup_email_opt_in', labelAr: 'موافقة رسائل المتابعة', labelEn: 'Follow-up email opt-in', type: 'boolean', dataClass: 'operational', required: true, researchEligible: false, identifiableOrSensitive: true, purpose: 'Separate consent for ongoing supportive follow-up email' },
  { variable: 'result.personal_plan_v2.savings', labelAr: 'التوفير المتوقع', labelEn: 'Estimated savings', type: 'number', dataClass: 'derived', required: false, researchEligible: false, identifiableOrSensitive: true, purpose: 'Participant-facing estimate based only on self-reported spending and selected change target' },
]
