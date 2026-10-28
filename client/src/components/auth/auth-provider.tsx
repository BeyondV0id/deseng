import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader } from '@/components/icons'
import { ThemeSync } from '@/components/ui/theme-sync'
import { useSession } from '@/lib/auth-client'

/**
 * The session, resolved once and read everywhere: the account menu, the
 * settings dialog, and the guards on the app shell. Better Auth's own hook
 * does the fetching and refetching; this only shapes it for the app.
 */

export type AuthUser = {
  id: string
  name: string
  email: string
  image?: string | null
}

type AuthContextValue = {
  user: AuthUser | null
  isPending: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = useSession()

  const value = useMemo<AuthContextValue>(() => ({
    user: data?.user
      ? {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          image: data.user.image,
        }
      : null,
    isPending,
  }), [data, isPending])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

/** The page while the session is still being read. No flash of the wrong state. */
export function AuthBoot() {
  return <div className="auth-boot" role="status" aria-live="polite">
    <ThemeSync />
    <Loader size={18} />
    <span>Opening your library</span>
  </div>
}

/**
 * The app shell. A request that arrives without a session is sent to sign-in
 * with the address it asked for, so the form can return there afterwards.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isPending } = useAuth()
  const location = useLocation()

  if (isPending) return <AuthBoot />
  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: `${location.pathname}${location.search}` }} />
  }
  return <>{children}</>
}

/** Sign-in, sign-up and the reset pages, which a signed-in account never needs. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, isPending } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (isPending) return <AuthBoot />
  if (user) return <Navigate to={from} replace />
  return <>{children}</>
}
