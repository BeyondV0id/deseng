import { useRef, useState, type ComponentProps } from 'react'
import { Avatar } from '@/components/arc/avatar/avatar'
import { Dialog, DialogContent } from '@/components/arc/dialog/dialog'
import { Card, CardGroup, CardContent } from '@/components/ui/card'
import { ShapeProvider } from '@/lib/shape-context'
import { useMediaQuery } from '@/hooks/use-media-query'
import { DitherArt } from '@/components/ui/dither-art'
import collectionData from '@/lib/discovery-collections.json'
import { ResourceCard } from './resource-card'
import styles from './discovery-collections.module.css'

type Props = Omit<ComponentProps<typeof ResourceCard>, 'resource'> & {
  resources: ComponentProps<typeof ResourceCard>['resource'][]
}

export function DiscoveryCollections({ resources, ...handlers }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const narrow = useMediaQuery('(max-width: 599px)')
  const medium = useMediaQuery('(max-width: 1199px)')
  const byUrl = new Map(resources.map(resource => [resource.url.replace(/\/+$/, ''), resource]))
  const groups = collectionData.map(collection => ({
    ...collection,
    name: collection.title.replace(/^\d+ Best /, '').replace(' in 2026', ''),
    resources: collection.urls.flatMap(url => {
      const resource = byUrl.get(url.replace(/\/+$/, ''))
      return resource ? [resource] : []
    }),
  })).filter(collection => collection.resources.length > 0)
  const active = groups.find(collection => collection.slug === selected)

  if (!groups.length) return null

  return <section className={styles.section} aria-labelledby="collections-title">
    <header className={styles.header}>
      <h2 className="discovery-section-title" id="collections-title">Collections</h2>
    </header>
    <ShapeProvider defaultShape="rounded">
      <CardGroup columns={narrow ? 1 : medium ? 2 : 3} separated border="outlined">
        {groups.map((collection, index) => <Card key={collection.slug} label={`Open ${collection.name}, ${collection.resources.length} tools`} onClick={() => {
          if (document.activeElement instanceof HTMLElement) trigger.current = document.activeElement
          setSelected(collection.slug)
        }}>
          <div className={styles.art}><DitherArt phase={index * 0.8} /></div>
          <CardContent>
            <div className={styles.face}>
            <div className={styles.top}>
              <span className={styles.marks} aria-hidden="true">
                {collection.resources.slice(0, 5).map(resource => <Avatar key={resource.id} name={resource.name} src={resource.faviconUrl ?? undefined} size="sm" />)}
              </span>
              <span className={styles.count}>{collection.resources.length} tools</span>
            </div>
            <div className={styles.bottom}>
              <h3 className={styles.title}>{collection.name}</h3>

            </div>
            </div>
          </CardContent>
        </Card>)}
      </CardGroup>
    </ShapeProvider>
    <Dialog open={Boolean(active)} onOpenChange={open => { if (!open) setSelected(null) }}>
      <DialogContent title={active?.name ?? 'Collection'} description={`${active?.resources.length ?? 0} tools`} style={{ width: 'min(960px, calc(100% - 32px))' }} onCloseAutoFocus={event => {
        event.preventDefault()
        trigger.current?.focus()
      }}>
        <div className="resource-grid">
          {active?.resources.map(resource => <ResourceCard key={resource.id} resource={resource} {...handlers} />)}
        </div>
      </DialogContent>
    </Dialog>
  </section>
}
