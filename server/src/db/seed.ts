import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resource } from './schema.js'
import { db, sql } from './index.js'

/**
 * Seeds the shared catalogue from `catalog.json`, which was exported once from
 * the client's old `catalog.ts`. Re-running it is safe: an address already in
 * the table is left alone, so an edited description in the database survives.
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

/** After the captured order, entries keep the catalogue's own sequence. */
const fallbackRank = new Map<string, number>()
let nextFallback = lastRank

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
let inserted = 0

for (let index = 0; index < rows.length; index += chunk) {
  const batch = rows.slice(index, index + chunk)
  const result = await db
    .insert(resource)
    .values(batch)
    .onConflictDoNothing({ target: resource.url })
    .returning({ id: resource.id })
  inserted += result.length
}

console.log(`Seeded ${inserted} of ${rows.length} catalogue entries.`)
await sql.end()
