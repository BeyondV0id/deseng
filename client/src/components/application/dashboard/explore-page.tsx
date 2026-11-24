import { useMemo } from 'react'
import { Search } from '@/components/icons'
import { EmptyState } from '@/components/arc/empty-state/empty-state'
import { FeaturedTools } from '@/components/ads/featured-tools'
import { categories, type Resource } from '@/catalog'
import type { LibraryMoodboard } from '@/lib/library-types'
import { LIBRARY_HEADING, LIBRARY_SUBHEADING } from './library-copy'
import { ExploreHero } from './explore-hero'
import { DiscoveryCollections } from './discovery-collections'
import { LatestAdditions } from './latest-additions'
import { ResourceRail } from './resource-rail'
import { SearchPalette } from './search-palette'

type ExplorePageProps = {
  resources: Resource[]
  /** The whole catalogue, so the hero's search reaches past the view on screen. */
  allResources: Resource[]
  query: string
  onQueryChange: (query: string) => void
  moodboards: LibraryMoodboard[]
  signedIn: boolean
  onRequireAccount: () => void
  onFavorite: (id: string) => void
  onFile: (id: string, moodboardId: string) => void
  onNewMoodboard: () => void
  onOpenCategory: (category: string) => void
}

/**
 * The catalogue, in its fixed tag order. Each tag gets one sideways band, and
 * the band's See more action opens the full grid for that tag.
 *
 * The page opens on the hero, which owns the search: this is the only view
 * where the field sits in the page rather than in the top bar.
 */
export function ExplorePage({
  resources,
  allResources,
  query,
  onQueryChange,
  moodboards,
  signedIn,
  onRequireAccount,
  onFavorite,
  onFile,
  onNewMoodboard,
  onOpenCategory,
}: ExplorePageProps) {
  const groups = useMemo(() => {
    const byCategory = new Map<string, Resource[]>()
    for (const resource of resources) {
      const items = byCategory.get(resource.category)
      if (items) items.push(resource)
      else byCategory.set(resource.category, [resource])
    }

    const known = new Set(categories)
    const extraCategories = [...byCategory.keys()].filter(category => !known.has(category))
    return [...categories, ...extraCategories]
      .map(category => ({ category, resources: byCategory.get(category) ?? [] }))
      .filter(group => group.resources.length > 0)
  }, [resources])

  const handlers = { moodboards, signedIn, onRequireAccount, onFavorite, onFile, onNewMoodboard }
  const searching = query.trim().length > 0

  return <section className="resource-library" aria-label="Resources">
    <ExploreHero
      heading={LIBRARY_HEADING}
      subheading={LIBRARY_SUBHEADING}
      search={<SearchPalette
        variant="hero"
        resources={allResources}
        query={query}
        onQueryChange={onQueryChange}
        onOpenTag={onOpenCategory}
      />}
    />

    {groups.length > 0
      ? <>
        {!searching && <FeaturedTools />}

        {!searching && <DiscoveryCollections resources={resources} {...handlers} />}

        <LatestAdditions resources={resources} />

        <div className="resource-rows">
          {groups.map(group => <ResourceRail
            key={group.category}
            label={group.category}
            onSeeMore={() => onOpenCategory(group.category)}
            resources={group.resources}
            {...handlers}
          />)}
        </div>
      </>
      : <EmptyState
        title={query.trim() ? `Nothing matches “${query.trim()}”` : 'This shelf is ready for something'}
        description={query.trim() ? 'Try a tool, a component, an icon set or a colour.' : 'Add a resource or save one from the directory.'}
        icon={<Search size={22} />}
      />}
  </section>
}
