import { Router } from 'express'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { moodboard, resource, userResource } from '../db/schema.js'
import { isHexColor, readOptionalString, readString } from '../lib/parse.js'
import { serializeMoodboard, serializeResource } from '../lib/serialize.js'
import { loadSession, requireSession, sessionUser } from '../middleware/session.js'

export const libraryRouter = Router()

libraryRouter.use(loadSession, requireSession)

/** Every moodboard this account owns, oldest first, so the column is stable. */
libraryRouter.get('/moodboards', async (_request, response) => {
  const user = sessionUser(response)
  const rows = await db
    .select()
    .from(moodboard)
    .where(eq(moodboard.userId, user.id))
    .orderBy(moodboard.createdAt, moodboard.name)

  response.json({ moodboards: rows.map(serializeMoodboard) })
})

libraryRouter.post('/moodboards', async (request, response) => {
  const user = sessionUser(response)
  const name = readString(request.body?.name, 60)
  const description = readOptionalString(request.body?.description, 280) ?? ''
  const color = isHexColor(request.body?.color) ? request.body.color : '#8B8B92'

  if (!name) {
    response.status(400).json({ error: 'Give the moodboard a name.' })
    return
  }

  const [row] = await db
    .insert(moodboard)
    .values({ id: crypto.randomUUID(), userId: user.id, name, color, description })
    .returning()

  response.status(201).json({ moodboard: serializeMoodboard(row!) })
})

libraryRouter.patch('/moodboards/:id', async (request, response) => {
  const user = sessionUser(response)
  const [existing] = await db
    .select()
    .from(moodboard)
    .where(and(eq(moodboard.id, request.params.id!), eq(moodboard.userId, user.id)))
    .limit(1)

  if (!existing) {
    response.status(404).json({ error: 'Moodboard not found.' })
    return
  }

  const name = request.body?.name === undefined ? existing.name : readString(request.body.name, 60)
  const description = request.body?.description === undefined
    ? existing.description
    : readOptionalString(request.body.description, 280) ?? ''
  const color = request.body?.color === undefined
    ? existing.color
    : isHexColor(request.body.color) ? request.body.color : existing.color

  if (!name) {
    response.status(400).json({ error: 'Give the moodboard a name.' })
    return
  }

  const [row] = await db
    .update(moodboard)
    .set({ name, description, color, updatedAt: new Date() })
    .where(eq(moodboard.id, existing.id))
    .returning()

  response.json({ moodboard: serializeMoodboard(row!) })
})

/**
 * Deleting a moodboard does not delete the resources it held. The foreign key
 * clears `moodboardId`, so they return to the library unfiled.
 */
libraryRouter.delete('/moodboards/:id', async (request, response) => {
  const user = sessionUser(response)
  const deleted = await db
    .delete(moodboard)
    .where(and(eq(moodboard.id, request.params.id!), eq(moodboard.userId, user.id)))
    .returning({ id: moodboard.id })

  if (deleted.length === 0) {
    response.status(404).json({ error: 'Moodboard not found.' })
    return
  }

  response.json({ id: deleted[0]!.id })
})

/**
 * The account's state on one catalogue entry: saved, favourited, filed.
 * Saving and favouriting are the same row, so one upsert covers both.
 */
libraryRouter.patch('/resources/:id/state', async (request, response) => {
  const user = sessionUser(response)
  const resourceId = request.params.id!

  const [entry] = await db.select().from(resource).where(eq(resource.id, resourceId)).limit(1)
  if (!entry) {
    response.status(404).json({ error: 'Resource not found.' })
    return
  }

  const favorite = typeof request.body?.favorite === 'boolean' ? request.body.favorite : undefined
  const moodboardId = request.body?.moodboardId === undefined
    ? undefined
    : request.body.moodboardId === null
      ? null
      : readString(request.body.moodboardId, 64)

  if (moodboardId) {
    const [owned] = await db
      .select({ id: moodboard.id })
      .from(moodboard)
      .where(and(eq(moodboard.id, moodboardId), eq(moodboard.userId, user.id)))
      .limit(1)
    if (!owned) {
      response.status(404).json({ error: 'Moodboard not found.' })
      return
    }
  }

  if (favorite === undefined && moodboardId === undefined) {
    response.status(400).json({ error: 'Nothing to update.' })
    return
  }

  const [state] = await db
    .insert(userResource)
    .values({
      userId: user.id,
      resourceId,
      favorite: favorite ?? false,
      moodboardId: moodboardId ?? null,
    })
    .onConflictDoUpdate({
      target: [userResource.userId, userResource.resourceId],
      set: {
        ...(favorite === undefined ? {} : { favorite }),
        ...(moodboardId === undefined ? {} : { moodboardId }),
        savedAt: new Date(),
      },
    })
    .returning()

  response.json({ resource: serializeResource(entry, state) })
})
