import { Plus } from '@/components/icons'
import { Badge } from '@/components/arc/badge/badge'
import { featuredToolSlots } from '@/lib/ads'
import { SponsoredCard } from './sponsored-card'
import styles from './ads.module.css'

/**
 * The paid band at the top of Explore.
 *
 * Featured Tools are ad placements, not editorial picks from the catalogue, so
 * they never change the resource order. An empty slot keeps its real size and
 * draws the dotted reservation: the band always shows the room a campaign will
 * take, and a booked slot swaps in the sponsor's card without moving the grid.
 */
export function FeaturedTools() {
  return <section className={styles.featuredTools} aria-labelledby="featured-tools-title">
    <header className={styles.featuredHeader}>
      <div className={styles.featuredHeading}>
        <h2 className="discovery-section-title" id="featured-tools-title">Featured Tools</h2>
        <Badge size="sm">Sponsored</Badge>
      </div>
    </header>
    <div className={styles.featuredGrid}>
      {featuredToolSlots.map((creative, index) => creative
        ? <SponsoredCard key={`${creative.name}-${index}`} creative={creative} size="featured" />
        : <div key={`featured-slot-${index}`} className={styles.featuredPlaceholder}>
          <div className={styles.featuredPlaceholderMedia}>
            <span className={styles.featuredPlus} aria-hidden="true"><Plus size={20} /></span>
          </div>
          <div className={styles.featuredPlaceholderFoot}>
            <span className={styles.featuredPlaceholderBrand}>
              <span className={styles.featuredPlaceholderTitle}>Your tool here</span>
              <span className={styles.featuredPlaceholderNote}>Featured placement</span>
            </span>
          </div>
        </div>)}
    </div>
  </section>
}
