import { useEffect, useMemo, useState } from 'react'
import { Heart, Plus, Search } from '@/components/icons'
import { Button } from '@/components/arc/button/button'
import { EmptyState } from '@/components/arc/empty-state/empty-state'
import { collectionById } from '@/catalog'
import type { Resource } from '@/catalog'
import type { LibraryMoodboard } from '@/lib/library-types'
import { ResourceGrid } from './resource-grid'
import { ResourceSectionHeader } from './resource-section-header'

type ResourceListProps = {
  heading: string
  subheading: string
  resources: Resource[]
  view: string
  moodboards: LibraryMoodboard[]
  signedIn: boolean
  onRequireAccount: () => void
  onFavorite: (id: string) => void
  onFile: (id: string, moodboardId: string) => void
  onNewMoodboard: () => void
  onAddResource: () => void
}

export function ResourceList({ heading, subheading, resources, view, moodboards, signedIn, onRequireAccount, onFavorite, onFile, onNewMoodboard, onAddResource }: ResourceListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const handlers = { moodboards, signedIn, onRequireAccount, onFavorite, onFile, onNewMoodboard }

  /** A shelf gathers several categories, so the tag strip is what splits it. */
  const collection = collectionById(view)
  const categories = useMemo(
    () => collection ? collection.categories.filter(category => resources.some(resource => resource.category === category)) : [],
    [collection, resources],
  )

  // A shelf change starts on the whole shelf, never on the last tag read.
  useEffect(() => { setActiveCategory(null) }, [view])

  // A search can empty the chosen category. The shelf then shows everything it
  // has left rather than a tag that no longer exists and a grid with nothing.
  const active = activeCategory !== null && categories.includes(activeCategory) ? activeCategory : null
  const visible = active ? resources.filter(resource => resource.category === active) : resources

  if (resources.length > 0) {
    return <section className="resource-library" aria-label="Resources">
      <ResourceSectionHeader
        heading={heading}
        subheading={subheading}
        categories={categories}
        activeCategory={active}
        onCategoryChange={setActiveCategory}
      />
      <ResourceGrid resources={visible} {...handlers} />
    </section>
  }

  const isFavorites = view === 'Favorites'
  return <section className="resource-library" aria-label="Resources">
    <ResourceSectionHeader heading={heading} subheading={subheading} />
    <EmptyState
      title={isFavorites ? 'Nothing saved as a favorite' : 'This shelf is ready for something'}
      description={isFavorites ? 'Tap the heart on anything you want to find quickly.' : 'Add a resource or save one from the directory.'}
      icon={isFavorites ? <Heart size={22} /> : <Search size={22} />}
      action={!isFavorites ? <Button variant="primary" size="sm" onClick={onAddResource}><Plus size={15} /> Add a resource</Button> : undefined}
    />
  </section>
}
