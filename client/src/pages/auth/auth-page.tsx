import { useLocation, useNavigate } from 'react-router-dom'
import { AuthForm, type AuthMode } from '@/components/auth/auth-form'
import { AuthShell } from '@/components/auth/auth-shell'

/**
 * The standalone auth page, one window for both modes. The route picks the form
 * and the switch swaps it in place instead of travelling to the other route: the
 * window stays the same element, so it can ease between the two heights rather
 * than the page flashing a new one. The routes remain for a deep link and for a
 * provider callback, which has to land on a whole page.
 */
export default function AuthPage({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  return <AuthShell title={mode === 'sign-up' ? 'Create an account' : 'Sign in'}>
    <AuthForm
      key={mode}
      mode={mode}
      returnTo={from}
      onModeChange={next => navigate(next === 'sign-up' ? '/sign-up' : '/sign-in', {
        state: { from },
        replace: true,
      })}
      onSignedIn={() => navigate(from, { replace: true })}
    />
  </AuthShell>
}
