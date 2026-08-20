import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const appRoot = path.join(root, 'src', 'app')
const srcRoot = path.join(root, 'src')

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(fullPath))
    else files.push(fullPath)
  }
  return files
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function routeRegex(file) {
  const relativeDirectory = path.relative(appRoot, path.dirname(file))
  const segments = relativeDirectory === '' ? [] : relativeDirectory.split(path.sep)
  let pattern = '^'

  for (const segment of segments) {
    if (/^\(.*\)$/.test(segment) || segment.startsWith('@')) continue
    if (/^\[\[\.\.\..+\]\]$/.test(segment)) {
      pattern += '(?:/.+)?'
    } else if (/^\[\.\.\..+\]$/.test(segment)) {
      pattern += '/.+'
    } else if (/^\[.+\]$/.test(segment)) {
      pattern += '/[^/]+'
    } else {
      pattern += `/${escapeRegex(segment)}`
    }
  }

  pattern += '/?$'
  return new RegExp(pattern)
}

function cleanCandidate(raw) {
  const dynamicResolved = raw.replace(/\$\{[^}]+\}/g, 'sample')
  const pathOnly = dynamicResolved.split(/[?#]/, 1)[0] || '/'
  return pathOnly.length > 1 ? pathOnly.replace(/\/+$/, '') : pathOnly
}

const allAppFiles = await walk(appRoot)
const routeFiles = allAppFiles.filter((file) => ['page.tsx', 'page.ts', 'route.ts', 'route.js'].includes(path.basename(file)))
const routePatterns = routeFiles.map((file) => ({ file, regex: routeRegex(file) }))

const sourceFiles = (await walk(srcRoot)).filter((file) => /\.(?:ts|tsx|js|jsx)$/.test(file))
const ids = new Set()
const references = []
const hashReferences = []
const externalLinks = []

for (const file of sourceFiles) {
  const source = await readFile(file, 'utf8')
  const relative = path.relative(root, file)

  for (const match of source.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)) ids.add(match[1])
  for (const match of source.matchAll(/href\s*=\s*["']#([^"']+)["']/g)) hashReferences.push({ file: relative, target: match[1] })
  for (const match of source.matchAll(/href\s*=\s*["'](https?:\/\/[^"']+)["']/g)) externalLinks.push({ file: relative, url: match[1] })

  // Only treat aqla/auth/api as route namespaces when followed by /, ?, #, or end-of-string.
  // This deliberately excludes static assets such as /aqla-logo.png.
  for (const match of source.matchAll(/["'](\/(?:aqla|auth|api)(?=\/|\?|#|["'])[^"']*)["']/g)) {
    references.push({ file: relative, raw: match[1] })
  }
  for (const match of source.matchAll(/`(\/(?:aqla|auth|api)(?=\/|\?|#|`)[^`]*)`/g)) {
    references.push({ file: relative, raw: match[1] })
  }
}

const brokenRoutes = []
for (const reference of references) {
  const candidate = cleanCandidate(reference.raw)
  if (!routePatterns.some(({ regex }) => regex.test(candidate))) {
    brokenRoutes.push({ ...reference, candidate })
  }
}

const brokenHashes = hashReferences.filter(({ target }) => !ids.has(target))
const malformedExternal = externalLinks.filter(({ url }) => {
  try {
    const parsed = new URL(url)
    return !['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return true
  }
})

if (brokenRoutes.length || brokenHashes.length || malformedExternal.length) {
  if (brokenRoutes.length) {
    console.error('\nBroken internal route references:')
    for (const item of brokenRoutes) console.error(`- ${item.file}: ${item.raw} -> ${item.candidate}`)
  }
  if (brokenHashes.length) {
    console.error('\nHash links with no matching element id:')
    for (const item of brokenHashes) console.error(`- ${item.file}: #${item.target}`)
  }
  if (malformedExternal.length) {
    console.error('\nMalformed external links:')
    for (const item of malformedExternal) console.error(`- ${item.file}: ${item.url}`)
  }
  process.exit(1)
}

console.log(`Internal route check passed: ${references.length} route references, ${hashReferences.length} hash links, ${externalLinks.length} external URLs.`)
