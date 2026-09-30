/** Hard caps that keep one request cheap on the daily neuron budget and the Worker's memory. */
export const MAX_BODY_BYTES = 64 * 1024
export const MAX_MESSAGES = 16
export const MAX_TEXT_CHARS = 4_000
export const MAX_OUTPUT_TOKENS = 1_500

/** Mirrors CHAT_RATE_LIMITER in wrangler.jsonc, for the usage screen. */
export const MESSAGES_PER_MINUTE = 5
/** Workers AI free allocation, shared by every visitor; resets at 00:00 UTC. */
export const DAILY_NEURONS = 10_000
