import { UsageModal } from '#components'

export type SendBlock
  = | { kind: 'rate_limit', resetsIn: number }
    | { kind: 'quota', resetsIn: number }

let ticker: ReturnType<typeof setInterval> | undefined
let reloadTimer: ReturnType<typeof setTimeout> | undefined

/**
 * Usage shared across the app: the snapshot from GET /api/usage, whether sending is blocked right now
 * (minute limit or daily quota), and the usage screen. The server enforces the same limits; this keeps
 * the message box honest so people aren't invited to send something that will bounce.
 */
export function useUsageState() {
  const usage = useState<UsageSnapshot | undefined>('parley:usage', () => undefined)
  const fetchedAt = useState('parley:usage-at', () => 0)
  const now = useState('parley:now', () => Date.now())
  async function refreshUsage() {
    try {
      usage.value = await $fetch<UsageSnapshot>('/api/usage')
      fetchedAt.value = Date.now()
      now.value = Date.now()
    } catch {
      // No usage data (e.g. plain `nuxt dev`): nothing is blocked client-side; the server still enforces.
    }
  }

  const minuteResetsIn = computed(() => {
    const m = usage.value?.minute
    if (!m) return 0
    return Math.max(0, m.resetsInSeconds - Math.floor((now.value - fetchedAt.value) / 1000))
  })

  const block = computed<SendBlock | undefined>(() => {
    const u = usage.value
    if (!u) return
    if (u.day.exhausted) {
      return { kind: 'quota', resetsIn: Math.max(0, new Date(u.day.resetsAt).getTime() - now.value) }
    }
    if (u.minute.used >= u.minute.limit && minuteResetsIn.value > 0) {
      return { kind: 'rate_limit', resetsIn: minuteResetsIn.value }
    }
  })

  /** Count a message locally the moment it's sent, before the server's numbers come back. */
  function noteSent() {
    const u = usage.value
    if (!u) return
    const age = Math.floor((now.value - fetchedAt.value) / 1000)
    usage.value = {
      ...u,
      minute: {
        ...u.minute,
        used: (minuteResetsIn.value > 0 ? u.minute.used : 0) + 1,
        resetsInSeconds: minuteResetsIn.value > 0 ? u.minute.resetsInSeconds : 60 + age
      }
    }
  }

  if (import.meta.client && !ticker) {
    ticker = setInterval(() => (now.value = Date.now()), 1000)
  }

  // When a block ends, re-check with the server so the box unlocks on real numbers.
  if (import.meta.client) {
    watch(() => block.value?.kind, (kind, previous) => {
      if (previous && !kind) {
        clearTimeout(reloadTimer)
        reloadTimer = setTimeout(refreshUsage, 500)
      }
    })
  }

  return { usage, fetchedAt, now, block, refreshUsage, noteSent }
}

/** useUsageState plus the usage screen. */
export function useUsage() {
  const modal = useOverlay().create(UsageModal)
  return { ...useUsageState(), openUsage: () => modal.open() }
}
