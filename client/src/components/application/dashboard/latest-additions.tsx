import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight } from '@/components/icons'
import { Button } from '@/components/arc/button/button'
import type { Resource } from '@/catalog'

const PAGE_SIZE = 6

function LatestRow({ resource }: { resource: Resource }) {
  const [failed, setFailed] = useState(false)
  const initial = resource.name.trim().slice(0, 1).toUpperCase()

  return <a className="latest-row" href={resource.url} target="_blank" rel="noreferrer">
    <span className="latest-mark" aria-hidden="true">
      {resource.faviconUrl && !failed
        ? <img
          src={resource.faviconUrl}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
        : initial}
    </span>
    <span className="latest-copy">
      <span className="latest-name">{resource.name}</span>
      <span className="latest-tag">{resource.category}</span>
    </span>
  </a>
}

/** A compact, paged directory of the most recently added resources. */
export function LatestAdditions({ resources }: { resources: Resource[] }) {
  const [page, setPage] = useState(0)
  const newest = useMemo(
    () => [...resources].sort((a, b) => b.rank - a.rank),
    [resources],
  )
  const pageCount = Math.ceil(newest.length / PAGE_SIZE)
  const activePage = Math.min(page, Math.max(0, pageCount - 1))
  const visible = newest.slice(activePage * PAGE_SIZE, activePage * PAGE_SIZE + PAGE_SIZE)

  if (newest.length === 0) return null

  return <section className="latest-additions" aria-labelledby="new-additions-title">
    <header className="latest-additions-header">
      <h2 className="discovery-section-title" id="new-additions-title">New Additions</h2>
      {newest.length > PAGE_SIZE && <div className="latest-additions-actions">
        <Button
          variant="ghost"
          size="sm"
          className="latest-additions-control"
          aria-label="Previous New Additions"
          disabled={activePage === 0}
          onClick={() => setPage(activePage - 1)}
        ><ArrowLeft size={16} /></Button>
        <Button
          variant="ghost"
          size="sm"
          className="latest-additions-control"
          aria-label="Next New Additions"
          disabled={activePage >= pageCount - 1}
          onClick={() => setPage(activePage + 1)}
        ><ArrowRight size={16} /></Button>
      </div>}
    </header>
    <div className="latest-grid">
      {visible.map(resource => <LatestRow key={resource.id} resource={resource} />)}
    </div>
  </section>
}
