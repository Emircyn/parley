<script setup lang="ts">
defineProps<{ data: TimeResult }>()
</script>

<template>
  <ToolsToolCard
    icon="i-lucide-clock"
    title="Local time"
    :subtitle="data.timeZone"
  >
    <p class="font-serif text-5xl leading-none text-highlighted tabular-nums">
      {{ data.time }}
    </p>
    <p class="mt-2 text-sm text-muted">
      {{ data.label }} · {{ data.date }} · {{ data.offset }}
    </p>
  </ToolsToolCard>
</template>
