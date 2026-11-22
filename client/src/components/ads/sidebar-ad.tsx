import { adInventory } from '@/lib/ads'
import { SponsoredCard } from './sponsored-card'
import styles from './ads.module.css'

/**
 * The column's ad: the last thing above the copyright, on the same width as
 * every row in the sidebar, so it reads as part of the column rather than as a
 * panel dropped into it.
 *
 * A slot holds one creative, so there is no dot rail under it: the rail is a
 * carousel control, and here it only took height away from the moodboards.
 */
export function SidebarAd() {
  const creative = adInventory.sidebar

  if (!creative) return null

  return <aside className={styles.sidebarAd} aria-label="Sponsor Information">
    <SponsoredCard creative={creative} size="rail" placeholder />
  </aside>
}
