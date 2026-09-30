/** What GET /api/usage returns: the visitor's messages this minute and the shared daily quota. */
export interface UsageSnapshot {
  minute: { used: number, limit: number, resetsInSeconds: number }
  day: { neurons: number, limit: number, messages: number, exhausted: boolean, resetsAt: string }
  /** Only on a 'message' op: whether the message may go ahead, and if not, why. */
  allowed?: boolean
  reason?: 'quota' | 'rate_limit'
}
