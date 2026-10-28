import { createAuthClient } from 'better-auth/react'

/**
 * Same origin as the page. In development Vite proxies `/api` to the Express
 * server, so the session cookie is first-party in both dev and production and
 * no CORS rule is involved. `basePath` is where `src/index.ts` mounts the
 * Better Auth handler.
 */
export const authClient = createAuthClient({
  baseURL: typeof window === 'undefined' ? 'http://localhost:3001' : window.location.origin,
  basePath: '/api/auth',
})

export const { signIn, signUp, signOut, useSession, requestPasswordReset, resetPassword, updateUser } = authClient
