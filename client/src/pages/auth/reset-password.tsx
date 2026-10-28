import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/arc/button/button'
import { Input } from '@/components/arc/input/input'
import { AuthError, AuthShell } from '@/components/auth/auth-shell'
import { authMessage } from '@/lib/auth-messages'
import { resetPassword } from '@/lib/auth-client'

const minimumPasswordLength = 8

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const linkError = params.get('error')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const password = String(new FormData(event.currentTarget).get('password') ?? '')
    setError('')

    if (password.length < minimumPasswordLength) {
      setError(`Use at least ${minimumPasswordLength} characters for the password.`)
      return
    }

    setPending(true)

    try {
      const result = await resetPassword({ newPassword: password, token })

      if (result.error) {
        setError(authMessage(result.error, 'That link no longer works. Ask for a new one.'))
        setPending(false)
        return
      }

      setDone(true)
    } catch {
      setError('The server could not be reached. Check that it is running, then try again.')
      setPending(false)
    }
  }

  if (done) {
    return <AuthShell
      title="Password updated"
      description="Your account has a new password. Sign in with it on this device and anywhere else you use desgnix."
      footer={<Link to="/sign-in">Back to sign in</Link>}
    >
      <Button type="button" variant="primary" size="md" className="auth-submit" onClick={() => navigate('/sign-in')}>
        Go to sign in
      </Button>
    </AuthShell>
  }

  if (!token || linkError) {
    return <AuthShell
      title="This link has expired"
      description="Reset links work once and last an hour. Ask for a new one and it will arrive in a moment."
      footer={<Link to="/sign-in">Back to sign in</Link>}
    >
      <Button type="button" variant="secondary" size="md" className="auth-submit" onClick={() => navigate('/forgot-password')}>
        Send a new link
      </Button>
    </AuthShell>
  }

  return <AuthShell
    title="Choose a new password"
    description="Pick something you have not used here before. The link stops working once you save."
    footer={<Link to="/sign-in">Back to sign in</Link>}
  >
    <form className="auth-form" onSubmit={submit}>
      <Input
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        autoFocus
        minLength={minimumPasswordLength}
        description={`At least ${minimumPasswordLength} characters.`}
      />
      <AuthError message={error} />
      <Button type="submit" variant="primary" size="md" loading={pending} className="auth-submit">
        Save the password
      </Button>
    </form>
  </AuthShell>
}
