export type LinkMetadata = {
  title?: string
  description?: string
  siteName?: string
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  logoUrl?: string
}

type JsonRecord = Record<string, unknown>
const cachePrefix = 'desgnix-open-graph-v1:'
const requests = new Map<string, Promise<LinkMetadata | null>>()

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(record: JsonRecord, key: string): string | undefined {
  const value = record[key]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function readAsset(value: unknown): { url?: string; width?: number; height?: number } {
  if (typeof value === 'string') return { url: value }
  if (!isRecord(value)) return {}
  return {
    url: readString(value, 'url'),
    width: typeof value.width === 'number' ? value.width : undefined,
    height: typeof value.height === 'number' ? value.height : undefined,
  }
}

function parseMetadata(payload: unknown): LinkMetadata | null {
  if (!isRecord(payload) || payload.status !== 'success' || !isRecord(payload.data)) return null
  const data = payload.data
  const image = readAsset(data.image)
  const logo = readAsset(data.logo)
  const metadata: LinkMetadata = {
    title: readString(data, 'title'),
    description: readString(data, 'description'),
    siteName: readString(data, 'siteName') ?? readString(data, 'publisher'),
    imageUrl: image.url,
    imageWidth: image.width,
    imageHeight: image.height,
    logoUrl: logo.url,
  }
  return Object.values(metadata).some(Boolean) ? metadata : null
}

function parseCachedMetadata(value: unknown): LinkMetadata | null {
  if (!isRecord(value)) return null
  const metadata: LinkMetadata = {
    title: readString(value, 'title'),
    description: readString(value, 'description'),
    siteName: readString(value, 'siteName'),
    imageUrl: readString(value, 'imageUrl'),
    imageWidth: typeof value.imageWidth === 'number' ? value.imageWidth : undefined,
    imageHeight: typeof value.imageHeight === 'number' ? value.imageHeight : undefined,
    logoUrl: readString(value, 'logoUrl'),
  }
  return Object.values(metadata).some(Boolean) ? metadata : null
}

function readCache(url: string): LinkMetadata | null | undefined {
  try {
    const cached = localStorage.getItem(`${cachePrefix}${url}`)
    if (!cached) return undefined
    return parseCachedMetadata(JSON.parse(cached)) ?? undefined
  } catch {
    return undefined
  }
}

async function requestMetadata(url: string): Promise<LinkMetadata | null> {
  const apiUrl = new URL('https://api.microlink.io/')
  apiUrl.searchParams.set('url', url)
  const response = await fetch(apiUrl)
  if (!response.ok) return null
  const metadata = parseMetadata(await response.json())
  if (metadata) {
    try { localStorage.setItem(`${cachePrefix}${url}`, JSON.stringify(metadata)) } catch {}
  }
  return metadata
}

export function loadLinkMetadata(url: string): Promise<LinkMetadata | null> {
  const cached = readCache(url)
  if (cached !== undefined) return Promise.resolve(cached)
  const pending = requests.get(url)
  if (pending) return pending
  const request = requestMetadata(url).catch(() => null).finally(() => requests.delete(url))
  requests.set(url, request)
  return request
}
