declare module 'h3' {
  interface H3EventContext {
    cloudflare?: {
      env: {
        AI: Ai
        CHAT_RATE_LIMITER?: RateLimit
        SESSION_RATE_LIMITER?: RateLimit
        /** Turnstile widget secret (wrangler secret). */
        TURNSTILE_SECRET?: string
        /** Public Turnstile sitekey, handed to the browser by GET /api/session. */
        TURNSTILE_SITE_KEY?: string
        /** Comma separated hostnames siteverify must report, e.g. "parley.example.workers.dev". */
        TURNSTILE_HOSTNAMES?: string
        /** At least 32 random characters used to sign session cookies (wrangler secret). */
        SESSION_SECRET?: string
        /** "true" only in local development, to accept Turnstile's public test keys. */
        TURNSTILE_ALLOW_TEST_KEYS?: string
      }
      context: ExecutionContext
    }
  }
}

export {}
