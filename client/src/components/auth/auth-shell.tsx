import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/arc/button/button'
import { BrandMark } from '@/components/brand/brand-mark'
import GradientASCII from '@/components/ui/gradient-ascii/gradient-ascii'
import { ThemeSync } from '@/components/ui/theme-sync'
import { api, type SocialProvider } from '@/lib/api'
import { GitHubMark, GoogleMark } from './provider-mark'

/**
 * The frame every auth page shares: a full-height panel of artwork beside the
 * form, the wordmark at the head of the form's column, and the alternate route
 * under it. The artwork is decoration, so it is hidden from a screen reader and
 * the form column is the only thing that has to work at phone width.
 */
export function AuthShell({ title, description, children, footer }: {
  title: string
  /** One line under the heading. Omitted where the heading says enough. */
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return <div className="auth-page">
    <ThemeSync />
    <aside className="auth-visual" aria-hidden="true">
      <GradientASCII
        colors={['#120a2e', '#5b21b6', '#a78bfa', '#efeaff']}
        shape="pinch"
        cellSize={20}
        density={0.88}
        glow={0.55}
        softness={0.6}
        scale={1.5}
        speed={0.4}
      />
    </aside>
    <div className="auth-panel">
      <Link to="/" className="auth-brand" aria-label="desgnix home">
        <BrandMark />
        <span className="auth-brand-name">desgnix<span className="brand-period">.</span></span>
      </Link>
      <div className="auth-stage">
        <main className="auth-card">
          <header className="auth-intro">
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </header>
          {children}
        </main>
        {footer ? <p className="auth-alternate">{footer}</p> : null}
      </div>
    </div>
  </div>
}

const providerLabel: Record<SocialProvider, string> = {
  google: 'Google',
  github: 'GitHub',
}

/** Both providers, in the order they read: Google, then GitHub. */
const socialProviders: SocialProvider[] = ['google', 'github']

/**
 * The two provider buttons, side by side above the email form. They are always
 * shown, so the page looks the same whether or not the server holds the
 * credentials; a provider the server has not been given yet says so when it is
 * pressed instead of doing nothing.
 */
export function AuthSocial({ verb, disabled, onProvider }: {
  /** The page's own verb, so the buttons name the action they take. */
  verb: 'Sign in' | 'Sign up'
  disabled: boolean
  onProvider: (provider: SocialProvider) => void
}) {
  const [available, setAvailable] = useState<SocialProvider[] | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let live = true
    api.config()
      .then((config) => { if (live) setAvailable(config.socialProviders) })
      .catch(() => { if (live) setAvailable([]) })
    return () => { live = false }
  }, [])

  function choose(provider: SocialProvider) {
    // `null` means the check has not answered yet: let the click through and
    // the provider's own error decides.
    if (available && !available.includes(provider)) {
      setNotice(`${providerLabel[provider]} is not set up on this server yet. Use your email instead.`)
      return
    }
    setNotice('')
    onProvider(provider)
  }

  return <>
    <div className="auth-social">
      {socialProviders.map((provider) => <Button
        key={provider}
        type="button"
        variant="secondary"
        size="md"
        disabled={disabled}
        aria-label={`${verb} with ${providerLabel[provider]}`}
        onClick={() => choose(provider)}
      >
        {provider === 'google' ? <GoogleMark /> : <GitHubMark />}
        {verb} with {providerLabel[provider]}
      </Button>)}
    </div>
    <AuthError message={notice} />
    <div className="auth-divider" role="separator"><span>or use your email</span></div>
  </>
}

/**
 * One line for anything that went wrong, in the app's own words. The wrapper is
 * what opens: the line grows to its height and slides the form below it down,
 * rather than appearing in a space the submit button has already jumped into.
 */
export function AuthError({ message }: { message: string }) {
  if (!message) return null
  return <div className="auth-error-slot">
    <p className="auth-error" role="alert">{message}</p>
  </div>
}
