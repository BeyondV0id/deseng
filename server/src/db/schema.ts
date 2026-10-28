import { relations } from 'drizzle-orm'
import { boolean, index, integer, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth-schema.js'

export * from './auth-schema.js'

/**
 * The catalogue itself. One row per resource, shared by every account.
 *
 * `rank` is the catalogue's one fixed order, captured once from GitHub stars
 * and the Tranco top-1M rank. It is data, not a score: nothing recalculates it,
 * and a resource added later takes the next rank and falls to the end of a row.
 */
export const resource = pgTable('resource', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull().unique(),
  description: text('description').notNull().default(''),
  category: text('category').notNull(),
  rank: integer('rank').notNull().default(0),
  submittedById: text('submitted_by_id').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/** A moodboard belongs to one account. Its name is whatever the owner gave it. */
export const moodboard = pgTable(
  'moodboard',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    color: text('color').notNull(),
    description: text('description').notNull().default(''),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('moodboard_user_idx').on(table.userId)],
)

/**
 * An account's own state on a catalogue entry: saved, favourited, filed.
 * A row exists only once the account has done something to the entry, so the
 * catalogue stays shared and untouched by anyone's favourites.
 */
export const userResource = pgTable(
  'user_resource',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    resourceId: text('resource_id')
      .notNull()
      .references(() => resource.id, { onDelete: 'cascade' }),
    favorite: boolean('favorite').notNull().default(false),
    moodboardId: text('moodboard_id').references(() => moodboard.id, { onDelete: 'set null' }),
    savedAt: timestamp('saved_at').defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.resourceId] }),
    index('user_resource_moodboard_idx').on(table.moodboardId),
  ],
)

export const moodboardRelations = relations(moodboard, ({ one, many }) => ({
  user: one(user, { fields: [moodboard.userId], references: [user.id] }),
  entries: many(userResource),
}))

export const userResourceRelations = relations(userResource, ({ one }) => ({
  resource: one(resource, { fields: [userResource.resourceId], references: [resource.id] }),
  moodboard: one(moodboard, { fields: [userResource.moodboardId], references: [moodboard.id] }),
  user: one(user, { fields: [userResource.userId], references: [user.id] }),
}))
