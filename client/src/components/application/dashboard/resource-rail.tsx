import { useId } from 'react'
import { ArrowRight } from '@/components/icons'
import { Button } from '@/components/arc/button/button'
import type { Resource } from '@/catalog'
import type { LibraryMoodboard } from '@/lib/library-types'
import { ResourceCard } from './resource-card'

type ResourceRailProps = {
  /** The row's accessible name: what this shelf holds. */
  label: string
  /** The category the row shows, printed above the track. */
  heading?: string
  /** Opens the tag page holding every card in this row. */
  onSeeMore?: () => void
  resources: Resource[]
  moodboards: LibraryMoodboard[]
  signedIn: boolean
  onRequireAccount: () => void
  onFavorite: (id: string) => void
  onFile: (id: string, moodboardId: string) => void
  onNewMoodboard: () => void
}

/**
 * One band of the landing page: a tag's name, its cards, and the way to the
 * rest of them.
 *
 * The track is a row, not a grid, so a card keeps its size and the band never
 * wraps: a trackpad or a finger can nudge it sideways, and any card a keyboard
 * reaches scrolls into view. The row's one control is `See more`, which opens
 * the tag page holding every entry filed under it; the band itself is a
 * preview, not a second place to browse the whole category.
 */
export function ResourceRail({ label, heading, onSeeMore, resources, ...handlers }: ResourceRailProps) {
  const headingId = useId()

  return <section className="resource-rail" aria-labelledby={headingId}>
    <div className="rail-header">
      <h2 className="rail-title" id={headingId}>{heading ?? label}</h2>
      {onSeeMore && <Button
        variant="ghost"
        size="sm"
        className="rail-see-more"
        onClick={onSeeMore}
        aria-label={`See every resource in ${label}`}
      >See more <ArrowRight size={14} /></Button>}
    </div>
    <div className="rail-track">
      {resources.map((resource, index) => <ResourceCard
        key={resource.id}
        resource={resource}
        index={index}
        {...handlers}
      />)}
    </div>
  </section>
}
