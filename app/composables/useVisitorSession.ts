interface TurnstileApi {
  render: (element: HTMLElement, options: Record<string, unknown>) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window { turnstile?: TurnstileApi }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
export const TURNSTILE_CONTAINER_ID = 'parley-turnstile'

let scriptPromise: Promise<TurnstileApi> | undefined
let sessionPromise: Promise<void> | undefined

function loadTurnstile() {
  scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile)
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile'))
    script.onerror = () => {
      scriptPromise = undefined
      reject(new Error('verification_failed'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

/** Runs the Turnstile widget once (invisible unless Cloudflare needs an interaction) and returns a fresh token. */
async function getToken(siteKey: string, action: string) {
  const turnstile = await loadTurnstile()
  const container = document.getElementById(TURNSTILE_CONTAINER_ID)
  if (!container) throw new Error('verification_failed')

  return new Promise<string>((resolve, reject) => {
    const widgetId = turnstile.render(container, {
      'sitekey': siteKey,
      action,
      'appearance': 'interaction-only',
      'callback': (token: string) => {
        turnstile.remove(widgetId)
        resolve(token)
      },
      'error-callback': () => {
        turnstile.remove(widgetId)
        reject(new Error('verification_failed'))
      },
      'timeout-callback': () => {
        turnstile.remove(widgetId)
        reject(new Error('verification_failed'))
      }
    })
  })
}

async function verify(force: boolean) {
  const session = await $fetch<{ verified: boolean, siteKey: string, action: string }>('/api/session')
  if (session.verified && !force) return

  const token = await getToken(session.siteKey, session.action)
  await $fetch('/api/session', { method: 'POST', body: { token } }).catch(() => {
    throw new Error('verification_failed')
  })
}

/**
 * Proves the visitor is a person before the chat API will answer: Turnstile token -> signed HttpOnly session cookie.
 * Concurrent callers share one verification.
 */
export function ensureVisitorSession(force = false) {
  sessionPromise ??= verify(force).finally(() => {
    sessionPromise = undefined
  })
  return sessionPromise
}

/** fetch for the chat transport: makes sure a session exists and re-verifies once if it expired. */
export const sessionFetch: typeof fetch = async (input, init) => {
  await ensureVisitorSession()
  const response = await fetch(input, init)
  if (response.status !== 401) return response

  await ensureVisitorSession(true)
  return fetch(input, init)
}
