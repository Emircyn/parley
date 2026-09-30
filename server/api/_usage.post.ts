/** The slice of the Durable Object storage API this handler uses. */
interface MeterStorage {
  get<T>(key: string): Promise<T | undefined>
  put(key: string, value: unknown): Promise<void>
  put(entries: Record<string, unknown>): Promise<void>
  list<T>(options: { prefix: string, end?: string }): Promise<Map<string, T>>
  delete(keys: string[]): Promise<number>
}

/** Nitro's Durable Object instance, as far as this handler is concerned. */
interface UsageDurable { ctx: { storage: MeterStorage } }

const MINUTE_MS = 60_000
const KEEP_DAYS = 7

interface DayRecord { neurons: number, messages: number, exhausted: boolean }

const today = () => new Date().toISOString().slice(0, 10)
const nextUtcMidnight = () => {
  const d = new Date()
  d.setUTCHours(24, 0, 0, 0)
  return d.toISOString()
}

/**
 * The usage meter. Runs only inside Nitro's Durable Object (reached via durableFetch from server/utils/usage.ts);
 * a direct request from the internet lands in the plain Worker, where `durable` is missing, and gets a 404.
 */
export default defineEventHandler(async (event) => {
  const durable = (event.context.cloudflare as { durable?: UsageDurable } | undefined)?.durable
  if (!durable) throw createError({ statusCode: 404 })
  const storage = durable.ctx.storage

  const op = await readBody<UsageOp>(event)
  const dayKey = `day:${today()}`
  const day = await storage.get<DayRecord>(dayKey) ?? { neurons: 0, messages: 0, exhausted: false }
  const now = Date.now()

  const minuteKey = 'session' in op && op.session ? `min:${op.session}` : undefined
  let stamps = minuteKey ? (await storage.get<number[]>(minuteKey) ?? []).filter((t: number) => now - t < MINUTE_MS) : []

  switch (op.op) {
    case 'message':
      stamps = [...stamps, now]
      day.messages++
      await storage.put({ [minuteKey!]: stamps, [dayKey]: day })
      break
    case 'neurons':
      day.neurons += Math.max(0, op.amount)
      await storage.put(dayKey, day)
      break
    case 'exhausted':
      day.exhausted = true
      day.neurons = Math.max(day.neurons, DAILY_NEURONS)
      await storage.put(dayKey, day)
      break
  }

  // Occasional housekeeping: drop idle sessions and old days.
  if (Math.random() < 0.05) {
    const stale: string[] = []
    for (const [key, value] of await storage.list<number[] | DayRecord>({ prefix: 'min:' })) {
      if (!Array.isArray(value) || value.every(t => now - t >= MINUTE_MS)) stale.push(key)
    }
    const cutoff = new Date(now - KEEP_DAYS * 86_400_000).toISOString().slice(0, 10)
    for (const key of (await storage.list({ prefix: 'day:', end: `day:${cutoff}` })).keys()) stale.push(key)
    if (stale.length) await storage.delete(stale.slice(0, 128))
  }

  const oldest = stamps[0]
  return {
    minute: {
      used: stamps.length,
      limit: MESSAGES_PER_MINUTE,
      resetsInSeconds: oldest ? Math.max(0, Math.ceil((oldest + MINUTE_MS - now) / 1000)) : 0
    },
    day: {
      neurons: Math.round(day.neurons * 10) / 10,
      limit: DAILY_NEURONS,
      messages: day.messages,
      exhausted: day.exhausted,
      resetsAt: nextUtcMidnight()
    }
  } satisfies UsageSnapshot
})
