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
  palette: ['#1d2c44', '#5b6f8a', '#a9a39c', '#f58220', '#ea4f08'],
  background: 'var(--explore-hero-background, #020202)',
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

export function ExploreHero() {
  return <header className="explore-hero">
    <div className="explore-hero-backdrop" aria-hidden="true">
      <Hazeglow config={backdrop} />
    </div>
    <h1 className="explore-hero-title">Give your AI agents a taste</h1>
  </header>
}
