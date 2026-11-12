import { useEffect, useMemo, useState } from 'react'
import { Folder, Heart, MoreHorizontal, Pen, Plus, Search, Trash } from '@/components/icons'
import { Button } from '@/components/arc/button/button'
import { EmptyState } from '@/components/arc/empty-state/empty-state'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/arc/popover/popover'
import { categoryFromView, collectionById, collectionForCategory } from '@/catalog'
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
  /** Walks up from a tag page to the shelf that holds it. */
  onOpenShelf: (view: string) => void
  /** The empty moodboard's one action: back to the catalogue. */
  onExplore: () => void
  /** Renaming and deleting are available from the moodboard itself, not from an overflow on its card. */
  onEditMoodboard?: (moodboard: LibraryMoodboard) => void
  onDeleteMoodboard?: () => void
}

export function ResourceList({ heading, subheading, resources, view, moodboards, signedIn, onRequireAccount, onFavorite, onFile, onNewMoodboard, onAddResource, onOpenShelf, onExplore, onEditMoodboard, onDeleteMoodboard }: ResourceListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [moodboardMenuOpen, setMoodboardMenuOpen] = useState(false)
  const handlers = { moodboards, signedIn, onRequireAccount, onFavorite, onFile, onNewMoodboard }

  /** A shelf gathers several categories, so the tag strip is what splits it. */
  const collection = collectionById(view)
  const categories = useMemo(
    () => collection ? collection.categories.filter(category => resources.some(resource => resource.category === category)) : [],
    [collection, resources],
  )

  // A tag page is one category of a shelf, so it carries the way back up to it.
  const tag = categoryFromView(view)
  const shelf = tag !== null ? collectionForCategory(tag) : undefined
  const back = shelf ? { label: shelf.label, onClick: () => onOpenShelf(shelf.id) } : undefined

  // A shelf change starts on the whole shelf, never on the last tag read.
  useEffect(() => { setActiveCategory(null) }, [view])

  // A search can empty the chosen category. The shelf then shows everything it
  // has left rather than a tag that no longer exists and a grid with nothing.
  const active = activeCategory !== null && categories.includes(activeCategory) ? activeCategory : null
  const visible = active ? resources.filter(resource => resource.category === active) : resources

  // The moodboard's own actions, kept off its card: the card is a target, the
  // page it opens is where the moodboard can be renamed or removed.
  const currentMoodboard = moodboards.find(moodboard => moodboard.id === view)
  const moodboardMenu = currentMoodboard && (onEditMoodboard || onDeleteMoodboard)
    ? <Popover open={moodboardMenuOpen} onOpenChange={setMoodboardMenuOpen}>
      <PopoverTrigger className="moodboard-menu-trigger" aria-label={`Actions for ${currentMoodboard.name}`}>
        <MoreHorizontal size={18} />
      </PopoverTrigger>
      <PopoverContent className="resource-moodboard-popover moodboard-menu" align="end" sideOffset={6}>
        {onEditMoodboard && <button type="button" onClick={() => { setMoodboardMenuOpen(false); onEditMoodboard(currentMoodboard) }}>
          <Pen size={15} />
          <span>Edit moodboard</span>
        </button>}
        {onDeleteMoodboard && <button type="button" className="is-danger" onClick={() => { setMoodboardMenuOpen(false); onDeleteMoodboard() }}>
          <Trash size={15} />
          <span>Delete moodboard</span>
        </button>}
      </PopoverContent>
    </Popover>
    : undefined

  if (resources.length > 0) {
    return <section className="resource-library" aria-label="Resources">
      <ResourceSectionHeader
        heading={heading}
        subheading={subheading}
        back={back}
        actions={moodboardMenu}
        categories={categories}
        activeCategory={active}
        onCategoryChange={setActiveCategory}
      />
      <ResourceGrid resources={visible} {...handlers} />
    </section>
  }

  const isFavorites = view === 'Favorites'
  const isMoodboard = Boolean(currentMoodboard)
  const empty = isMoodboard
    ? {
      title: 'This moodboard is empty',
      description: 'Save websites, tools and resources here with “Add to moodboard” on any listing.',
      icon: <Folder size={22} />,
      action: <Button variant="primary" size="sm" onClick={onExplore}>Explore</Button>,
    }
    : isFavorites
      ? {
        title: 'Nothing saved as a favorite',
        description: 'Tap the heart on anything you want to find quickly.',
        icon: <Heart size={22} />,
        action: undefined,
      }
      : {
        title: 'This shelf is ready for something',
        description: 'Add a resource or save one from the directory.',
        icon: <Search size={22} />,
        action: <Button variant="primary" size="sm" onClick={onAddResource}><Plus size={15} /> Add a resource</Button>,
      }

  return <section className="resource-library" aria-label="Resources">
    <ResourceSectionHeader heading={heading} subheading={subheading} back={back} actions={moodboardMenu} />
    <EmptyState
      title={empty.title}
      description={empty.description}
      icon={empty.icon}
      action={empty.action}
    />
  </section>
}
