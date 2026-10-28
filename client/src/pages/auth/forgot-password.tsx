import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/arc/button/button'
import { Input } from '@/components/arc/input/input'
import { AuthError, AuthShell } from '@/components/auth/auth-shell'
import { authMessage } from '@/lib/auth-messages'
import { requestPasswordReset } from '@/lib/auth-client'

export default function ForgotPasswordPage() {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [sentTo, setSentTo] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()
    setError('')
    setPending(true)

    try {
      const result = await requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      })

      // A rate limit is the one failure worth naming. Anything else answers the
      // same way whether or not the address has an account, so the form cannot
      // be used to find out who is registered.
      if (result.error?.status === 429) {
        setError(authMessage(result.error, 'Too many attempts. Try again shortly.'))
        setPending(false)
        return
      }

      setSentTo(email)
    } catch {
      setError('The server could not be reached. Check that it is running, then try again.')
      setPending(false)
    }
  }

  if (sentTo) {
    return <AuthShell
      title="Check your email"
      description={`We sent a link to ${sentTo}. It opens once and expires in an hour.`}
      footer={<Link to="/sign-in">Back to sign in</Link>}
    >
      <div className="auth-note">
        <p>Nothing arrived? Look in the spam folder, or send it again with the same address.</p>
        <Button type="button" variant="secondary" size="md" className="auth-submit" onClick={() => setSentTo('')}>
          Send again
        </Button>
      </div>
    </AuthShell>
  }

  return <AuthShell
    title="Reset your password"
    description="Enter the address you sign in with and we will send a link to choose a new password."
    footer={<Link to="/sign-in">Back to sign in</Link>}
  >
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
      <AuthError message={error} />
      <Button type="submit" variant="primary" size="md" loading={pending} className="auth-submit">
        Send the link
      </Button>
    </form>
  </AuthShell>
}
