import { useState } from 'react'
import { Bookmark, Check, Folder, Plus } from '@/components/icons'
import { Card } from '@/components/card'
import { cn } from '@/lib/utils'
import type { LibraryMoodboard } from '@/lib/library-types'
import type { Resource } from '@/catalog'
import { Tooltip } from '@/components/arc/tooltip/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/arc/popover/popover'
import { Button } from '@/components/arc/button/button'

/** The site's own mark, for entries the catalogue could not capture a preview of. */
function LogoPreview({ siteName, src }: { siteName: string; src?: string | null }) {
  const [failed, setFailed] = useState(false)
  const initial = siteName.replace(/[^a-z0-9]/gi, '').slice(0, 1).toUpperCase() || '•'
  return <div className="resource-preview preview-logo">
    {!src || failed
      ? <span className="preview-logo-letter" aria-hidden="true">{initial}</span>
      : <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />}
    <span className="preview-logo-name">{siteName}</span>
  </div>
}

function previewDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function ResourceCard({ resource, moodboards, signedIn, onRequireAccount, onFavorite, onFile, onNewMoodboard }: {
  resource: Resource
  moodboards: LibraryMoodboard[]
  /** Whether the visitor has an account; the moodboard menu asks them to get one first. */
  signedIn: boolean
  onRequireAccount: () => void
  onFavorite: (id: string) => void
  onFile: (id: string, moodboardId: string) => void
  onNewMoodboard: () => void
}) {
  // The preview walks one way: the Open Graph image, then the site's own mark
  // and name. A failed image moves the card along rather than retrying it.
  const [imageFailed, setImageFailed] = useState(false)
  const [filingOpen, setFilingOpen] = useState(false)
  const previewImage = imageFailed ? null : resource.imageUrl
  const title = resource.name
  const siteName = previewDomain(resource.url)

  return <Card className="resource-card">
    <a
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
        : <LogoPreview siteName={siteName} src={resource.faviconUrl} />}
    </a>
    <div className="resource-card-caption">
      <a className="resource-card-content" href={resource.url} target="_blank" rel="noreferrer">
        <span className="resource-name">{title}</span>
      </a>
      {/* The card's controls sit beside the name rather than over the artwork:
          the picture belongs to the site, the caption to the library. */}
      <div className="resource-card-tools">
        <Tooltip content={resource.favorite ? 'Saved' : 'Save'}>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            aria-pressed={resource.favorite}
            className={cn('resource-card-tool favorite-button', resource.favorite && 'is-favorite')}
            onClick={() => onFavorite(resource.id)}
            aria-label={resource.favorite ? `Remove ${title} from saved` : `Save ${title}`}
          ><Bookmark size={15} weight={resource.favorite ? 'Filled' : 'Outline'} /></Button>
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
    <p className="resource-card-description">{resource.description || 'Visit the source to explore this resource.'}</p>
  </Card>
}
