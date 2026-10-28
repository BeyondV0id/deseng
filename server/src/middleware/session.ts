import type { RequestHandler } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../auth.js'

/**
 * Resolves the session once per request and leaves it on `res.locals`. The
 * catalogue read is the only route that treats a missing session as normal;
 * everything else asks for `requireSession` after this.
 */
export const loadSession: RequestHandler = async (request, response, next) => {
  try {
    response.locals.session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    })
    next()
  } catch (error) {
    next(error)
  }
}

export const requireSession: RequestHandler = (_request, response, next) => {
  if (!response.locals.session) {
    response.status(401).json({ error: 'Sign in required.' })
    return
  }
  next()
}

/** The signed-in user, for handlers that run behind `requireSession`. */
export function sessionUser(response: { locals: Express.Locals }) {
  const session = response.locals.session
  if (!session) throw new Error('sessionUser called on an unauthenticated route')
  return session.user
}
