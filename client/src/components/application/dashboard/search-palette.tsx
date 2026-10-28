import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { FocusEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { Search, X } from '@/components/icons'
import { motionTokens } from '@/components/arc/lib/motion-tokens'
import { useMediaQuery } from '@/hooks/use-media-query'
import { resourceImages } from '@/lib/resource-images'
import type { Resource } from '@/catalog'

type SearchPaletteProps = {
  /** The whole catalogue, so search reaches past the view on screen. */
  resources: Resource[]
  query: string
  onQueryChange: (query: string) => void
}

const PANEL_WIDTH = 600
const COMPACT_WIDTH = 240

/** Title starts beat word starts, which beat matches inside a word, which beat description and category hits. */
function searchResources(resources: Resource[], query: string) {
  const scored: { resource: Resource; score: number; order: number }[] = []
  resources.forEach((resource, order) => {
    const title = resource.name.toLocaleLowerCase()
    const at = title.indexOf(query)
    const extra = [resource.description, resource.category, resource.url]
      .some(value => value.toLocaleLowerCase().includes(query))
    if (at < 0 && !extra) return
    const score = at === 0 ? 0 : at > 0 && /[\s\-/&.]/.test(title[at - 1] ?? '') ? 1 : at > 0 ? 2 : 3
    scored.push({ resource, score, order })
  })
  return scored
    .sort((a, b) => a.score - b.score || a.order - b.order)
    .map(entry => entry.resource)
}

/** The site's own mark, for the catalogue entries without a captured preview. */
function faviconFor(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`
  } catch {
    return ''
  }
}

function ResultThumb({ resource }: { resource: Resource }) {
  const [failed, setFailed] = useState(false)
  const baked = resourceImages[resource.url]
  const image = failed ? null : baked?.image ?? faviconFor(resource.url)
  const isMark = baked?.source === 'favicon'
  const initial = resource.name.replace(/[^a-z0-9]/gi, '').slice(0, 1).toUpperCase() || '•'

  return <span className={['app-search-thumb', isMark ? 'is-mark' : ''].filter(Boolean).join(' ')}>
    {image ? <img
      src={image}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    /> : <span className="app-search-thumb-letter" aria-hidden="true">{initial}</span>}
  </span>
}

/** The panel shares the bar's width value, so it unfolds out of the pill on first open. */
function Panel({ width, reduced, children }: { width: number; reduced: boolean; children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const height = useMotionValue(0)

  useLayoutEffect(() => {
    const panel = panelRef.current
    const body = bodyRef.current
    if (!panel || !body || typeof ResizeObserver === 'undefined') return
    let first = true
    const measure = () => {
      const next = body.offsetHeight
      if (first || reduced) {
        height.jump(next)
        first = false
        return
      }
      animate(height, next, motionTokens.spring.smooth)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(body)
    return () => observer.disconnect()
  }, [height, reduced])

  return <motion.div
    ref={panelRef}
    className="app-search-panel"
    style={{ height: reduced ? 'auto' : height }}
    initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6, width: Math.min(242, width) }}
    animate={{ opacity: 1, y: 0, width }}
    exit={reduced ? { opacity: 0, transition: { duration: 0 } } : {
      opacity: 0,
      y: -6,
      transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] },
    }}
    transition={reduced ? { duration: motionTokens.duration.instant } : {
      default: motionTokens.spring.morph,
      opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] },
    }}
  >
    <div ref={bodyRef} className="app-search-panel-body">{children}</div>
  </motion.div>
}

export function SearchPalette({ resources, query, onQueryChange }: SearchPaletteProps) {
  const reduced = useReducedMotion() ?? false
  // Below `lg` the bar gives the search the lane between the menu and the
  // account, and the pill is that lane. Above it the pill rests at its compact
  // width in the middle of the bar and grows into the lane when it opens.
  const laneLayout = useMediaQuery('(max-width: 1023.98px)')
  const listId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const laneRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [laneWidth, setLaneWidth] = useState(PANEL_WIDTH)

  const trimmed = query.trim()
  const normalized = trimmed.toLocaleLowerCase()
  const showingResults = normalized.length > 0

  // The field grows to its own limit or its lane, whichever is smaller.
  useLayoutEffect(() => {
    const lane = laneRef.current
    if (!lane) return
    const measure = () => setLaneWidth(lane.clientWidth)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(lane)
    return () => observer.disconnect()
  }, [])

  const expandedWidth = laneLayout
    ? Math.min(PANEL_WIDTH, laneWidth)
    : Math.min(PANEL_WIDTH, Math.max(COMPACT_WIDTH, laneWidth))
  // On a phone the field is the row, so the pill is already full width. On
  // desktop it rests at 240 and grows to the lane when it opens, leaving the
  // account and favourites cluster at the head of the bar in view.
  const collapsedWidth = laneLayout ? expandedWidth : Math.min(COMPACT_WIDTH, expandedWidth)

  const matches = useMemo(
    () => showingResults ? searchResources(resources, normalized) : [],
    [resources, normalized, showingResults],
  )

  const suggestions = useMemo(() => {
    const ranked = [...resources].sort((a, b) =>
      Number(b.favorite) - Number(a.favorite) || b.savedAt.localeCompare(a.savedAt))
    return ranked.slice(0, 6)
  }, [resources])

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    resources.forEach(resource => counts.set(resource.category, (counts.get(resource.category) ?? 0) + 1))
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 14)
  }, [resources])

  const visible = showingResults ? matches.slice(0, 16) : suggestions
  const active = activeIndex >= 0 && activeIndex < visible.length ? activeIndex : -1

  // A new query starts on its first result; an empty field has nothing highlighted.
  useEffect(() => {
    setActiveIndex(showingResults && visible.length > 0 ? 0 : -1)
  }, [normalized, showingResults]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard travel follows the same strip the eye does.
  useEffect(() => {
    if (activeIndex < 0) return
    const card = listRef.current?.querySelectorAll<HTMLElement>('[data-search-card]')[activeIndex]
    card?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activeIndex, visible.length])

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true })
  }, [open])

  useEffect(() => {
    if (open || !returnFocus.current) return
    returnFocus.current = false
    triggerRef.current?.focus({ preventScroll: true })
  }, [open])

  const expand = useCallback(() => {
    setOpen(true)
    setActiveIndex(normalized && matches.length > 0 ? 0 : -1)
  }, [normalized, matches.length])

  const close = useCallback((focusTrigger = true) => {
    setOpen(false)
    setActiveIndex(-1)
    if (query) onQueryChange('')
    returnFocus.current = focusTrigger
  }, [onQueryChange, query])

  // Ctrl K / Cmd K opens the field from anywhere; a second press returns to it.
  useEffect(() => {
    const onShortcut = (event: globalThis.KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLocaleLowerCase() !== 'k') return
      event.preventDefault()
      if (open) inputRef.current?.focus({ preventScroll: true })
      else expand()
    }
    document.addEventListener('keydown', onShortcut)
    return () => document.removeEventListener('keydown', onShortcut)
  }, [open, expand])

  /** Choosing a result goes straight to the site; there is no detail surface. */
  const choose = (resource: Resource) => {
    close(false)
    window.open(resource.url, '_blank', 'noopener,noreferrer')
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close(true)
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!visible.length) return
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex(current => current < 0
        ? (step > 0 ? 0 : visible.length - 1)
        : (current + step + visible.length) % visible.length)
      return
    }
    if (event.key === 'Enter') {
      const target = visible[active] ?? (showingResults ? visible[0] : undefined)
      if (!target) return
      event.preventDefault()
      choose(target)
    }
  }

  /** A click on the panel never blurs the field first, or the close would beat the selection. */
  const holdFocus = (event: { preventDefault: () => void }) => event.preventDefault()

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!open) return
    const next = event.relatedTarget as Node | null
    if (next && event.currentTarget.contains(next)) return
    close(false)
  }

  const shortcut = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform)
    ? '⌘ K'
    : 'Ctrl K'

  return <motion.div
    ref={laneRef}
    className="app-search"
    data-open={open || undefined}
    initial={false}
    // Below the column's breakpoint the bar is 56px tall, so the open field
    // takes a 48px step rather than the desktop 56 and keeps a little of the
    // bar's own height above and below it instead of touching its rules.
    animate={{ height: open ? (laneLayout ? 48 : 56) : 40 }}
    transition={reduced ? { duration: 0 } : motionTokens.spring.smooth}
    onBlur={onBlur}
  >
    <AnimatePresence>
      {open && <motion.div
        key="scrim"
        className="app-search-scrim"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : motionTokens.duration.fast }}
        onPointerDown={event => { event.preventDefault(); close(true) }}
      />}
    </AnimatePresence>

    <motion.div
      className="app-search-bar"
      data-open={open || undefined}
      initial={false}
      animate={{ width: open ? expandedWidth : collapsedWidth }}
      transition={reduced ? { duration: 0 } : motionTokens.spring.morph}
    >
      <button
        ref={triggerRef}
        type="button"
        className="app-search-trigger"
        aria-label="Search resources"
        aria-expanded={open}
        tabIndex={open ? -1 : 0}
        onClick={expand}
      />
      <Search className="app-search-icon" width={18} height={18} aria-hidden="true" />
      <input
        ref={inputRef}
        className="app-search-input"
        type="text"
        role="combobox"
        aria-label="Search resources"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={active >= 0 ? `${listId}-${visible[active]?.id}` : undefined}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        inert={!open}
        tabIndex={open ? 0 : -1}
        value={query}
        placeholder={open ? 'Search resources' : 'Search'}
        onChange={event => { onQueryChange(event.target.value); setActiveIndex(-1) }}
        onKeyDown={onKeyDown}
      />
      {!open && <kbd className="app-search-key" aria-hidden="true">{shortcut}</kbd>}
      <AnimatePresence initial={false}>
        {open && query && <motion.button
          key="clear"
          type="button"
          className="app-search-clear"
          aria-label="Clear search"
          tabIndex={-1}
          onPointerDown={holdFocus}
          onClick={() => { onQueryChange(''); setActiveIndex(-1); inputRef.current?.focus({ preventScroll: true }) }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? { opacity: 0, transition: { duration: 0 } } : {
            opacity: 0,
            scale: .6,
            transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] },
          }}
          transition={reduced ? { duration: motionTokens.duration.instant } : motionTokens.spring.snappy}
        ><X width={15} height={15} aria-hidden="true" /></motion.button>}
      </AnimatePresence>
    </motion.div>

    <AnimatePresence>
      {open && <Panel key="panel" width={expandedWidth} reduced={reduced}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={showingResults ? 'results' : 'suggestions'}
            className="app-search-view"
            initial={reduced ? { opacity: 0 } : { opacity: 0, filter: `blur(${motionTokens.blur.subtle}px)` }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }}
            transition={{ duration: reduced ? motionTokens.duration.instant : motionTokens.duration.fast, ease: [...motionTokens.ease.enter] }}
          >
            {showingResults
              ? <section className="app-search-section" aria-label="Search results">
                <h2 className="app-search-heading">
                  {matches.length === 0
                    ? `No matches for “${trimmed}”`
                    : `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}`}
                </h2>
                {visible.length > 0
                  ? <div ref={listRef} id={listId} className="app-search-strip app-search-cards" role="listbox" aria-label={`Results for ${trimmed}`} onPointerDown={holdFocus}>
                    {visible.map((resource, index) => <button
                      key={resource.id}
                      type="button"
                      role="option"
                      aria-selected={index === active}
                      data-search-card
                      data-active={index === active || undefined}
                      className="app-search-card"
                      title={`${resource.name}, ${resource.category}`}
                      onClick={() => choose(resource)}
                    >
                      <ResultThumb resource={resource} />
                      <span className="app-search-card-name">{resource.name}</span>
                      <span className="app-search-card-meta">{resource.category}</span>
                    </button>)}
                  </div>
                  : <div className="app-search-empty">
                    <p className="app-search-empty-title">Nothing in the catalogue matches that.</p>
                    <p className="app-search-empty-hint">Try a tool, an interaction, a category or a colour.</p>
                  </div>}
              </section>
              : <section className="app-search-section" aria-label="Suggestions">
                {categories.length > 0 && <>
                  <h2 className="app-search-heading">Browse</h2>
                  <div className="app-search-strip app-search-pills" onPointerDown={holdFocus}>
                    {categories.map(([category, count]) => <button
                      key={category}
                      type="button"
                      className="app-search-pill"
                      onClick={() => { onQueryChange(category); inputRef.current?.focus({ preventScroll: true }) }}
                    >{category}<span className="app-search-pill-count">{count}</span></button>)}
                  </div>
                </>}
                {suggestions.length > 0 && <>
                  <h2 className="app-search-heading">Suggestions</h2>
                  <div ref={listRef} id={listId} className="app-search-strip app-search-cards" role="listbox" aria-label="Suggestions" onPointerDown={holdFocus}>
                    {suggestions.map((resource, index) => <button
                      key={resource.id}
                      type="button"
                      role="option"
                      aria-selected={index === active}
                      data-search-card
                      data-active={index === active || undefined}
                      className="app-search-card"
                      title={`${resource.name}, ${resource.category}`}
                      onClick={() => choose(resource)}
                    >
                      <ResultThumb resource={resource} />
                      <span className="app-search-card-name">{resource.name}</span>
                      <span className="app-search-card-meta">{resource.category}</span>
                    </button>)}
                  </div>
                </>}
              </section>}
          </motion.div>
        </AnimatePresence>
        <span className="sr-only" role="status" aria-live="polite">
          {showingResults ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'}` : ''}
        </span>
      </Panel>}
    </AnimatePresence>
  </motion.div>
}
