// Builds client/src/lib/resource-images.ts: one baked preview image per
// catalogue URL, so a card never waits on a third-party metadata API.
//
//   node scripts/build-resource-images.mjs
//   node scripts/build-resource-images.mjs --refresh   # re-fetch every entry
//
// It reads server/src/db/catalog.json, keeps the entries already baked in the
// generated module that still answer with an image, and only resolves the rest:
// fetch the site's HTML, keep its Open Graph (or Twitter card) image, and fall
// back to the domain's favicon when the site ships none or blocks the fetch.
// Every candidate is probed first, so the module never points at a URL that
// returns HTML, a 404, or localhost.
//
// Nothing here runs at app runtime: the card reads the generated module.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const catalogPath = resolve(root, 'server/src/db/catalog.json')
const outPath = resolve(root, 'client/src/lib/resource-images.ts')

const refresh = process.argv.includes('--refresh')
const CONCURRENCY = 12
const PAGE_TIMEOUT_MS = 12_000
const IMAGE_TIMEOUT_MS = 15_000
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'", '#38': '&' }

/** Meta content is HTML-escaped (`&amp;`, `&#038;`); a URL is not. */
function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&(amp|lt|gt|quot|apos);/g, (_, name) => ENTITIES[name])
}

function metaMap(html) {
  const map = new Map()
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = tag[0]
    const key = (attrs.match(/(?:property|name|itemprop)\s*=\s*["']([^"']+)["']/i) || [])[1]
    const content = (attrs.match(/content\s*=\s*["']([^"']*)["']/i) || [])[1]
    if (key && content) map.set(key.toLowerCase(), decodeEntities(content).trim())
  }
  return map
}

function absolute(url, base) {
  try {
    return new URL(url, base).href
  } catch {
    return undefined
  }
}

function pickImage(html, pageUrl) {
  const meta = metaMap(html)
  const candidates = [
    meta.get('og:image:secure_url'),
    meta.get('og:image'),
    meta.get('og:image:url'),
    meta.get('twitter:image'),
    meta.get('twitter:image:src'),
  ]
  const link = (html.match(/<link\b[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["']/i) || [])[1]
  if (link) candidates.push(decodeEntities(link))

  let image
  for (const candidate of candidates) {
    if (!candidate) continue
    image = absolute(candidate, pageUrl)
    if (image) break
  }

  const width = Number(meta.get('og:image:width'))
  const height = Number(meta.get('og:image:height'))
  return {
    image,
    width: Number.isFinite(width) && width > 0 ? width : undefined,
    height: Number.isFinite(height) && height > 0 ? height : undefined,
  }
}

async function fetchPage(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
    headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' },
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const type = response.headers.get('content-type') ?? ''
  if (!type.includes('html')) throw new Error(`not html (${type.split(';')[0]})`)
  return { html: (await response.text()).slice(0, 500_000), finalUrl: response.url }
}

/**
 * Is this URL an image a browser can render?
 * `transient` marks the cases where the URL may be fine and the server is not:
 * a timeout, a network error, a 429, or a 5xx.
 */
async function probeImage(url) {
  if (!/^https?:\/\//i.test(url)) return { ok: false }
  if (/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/)/i.test(url)) return { ok: false }
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS),
      headers: {
        'user-agent': UA,
        accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        range: 'bytes=0-2048',
      },
    })
    const type = (response.headers.get('content-type') ?? '').toLowerCase()
    if (response.status === 429 || response.status >= 500) return { ok: false, transient: true, status: response.status }
    if (!response.ok) return { ok: false, status: response.status }
    if (!type.startsWith('image/') && !type.includes('octet-stream')) return { ok: false, status: response.status, type }
    return { ok: true, url: response.url || url }
  } catch {
    return { ok: false, transient: true }
  }
}

function faviconCandidates(url) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return []
  }
  const host = parsed.hostname
  const bare = host.replace(/^www\./, '')
  // GitHub Pages projects serve their mark under the project path, and Google
  // indexes it that way (`jakearchibald.github.io/svgomg`), so try both.
  const slug = `${bare}${parsed.pathname}`.replace(/\/+$/, '')
  return [...new Set([
    `https://www.google.com/s2/favicons?domain=${host}&sz=128`,
    `https://www.google.com/s2/favicons?domain=${slug}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${bare}.ico`,
    `https://${host}/favicon.ico`,
    `https://${host}/favicon.svg`,
    // Last resort: the sites above that ship no icon file still have a mark
    // some other host has seen.
    `https://unavatar.io/${bare}`,
    `https://unavatar.io/${slug}`,
  ])]
}

function readBaked(source) {
  const map = new Map()
  const re = /"([^"]+)":\s*\{\s*image:\s*"((?:[^"\\]|\\.)*)",\s*width:\s*(\d+),\s*height:\s*(\d+),\s*source:\s*"(og|favicon)"/g
  for (const match of source.matchAll(re)) {
    map.set(match[1], {
      image: JSON.parse(`"${match[2]}"`),
      width: Number(match[3]),
      height: Number(match[4]),
      source: match[5],
    })
  }
  return map
}

/** A URL that may need an https upgrade, and must never point at localhost. */
function normalize(url) {
  if (!url) return []
  const cleaned = decodeEntities(url).trim()
  const list = []
  if (cleaned.startsWith('https://')) list.push(cleaned)
  else if (cleaned.startsWith('http://')) list.push(cleaned)
  // Mixed content is blocked on an https page, and most http hosts answer on
  // https too, so try the secure form first.
  if (cleaned.startsWith('http://')) list.unshift(cleaned.replace(/^http:/, 'https:'))
  return [...new Set(list)].filter(url => !/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/)/i.test(url))
}

async function resolveCamera(url) {
  const out = []
  for (const candidate of normalize(url)) {
    const probe = await probeImage(candidate)
    if (probe.ok) return { image: probe.url, source: 'og' }
    out.push(probe)
  }
  return null
}

async function resolveEntry({ name, url }) {
  try {
    const { html, finalUrl } = await fetchPage(url)
    const found = pickImage(html, finalUrl)
    if (found.image) {
      const resolved = await resolveCamera(found.image)
      if (resolved) {
        return {
          image: resolved.image,
          width: found.width ?? 1200,
          height: found.height ?? 630,
          source: 'og',
        }
      }
    }
  } catch {
    // Blocked, offline, or no meta. The favicon is the fallback.
  }

  for (const candidate of faviconCandidates(url)) {
    let probe = await probeImage(candidate)
    // A timeout on a mark is worth one more ask; it is usually the host
    // stalling, not a missing icon.
    if (!probe.ok && probe.transient) probe = await probeImage(candidate)
    if (probe.ok) return { image: probe.url, width: 128, height: 128, source: 'favicon' }
  }
  const [fallback] = faviconCandidates(url)
  return { image: fallback, width: 128, height: 128, source: 'favicon' }
}

async function pool(items, worker, size) {
  const results = new Array(items.length)
  let cursor = 0
  let done = 0
  async function run() {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await worker(items[index])
      done += 1
      if (done % 10 === 0 || done === items.length) process.stdout.write(`  ${done}/${items.length}\n`)
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, run))
  return results
}

const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
const resources = Array.isArray(catalog) ? catalog : catalog.resources
const entries = []
const seen = new Set()
for (const { url } of resources) {
  if (!url || seen.has(url)) continue
  seen.add(url)
  entries.push(url)
}
console.log(`Found ${entries.length} catalogue URLs.`)

const previous = refresh ? new Map() : readBaked(await readFile(outPath, 'utf8').catch(() => ''))
console.log(`Re-checking ${previous.size} baked entries.`)

const images = new Map()
await pool(entries, async url => {
  const seed = previous.get(url)
  if (seed) {
    // Keep a known good image unless the probe is conclusive: a timeout or a
    // rate limit is not evidence that the URL died.
    for (const candidate of normalize(seed.image)) {
      const probe = await probeImage(candidate)
      if (probe.ok) {
        images.set(url, { ...seed, image: probe.url })
        return
      }
      if (probe.transient) {
        images.set(url, { ...seed })
        return
      }
    }
    console.log(`  re-resolving ${url} (baked image no longer renders)`)
  }
  const resolved = await resolveEntry({ url })
  if (resolved.source === 'favicon') console.log(`  favicon: ${url}`)
  images.set(url, resolved)
}, CONCURRENCY)

const lines = []
let og = 0
for (const url of entries) {
  const value = images.get(url)
  if (value.source === 'og') og += 1
  lines.push(`  ${JSON.stringify(url)}: { image: ${JSON.stringify(value.image)}, width: ${value.width}, height: ${value.height}, source: ${JSON.stringify(value.source)} },`)
}

const header = `// Generated by scripts/build-resource-images.mjs. Do not edit by hand.
//
// One preview image per catalogue URL, captured from the site's Open Graph
// meta tags. Entries marked "favicon" ship no usable OG image, so they render
// the site's favicon instead. Re-run the script after changing
// server/src/db/catalog.json; without --refresh it only resolves new URLs and
// keeps the images already proven to render.

export type ResourceImage = {
  image: string
  width: number
  height: number
  source: 'og' | 'favicon'
}

export const resourceImages: Record<string, ResourceImage> = {
`

await mkdir(dirname(outPath), { recursive: true })
await writeFile(outPath, `${header}${lines.join('\n')}\n}\n`, 'utf8')

console.log(`Wrote ${outPath}: ${og} OG images, ${entries.length - og} favicons.`)
