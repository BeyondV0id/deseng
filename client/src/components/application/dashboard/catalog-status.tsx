import { Button } from '@/components/arc/button/button'
import { EmptyState } from '@/components/arc/empty-state/empty-state'
import { Warning } from '@/components/icons'
import { ExploreHero } from './explore-hero'

/** Bands drawn while the catalogue is in flight: enough to fill a tall screen. */
const LOADING_RAILS = 3
/** Cards per band. The track is a row, so only the ones on screen are needed. */
const LOADING_CARDS = 4

/**
 * The two states the catalogue can be in before it is ready.
 *
 * The loading page is the loaded page with the words left out: the same
 * header, the same band, the same card, drawn by the same rules. Nothing here
 * guesses a size. The real page lands on these pixels, so the catalogue
 * arriving replaces grey fills with text instead of pushing the page down.
 */
export function CatalogStatus({ status, onRetry }: {
  status: 'loading' | 'error'
  onRetry: () => void
}) {
  if (status === 'error') {
    return <div className="dashboard-main">
      <div className="page-content">
        <EmptyState
          title="The library did not load"
          description="The library is kept on the server. Check that it is running, then try again."
          icon={<Warning size={22} />}
          action={<Button variant="primary" size="sm" onClick={onRetry}>Try again</Button>}
        />
      </div>
    </div>
  }

  return <div className="dashboard-main" aria-busy="true">
    <div className="page-content">
      <section className="resource-library" aria-label="Resources">
        <ExploreHero />
        {/* One band per row, with a title line and a track of card-shaped
            placeholders. The band is a `resource-rail` and the card is a
            `resource-card`, so the header height, the track's gap, the card's
            width and the caption's title and description use the loaded rules. */}
        <div className="resource-rows" aria-hidden="true">
          {Array.from({ length: LOADING_RAILS }, (_, rail) => <div className="resource-rail catalog-skeleton-rail" key={rail}>
            <div className="rail-header">
              <span className="catalog-skeleton-title" />
            </div>
            <div className="rail-track catalog-skeleton-track">
              {Array.from({ length: LOADING_CARDS }, (_, card) => <div className="resource-card" key={card}>
                <span className="resource-preview catalog-skeleton-preview" />
                <div className="resource-card-caption">
                  <span className="resource-name catalog-skeleton-name" />
                  <span className="resource-description catalog-skeleton-description"><span /><span /></span>
                </div>
              </div>)}
            </div>
          </div>)}
        </div>
      </section>
    </div>
  </div>
}
