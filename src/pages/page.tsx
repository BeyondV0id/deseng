import { useEffect, useLayoutEffect, useMemo, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { Plus } from '@/components/icons'
import { Button } from '@/components/arc/button/button'
import { Dialog, DialogContent } from '@/components/arc/dialog/dialog'
import { Input } from '@/components/arc/input/input'
import { Textarea } from '@/components/arc/textarea/textarea'
import { Select } from '@/components/arc/select/select'
import { ColorPicker } from '@/components/arc/color-picker/color-picker'
import { AppNavbar } from '@/components/application/dashboard/app-navbar'
import { Dashboard } from '@/components/application/dashboard/dashboard'
import { DashboardSidebar } from '@/components/application/dashboard/dashboard-sidebar'
import type { Theme, ThemeSwitchVariant } from '@/components/arc/theme-switch/theme-switch'
import type { ThemePreference } from '@/components/application/dashboard/settings-popover'
import { cn } from '@/lib/utils'
import type { LibraryMoodboard } from '@/lib/library-types'
import { categories, collectionById, initialResources, type Resource } from '@/catalog'

type View = string
const themeStorageKey = 'fieldnotes-theme-v2'
/** Bumped when the catalogue changes shape, so the stored seed is refreshed. */
const catalogVersionKey = 'fieldnotes-catalog-version'
const catalogVersion = '2026-10-22-c'

/** The swatches offered for a moodboard, in the order the reference shows them. */
const moodboardColors = [
  { id: 'slate', color: '#8B8B92' },
  { id: 'blue', color: '#5B8DEF' },
  { id: 'violet', color: '#8B6CC7' },
  { id: 'green', color: '#6D9B6D' },
  { id: 'amber', color: '#D9A441' },
  { id: 'coral', color: '#D4675F' },
]

function getInitialTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(themeStorageKey)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {}
  return 'dark'
}

/** What the operating system asks for. Read once on mount, then kept in sync. */
function getSystemTheme(): Theme {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const store = {
  read<T,>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) as T : fallback
    } catch {
      return fallback
    }
  },
}

/**
 * The seed catalogue is rewritten whenever it changes, so a stale copy in
 * local storage is dropped rather than mixed with the new entries.
 */
function readResources(): Resource[] {
  try {
    if (localStorage.getItem(catalogVersionKey) !== catalogVersion) return initialResources
  } catch {}
  return store.read('fieldnotes-resources', initialResources)
}

function AddResourceDialog({ open, onClose, onAdd }: {
  open: boolean
  onClose: () => void
  onAdd: (item: Omit<Resource, 'id' | 'savedAt' | 'favorite'>) => void
}) {
  const [error, setError] = useState('')
  const [category, setCategory] = useState('Inspiration')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
    onAdd({ name, url: url.toString(), description: String(data.get('description') ?? '').trim() || 'A resource worth keeping close.', category })
    event.currentTarget.reset()
    setCategory('Design Inspiration')
    onClose()
  }

  return <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
    <DialogContent title="Add a resource" description="Save a useful link to your library.">
      <form onSubmit={submit} className="dialog-form">
        <Input label="Name" name="name" placeholder="e.g. Awwwards" autoFocus required />
        <Input label="Link" name="url" type="text" inputMode="url" placeholder="example.com" required />
        <Select label="Category" value={category} onValueChange={setCategory} options={categories.map(item => ({ value: item.name, label: item.name }))} />
        <Textarea label="Note" description="Optional" name="description" placeholder="What makes it worth saving?" rows={3} />
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialog-actions"><Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" size="sm"><Plus size={15} /> Add resource</Button></div>
      </form>
    </DialogContent>
  </Dialog>
}

function MoodboardDialog({ open, onClose, onCreate }: {
  open: boolean
  onClose: () => void
  onCreate: (name: string, color: string, description: string) => void
}) {
  const [color, setColor] = useState(moodboardColors[0].color)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    if (!name) return
    onCreate(name, color, String(data.get('description') ?? '').trim())
    event.currentTarget.reset()
    setColor(moodboardColors[0].color)
    onClose()
  }

  return <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
    <DialogContent title="Create moodboard" description="Group the references you want to keep together.">
      <form onSubmit={submit} className="dialog-form">
        <Input label="Moodboard name" name="name" placeholder="Brand research" maxLength={40} autoFocus required />
        <ColorPicker label="Moodboard colour" value={color} onValueChange={setColor} swatches={moodboardColors} />
        <Textarea label="Description" description="Optional" name="description" placeholder="What are you collecting?" rows={3} />
        <div className="dialog-actions"><Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" size="sm">Create moodboard</Button></div>
      </form>
    </DialogContent>
  </Dialog>
}

export default function Page() {
  const [resources, setResources] = useState<Resource[]>(() => readResources())
  const [moodboards, setMoodboards] = useState<LibraryMoodboard[]>(() => store.read('fieldnotes-moodboards', []))
  const [view, setView] = useState<View>('All resources')
  const [addOpen, setAddOpen] = useState(false)
  const [moodboardOpen, setMoodboardOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [themePreference, setThemePreference] = useState<ThemePreference>(getInitialTheme)
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme)
  const [searchQuery, setSearchQuery] = useState('')

  const theme: Theme = themePreference === 'system' ? systemTheme : themePreference

  useEffect(() => {
    localStorage.setItem('fieldnotes-resources', JSON.stringify(resources))
    localStorage.setItem(catalogVersionKey, catalogVersion)
  }, [resources])
  useEffect(() => { localStorage.setItem('fieldnotes-moodboards', JSON.stringify(moodboards)) }, [moodboards])
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemTheme(query.matches ? 'dark' : 'light')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.dataset.theme = theme
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
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileNavOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const currentMoodboard = moodboards.find(moodboard => moodboard.id === view)
  const collection = collectionById(view)
  const filtered = useMemo(() => resources.filter(resource => {
    const matchesView = view === 'All resources'
      || (view === 'Favorites' && resource.favorite)
      || (view === 'Submissions' && resource.submitted === true)
      || (collection !== undefined && collection.categories.includes(resource.category))
      || (currentMoodboard !== undefined && resource.moodboardId === currentMoodboard.id)
    const query = searchQuery.trim().toLocaleLowerCase()
    const matchesSearch = !query || [resource.name, resource.url, resource.description, resource.category].some(value => value.toLocaleLowerCase().includes(query))
    return matchesView && matchesSearch
  }).sort((a, b) => b.savedAt.localeCompare(a.savedAt)), [resources, view, currentMoodboard, collection, searchQuery])

  const heading = currentMoodboard?.name ?? view
  const subheading = view === 'All resources' ? 'A curated collection of interfaces, interactions and details that caught our eye.'
    : view === 'Favorites' ? 'A personal shortlist of ideas you want to revisit.'
      : view === 'Submissions' ? 'The resources this account has added to the library.'
        : collection ? collection.description
          : currentMoodboard ? currentMoodboard.description || 'Links saved in this moodboard.'
            : ''

  const addResource = (item: Omit<Resource, 'id' | 'savedAt' | 'favorite'>) => setResources(items => [{ ...item, id: crypto.randomUUID(), savedAt: new Date().toISOString().slice(0, 10), favorite: false, submitted: true }, ...items])
  const addMoodboard = (name: string, color: string, description: string) => {
    const id = crypto.randomUUID()
    setMoodboards(items => [...items, { id, name, color, description }])
    if (view !== 'Moodboard') setView(id)
  }
  const toggleFavorite = (id: string) => setResources(items => items.map(item => item.id === id ? { ...item, favorite: !item.favorite } : item))
  const moveToMoodboard = (id: string, moodboardId: string) => setResources(items => items.map(item => item.id === id ? { ...item, moodboardId } : item))

  return <div className="app-shell">
    <AppNavbar
      onOpenNavigation={() => setMobileNavOpen(open => !open)}
      onGoHome={() => setView('All resources')}
      view={view}
      onSelectView={setView}
      query={searchQuery}
      onQueryChange={setSearchQuery}
      onSubmitResource={() => setAddOpen(true)}
      onOpenSettings={() => setSettingsOpen(true)}
      onSelectSubmissions={() => setView('Submissions')}
      showSearch={view !== 'All resources'}
    />
    <div className={cn('sidebar-wrap', mobileNavOpen && 'mobile-open')}><DashboardSidebar selected={view} onSelect={selectedView => { setView(selectedView); setMobileNavOpen(false) }} onNewMoodboard={() => setMoodboardOpen(true)} mobile={mobileNavOpen} onClose={() => setMobileNavOpen(false)} themePreference={themePreference} onThemeChange={changeTheme} settingsOpen={settingsOpen} onSettingsOpenChange={setSettingsOpen} /></div>
    <Dashboard
      view={view}
      heading={heading}
      subheading={subheading}
      resources={filtered}
      allResources={resources}
      moodboards={moodboards}
      theme={theme}
      query={searchQuery}
      onQueryChange={setSearchQuery}
      onSelectCollection={setView}
      onFavorite={toggleFavorite}
      onMoodboard={moveToMoodboard}
      onOpenMoodboard={setView}
      onNewMoodboard={() => setMoodboardOpen(true)}
      onAddResource={() => setAddOpen(true)}
    />
    {mobileNavOpen && <button aria-label="Close navigation" className="mobile-scrim" onClick={() => setMobileNavOpen(false)} />}
    <AddResourceDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={addResource} />
    <MoodboardDialog open={moodboardOpen} onClose={() => setMoodboardOpen(false)} onCreate={addMoodboard} />
  </div>
}
