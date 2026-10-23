import { TextMorph } from 'torph/react'
import { Button } from '@/components/arc/button/button'

type ResourceSectionHeaderProps = {
  heading: string
  subheading: string
  categories: string[]
  activeCategory: string | null
  onCategoryChange: (category: string) => void
}

export function ResourceSectionHeader({ heading, subheading, categories, activeCategory, onCategoryChange }: ResourceSectionHeaderProps) {
  return <header className="resource-section-header">
    <h1><TextMorph as="span" className="heading-morph" duration={240} ease="cubic-bezier(0.19, 1, 0.22, 1)">{heading}</TextMorph></h1>
    <p className="page-description">{subheading}</p>
    {categories.length > 0 && <div className="resource-tags" aria-label="Filter resources by category">
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
