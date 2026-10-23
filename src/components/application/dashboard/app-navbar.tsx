import { useState } from 'react'
import { Bookmark, Box, Menu, Plane3, Settings } from '@/components/icons'
import { Button } from '@/components/arc/button/button'
import { SearchField } from '@/components/arc/search-field/search-field'
import { UserMenu } from '@/components/arc/user-menu/user-menu'
import { Dialog, DialogContent } from '@/components/arc/dialog/dialog'
import { SignIn } from '@/components/arc/blocks/sign-in/sign-in'

/** The signed-in account behind the profile in the top bar. */
const accountUser = {
  name: 'Harsha Vardhan',
  email: 'theharshamal@gmail.com',
  plan: 'Free plan',
}

export function AppNavbar({ onOpenNavigation, onGoHome, view, onSelectView, query, onQueryChange, onSubmitResource, onOpenSettings, onSelectSubmissions, showSearch = true }: {
  onOpenNavigation: () => void
  onGoHome: () => void
  view: string
  onSelectView: (view: string) => void
  query: string
  onQueryChange: (query: string) => void
  /** Opens the submit dialog. */
  onSubmitResource: () => void
  /** Opens the settings, which live at the foot of the sidebar. */
  onOpenSettings: () => void
  /** Goes to the resources this account has submitted. */
  onSelectSubmissions: () => void
  /** The Explore page has its own large search, so the bar steps aside. */
  showSearch?: boolean
}) {
  const [signInOpen, setSignInOpen] = useState(false)
  return <header className="app-navbar">
    <button aria-label="Open navigation" className="icon-button mobile-menu-button" onClick={onOpenNavigation}>
      <Menu size={19} />
    </button>
    <a className="brand app-navbar-brand" href="#home" aria-label="Fieldnotes home" onClick={event => { event.preventDefault(); onGoHome() }}>
      <span className="brand-mark"><Box size={17} /></span>
      <span>InspoDesign<span className="brand-period">.</span></span>
    </a>
    {showSearch && <div className="app-navbar-search"><SearchField label="Search resources" value={query} onValueChange={onQueryChange} placeholder="Search" /></div>}
    <div className="app-navbar-actions">
      <nav className="app-navbar-nav" aria-label="Favorites">
        <Button variant="ghost" size="sm" className="app-nav-link app-favorites-link" aria-label="Favorites" title="Favorites" aria-current={view === 'Favorites' ? 'page' : undefined} onClick={() => onSelectView('Favorites')}><Bookmark size={18} /></Button>
      </nav>
      <Button variant="ghost" size="sm" className="app-submit-button" onClick={onSubmitResource}>Submit</Button>
      <UserMenu
        className="app-navbar-user"
        user={accountUser}
        align="end"
        showTheme={false}
        items={[
          { label: 'Settings', icon: <Settings size={16} strokeWidth={1.75} />, onSelect: onOpenSettings },
          { label: 'Submissions', icon: <Plane3 size={16} strokeWidth={1.75} />, onSelect: onSelectSubmissions },
        ]}
        onSignOut={() => setSignInOpen(true)}
      />
    </div>
    <Dialog open={signInOpen} onOpenChange={next => { if (!next) setSignInOpen(false) }}>
      <DialogContent title="Your account" description="Sign in with a different email, or with a passkey.">
        <div className="signin-dialog-body"><SignIn onSignIn={() => setSignInOpen(false)} /></div>
      </DialogContent>
    </Dialog>
  </header>
}
