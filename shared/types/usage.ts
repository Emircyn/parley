/** What GET /api/usage returns: the visitor's messages this minute and the shared daily quota. */
export interface UsageSnapshot {
  minute: { used: number, limit: number, resetsInSeconds: number }
  day: { neurons: number, limit: number, messages: number, exhausted: boolean, resetsAt: string }
}
