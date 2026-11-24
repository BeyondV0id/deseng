import type { ReactNode } from 'react'
import { Hazeglow, parseConfig } from 'hazeglow'

const backdrop = parseConfig({
  version: 1,
  seed: 1081593680,
  shape: 'pill',
  center: [0.42, 0.52],
  size: [1.32, 0.78],
  roundness: 0.82,
  softness: 0.58,
  rotation: 0,
  rampDirection: 0.63,
  angle: 176,
  warp: 0.73,
  warpScale: 0.6,
  palette: ['#ff4fc4', '#ff9a2a', '#f23fe2', '#7a2be0', '#2a0f6a'],
  background: '#000000',
  mesh: [],
  grain: 0.34,
  motion: 'drift',
  speed: 0.5,
  loop: 9.5,
  hover: 0.45,
  hoverMode: 'pull',
  effect: 'dither',
  effectSize: 3,
  effectAmount: 0.55,
})

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
    <div className="explore-hero-backdrop" aria-hidden="true">
      <Hazeglow config={backdrop} />
    </div>
    <h1 className="explore-hero-title">{heading}</h1>
    {subheading && <p className="explore-hero-description">{subheading}</p>}
    <div className="explore-hero-search">{search}</div>
  </header>
}
