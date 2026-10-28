import type { Session } from '../auth.js'

/**
 * `res.locals.session` is written by `loadSession` and read by every handler
 * behind `requireSession`, so it is typed once here.
 */
declare global {
  namespace Express {
    interface Locals {
      session: Session | null
    }
  }
}

export {}
