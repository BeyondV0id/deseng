import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/arc/button/button'
import { Input } from '@/components/arc/input/input'
import type { SocialProvider } from '@/lib/api'
import { signIn, signUp } from '@/lib/auth-client'
import { authMessage } from '@/lib/auth-messages'
import { AuthError, AuthSocial } from './auth-shell'

export type AuthMode = 'sign-in' | 'sign-up'

const minimumPasswordLength = 8

/** The words each mode reads by, so the panel and the page never drift. */
const copy = {
  'sign-in': {
    verb: 'Sign in' as const,
    title: 'Sign in',
    submit: 'Sign in',
    switchLabel: 'New here?',
    switchAction: 'Create an account',
    other: 'sign-up' as AuthMode,
  },
  'sign-up': {
    verb: 'Sign up' as const,
    title: 'Create an account',
    submit: 'Create account',
    switchLabel: 'Already have one?',
    switchAction: 'Sign in',
    other: 'sign-in' as AuthMode,
  },
}

/**
 * The form itself, in one place: the same fields, providers, error line and
 * mode switch whether it is drawn in the sign-in window or in the panel that
 * opens over the catalogue. The frame is the caller's business.
 */
export function AuthForm({ mode, onModeChange, onSignedIn, returnTo }: {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  /** Called once the session is live. The caller closes, or leaves, on its own terms. */
  onSignedIn: () => void
  /** Where a provider sends the visitor back to. Defaults to the page it is on. */
  returnTo?: string
}) {
  const location = useLocation()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const words = copy[mode]
  const back = returnTo ?? `${location.pathname}${location.search}`

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')

    setError('')

    if (mode === 'sign-up' && password.length < minimumPasswordLength) {
      setError(`Use at least ${minimumPasswordLength} characters for the password.`)
      return
    }

    setPending(true)

    try {
      if (mode === 'sign-in') {
        const result = await signIn.email({ email, password, rememberMe: true })
        if (result.error) {
          setError(authMessage(result.error, 'Sign in failed. Try again.'))
          setPending(false)
          return
        }
      } else {
        const result = await signUp.email({ name: String(form.get('name') ?? '').trim(), email, password })
        if (result.error) {
          setError(authMessage(result.error, 'Could not create the account. Try again.'))
          setPending(false)
          return
        }
      }

      onSignedIn()
    } catch {
      setError('The server could not be reached. Check that it is running, then try again.')
      setPending(false)
    }
  }

  async function withProvider(provider: SocialProvider) {
    setError('')
    setPending(true)
    try {
      await signIn.social({ provider, callbackURL: `${window.location.origin}${back}` })
    } catch {
      setError('The provider could not be reached. Try again.')
      setPending(false)
    }
  }

  return <>
    <AuthSocial verb={words.verb} disabled={pending} onProvider={withProvider} />

    <form className="auth-form" onSubmit={submit}>
      {mode === 'sign-up' && <Input
        label="Name"
        name="name"
        type="text"
        autoComplete="name"
        required
        autoFocus
        maxLength={60}
        placeholder="Your name"
      />}
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        autoFocus={mode === 'sign-in'}
        placeholder="you@studio.com"
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
        required
        minLength={mode === 'sign-up' ? minimumPasswordLength : undefined}
        description={`At least ${minimumPasswordLength} characters.`}
      />
      <AuthError message={error} />
      <Button type="submit" variant="primary" size="md" loading={pending} className="auth-submit">
        {words.submit}
      </Button>
    </form>

    {mode === 'sign-in' && <p className="auth-aside"><Link to="/forgot-password">Forgot your password?</Link></p>}

    <p className="auth-aside auth-switch">
      {words.switchLabel}{' '}
      <button type="button" className="auth-switch-link" onClick={() => onModeChange(words.other)}>
        {words.switchAction}
      </button>
    </p>
  </>
}
