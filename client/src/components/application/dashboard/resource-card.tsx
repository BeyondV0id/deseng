import { useEffect, useState } from 'react'
import { Bookmark, Check, Folder, Plus } from '@/components/icons'
import { Card } from '@/components/card'
import { cn } from '@/lib/utils'
import { loadLinkMetadata, type LinkMetadata } from '@/lib/link-metadata'
import { resourceImages } from '@/lib/resource-images'
import type { LibraryMoodboard } from '@/lib/library-types'
import type { Resource } from '@/catalog'
import { Tooltip } from '@/components/arc/tooltip/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/arc/popover/popover'

/** The site's own mark, for entries the catalogue could not capture a preview of. */
function logoUrlFor(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, '')
  return `https://www.google.com/s2/favicons?domain=${host}&sz=128`
}

function LogoPreview({ url, siteName, src }: { url: string; siteName: string; src?: string }) {
  const [failed, setFailed] = useState(false)
  const logo = src ?? logoUrlFor(url)
  const initial = siteName.replace(/[^a-z0-9]/gi, '').slice(0, 1).toUpperCase() || '•'
  return <div className="resource-preview preview-logo">
    {failed
      ? <span className="preview-logo-letter" aria-hidden="true">{initial}</span>
      : <img src={logo} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />}
    <span className="preview-logo-name">{siteName}</span>
  </div>
}

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

function useLinkMetadata(url: string, target: HTMLElement | null, enabled = true) {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null)
  useEffect(() => {
    if (!enabled || !target) return
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
  }, [url, target, enabled])
  return metadata
}

export function ResourceCard({ resource, index, moodboards, signedIn, onRequireAccount, onFavorite, onFile, onNewMoodboard }: {
  resource: Resource
  index: number
  moodboards: LibraryMoodboard[]
  /** Whether the visitor has an account; the moodboard menu asks them to get one first. */
  signedIn: boolean
  onRequireAccount: () => void
  onFavorite: (id: string) => void
  onFile: (id: string, moodboardId: string) => void
  onNewMoodboard: () => void
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const [filingOpen, setFilingOpen] = useState(false)
  const [previewNode, setPreviewNode] = useState<HTMLAnchorElement | null>(null)
  const baked = resourceImages[resource.url]
  // A baked entry carries its own image and dimensions, so the card never
  // calls the metadata API. Only resources added at runtime still ask.
  const metadata = useLinkMetadata(resource.url, previewNode, !baked)
  const domain = new URL(resource.url).hostname.replace(/^www\./, '')
  const title = metadata?.title ?? resource.name
  const siteName = metadata?.siteName ?? domain
  const bakedIsLogo = baked?.source === 'favicon'
  const bakedLogo = bakedIsLogo ? baked.image : null
  const bakedImage = baked?.source === 'og' ? baked.image : null
  const previewImage = imageFailed || bakedIsLogo ? null : bakedImage ?? metadata?.imageUrl ?? null

  return <Card className="resource-card">
    <a
      ref={setPreviewNode}
      className="resource-visual-link"
      href={resource.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Visit ${title}`}
    >
      {previewImage
        ? <img
          className="resource-og-image"
          src={previewImage}
          alt={`${title} preview`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
        : bakedIsLogo || imageFailed
          ? <LogoPreview url={resource.url} siteName={siteName} src={bakedLogo ?? undefined} />
          : <FallbackPreview resource={resource} index={index} />}
    </a>
    <div className="resource-card-caption">
      <a className="resource-card-content" href={resource.url} target="_blank" rel="noreferrer">
        <span className="resource-name">{title}</span>
      </a>
      {/* The card's controls sit beside the name rather than over the artwork:
          the picture belongs to the site, the caption to the library. */}
      <div className="resource-card-tools">
        <Tooltip content={resource.favorite ? 'Saved' : 'Save'}>
          <button
            type="button"
            aria-pressed={resource.favorite}
            className={cn('resource-card-tool favorite-button', resource.favorite && 'is-favorite')}
            onClick={() => onFavorite(resource.id)}
            aria-label={resource.favorite ? `Remove ${title} from saved` : `Save ${title}`}
          ><Bookmark size={15} weight={resource.favorite ? 'Filled' : 'Outline'} /></button>
        </Tooltip>
        <Popover open={filingOpen} onOpenChange={next => {
          if (next && !signedIn) {
            onRequireAccount()
            return
          }
          setFilingOpen(next)
        }}>
          <PopoverTrigger className="resource-card-tool" aria-label={`Add ${title} to a moodboard`}>
            <Plus size={15} />
          </PopoverTrigger>
          <PopoverContent className="resource-moodboard-popover" align="end" side="bottom">
            <span className="resource-moodboard-popover-label">Add to moodboard</span>
            {moodboards.length === 0
              ? <span className="resource-moodboard-popover-empty">No moodboards yet.</span>
              : moodboards.map(moodboard => <button
                key={moodboard.id}
                type="button"
                aria-pressed={resource.moodboardId === moodboard.id}
                onClick={() => { onFile(resource.id, moodboard.id); setFilingOpen(false) }}
              >
                <Folder size={14} style={{ color: moodboard.color }} />
                <span>{moodboard.name}</span>
                {resource.moodboardId === moodboard.id && <Check size={14} />}
              </button>)}
            <button type="button" onClick={() => { setFilingOpen(false); onNewMoodboard() }}>
              <Plus size={14} />
              <span>New moodboard</span>
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  </Card>
}
