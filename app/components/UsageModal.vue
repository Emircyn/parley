<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'

// Rough cost of one reply (main model + next-message guess), for "replies left" before there's data today.
const TYPICAL_NEURONS_PER_REPLY = 25

const usage = ref<UsageSnapshot>()
const failed = ref(false)
const now = ref(Date.now())
let fetchedAt = Date.now()

async function load() {
  try {
    usage.value = await $fetch<UsageSnapshot>('/api/usage')
    fetchedAt = Date.now()
    failed.value = false
  } catch {
    failed.value = true
  }
}

load()
useIntervalFn(load, 10_000)
useIntervalFn(() => (now.value = Date.now()), 1_000)

const minute = computed(() => {
  const m = usage.value?.minute
  if (!m) return
  const elapsed = Math.floor((now.value - fetchedAt) / 1000)
  const resetsIn = Math.max(0, m.resetsInSeconds - elapsed)
  return { ...m, used: resetsIn === 0 ? 0 : m.used, resetsIn }
})

const day = computed(() => {
  const d = usage.value?.day
  if (!d) return
  const percent = d.exhausted ? 100 : Math.min(100, (d.neurons / d.limit) * 100)
  const perReply = d.messages > 0 ? Math.max(1, d.neurons / d.messages) : TYPICAL_NEURONS_PER_REPLY
  const repliesLeft = d.exhausted ? 0 : Math.max(0, Math.floor((d.limit - d.neurons) / perReply))
  return { ...d, percent, repliesLeft, resetsIn: new Date(d.resetsAt).getTime() - now.value }
})

function duration(ms: number) {
  const minutes = Math.max(0, Math.ceil(ms / 60_000))
  const h = Math.floor(minutes / 60)
  return h ? `${h}h ${minutes % 60}m` : `${minutes}m`
}

const number = new Intl.NumberFormat('en-US')
</script>

<template>
  <UModal
    title="Usage"
    description="Parley runs on Cloudflare's free tier, so there are a few limits."
    :ui="{ content: 'max-w-md' }"
  >
    <template #body>
      <p
        v-if="failed && !usage"
        class="text-sm text-muted"
      >
        Usage isn't available right now. Try again in a moment.
      </p>

      <div
        v-else-if="!usage"
        class="space-y-6"
      >
        <USkeleton class="h-14 w-full" />
        <USkeleton class="h-14 w-full" />
      </div>

      <div
        v-else
        class="space-y-7"
      >
        <section
          v-if="minute"
          class="space-y-2"
        >
          <div class="flex items-baseline justify-between gap-4">
            <h3 class="text-sm font-medium text-highlighted">
              Your messages
            </h3>
            <span class="font-mono text-sm text-toned tabular-nums">{{ minute.used }} / {{ minute.limit }} per minute</span>
          </div>
          <UProgress
            :model-value="minute.used"
            :max="minute.limit"
            size="sm"
            :get-value-label="(v, max) => `${v ?? 0} of ${max} messages this minute`"
          />
          <p class="text-xs text-muted">
            <template v-if="minute.used >= minute.limit">
              Limit reached. You can send again in {{ minute.resetsIn }}s.
            </template>
            <template v-else-if="minute.resetsIn > 0">
              {{ minute.limit - minute.used }} left, back to {{ minute.limit }} in {{ minute.resetsIn }}s.
            </template>
            <template v-else>
              All {{ minute.limit }} available.
            </template>
          </p>
        </section>

        <section
          v-if="day"
          class="space-y-2"
        >
          <div class="flex items-baseline justify-between gap-4">
            <h3 class="text-sm font-medium text-highlighted">
              Shared daily quota
            </h3>
            <span class="font-mono text-sm text-toned tabular-nums">{{ day.percent < 10 ? day.percent.toFixed(1) : Math.round(day.percent) }}% used</span>
          </div>
          <UProgress
            :model-value="day.percent"
            :max="100"
            size="sm"
            :get-value-label="(v) => `${Math.round(v ?? 0)}% of today's shared quota used`"
          />
          <p class="text-xs text-muted">
            <template v-if="day.exhausted">
              Used up for today.
            </template>
            <template v-else>
              About {{ number.format(day.repliesLeft) }} replies left for everyone.
            </template>
            Resets in {{ duration(day.resetsIn) }} (00:00 UTC).
          </p>
          <p class="text-xs text-dimmed">
            {{ number.format(day.messages) }} messages today · {{ number.format(Math.round(day.neurons)) }} of {{ number.format(day.limit) }} neurons
          </p>
        </section>
      </div>
    </template>
  </UModal>
</template>
