const DAY = 24 * 60 * 60 * 1000

/** Bucket label for the sidebar history, like ChatGPT's "Today / Yesterday / Previous 7 days". */
export function historyBucket(timestamp: number, now = Date.now()) {
  const startOfToday = new Date(now).setHours(0, 0, 0, 0)
  if (timestamp >= startOfToday) return 'Today'
  if (timestamp >= startOfToday - DAY) return 'Yesterday'
  if (timestamp >= startOfToday - 7 * DAY) return 'Previous 7 days'
  if (timestamp >= startOfToday - 30 * DAY) return 'Previous 30 days'
  return 'Older'
}
