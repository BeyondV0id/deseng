import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express, { type ErrorRequestHandler } from 'express'
import { toNodeHandler } from 'better-auth/node'
import { auth, enabledSocialProviders } from './auth.js'
import { catalogRouter } from './routes/catalog.js'
import { libraryRouter } from './routes/library.js'

const here = path.dirname(fileURLToPath(import.meta.url))
/** The built SPA, served from this process in production. */
const clientDist = path.resolve(here, '../../client/dist')

const app = express()
app.disable('x-powered-by')

/**
 * Better Auth reads the request body itself, so its handler is mounted before
 * `express.json()`. Express 5 needs a named wildcard here.
 */
app.all('/api/auth/*splat', toNodeHandler(auth))

app.use(express.json({ limit: '64kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

/** What the client needs to know before it draws a sign-in form. */
app.get('/api/config', (_request, response) => {
  response.json({ socialProviders: enabledSocialProviders })
})

app.use('/api', catalogRouter)
app.use('/api', libraryRouter)

/**
 * In production the same process serves the built client, so the app, the API
 * and the session cookie share one origin and no CORS rule is needed.
 */
if (existsSync(clientDist)) {
  app.use(express.static(clientDist, { index: false }))
  app.get('/*splat', (request, response, next) => {
    if (request.path.startsWith('/api/')) {
      next()
      return
    }
    response.sendFile(path.join(clientDist, 'index.html'))
  })
}

const onError: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: 'Something went wrong on the server.' })
}

app.use(onError)

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => {
  console.log(`desgnix api listening on http://localhost:${port}`)
})
