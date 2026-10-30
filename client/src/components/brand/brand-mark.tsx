import styles from './brand-mark.module.css'

/**
 * The brand mark: the dotted sphere, as a still image.
 *
 * It used to be OrbyUI's ASCII orb, turning on its own inside the wordmark.
 * The mark is a label, not a toy, so it is a static asset now: one PNG, sized
 * by its box, with no canvas, no animation and nothing to paint between
 * renders. The artwork is already a circle on transparency, so the box only
 * sizes it.
 */
export function BrandMark() {
  return (
    <img
      className={styles.mark}
      src="/logo.png"
      alt=""
      width={28}
      height={28}
      decoding="async"
      aria-hidden="true"
    />
  )
}
