import { useLayoutEffect } from 'react'
import { prefersDark, readStoredTheme } from '@/lib/theme'

/**
 * The auth pages and the session boot sit outside the app shell, so they do not
 * get the shell's theme effect. This mirrors the saved preference onto <html>
 * once, so a dark account never meets a light sign-in page.
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    const preference = readStoredTheme()
    const dark = preference === 'dark' || (preference === 'system' && prefersDark())
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', dark ? '#020202' : '#fafafa')
  }, [])

  return null
}
