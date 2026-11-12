import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { Pen } from '@/components/icons'
import { Avatar } from '@/components/arc/avatar/avatar'
import { Button } from '@/components/arc/button/button'
import { Dialog, DialogContent } from '@/components/arc/dialog/dialog'
import { Input } from '@/components/arc/input/input'
import { Textarea } from '@/components/arc/textarea/textarea'
import { ColorPicker } from '@/components/arc/color-picker/color-picker'
import { SubmitDialog } from '@/components/application/dashboard/submit-dialog'
import { AppNavbar } from '@/components/application/dashboard/app-navbar'
import { CatalogStatus } from '@/components/application/dashboard/catalog-status'
import { Dashboard } from '@/components/application/dashboard/dashboard'
import { LIBRARY_SUBHEADING } from '@/components/application/dashboard/library-copy'
import { infoDescription } from '@/components/application/dashboard/info-content'
import { sponsorDescription } from '@/components/application/dashboard/sponsor-content'
import { legalDocuments } from '@/components/application/dashboard/legal-content'
import { useAuth } from '@/components/auth/auth-provider'
import type { AuthMode } from '@/components/auth/auth-form'
import { GitHubMark, GoogleMark } from '@/components/auth/provider-mark'
import { AppSidebar } from '@/components/sidebar-preset/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { StripedPattern } from '@/components/ui/striped-pattern'
import { SidebarInsetTopbar } from '@/components/sidebar-app/inset-topbar'
import type { Theme, ThemeSwitchVariant } from '@/components/arc/theme-switch/theme-switch'
import { prefersDark, readStoredTheme, themeStorageKey, type ThemePreference } from '@/lib/theme'
import type { LibraryMoodboard } from '@/lib/library-types'
import { api, ApiError, type SocialProvider } from '@/lib/api'
import { clearAuthIntent, setAuthIntent, takeAuthIntent, type AuthIntent } from '@/lib/auth-intent'
import { usePageMeta } from '@/hooks/use-page-meta'
import { deleteUser, listAccounts, signOut, updateUser } from '@/lib/auth-client'
import { categoryFromView, categoryView, comparePopularity, collectionById, type Resource } from '@/catalog'
import { allResources, favorites, infoView, legalViews, moodboardShelf, pathForView, sponsorView, viewForPath } from '@/lib/view-path'

/** The view strings the app reasons in; their addresses live in `view-path`. */
const views = { allResources, favorites, moodboardShelf, infoView }

/** Favourites and moodboards live on an account; a shelf, a tag and info do not. */
function needsAccount(view: string) {
  if (view === views.favorites || view === views.moodboardShelf) return true
  if (view === views.infoView || view === sponsorView || legalViews.includes(view as typeof legalViews[number])) return false
  return view !== views.allResources
    && collectionById(view) === undefined
    && categoryFromView(view) === null
}

/** The swatches offered for a moodboard, in the order the reference shows them. */
const moodboardColors = [
  { id: 'slate', color: '#8B8B92' },
  { id: 'blue', color: '#5B8DEF' },
  { id: 'violet', color: '#8B6CC7' },
  { id: 'green', color: '#6D9B6D' },
  { id: 'amber', color: '#D9A441' },
  { id: 'coral', color: '#D4675F' },
]

/** What the operating system asks for. Read once on mount, then kept in sync. */
function getSystemTheme(): Theme {
  return prefersDark() ? 'dark' : 'light'
}

/**
 * The app shipped as Fieldnotes, then as DesEng. Copy anything saved under an
 * older prefix to its desgnix key once, so a rename does not lose a preference.
 * The library itself is server data now; the theme is the last local key.
 */
function migrateLegacyStorage() {
  try {
    const prefixes = ['fieldnotes-', 'deseng-']
    const copies: Array<[string, string]> = []
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key) continue
      const prefix = prefixes.find(candidate => key.startsWith(candidate))
      if (!prefix) continue
      const nextKey = `desgnix-${key.slice(prefix.length)}`
      const value = localStorage.getItem(key)
      if (value !== null && localStorage.getItem(nextKey) === null) copies.push([nextKey, value])
    }
    for (const [key, value] of copies) localStorage.setItem(key, value)
  } catch {}
}

migrateLegacyStorage()

/** The API's message for a failed write, or a sentence that at least names the step. */
function failureMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}

function MoodboardDialog({ open, onClose, onCreate }: {
  open: boolean
  onClose: () => void
  onCreate: (name: string, color: string, description: string) => Promise<string | null>
}) {
  const [color, setColor] = useState(moodboardColors[0]!.color)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    if (!name) return

    setError('')
    setPending(true)
    const failure = await onCreate(name, color, String(data.get('description') ?? '').trim())
    setPending(false)

    if (failure) {
      setError(failure)
      return
    }

    form.reset()
    setColor(moodboardColors[0]!.color)
    onClose()
  }

  return <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
    <DialogContent title="Create moodboard" description="Group the references you want to keep together.">
      <form onSubmit={submit} className="dialog-form">
        <Input label="Moodboard name" name="name" placeholder="Brand research" maxLength={40} autoFocus required />
        <ColorPicker label="Moodboard colour" value={color} onValueChange={setColor} swatches={moodboardColors} />
        <Textarea label="Description" description="Optional" name="description" placeholder="What are you collecting?" rows={3} />
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialog-actions">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={pending}>Create moodboard</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
}

function EditMoodboardDialog({ moodboard, onClose, onSave }: {
  moodboard: LibraryMoodboard | null
  onClose: () => void
  onSave: (id: string, input: { name: string; color: string; description: string }) => Promise<string | null>
}) {
  const [color, setColor] = useState(moodboard?.color ?? moodboardColors[0]!.color)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!moodboard) return
    setColor(moodboard.color)
    setError('')
    setPending(false)
  }, [moodboard])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!moodboard) return
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    if (!name) return

    setError('')
    setPending(true)
    const failure = await onSave(moodboard.id, {
      name,
      color,
      description: String(data.get('description') ?? '').trim(),
    })
    setPending(false)

    if (failure) {
      setError(failure)
      return
    }

    onClose()
  }

  return <Dialog open={moodboard !== null} onOpenChange={next => { if (!next) onClose() }}>
    <DialogContent title="Edit moodboard" description="Rename it, recolour it, or change what it collects.">
      <form key={moodboard?.id} onSubmit={submit} className="dialog-form">
        <Input label="Moodboard name" name="name" defaultValue={moodboard?.name} placeholder="Brand research" maxLength={40} autoFocus required />
        <ColorPicker label="Moodboard colour" value={color} onValueChange={setColor} swatches={moodboardColors} />
        <Textarea label="Description" description="Optional" name="description" defaultValue={moodboard?.description} placeholder="What are you collecting?" rows={3} />
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialog-actions">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={pending}>Save changes</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
}

const providerNames: Record<SocialProvider, string> = { google: 'Google', github: 'GitHub' }

function SettingsDialog({ open, account, onClose }: {
  open: boolean
  account: { name: string; email: string }
  onClose: () => void
}) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(account.name)
  const [deleteArmed, setDeleteArmed] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [providers, setProviders] = useState<SocialProvider[]>([])
  const [connected, setConnected] = useState<SocialProvider[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!open) return
    setName(user?.name ?? account.name)
    setEditingName(false)
    setDeleteArmed(false)
    setDeleting(false)
    setError('')
  }, [account.name, open, user?.name])

  // The connections list is the account's own: a provider that is enabled on
  // the server is only "Connected" when this account has actually linked it.
  useEffect(() => {
    if (!open) return
    let live = true
    Promise.all([api.config(), listAccounts()])
      .then(([config, result]) => {
        if (!live) return
        setProviders(config.socialProviders)
        setConnected((result.data ?? [])
          .map(item => item.providerId)
          .filter((id): id is SocialProvider => id === 'google' || id === 'github'))
      })
      .catch(() => {
        if (!live) return
        setProviders([])
        setConnected([])
      })
    return () => { live = false }
  }, [open])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingName) return
    const nextName = name.trim()
    if (!nextName) {
      setError('Your name cannot be empty.')
      return
    }

    setError('')
    setPending(true)

    try {
      const result = await updateUser({ name: nextName })
      if (result.error) {
        setError(result.error.message || 'Could not save the change.')
        setPending(false)
        return
      }
      setPending(false)
      setEditingName(false)
    } catch {
      setError('The server could not be reached. Try again.')
      setPending(false)
    }
  }

  async function removeAccount() {
    setError('')
    setDeleting(true)
    try {
      const result = await deleteUser()
      if (result.error) {
        setError(result.error.message || 'The account could not be deleted.')
        setDeleting(false)
        return
      }
      // The session is gone with the account, so start the app from a clean page.
      window.location.assign('/')
    } catch {
      setError('The server could not be reached. Try again.')
      setDeleting(false)
    }
  }

  return <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
    <DialogContent className="account-settings-dialog" title="Account settings" description="Your profile and sign-in methods.">
      <form onSubmit={submit} className="account-settings-form">
        <div className="account-settings-identity">
          <Avatar name={account.name} size="lg" className="account-settings-avatar" />
          <div>
            <strong>{account.name}</strong>
            <span>{account.email}</span>
          </div>
        </div>

        <section className="account-settings-section" aria-labelledby="profile-settings-heading">
          <h2 id="profile-settings-heading">Profile</h2>
          <div className="account-settings-row">
            <span className="account-settings-label">Name</span>
            {editingName
              ? <div className="account-settings-name-field"><Input label="Name" name="name" value={name} onChange={event => setName(event.currentTarget.value)} maxLength={60} autoFocus required /></div>
              : <strong>{account.name}</strong>}
            {editingName
              ? <div className="account-settings-actions"><Button type="button" variant="secondary" size="sm" onClick={() => { setName(account.name); setEditingName(false) }} disabled={pending}>Cancel</Button><Button type="submit" variant="primary" size="sm" loading={pending}>Save</Button></div>
              : <Button type="button" variant="secondary" size="sm" onClick={() => setEditingName(true)}><Pen size={15} /> Edit</Button>}
          </div>
          <div className="account-settings-row">
            <span className="account-settings-label">Email</span>
            <strong>{account.email}</strong>
          </div>
          <div className="account-settings-row">
            <span className="account-settings-label">Delete account</span>
            <span aria-hidden="true" />
            {deleteArmed
              ? <div className="account-settings-actions">
                <Button type="button" variant="secondary" size="sm" onClick={() => setDeleteArmed(false)} disabled={deleting}>Cancel</Button>
                <Button type="button" variant="danger" size="sm" onClick={() => { void removeAccount() }} loading={deleting}>Delete account</Button>
              </div>
              : <Button type="button" variant="secondary" size="sm" onClick={() => setDeleteArmed(true)}>Delete</Button>}
          </div>
          {deleteArmed && <p className="account-settings-warning" role="alert">This permanently deletes your account, favourites and moodboards.</p>}
        </section>

        <section className="account-settings-section" aria-labelledby="connections-settings-heading">
          <h2 id="connections-settings-heading">Connections</h2>
          <p>Manage how you log in to your account.</p>
          {providers.length > 0
            ? providers.map(provider => <div key={provider} className="account-settings-row account-settings-provider">
              <span className="account-settings-provider-name">
                {provider === 'google' ? <GoogleMark /> : <GitHubMark />}
                {providerNames[provider]}
              </span>
              <span className="account-settings-status">{connected.includes(provider) ? 'Connected' : 'Not connected'}</span>
            </div>)
            : <div className="account-settings-row account-settings-provider">
              <span className="account-settings-provider-name">Email and password</span>
              <span className="account-settings-status">Connected</span>
            </div>}
        </section>

        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </DialogContent>
  </Dialog>
}

function DeleteMoodboardDialog({ moodboard, onClose, onDelete }: {
  moodboard: LibraryMoodboard | null
  onClose: () => void
  onDelete: (id: string) => Promise<string | null>
}) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function confirm() {
    if (!moodboard) return
    setError('')
    setPending(true)
    const failure = await onDelete(moodboard.id)
    setPending(false)
    if (failure) { setError(failure); return }
    onClose()
  }

  return <Dialog open={moodboard !== null} onOpenChange={next => { if (!next && !pending) onClose() }}>
    <DialogContent title="Delete moodboard?" description={moodboard ? `“${moodboard.name}” will be removed. Saved resources will stay in your library.` : undefined}>
      <div className="dialog-form">
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialog-actions">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="button" variant="danger" size="sm" onClick={() => { void confirm() }} loading={pending}>Delete moodboard</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
}

export default function Page() {
  const { user, isPending } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [resources, setResources] = useState<Resource[]>([])
  const [moodboards, setMoodboards] = useState<LibraryMoodboard[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [addOpen, setAddOpen] = useState(false)
  const [moodboardOpen, setMoodboardOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [moodboardToEdit, setMoodboardToEdit] = useState<LibraryMoodboard | null>(null)
  const [moodboardForDeletion, setMoodboardForDeletion] = useState<LibraryMoodboard | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const [themePreference, setThemePreference] = useState<ThemePreference>(readStoredTheme)
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme)
  const [searchQuery, setSearchQuery] = useState('')

  // The address is the view: a shelf, a tag, favourites and a moodboard each
  // have their own path, so a row can be linked, reloaded and opened twice.
  // A tag rides on its shelf's path as the `tag` query.
  const addressView = viewForPath(location.pathname, location.search)
  const view = addressView ?? views.allResources
  const setView = useCallback((next: string) => { navigate(pathForView(next)) }, [navigate])

  const theme: Theme = themePreference === 'system' ? systemTheme : themePreference
  const signedIn = user !== null
  const account = { name: user?.name ?? '', email: user?.email ?? '' }

  /** The catalogue is shared and public; the state on it belongs to an account. */
  const loadLibrary = useCallback(async () => {
    // Signing in happens over the page now, so it refetches the catalogue in
    // place: the grid that is already on screen stays there instead of falling
    // back to its skeleton behind the panel.
    setStatus(current => current === 'ready' ? current : 'loading')
    try {
      const catalog = await api.catalog()
      const boards = signedIn ? (await api.moodboards()).moodboards : []
      setResources(catalog.resources)
      setMoodboards(boards)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [signedIn])

  // Wait for the session before the first read, so a signed-in account never
  // sees its own favourites arrive a moment late.
  useEffect(() => { if (!isPending) void loadLibrary() }, [isPending, loadLibrary])

  // An address with nothing filed at it goes back to the catalogue, rather than
  // showing the whole grid under a name it does not hold.
  useEffect(() => {
    if (addressView === null) navigate('/', { replace: true })
  }, [addressView, navigate])

  // Favourites and moodboards belong to an account. Open sign-up directly and
  // keep the requested view as the intent, so auth returns to the right place.
  useEffect(() => {
    if (signedIn || !needsAccount(view)) return
    setAuthIntent({ kind: 'view', view })
    setAuthMode('sign-up')
    navigate('/', { replace: true })
  }, [view, signedIn, navigate])

  // The action that sent the visitor to sign in is finished here, once, after
  // the catalogue is on screen. A cancelled sign-in clears it instead.
  useEffect(() => {
    if (!user || status !== 'ready') return
    const intent = takeAuthIntent()
    if (!intent) return

    if (intent.kind === 'view') { setView(intent.view); return }
    if (intent.kind === 'new-moodboard') { setMoodboardOpen(true); return }
    if (intent.kind === 'submit') { setAddOpen(true); return }

    void api.setResourceState(intent.resourceId, { favorite: true })
      .then(({ resource }) => {
        setResources(items => items.map(item => item.id === resource.id ? { ...item, favorite: resource.favorite } : item))
      })
      .catch(() => {})
  }, [user, status])

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemTheme(query.matches ? 'dark' : 'light')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.dataset.theme = theme
    // The status bar and the browser chrome take the colour at the top of the
    // page. One tag, rewritten on toggle, because the theme is a class and not
    // the OS setting.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#020202' : '#fafafa')
    localStorage.setItem(themeStorageKey, themePreference)
  }, [theme, themePreference])

  // A new address starts at the top of the page. Without this, a link at the
  // foot of one page lands on the foot of the next, and the only thing the
  // visitor sees after pressing it is the footer they pressed it in. An address
  // that names a section still jumps to it, once the page holding it is drawn.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    const frame = requestAnimationFrame(() => {
      const target = id ? document.getElementById(id) : null
      if (target) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        target.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' })
        return
      }
      window.scrollTo(0, 0)
    })
    return () => cancelAnimationFrame(frame)
  }, [location.pathname, location.search, location.hash, status])

  const changeTheme = (next: ThemePreference, variant: ThemeSwitchVariant) => {
    const applyTheme = () => flushSync(() => setThemePreference(next))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !document.startViewTransition) {
      setThemePreference(next)
      return
    }

    document.documentElement.dataset.themeMotion = variant
    const transition = document.startViewTransition(applyTheme)
    void transition.finished.then(
      () => { delete document.documentElement.dataset.themeMotion },
      () => { delete document.documentElement.dataset.themeMotion },
    )
  }

  const currentMoodboard = moodboards.find(moodboard => moodboard.id === view)
  const collection = collectionById(view)
  /** A tag page is the catalogue filtered to one category. */
  const tag = categoryFromView(view)
  const filtered = useMemo(() => {
    const matches = resources.filter(resource => {
      const matchesView = view === 'All resources'
        || (view === 'Favorites' && resource.favorite)
        || (tag !== null && resource.category === tag)
        || (collection !== undefined && collection.categories.includes(resource.category))
        || (currentMoodboard !== undefined && resource.moodboardId === currentMoodboard.id)
      const query = searchQuery.trim().toLocaleLowerCase()
      return matchesView && (!query || [resource.name, resource.url, resource.description, resource.category].some(value => value.toLocaleLowerCase().includes(query)))
    })
    // The catalogue's one fixed order: popularity, then the name. Saving a
    // card or filing it in a moodboard does not move the grid.
    return matches.sort(comparePopularity)
  }, [resources, view, currentMoodboard, collection, tag, searchQuery])

  const legalPage = legalDocuments[view]
  const heading = legalPage?.title ?? (view === 'Info' ? 'Info' : view === 'Sponsor' ? 'Sponsor' : currentMoodboard?.name ?? (view === 'Favorites' ? 'Favourites' : tag ?? view))
  const subheading = view === 'All resources' ? 'A curated collection of interfaces, interactions and details that caught our eye.'
      : view === 'Info' ? infoDescription
        : view === 'Sponsor' ? sponsorDescription
        : legalPage ? legalPage.summary
      : view === 'Favorites' ? 'A personal shortlist of ideas you want to revisit.'
        : tag ? `Every entry filed under this tag, in the library's order.`
          : collection ? collection.description
            : currentMoodboard ? currentMoodboard.description || 'Links saved in this moodboard.'
              : ''

  // The document names the view, so a shelf or a tag can be bookmarked and
  // shared under its own title instead of the catalogue's. Account-only views
  // stay out of the index; the shelves and the info page do not.
  const pageName = view === 'Favorites' ? 'Favourites' : view === 'Moodboard' ? 'Moodboards' : heading
  usePageMeta({
    title: view === 'All resources' ? 'Reference · your design library' : `${pageName} · Reference`,
    description: view === 'Info' ? infoDescription : view === 'Sponsor' ? sponsorDescription : subheading || LIBRARY_SUBHEADING,
    path: `${location.pathname}${location.search}`,
    noindex: needsAccount(view),
  })

  /** Opens the sign-in panel over the page; the intent is already in sessionStorage. */
  function openAuth(mode: AuthMode) {
    setAuthMode(mode)
  }

  function requestAccount(intent?: AuthIntent) {
    if (intent) setAuthIntent(intent)
    openAuth('sign-up')
  }

  /** Favourites and moodboards belong to an account; the shelves do not. */
  function selectView(next: string) {
    if (!signedIn && (next === views.favorites || next === views.moodboardShelf)) {
      requestAccount({ kind: 'view', view: next })
      return
    }
    setView(next)
  }

  function openNewMoodboard() {
    if (!signedIn) {
      requestAccount({ kind: 'new-moodboard' })
      return
    }
    setMoodboardOpen(true)
  }

  function openSubmit() {
    if (!signedIn) {
      requestAccount({ kind: 'submit' })
      return
    }
    setAddOpen(true)
  }

  /** A card's moodboard menu, reached before the visitor has an account. */
  function requestMoodboardAccess() {
    requestAccount()
  }

  async function addResource(item: Pick<Resource, 'name' | 'url' | 'description' | 'category'>) {
    try {
      const { resource } = await api.submitResource(item)
      setResources(items => [resource, ...items])
      return null
    } catch (error) {
      return failureMessage(error, 'Could not add the resource. Try again.')
    }
  }

  async function addMoodboard(name: string, color: string, description: string) {
    try {
      const { moodboard } = await api.createMoodboard({ name, color, description })
      setMoodboards(items => [...items, moodboard])
      if (view !== 'Moodboard') setView(moodboard.id)
      return null
    } catch (error) {
      return failureMessage(error, 'Could not create the moodboard. Try again.')
    }
  }

  async function editMoodboard(id: string, input: { name: string; color: string; description: string }) {
    try {
      const { moodboard } = await api.updateMoodboard(id, input)
      setMoodboards(items => items.map(item => item.id === id ? moodboard : item))
      return null
    } catch (error) {
      return failureMessage(error, 'Could not update the moodboard. Try again.')
    }
  }

  async function deleteMoodboard(id: string) {
    try {
      await api.deleteMoodboard(id)
      setMoodboards(items => items.filter(moodboard => moodboard.id !== id))
      setResources(items => items.map(resource => resource.moodboardId === id ? { ...resource, moodboardId: undefined } : resource))
      setView(views.moodboardShelf)
      return null
    } catch (error) {
      return failureMessage(error, 'Could not delete the moodboard. Try again.')
    }
  }

  function patchResource(id: string, patch: Partial<Resource>) {
    setResources(items => items.map(item => item.id === id ? { ...item, ...patch } : item))
  }

  async function toggleFavorite(id: string) {
    if (!signedIn) {
      requestAccount({ kind: 'favorite', resourceId: id })
      return
    }
    const current = resources.find(item => item.id === id)
    if (!current) return
    const favorite = !current.favorite
    patchResource(id, { favorite })

    try {
      const { resource } = await api.setResourceState(id, { favorite })
      patchResource(id, { favorite: resource.favorite })
    } catch {
      patchResource(id, { favorite: !favorite })
    }
  }

  async function moveToMoodboard(id: string, moodboardId: string) {
    if (!signedIn) {
      requestMoodboardAccess()
      return
    }
    const previous = resources.find(item => item.id === id)?.moodboardId
    patchResource(id, { moodboardId })

    try {
      const { resource } = await api.setResourceState(id, { moodboardId })
      patchResource(id, { moodboardId: resource.moodboardId })
    } catch {
      patchResource(id, { moodboardId: previous })
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
    } finally {
      // Signing out leaves the visitor on the catalogue, not at the door.
      navigate('/', { replace: true })
    }
  }

  // The desktop sidebar is fixed: no rail, no trigger, no toggle shortcut.
  // Below `lg` the column steps out entirely and the top bar's menu carries
  // the same destinations, so the page keeps its full width for the cards.
  // The ground holds the page texture; the shell sits on top of it, capped and
  // centred, so a wide screen keeps a patterned gutter either side of the app.
  return <div className="app-ground">
    <StripedPattern className="app-pattern" width={24} height={24} />
    <SidebarProvider className="app-shell" mobileBreakpoint={1024} shortcut={null}>
      <AppSidebar
        selected={view}
        onSelect={selectView}
        onNewMoodboard={openNewMoodboard}
        moodboards={moodboards}
        resources={resources}
      />
      <SidebarInset className="app-inset">
        <SidebarInsetTopbar className="app-topbar">
          <AppNavbar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onOpenTag={category => selectView(categoryView(category))}
            resources={resources}
            onSubmitResource={openSubmit}
            selected={view}
            onSelect={selectView}
            moodboards={moodboards}
            onNewMoodboard={openNewMoodboard}
            account={signedIn ? account : null}
            authMode={authMode}
            onAuthModeChange={setAuthMode}
            onAuthDismiss={() => { clearAuthIntent(); setAuthMode(null) }}
            theme={themePreference}
            onThemeChange={next => changeTheme(next, 'rise')}
            onSelectSettings={() => setSettingsOpen(true)}
            onSignOut={handleSignOut}
          />
        </SidebarInsetTopbar>
        {status === 'ready'
          ? <Dashboard
            view={view}
            heading={heading}
            subheading={subheading}
            resources={filtered}
            allResources={resources}
            moodboards={moodboards}
            query={searchQuery}
            signedIn={signedIn}
            onRequireAccount={requestMoodboardAccess}
            onFavorite={toggleFavorite}
            onFile={moveToMoodboard}
            onOpenMoodboard={selectView}
            onOpenCategory={category => selectView(categoryView(category))}
            onOpenShelf={selectView}
            onNewMoodboard={openNewMoodboard}
            onAddResource={openSubmit}
            onEditMoodboard={setMoodboardToEdit}
            onDeleteMoodboard={id => setMoodboardForDeletion(moodboards.find(moodboard => moodboard.id === id) ?? null)}
          />
          : <CatalogStatus status={status} onRetry={() => { void loadLibrary() }} />}
      </SidebarInset>
      <SubmitDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={addResource}
        onFeatured={() => selectView(sponsorView)}
      />
      <MoodboardDialog open={moodboardOpen} onClose={() => setMoodboardOpen(false)} onCreate={addMoodboard} />
      <EditMoodboardDialog moodboard={moodboardToEdit} onClose={() => setMoodboardToEdit(null)} onSave={editMoodboard} />
      <SettingsDialog open={settingsOpen} account={account} onClose={() => setSettingsOpen(false)} />
      <DeleteMoodboardDialog moodboard={moodboardForDeletion} onClose={() => setMoodboardForDeletion(null)} onDelete={deleteMoodboard} />
    </SidebarProvider>
  </div>
}
