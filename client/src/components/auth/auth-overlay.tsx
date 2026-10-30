import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Button } from '@/components/arc/button/button'
import { X } from '@/components/icons'
import { AuthForm, type AuthMode } from './auth-form'
import { AuthShell } from './auth-shell'

/**
 * Signing in from the top bar opens the auth window itself, the one the
 * `/sign-in` route draws, laid over the catalogue instead of replacing it: the
 * shelf, the search and the cards stay behind the scrim, and the route never
 * changes.
 *
 * It is a dialog, not a popover, because that is what it is: a single window
 * with one job that holds focus until it is answered or dismissed. Escape, the
 * scrim and the close control all leave the page exactly where it was, and the
 * intent the visitor arrived with (a favourite, a moodboard, submit) is still
 * completed by the page once the session is live.
 */
export function AuthOverlay({ mode, onModeChange }: {
  mode: AuthMode | null
  onModeChange: (mode: AuthMode | null) => void
}) {
  const title = mode === 'sign-up' ? 'Create an account' : 'Sign in'

  return <DialogPrimitive.Root
    open={mode !== null}
    onOpenChange={next => onModeChange(next ? (mode ?? 'sign-in') : null)}
  >
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="auth-scrim" />
      <DialogPrimitive.Content
        className="auth-overlay"
        aria-describedby={undefined}
        // The dialog covers the screen, so the scrim is behind the content and
        // a press on it never reaches Radix's outside handler. Anything that is
        // not the window dismisses, which is the same gesture.
        onPointerDown={event => {
          if ((event.target as HTMLElement).closest('.auth-window')) return
          onModeChange(null)
        }}
      >
        {/* The window draws its own heading in the artwork's reading order; this
            one names the dialog itself for a screen reader. */}
        <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
        {mode !== null && <AuthShell
          overlay
          title={title}
          close={<DialogPrimitive.Close asChild>
            <Button variant="ghost" size="sm" className="auth-close" aria-label="Close sign in">
              <X size={16} />
            </Button>
          </DialogPrimitive.Close>}
        >
          <AuthForm
            key={mode}
            mode={mode}
            onModeChange={onModeChange}
            onSignedIn={() => onModeChange(null)}
          />
        </AuthShell>}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
}
