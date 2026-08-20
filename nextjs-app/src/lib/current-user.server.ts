import { cookies } from 'next/headers'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'

export type AqlaStaffRole = 'admin' | 'clinician' | 'receptionist'

export interface CurrentAqlaUser {
  sub: string
  email?: string
  emailVerified: boolean
  groups: string[]
}

export async function getCurrentAqlaUser(): Promise<CurrentAqlaUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(authCookies.idToken)?.value
  if (!token) return null

  try {
    const payload = await verifyCognitoIdToken(token)
    if (typeof payload.sub !== 'string') return null

    const email = typeof payload.email === 'string' ? payload.email.trim() : undefined
    const emailVerified = payload.email_verified === true || payload.email_verified === 'true'
    const rawGroups = payload['cognito:groups']
    const groups = Array.isArray(rawGroups)
      ? rawGroups.filter((group): group is string => typeof group === 'string').map((group) => group.toLowerCase())
      : typeof rawGroups === 'string'
        ? rawGroups.split(',').map((group) => group.trim().toLowerCase()).filter(Boolean)
        : []

    return { sub: payload.sub, email, emailVerified, groups }
  } catch {
    return null
  }
}

export function hasAqlaRole(user: CurrentAqlaUser, role: AqlaStaffRole) {
  const accepted: Record<AqlaStaffRole, string[]> = {
    admin: ['admin', 'aqla-admin', 'aqla_admin'],
    clinician: ['clinician', 'aqla-clinician', 'aqla_clinician'],
    receptionist: ['receptionist', 'aqla-receptionist', 'aqla_receptionist'],
  }
  return user.groups.some((group) => accepted[role].includes(group))
}

export function getAqlaStaffRole(user: CurrentAqlaUser): AqlaStaffRole | null {
  if (hasAqlaRole(user, 'admin')) return 'admin'
  if (hasAqlaRole(user, 'clinician')) return 'clinician'
  if (hasAqlaRole(user, 'receptionist')) return 'receptionist'
  return null
}
