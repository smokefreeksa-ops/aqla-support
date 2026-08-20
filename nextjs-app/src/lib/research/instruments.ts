// Research-grade nicotine/tobacco dependence instruments for Aqla AWS.
//
// Rules:
// - Scoring is deterministic and must never be delegated to an LLM.
// - Validated instruments retain their published scoring ranges.
// - Adapted/internal screens are explicitly labelled non-validated.
// - These functions do not diagnose dependence; they produce instrument scores.

export type FtndCategory = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'

export interface FtndAnswers {
  timeToFirst: 0 | 1 | 2 | 3
  difficultToRefrain: 0 | 1
  hardestCigarette: 0 | 1
  cigarettesPerDay: 0 | 1 | 2 | 3
  smokeMoreMorning: 0 | 1
  smokeWhenIll: 0 | 1
}

export function scoreFtnd(answers: FtndAnswers): { total: number; category: FtndCategory; validated: true } {
  const total =
    answers.timeToFirst +
    answers.difficultToRefrain +
    answers.hardestCigarette +
    answers.cigarettesPerDay +
    answers.smokeMoreMorning +
    answers.smokeWhenIll

  const category: FtndCategory = total <= 2
    ? 'very_low'
    : total <= 4
      ? 'low'
      : total === 5
        ? 'moderate'
        : total <= 7
          ? 'high'
          : 'very_high'

  return { total, category, validated: true }
}

export type PsecdiCategory = 'not_dependent' | 'low' | 'medium' | 'high'

export interface PennStateEcigAnswers {
  timesPerDay: number
  minutesAfterWaking: number
  awakensAtNight: boolean
  nightsPerWeek: number
  hardToQuit: boolean
  strongCravings: boolean
  urgeStrength: 'none_or_slight' | 'moderate_or_strong' | 'very_or_extremely_strong'
  hardToRefrainWhereNotAllowed: boolean
  irritableWhenUnable: boolean
  nervousRestlessAnxiousWhenUnable: boolean
}

function scorePsecdiFrequency(times: number) {
  if (!Number.isFinite(times) || times < 0) throw new Error('invalid_psecdi_frequency')
  if (times <= 4) return 0
  if (times <= 9) return 1
  if (times <= 14) return 2
  if (times <= 19) return 3
  if (times <= 29) return 4
  return 5
}

function scorePsecdiMorning(minutes: number) {
  if (!Number.isFinite(minutes) || minutes < 0) throw new Error('invalid_psecdi_morning_time')
  if (minutes <= 5) return 5
  if (minutes <= 15) return 4
  if (minutes <= 30) return 3
  if (minutes <= 60) return 2
  if (minutes <= 120) return 1
  return 0
}

function scorePsecdiNights(awakens: boolean, nights: number) {
  if (!awakens) return 0
  if (!Number.isFinite(nights) || nights < 0 || nights > 7) throw new Error('invalid_psecdi_nights')
  if (nights <= 1) return 0
  if (nights <= 3) return 1
  return 2
}

export function scorePennStateEcig(answers: PennStateEcigAnswers): {
  total: number
  category: PsecdiCategory
  validated: true
} {
  const urge = answers.urgeStrength === 'very_or_extremely_strong'
    ? 2
    : answers.urgeStrength === 'moderate_or_strong'
      ? 1
      : 0

  const total =
    scorePsecdiFrequency(answers.timesPerDay) +
    scorePsecdiMorning(answers.minutesAfterWaking) +
    (answers.awakensAtNight ? 1 : 0) +
    scorePsecdiNights(answers.awakensAtNight, answers.nightsPerWeek) +
    (answers.hardToQuit ? 1 : 0) +
    (answers.strongCravings ? 1 : 0) +
    urge +
    (answers.hardToRefrainWhereNotAllowed ? 1 : 0) +
    (answers.irritableWhenUnable ? 1 : 0) +
    (answers.nervousRestlessAnxiousWhenUnable ? 1 : 0)

  const category: PsecdiCategory = total <= 3
    ? 'not_dependent'
    : total <= 8
      ? 'low'
      : total <= 12
        ? 'medium'
        : 'high'

  return { total, category, validated: true }
}

export type Lwds11Answers = [number, number, number, number, number, number, number, number, number, number, number]

export function scoreLwds11(items: Lwds11Answers): {
  total: number
  dependenceThresholdReached: boolean
  validated: true
} {
  if (items.length !== 11 || items.some((value) => !Number.isInteger(value) || value < 0 || value > 3)) {
    throw new Error('invalid_lwds11_items')
  }
  const total = items.reduce((sum, value) => sum + value, 0)
  return {
    total,
    // The original validation used a threshold score of 10 to discriminate dependence.
    // Do not invent extra severity bands without a protocol-specific justification.
    dependenceThresholdReached: total >= 10,
    validated: true,
  }
}

export type HoncStyleAnswers = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean]

export function scoreHoncStyle(items: HoncStyleAnswers): {
  positiveCount: number
  anyPositive: boolean
  validated: false
  label: 'HONC-style'
} {
  const positiveCount = items.filter(Boolean).length
  return { positiveCount, anyPositive: positiveCount > 0, validated: false, label: 'HONC-style' }
}

export type OralNicotineAdaptedAnswers = [boolean, boolean, boolean, boolean, boolean, boolean]

export function scoreOralNicotineAdapted(items: OralNicotineAdaptedAnswers): {
  positiveCount: number
  category: 'low' | 'moderate' | 'high'
  validated: false
} {
  const positiveCount = items.filter(Boolean).length
  const category = positiveCount <= 1 ? 'low' : positiveCount <= 3 ? 'moderate' : 'high'
  return { positiveCount, category, validated: false }
}

export const RESEARCH_INSTRUMENTS = {
  ftnd: {
    id: 'ftnd',
    name: 'Fagerström Test for Nicotine Dependence',
    product: 'cigarettes',
    scoreRange: '0–10',
    validated: true,
    citation: 'Heatherton et al.; standard 6-item FTND scoring',
  },
  psecdi: {
    id: 'psecdi',
    name: 'Penn State Electronic Cigarette Dependence Index',
    product: 'vape',
    scoreRange: '0–20',
    validated: true,
    citation: 'Foulds et al., Nicotine & Tobacco Research (2015)',
  },
  lwds11: {
    id: 'lwds11',
    name: 'Lebanon Waterpipe Dependence Scale-11',
    product: 'shisha',
    scoreRange: '0–33',
    validated: true,
    citation: 'Salameh et al., Nicotine & Tobacco Research (2008)',
  },
  honcStyle: {
    id: 'honc_style',
    name: 'HONC-style loss-of-autonomy screen',
    product: 'cross-product/youth',
    scoreRange: '0–10 positive items',
    validated: false,
    citation: 'Adapted internal wording; do not label as validated HONC',
  },
  oralNicotineAdapted: {
    id: 'oral_nicotine_adapted',
    name: 'Oral nicotine/pouch adapted screen',
    product: 'pouches/oral nicotine',
    scoreRange: '0–6 positive items',
    validated: false,
    citation: 'Aqla adapted internal screen; not a validated dependence scale',
  },
} as const
