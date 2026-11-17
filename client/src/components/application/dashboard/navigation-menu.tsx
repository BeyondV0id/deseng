"use client"

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Bookmark, ChevronRight, Plus, X } from '@/components/icons'
import { BrandMark } from '@/components/brand/brand-mark'
import { IconMorph } from '@/components/arc/icon-morph/icon-morph'
import { NAV_SECTIONS } from '@/lib/navigation'
import { countLabel, countResources } from '@/lib/library-counts'
import { useIcons, type IconComponent } from '@/lib/icon-context'
import type { LibraryMoodboard } from '@/lib/library-types'
import { navViewFor, type Resource } from '@/catalog'
import { favorites, moodboardShelf, pathForView } from '@/lib/view-path'

/**
 * The full-screen navigation menu, shared by desktop and mobile.
 *
 * The surface is the page, not a card, so it is built on Radix's dialog
 * primitive directly, the way the preset builds its own sheets: Arc's
 * `DialogContent` always draws a floating panel and a header of its own, and
 * this is neither. The trigger is Arc's icon morph, so the menu lines fold
 * into a cross as the sheet opens. The sheet carries its own close control at
 * the head, because a full-screen surface has no edge to tap outside of.
 */
export function NavigationMenu({
  selected,
  onSelect,
  onSubmitResource,
  moodboards,
  onNewMoodboard,
  resources,
}: {
  selected: string
  onSelect: (view: string) => void
  onSubmitResource: () => void
  moodboards: LibraryMoodboard[]
  onNewMoodboard: () => void
  resources: Resource[]
}) {
  const reduced = useReducedMotion() ?? false
  const [open, setOpen] = useState(false)
  const icons = useIcons()
  const counts = useMemo(() => countResources(resources, moodboards), [resources, moodboards])

  const row = (
    view: string,
    label: string,
    Icon: IconComponent,
    options: { count?: number; trailing?: ReactNode; active?: boolean; onSelect?: () => void } = {},
  ) => {
    const active = (options.active ?? view === selected) || undefined
    const content = <>
      <Icon size={18} />
      <span className="app-menu-name">{label}</span>
      {options.count !== undefined && (
        <span className="app-menu-count" aria-hidden="true">{options.count}</span>
      )}
      {options.count !== undefined && (
        <span className="sr-only">{`, ${countLabel(options.count)}`}</span>
      )}
      {options.trailing}
    </>

    // An action closes over the sheet; a destination is a link to the address
    // its view lives at, so the row can be opened in a second tab.
    const action = options.onSelect
    if (action) {
      return <button
        key={view}
        type="button"
        className="app-menu-row"
        data-active={active}
        onClick={() => { action(); setOpen(false) }}
      >{content}</button>
    }

    return <a
      key={view}
      className="app-menu-row"
      href={pathForView(view)}
      data-active={active}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
        event.preventDefault()
        onSelect(view)
        setOpen(false)
      }}
    >{content}</a>
  }

  return <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
    <DialogPrimitive.Trigger asChild>
      <button type="button" className="app-menu-trigger" aria-label="Browse the library">
        <IconMorph name="menu" state={open} size={20} />
      </button>
    </DialogPrimitive.Trigger>

    <AnimatePresence>
      {open && <DialogPrimitive.Portal forceMount>
        <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
          <motion.div
            className="app-menu"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.14, ease: [0.4, 0, 1, 1] } }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 38 }}
          >
            <DialogPrimitive.Title className="sr-only">Browse the library</DialogPrimitive.Title>

            <div className="app-menu-head">
              <span className="brand app-menu-brand">
                <BrandMark />
                <span>Reference</span>
              </span>
              <DialogPrimitive.Close className="app-menu-close" aria-label="Close menu">
                <X size={18} />
              </DialogPrimitive.Close>
            </div>

            <nav className="app-menu-body">
              <div className="app-menu-group">
                <p className="app-menu-label">Browse</p>
                {NAV_SECTIONS.flatMap(section => section.items.map(item =>
                  row(item.view, item.label, icons[item.icon], {
                    count: counts.get(item.view) ?? 0,
                    active: item.view === navViewFor(selected),
                  }),
                ))}
              </div>

              <div className="app-menu-group">
                {/* The heading row opens the shelf, so its trailing slot is the
                    chevron rather than a count, the way the column does it. */}
                {row(moodboardShelf, 'Moodboards', icons['folder-open'], {
                  trailing: <ChevronRight size={16} aria-hidden="true" className="app-menu-chevron" />,
                })}
                {moodboards.map(moodboard =>
                  row(moodboard.id, moodboard.name, icons.folder, { count: counts.get(moodboard.id) ?? 0 }),
                )}
                {row('new-moodboard', 'Create moodboard', icons.plus, { onSelect: onNewMoodboard })}
              </div>

              <div className="app-menu-group">
                {row(favorites, 'Favourites', Bookmark)}
                {row('submit', 'Submit a resource', Plus, { onSelect: onSubmitResource })}
              </div>
            </nav>

            <div className="app-menu-foot">
              <span className="app-menu-foot-meta">
                <span>© 2026 Reference</span>
                <Link to="/info" className="app-menu-foot-link" onClick={() => setOpen(false)}>Info</Link>
              </span>
              <span>Interface references, kept in one order</span>
            </div>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>}
    </AnimatePresence>
  </DialogPrimitive.Root>
}
