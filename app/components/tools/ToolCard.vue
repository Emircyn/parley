<script setup lang="ts">
export type ToolAccent = 'cyan' | 'magenta' | 'lime' | 'violet'

defineProps<{ icon: string, title: string, subtitle?: string, accent: ToolAccent }>()
</script>

<template>
  <UCard
    variant="subtle"
    class="tool-card my-3 w-full max-w-md rounded-xl"
    :style="{ '--tool-accent': `var(--accent-${accent})` }"
    :ui="{ header: 'flex items-center gap-2 px-4 py-2.5 sm:px-4 text-xs text-muted', body: 'p-4 sm:p-4' }"
  >
    <template #header>
      <UIcon
        :name="icon"
        class="size-4 text-(--tool-accent)"
      />
      <span class="font-medium text-toned">{{ title }}</span>
      <span
        v-if="subtitle"
        class="truncate"
      >· {{ subtitle }}</span>
      <div class="ms-auto flex items-center">
        <slot name="actions" />
      </div>
    </template>

    <slot />
  </UCard>
</template>

<style scoped>
/* On true black the card picks up a soft glow in its tool's colour. */
:global(.dark) .tool-card {
  box-shadow:
    0 0 0 1px color-mix(in oklab, var(--tool-accent) 22%, transparent),
    0 12px 48px -16px color-mix(in oklab, var(--tool-accent) 40%, transparent);
}
</style>
