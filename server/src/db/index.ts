import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Copy server/.env.example to server/.env and fill in the connection string.',
  )
}

/**
 * Supabase's transaction pooler does not support prepared statements, so
 * `prepare` is off. One pool is shared by every query and by Better Auth.
 */
export const sql = postgres(connectionString, {
  prepare: false,
  max: 10,
  idle_timeout: 20,
})

export const db = drizzle(sql, { schema })
