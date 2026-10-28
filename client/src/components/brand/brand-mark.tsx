import GradientASCII from './gradient-ascii'
import styles from './brand-mark.module.css'

/**
 * The brand mark: a flat 27px disc, not a cube.
 *
 * Two layers, bottom to top. The CSS supplies the disc itself, one radial
 * gradient and nothing else: no specular cap, no inner ring, no drawn detail of
 * any kind. On top sits React Bits' `GradientASCII` in its `eclipse` shape,
 * which is the only one of its four that is round: a dark core ringed by light,
 * with a field of monospace characters standing in for the dither.
 *
 * The ASCII field is frozen. `intro={false}` skips the fade-in entirely, so the
 * disc is complete on the first painted frame; `speed`, `flicker` and `grain`
 * are all zero, so nothing drifts, no character swaps and no dither crawls;
 * `mouseInteraction` and `clickEffect` are off, so the pointer does nothing to
 * it. The component's still guard then draws once and stops its render loop.
 *
 * The centre of an eclipse is empty by design, which is what lets the flat
 * gradient below read as the body of the disc while the field supplies the
 * light around its edge.
 *
 * Decorative and still: the link it sits in carries the accessible name, and
 * the mark never scales, tilts or changes on hover.
 */
export function BrandMark() {
  return (
    <span className={styles.mark} aria-hidden="true">
      <GradientASCII
        className={styles.ascii}
        colors={['#120f07', '#5f5200', '#cdb900', '#f4ef09', '#fffbd6']}
        shape="eclipse"
        characters=" =+xX0S8#@"
        cellSize={9}
        density={0.7}
        glyphOpacity={0.4}
        gradientOpacity={0.85}
        glow={0.25}
        softness={0.45}
        scale={1}
        flow={0.6}
        speed={0}
        flicker={0}
        grain={0}
        depthOfField={0}
        mouseInteraction={false}
        clickEffect="none"
        intro={false}
        dpr={2}
      />
    </span>
  )
}
