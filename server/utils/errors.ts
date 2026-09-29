import type { H3Event } from 'h3'

/** Maps whatever Workers AI throws to a code the client can turn into friendly copy. */
export function toChatErrorCode(error: unknown): ChatErrorCode {
  const message = error instanceof Error ? error.message : String(error)

  // 4006: the account used up its free daily neuron allocation.
  if (/4006|daily free allocation|neurons/i.test(message)) return 'quota'
  if (/429|rate limit|too many requests/i.test(message)) return 'rate_limit'
  return 'unknown'
}

export function chatError(event: H3Event, statusCode: number, code: ChatErrorCode) {
  setResponseStatus(event, statusCode)
  return { code }
}
