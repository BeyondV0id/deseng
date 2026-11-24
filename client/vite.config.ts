import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from 'vite'
import { readFileSync } from 'node:fs'
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

function siteOrigin(value: string | undefined): string | undefined {
  if (!value) return undefined
  const url = new URL(value)
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username || url.password || url.pathname !== '/' || url.search || url.hash
  ) {
    throw new Error('VITE_SITE_ORIGIN must be an HTTP or HTTPS origin.')
  }
  return url.origin
}

function publicMetadata(origin: string | undefined): Plugin {
  return {
    name: 'reference-public-metadata',
    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = [{
        tag: 'script',
        attrs: { type: 'application/ld+json' },
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Reference',
          url: origin && origin + '/',
          inLanguage: 'en',
        }),
      }]
      if (origin) {
        tags.push(
          { tag: 'link', attrs: { rel: 'canonical', href: origin + '/' } },
          { tag: 'meta', attrs: { property: 'og:url', content: origin + '/' } },
          { tag: 'meta', attrs: { property: 'og:image', content: origin + '/preview.png' } },
        )
      }
      return tags
    },
    generateBundle() {
      if (!origin) return

      const robots = readFileSync(path.join(import.meta.dirname, 'public/robots.txt'), 'utf8')
      const sitemap = readFileSync(path.join(import.meta.dirname, 'sitemap.xml'), 'utf8')
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robots.trimEnd() + '\n\nSitemap: ' + origin + '/sitemap.xml\n',
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemap.replaceAll('%SITE_ORIGIN%', origin),
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const origin = siteOrigin(loadEnv(mode, import.meta.dirname).VITE_SITE_ORIGIN)
  const port = portFromArgs(process.argv)

  return {
    plugins: [react(), tailwindcss(), publicMetadata(origin)],
    define: { 'import.meta.env.VITE_SITE_ORIGIN': JSON.stringify(origin ?? '') },
    root: import.meta.dirname,
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    server: {
      // Listen on every interface, so the dev server answers on 127.0.0.1 and
      // ::1 alike instead of one stack only.
      host: true,
      port,
      // The API, and Better Auth under it, is a second process. Proxying keeps
      // every request same-origin, so the session cookie is first-party and no
      // CORS rule is needed in development.
      //
      // `xfwd` writes `x-forwarded-for` with the address the proxy saw. Better
      // Auth buckets rate limits per client address and reads it from that
      // header only, so without it every caller shares one bucket and the
      // server logs that the address could not be resolved.
      proxy: {
        '/api': { target: API_TARGET, changeOrigin: true, xfwd: true },
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
        '/api': { target: API_TARGET, changeOrigin: true, xfwd: true },
      },
    },
  }
})
