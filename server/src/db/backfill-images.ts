import { asc, eq, isNull, sql as rawSql } from 'drizzle-orm'
import { resolveImages } from '../lib/metadata.js'
import { db, sql } from './index.js'
import { resource } from './schema.js'

/**
 * One-time backfill for the catalogue that predates server-side previews.
 *
 *   npm run db:backfill-images
 *   npm run db:backfill-images -- --limit=25
 *   npm run db:backfill-images -- --refresh
 *
 * Rows already checked are skipped, so re-running the script is cheap and a
 * row whose site was down gets another try only with `--refresh`. Each row is
 * written as soon as it resolves, so stopping the script loses nothing.
 */

const args = process.argv.slice(2)
const refresh = args.includes('--refresh')
const readNumber = (flag: string, fallback: number) => {
  const match = args.find((arg) => arg.startsWith(`--${flag}=`))
  const value = match ? Number.parseInt(match.slice(flag.length + 3), 10) : Number.NaN
  return Number.isFinite(value) && value > 0 ? value : fallback
}

const limit = readNumber('limit', Number.POSITIVE_INFINITY)
const concurrency = Math.min(readNumber('concurrency', 5), 10)

const ordered = db
  .select({ id: resource.id, name: resource.name, url: resource.url })
  .from(resource)
  .where(refresh ? rawSql`true` : isNull(resource.imageCheckedAt))
  .orderBy(asc(resource.rank), asc(resource.name))

const rows = Number.isFinite(limit) ? await ordered.limit(limit) : await ordered

console.log(
  `${rows.length} ${rows.length === 1 ? 'entry' : 'entries'} to resolve` +
    `${refresh ? ' (refreshing every row)' : ''}, ${concurrency} at a time.`,
)

const queue = [...rows]
let finished = 0
let withImage = 0
let withMark = 0

async function resolveRow(row: (typeof rows)[number]) {
  const images = await resolveImages(row.url)

  await db
    .update(resource)
    .set({ ...images, imageCheckedAt: new Date() })
    .where(eq(resource.id, row.id))

  finished += 1
  if (images.imageUrl) withImage += 1
  if (images.faviconUrl) withMark += 1

  const mark = images.imageUrl ? 'image' : images.faviconUrl ? 'favicon' : 'initial'
  console.log(`[${finished}/${rows.length}] ${mark.padEnd(7)} ${row.name}`)
}

async function worker() {
  for (;;) {
    const row = queue.shift()
    if (!row) return
    try {
      await resolveRow(row)
    } catch (error) {
      finished += 1
      console.error(`[${finished}/${rows.length}] failed  ${row.name}:`, error)
    }
  }
}

try {
  await Promise.all(Array.from({ length: Math.min(concurrency, rows.length) }, worker))
  console.log(`Done. ${withImage} with an Open Graph image, ${withMark} with a favicon.`)
} finally {
  await sql.end()
}
