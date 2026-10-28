import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus } from '@/components/icons'
import { Button } from '@/components/arc/button/button'
import { Dialog, DialogContent } from '@/components/arc/dialog/dialog'
import { Input } from '@/components/arc/input/input'
import { Textarea } from '@/components/arc/textarea/textarea'
import { Select } from '@/components/arc/select/select'
import { ColorPicker } from '@/components/arc/color-picker/color-picker'
import { AppNavbar } from '@/components/application/dashboard/app-navbar'
import { CatalogStatus } from '@/components/application/dashboard/catalog-status'
import { Dashboard } from '@/components/application/dashboard/dashboard'
import { useAuth } from '@/components/auth/auth-provider'
import { AppSidebar } from '@/components/sidebar-preset/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { StripedPattern } from '@/components/ui/striped-pattern'
import { SidebarInsetTopbar } from '@/components/sidebar-app/inset-topbar'
import type { Theme, ThemeSwitchVariant } from '@/components/arc/theme-switch/theme-switch'
import { prefersDark, readStoredTheme, themeStorageKey, type ThemePreference } from '@/lib/theme'
import type { LibraryMoodboard } from '@/lib/library-types'
import { api, ApiError } from '@/lib/api'
import { clearAuthIntent, setAuthIntent, takeAuthIntent, type AuthIntent } from '@/lib/auth-intent'
import { signOut, updateUser } from '@/lib/auth-client'
import { categories, categoryFromView, categoryView, comparePopularity, collectionById, type Resource } from '@/catalog'

type View = string

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

function AddResourceDialog({ open, onClose, onAdd }: {
  open: boolean
  onClose: () => void
  onAdd: (item: Pick<Resource, 'name' | 'url' | 'description' | 'category'>) => Promise<string | null>
}) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [category, setCategory] = useState('Web galleries')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    const data = new FormData(event.currentTarget)
    const urlRaw = String(data.get('url') ?? '').trim()
    let url: URL
    try {
      url = new URL(urlRaw.includes('://') ? urlRaw : `https://${urlRaw}`)
    } catch {
      setError('Enter a valid web address.')
      return
    }
    const name = String(data.get('name') ?? '').trim()
    if (!name) {
      setError('Give this resource a name.')
      return
    }

    setPending(true)
    const failure = await onAdd({
      name,
      url: url.toString().replace(/\/$/, ''),
      description: String(data.get('description') ?? '').trim() || 'A resource worth keeping close.',
      category,
    })
    setPending(false)

    if (failure) {
      setError(failure)
      return
    }

    form.reset()
    setCategory('Web galleries')
    onClose()
  }

  return <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
    <DialogContent title="Add a resource" description="Save a useful link to the shared catalogue.">
      <form onSubmit={submit} className="dialog-form">
        <Input label="Name" name="name" placeholder="e.g. Awwwards" autoFocus required />
        <Input label="Link" name="url" type="text" inputMode="url" placeholder="example.com" required />
        <Select label="Category" value={category} onValueChange={setCategory} options={categories.map(item => ({ value: item.name, label: item.name }))} />
        <Textarea label="Note" description="Optional" name="description" placeholder="What makes it worth saving?" rows={3} />
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialog-actions">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={pending}><Plus size={15} /> Add resource</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
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

/**
 * What the visitor clicked, phrased as the account's benefit. The prompt is a
 * step on the page rather than a bounce: browsing stays where it was, and the
 * intent is finished when they come back signed in.
 */
const accountPrompts = {
  favorite: {
    title: 'Keep this reference',
    description: 'Favourites live on your account, so your shortlist follows you to every device. Browsing stays free.',
  },
  view: {
    title: 'Your favourites and moodboards',
    description: 'Create an account to keep a shortlist of references and group them into moodboards.',
  },
  moodboard: {
    title: 'Build a moodboard',
    description: 'A moodboard keeps the references for one project together, under your account.',
  },
  submit: {
    title: 'Submit a resource',
    description: 'A submission joins the shared catalogue under your account, ready to file like any other entry.',
  },
} as const

type AccountPromptReason = keyof typeof accountPrompts

function SignInPrompt({ reason, onClose, onSignIn, onSignUp }: {
  reason: AccountPromptReason | null
  onClose: () => void
  onSignIn: () => void
  onSignUp: () => void
}) {
  const copy = reason ? accountPrompts[reason] : accountPrompts.view

  return <Dialog open={reason !== null} onOpenChange={next => { if (!next) onClose() }}>
    <DialogContent title={copy.title} description={copy.description}>
      <div className="dialog-actions">
        <Button variant="secondary" size="sm" onClick={onSignUp}>Create an account</Button>
        <Button variant="primary" size="sm" onClick={onSignIn}>Sign in</Button>
      </div>
    </DialogContent>
  </Dialog>
}

function SettingsDialog({ open, account, onClose }: {
  open: boolean
  account: { name: string; email: string }
  onClose: () => void
}) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const { user } = useAuth()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = String(new FormData(event.currentTarget).get('name') ?? '').trim()
    if (!name) {
      setError('Your name cannot be empty.')
      return
    }

    setError('')
    setPending(true)

    try {
      const result = await updateUser({ name })
      if (result.error) {
        setError(result.error.message || 'Could not save the change.')
        setPending(false)
        return
      }
      setPending(false)
      onClose()
    } catch {
      setError('The server could not be reached. Try again.')
      setPending(false)
    }
  }

  return <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
    <DialogContent title="Settings" description="How your account appears across desgnix.">
      <form onSubmit={submit} className="dialog-form">
        <Input label="Name" name="name" defaultValue={user?.name ?? account.name} maxLength={60} autoFocus required />
        <Input
          label="Email"
          name="email"
          type="email"
          defaultValue={account.email}
          readOnly
          disabled
          description="The address you sign in with."
        />
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialog-actions">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={pending}>Save changes</Button>
        </div>
      </form>
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
  const [view, setView] = useState<View>('All resources')
  const [addOpen, setAddOpen] = useState(false)
  const [moodboardOpen, setMoodboardOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [prompt, setPrompt] = useState<AccountPromptReason | null>(null)
  const [themePreference, setThemePreference] = useState<ThemePreference>(readStoredTheme)
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme)
  const [searchQuery, setSearchQuery] = useState('')

  const theme: Theme = themePreference === 'system' ? systemTheme : themePreference
  const signedIn = user !== null
  const account = { name: user?.name ?? '', email: user?.email ?? '' }

  /** The catalogue is shared and public; the state on it belongs to an account. */
  const loadLibrary = useCallback(async () => {
    setStatus('loading')
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

  const heading = currentMoodboard?.name ?? (view === 'Favorites' ? 'Favourites' : tag ?? view)
  const subheading = view === 'All resources' ? 'A curated collection of interfaces, interactions and details that caught our eye.'
    : view === 'Favorites' ? 'A personal shortlist of ideas you want to revisit.'
      : tag ? `Every entry filed under this tag, in the catalogue's order.`
        : collection ? collection.description
          : currentMoodboard ? currentMoodboard.description || 'Links saved in this moodboard.'
            : ''

  const from = `${location.pathname}${location.search}`

  /** Sends the visitor to the auth pages; the intent is already in sessionStorage. */
  function goToAuth(path: '/sign-in' | '/sign-up') {
    setPrompt(null)
    navigate(path, { state: { from } })
  }

  function requestAccount(reason: AccountPromptReason, intent?: AuthIntent) {
    if (intent) setAuthIntent(intent)
    setPrompt(reason)
  }

  /** A prompt dismissed without signing in drops what it was collecting. */
  function cancelPrompt() {
    clearAuthIntent()
    setPrompt(null)
  }

  /** Favourites and moodboards belong to an account; the shelves do not. */
  function selectView(next: string) {
    if (!signedIn && (next === 'Favorites' || next === 'Moodboard')) {
      requestAccount('view', { kind: 'view', view: next })
      return
    }
    setView(next)
  }

  function openNewMoodboard() {
    if (!signedIn) {
      requestAccount('moodboard', { kind: 'new-moodboard' })
      return
    }
    setMoodboardOpen(true)
  }

  function openSubmit() {
    if (!signedIn) {
      requestAccount('submit', { kind: 'submit' })
      return
    }
    setAddOpen(true)
  }

  /** A card's moodboard menu, reached before the visitor has an account. */
  function requestMoodboardAccess() {
    requestAccount('moodboard')
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

  function patchResource(id: string, patch: Partial<Resource>) {
    setResources(items => items.map(item => item.id === id ? { ...item, ...patch } : item))
  }

  async function toggleFavorite(id: string) {
    if (!signedIn) {
      requestAccount('favorite', { kind: 'favorite', resourceId: id })
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
      setView('All resources')
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
            resources={resources}
            onSubmitResource={openSubmit}
            selected={view}
            onSelect={selectView}
            moodboards={moodboards}
            onNewMoodboard={openNewMoodboard}
            account={signedIn ? account : null}
            onSignIn={() => navigate('/sign-in', { state: { from } })}
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
            theme={theme}
            query={searchQuery}
            signedIn={signedIn}
            onRequireAccount={requestMoodboardAccess}
            onFavorite={toggleFavorite}
            onFile={moveToMoodboard}
            onOpenMoodboard={selectView}
            onOpenCategory={category => selectView(categoryView(category))}
            onNewMoodboard={openNewMoodboard}
            onAddResource={openSubmit}
          />
          : <CatalogStatus status={status} onRetry={() => { void loadLibrary() }} />}
      </SidebarInset>
      <AddResourceDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={addResource} />
      <MoodboardDialog open={moodboardOpen} onClose={() => setMoodboardOpen(false)} onCreate={addMoodboard} />
      <SettingsDialog open={settingsOpen} account={account} onClose={() => setSettingsOpen(false)} />
      <SignInPrompt
        reason={prompt}
        onClose={cancelPrompt}
        onSignIn={() => goToAuth('/sign-in')}
        onSignUp={() => goToAuth('/sign-up')}
      />
    </SidebarProvider>
  </div>
}
