import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/arc/button/button'
import { Input } from '@/components/arc/input/input'
import { AuthError, AuthShell, AuthSocial } from '@/components/auth/auth-shell'
import type { SocialProvider } from '@/lib/api'
import { signIn } from '@/lib/auth-client'
import { authMessage } from '@/lib/auth-messages'

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError('')
    setPending(true)

    try {
      const result = await signIn.email({
        email: String(form.get('email') ?? '').trim(),
        password: String(form.get('password') ?? ''),
        rememberMe: true,
      })

      if (result.error) {
        setError(authMessage(result.error, 'Sign in failed. Try again.'))
        setPending(false)
        return
      }

      navigate(from, { replace: true })
    } catch {
      setError('The server could not be reached. Check that it is running, then try again.')
      setPending(false)
    }
  }

  async function withProvider(provider: SocialProvider) {
    setError('')
    setPending(true)
    try {
      await signIn.social({ provider, callbackURL: `${window.location.origin}${from}` })
    } catch {
      setError('The provider could not be reached. Try again.')
      setPending(false)
    }
  }

  return <AuthShell
    title="Sign in"
    footer={<>New here? <Link to="/sign-up">Create an account</Link></>}
  >
    <AuthSocial verb="Sign in" disabled={pending} onProvider={withProvider} />

    <form className="auth-form" onSubmit={submit}>
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        autoFocus
        placeholder="you@studio.com"
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        description="At least 8 characters."
      />
      <AuthError message={error} />
      <Button type="submit" variant="primary" size="md" loading={pending} className="auth-submit">
        Sign in
      </Button>
    </form>

    <p className="auth-aside"><Link to="/forgot-password">Forgot your password?</Link></p>
  </AuthShell>
}
