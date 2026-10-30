import { categories, categoryFromView, categoryView, collectionForCategory, collections } from '@/catalog'

/**
 * The library's addresses.
 *
 * A view used to be a piece of state that only the page knew, so the column's
 * rows changed the grid without changing the address: a shelf could not be
 * linked, reloaded or opened in a second tab. Each view now has a path, and the
 * path is the state. `/` is the whole catalogue, `/build` a shelf (its slug is
 * the shelf's own name), one category of a shelf is the same path with
 * `?tag=<tag>`, and the account's own work is `/favorites` and `/moodboards`,
 * with one board under `/moodboards/<id>`. `/info` is the library's own page.
 */
export const allResources = 'All resources'
export const favorites = 'Favorites'
export const moodboardShelf = 'Moodboard'
export const infoView = 'Info'

/** The path segment for a name: lower case, words joined by one hyphen. */
export function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** The address a view lives at. Nav rows, cards and tag pages all read it. */
export function pathForView(view: string): string {
  if (view === allResources) return '/'
  if (view === favorites) return '/favorites'
  if (view === moodboardShelf) return '/moodboards'
  if (view === infoView) return '/info'

  const tag = categoryFromView(view)
  if (tag !== null) {
    const shelf = collectionForCategory(tag)?.id
    const query = `tag=${encodeURIComponent(slug(tag))}`
    return shelf ? `/${slug(shelf)}?${query}` : `/?${query}`
  }

  if (collections.some(collection => collection.id === view)) return `/${slug(view)}`

  // Anything left is one of the account's moodboards, addressed by its id.
  return `/moodboards/${encodeURIComponent(view)}`
}

/** The view an address holds, or null when nothing is filed there. */
export function viewForPath(pathname: string, search = ''): string | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/'

  // A tag is the query on top of the shelf it belongs to: `/build?tag=deploy`.
  const tagSlug = new URLSearchParams(search).get('tag')
  const tag = tagSlug ? categories.find(category => slug(category) === tagSlug) : undefined

  if (path === '/') return tag ? categoryView(tag) : allResources
  if (path === '/favorites') return favorites
  if (path === '/moodboards') return moodboardShelf
  if (path === '/info') return infoView

  const moodboard = /^\/moodboards\/([^/]+)$/.exec(path)
  if (moodboard?.[1]) return decodeURIComponent(moodboard[1])

  const shelf = /^\/([^/]+)$/.exec(path)
  if (!shelf?.[1]) return null
  const collection = collections.find(item => slug(item.id) === shelf[1])
  if (!collection) return null

  // Only a tag that lives on this shelf narrows it; any other tag is ignored
  // rather than opening a category the address does not name.
  return tag && collection.categories.includes(tag) ? categoryView(tag) : collection.id
}
