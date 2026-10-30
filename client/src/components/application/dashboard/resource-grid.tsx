import type { LibraryMoodboard } from '@/lib/library-types'
import type { Resource } from '@/catalog'
import { ResourceCard } from './resource-card'

type ResourceGridProps = {
  resources: Resource[]
  moodboards: LibraryMoodboard[]
  signedIn: boolean
  onRequireAccount: () => void
  onFavorite: (id: string) => void
  onFile: (id: string, moodboardId: string) => void
  onNewMoodboard: () => void
}

export function ResourceGrid({ resources, moodboards, signedIn, onRequireAccount, onFavorite, onFile, onNewMoodboard }: ResourceGridProps) {
  return <div className="resource-grid">{resources.map(resource => <ResourceCard
    key={resource.id}
    resource={resource}
    moodboards={moodboards}
    signedIn={signedIn}
    onRequireAccount={onRequireAccount}
    onFavorite={onFavorite}
    onFile={onFile}
    onNewMoodboard={onNewMoodboard}
  />)}</div>
}
