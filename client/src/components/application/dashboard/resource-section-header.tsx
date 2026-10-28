import { TextMorph } from 'torph/react'
import { Button } from '@/components/arc/button/button'

type ResourceSectionHeaderProps = {
  heading: string
  subheading: string
  /** A quieter second line under the description, for counts and other metadata. */
  meta?: string
  /** The categories this shelf gathers. One tag per category, plus `All`. */
  categories?: string[]
  /** The category on screen, or `null` for the whole shelf. */
  activeCategory?: string | null
  onCategoryChange?: (category: string | null) => void
}

export function ResourceSectionHeader({
  heading,
  subheading,
  meta,
  categories = [],
  activeCategory = null,
  onCategoryChange,
}: ResourceSectionHeaderProps) {
  const tagged = categories.length > 1 && onCategoryChange !== undefined

  return <header className="resource-section-header">
    <div className="resource-section-title">
      <h1><TextMorph as="span" className="heading-morph" duration={240} ease="cubic-bezier(0.19, 1, 0.22, 1)">{heading}</TextMorph></h1>
      {subheading && <p className="page-description">{subheading}</p>}
      {meta && <p className="page-description-meta">{meta}</p>}
    </div>
    {/* The shelf's own split, as Arc buttons: one pill per category, with the
        whole shelf always one tap away. The strip scrolls sideways on a phone
        rather than wrapping into a second row of chrome. */}
    {tagged && <div className="resource-tags" role="group" aria-label="Filter by category">
      <Button
        variant={activeCategory === null ? 'primary' : 'secondary'}
        size="sm"
        aria-pressed={activeCategory === null}
        onClick={() => onCategoryChange(null)}
      >All</Button>
      {categories.map(category => <Button
        key={category}
        variant={activeCategory === category ? 'primary' : 'secondary'}
        size="sm"
        aria-pressed={activeCategory === category}
        onClick={() => onCategoryChange(category)}
      >{category}</Button>)}
    </div>}
  </header>
}
