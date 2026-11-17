import { readFile } from 'node:fs/promises'
import postgres from 'postgres'

// URL repairs update existing rows so their ids, ranks and account saves survive.
const { updates } = JSON.parse(await readFile(new URL('../server/src/db/catalog-corrections.json', import.meta.url), 'utf8'))
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.')
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 })
const apply = process.argv.includes('--apply')
try {
  const result = await sql.begin(async transaction => {
    const results = []
    for (const correction of updates) {
      const rows = await transaction`select id, url from resource where url in (${correction.previousUrl}, ${correction.url})`
      const previous = rows.find(row => row.url === correction.previousUrl)
      const current = rows.find(row => row.url === correction.url)
      if (previous && current && previous.id !== current.id) throw new Error(`Duplicate destination for ${correction.name}; review both rows before merging.`)
      const row = previous ?? current
      if (!row) {
        results.push({ name: correction.name, status: 'Not present; no row inserted' })
        continue
      }
      if (apply) await transaction`update resource set url = ${correction.url}, name = ${correction.name}, description = ${correction.description} where id = ${row.id}`
      results.push({ name: correction.name, status: apply ? 'Corrected' : 'Ready', id: row.id, url: correction.url })
    }
    return results
  })
  console.log(JSON.stringify({ applied: apply, results: result }, null, 2))
} finally { await sql.end() }
