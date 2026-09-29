/** Tells the browser whether it already has a valid session, and which Turnstile sitekey to use if not. */
export default defineEventHandler(async (event) => {
  const siteKey = event.context.cloudflare?.env?.TURNSTILE_SITE_KEY
  if (!siteKey) throw createError({ statusCode: 500, statusMessage: 'TURNSTILE_SITE_KEY is not configured' })

  return {
    verified: Boolean(await readSession(event)),
    siteKey,
    action: TURNSTILE_ACTION
  }
})
