import chunk0 from '@/lib/aqla-logo-chunk-0'
import chunk1 from '@/lib/aqla-logo-chunk-1'
import chunk2 from '@/lib/aqla-logo-chunk-2'

const LOGO_BYTES = Buffer.from(chunk0 + chunk1 + chunk2, 'base64')

export const runtime = 'nodejs'

export async function GET() {
  return new Response(new Uint8Array(LOGO_BYTES), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': LOGO_BYTES.length.toString(),
      'Cache-Control': 'public, max-age=300, must-revalidate',
    },
  })
}
