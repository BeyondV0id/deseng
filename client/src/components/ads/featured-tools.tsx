import { Card } from '@/components/card'
import { Plus } from '@/components/icons'
import { Badge } from '@/components/arc/badge/badge'
import { featuredToolSlots } from '@/lib/ads'
import { SponsoredCard } from './sponsored-card'
import styles from './ads.module.css'

export function FeaturedTools() {
  const booked = featuredToolSlots.filter(creative => creative !== null)
  return <section className={styles.featuredTools} aria-labelledby="featured-tools-title">
    <header className={styles.featuredHeader}>
      <div className={styles.featuredHeading}>
        <h2 className="discovery-section-title" id="featured-tools-title">Featured Tools</h2>
        <Badge size="sm">Sponsored</Badge>
      </div>
    </header>
    {booked.length > 0 ? <div className={styles.featuredGrid}>
      {booked.map((creative, index) => <SponsoredCard key={`${creative.name}-${index}`} creative={creative} size="featured" />)}
    </div> : <Card href="/sponsor" className={styles.reservation}>
      <Plus size={20} aria-hidden="true" />
      <span>Your Brand Here</span>
    </Card>}
  </section>
}
