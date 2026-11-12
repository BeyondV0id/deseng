export type LibraryMoodboard = {
  id: string
  name: string
  color: string
  description?: string
}

/** Where a submitted listing stands. The server narrows anything else to `pending`. */
export type SubmissionState = 'pending' | 'approved' | 'declined'

/**
 * One listing this account sent, as `GET /api/submissions` returns it: the
 * entry itself, the moment it arrived, and where the review stands.
 */
export type LibrarySubmission = {
  id: string
  name: string
  url: string
  description: string
  category: string
  faviconUrl: string | null
  /** ISO timestamp, formatted for display on the client. */
  submittedAt: string
  state: SubmissionState
}
