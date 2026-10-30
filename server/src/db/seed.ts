import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { max, sql as rawSql } from 'drizzle-orm'
import { resource } from './schema.js'
import { db, sql } from './index.js'

/**
 * Seeds the shared catalogue from `catalog.json`, which was exported once from
 * the client's old `catalog.ts`. Re-running it is safe: an address already in
 * the table keeps its row and an edited description, and only its category is
 * re-synced from the file, because the tags are the app's own taxonomy.
 *
 *   npm run db:seed
 */

type SeedEntry = {
  name: string
  url: string
  description: string
  category: string
}

type SeedFile = {
  resources: SeedEntry[]
  popularityOrder: string[]
}

/** The same normalisation the client uses, so ranks line up with old links. */
function normaliseUrl(value: string) {
  return value.trim().replace(/\/+$/, '')
}

const raw = await readFile(new URL('./catalog.json', import.meta.url), 'utf8')
const seed = JSON.parse(raw) as SeedFile

const rankByUrl = new Map(seed.popularityOrder.map((url, index) => [normaliseUrl(url), index]))
const lastRank = seed.popularityOrder.length

/**
 * A re-seed must not hand a new entry a rank the table already uses: the rows
 * seeded before it took fallback ranks past the captured order, so the first
 * free rank is one past the highest one live.
 */
const [highest] = await db.select({ rank: max(resource.rank) }).from(resource)
const firstFreeRank = Math.max(lastRank, Number(highest?.rank ?? -1) + 1)

/** After the captured order, entries keep the catalogue's own sequence. */
const fallbackRank = new Map<string, number>()
let nextFallback = firstFreeRank

const rows = seed.resources.map((entry) => {
  const url = normaliseUrl(entry.url)
  const ranked = rankByUrl.get(url)
  const rank = ranked ?? fallbackRank.get(url) ?? nextFallback++

  return {
    // Stable ids keep a re-seed from minting new rows for the same address.
    id: `seed-${createHash('sha256').update(url).digest('hex').slice(0, 24)}`,
    name: entry.name,
    url,
    description: entry.description,
    category: entry.category,
    rank,
    submittedById: null,
  }
})

const chunk = 100
let written = 0

for (let index = 0; index < rows.length; index += chunk) {
  const batch = rows.slice(index, index + chunk)
  const result = await db
    .insert(resource)
    .values(batch)
    // An address already in the table keeps its id and any edited description;
    // only the category is re-synced, because the tag list is the app's own
    // taxonomy and a stale tag would fall out of its shelf.
    .onConflictDoUpdate({
      target: resource.url,
      set: { category: rawSql`excluded.category` },
    })
    .returning({ id: resource.id })
  written += result.length
}

console.log(`Seeded ${rows.length} catalogue entries (${written} rows written).`)
await sql.end()
