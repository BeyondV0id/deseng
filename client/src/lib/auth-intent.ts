/**
 * The one action a visitor asked for before signing in, kept across the trip
 * through the auth pages so the page can finish the job when they return:
 * a favourite, the favourites view, a new moodboard or a submission.
 *
 * It lives in sessionStorage, not localStorage: it belongs to this tab and to
 * one trip through sign-in, and it is read and removed in the same breath.
 */
export type AuthIntent =
  | { kind: 'favorite'; resourceId: string }
  | { kind: 'view'; view: string }
  | { kind: 'new-moodboard' }
  | { kind: 'submit' }

const storageKey = 'desgnix-auth-intent'

export function setAuthIntent(intent: AuthIntent) {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(intent))
  } catch {}
}

export function clearAuthIntent() {
  try {
    sessionStorage.removeItem(storageKey)
  } catch {}
}

/** Reads the intent and removes it, so it is applied at most once. */
export function takeAuthIntent(): AuthIntent | null {
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return null
    sessionStorage.removeItem(storageKey)
    const value = JSON.parse(raw) as Partial<AuthIntent> | null
    if (!value || typeof value.kind !== 'string') return null
    switch (value.kind) {
      case 'favorite':
        return typeof value.resourceId === 'string' ? { kind: 'favorite', resourceId: value.resourceId } : null
      case 'view':
        return typeof value.view === 'string' ? { kind: 'view', view: value.view } : null
      case 'new-moodboard':
      case 'submit':
        return { kind: value.kind }
      default:
        return null
    }
  } catch {
    return null
  }
}
