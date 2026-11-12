import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { max, sql as rawSql } from 'drizzle-orm'
import { resource } from './schema.js'
import { db, sql } from './index.js'

/**
 * Seeds the shared catalogue from `catalog.json`, which is in rank order.
 * Re-running is safe: a URL already in the table keeps its row, its rank and
 * its edited description, and only its category is re-synced from the file,
 * because the tags are the app's own taxonomy.
 *
 * A row's rank is its position in the file. A new entry is appended to the end
 * of `resources`, but the table may already use ranks past that position, so a
 * row that has to be inserted takes the first free rank instead and the file's
 * order is kept among the rows added in the same run.
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
}

/** The same normalisation the client uses. */
function normaliseUrl(value: string) {
  return value.trim().replace(/\/+$/, '')
}

const raw = await readFile(new URL('./catalog.json', import.meta.url), 'utf8')
const seed = JSON.parse(raw) as SeedFile

/**
 * A re-seed must not hand a new entry a rank the table already uses. Rows
 * seeded before this file took their ranks from an older order, so the first
 * free rank is one past the highest one live.
 */
const [highest] = await db.select({ rank: max(resource.rank) }).from(resource)
const firstFreeRank = Number(highest?.rank ?? -1) + 1

const rows = seed.resources.map((entry, index) => ({
  // Stable ids keep a re-seed from minting new rows for the same address.
  id: `seed-${createHash('sha256').update(normaliseUrl(entry.url)).digest('hex').slice(0, 24)}`,
  name: entry.name,
  url: normaliseUrl(entry.url),
  description: entry.description,
  category: entry.category,
  // On an empty table this is the file's own order; on a live one, an inserted
  // row lands past every rank in use and keeps its place among its batch.
  rank: firstFreeRank + index,
  submittedById: null,
}))

const chunk = 100
let written = 0

for (let index = 0; index < rows.length; index += chunk) {
  const batch = rows.slice(index, index + chunk)
  const result = await db
    .insert(resource)
    .values(batch)
    // An address already in the table keeps its id and rank; only the category
    // is re-synced because the tag list is the app's own taxonomy.
    .onConflictDoUpdate({
      target: resource.url,
      set: { category: rawSql`excluded.category` },
    })
    .returning({ id: resource.id })
  written += result.length
}

console.log(`Seeded ${rows.length} catalogue entries (${written} rows written).`)
await sql.end()
