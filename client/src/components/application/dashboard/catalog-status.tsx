import { Button } from '@/components/arc/button/button'
import { EmptyState } from '@/components/arc/empty-state/empty-state'
import { Loader, Warning } from '@/components/icons'

/**
 * The two states the catalogue can be in before it is ready. The skeleton is
 * the shape of a rail row, so the page does not jump when the cards arrive.
 */
export function CatalogStatus({ status, onRetry }: {
  status: 'loading' | 'error'
  onRetry: () => void
}) {
  if (status === 'error') {
    return <div className="dashboard-main">
      <div className="page-content">
        <EmptyState
          title="The catalogue did not load"
          description="The library is kept on the server. Check that it is running, then try again."
          icon={<Warning size={22} />}
          action={<Button variant="primary" size="sm" onClick={onRetry}>Try again</Button>}
        />
      </div>
    </div>
  }

  return <div className="dashboard-main" aria-busy="true">
    <div className="page-content catalog-loading" role="status" aria-live="polite">
      <p className="catalog-loading-line"><Loader size={16} /> Loading the catalogue</p>
      <div className="catalog-skeleton" aria-hidden="true">
        {['a', 'b'].map(rail => <div className="catalog-skeleton-rail" key={rail}>
          <span className="catalog-skeleton-title" />
          <div className="catalog-skeleton-cards">
            {[0, 1, 2, 3].map(card => <span className="catalog-skeleton-card" key={card} />)}
          </div>
        </div>)}
      </div>
    </div>
  </div>
}
