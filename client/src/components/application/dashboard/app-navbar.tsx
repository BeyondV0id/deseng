import { Bookmark, Plus, Setting4 } from '@/components/icons'
import { Button } from '@/components/arc/button/button'
import { Tooltip } from '@/components/arc/tooltip/tooltip'
import { UserMenu } from '@/components/arc/user-menu/user-menu'
import { setSoundMuted, useSoundMuted } from '@/components/ui/sound'
import type { LibraryMoodboard } from '@/lib/library-types'
import type { ThemePreference } from '@/lib/theme'
import type { Resource } from '@/catalog'
import { MobileMenu } from './mobile-menu'
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
 * The content of the inset's top bar.
 *
 * Above `lg` the sidebar is the column on the page and the bar carries the
 * search and the cluster of actions: favourites, submit and the account as
 * three 40px circles, the same height as the search pill, so the bar reads as
 * one row.
 *
 * Below `lg` the column steps out. The bar keeps three controls only, the
 * menu, the search and the account; favourites and submit move into the menu,
 * and the search takes the lane between them rather than a row of its own.
 *
 * Theme and sound still live only in the account menu, so there is one place
 * to change either.
 */
export function AppNavbar({
  query,
  onQueryChange,
  resources,
  onSubmitResource,
  selected,
  onSelect,
  moodboards,
  onNewMoodboard,
  account,
  onSignIn,
  theme,
  onThemeChange,
  onSelectSettings,
  onSignOut,
  showSearch = true,
}: {
  query: string
  onQueryChange: (query: string) => void
  /** The whole catalogue, so the search reaches past the view on screen. */
  resources: Resource[]
  /** Opens the submit dialog. */
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
  /** Sends a visitor to the sign-in page, keeping the page they were on. */
  onSignIn: () => void
  theme: ThemePreference
  onThemeChange: (theme: ThemePreference) => void
  onSelectSettings: () => void
  onSignOut: () => void
  /** The Explore page has its own search, so the bar can step aside. */
  showSearch?: boolean
}) {
  return <div className="app-topbar-content">
    <MobileMenu
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
      />
    </div>}
    {/* Favourites, submit and the account close the bar as three circles, so
        the search owns the middle and the actions own the corner. Below `lg`
        the first two live in the menu instead. */}
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
      <Tooltip content="Submit a resource">
        <Button
          variant="ghost"
          size="sm"
          className="app-navbar-icon"
          aria-label="Submit a resource"
          onClick={onSubmitResource}
        >
          <Plus size={18} />
        </Button>
      </Tooltip>
      {account
        ? <NavbarAccount
          account={account}
          theme={theme}
          onThemeChange={onThemeChange}
          onSelectSettings={onSelectSettings}
          onSignOut={onSignOut}
        />
        : <Button
          variant="secondary"
          size="sm"
          className="app-navbar-signin"
          onClick={onSignIn}
        >Sign in</Button>}
    </div>
  </div>
}
