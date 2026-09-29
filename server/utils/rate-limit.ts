import type { H3Event } from 'h3'

type LimiterName = 'CHAT_RATE_LIMITER' | 'SESSION_RATE_LIMITER'

export function clientIp(event: H3Event) {
  return getRequestHeader(event, 'cf-connecting-ip') ?? getRequestIP(event, { xForwardedFor: true }) ?? 'anonymous'
}

/**
 * Workers Rate Limiting binding (see wrangler.jsonc). Every key must pass, so a visitor is limited
 * both per IP and per session. Returns true when the request may go ahead.
 */
export async function checkRateLimit(event: H3Event, limiter: LimiterName, keys: string[]): Promise<boolean> {
  const binding = event.context.cloudflare?.env?.[limiter]
  if (!binding) {
    // Fail closed in production if the binding is missing; allow plain `nuxt dev` without Workers bindings.
    return import.meta.dev
  }

  const results = await Promise.all(keys.map(key => binding.limit({ key })))
  return results.every(result => result.success)
}
