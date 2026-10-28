import { Router } from 'express'
import { asc, eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { resource, userResource } from '../db/schema.js'
import { serializeResource } from '../lib/serialize.js'
import { readOptionalString, readString, readUrl } from '../lib/parse.js'
import { loadSession, requireSession, sessionUser } from '../middleware/session.js'

export const catalogRouter = Router()

/**
 * The catalogue, in its fixed order, with this account's favourites and
 * filings folded in. Reading it does not require a session: the app asks for
 * one before it renders, but the catalogue itself is shared and public.
 */
catalogRouter.get('/catalog', loadSession, async (_request, response) => {
  const userId = response.locals.session?.user.id

  const [rows, states] = await Promise.all([
    db.select().from(resource).orderBy(asc(resource.rank), asc(resource.name)),
    userId
      ? db.select().from(userResource).where(eq(userResource.userId, userId))
      : Promise.resolve([]),
  ])

  const stateByResource = new Map(states.map((state) => [state.resourceId, state]))

  response.json({
    resources: rows.map((row) => serializeResource(row, stateByResource.get(row.id))),
  })
})

const maxName = 120
const maxDescription = 280
const maxCategory = 60

/**
 * A submitted resource joins the shared catalogue under the account that added
 * it, at the end of the order, and is filed to nothing until its author saves
 * it like any other entry.
 */
catalogRouter.post('/catalog', loadSession, requireSession, async (request, response) => {
  const user = sessionUser(response)
  const name = readString(request.body?.name, maxName)
  const url = readUrl(request.body?.url)
  const category = readString(request.body?.category, maxCategory)
  const description = readOptionalString(request.body?.description, maxDescription) ?? ''

  if (!name) {
    response.status(400).json({ error: 'Give the resource a name.' })
    return
  }
  if (!url) {
    response.status(400).json({ error: 'Enter a valid web address.' })
    return
  }
  if (!category) {
    response.status(400).json({ error: 'Choose a category.' })
    return
  }

  const existing = await db.select().from(resource).where(eq(resource.url, url)).limit(1)
  if (existing.length > 0) {
    response.status(409).json({ error: 'That address is already in the catalogue.' })
    return
  }

  const [{ nextRank }] = await db
    .select({ nextRank: sql<number>`coalesce(max(${resource.rank}), 0) + 1` })
    .from(resource)

  const [row] = await db
    .insert(resource)
    .values({
      id: crypto.randomUUID(),
      name,
      url,
      description,
      category,
      rank: nextRank,
      submittedById: user.id,
    })
    .returning()

  response.status(201).json({ resource: serializeResource(row!) })
})
