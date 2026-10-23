import type { Resource } from '@/catalog'
import type { LibraryMoodboard } from '@/lib/library-types'
import { ResourceCard } from './resource-card'

type ResourceGridProps = {
  resources: Resource[]
  moodboards: LibraryMoodboard[]
  onFavorite: (id: string) => void
  onMoodboard: (id: string, moodboardId: string) => void
  onOpenResource: (resource: Resource) => void
}

export function ResourceGrid({ resources, moodboards, onFavorite, onMoodboard, onOpenResource }: ResourceGridProps) {
  return <div className="resource-grid">{resources.map((resource, index) => <ResourceCard
    key={resource.id}
    resource={resource}
    index={index}
    moodboards={moodboards}
    onFavorite={onFavorite}
    onMoodboard={onMoodboard}
    onOpen={onOpenResource}
  />)}</div>
}
