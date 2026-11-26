import { useEffect } from 'react'
import { publicRobots, socialImage } from '@/lib/site-brand'

type PageMeta = {
  title: string
  description: string
  /** The address of the page, from the router. Defaults to `/`. */
  path?: string
  image?: string
  /** Mark the page out of the index. Account-only views, never the shelves. */
  noindex?: boolean
}

type Snapshot = {
  title: string
  description: string | null
  canonical: string | null
  robots: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogUrl: string | null
  ogImage: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
}

/**
 * The shell the static `index.html` paints first, captured on the first call.
 * The hook writes over it and hands it back on unmount, so a client-only
 * render (or a test) never leaks route-specific metadata into the next one.
 */
let defaults: Snapshot | null = null

function captureDefaults(): Snapshot {
  if (defaults) return defaults
  const read = (attribute: 'name' | 'property', key: string) =>
    document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)?.getAttribute('content') ?? null
  const url = (key: 'canonical') =>
    document.head.querySelector<HTMLLinkElement>(`link[rel="${key}"]`)?.getAttribute('href') ?? null
  defaults = {
    title: document.title,
    description: read('name', 'description'),
    canonical: url('canonical'),
    robots: read('name', 'robots'),
    ogTitle: read('property', 'og:title'),
    ogDescription: read('property', 'og:description'),
    ogUrl: read('property', 'og:url'),
    ogImage: read('property', 'og:image'),
    twitterTitle: read('name', 'twitter:title'),
    twitterDescription: read('name', 'twitter:description'),
    twitterImage: read('name', 'twitter:image'),
  }
  return defaults
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let node = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!node) {
    node = document.createElement('meta')
    node.setAttribute(attribute, key)
    document.head.appendChild(node)
  }
  node.setAttribute('content', content)
}

function upsertCanonical(url: string) {
  let node = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!node) {
    node = document.createElement('link')
    node.rel = 'canonical'
    document.head.appendChild(node)
  }
  node.href = url
}

function restoreMeta(attribute: 'name' | 'property', key: string, content: string | null) {
  if (content === null) {
    document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)?.remove()
    return
  }
  upsertMeta(attribute, key, content)
}

function restoreCanonical(href: string | null) {
  if (href === null) {
    document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.remove()
    return
  }
  upsertCanonical(href)
}

/**
 * Keeps the document's metadata in step with the page on screen.
 *
 * The shell is one document, so the catalogue, a shelf, a tag and the info page
 * all share the tags `index.html` paints first. A route that is more specific
 * than the home page says so here instead of leaving the browser tab and a
 * shared link reading the catalogue's title. On unmount (and on every route
 * change, one tick later) the values the static page shipped with are handed
 * back, so nothing leaks across routes.
 */
export function usePageMeta({ title, description, path = '/', image = socialImage, noindex = false }: PageMeta) {
  useEffect(() => {
    if (typeof document === 'undefined') return
    const fallback = captureDefaults()
    const siteOrigin = import.meta.env.VITE_SITE_ORIGIN || window.location.origin
    const url = new URL(path, siteOrigin).href
    const imageUrl = new URL(image, siteOrigin).href

    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', imageUrl)
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', imageUrl)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : publicRobots)
    if (noindex) restoreCanonical(null)
    else upsertCanonical(url)

    return () => {
      document.title = fallback.title
      restoreMeta('name', 'description', fallback.description)
      restoreMeta('property', 'og:title', fallback.ogTitle)
      restoreMeta('property', 'og:description', fallback.ogDescription)
      restoreMeta('property', 'og:url', fallback.ogUrl)
      restoreMeta('property', 'og:image', fallback.ogImage)
      restoreMeta('name', 'twitter:title', fallback.twitterTitle)
      restoreMeta('name', 'twitter:description', fallback.twitterDescription)
      restoreMeta('name', 'twitter:image', fallback.twitterImage)
      restoreMeta('name', 'robots', fallback.robots)
      restoreCanonical(fallback.canonical)
    }
  }, [title, description, path, image, noindex])
}
