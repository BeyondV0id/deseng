/**
 * The landing page's own words. The loading page draws the real header so the
 * first band lands where the loaded one will, and that only works if both
 * pages read the same strings from here rather than keeping a copy each.
 */
export const LIBRARY_HEADING = 'Resources for design engineers'

export const LIBRARY_SUBHEADING = 'Sites, flows, components, assets and the tools around them, filed by what you need when you open the editor.'

/** The count line under the description, once the catalogue is in. */
export function libraryMeta(total: number, shown: number, query: string) {
  const entries = total === 1 ? 'entry' : 'entries'
  const count = query.trim() ? `${shown} of ${total} ${entries}` : `${total} ${entries}`
  return `${count}, grouped by tag and in the library's order.`
}
