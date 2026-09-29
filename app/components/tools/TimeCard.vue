<script setup lang="ts">
defineProps<{ data: TimeResult }>()
</script>

<template>
  <ToolsToolCard
    icon="i-lucide-clock"
    title="Local time"
    accent="lime"
    :subtitle="data.timeZone"
  >
    <p class="font-mono text-5xl font-medium leading-none tracking-tight text-highlighted tabular-nums">
      {{ data.time }}
    </p>
    <p class="mt-2 text-sm text-muted">
      {{ data.label }} · {{ data.date }} · {{ data.offset }}
    </p>
  </ToolsToolCard>
</template>
