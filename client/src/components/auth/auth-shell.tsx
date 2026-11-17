import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/arc/button/button'
import { BrandMark } from '@/components/brand/brand-mark'
import cosmosArtwork from '@/bg/Found on Cosmos.jpg'
import { ThemeSync } from '@/components/ui/theme-sync'
import { api, type SocialProvider } from '@/lib/api'
import { Elevated } from '@/lib/elevated'
import { GitHubMark, GoogleMark } from './provider-mark'

/**
 * The window is exactly as tall as the form it holds. The height is measured
 * from the form stack and written back as a custom property, because a window
 * that keeps one fixed height has to open a scroll area inside the form column
 * the moment a mode adds a field or an error adds a line. Measuring means
 * sign-up simply gets the taller window it needs, and the two heights can be
 * eased between instead of snapped.
 *
 * It is measured before paint, so the first frame is already the right height;
 * the transition only switches on one frame later, once the window has settled,
 * and the column only takes a scrollbar when the viewport cap has been hit and
 * the form genuinely cannot fit.
 */
function useWindowHeight() {
  const windowRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<() => void>(() => {})
  const [sized, setSized] = useState(false)

  useLayoutEffect(() => {
    const authWindow = windowRef.current
    const panel = panelRef.current
    const body = bodyRef.current
    const page = authWindow?.parentElement
    if (!authWindow || !panel || !body || !page) return

    function measure() {
      const panelStyle = getComputedStyle(panel!)
      const frame = parseFloat(panelStyle.paddingTop) + parseFloat(panelStyle.paddingBottom)
      // `ceil` stops a fractional line height from leaving a sliver of overflow.
      const height = Math.ceil(body!.getBoundingClientRect().height + frame)
      authWindow!.style.setProperty('--auth-window-height', `${height}px`)

      const pageStyle = getComputedStyle(page!)
      const gutter = parseFloat(pageStyle.paddingTop) + parseFloat(pageStyle.paddingBottom)
      const available = page!.clientHeight - gutter
      authWindow!.toggleAttribute('data-clamped', height > available + 0.5)
    }

    measureRef.current = measure
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(body)
    // The column's padding changes at the narrow breakpoints, and a window
    // resize does not necessarily resize the stack inside it.
    window.addEventListener('resize', measure)
    // A frame callback is the clean way to wait until the first paint has
    // happened. A tab that is never painted (backgrounded, or an occluded
    // window) never runs one, and the transition is only a nicety, so a timer
    // stands in for it.
    const settle = requestAnimationFrame(() => setSized(true))
    const timer = setTimeout(() => setSized(true), 300)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      cancelAnimationFrame(settle)
      clearTimeout(timer)
    }
  }, [])

  // A new mode swaps the form without the observer necessarily delivering in
  // the same frame, so the window is measured again after every render.
  useLayoutEffect(() => {
    measureRef.current()
  })

  return { windowRef, panelRef, bodyRef, sized }
}

/**
 * The frame every auth surface shares: the artwork, and the form in one rounded
 * window carrying the same weight as a dialog. The artwork is decoration, so it
 * is hidden from a screen reader and the window is the only thing that has to
 * work at phone width.
 *
 * The same window is drawn two ways. On its own route it *is* the page, so it
 * paints the ground and centres itself in the viewport. Opened from the top bar
 * it is laid over the catalogue instead: `overlay` drops the ground, and the
 * `close` control turns it into something a visitor can dismiss and come back
 * from. The brand stops being a link there, because the page it would lead to is
 * already behind the window.
 */
export function AuthShell({ title, description, children, footer, overlay = false, close }: {
  title: string
  /** One line under the heading. Omitted where the heading says enough. */
  description?: string
  children: ReactNode
  footer?: ReactNode
  /** Laid over the page rather than being it. */
  overlay?: boolean
  /** The dismiss control, supplied by whoever opened the window. */
  close?: ReactNode
}) {
  const { windowRef, panelRef, bodyRef, sized } = useWindowHeight()
  const brand = <>
    <BrandMark />
    <span className="auth-brand-name">Reference</span>
  </>

  return <div className={overlay ? 'auth-page auth-page-overlay' : 'auth-page'}>
    <ThemeSync />
    <Elevated offset={4} className="auth-window" ref={windowRef} data-sized={sized ? 'true' : undefined}>
      {close}
      <aside className="auth-visual" aria-hidden="true">
        <img className="auth-visual-image" src={cosmosArtwork} alt="" />
      </aside>
      <div className="auth-panel" ref={panelRef}>
        <div className="auth-panel-body" ref={bodyRef}>
          {overlay
            ? <span className="auth-brand">{brand}</span>
            : <Link to="/" className="auth-brand" aria-label="Reference home">{brand}</Link>}
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
    </Elevated>
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
        variant="ghost"
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
