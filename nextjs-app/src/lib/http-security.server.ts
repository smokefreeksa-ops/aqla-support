import type { NextRequest } from 'next/server'
import { cognitoConfig } from '@/lib/cognito'

const APP_ORIGIN = new URL(cognitoConfig.appUrl).origin

type MutationRequestError = {
  error: 'forbidden_origin' | 'unsupported_content_type' | 'request_too_large'
  status: 403 | 413 | 415
}

export function validateMutationRequest(request: NextRequest, maxBytes = 64 * 1024): MutationRequestError | null {
  const origin = request.headers.get('origin')
  if (origin && origin !== APP_ORIGIN) return { error: 'forbidden_origin', status: 403 }

  const fetchSite = request.headers.get('sec-fetch-site')
  if (fetchSite && !['same-origin', 'none'].includes(fetchSite)) return { error: 'forbidden_origin', status: 403 }

  const contentType = request.headers.get('content-type')?.toLowerCase() ?? ''
  if (!contentType.startsWith('application/json')) return { error: 'unsupported_content_type', status: 415 }

  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const bytes = Number(contentLength)
    if (Number.isFinite(bytes) && bytes > maxBytes) return { error: 'request_too_large', status: 413 }
  }

  return null
}
