import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

/**
 * Resolves a resource's preview images from its own address.
 *
 * The catalogue stores URLs only: this module fetches the page once, reads its
 * Open Graph (or Twitter) image and its declared icons, then probes each
 * candidate so a broken address is never written to the database. It never
 * downloads an image; the browser loads the chosen URL from its host.
 *
 * Every request is guarded, because the addresses come from users:
 *   - only http(s), no embedded credentials;
 *   - the hostname and every address it resolves to must be public;
 *   - redirects are followed by hand, at most three, re-checked each hop;
 *   - each request has a timeout, and the whole resolution a shared budget;
 *   - the HTML body is capped while it streams.
 */

const MAX_PAGE_BYTES = 2 * 1024 * 1024
const MAX_REDIRECTS = 3
const MAX_OG_CANDIDATES = 3
const MAX_ICON_CANDIDATES = 4
const PAGE_TIMEOUT_MS = 6_000
const PROBE_TIMEOUT_MS = 4_000
const TOTAL_BUDGET_MS = 12_000

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 desgnix-preview/1.0'

export type ResolvedImages = {
  imageUrl: string | null
  faviconUrl: string | null
  imageWidth: number | null
  imageHeight: number | null
}

const emptyImages: ResolvedImages = {
  imageUrl: null,
  faviconUrl: null,
  imageWidth: null,
  imageHeight: null,
}

/** Resolves the preview for one address. Never throws; a failure is empty. */
export async function resolveImages(rawUrl: string): Promise<ResolvedImages> {
  let page: URL
  try {
    page = new URL(rawUrl)
  } catch {
    return emptyImages
  }
  if (page.protocol !== 'http:' && page.protocol !== 'https:') return emptyImages
  if (page.username || page.password) return emptyImages

  const deadline = Date.now() + TOTAL_BUDGET_MS
  let candidates: PageImages = { og: [], icons: [], width: undefined, height: undefined }
  let base = page

  try {
    const fetched = await fetchPage(page, deadline)
    if (fetched) {
      candidates = readPageImages(fetched.html, fetched.url)
      base = fetched.url
    }
  } catch {
    // The page itself is optional: the domain's own favicon may still resolve.
  }

  const fallbackIcon = new URL('/favicon.ico', base)
  if (fallbackIcon.protocol === 'http:') fallbackIcon.protocol = 'https:'
  const icons = [...candidates.icons, fallbackIcon.toString()]
  const imageUrl = await firstReachable(candidates.og, MAX_OG_CANDIDATES, deadline)
  const faviconUrl = await firstReachable(icons, MAX_ICON_CANDIDATES, deadline)

  return {
    imageUrl,
    faviconUrl,
    imageWidth: imageUrl ? candidates.width ?? null : null,
    imageHeight: imageUrl ? candidates.height ?? null : null,
  }
}

async function firstReachable(candidates: string[], limit: number, deadline: number) {
  for (const candidate of candidates.slice(0, limit)) {
    try {
      if (await probeImage(new URL(candidate), deadline)) return candidate
    } catch {
      // A malformed candidate is skipped like an unreachable one.
    }
  }
  return null
}

type PageImages = {
  og: string[]
  icons: string[]
  width?: number
  height?: number
}

async function fetchPage(start: URL, deadline: number) {
  return follow(
    start,
    {
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/html,application/xhtml+xml',
      },
    },
    {
      deadline,
      timeoutMs: PAGE_TIMEOUT_MS,
      consume: async (response, url) => {
        if (!response.ok) return null
        const type = response.headers.get('content-type')?.toLowerCase() ?? ''
        if (!type.includes('text/html') && !type.includes('application/xhtml')) return null
        const html = await readCapped(response, MAX_PAGE_BYTES)
        return { html, url }
      },
    },
  )
}

/** Asks the image host for its headers, then drops the body unread. */
async function probeImage(url: URL, deadline: number) {
  return follow(
    url,
    {
      headers: {
        'user-agent': USER_AGENT,
        accept: 'image/*',
        range: 'bytes=0-0',
      },
    },
    {
      deadline,
      timeoutMs: PROBE_TIMEOUT_MS,
      consume: async (response) => {
        const type = response.headers.get('content-type')?.toLowerCase() ?? ''
        const looksLikeImage =
          type.startsWith('image/') ||
          /\.(?:ico|png|jpe?g|gif|webp|avif|svg)$/i.test(url.pathname)
        const ok = (response.ok || response.status === 206) && looksLikeImage
        await response.body?.cancel().catch(() => {})
        return ok ? true : null
      },
    },
  )
}

type FollowOptions<T> = {
  deadline: number
  timeoutMs: number
  consume: (response: Response, url: URL) => Promise<T | null>
}

/**
 * One guarded request. Redirects are followed here rather than by `fetch`, so
 * every hop passes the same host check before it is opened.
 */
async function follow<T>(start: URL, init: RequestInit, options: FollowOptions<T>): Promise<T | null> {
  let current = start

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const remaining = options.deadline - Date.now()
    if (remaining <= 0) return null

    await assertPublicHost(current.hostname)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), Math.min(options.timeoutMs, remaining))

    try {
      const response = await fetch(current, { ...init, redirect: 'manual', signal: controller.signal })

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        await response.body?.cancel().catch(() => {})
        if (!location) return null

        const next = new URL(location, current)
        if (next.protocol !== 'http:' && next.protocol !== 'https:') return null
        if (next.username || next.password) return null
        current = next
        continue
      }

      return await options.consume(response, current)
    } finally {
      clearTimeout(timer)
    }
  }

  return null
}

async function readCapped(response: Response, limit: number) {
  if (!response.body) return ''

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let total = 0
  let text = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue
    total += value.byteLength
    text += decoder.decode(value, { stream: true })
    if (total >= limit) {
      await reader.cancel().catch(() => {})
      break
    }
  }

  return text + decoder.decode()
}

/**
 * A hostname is allowed only when it is a name or address on the public
 * internet. The check runs on the name and on everything DNS returns for it,
 * so a public name pointing at a private address is still refused.
 */
async function assertPublicHost(rawHostname: string) {
  const hostname = rawHostname.toLowerCase().replace(/^\[|\]$/g, '')

  if (!hostname) throw new Error('Blocked address')
  if (
    hostname === 'localhost' ||
    hostname === 'metadata' ||
    hostname === 'metadata.google.internal' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error('Blocked address')
  }

  // `2130706433` and `0x7f000001` are loopback in disguise; `fetch` would
  // still open them, so numeric hostnames are refused outright.
  if (/^(?:\d+|0x[0-9a-f]+)$/i.test(hostname)) throw new Error('Blocked address')

  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) throw new Error('Blocked address')
    return
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true })
  if (addresses.length === 0) throw new Error('Unresolvable host')
  if (addresses.some((entry) => isPrivateAddress(entry.address))) throw new Error('Blocked address')
}

function isPrivateAddress(address: string) {
  const version = isIP(address)
  if (version === 4) return isPrivateIpv4(address)
  if (version === 6) return isPrivateIpv6(address)
  return true
}

function isPrivateIpv4(address: string) {
  const parts = address.split('.').map(Number)
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true
  }

  const [a, b] = parts as [number, number, number, number]
  if (a === 0 || a === 10 || a === 127) return true
  if (a === 100 && b >= 64 && b <= 127) return true // carrier-grade NAT
  if (a === 169 && b === 254) return true // link-local
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && (b === 0 || b === 168)) return true
  if (a === 198 && (b === 18 || b === 19)) return true // benchmarking
  if (a === 198 && b === 51) return true // documentation
  if (a === 203 && b === 0) return true // documentation
  if (a >= 224) return true // multicast and reserved
  return false
}

function isPrivateIpv6(address: string) {
  const value = address.toLowerCase().split('%')[0] ?? ''
  if (value === '::' || value === '::1') return true

  if (value.startsWith('::ffff:')) {
    const mapped = value.slice('::ffff:'.length)
    return isIP(mapped) === 4 ? isPrivateIpv4(mapped) : true
  }

  const head = Number.parseInt(value.split(':')[0] ?? '0', 16)
  if (!Number.isFinite(head)) return true
  if ((head & 0xfe00) === 0xfc00) return true // unique local
  if ((head & 0xffc0) === 0xfe80) return true // link-local
  if ((head & 0xff00) === 0xff00) return true // multicast
  if (value.startsWith('2001:db8')) return true // documentation
  return false
}

/** Reads the image candidates out of a page without a full HTML parser. */
function readPageImages(html: string, base: URL): PageImages {
  const og: string[] = []
  const icons: { href: string; weight: number }[] = []
  let width: number | undefined
  let height: number | undefined

  for (const attributes of readTags(html, 'meta')) {
    const key = (
      attributes.get('property') ??
      attributes.get('name') ??
      attributes.get('itemprop') ??
      ''
    ).toLowerCase()
    const content = attributes.get('content') ?? ''
    if (!content) continue

    if (
      key === 'og:image' ||
      key === 'og:image:url' ||
      key === 'og:image:secure_url' ||
      key === 'twitter:image' ||
      key === 'twitter:image:src'
    ) {
      const resolved = resolveCandidate(content, base)
      if (resolved) og.push(resolved)
    } else if (key === 'og:image:width') {
      width = readDimension(content)
    } else if (key === 'og:image:height') {
      height = readDimension(content)
    }
  }

  for (const attributes of readTags(html, 'link')) {
    const rel = (attributes.get('rel') ?? '').toLowerCase()
    if (!/(^|\s)(icon|shortcut|apple-touch-icon|apple-touch-icon-precomposed|mask-icon)(\s|$)/.test(rel)) {
      continue
    }
    const href = attributes.get('href')
    if (!href) continue
    const resolved = resolveCandidate(href, base)
    if (!resolved) continue

    const declared = Number.parseInt(attributes.get('sizes') ?? '', 10)
    const weight = Number.isFinite(declared)
      ? declared
      : rel.includes('apple-touch-icon')
        ? 180
        : 0
    icons.push({ href: resolved, weight })
  }

  icons.sort((a, b) => b.weight - a.weight)

  return {
    og: [...new Set(og)],
    icons: [...new Set(icons.map((icon) => icon.href))],
    width,
    height,
  }
}

function readTags(html: string, name: string) {
  const tags = html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) ?? []
  return tags.map(readAttributes)
}

function readAttributes(tag: string) {
  const attributes = new Map<string, string>()
  const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g

  for (const match of tag.matchAll(pattern)) {
    const key = match[1]?.toLowerCase()
    if (!key || attributes.has(key)) continue
    const value = match[2] ?? match[3] ?? match[4] ?? ''
    attributes.set(key, decodeEntities(value).trim())
  }

  return attributes
}

function resolveCandidate(raw: string, base: URL) {
  const value = raw.trim()
  if (!value || value.startsWith('data:')) return null

  try {
    const url = new URL(value, base)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (url.username || url.password) return null
    // A picture loaded over http would be blocked on an https page, so a page
    // served over https promotes its candidates and lets the probe decide.
    if (base.protocol === 'https:' && url.protocol === 'http:') url.protocol = 'https:'
    return url.toString()
  } catch {
    return null
  }
}

function readDimension(value: string) {
  const size = Number.parseInt(value, 10)
  return Number.isFinite(size) && size > 0 && size <= 10_000 ? size : undefined
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => codePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal: string) => codePoint(Number.parseInt(decimal, 10)))
}

function codePoint(value: number) {
  if (!Number.isFinite(value) || value <= 0 || value > 0x10ffff) return ''
  return String.fromCodePoint(value)
}
