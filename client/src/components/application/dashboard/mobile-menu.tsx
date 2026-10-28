"use client"

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Bookmark, ChevronRight, Plus, X } from '@/components/icons'
import { BrandMark } from '@/components/brand/brand-mark'
import { IconMorph } from '@/components/arc/icon-morph/icon-morph'
import { useSidebar } from '@/components/ui/sidebar'
import { NAV_SECTIONS } from '@/components/sidebar-preset/nav-data'
import { countLabel, countResources } from '@/lib/library-counts'
import { useIcons, type IconComponent } from '@/lib/icon-context'
import type { LibraryMoodboard } from '@/lib/library-types'
import { navViewFor, type Resource } from '@/catalog'

/**
 * The navigation below the column's breakpoint.
 *
 * Above `lg` the sidebar is a column on the page. Below it the column steps
 * out of the layout entirely and this sheet takes its place: the whole screen,
 * the same destinations in the same order, the same counts. There is no drawer
 * beside the content and no second copy of the page behind it.
 *
 * The surface is the page, not a card, so it is built on Radix's dialog
 * primitive directly, the way the preset builds its own sheets: Arc's
 * `DialogContent` always draws a floating panel and a header of its own, and
 * this is neither. The trigger is Arc's icon morph, so the menu lines fold
 * into a cross as the sheet opens. The sheet carries its own close control at
 * the head, because a full-screen surface has no edge to tap outside of.
 */
export function MobileMenu({
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
  const { isMobile } = useSidebar()
  const reduced = useReducedMotion() ?? false
  const [open, setOpen] = useState(false)
  const icons = useIcons()
  const counts = useMemo(() => countResources(resources, moodboards), [resources, moodboards])

  if (!isMobile) return null

  const row = (
    view: string,
    label: string,
    Icon: IconComponent,
    options: { count?: number; trailing?: ReactNode; active?: boolean; onSelect?: () => void } = {},
  ) => (
    <button
      key={view}
      type="button"
      className="app-menu-row"
      data-active={(options.active ?? view === selected) || undefined}
      onClick={() => {
        if (options.onSelect) options.onSelect()
        else onSelect(view)
        setOpen(false)
      }}
    >
      <Icon size={18} />
      <span className="app-menu-name">{label}</span>
      {options.count !== undefined && (
        <span className="app-menu-count" aria-hidden="true">{options.count}</span>
      )}
      {options.count !== undefined && (
        <span className="sr-only">{`, ${countLabel(options.count)}`}</span>
      )}
      {options.trailing}
    </button>
  )

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
                <span className="app-sidebar-wordmark">desgnix<span className="brand-period">.</span></span>
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
                {row('Moodboard', 'Moodboards', icons['folder-open'], {
                  trailing: <ChevronRight size={16} aria-hidden="true" className="app-menu-chevron" />,
                })}
                {moodboards.map(moodboard =>
                  row(moodboard.id, moodboard.name, icons.folder, { count: counts.get(moodboard.id) ?? 0 }),
                )}
                {row('new-moodboard', 'Create moodboard', icons.plus, { onSelect: onNewMoodboard })}
              </div>

              <div className="app-menu-group">
                {row('Favorites', 'Favourites', Bookmark, { onSelect: () => onSelect('Favorites') })}
                {row('submit', 'Submit a resource', Plus, { onSelect: onSubmitResource })}
              </div>
            </nav>

            <div className="app-menu-foot">
              <span>© 2026 desgnix</span>
              <span>Resources for design engineers</span>
            </div>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>}
    </AnimatePresence>
  </DialogPrimitive.Root>
}
