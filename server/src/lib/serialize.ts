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
  /** Remote preview image, or `null` when the site has none. */
  imageUrl: string | null
  /** The site's own mark, the step after the preview fails. */
  faviconUrl: string | null
  imageWidth: number | null
  imageHeight: number | null
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
    imageUrl: row.imageUrl,
    faviconUrl: row.faviconUrl,
    imageWidth: row.imageWidth,
    imageHeight: row.imageHeight,
    savedAt: (state?.savedAt ?? row.createdAt).toISOString().slice(0, 10),
    favorite: state?.favorite ?? false,
    ...(state?.moodboardId ? { moodboardId: state.moodboardId } : {}),
    submitted: row.submittedById !== null,
  }
}

/** Where a submission stands. Anything else on the row is read as pending. */
export type SubmissionState = 'pending' | 'approved' | 'declined'

/** One listing as the account that sent it sees it: the entry, when it
 *  arrived, and where the review stands. */
export type ApiSubmission = {
  id: string
  name: string
  url: string
  description: string
  category: string
  faviconUrl: string | null
  /** The moment it was added, as an ISO string, so the client formats it. */
  submittedAt: string
  state: SubmissionState
}

function readReviewState(value: string): SubmissionState {
  return value === 'approved' || value === 'declined' ? value : 'pending'
}

export function serializeSubmission(row: ResourceRow): ApiSubmission {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    description: row.description,
    category: row.category,
    faviconUrl: row.faviconUrl,
    submittedAt: row.createdAt.toISOString(),
    state: readReviewState(row.reviewStatus),
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
