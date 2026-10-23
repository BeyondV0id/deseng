import { useRef, type ComponentType } from 'react'
import {
  Box, ChevronRight, Cpu, Feather, Gear, Image, Images, Iphone, Paintbrush, Palette3,
  Plus, Shapes, Sparkles, Text, Widget, X,
} from '@/components/icons'
import { FluidHoverHighlight } from '@/components/fluid-hover-highlight'
import { useFluidHover, useRegisterFluidHoverItem } from '@/hooks/use-fluid-hover'
import { SettingsPopover, type ThemePreference } from '@/components/application/dashboard/settings-popover'
import type { ThemeSwitchVariant } from '@/components/arc/theme-switch/theme-switch'
import { collections } from '@/catalog'
import { cn } from '@/lib/utils'

type IconType = ComponentType<{ size?: number; className?: string }>
type BrowseItem = { view: string; label: string; icon: IconType; color?: string }

/**
 * One glyph per collection, all from Reicon and all drawn in the same thin
 * outline style, so the shelf reads as one set rather than a mixed bag.
 */
const collectionIcons: Record<string, IconType> = {
  'Design Inspiration': Sparkles,
  'UI': Widget,
  'Graphics': Image,
  'Mockups': Iphone,
  'Illustrations': Paintbrush,
  'Icons': Shapes,
  'Style': Feather,
  'Colours': Palette3,
  'Fonts': Text,
  'Tools': Gear,
}

const browseItems: BrowseItem[] = [
  ...collections.map(collection => ({ view: collection.id, label: collection.label, icon: collectionIcons[collection.id] ?? Box })),
  { view: 'Agents', label: 'Agents', icon: Cpu },
]

export function DashboardSidebar({
  selected = 'All resources',
  onSelect = () => { },
  onNewMoodboard = () => { },
  collapsed = false,
  mobile = false,
  onClose,
  themePreference = 'system',
  onThemeChange = () => { },
  settingsOpen = false,
  onSettingsOpenChange = () => { },
}: {
  selected?: string
  onSelect?: (view: string) => void
  onNewMoodboard?: () => void
  collapsed?: boolean
  mobile?: boolean
  onClose?: () => void
  themePreference?: ThemePreference
  onThemeChange?: (theme: ThemePreference, variant: ThemeSwitchVariant) => void
  /** The settings live at the foot of the sidebar, not in the top bar. */
  settingsOpen?: boolean
  onSettingsOpenChange?: (open: boolean) => void
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const moodboardListRef = useRef<HTMLDivElement>(null)
  const nav = useFluidHover(listRef, { axis: 'y', gapClick: false })
  const moodboardNav = useFluidHover(moodboardListRef, { axis: 'y', gapClick: false })
  const isCollapsed = collapsed && !mobile

  return <aside className={cn(
    'sidebar dashboard-sidebar flex h-full shrink-0 flex-col overflow-hidden bg-background-secondary-default transition-[width] duration-300 ease-in-out',
    isCollapsed ? 'is-collapsed w-15 px-[11px] py-0' : 'w-full p-0',
  )}>
    {mobile && <div className="sidebar-mobile-close"><button className="icon-button small" type="button" aria-label="Close sidebar" onClick={onClose}><X size={16} /></button></div>}
    <div className="sidebar-heading browse-heading"><span className="sidebar-label">Browse</span></div>
    <div ref={listRef} className="quick-nav fluid-list" {...nav.handlers}>
      <FluidHoverHighlight hover={nav} className="sidebar-row-highlight" />
      {browseItems.map((item, index) => <SidebarNavItem
        key={item.view}
        index={index}
        item={item}
        active={selected === item.view}
        collapsed={isCollapsed}
        hover={nav}
        onClick={() => onSelect(item.view)}
      />)}
    </div>

    <div className="moodboard-list dashboard-moodboard-list">
      <div ref={moodboardListRef} className="moodboard-nav fluid-list" {...moodboardNav.handlers}>
        <FluidHoverHighlight hover={moodboardNav} className="sidebar-row-highlight" />
        <SidebarNavItem
          index={0}
          item={{ view: 'Moodboard', label: 'Moodboard', icon: Images }}
          active={selected === 'Moodboard'}
          collapsed={isCollapsed}
          hover={moodboardNav}
          showChevron
          onClick={() => onSelect('Moodboard')}
        />
      </div>
      {!isCollapsed && <button type="button" className="sidebar-nav-item create-moodboard-item" onClick={onNewMoodboard}><Plus size={16} /><span>Create moodboard</span></button>}
    </div>

    {/* The settings live at the foot of the sidebar: the theme and the sound. */}
    <div className="sidebar-footer">
      <SettingsPopover
        theme={themePreference}
        onThemeChange={onThemeChange}
        align="end"
        side="top"
        open={settingsOpen}
        onOpenChange={onSettingsOpenChange}
      />
    </div>
  </aside>
}

function SidebarNavItem({
  item, index, active, collapsed, hover, showChevron = false, onClick,
}: {
  item: BrowseItem
  index: number
  active: boolean
  collapsed: boolean
  hover: ReturnType<typeof useFluidHover<HTMLDivElement>>
  showChevron?: boolean
  onClick: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  useRegisterFluidHoverItem(hover.registerItem, index, ref)
  const Icon = item.icon
  return <button
    ref={ref}
    type="button"
    data-slot="navigation-menu-item"
    onFocus={() => hover.setActiveIndex(index)}
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    aria-label={item.label}
    title={collapsed ? item.label : undefined}
    className={cn('sidebar-nav-item group relative z-10 flex items-center justify-between overflow-hidden p-2 transition-colors duration-200', collapsed ? 'w-9' : 'w-full', active ? 'is-selected' : 'hover:bg-background-secondary-hover')}
  >
    <span className={cn('flex min-w-0 items-center gap-2', !collapsed && 'flex-1')}><span className="flex shrink-0 items-center" style={item.color ? { color: item.color } : undefined}><Icon size={20} className={cn('size-5 shrink-0 transition-colors duration-150', item.color ? '' : active ? 'text-text-primary' : 'text-foreground-icon-secondary group-hover:text-text-primary group-focus-visible:text-text-primary')} /></span><Collapsible collapsed={collapsed} selected={active}>{item.label}</Collapsible></span>
    {showChevron && !collapsed && <ChevronRight size={15} className="moodboard-row-chevron shrink-0" />}
  </button>
}

function Collapsible({ collapsed, selected = false, children }: { collapsed: boolean; selected?: boolean; children: React.ReactNode }) {
  return <span className={cn('flex min-w-0 items-center overflow-hidden transition-[max-width,opacity,filter] duration-300 ease-in-out', collapsed ? 'max-w-0 opacity-0 blur-[3px]' : 'max-w-full opacity-100 blur-0')}>
    <span className={cn('sidebar-item-label whitespace-nowrap', selected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary group-focus-visible:text-text-primary')}>{children}</span>
  </span>
}
