/**
 * The catalogue's taxonomy and the shape the API returns.
 *
 * The entries themselves live in Postgres and arrive from `GET /api/catalog`;
 * what stays here is the part the interface owns: the tag list, the eight
 * shelves that group those tags, and the comparator that reads the order the
 * server sends.
 *
 * A tag is a plain tool noun, one or two words, and it names the thing on the
 * other end of the link rather than the feeling of browsing it: `Shaders`, not
 * `WebGL & shaders`; `Fonts`, not `Typefaces`. Each shelf gathers the tags that
 * answer the same question, and a tag belongs to exactly one shelf, so the
 * sidebar count and the tag page can never disagree.
 */

export type Collection = { id: string; label: string; description: string; categories: string[] }

/** Every tag, in the order the shelves present them. */
export const categories: string[] = [
  // Observe: what shipped, recorded and archived.
  'Product flows',
  'Interaction demos',
  'Identity systems',
  'Visual search',
  // Read: what changes how you build.
  'Essays',
  'Reading list',
  'Guidelines',
  // Create: where the work gets shaped.
  'Design canvases',
  'Motion editors',
  '3D modeling',
  '3D scanning',
  'Node graphs',
  'Garment design',
  'Infinite canvas',
  // Build: the stack underneath.
  'Frameworks',
  'Editors',
  'Code agents',
  'Agent context',
  'Animation libraries',
  'Shaders',
  'Hosting',
  // Components: behaviour and the moment after the click.
  'Primitives',
  'UI kits',
  'Micro-motion',
  'Agent UI',
  'Data display',
  // Assets: what you drop into the file.
  'Fonts',
  'Icons',
  'Illustrations',
  'Palettes',
  '3D assets',
  'Imagery',
  'Sound',
  // Tools: the small instruments.
  'Easing',
  'Color tools',
  'CSS',
  'SVG tools',
  'Image tools',
  'Code tools',
  'Performance',
  'Accessibility',
  // Desk: the apps that stay open all day.
  'Launchers',
  'Screen recording',
  'Notes',
  'Assistants',
  'Browsers',
]

export const collections: Collection[] = [
  {
    id: 'Observe',
    label: 'Observe',
    description: 'Recorded flows, interactions and visual references to study before you open an editor.',
    categories: ['Product flows', 'Interaction demos', 'Identity systems', 'Visual search'],
  },
  {
    id: 'Read',
    label: 'Read',
    description: 'Essays, books and guidelines that change how you build.',
    categories: ['Essays', 'Reading list', 'Guidelines'],
  },
  {
    id: 'Create',
    label: 'Create',
    description: 'Where the interface gets shaped, animated and captured.',
    categories: ['Design canvases', 'Motion editors', '3D modeling', '3D scanning', 'Node graphs', 'Garment design', 'Infinite canvas'],
  },
  {
    id: 'Build',
    label: 'Build',
    description: 'The stack that ships it, from the first component to the last deploy.',
    categories: ['Frameworks', 'Editors', 'Code agents', 'Agent context', 'Animation libraries', 'Shaders', 'Hosting'],
  },
  {
    id: 'Components',
    label: 'Components',
    description: 'Behaviour, looks and the moment after the click.',
    categories: ['Primitives', 'UI kits', 'Micro-motion', 'Agent UI', 'Data display'],
  },
  {
    id: 'Assets',
    label: 'Assets',
    description: 'Type, icons, colour, imagery and sound.',
    categories: ['Fonts', 'Icons', 'Illustrations', 'Palettes', '3D assets', 'Imagery', 'Sound'],
  },
  {
    id: 'Tools',
    label: 'Tools',
    description: 'Small instruments for easing, contrast, CSS, SVG, images and speed.',
    categories: ['Easing', 'Color tools', 'CSS', 'SVG tools', 'Image tools', 'Code tools', 'Performance', 'Accessibility'],
  },
  {
    id: 'Desk',
    label: 'Desk',
    description: 'The native apps that stay open all day.',
    categories: ['Launchers', 'Screen recording', 'Notes', 'Assistants', 'Browsers'],
  },
]

export function collectionById(id: string): Collection | undefined {
  return collections.find((collection) => collection.id === id)
}

/**
 * A tag page is a view of one category, so the view string carries the tag.
 * The prefix keeps a tag apart from a shelf id and a moodboard id.
 */
const categoryViewPrefix = 'Category:'

export function categoryView(category: string) {
  return `${categoryViewPrefix}${category}`
}

/** The category a view opens, or `null` when it opens something else. */
export function categoryFromView(view: string): string | null {
  return view.startsWith(categoryViewPrefix) ? view.slice(categoryViewPrefix.length) : null
}

/** The shelf a category lives on, so a tag page can mark the row it came from. */
export function collectionForCategory(category: string): Collection | undefined {
  return collections.find((collection) => collection.categories.includes(category))
}

/** The nav row a view belongs to: a tag page marks the shelf that holds it. */
export function navViewFor(view: string): string {
  const category = categoryFromView(view)
  if (!category) return view
  return collectionForCategory(category)?.id ?? 'All resources'
}

export type Resource = {
  id: string
  name: string
  url: string
  description: string
  category: string
  /** The catalogue's fixed position. The server sends it already sorted. */
  rank: number
  /** The site's Open Graph image, resolved on the server; `null` when it has none. */
  imageUrl: string | null
  /** The site's favicon, the step between the preview and the initial. */
  faviconUrl: string | null
  imageWidth: number | null
  imageHeight: number | null
  savedAt: string
  favorite: boolean
  moodboardId?: string
  submitted?: boolean
}

/**
 * The catalogue's one fixed order: the captured rank, then the name. Saving a
 * card or filing it in a moodboard does not move the grid, because neither
 * touches the rank.
 */
export function comparePopularity(
  a: Pick<Resource, 'name' | 'rank'>,
  b: Pick<Resource, 'name' | 'rank'>,
) {
  return a.rank - b.rank || a.name.localeCompare(b.name)
}
