import { collections, type Resource } from '@/catalog'
import type { LibraryMoodboard } from '@/lib/library-types'

/**
 * The size of every set the library can open: the whole catalogue, each shelf,
 * and each moodboard. A count is the size of the set itself, never what the
 * current search leaves of it, so a shelf reads the same whether or not the
 * field above is full.
 */
export function countResources(resources: Resource[], moodboards: LibraryMoodboard[]) {
  const counts = new Map<string, number>([['All resources', resources.length]])
  for (const collection of collections) {
    counts.set(
      collection.id,
      resources.filter((resource) => collection.categories.includes(resource.category)).length,
    )
  }
  for (const moodboard of moodboards) {
    counts.set(
      moodboard.id,
      resources.filter((resource) => resource.moodboardId === moodboard.id).length,
    )
  }
  return counts
}

/** What the row is called to a screen reader. The count itself is decoration,
 *  so the size of the set belongs in the row's own accessible name. */
export function countLabel(count: number) {
  return `${count} ${count === 1 ? 'item' : 'items'}`
}
