import { useMemo } from 'react'
import { ArrowRight, ArrowUpRight } from '@/components/icons'
import { Button } from '@/components/arc/button/button'
import { SearchField } from '@/components/arc/search-field/search-field'
import { collectionById, type Resource } from '@/catalog'
import type { LibraryMoodboard } from '@/lib/library-types'
import { ResourceGrid } from './resource-grid'

/** The shelves the Explore page points at. Each one shows a row of six. */
const discovery = [
  { id: 'tools', title: 'Discover tools', collection: 'Tools' },
  { id: 'ui', title: 'Discover UI kits', collection: 'UI' },
  { id: 'inspiration', title: 'Discover inspiration', collection: 'Design Inspiration' },
  { id: 'graphics', title: 'Discover graphics', collection: 'Graphics' },
  { id: 'fonts', title: 'Discover fonts', collection: 'Fonts' },
]

const ROW_SIZE = 6

type ExplorePageProps = {
  resources: Resource[]
  moodboards: LibraryMoodboard[]
  query: string
  onQueryChange: (query: string) => void
  onSelectCollection: (id: string) => void
  onFavorite: (id: string) => void
  onMoodboard: (id: string, moodboardId: string) => void
  onOpenResource: (resource: Resource) => void
}

/**
 * The Explore page. The search is the hero, and the shelves sit under it.
 * Each shelf shows six things in the same grid, and the same card, the
 * library uses. The card opens the resource, the shelf link goes to the
 * whole shelf in the sidebar.
 */
export function ExplorePage({ resources, moodboards, query, onQueryChange, onSelectCollection, onFavorite, onMoodboard, onOpenResource }: ExplorePageProps) {
  const trimmed = query.trim().toLowerCase()

  const matches = useMemo(() => {
    if (!trimmed) return []
    return resources.filter(resource => [resource.name, resource.url, resource.description, resource.category]
      .some(value => value.toLowerCase().includes(trimmed)))
  }, [resources, trimmed])

  const rows = useMemo(() => discovery.map(section => {
    const collection = collectionById(section.collection)
    const items = collection
      ? resources.filter(resource => collection.categories.includes(resource.category)).slice(0, ROW_SIZE)
      : []
    return { ...section, items }
  }).filter(row => row.items.length > 0), [resources])

  return <section className="explore" aria-label="Explore the library">
    <header className="explore-hero">
      <h1>What are you building?</h1>
      <p className="page-description">A curated collection of interfaces, interactions and details that caught our eye.</p>
      <form className="explore-search" role="search" onSubmit={event => event.preventDefault()}>
        <SearchField label="Search the library" value={query} onValueChange={onQueryChange} placeholder="A landing page, an icon set, a colour palette" />
        <Button type="submit" size="lg" className="explore-search-go" aria-label="Search"><ArrowRight size={20} /></Button>
      </form>
    </header>

    {trimmed ? (
      <div className="explore-results">
        <h2 className="explore-results-title">{matches.length} {matches.length === 1 ? 'result' : 'results'}</h2>
        {matches.length > 0
          ? <ResourceGrid resources={matches} moodboards={moodboards} onFavorite={onFavorite} onMoodboard={onMoodboard} onOpenResource={onOpenResource} />
          : <p className="explore-empty">Nothing matches “{query.trim()}”. Try a tool, a component, an icon set or a colour.</p>}
      </div>
    ) : rows.map(row => <section key={row.id} className="explore-section">
      <header className="explore-section-head">
        <h2>{row.title}</h2>
        <Button variant="ghost" size="sm" className="explore-section-more" onClick={() => onSelectCollection(row.collection)}>
          See all<ArrowUpRight size={15} />
        </Button>
      </header>
      <div className="explore-cards">
        <ResourceGrid resources={row.items} moodboards={moodboards} onFavorite={onFavorite} onMoodboard={onMoodboard} onOpenResource={onOpenResource} />
      </div>
    </section>)}
  </section>
}
