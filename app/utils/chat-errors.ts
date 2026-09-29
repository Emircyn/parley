const CODES: ChatErrorCode[] = ['quota', 'rate_limit', 'bad_request', 'verification_required', 'verification_failed', 'unknown']

/** The API answers with `{ code }` JSON before streaming, or with a bare code inside the stream. */
export function parseChatError(error: Error): ChatErrorCode {
  const message = error.message.trim()
  if ((CODES as string[]).includes(message)) return message as ChatErrorCode
  try {
    const { code } = JSON.parse(message) as { code?: ChatErrorCode }
    if (code && CODES.includes(code)) return code
  } catch {
    // not JSON
  }
  return 'unknown'
}
