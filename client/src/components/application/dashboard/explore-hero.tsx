import type { ReactNode } from 'react'

type ExploreHeroProps = {
  heading: string
  subheading: string
  /**
   * The search, centred under the description. On the catalogue's own page the
   * field lives here rather than in the top bar, so the page opens on the one
   * control it is for.
   */
  search: ReactNode
}

/**
 * The catalogue's opening: one centred column, the heading on balanced lines,
 * the description under it, and the search pill at the foot of the column.
 *
 * Everything is centred on the page's own axis, and the column is capped so the
 * description breaks on a comma rather than running the width of a wide screen.
 */
export function ExploreHero({ heading, subheading, search }: ExploreHeroProps) {
  return <header className="explore-hero">
    <h1 className="explore-hero-title">{heading}</h1>
    {subheading && <p className="explore-hero-description">{subheading}</p>}
    <div className="explore-hero-search">{search}</div>
  </header>
}
