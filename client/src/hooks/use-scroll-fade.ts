import { useCallback, useState } from 'react'

export type ScrollFade = 'none' | 'start' | 'end' | 'both'

/**
 * Anything this close to an edge counts as being on it. A snapping strip rests
 * a couple of pixels off zero, and a fade that only hides two pixels would
 * read as a smudge rather than as more content.
 */
const EDGE_TOLERANCE = 4

/**
 * Which edge of a sideways track has more to show.
 *
 * A row that scrolls is cut mid-card, and a cut card reads as a mistake unless
 * the edge says there is more. The ref measures the track and reports the side
 * that is still hiding content: `end` when it starts at the left, `start` once
 * it reaches the right, `both` in between, and `none` when everything fits. The
 * container draws the matching fade from its `data-fade` attribute, so a track
 * with nothing off screen is never faded at its left edge.
 *
 * The ref is a callback, so it re-attaches when a different node mounts in the
 * same slot (a results strip that swaps for a suggestions strip, for example).
 */
export function useScrollFade<T extends HTMLElement>() {
  const [fade, setFade] = useState<ScrollFade>('none')

  const ref = useCallback((node: T | null) => {
    if (!node) return

    const measure = () => {
      const overflow = node.scrollWidth - node.clientWidth
      if (overflow <= 1) {
        setFade('none')
        return
      }
      const atStart = node.scrollLeft <= EDGE_TOLERANCE
      const atEnd = node.scrollLeft >= overflow - EDGE_TOLERANCE
      setFade(atStart ? 'end' : atEnd ? 'start' : 'both')
    }

    measure()
    node.addEventListener('scroll', measure, { passive: true })
    const resize = new ResizeObserver(measure)
    resize.observe(node)
    // A strip's contents change with the query, so a resize of the box is not
    // the only thing worth measuring again. Images landing also count.
    const mutations = new MutationObserver(measure)
    mutations.observe(node, { childList: true, subtree: true })

    return () => {
      node.removeEventListener('scroll', measure)
      resize.disconnect()
      mutations.disconnect()
    }
  }, [])

  return { ref, fade }
}
