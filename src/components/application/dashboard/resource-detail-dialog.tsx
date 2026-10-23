import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Bookmark, Folder, Share } from '@/components/icons'
import { loadLinkMetadata, type LinkMetadata } from '@/lib/link-metadata'
import type { LibraryMoodboard } from '@/lib/library-types'
import type { Resource } from '@/catalog'
import { Select } from '@/components/arc/select/select'
import { Drawer, DrawerContent, useDrawerItem } from '@/components/arc/drawer/drawer'
import { CopyButton } from '@/components/arc/copy-button/copy-button'

type ResourceDetailDialogProps = {
  resource: Resource | null
  moodboards: LibraryMoodboard[]
  onClose: () => void
  onFavorite: (id: string) => void
  onMoodboard: (id: string, moodboardId: string) => void
}

export function ResourceDetailDialog({ resource, moodboards, onClose, onFavorite, onMoodboard }: ResourceDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [paneHost, setPaneHost] = useState<HTMLDivElement | null>(null)
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null)
  const visibleResource = useDrawerItem(resource) ?? null

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    let closeTimer: number | undefined
    if (resource) {
      if (!dialog.open) dialog.showModal()
      dialog.dataset.closing = 'false'
    } else if (dialog.open) {
      dialog.dataset.closing = 'true'
      closeTimer = window.setTimeout(() => {
        dialog.close()
        delete dialog.dataset.closing
      }, 280)
    }
    return () => { if (closeTimer !== undefined) window.clearTimeout(closeTimer) }
  }, [resource])

  useEffect(() => {
    if (!visibleResource) {
      setMetadata(null)
      return
    }
    let cancelled = false
    setMetadata(null)
    void loadLinkMetadata(visibleResource.url).then(result => {
      if (!cancelled) setMetadata(result)
    })
    return () => { cancelled = true }
  }, [visibleResource?.url])

  const currentResource = visibleResource
  const domain = currentResource ? new URL(currentResource.url).hostname.replace(/^www\./, '') : ''
  const title = metadata?.title ?? currentResource?.name ?? 'Resource details'
  const description = metadata?.description ?? currentResource?.description ?? ''
  const siteName = metadata?.siteName ?? domain

  async function shareResource() {
    if (!currentResource) return
    if (navigator.share) {
      try { await navigator.share({ title, text: description, url: currentResource.url }) } catch { /* Sharing can be dismissed by the user. */ }
      return
    }
    await copyResource()
  }

  async function copyResource() {
    if (!currentResource) return
    try {
      await navigator.clipboard.writeText(currentResource.url)
    } catch {}
  }

  return <dialog
    ref={dialogRef}
    className="resource-detail-dialog"
    aria-label={`Details for ${title}`}
    onCancel={event => { event.preventDefault(); onClose() }}
    onClose={onClose}
    onClick={event => { if (event.target === dialogRef.current) onClose() }}
  >
    <div className="resource-detail-stage">
      {metadata?.imageUrl && <img className="resource-detail-atmosphere" src={metadata.imageUrl} alt="" aria-hidden="true" />}
      <div className="resource-detail-preview-area">
        <a className="resource-detail-preview" href={currentResource?.url} target="_blank" rel="noreferrer" aria-label={`Open ${title}`}>
          {metadata?.imageUrl
            ? <img src={metadata.imageUrl} alt={`${title} preview`} />
            : <div className="resource-detail-placeholder"><span>{siteName}</span><strong>{title}</strong></div>}
          <span className="resource-detail-open"><span>Open original</span><ArrowUpRight size={16} /></span>
        </a>
      </div>
      <div ref={setPaneHost} className="resource-detail-pane-host" />
      <Drawer open={Boolean(resource)} modal={false} onOpenChange={open => { if (!open) onClose() }}>
        {paneHost && currentResource && <DrawerContent
          container={paneHost}
          title={title}
          description={metadata?.siteName && metadata.siteName !== domain ? `${metadata.siteName} · ${domain}` : domain || undefined}
          side="right"
          className="resource-detail-drawer"
        >
          <div className="resource-detail-body">
            <div className="resource-detail-top">
              <span className="resource-detail-category">{currentResource.category}</span>
              <button
                type="button"
                className={`resource-detail-bookmark${currentResource.favorite ? ' is-active' : ''}`}
                aria-label={currentResource.favorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-pressed={currentResource.favorite}
                onClick={() => onFavorite(currentResource.id)}
              ><Bookmark size={19} /></button>
            </div>
            <div className="resource-detail-site">
              {metadata?.logoUrl && <img src={metadata.logoUrl} alt="" onError={event => { event.currentTarget.hidden = true }} />}
              <span>{siteName}</span><span className="resource-detail-domain">{domain}</span>
            </div>
            {description && <p className="resource-detail-description">{description}</p>}
            <div className="resource-detail-bottom">
              <div className="resource-detail-moodboard">
                <Folder size={17} />
                <Select
                  label="Add to moodboard"
                  placeholder={moodboards.length ? 'Add to moodboard' : 'No moodboards yet'}
                  value={moodboards.some(moodboard => moodboard.id === currentResource.moodboardId) ? currentResource.moodboardId : ''}
                  onValueChange={moodboardId => onMoodboard(currentResource.id, moodboardId)}
                  disabled={moodboards.length === 0}
                  className="detail-folder-select-trigger"
                  options={moodboards.map(moodboard => ({ value: moodboard.id, label: moodboard.name }))}
                />
              </div>
              <div className="resource-detail-actions">
                <button type="button" className="resource-detail-share" onClick={() => void shareResource()}><Share size={16} /> Share</button>
                <CopyButton value={currentResource.url} label="Copy link" className="resource-detail-copy" />
              </div>
            </div>
          </div>
        </DrawerContent>}
      </Drawer>
    </div>
  </dialog>
}
