/**
 * Content Security Policy for the app shell. Nuxt inlines a few small scripts (runtime config, color mode),
 * so instead of 'unsafe-inline' we allow exactly those scripts by their SHA-256 hash.
 */
const encoder = new TextEncoder()

async function sha256(content: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(content))
  let binary = ''
  for (const byte of new Uint8Array(digest)) binary += String.fromCharCode(byte)
  return `'sha256-${btoa(binary)}'`
}

// Inline <script> blocks that the browser would execute (skips src= and JSON data blocks).
const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)(?![^>]*type="application\/(?:json|ld\+json)")[^>]*>([\s\S]*?)<\/script>/g

export default defineNitroPlugin((nitroApp) => {
  if (import.meta.dev) return

  nitroApp.hooks.hook('render:html', async (html, { event }) => {
    const chunks = [...html.head, ...html.bodyPrepend, ...html.body, ...html.bodyAppend].join('\n')
    const hashes = await Promise.all([...chunks.matchAll(INLINE_SCRIPT)].map(([, content]) => sha256(content!)))

    const policy = [
      `default-src 'self'`,
      `script-src 'self' ${[...new Set(hashes)].join(' ')} https://challenges.cloudflare.com`,
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data:`,
      `font-src 'self'`,
      `connect-src 'self'`,
      `frame-src https://challenges.cloudflare.com`,
      `frame-ancestors 'none'`,
      `base-uri 'none'`,
      `form-action 'self'`,
      `object-src 'none'`,
      // Only over HTTPS: on an http:// preview it would rewrite asset URLs to https and blank the page.
      ...(getRequestURL(event).protocol === 'https:' ? [`upgrade-insecure-requests`] : [])
    ].join('; ')

    setResponseHeader(event, 'Content-Security-Policy', policy)
  })
})
