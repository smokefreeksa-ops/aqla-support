import { copyFile, mkdir, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const appRoot = join(scriptDir, '..')
const repoRoot = join(appRoot, '..')
const source = join(repoRoot, 'public', 'aqla-logo.png')
const publicDir = join(appRoot, 'public')
const destination = join(publicDir, 'aqla-logo.png')

try {
  const sourceStats = await stat(source)
  if (!sourceStats.isFile()) throw new Error('source is not a file')
  await mkdir(publicDir, { recursive: true })
  await copyFile(source, destination)
  console.log('Prepared local Aqla logo asset for Next.js build.')
} catch (error) {
  console.error('Unable to prepare Aqla branding asset:', error instanceof Error ? error.message : error)
  process.exit(1)
}
