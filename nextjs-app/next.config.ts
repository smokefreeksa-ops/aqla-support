import path from 'node:path'
import type { NextConfig } from 'next'

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
]

const privateHeaders = [
  { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
  { key: 'Pragma', value: 'no-cache' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.join(process.cwd(), '..'),
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/aqla/plan/:path*',
        headers: privateHeaders,
      },
      {
        source: '/aqla/followup/:path*',
        headers: privateHeaders,
      },
      {
        source: '/auth/:path*',
        headers: privateHeaders,
      },
      {
        source: '/api/:path*',
        headers: privateHeaders,
      },
    ]
  },
}

export default nextConfig
