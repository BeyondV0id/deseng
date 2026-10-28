import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/arc/button/button'
import { Input } from '@/components/arc/input/input'
import { AuthError, AuthShell, AuthSocial } from '@/components/auth/auth-shell'
import type { SocialProvider } from '@/lib/api'
import { signIn, signUp } from '@/lib/auth-client'
import { authMessage } from '@/lib/auth-messages'

const minimumPasswordLength = 8

export default function SignUpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') ?? '')

    setError('')

    if (password.length < minimumPasswordLength) {
      setError(`Use at least ${minimumPasswordLength} characters for the password.`)
      return
    }

    setPending(true)

    try {
      const result = await signUp.email({
        name: String(form.get('name') ?? '').trim(),
        email: String(form.get('email') ?? '').trim(),
        password,
      })

      if (result.error) {
        setError(authMessage(result.error, 'Could not create the account. Try again.'))
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
    title="Create an account"
    footer={<>Already have one? <Link to="/sign-in">Sign in</Link></>}
  >
    <AuthSocial verb="Sign up" disabled={pending} onProvider={withProvider} />

    <form className="auth-form" onSubmit={submit}>
      <Input
        label="Name"
        name="name"
        type="text"
        autoComplete="name"
        required
        autoFocus
        maxLength={60}
        placeholder="Your name"
      />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@studio.com"
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={minimumPasswordLength}
        description={`At least ${minimumPasswordLength} characters.`}
      />
      <AuthError message={error} />
      <Button type="submit" variant="primary" size="md" loading={pending} className="auth-submit">
        Create account
      </Button>
    </form>
  </AuthShell>
}
