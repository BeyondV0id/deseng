/**
 * The theme a person picked. `system` follows the OS live through a
 * `matchMedia` listener; `client/src/pages/page.tsx` resolves it to a concrete
 * theme.
 *
 * The account menu is the only place this is chosen.
 */
export type ThemePreference = 'light' | 'dark' | 'system'

/** The one key the preference is stored under, shared by every surface. */
export const themeStorageKey = 'reference-theme-v2'

// Keep this order in sync with the first-paint script in index.html.
const themeReadKeys = [themeStorageKey, 'desgnix-theme-v2', 'deseng-theme-v2', 'fieldnotes-theme-v2']

/** The saved preference, or the app's default when nothing valid is stored. */
export function readStoredTheme(): ThemePreference {
  try {
    for (const key of themeReadKeys) {
      const stored = localStorage.getItem(key)
      if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
    }
  } catch {}
  return 'dark'
}

/** What the operating system asks for right now. */
export function prefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}
