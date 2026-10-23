import { useEffect, useState } from 'react'
import { Heart, Plus, Search } from '@/components/icons'
import { Button } from '@/components/arc/button/button'
import { EmptyState } from '@/components/arc/empty-state/empty-state'
import type { LibraryMoodboard } from '@/lib/library-types'
import { collectionById, type Resource } from '@/catalog'
import { ResourceGrid } from './resource-grid'
import { ResourceSectionHeader } from './resource-section-header'

type ResourceListProps = {
  heading: string
  subheading: string
  resources: Resource[]
  moodboards: LibraryMoodboard[]
  view: string
  onFavorite: (id: string) => void
  onMoodboard: (id: string, moodboardId: string) => void
  onAddResource: () => void
  onOpenResource: (resource: Resource) => void
}

export function ResourceList({ heading, subheading, resources, moodboards, view, onFavorite, onMoodboard, onAddResource, onOpenResource }: ResourceListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  /** A shelf that gathers several categories gets a tag strip to split them. */
  const collection = collectionById(view)
  const showCategoryTags = (collection?.categories.length ?? 0) > 1
  const categoryTags = [...new Set(resources.map(resource => resource.category))]
  const visibleResources = showCategoryTags && activeCategory
    ? resources.filter(resource => resource.category === activeCategory)
    : resources

  useEffect(() => {
    if (!showCategoryTags) setActiveCategory(null)
  }, [showCategoryTags])

  if (resources.length > 0) {
    return <section className="resource-library" aria-label="Resources">
      <ResourceSectionHeader heading={heading} subheading={subheading} categories={showCategoryTags ? categoryTags : []} activeCategory={activeCategory} onCategoryChange={category => setActiveCategory(current => current === category ? null : category)} />
      {visibleResources.length > 0
        ? <ResourceGrid resources={visibleResources} moodboards={moodboards} onFavorite={onFavorite} onMoodboard={onMoodboard} onOpenResource={onOpenResource} />
        : <EmptyState
          title={`No resources in ${activeCategory}`}
          description="Choose another category to explore the collection."
          icon={<Search size={22} />}
        />}
    </section>
  }

  const isFavorites = view === 'Favorites'
  return <section className="resource-library" aria-label="Resources">
    <ResourceSectionHeader heading={heading} subheading={subheading} categories={[]} activeCategory={activeCategory} onCategoryChange={category => setActiveCategory(current => current === category ? null : category)} />
    <EmptyState
      title={isFavorites ? 'Nothing saved as a favorite' : 'This shelf is ready for something'}
      description={isFavorites ? 'Tap the heart on anything you want to find quickly.' : 'Add a resource or save one from the directory.'}
      icon={isFavorites ? <Heart size={22} /> : <Search size={22} />}
      action={!isFavorites ? <Button variant="primary" size="sm" onClick={onAddResource}><Plus size={15} /> Add a resource</Button> : undefined}
    />
  </section>
}
