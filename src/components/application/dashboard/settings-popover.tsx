import type { ComponentType } from 'react'
import { Monitor, Moon, Settings, Sun, VolumeMute, VolumeUp } from '@/components/icons'
import { Button } from '@/components/arc/button/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/arc/popover/popover'
import SegmentedControl from '@/components/arc/segmented-control/segmented-control'
import { setSoundMuted, useSoundMuted } from '@/components/ui/sound'
import type { ThemeSwitchVariant } from '@/components/arc/theme-switch/theme-switch'
import { cn } from '@/lib/utils'

export type ThemePreference = 'light' | 'dark' | 'system'

type GlyphIcon = ComponentType<{ size?: number; title?: string }>

/** An icon-only option: the glyph you see, the name for the tooltip and for
 *  a screen reader. */
function glyph(Icon: GlyphIcon, name: string) {
  return <><Icon size={16} title={name} aria-hidden="true" /><span className="sr-only">{name}</span></>
}

export function SettingsPopover({ theme, onThemeChange, align = 'start', side = 'top', sideOffset = 8, className, open, onOpenChange }: {
  theme: ThemePreference
  onThemeChange: (theme: ThemePreference, variant: ThemeSwitchVariant) => void
  /** Which edge of the trigger the panel lines up with. */
  align?: 'start' | 'center' | 'end'
  /** Which side of the trigger the panel opens on. */
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  /** Extra classes on the gear, for the surface it sits in. */
  className?: string
  /** Controlled open state, for when something else opens these settings. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const muted = useSoundMuted()

  return <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="sm" className={cn('app-settings-button', className)} aria-label="Settings"><Settings size={19} /></Button>
    </PopoverTrigger>
    <PopoverContent className="app-settings-popover" align={align} side={side} sideOffset={sideOffset} aria-label="Settings">
      <div className="settings-row">
        <span className="settings-row-label" aria-hidden="true">Theme</span>
        <SegmentedControl
          className="settings-segmented"
          label="Theme"
          value={theme}
          onValueChange={next => onThemeChange(next as ThemePreference, 'rise')}
          options={[
            { value: 'light', label: '', accessory: glyph(Sun, 'Light') },
            { value: 'dark', label: '', accessory: glyph(Moon, 'Dark') },
            { value: 'system', label: '', accessory: glyph(Monitor, 'System') },
          ]}
        />
      </div>
      <div className="settings-row">
        <span className="settings-row-label" aria-hidden="true">Sound</span>
        <SegmentedControl
          className="settings-segmented"
          label="Interface sounds"
          value={muted ? 'off' : 'on'}
          onValueChange={next => setSoundMuted(next === 'off')}
          options={[
            { value: 'off', label: '', accessory: glyph(VolumeMute, 'Sound off') },
            { value: 'on', label: '', accessory: glyph(VolumeUp, 'Sound on') },
          ]}
        />
      </div>
    </PopoverContent>
  </Popover>
}
