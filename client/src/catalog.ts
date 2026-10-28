/**
 * The catalogue's taxonomy and the shape the API returns.
 *
 * The entries themselves live in Postgres and arrive from `GET /api/catalog`;
 * what stays here is the part the interface owns: the category list (name and
 * glyph), the eight shelves that group those categories, and the comparator
 * that reads the order the server sends.
 */

export type Category = { name: string; icon: string }
export type Collection = { id: string; label: string; description: string; categories: string[] }

export const categories: Category[] = [
  { name: 'Web galleries', icon: 'sparkles' },
  { name: 'App & flow libraries', icon: 'layout' },
  { name: 'Interaction references', icon: 'motion' },
  { name: 'Game & HUD UI', icon: 'board' },
  { name: 'Brand & visual systems', icon: 'palette' },
  { name: 'Moodboards & visual search', icon: 'images' },
  { name: 'Essays & craft', icon: 'file-text' },
  { name: 'Courses & books', icon: 'book' },
  { name: 'Patterns & guidelines', icon: 'check' },
  { name: 'Agent skills', icon: 'brain' },
  { name: 'Interface canvases', icon: 'panels' },
  { name: 'Motion design', icon: 'motion' },
  { name: '3D & spatial', icon: 'cube' },
  { name: 'Scanning & splats', icon: 'camera' },
  { name: 'Node & generative', icon: 'nodes' },
  { name: 'Digital fashion', icon: 'shirt' },
  { name: 'Whiteboards', icon: 'board' },
  { name: 'Frameworks & runtimes', icon: 'code' },
  { name: 'Editors & terminals', icon: 'terminal' },
  { name: 'Coding agents', icon: 'cpu' },
  { name: 'MCP & agent context', icon: 'link' },
  { name: 'Animation engines', icon: 'motion' },
  { name: 'WebGL & shaders', icon: 'cube' },
  { name: 'Deploy', icon: 'cloud' },
  { name: 'Headless primitives', icon: 'blocks' },
  { name: 'Component libraries', icon: 'blocks' },
  { name: 'Micro-interactions', icon: 'sparkles' },
  { name: 'Agent interfaces', icon: 'message' },
  { name: 'Charts, tables & canvases', icon: 'chart' },
  { name: 'Typefaces', icon: 'type' },
  { name: 'Icons & emoji', icon: 'shapes' },
  { name: 'Illustration', icon: 'paintbrush' },
  { name: 'Color systems', icon: 'palette' },
  { name: 'Textures, models & photo', icon: 'image' },
  { name: 'Audio', icon: 'audio' },
  { name: 'Motion & easing', icon: 'motion' },
  { name: 'Color & contrast', icon: 'pipette' },
  { name: 'CSS & type', icon: 'code' },
  { name: 'SVG & images', icon: 'image' },
  { name: 'Code & product shots', icon: 'camera' },
  { name: 'Performance & accessibility', icon: 'gauge' },
  { name: 'Launchers & productivity', icon: 'rocket' },
  { name: 'Recording & video', icon: 'video' },
  { name: 'Notes & organization', icon: 'folder' },
  { name: 'AI assistants', icon: 'sparkles' },
  { name: 'Browsers', icon: 'globe' },
]

export const collections: Collection[] = [
  {
    id: 'Observe',
    label: 'Observe',
    description: 'Shipped sites, recorded flows and references to study before you open an editor.',
    categories: ['Web galleries', 'App & flow libraries', 'Interaction references', 'Game & HUD UI', 'Brand & visual systems', 'Moodboards & visual search'],
  },
  {
    id: 'Read',
    label: 'Read',
    description: 'Essays, books and guidelines that change how you build.',
    categories: ['Essays & craft', 'Courses & books', 'Patterns & guidelines', 'Agent skills'],
  },
  {
    id: 'Create',
    label: 'Create',
    description: 'Where the interface gets shaped, animated and captured.',
    categories: ['Interface canvases', 'Motion design', '3D & spatial', 'Scanning & splats', 'Node & generative', 'Digital fashion', 'Whiteboards'],
  },
  {
    id: 'Build',
    label: 'Build',
    description: 'The stack that ships it, from the first component to the last deploy.',
    categories: ['Frameworks & runtimes', 'Editors & terminals', 'Coding agents', 'MCP & agent context', 'Animation engines', 'WebGL & shaders', 'Deploy'],
  },
  {
    id: 'Components',
    label: 'Components',
    description: 'Behaviour, looks and the moment after the click.',
    categories: ['Headless primitives', 'Component libraries', 'Micro-interactions', 'Agent interfaces', 'Charts, tables & canvases'],
  },
  {
    id: 'Assets',
    label: 'Assets',
    description: 'Type, icons, colour, imagery and sound.',
    categories: ['Typefaces', 'Icons & emoji', 'Illustration', 'Color systems', 'Textures, models & photo', 'Audio'],
  },
  {
    id: 'Tools',
    label: 'Tools',
    description: 'Small instruments for curves, contrast, CSS, SVG and speed.',
    categories: ['Motion & easing', 'Color & contrast', 'CSS & type', 'SVG & images', 'Code & product shots', 'Performance & accessibility'],
  },
  {
    id: 'Desk',
    label: 'Desk',
    description: 'The native apps that stay open all day.',
    categories: ['Launchers & productivity', 'Recording & video', 'Notes & organization', 'AI assistants', 'Browsers'],
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
