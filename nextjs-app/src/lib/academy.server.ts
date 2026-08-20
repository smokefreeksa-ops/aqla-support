import { randomBytes } from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb'
import {
  MODULE_PASS,
  OVERALL_PASS,
  TRAINING_MODULES,
  type TModule,
} from '@/lib/training-content.generated'
import { QUIT_PLAN_TABLE } from '@/lib/quit-engine/store.server'

const region = process.env.AWS_REGION || 'eu-west-2'
const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

export const ACADEMY_SCHEMA_VERSION = 1

export interface AcademyProfile {
  full_name: string
  city?: string
  role?: string
  preferred_language: 'ar' | 'en'
  training_terms_accepted: boolean
  certificate_public_verification_consent: boolean
  updated_at: string
}

export interface AcademyModuleProgress {
  module_slug: string
  best_score: number
  attempts: number
  completed: boolean
  safety_cases_passed: boolean
  last_score: number
  updated_at: string
  completed_at?: string
}

export interface AcademyCertificate {
  certificate_code: string
  verification_hash: string
  full_name: string
  overall_score: number
  issued_at: string
  is_valid: boolean
  title_ar: string
  title_en: string
}

export interface ModuleAttemptAnswers {
  questions: number[]
  cases: number[]
}

const profileKey = (userSub: string) => ({ PK: `USER#${userSub}`, SK: 'ACADEMY#PROFILE' })
const progressKey = (userSub: string, slug: string) => ({ PK: `USER#${userSub}`, SK: `ACADEMY#MODULE#${slug}` })
const latestCertificateKey = (userSub: string) => ({ PK: `USER#${userSub}`, SK: 'ACADEMY#CERT#LATEST' })
const publicCertificateKey = (code: string) => ({ PK: 'ACADEMY#CERTIFICATES', SK: code.toUpperCase() })

function cleanText(value: unknown, max: number) {
  if (typeof value !== 'string') return undefined
  const clean = value.trim().slice(0, max)
  return clean || undefined
}

function findModule(slug: string): TModule | null {
  return TRAINING_MODULES.find((trainingModule) => trainingModule.slug === slug) ?? null
}

function moduleScore(trainingModule: TModule, answers: ModuleAttemptAnswers) {
  if (!Array.isArray(answers.questions) || answers.questions.length !== trainingModule.questions.length) {
    throw new Error('question_answers_incomplete')
  }
  if (!Array.isArray(answers.cases) || answers.cases.length !== trainingModule.cases.length) {
    throw new Error('case_answers_incomplete')
  }
  if ([...answers.questions, ...answers.cases].some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 20)) {
    throw new Error('invalid_answer_index')
  }

  const questionCorrect = trainingModule.questions.reduce((sum, question, index) => sum + (answers.questions[index] === question.correct ? 1 : 0), 0)
  const caseCorrect = trainingModule.cases.reduce((sum, item, index) => sum + (answers.cases[index] === item.correct ? 1 : 0), 0)
  const totalItems = trainingModule.questions.length + trainingModule.cases.length
  const score = totalItems ? Math.round(((questionCorrect + caseCorrect) / totalItems) * 100) : 100
  const requiredCases = trainingModule.cases.map((item, index) => ({ item, answer: answers.cases[index] })).filter(({ item }) => item.required)
  const safetyCasesPassed = requiredCases.every(({ item, answer }) => answer === item.correct)

  return {
    score,
    questionCorrect,
    caseCorrect,
    totalItems,
    safetyCasesPassed,
    completed: score >= MODULE_PASS && safetyCasesPassed,
  }
}

export async function getAcademyProfile(userSub: string): Promise<AcademyProfile | null> {
  const response = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: profileKey(userSub),
    ConsistentRead: true,
  }))
  if (!response.Item) return null
  const item = response.Item
  return {
    full_name: String(item.full_name || ''),
    city: typeof item.city === 'string' ? item.city : undefined,
    role: typeof item.role === 'string' ? item.role : undefined,
    preferred_language: item.preferred_language === 'en' ? 'en' : 'ar',
    training_terms_accepted: item.training_terms_accepted === true,
    certificate_public_verification_consent: item.certificate_public_verification_consent === true,
    updated_at: String(item.updated_at || ''),
  }
}

export async function saveAcademyProfile(userSub: string, input: {
  full_name?: unknown
  city?: unknown
  role?: unknown
  preferred_language?: unknown
  training_terms_accepted?: unknown
  certificate_public_verification_consent?: unknown
}) {
  const fullName = cleanText(input.full_name, 120)
  if (!fullName || fullName.length < 2) throw new Error('full_name_required')
  if (input.training_terms_accepted !== true) throw new Error('training_terms_required')

  const now = new Date().toISOString()
  const profile: AcademyProfile = {
    full_name: fullName,
    city: cleanText(input.city, 80),
    role: cleanText(input.role, 80),
    preferred_language: input.preferred_language === 'en' ? 'en' : 'ar',
    training_terms_accepted: true,
    certificate_public_verification_consent: input.certificate_public_verification_consent === true,
    updated_at: now,
  }

  await documentClient.send(new PutCommand({
    TableName: QUIT_PLAN_TABLE,
    Item: {
      ...profileKey(userSub),
      entity_type: 'academy_profile',
      schema_version: ACADEMY_SCHEMA_VERSION,
      ...profile,
    },
  }))
  return profile
}

export async function submitAcademyModuleAttempt({
  userSub,
  moduleSlug,
  answers,
}: {
  userSub: string
  moduleSlug: string
  answers: ModuleAttemptAnswers
}): Promise<AcademyModuleProgress & { score: number; correct: number; total: number }> {
  const profile = await getAcademyProfile(userSub)
  if (!profile?.training_terms_accepted) throw new Error('academy_profile_required')

  const trainingModule = findModule(moduleSlug)
  if (!trainingModule) throw new Error('unknown_module')
  const grade = moduleScore(trainingModule, answers)
  const key = progressKey(userSub, trainingModule.slug)
  const existingResponse = await documentClient.send(new GetCommand({ TableName: QUIT_PLAN_TABLE, Key: key, ConsistentRead: true }))
  const existing = existingResponse.Item
  const previousBest = typeof existing?.best_score === 'number' ? Number(existing.best_score) : 0
  const attempts = (typeof existing?.attempts === 'number' ? Number(existing.attempts) : 0) + 1
  const bestScore = Math.max(previousBest, grade.score)
  const previouslyCompleted = existing?.completed === true
  const completed = previouslyCompleted || grade.completed
  const safetyCasesPassed = existing?.safety_cases_passed === true || grade.safetyCasesPassed
  const now = new Date().toISOString()

  const progress: AcademyModuleProgress = {
    module_slug: trainingModule.slug,
    best_score: bestScore,
    attempts,
    completed,
    safety_cases_passed: safetyCasesPassed,
    last_score: grade.score,
    updated_at: now,
    completed_at: completed ? (typeof existing?.completed_at === 'string' ? existing.completed_at : now) : undefined,
  }

  await documentClient.send(new PutCommand({
    TableName: QUIT_PLAN_TABLE,
    Item: {
      ...key,
      entity_type: 'academy_module_progress',
      schema_version: ACADEMY_SCHEMA_VERSION,
      ...progress,
    },
  }))

  return {
    ...progress,
    score: grade.score,
    correct: grade.questionCorrect + grade.caseCorrect,
    total: grade.totalItems,
  }
}

export async function getAcademyProgress(userSub: string) {
  const response = await documentClient.send(new QueryCommand({
    TableName: QUIT_PLAN_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
    ExpressionAttributeValues: { ':pk': `USER#${userSub}`, ':prefix': 'ACADEMY#MODULE#' },
    ConsistentRead: true,
  }))

  const progress: Record<string, AcademyModuleProgress> = {}
  for (const item of response.Items ?? []) {
    const slug = typeof item.module_slug === 'string' ? item.module_slug : String(item.SK).replace('ACADEMY#MODULE#', '')
    progress[slug] = {
      module_slug: slug,
      best_score: Number(item.best_score ?? 0),
      attempts: Number(item.attempts ?? 0),
      completed: item.completed === true,
      safety_cases_passed: item.safety_cases_passed === true,
      last_score: Number(item.last_score ?? 0),
      updated_at: String(item.updated_at || ''),
      completed_at: typeof item.completed_at === 'string' ? item.completed_at : undefined,
    }
  }
  return progress
}

function certificateCode() {
  const year = new Date().getUTCFullYear()
  return `AQ-AC-${year}-${randomBytes(5).toString('hex').toUpperCase()}`
}

export async function issueAcademyCertificate(userSub: string): Promise<AcademyCertificate> {
  const [profile, progress, existing] = await Promise.all([
    getAcademyProfile(userSub),
    getAcademyProgress(userSub),
    documentClient.send(new GetCommand({ TableName: QUIT_PLAN_TABLE, Key: latestCertificateKey(userSub), ConsistentRead: true })),
  ])
  if (!profile?.training_terms_accepted) throw new Error('academy_profile_required')
  if (!profile.certificate_public_verification_consent) throw new Error('certificate_verification_consent_required')

  if (existing.Item?.certificate_code) {
    const publicExisting = await verifyAcademyCertificate(String(existing.Item.certificate_code))
    if (publicExisting?.is_valid) return publicExisting
  }

  const missing = TRAINING_MODULES.filter((trainingModule) => !progress[trainingModule.slug]?.completed)
  if (missing.length) throw new Error('all_modules_required')
  if (TRAINING_MODULES.some((trainingModule) => !progress[trainingModule.slug]?.safety_cases_passed)) {
    throw new Error('safety_cases_required')
  }

  const overallScore = Math.round(TRAINING_MODULES.reduce((sum, trainingModule) => sum + progress[trainingModule.slug].best_score, 0) / TRAINING_MODULES.length)
  if (overallScore < OVERALL_PASS) throw new Error('overall_score_below_threshold')

  const certificate: AcademyCertificate = {
    certificate_code: certificateCode(),
    verification_hash: randomBytes(18).toString('hex'),
    full_name: profile.full_name,
    overall_score: overallScore,
    issued_at: new Date().toISOString(),
    is_valid: true,
    title_ar: 'شهادة إتمام تدريب أكاديمية أقلع',
    title_en: 'Aqla Academy Training Completion Certificate',
  }

  await documentClient.send(new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          TableName: QUIT_PLAN_TABLE,
          Item: {
            ...latestCertificateKey(userSub),
            entity_type: 'academy_certificate_pointer',
            certificate_code: certificate.certificate_code,
            issued_at: certificate.issued_at,
          },
          ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        },
      },
      {
        Put: {
          TableName: QUIT_PLAN_TABLE,
          Item: {
            ...publicCertificateKey(certificate.certificate_code),
            entity_type: 'academy_certificate_public',
            schema_version: ACADEMY_SCHEMA_VERSION,
            ...certificate,
          },
          ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        },
      },
      {
        Put: {
          TableName: QUIT_PLAN_TABLE,
          Item: {
            PK: `USER#${userSub}`,
            SK: `ACADEMY#CERT#${certificate.certificate_code}`,
            entity_type: 'academy_certificate_private',
            schema_version: ACADEMY_SCHEMA_VERSION,
            ...certificate,
          },
          ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        },
      },
    ],
  }))

  return certificate
}

export async function verifyAcademyCertificate(code: string): Promise<AcademyCertificate | null> {
  const clean = code.trim().toUpperCase().slice(0, 64)
  if (!/^AQ-AC-\d{4}-[A-F0-9]{10}$/.test(clean)) return null
  const response = await documentClient.send(new GetCommand({
    TableName: QUIT_PLAN_TABLE,
    Key: publicCertificateKey(clean),
    ConsistentRead: true,
  }))
  if (!response.Item) return null
  const item = response.Item
  return {
    certificate_code: String(item.certificate_code || clean),
    verification_hash: String(item.verification_hash || ''),
    full_name: String(item.full_name || ''),
    overall_score: Number(item.overall_score ?? 0),
    issued_at: String(item.issued_at || ''),
    is_valid: item.is_valid === true,
    title_ar: String(item.title_ar || 'شهادة أكاديمية أقلع'),
    title_en: String(item.title_en || 'Aqla Academy Certificate'),
  }
}

export function publicAcademyModules() {
  return TRAINING_MODULES.map((trainingModule) => ({
    slug: trainingModule.slug,
    number: trainingModule.number,
    title_ar: trainingModule.title_ar,
    title_en: trainingModule.title_en,
    subtitle_ar: trainingModule.subtitle_ar,
    subtitle_en: trainingModule.subtitle_en,
    objectives_ar: trainingModule.objectives_ar,
    objectives_en: trainingModule.objectives_en,
    lesson_ar: trainingModule.lesson_ar,
    lesson_en: trainingModule.lesson_en,
    key_points_ar: trainingModule.key_points_ar,
    key_points_en: trainingModule.key_points_en,
    mistakes_ar: trainingModule.mistakes_ar,
    mistakes_en: trainingModule.mistakes_en,
    question_count: trainingModule.questions.length,
    case_count: trainingModule.cases.length,
  }))
}

export function academyModuleForAttempt(slug: string, lang: 'ar' | 'en') {
  const trainingModule = findModule(slug)
  if (!trainingModule) return null
  return {
    slug: trainingModule.slug,
    number: trainingModule.number,
    title: lang === 'ar' ? trainingModule.title_ar : trainingModule.title_en,
    lesson: lang === 'ar' ? trainingModule.lesson_ar : trainingModule.lesson_en,
    objectives: lang === 'ar' ? trainingModule.objectives_ar : trainingModule.objectives_en,
    key_points: lang === 'ar' ? trainingModule.key_points_ar : trainingModule.key_points_en,
    mistakes: lang === 'ar' ? trainingModule.mistakes_ar : trainingModule.mistakes_en,
    questions: trainingModule.questions.map((question) => ({
      prompt: lang === 'ar' ? question.q_ar : question.q_en,
      options: lang === 'ar' ? question.opts_ar : question.opts_en,
    })),
    cases: trainingModule.cases.map((item) => ({
      id: item.id,
      title: lang === 'ar' ? item.title_ar : item.title_en,
      text: lang === 'ar' ? item.text_ar : item.text_en,
      options: lang === 'ar' ? item.opts_ar : item.opts_en,
      required: item.required,
    })),
  }
}
