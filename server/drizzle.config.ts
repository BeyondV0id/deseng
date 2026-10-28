import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

/**
 * Migrations run over the session connection, not the transaction pooler.
 * Supabase's transaction mode (port 6543) cannot run multi-statement DDL in a
 * session, so drizzle-kit talks to DIRECT_URL while the app talks to
 * DATABASE_URL with `prepare: false`.
 */
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
})
