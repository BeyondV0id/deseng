import { useState, type ComponentProps } from 'react'
import { Card } from '@/components/card'
import { Button } from '@/components/arc/button/button'
import { Avatar } from '@/components/arc/avatar/avatar'
import { Dialog, DialogContent, DialogTrigger } from '@/components/arc/dialog/dialog'
import { ArrowUpRight } from '@/components/icons'
import collectionData from '@/lib/discovery-collections.json'
import { ResourceCard } from './resource-card'
import styles from './discovery-collections.module.css'

type Props = Omit<ComponentProps<typeof ResourceCard>, 'resource'> & {
  resources: ComponentProps<typeof ResourceCard>['resource'][]
}

export function DiscoveryCollections({ resources, ...handlers }: Props) {
  const [expanded, setExpanded] = useState(false)
  const groups = collectionData.map(collection => ({
    ...collection,
    resources: collection.urls.flatMap(url => {
      const match = resources.find(resource => resource.url.replace(/\/+$/, '') === url.replace(/\/+$/, ''))
      return match ? [match] : []
    }),
  })).filter(collection => collection.resources.length > 0)

  if (!groups.length) return null

  return <section className={styles.section} aria-labelledby="collections-title">
    <header className="latest-additions-header">
      <h2 className="discovery-section-title" id="collections-title">Collections</h2>
      <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
        {expanded ? 'View Less' : 'View More'}<ArrowUpRight size={14} aria-hidden="true" />
      </Button>
    </header>
    <div className={styles.grid}>
      {(expanded ? groups : groups.slice(0, 3)).map(collection => <Dialog key={collection.slug}>
        <Card className={styles.card}>
            <span className={styles.top}>
              <span className={styles.marks} aria-hidden="true">
                {collection.resources.slice(0, 5).map(resource => <Avatar key={resource.id} name={resource.name} src={resource.faviconUrl ?? undefined} size="sm" />)}
              </span>
              <span className={styles.count}>{collection.resources.length} tools</span>
            </span>
            <h3 className={styles.title}>{collection.title.replace(/^\d+ /, '').replace('Best ', '')}</h3>
          <DialogTrigger asChild><Button variant="ghost" size="sm" aria-label={`View ${collection.title}`} >View Collection<ArrowUpRight size={14} aria-hidden="true" /></Button></DialogTrigger>
        </Card>
        <DialogContent title={collection.title.replace(/^\d+ /, '').replace('Best ', '')} description={`${collection.resources.length} tools in this collection.`} style={{ width: 'min(960px, calc(100% - 32px))' }}>
          <div className="resource-grid">
            {collection.resources.map(resource => <ResourceCard key={resource.id} resource={resource} {...handlers} />)}
          </div>
          <a className={styles.source} href={collection.source} target="_blank" rel="noreferrer">Collection reference: Toolfolio<ArrowUpRight size={14} aria-hidden="true" /></a>
        </DialogContent>
      </Dialog>)}
    </div>
  </section>
}
