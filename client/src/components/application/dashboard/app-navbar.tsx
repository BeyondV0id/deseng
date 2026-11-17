import { Bookmark, Setting4 } from '@/components/icons'
import { Button } from '@/components/arc/button/button'
import { UserMenu } from '@/components/arc/user-menu/user-menu'
import { AuthOverlay } from '@/components/auth/auth-overlay'
import type { AuthMode } from '@/components/auth/auth-form'
import { setSoundMuted, useSoundMuted } from '@/components/ui/sound'
import type { LibraryMoodboard } from '@/lib/library-types'
import type { ThemePreference } from '@/lib/theme'
import type { Resource } from '@/catalog'
import { NavigationMenu } from './navigation-menu'
import { SearchPalette } from './search-palette'

/** The plan line under the account's name. */
const accountPlan = 'Free plan'

/**
 * The account, as the Arc menu behind the photo. It sits in the top bar beside
 * the favourites shortcut, so it is outside the phone menu's focus trap and
 * one surface serves both widths. The menu opens to the right, into the bar.
 */
function NavbarAccount({
  account,
  theme,
  onThemeChange,
  onSelectSettings,
  onSignOut,
}: {
  account: { name: string; email: string }
  theme: ThemePreference
  onThemeChange: (theme: ThemePreference) => void
  onSelectSettings: () => void
  onSignOut: () => void
}) {
  const muted = useSoundMuted()

  return <UserMenu
    className="app-navbar-avatar"
    user={{ ...account, plan: accountPlan, initials: account.name.trim().charAt(0).toUpperCase() }}
    align="start"
    theme={theme}
    onThemeChange={onThemeChange}
    showTheme
    soundMuted={muted}
    onSoundMutedChange={setSoundMuted}
    showSound
    showSettingsLabel={false}
    trailingItems={[{
      label: 'Settings',
      icon: <Setting4 size={16} />,
      onSelect: onSelectSettings,
    }]}
    onSignOut={onSignOut}
  />
}

/**
 * The top bar carries navigation, search and account controls at every width.
 *
 * Above `lg` the bar carries the search, a favourites shortcut, a labelled
 * Submit action and the account. Each control matches the height of the
 * search pill.
 *
 * Below `lg` the bar keeps three controls only, the
 * menu, the search and the account; favourites and submit move into the menu,
 * and the search takes the lane between them rather than a row of its own.
 *
 * Theme and sound still live only in the account menu, so there is one place
 * to change either.
 */
export function AppNavbar({
  query,
  onQueryChange,
  onOpenTag,
  resources,
  onSubmitResource,
  selected,
  onSelect,
  moodboards,
  onNewMoodboard,
  account,
  authMode,
  onAuthModeChange,
  onAuthDismiss,
  theme,
  onThemeChange,
  onSelectSettings,
  onSignOut,
  showSearch = true,
}: {
  query: string
  onQueryChange: (query: string) => void
  /** Opens the page holding every entry filed under a tag the search names. */
  onOpenTag: (category: string) => void
  /** The whole catalogue, so the search reaches past the view on screen. */
  resources: Resource[]
  /** Opens the submit page. */
  onSubmitResource: () => void
  /** The view on screen, so the favourites shortcut can mark itself. */
  selected: string
  onSelect: (view: string) => void
  /** The account's own moodboards, listed in the menu below `lg`. */
  moodboards: LibraryMoodboard[]
  /** Opens the create-moodboard dialog from the menu below `lg`. */
  onNewMoodboard: () => void
  /** The signed-in name and email, or null while browsing without an account. */
  account: { name: string; email: string } | null
  /** The sign-in panel's state: null while it is closed. */
  authMode: AuthMode | null
  onAuthModeChange: (mode: AuthMode | null) => void
  onAuthDismiss: () => void
  theme: ThemePreference
  onThemeChange: (theme: ThemePreference) => void
  onSelectSettings: () => void
  onSignOut: () => void
  /** The Explore page has its own search, so the bar can step aside. */
  showSearch?: boolean
}) {
  return <div className="app-topbar-content">
    <NavigationMenu
      selected={selected}
      onSelect={onSelect}
      onSubmitResource={onSubmitResource}
      moodboards={moodboards}
      onNewMoodboard={onNewMoodboard}
      resources={resources}
    />
    {showSearch && <div className="app-navbar-search">
      <SearchPalette
        resources={resources}
        query={query}
        onQueryChange={onQueryChange}
        onOpenTag={onOpenTag}
      />
    </div>}
    {/* Below lg, favourites and Submit live in the menu. */}
    <div className="app-navbar-actions">
      <Button
        variant="ghost"
        size="sm"
        className="app-navbar-icon"
        aria-label="Favourites"
        aria-current={selected === 'Favorites' ? 'page' : undefined}
        onClick={() => onSelect('Favorites')}
      >
        <Bookmark size={18} />
      </Button>
      <Button
        variant="primary"
        size="sm"
        className="app-navbar-submit"
        aria-label="Submit a resource"
        onClick={onSubmitResource}
      >Submit</Button>
      {account
        ? <NavbarAccount
          account={account}
          theme={theme}
          onThemeChange={onThemeChange}
          onSelectSettings={onSelectSettings}
          onSignOut={onSignOut}
        />
        : <>
          <Button
            variant="secondary"
            size="sm"
            className="app-navbar-signin"
            aria-haspopup="dialog"
            aria-expanded={authMode !== null}
            onClick={() => onAuthModeChange('sign-in')}
          >Sign in</Button>
          <AuthOverlay mode={authMode} onModeChange={onAuthModeChange} onDismiss={onAuthDismiss} />
        </>}
    </div>
  </div>
}
