import { useMemo } from 'react'
import { Search } from '@/components/icons'
import { EmptyState } from '@/components/arc/empty-state/empty-state'
import { categories } from '@/catalog'
import type { Resource } from '@/catalog'
import type { LibraryMoodboard } from '@/lib/library-types'
import { LIBRARY_HEADING, LIBRARY_SUBHEADING, libraryMeta } from './library-copy'
import { ResourceRail } from './resource-rail'
import { ResourceSectionHeader } from './resource-section-header'

type ExplorePageProps = {
  resources: Resource[]
  /** Every entry in the library, so the count can say how much a search leaves. */
  total: number
  query: string
  moodboards: LibraryMoodboard[]
  signedIn: boolean
  onRequireAccount: () => void
  onFavorite: (id: string) => void
  onFile: (id: string, moodboardId: string) => void
  onNewMoodboard: () => void
  /** Opens the page holding every entry filed under one tag. */
  onOpenCategory: (category: string) => void
}

/** The landing line: what the catalogue is, what it holds, and how it is ordered. */
function describeLibrary(total: number, shown: number, query: string) {
  return {
    subheading: LIBRARY_SUBHEADING,
    meta: libraryMeta(total, shown, query),
  }
}

/**
 * The landing surface: one line of heading, then the catalogue split into a
 * row per category. Each row walks sideways and ends in `See more`, which is
 * the way to the tag page holding every entry filed under it.
 */
export function ExplorePage({ resources, total, query, moodboards, signedIn, onRequireAccount, onFavorite, onFile, onNewMoodboard, onOpenCategory }: ExplorePageProps) {
  const intro = describeLibrary(total, resources.length, query)

  // The rows follow the taxonomy's own order. A category the catalogue has not
  // named yet still gets a row, at the end, so a new tag is never invisible.
  const groups = useMemo(() => {
    const known = categories
    const extra = [...new Set(resources.map(resource => resource.category))].filter(category => !known.includes(category))
    return [...known, ...extra]
      .map(category => ({ category, resources: resources.filter(resource => resource.category === category) }))
      .filter(group => group.resources.length > 0)
  }, [resources])

  return <section className="resource-library" aria-label="Resources">
    <ResourceSectionHeader
      heading={LIBRARY_HEADING}
      subheading={intro.subheading}
      meta={intro.meta}
    />
    {groups.length > 0
      ? <div className="resource-rows">
        {groups.map(group => <ResourceRail
          key={group.category}
          label={group.category}
          heading={group.category}
          onSeeMore={() => onOpenCategory(group.category)}
          resources={group.resources}
          moodboards={moodboards}
          signedIn={signedIn}
          onRequireAccount={onRequireAccount}
          onFavorite={onFavorite}
          onFile={onFile}
          onNewMoodboard={onNewMoodboard}
        />)}
      </div>
      : <EmptyState
        title={query.trim() ? `Nothing matches “${query.trim()}”` : 'This shelf is ready for something'}
        description={query.trim() ? 'Try a tool, a component, an icon set or a colour.' : 'Add a resource or save one from the directory.'}
        icon={<Search size={22} />}
      />}
  </section>
}
