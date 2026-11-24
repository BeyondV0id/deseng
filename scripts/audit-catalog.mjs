import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// A failed request is a review candidate, never an automatic deletion.
const root = fileURLToPath(new URL('../', import.meta.url))
const seed = JSON.parse(await readFile(path.join(root, 'server/src/db/catalog.json'), 'utf8')).resources
const pending = [...seed].reverse()
const results = []
const output = path.join(root, '.audit/catalog-links.json')

async function inspect(entry) {
  try {
    const response = await fetch(entry.url, {
      signal: AbortSignal.timeout(12000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; reference-link-audit/1.0)', Accept: 'text/html,application/xhtml+xml' },
    })
    const reader = response.body?.getReader()
    const chunks = []
    let bytes = 0
    if (reader) {
      try {
        while (bytes < 131072) {
          const { value, done } = await reader.read()
          if (done) break
          chunks.push(value)
          bytes += value.byteLength
        }
      } finally { await reader.cancel().catch(() => {}) }
    }
    const html = Buffer.concat(chunks).toString('utf8')
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim() ?? ''
    return {
      name: entry.name, url: entry.url, finalUrl: response.url, status: response.status,
      title,
      review: !response.ok || /domain.{0,30}(sale|parked)|buy this domain|deployment[_ ](not[_ ]found|disabled)|404.{0,20}(not found|page)/i.test(title),
    }
  } catch (error) {
    return { name: entry.name, url: entry.url, status: null, review: true, error: error.cause?.code ?? error.message }
  }
}

await Promise.all(Array.from({ length: 10 }, async () => {
  while (pending.length) {
    const entry = pending.pop()
    if (entry) results.push(await inspect(entry))
  }
}))
results.sort((a, b) => seed.findIndex(e => e.url === a.url) - seed.findIndex(e => e.url === b.url))
await mkdir(path.dirname(output), { recursive: true })
await writeFile(output, JSON.stringify({ checkedAt: new Date().toISOString(), resources: results }, null, 2) + '\n')
console.log(JSON.stringify({ checked: results.length, reachable: results.filter(r => r.status >= 200 && r.status < 400).length, review: results.filter(r => r.review).map(r => ({ name: r.name, url: r.url, status: r.status, title: r.title, error: r.error })), output }, null, 2))
