import { useEffect } from 'react'

/** The one origin the public metadata is written against. */
export const siteUrl = 'https://desgnix.app'

/** The image every page shares unless it passes its own. */
export const socialImage = `${siteUrl}/preview.png`

type PageSeo = {
  title: string
  description: string
  /** The address of the page, from the router. Defaults to `/`. */
  path?: string
  image?: string
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

/**
 * Keeps the document's metadata in step with the page on screen.
 *
 * The shell is one document, so the catalogue, a shelf, a tag and the info page
 * all share the tags `index.html` paints first. A route that is more specific
 * than the home page says so here instead of leaving the browser tab and a
 * shared link reading the catalogue's title.
 */
export function usePageSeo({ title, description, path = '/', image = socialImage }: PageSeo) {
  useEffect(() => {
    const url = `${siteUrl}${path === '/' ? '/' : path}`

    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', image)
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', image)
    upsertCanonical(url)
  }, [title, description, path, image])
}
