import { useEffect, useState, type CSSProperties } from 'react'
import { ArrowUpRight, Check, Folder, Heart, MoreHorizontal } from '@/components/icons'
import { Card } from '@/components/card'
import { cn } from '@/lib/utils'
import { loadLinkMetadata, type LinkMetadata } from '@/lib/link-metadata'
import type { LibraryMoodboard } from '@/lib/library-types'
import type { Resource } from '@/catalog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/arc/popover/popover'
import { Tooltip } from '@/components/arc/tooltip/tooltip'

const fallbackRatios = [1.45, 1.7, 1.35, 1.58]

type PreviewStyle = CSSProperties & { '--media-ratio': number }

function FallbackPreview({ resource, index }: { resource: Resource; index: number }) {
  const category = resource.category.toLowerCase()
  const initial = resource.name.replace(/[^a-z0-9]/gi, '').slice(0, 1).toUpperCase() || '•'
  return <div className={cn('resource-preview', `preview-${['paper', 'ink', 'sand', 'blue'][index % 4]}`)}>
    <div className="preview-toolbar"><span className="preview-mark">{initial}</span><span className="preview-lines"><i /><i /></span></div>
    {category === 'fonts' ? <div className="preview-type">Aa<span>Ag</span><i>Type specimen</i></div>
      : category === 'ui' || category === 'interface' || category === 'motion' ? <div className="preview-ui"><div className="preview-ui-nav" /><div className="preview-ui-main"><i /><i /><i /></div><div className="preview-ui-button" /></div>
        : category === 'graphics' ? <div className="preview-shape"><span /><i /><b /></div>
          : category === 'web utility' ? <div className="preview-code"><i>ease</i><span>cubic-bezier</span><b /><b /></div>
            : <div className="preview-editorial"><span /><i /><i /><b /></div>}
  </div>
}

function useLinkMetadata(url: string, target: HTMLElement | null) {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null)
  useEffect(() => {
    if (!target) return
    let cancelled = false
    const load = () => { void loadLinkMetadata(url).then(result => { if (!cancelled) setMetadata(result) }) }
    if (!('IntersectionObserver' in window)) {
      load()
      return () => { cancelled = true }
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
      load()
    }, { rootMargin: '280px' })
    observer.observe(target)
    return () => { cancelled = true; observer.disconnect() }
  }, [url, target])
  return metadata
}

export function ResourceCard({ resource, index, moodboards, onFavorite, onMoodboard, onOpen }: {
  resource: Resource
  index: number
  moodboards: LibraryMoodboard[]
  onFavorite: (id: string) => void
  onMoodboard: (id: string, moodboardId: string) => void
  onOpen: (resource: Resource) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [previewNode, setPreviewNode] = useState<HTMLDivElement | null>(null)
  const metadata = useLinkMetadata(resource.url, previewNode)
  const domain = new URL(resource.url).hostname.replace(/^www\./, '')
  const title = metadata?.title ?? resource.name
  const description = metadata?.description ?? resource.description
  const siteName = metadata?.siteName ?? domain
  const hasImage = Boolean(metadata?.imageUrl && !imageFailed)
  const ratio = metadata?.imageWidth && metadata.imageHeight
    ? Math.min(1.9, Math.max(1.2, metadata.imageWidth / metadata.imageHeight))
    : fallbackRatios[index % fallbackRatios.length]
  const previewStyle: PreviewStyle = { '--media-ratio': ratio }

  return <Card className="resource-card">
    <div
      ref={setPreviewNode}
      className="resource-visual-link"
      role="button"
      tabIndex={0}
      aria-label={`View details for ${title}`}
      onClick={() => onOpen(resource)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(resource)
        }
      }}
      style={previewStyle}
    >
      {hasImage
        ? <img className="resource-og-image" src={metadata?.imageUrl} alt={`${title} preview`} loading="lazy" decoding="async" onError={() => setImageFailed(true)} />
        : <FallbackPreview resource={resource} index={index} />}
    </div>
    <div className="resource-card-actions">
      <Tooltip content={resource.favorite ? 'Unlike' : 'Like'}>
        <button data-slot="toggle" aria-pressed={resource.favorite} className={cn('icon-button favorite-button', resource.favorite && 'is-favorite')} onClick={() => onFavorite(resource.id)} aria-label={resource.favorite ? `Remove ${title} from favorites` : `Add ${title} to favorites`}><Heart size={16} weight={resource.favorite ? 'Filled' : 'Outline'} /></button>
      </Tooltip>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <Tooltip content="Save to moodboard">
            <button className="card-more icon-button small" aria-label={`Add ${title} to a moodboard`}><MoreHorizontal size={17} /></button>
          </Tooltip>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={7} className="resource-moodboard-popover">
          <span className="resource-moodboard-popover-label">Move to moodboard</span>
          {moodboards.length ? moodboards.map(moodboard => <button key={moodboard.id} type="button" onClick={() => { onMoodboard(resource.id, moodboard.id); setMenuOpen(false) }}><Folder size={14} style={{ color: moodboard.color }} />{moodboard.name}{resource.moodboardId === moodboard.id && <Check size={14} />}</button>) : <span className="resource-moodboard-popover-empty">Create a moodboard to organise this resource</span>}
        </PopoverContent>
      </Popover>
      <Tooltip content="Visit site">
        <a className="card-visit-button icon-button small" href={resource.url} target="_blank" rel="noreferrer" aria-label={`Visit ${siteName}`}><ArrowUpRight size={16} /></a>
      </Tooltip>
    </div>
    <button className="resource-card-content" type="button" onClick={() => onOpen(resource)}>
      <span className="resource-site-row">
        {metadata?.logoUrl && <img className="resource-site-logo" src={metadata.logoUrl} alt="" loading="lazy" onError={event => { event.currentTarget.hidden = true }} />}
        <span className="resource-site-name">{siteName}</span>
      </span>
      <span className="resource-name">{title}</span>
      {description && <span className="resource-description">{description}</span>}
    </button>
  </Card>
}
