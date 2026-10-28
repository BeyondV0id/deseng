import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/index.js'
import { account, session, user, verification } from './db/auth-schema.js'
import { sendPasswordResetEmail } from './lib/email.js'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * The SPA origin is what Better Auth checks an authenticated request against,
 * so both signs of the dev server are listed; Vite answers on 127.0.0.1 and
 * ::1 as well. Production adds whatever the deploy sets in CLIENT_ORIGIN.
 */
export const trustedOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:5180',
  'http://127.0.0.1:5180',
  process.env.BETTER_AUTH_URL,
].filter((origin): origin is string => Boolean(origin))

/** A provider is only enabled when both halves of its pair are configured. */
const socialProviders = {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
}

export const enabledSocialProviders = Object.keys(socialProviders) as Array<'google' | 'github'>

export const auth = betterAuth({
  appName: 'desgnix',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user: account, url }) => {
      await sendPasswordResetEmail({ to: account.email, name: account.name, url })
    },
  },
  socialProviders,
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  advanced: {
    useSecureCookies: isProduction,
    // Rate limiting is per address, and the address arrives in a proxy header.
    // Direct internet traffic must never reach this process, or a caller could
    // choose its own bucket; the production deploy sits behind one proxy.
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
    },
  },
})

export type Session = typeof auth.$Infer.Session
