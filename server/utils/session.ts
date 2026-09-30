import type { H3Event } from 'h3'

/**
 * Visitor session: after a Turnstile check the browser gets a short-lived, HMAC-signed, HttpOnly cookie.
 * /api/chat only answers requests that carry a valid one, so the API can't be used from scripts or other sites.
 */
const COOKIE_NAME = 'parley_session'

/**
 * Always `__Host-` + Secure, except for http:// previews of a local build (test keys enabled in .dev.vars),
 * where browsers would drop a Secure cookie.
 */
function cookieFor(event: H3Event) {
  const localPreview = event.context.cloudflare?.env?.TURNSTILE_ALLOW_TEST_KEYS === 'true'
    && getRequestURL(event).protocol === 'http:'
  const secure = !localPreview
  return { name: secure ? `__Host-${COOKIE_NAME}` : COOKIE_NAME, secure }
}
export const SESSION_TTL_SECONDS = 30 * 60

const encoder = new TextEncoder()

function base64url(bytes: ArrayBuffer | Uint8Array) {
  let binary = ''
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return base64url(await crypto.subtle.sign('HMAC', key, encoder.encode(data)))
}

/** Constant-time comparison so the signature check doesn't leak timing. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function sessionSecret(event: H3Event) {
  const secret = event.context.cloudflare?.env?.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw createError({ statusCode: 500, statusMessage: 'SESSION_SECRET is missing or shorter than 32 characters' })
  }
  return secret
}

export async function createSession(event: H3Event) {
  const id = crypto.randomUUID()
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const payload = `${id}.${expires}`
  const value = `${payload}.${await hmac(sessionSecret(event), payload)}`

  const cookie = cookieFor(event)
  setCookie(event, cookie.name, value, {
    httpOnly: true,
    secure: cookie.secure,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  })
  return { id, expires }
}

/** Returns the session id when the cookie is present, correctly signed and not expired. */
export async function readSession(event: H3Event): Promise<string | undefined> {
  const value = getCookie(event, cookieFor(event).name)
  if (!value || value.length > 256) return

  const [id, expires, signature] = value.split('.')
  if (!id || !expires || !signature) return
  if (Number(expires) < Date.now() / 1000) return

  const expected = await hmac(sessionSecret(event), `${id}.${expires}`)
  return safeEqual(signature, expected) ? id : undefined
}
