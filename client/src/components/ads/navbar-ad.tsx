import { Sparkles } from '@/components/icons'
import { Tooltip } from '@/components/arc/tooltip/tooltip'
import { adInventory } from '@/lib/ads'
import styles from './ads.module.css'

/**
 * The top bar's ad: one more 40px circle in the cluster beside Submit, so the
 * bar keeps its one row and a sponsor reads as a single mark rather than a
 * card. The mark is the advertiser's own, and the tooltip names it, because a
 * disc has no room for a sentence.
 *
 * A slot with nothing booked draws nothing, and a slot with no destination is
 * left out entirely: a circle in the bar has to go somewhere.
 */
export function NavbarAd() {
  const creative = adInventory.navbar
  if (!creative?.href) return null

  return <Tooltip content={`Sponsored · ${creative.name}`}>
    <a
      className="app-navbar-icon ad-navbar-disc"
      href={creative.href}
      // A booked sponsor opens beside the library. The house slot points at the
      // sponsor section of this app, so that one stays in the open tab.
      {...(/^https?:/i.test(creative.href) ? { target: '_blank', rel: 'sponsored noopener noreferrer' } : { rel: 'sponsored' })}
      aria-label={`Sponsored: ${creative.name}`}
    >
      {creative.logoUrl
        ? <img className={styles.discMark} src={creative.logoUrl} alt="" loading="lazy" decoding="async" />
        : <Sparkles size={18} />}
    </a>
  </Tooltip>
}
