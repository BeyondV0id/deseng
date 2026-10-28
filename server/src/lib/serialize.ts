import type { moodboard, resource, userResource } from '../db/schema.js'

type ResourceRow = typeof resource.$inferSelect
type UserResourceRow = typeof userResource.$inferSelect
type MoodboardRow = typeof moodboard.$inferSelect

/**
 * One catalogue entry as the client sees it: the shared row plus this
 * account's own state, which is empty when the account has not touched it.
 */
export type ApiResource = {
  id: string
  name: string
  url: string
  description: string
  category: string
  rank: number
  savedAt: string
  favorite: boolean
  moodboardId?: string
  submitted: boolean
}

export function serializeResource(row: ResourceRow, state?: UserResourceRow): ApiResource {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    description: row.description,
    category: row.category,
    rank: row.rank,
    savedAt: (state?.savedAt ?? row.createdAt).toISOString().slice(0, 10),
    favorite: state?.favorite ?? false,
    ...(state?.moodboardId ? { moodboardId: state.moodboardId } : {}),
    submitted: row.submittedById !== null,
  }
}

export function serializeMoodboard(row: MoodboardRow) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    description: row.description,
  }
}
