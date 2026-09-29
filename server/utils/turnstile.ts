import type { H3Event } from 'h3'

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
export const TURNSTILE_ACTION = 'chat'

interface SiteverifyResult {
  'success': boolean
  'action'?: string
  'hostname'?: string
  'error-codes'?: string[]
  'metadata'?: { result_with_testing_key?: boolean }
}

/**
 * Canonical server-side Turnstile check: success, the expected action and an approved hostname.
 * Fails closed on any network or parsing error.
 */
export async function verifyTurnstile(event: H3Event, token: unknown): Promise<boolean> {
  const env = event.context.cloudflare?.env
  const secret = env?.TURNSTILE_SECRET
  const hostnames = new Set((env?.TURNSTILE_HOSTNAMES ?? '').split(',').map((h: string) => h.trim()).filter(Boolean))

  if (typeof token !== 'string' || token.length === 0 || token.length > 2048 || !secret || hostnames.size === 0) {
    return false
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: getRequestHeader(event, 'cf-connecting-ip') ?? ''
      })
    })
    if (!response.ok) throw new Error(`siteverify ${response.status}`)
    const result = await response.json() as SiteverifyResult

    // Turnstile's public test keys report hostname "example.com" and no action. Accept them only when a
    // deployment explicitly opts in (local .dev.vars); a real widget secret never returns this flag.
    if (result.metadata?.result_with_testing_key) {
      return result.success === true && env?.TURNSTILE_ALLOW_TEST_KEYS === 'true'
    }

    return result.success === true
      && result.action === TURNSTILE_ACTION
      && !!result.hostname && hostnames.has(result.hostname)
  } catch (error) {
    console.error('[turnstile]', error)
    return false
  }
}
