import { Folder, Images, MoreHorizontal, Plus } from '@/components/icons'
import { Button } from '@/components/arc/button/button'
import { Folder as FolderIllustration } from '@/components/ui/folder-component'
import type { Theme } from '@/components/arc/theme-switch/theme-switch'
import type { LibraryMoodboard } from '@/lib/library-types'
import type { Resource } from '@/catalog'
import { ResourceList } from './resource-list'
import { ExplorePage } from './explore-page'

type DashboardProps = {
  view: string
  heading: string
  subheading: string
  resources: Resource[]
  allResources: Resource[]
  moodboards: LibraryMoodboard[]
  theme: Theme
  query: string
  signedIn: boolean
  onRequireAccount: () => void
  onFavorite: (id: string) => void
  onFile: (id: string, moodboardId: string) => void
  onOpenMoodboard: (moodboardId: string) => void
  onOpenCategory: (category: string) => void
  onNewMoodboard: () => void
  onAddResource: () => void
}

function MoodboardCollection({ moodboard, resources, theme, onOpen }: {
  moodboard: LibraryMoodboard
  resources: Resource[]
  theme: Theme
  onOpen: () => void
}) {
  const count = resources.filter(resource => resource.moodboardId === moodboard.id).length

  return <FolderIllustration
    size="sm"
    color={theme === 'dark' ? 'white' : 'black'}
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
    <span className="moodboard-collection-name"><Folder size={17} style={{ color: moodboard.color }} />{moodboard.name}<MoreHorizontal size={18} className="moodboard-collection-more" aria-hidden="true" /></span>
  </FolderIllustration>
}

function MoodboardLibrary({ moodboards, resources, theme, onOpenMoodboard, onNewMoodboard }: Pick<DashboardProps, 'moodboards' | 'resources' | 'theme' | 'onOpenMoodboard' | 'onNewMoodboard'>) {
  return <section className="moodboard-library-page">
    <header className="moodboard-library-intro"><h1>Moodboards</h1><Button variant="secondary" size="sm" onClick={onNewMoodboard}><Plus size={15} /> New moodboard</Button></header>
    {moodboards.length > 0
      ? <div className="moodboard-collection-grid">{moodboards.map(moodboard => <MoodboardCollection key={moodboard.id} moodboard={moodboard} resources={resources} theme={theme} onOpen={() => onOpenMoodboard(moodboard.id)} />)}</div>
      : <div className="moodboard-library-empty"><Images size={24} /><h2>No moodboards yet</h2><p>Create a moodboard to give your references a place to live.</p><Button variant="secondary" size="sm" onClick={onNewMoodboard}><Plus size={15} /> New moodboard</Button></div>}
  </section>
}

export function Dashboard(props: DashboardProps) {
  const {
    view, heading, subheading, resources, allResources, moodboards, theme, query,
    signedIn, onRequireAccount, onFavorite, onFile, onOpenMoodboard, onOpenCategory, onNewMoodboard, onAddResource,
  } = props

  return <div className="dashboard-main">
    <div className="page-content">
      {view === 'Moodboard'
        ? <MoodboardLibrary moodboards={moodboards} resources={allResources} theme={theme} onOpenMoodboard={onOpenMoodboard} onNewMoodboard={onNewMoodboard} />
        : view === 'All resources'
          ? <ExplorePage
            resources={resources}
            total={allResources.length}
            query={query}
            moodboards={moodboards}
            signedIn={signedIn}
            onRequireAccount={onRequireAccount}
            onFavorite={onFavorite}
            onFile={onFile}
            onNewMoodboard={onNewMoodboard}
            onOpenCategory={onOpenCategory}
          />
          : <>
            <ResourceList heading={heading === 'All resources' ? 'The good side of the internet.' : heading} subheading={subheading} resources={resources} view={view} moodboards={moodboards} signedIn={signedIn} onRequireAccount={onRequireAccount} onFavorite={onFavorite} onFile={onFile} onNewMoodboard={onNewMoodboard} onAddResource={onAddResource} />
          </>}
    </div>
  </div>
}
