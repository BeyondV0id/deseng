import { TextMorph } from 'torph/react'
import { ArrowLeft } from '@/components/icons'
import { Button } from '@/components/arc/button/button'

type ResourceSectionHeaderProps = {
  heading: string
  subheading: string
  /** A quieter second line under the description, for counts and other metadata. */
  meta?: string
  /**
   * A page can sit one level under something else: a tag page belongs to a
   * shelf. This is the way back up, and it names where it goes.
   */
  back?: { label: string; onClick: () => void }
  /**
   * The catalogue is still on its way. The meta line is drawn as a skeleton in
   * the same slot, so the count that replaces it lands on the same line instead
   * of pushing everything under the header down. `meta` is then the line the
   * screen reader is given, since the bar has nothing to read.
   */
  loading?: boolean
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
  back,
  loading = false,
  categories = [],
  activeCategory = null,
  onCategoryChange,
}: ResourceSectionHeaderProps) {
  const tagged = categories.length > 1 && onCategoryChange !== undefined

  return <header className="resource-section-header">
    {back && <Button
      variant="ghost"
      size="sm"
      className="resource-back"
      aria-label={`Back to ${back.label}`}
      onClick={back.onClick}
    >
      <ArrowLeft size={17} aria-hidden="true" />
    </Button>}
    <div className="resource-section-title">
      <h1><TextMorph as="span" className="heading-morph" duration={240} ease="cubic-bezier(0.19, 1, 0.22, 1)">{heading}</TextMorph></h1>
      {subheading && <p className="page-description">{subheading}</p>}
      {loading
        ? <p className="page-description-meta is-loading" role="status">
          <span className="catalog-skeleton-meta-line" aria-hidden="true" />
          <span className="sr-only">{meta}</span>
        </p>
        : meta && <p className="page-description-meta">{meta}</p>}
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
