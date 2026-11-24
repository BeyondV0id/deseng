import { useEffect, useState } from 'react'
import { adInventory } from '@/lib/ads'
import { SponsoredCard } from './sponsored-card'
import styles from './ads.module.css'

/** A dismissal lasts the visit, not the account: the next visit may ask again. */
const dismissedKey = 'reference-ad-toast'

/**
 * The corner ad. It is the one sponsored card that arrives on its own, so it
 * waits until the visitor has actually started reading (a screen or so down the
 * page), it enters once, and it leaves for good when it is dismissed. It keeps
 * the aside's `complementary` role rather than a live region, so it announces
 * itself in the reading order instead of interrupting.
 */
export function ToastAd() {
  const creative = adInventory.toast
  const [dismissed, setDismissed] = useState(() => {
    try {
      return (sessionStorage.getItem(dismissedKey) ?? sessionStorage.getItem('desgnix-ad-toast')) === '1'
    } catch {
      // Storage can be blocked. The card is then allowed once per render tree.
      return false
    }
  })
  const [arrived, setArrived] = useState(false)

  useEffect(() => {
    if (dismissed || !creative) return
    const threshold = Math.min(600, window.innerHeight * .9)
    const onScroll = () => {
      if (window.scrollY > threshold) setArrived(true)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [dismissed, creative])

  if (!creative || dismissed || !arrived) return null

  return <aside className={styles.toast} aria-label="Sponsored">
    <SponsoredCard
      creative={creative}
      size="wide"
      onDismiss={() => {
        setDismissed(true)
        try {
          sessionStorage.setItem(dismissedKey, '1')
        } catch {
          // Nothing to remember it with; it stays gone for this page.
        }
      }}
    />
  </aside>
}
