import { Folder, Images, Plus } from '@/components/icons'
import { Button } from '@/components/arc/button/button'
import { Folder as FolderIllustration } from '@/components/ui/folder-component'
import type { LibraryMoodboard } from '@/lib/library-types'
import { allResources as allResourcesView } from '@/lib/view-path'
import type { Resource } from '@/catalog'
import { ResourceList } from './resource-list'
import { ExplorePage } from './explore-page'
import { InfoContent } from './info-content'
import { LegalContent, legalDocuments } from './legal-content'
import { SponsorContent } from './sponsor-content'
import { SubmitSection } from './submit-section'

type DashboardProps = {
  view: string
  heading: string
  subheading: string
  resources: Resource[]
  allResources: Resource[]
  moodboards: LibraryMoodboard[]
  query: string
  /** The hero owns the search on the catalogue's own page, so it writes here. */
  onQueryChange: (query: string) => void
  signedIn: boolean
  onRequireAccount: () => void
  onFavorite: (id: string) => void
  onFile: (id: string, moodboardId: string) => void
  onOpenMoodboard: (moodboardId: string) => void
  onOpenCategory: (category: string) => void
  /** Walks up from a tag page to the shelf that holds it. */
  onOpenShelf: (view: string) => void
  onNewMoodboard: () => void
  onAddResource: () => void
  onSubmitResource: (item: Pick<Resource, 'name' | 'url' | 'description' | 'category'>) => Promise<string | null>
  onEditMoodboard: (moodboard: LibraryMoodboard) => void
  onDeleteMoodboard: (moodboardId: string) => void
}

function MoodboardCollection({ moodboard, resources, onOpen }: {
  moodboard: LibraryMoodboard
  resources: Resource[]
  onOpen: () => void
}) {
  const count = resources.filter(resource => resource.moodboardId === moodboard.id).length

  return <div
    className="moodboard-collection-entry"
    role="button"
    tabIndex={0}
    aria-label={`Open ${moodboard.name}, ${count} saved ${count === 1 ? 'item' : 'items'}`}
    onClick={onOpen}
    onKeyDown={event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onOpen()
      }
    }}
  >
    <FolderIllustration
      size="sm"
      color={moodboard.color}
      className="moodboard-collection-folder"
      aria-hidden="true"
    />
    <span className="moodboard-collection-name">
      <Folder size={17} style={{ color: moodboard.color }} aria-hidden="true" />
      <span className="moodboard-collection-label">{moodboard.name}</span>
    </span>
  </div>
}

function MoodboardLibrary({ moodboards, resources, onOpenMoodboard, onNewMoodboard }: Pick<DashboardProps, 'moodboards' | 'resources' | 'onOpenMoodboard' | 'onNewMoodboard'>) {
  return <section className="moodboard-library-page">
    <header className="moodboard-library-intro"><h1>Moodboards</h1><Button variant="secondary" size="sm" onClick={onNewMoodboard}><Plus size={15} /> New moodboard</Button></header>
    {moodboards.length > 0
      ? <div className="moodboard-collection-grid">{moodboards.map(moodboard => <MoodboardCollection key={moodboard.id} moodboard={moodboard} resources={resources} onOpen={() => onOpenMoodboard(moodboard.id)} />)}</div>
      : <div className="moodboard-library-empty"><Images size={24} /><h2>No moodboards yet</h2><p>Create a moodboard to give your references a place to live.</p><Button variant="secondary" size="sm" onClick={onNewMoodboard}><Plus size={15} /> New moodboard</Button></div>}
  </section>
}

export function Dashboard(props: DashboardProps) {
  const {
    view, heading, subheading, resources, allResources, moodboards, query, onQueryChange,
    signedIn, onRequireAccount, onFavorite, onFile, onOpenMoodboard, onOpenCategory, onOpenShelf, onNewMoodboard, onAddResource, onSubmitResource, onEditMoodboard, onDeleteMoodboard,
  } = props

  return <div className="dashboard-main">
    <div className="page-content">
      {view === 'Moodboard'
        ? <MoodboardLibrary moodboards={moodboards} resources={allResources} onOpenMoodboard={onOpenMoodboard} onNewMoodboard={onNewMoodboard} />
        : view === 'Info'
          ? <InfoContent total={allResources.length} />
          : view === 'Sponsor'
            ? <SponsorContent />
            : view === 'Submit'
              ? <SubmitSection onSubmit={onSubmitResource} />
            : legalDocuments[view]
            ? <LegalContent page={legalDocuments[view]} />
          : view === 'All resources'
          ? <ExplorePage
            resources={resources}
            allResources={allResources}
            query={query}
            onQueryChange={onQueryChange}
            moodboards={moodboards}
            signedIn={signedIn}
            onRequireAccount={onRequireAccount}
            onFavorite={onFavorite}
            onFile={onFile}
            onNewMoodboard={onNewMoodboard}
            onOpenCategory={onOpenCategory}
          />
          : <>
            <ResourceList heading={heading === 'All resources' ? 'The good side of the internet.' : heading} subheading={subheading} resources={resources} view={view} moodboards={moodboards} signedIn={signedIn} onRequireAccount={onRequireAccount} onFavorite={onFavorite} onFile={onFile} onNewMoodboard={onNewMoodboard} onAddResource={onAddResource} onOpenShelf={onOpenShelf} onExplore={() => onOpenShelf(allResourcesView)} onEditMoodboard={moodboards.some(moodboard => moodboard.id === view) ? onEditMoodboard : undefined} onDeleteMoodboard={moodboards.some(moodboard => moodboard.id === view) ? () => onDeleteMoodboard(view) : undefined} />
          </>}
    </div>
  </div>
}
