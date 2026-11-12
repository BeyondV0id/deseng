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
  'http://127.0.0.1:3001',
].filter((origin): origin is string => Boolean(origin))

/**
 * Hops that may appear in `x-forwarded-for` ahead of the client. Vite forwards
 * one hop in development and needs none of this; a deploy behind a chain of
 * proxies names them here (`TRUSTED_PROXIES=10.0.0.0/8,172.16.0.0/12`), which
 * is what lets Better Auth strip the chain from the right and stop at the
 * first address it did not see a proxy write. Left empty, only a single-hop
 * header is trusted, which is the safe default: a caller cannot pick its own
 * rate-limit bucket by sending a header of its own.
 */
const trustedProxies = (process.env.TRUSTED_PROXIES ?? '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean)

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
  appName: 'Reference',
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
    // An account is usable the moment it is created. There is no verification
    // mail and no gate on sign-in; password reset is the only message we send.
    requireEmailVerification: false,
    sendResetPassword: async ({ user: account, url }) => {
      await sendPasswordResetEmail({ to: account.email, name: account.name, url })
    },
    // A reset is a credential change: the old password (and therefore every
    // session minted with it) goes away with it, so a stolen reset link cannot
    // leave a live session behind on another device.
    revokeSessionsOnPasswordReset: true,
  },
  emailVerification: {
    // Off on purpose: no message is sent at sign-up or on demand, so no
    // verification link can land in an inbox and no flow can depend on one.
    sendOnSignUp: false,
    autoSignInAfterVerification: false,
  },
  socialProviders,
  user: {
    // The account settings surface offers deletion with an in-place confirmation.
    // Better Auth enforces session freshness on the server.
    deleteUser: {
      enabled: true,
    },
  },
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
    // Vite's dev proxy forwards it; so must whatever sits in front of the
    // deploy. Direct internet traffic must never reach this process, or a
    // caller could choose its own bucket.
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
      ...(trustedProxies.length > 0 ? { trustedProxies } : {}),
    },
  },
})

export type Session = typeof auth.$Infer.Session
