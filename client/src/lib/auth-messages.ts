/** Better Auth's own failure, in the app's words. Shared by every auth form. */
export function authMessage(error: { status?: number; message?: string }, fallback: string) {
  if (error.status === 429) return 'Too many attempts. Wait a minute and try again.'
  if (error.status === 401) return 'That email and password do not match.'
  return error.message || fallback
}
