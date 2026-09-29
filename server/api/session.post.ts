import { z } from 'zod'

const bodySchema = z.object({ token: z.string().min(1).max(2048) })

/** Exchanges a fresh Turnstile token for a short-lived signed session cookie. */
export default defineEventHandler(async (event) => {
  if (!await checkRateLimit(event, 'SESSION_RATE_LIMITER', [`ip:${clientIp(event)}`])) {
    return chatError(event, 429, 'rate_limit')
  }

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success || !await verifyTurnstile(event, parsed.data.token)) {
    return chatError(event, 403, 'verification_failed')
  }

  const { expires } = await createSession(event)
  return { verified: true, expires }
})
