<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const props = defineProps<{ data: CalculationResult }>()

const { copy, copied } = useClipboard()
</script>

<template>
  <ToolsToolCard
    icon="i-lucide-calculator"
    title="Calculation"
    accent="magenta"
  >
    <template #actions>
      <UButton
        :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        color="neutral"
        variant="link"
        size="xs"
        :aria-label="copied ? 'Copied' : 'Copy result'"
        @click="copy(String(props.data.result))"
      />
    </template>

    <p class="break-all font-mono text-sm text-muted">
      {{ data.expression }}
    </p>
    <p class="mt-1 break-all text-4xl font-semibold leading-tight tracking-tighter text-highlighted tabular-nums">
      <span class="text-(--accent-magenta)">=</span> {{ data.formatted }}
    </p>
  </ToolsToolCard>
</template>
