import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/** The port the dev server and its HMR socket share. */
const DEFAULT_DEV_PORT = 5180

/** Where the Express server answers. Override with API_URL for another host. */
const API_TARGET = process.env.API_URL ?? 'http://localhost:3001'

/** A --port on the command line wins, so the page and the socket always agree. */
function portFromArgs(argv: string[]): number {
  const equals = argv.find(argument => argument.startsWith('--port='))
  if (equals) return Number(equals.split('=')[1])
  const index = argv.indexOf('--port')
  if (index !== -1 && argv[index + 1]) return Number(argv[index + 1])
  return DEFAULT_DEV_PORT
}

export default defineConfig(() => {
  const port = portFromArgs(process.argv)

  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    server: {
      // Listen on every interface, so the dev server answers on 127.0.0.1 and
      // ::1 alike instead of one stack only.
      host: true,
      port,
      // The API, and Better Auth under it, is a second process. Proxying keeps
      // every request same-origin, so the session cookie is first-party and no
      // CORS rule is needed in development.
      proxy: {
        '/api': { target: API_TARGET, changeOrigin: true },
      },
      // Never move to another port silently. Vite injects the configured port
      // into the HMR client, so a server that quietly moves leaves the client
      // talking to the wrong address, and it falls back to a second websocket
      // connection to say so.
      strictPort: true,
      hmr: {
        // Point the client straight at the dev server, whatever origin the
        // page was opened from. With a port set, the client never guesses and
        // never needs the fallback connection.
        host: 'localhost',
        clientPort: port,
      },
    },
    preview: {
      proxy: {
        '/api': { target: API_TARGET, changeOrigin: true },
      },
    },
  }
})
