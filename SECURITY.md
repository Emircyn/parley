# Security

## Reporting a vulnerability

Please report security issues privately through [GitHub security advisories](https://github.com/Emircyn/parley/security/advisories/new), not in public issues. I'll reply within a few days.

## How Parley protects its API

Parley is a public demo on a free AI quota, so the chat API only answers real visitors of the site.

| Layer | What it does | Where |
|---|---|---|
| Same-origin guard | `POST /api/*` must come from the site's own origin with a JSON body under 64 KB; other methods get 405 | `server/middleware/api-guard.ts` |
| Turnstile | The browser proves it's a person with Cloudflare Turnstile; the token is checked server-side with Siteverify (success, action and hostname) and fails closed | `server/utils/turnstile.ts` |
| Signed session | A valid token is exchanged for a 30-minute, HMAC-signed, `HttpOnly`, `Secure`, `SameSite=Strict` `__Host-` cookie; `/api/chat` rejects requests without one | `server/utils/session.ts` |
| Rate limits | 5 messages a minute per IP and per session, 10 verifications a minute per IP (Workers Rate Limiting) | `wrangler.jsonc`, `server/utils/rate-limit.ts` |
| Input validation | Only user text and earlier assistant turns are accepted (no system messages), 4,000 characters per message, the last 16 messages reach the model, output capped at 1,500 tokens | `server/api/chat.post.ts` |
| Safe rendering | Model output is Markdown only: raw HTML, images, event handlers and `javascript:` links are stripped before rendering | `app/components/chat/ChatMessageParts.vue` |
| Headers | Hash-based Content Security Policy (no `unsafe-inline` scripts), `frame-ancestors 'none'`, HSTS, `nosniff`, strict referrer and permissions policies | `server/plugins/csp.ts`, `nuxt.config.ts` |
| Cost ceiling | On the Workers free plan, Workers AI stops at 10,000 neurons a day instead of billing | Cloudflare account |

Secrets (`TURNSTILE_SECRET`, `SESSION_SECRET`) live only in Worker secrets and a gitignored `.dev.vars`; nothing secret is committed.
