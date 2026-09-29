<script setup lang="ts">
import type { DynamicToolUIPart, ToolUIPart } from 'ai'
import { getToolName } from 'ai'
import { isToolStreaming } from '@nuxt/ui/utils/ai'

const props = defineProps<{ part: ToolUIPart | DynamicToolUIPart }>()

const name = computed(() => getToolName(props.part))
const input = computed(() => (props.part.input ?? {}) as Record<string, string | undefined>)
const output = computed(() => props.part.state === 'output-available' ? props.part.output as Record<string, unknown> : undefined)
const failed = computed(() => props.part.state === 'output-error' || (output.value && 'error' in output.value))

const meta = computed(() => {
  switch (name.value) {
    case 'getWeather':
      return { icon: 'i-lucide-cloud-sun', pending: `Checking the weather${input.value.city ? ` in ${input.value.city}` : ''}`, failed: 'Weather lookup failed' }
    case 'calculate':
      return { icon: 'i-lucide-calculator', pending: `Calculating${input.value.expression ? ` ${input.value.expression}` : ''}`, failed: 'Calculation failed' }
    case 'getTime':
      return { icon: 'i-lucide-clock', pending: `Looking up the time${input.value.label ? ` in ${input.value.label}` : ''}`, failed: 'Time lookup failed' }
    default:
      return { icon: 'i-lucide-wrench', pending: `Running ${name.value}`, failed: `${name.value} failed` }
  }
})

const errorText = computed(() => {
  if (props.part.state === 'output-error') return props.part.errorText
  return (output.value?.error as string | undefined) ?? undefined
})
</script>

<template>
  <UChatTool
    v-if="isToolStreaming(part)"
    :text="`${meta.pending}…`"
    :icon="meta.icon"
    streaming
  />

  <UChatTool
    v-else-if="failed"
    :text="meta.failed"
    :suffix="errorText"
    icon="i-lucide-circle-alert"
    :ui="{ leadingIcon: 'text-error' }"
  />

  <template v-else-if="output">
    <ToolsWeatherCard
      v-if="name === 'getWeather'"
      :data="output as unknown as WeatherResult"
    />
    <ToolsCalculatorCard
      v-else-if="name === 'calculate'"
      :data="output as unknown as CalculationResult"
    />
    <ToolsTimeCard
      v-else-if="name === 'getTime'"
      :data="output as unknown as TimeResult"
    />
  </template>
</template>
