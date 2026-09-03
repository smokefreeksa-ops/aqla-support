'use client'

import type { EngineAnswers, ProductType } from '@/lib/quit-engine/types'
import {
  DOMINANT_PRODUCT_OPTIONS,
  VAPE_DEVICE_OPTIONS,
  VAPE_URGE_OPTIONS,
  type AdaptiveAssessmentAnswers,
  type VapeDeviceType,
  type VapeUrgeStrength,
} from '@/lib/adaptive-assessment'

type Lang = 'ar' | 'en'
type RealProduct = Exclude<ProductType, 'relapse_prevention'>

type Props = {
  lang: Lang
  base: EngineAnswers
  value: AdaptiveAssessmentAnswers
  onChange: (next: AdaptiveAssessmentAnswers) => void
}

const yesNo = {
  ar: [{ value: true, label: 'نعم' }, { value: false, label: 'لا' }],
  en: [{ value: true, label: 'Yes' }, { value: false, label: 'No' }],
}

function RequiredMark() {
  return <span className="qe-required-mark" aria-hidden="true">*</span>
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" className={`qe-chip ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>
}

function BooleanPick({ value, lang, onChange }: { value?: boolean; lang: Lang; onChange: (value: boolean) => void }) {
  return <div className="qe-option-grid">{yesNo[lang].map((option) => <Chip key={String(option.value)} active={value === option.value} onClick={() => onChange(option.value)}>{option.label}</Chip>)}</div>
}

function Question({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return <div className="qe-question-block"><h3>{title} <RequiredMark /></h3>{hint ? <p className="qe-field-hint">{hint}</p> : null}{children}</div>
}

export function adaptiveProductQuestionsComplete(base: EngineAnswers, value: AdaptiveAssessmentAnswers) {
  if (base.mixed_use && !value.dominant_product) return false
  if (base.mixed_use && value.substitutes_between_products === undefined) return false
  if (base.product_types.includes('vape')) {
    const v = value.vape
    if (!v?.device_type || v.times_per_day === undefined || v.minutes_after_waking === undefined || v.awakens_at_night === undefined) return false
    if (v.awakens_at_night && v.nights_per_week === undefined) return false
    if (v.hard_to_quit === undefined || v.strong_cravings === undefined || !v.urge_strength || v.hard_to_refrain_where_not_allowed === undefined || v.irritable_when_unable === undefined || v.nervous_restless_anxious_when_unable === undefined || v.nicotine_strength_mg_ml === undefined) return false
  }
  if (base.product_types.includes('pouches')) {
    const p = value.pouches
    if (p?.pouches_per_day === undefined || !p.brand?.trim() || p.strength_mg_per_pouch === undefined || p.night_use === undefined || p.strong_cravings === undefined || p.hard_to_cut_down === undefined || p.irritable_when_unable === undefined || p.uses_more_than_intended === undefined || p.uses_multiple_at_once === undefined || p.changes_strength === undefined) return false
  }
  return true
}

export default function AdaptiveProductAssessment({ lang, base, value, onChange }: Props) {
  const ar = lang === 'ar'
  const patch = (next: Partial<AdaptiveAssessmentAnswers>) => onChange({ ...value, ...next })
  const patchVape = (next: Partial<NonNullable<AdaptiveAssessmentAnswers['vape']>>) => patch({ vape: { ...(value.vape ?? {}), ...next } })
  const patchPouch = (next: Partial<NonNullable<AdaptiveAssessmentAnswers['pouches']>>) => patch({ pouches: { ...(value.pouches ?? {}), ...next } })
  const realProducts = base.product_types.filter((item): item is RealProduct => item !== 'relapse_prevention')

  return <div className="qe-stack">
    {base.mixed_use ? <>
      <Question title={ar ? 'أي منتج سيكون الأصعب عليك لو لم يكن متاحًا؟' : 'Which product would be hardest to go without?'} hint={ar ? 'هذا لا يعني أنه المنتج الوحيد المهم؛ يساعد أقلع على ترتيب الأولوية.' : 'This does not make the other products unimportant; it helps Aqla prioritise.'}>
        <div className="qe-option-grid">{DOMINANT_PRODUCT_OPTIONS.filter((option) => realProducts.includes(option.value as RealProduct)).map((option) => <Chip key={option.value} active={value.dominant_product === option.value} onClick={() => patch({ dominant_product: option.value as RealProduct })}>{option[lang]}</Chip>)}</div>
      </Question>
      <Question title={ar ? 'إذا لم تستطع استخدام أحد المنتجات، هل تستبدله عادةً بمنتج نيكوتين آخر؟' : 'If you cannot use one product, do you usually substitute another nicotine product?'}>
        <BooleanPick value={value.substitutes_between_products} lang={lang} onChange={(next) => patch({ substitutes_between_products: next })} />
      </Question>
    </> : null}

    {base.product_types.includes('vape') ? <div className="qe-stack">
      <div className="qe-note success"><strong>{ar ? 'مسار الفيب الذكي' : 'Smart vape pathway'}</strong> {ar ? 'هذه الأسئلة خاصة بالفيب. إذا اكتملت جميعها يمكن لأقلع حساب مؤشر Penn State للسيجارة الإلكترونية بشكل حتمي، وليس بواسطة الذكاء الاصطناعي.' : 'These questions are vape-specific. When all are complete, Aqla can deterministically calculate the Penn State e-cigarette dependence index rather than asking AI to estimate it.'}</div>
      <Question title={ar ? 'ما نوع جهاز الفيب الذي تستخدمه غالبًا؟' : 'What type of vape do you mainly use?'}><div className="qe-option-grid">{VAPE_DEVICE_OPTIONS.map((option) => <Chip key={option.value} active={value.vape?.device_type === option.value} onClick={() => patchVape({ device_type: option.value as VapeDeviceType })}>{option[lang]}</Chip>)}</div></Question>
      <Question title={ar ? 'كم مرة تقريبًا تستخدم الفيب في اليوم؟' : 'About how many times do you use your vape per day?'} hint={ar ? 'إذا كان الاستخدام متكررًا جدًا، أعط أفضل تقدير تستطيع.' : 'If use is very frequent, give your best estimate.'}><input className="qe-field" aria-required="true" type="number" min="0" max="500" step="1" placeholder={ar ? 'مثال: 20' : 'Example: 20'} value={value.vape?.times_per_day ?? ''} onChange={(event) => patchVape({ times_per_day: event.target.value ? Number(event.target.value) : undefined })} /></Question>
      <Question title={ar ? 'بعد الاستيقاظ، بعد كم دقيقة تستخدم الفيب لأول مرة؟' : 'How many minutes after waking do you first vape?'} hint={ar ? 'أدخل عدد الدقائق، مثل 5 أو 30 أو 60.' : 'Enter the number of minutes, such as 5, 30 or 60.'}><input className="qe-field" aria-required="true" type="number" min="0" max="1440" step="1" placeholder={ar ? 'مثال: 10' : 'Example: 10'} value={value.vape?.minutes_after_waking ?? ''} onChange={(event) => patchVape({ minutes_after_waking: event.target.value ? Number(event.target.value) : undefined })} /></Question>
      <Question title={ar ? 'هل تستيقظ من النوم ليلًا لتستخدم الفيب؟' : 'Do you wake at night to vape?'}><BooleanPick value={value.vape?.awakens_at_night} lang={lang} onChange={(next) => patchVape({ awakens_at_night: next, nights_per_week: next ? value.vape?.nights_per_week : 0 })} /></Question>
      {value.vape?.awakens_at_night ? <Question title={ar ? 'في كم ليلة من الأسبوع يحدث ذلك عادةً؟' : 'On how many nights per week does that usually happen?'}><input className="qe-field" aria-required="true" type="number" min="0" max="7" step="1" placeholder={ar ? 'مثال: 3' : 'Example: 3'} value={value.vape?.nights_per_week ?? ''} onChange={(event) => patchVape({ nights_per_week: event.target.value ? Number(event.target.value) : undefined })} /></Question> : null}
      <Question title={ar ? 'هل تجد الإقلاع عن الفيب صعبًا؟' : 'Do you find quitting vaping difficult?'}><BooleanPick value={value.vape?.hard_to_quit} lang={lang} onChange={(next) => patchVape({ hard_to_quit: next })} /></Question>
      <Question title={ar ? 'هل تشعر برغبة قوية في استخدام الفيب؟' : 'Do you experience strong cravings to vape?'}><BooleanPick value={value.vape?.strong_cravings} lang={lang} onChange={(next) => patchVape({ strong_cravings: next })} /></Question>
      <Question title={ar ? 'ما شدة الرغبة عادةً؟' : 'How strong is the urge usually?'}><div className="qe-option-grid">{VAPE_URGE_OPTIONS.map((option) => <Chip key={option.value} active={value.vape?.urge_strength === option.value} onClick={() => patchVape({ urge_strength: option.value as VapeUrgeStrength })}>{option[lang]}</Chip>)}</div></Question>
      <Question title={ar ? 'هل يصعب عليك الامتناع عن الفيب في الأماكن التي لا يسمح فيها؟' : 'Is it difficult to refrain from vaping where it is not allowed?'}><BooleanPick value={value.vape?.hard_to_refrain_where_not_allowed} lang={lang} onChange={(next) => patchVape({ hard_to_refrain_where_not_allowed: next })} /></Question>
      <Question title={ar ? 'إذا لم تستطع استخدام الفيب، هل تصبح سريع الانفعال؟' : 'When you cannot vape, do you become irritable?'}><BooleanPick value={value.vape?.irritable_when_unable} lang={lang} onChange={(next) => patchVape({ irritable_when_unable: next })} /></Question>
      <Question title={ar ? 'إذا لم تستطع استخدام الفيب، هل تشعر بالتوتر أو القلق أو عدم الارتياح؟' : 'When you cannot vape, do you feel nervous, restless or anxious?'}><BooleanPick value={value.vape?.nervous_restless_anxious_when_unable} lang={lang} onChange={(next) => patchVape({ nervous_restless_anxious_when_unable: next })} /></Question>
      <Question title={ar ? 'ما تركيز النيكوتين المكتوب على السائل أو الجهاز (mg/mL)؟' : 'What nicotine strength is shown on the liquid/device (mg/mL)?'} hint={ar ? 'أدخل الرقم المكتوب على العبوة أو الجهاز.' : 'Enter the strength shown on the liquid or device.'}><input className="qe-field" aria-required="true" type="number" min="0" max="100" step="0.1" placeholder={ar ? 'مثال: 20' : 'Example: 20'} value={value.vape?.nicotine_strength_mg_ml ?? ''} onChange={(event) => patchVape({ nicotine_strength_mg_ml: event.target.value ? Number(event.target.value) : undefined })} /></Question>
    </div> : null}

    {base.product_types.includes('pouches') ? <div className="qe-stack">
      <div className="qe-note success"><strong>{ar ? 'مسار أكياس النيكوتين الذكي' : 'Smart nicotine-pouch pathway'}</strong> {ar ? 'يستخدم أقلع هنا نمطًا خاصًا بالأكياس. أي درجة اعتماد ناتجة من هذا الجزء تُعرض بوضوح كأداة داخلية غير معتمدة وليست مقياسًا سريريًا محققًا.' : 'Aqla uses a pouch-specific pattern here. Any dependence category from this section is explicitly labelled as an internal non-validated screen, not a validated clinical scale.'}</div>
      <Question title={ar ? 'كم كيس نيكوتين تستخدم تقريبًا في اليوم؟' : 'About how many nicotine pouches do you use per day?'} hint={ar ? 'أدخل متوسط العدد اليومي.' : 'Enter your average daily number.'}><input className="qe-field" aria-required="true" type="number" min="0" max="100" step="1" placeholder={ar ? 'مثال: 20' : 'Example: 20'} value={value.pouches?.pouches_per_day ?? ''} onChange={(event) => patchPouch({ pouches_per_day: event.target.value ? Number(event.target.value) : undefined })} /></Question>
      <Question title={ar ? 'ما اسم المنتج أو العلامة؟' : 'What product or brand do you use?'} hint={ar ? 'اكتب اسم المنتج أو العلامة كما يظهر على العبوة.' : 'Enter the product or brand name shown on the pack.'}><input className="qe-field" aria-required="true" maxLength={80} placeholder={ar ? 'مثال: DZRT' : 'Example: DZRT'} value={value.pouches?.brand ?? ''} onChange={(event) => patchPouch({ brand: event.target.value })} /></Question>
      <Question title={ar ? 'كم ملغ نيكوتين في الكيس الواحد؟' : 'How many mg of nicotine are in each pouch?'} hint={ar ? 'أدخل مقدار النيكوتين في الكيس الواحد بالمليغرام.' : 'Enter the nicotine amount per pouch in milligrams.'}><input className="qe-field" aria-required="true" type="number" min="0" max="100" step="0.1" placeholder={ar ? 'مثال: 10' : 'Example: 10'} value={value.pouches?.strength_mg_per_pouch ?? ''} onChange={(event) => patchPouch({ strength_mg_per_pouch: event.target.value ? Number(event.target.value) : undefined })} /></Question>
      <Question title={ar ? 'هل تستخدم أكثر من كيس في نفس الوقت أحيانًا؟' : 'Do you sometimes use more than one pouch at the same time?'}><BooleanPick value={value.pouches?.uses_multiple_at_once} lang={lang} onChange={(next) => patchPouch({ uses_multiple_at_once: next })} /></Question>
      <Question title={ar ? 'هل تغيّر بين تراكيز مختلفة للنيكوتين؟' : 'Do you switch between different nicotine strengths?'}><BooleanPick value={value.pouches?.changes_strength} lang={lang} onChange={(next) => patchPouch({ changes_strength: next })} /></Question>
      <Question title={ar ? 'هل تستخدم أكياس النيكوتين أثناء الليل أو إذا استيقظت من النوم؟' : 'Do you use nicotine pouches during the night or after waking from sleep?'}><BooleanPick value={value.pouches?.night_use} lang={lang} onChange={(next) => patchPouch({ night_use: next })} /></Question>
      <Question title={ar ? 'هل تشعر برغبة قوية في استخدام الأكياس؟' : 'Do you experience strong cravings for pouches?'}><BooleanPick value={value.pouches?.strong_cravings} lang={lang} onChange={(next) => patchPouch({ strong_cravings: next })} /></Question>
      <Question title={ar ? 'هل حاولت التقليل ووجدت ذلك صعبًا؟' : 'Have you tried to cut down and found it difficult?'}><BooleanPick value={value.pouches?.hard_to_cut_down} lang={lang} onChange={(next) => patchPouch({ hard_to_cut_down: next })} /></Question>
      <Question title={ar ? 'إذا لم تستطع استخدام كيس، هل تصبح سريع الانفعال؟' : 'When you cannot use a pouch, do you become irritable?'}><BooleanPick value={value.pouches?.irritable_when_unable} lang={lang} onChange={(next) => patchPouch({ irritable_when_unable: next })} /></Question>
      <Question title={ar ? 'هل يحدث أن تستخدم أكياسًا أكثر مما كنت تنوي؟' : 'Do you sometimes use more pouches than you intended?'}><BooleanPick value={value.pouches?.uses_more_than_intended} lang={lang} onChange={(next) => patchPouch({ uses_more_than_intended: next })} /></Question>
    </div> : null}
  </div>
}
