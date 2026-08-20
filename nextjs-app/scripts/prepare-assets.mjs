import { copyFile, mkdir, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const appRoot = join(scriptDir, '..')
const repoRoot = join(appRoot, '..')
const publicDir = join(appRoot, 'public')
const generatedLibDir = join(appRoot, 'src', 'lib')

const assets = [
  { source: join(repoRoot, 'public', 'aqla-logo.png'), destination: join(publicDir, 'aqla-logo.png'), label: 'Aqla logo' },
  { source: join(repoRoot, 'src', 'assets', 'DejaVuSans.ttf'), destination: join(publicDir, 'DejaVuSans.ttf'), label: 'Arabic PDF font' },
  {
    source: join(repoRoot, 'src', 'lib', 'training-content.ts'),
    destination: join(generatedLibDir, 'training-content.generated.ts'),
    label: 'Aqla 7-module training content',
  },
]

try {
  await Promise.all([mkdir(publicDir, { recursive: true }), mkdir(generatedLibDir, { recursive: true })])
  for (const asset of assets) {
    const sourceStats = await stat(asset.source)
    if (!sourceStats.isFile()) throw new Error(`${asset.label} source is not a file`)
    await copyFile(asset.source, asset.destination)
    console.log(`Prepared ${asset.label} for Next.js build.`)
  }
} catch (error) {
  console.error('Unable to prepare Aqla assets:', error instanceof Error ? error.message : error)
  process.exit(1)
}
