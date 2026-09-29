<script setup lang="ts">
defineProps<{ icon: string, title: string, subtitle?: string }>()
</script>

<template>
  <UCard
    variant="subtle"
    class="my-3 w-full max-w-md rounded-xl"
    :ui="{ header: 'flex items-center gap-2 px-4 py-2.5 sm:px-4 text-xs text-muted', body: 'p-4 sm:p-4' }"
  >
    <template #header>
      <UIcon
        :name="icon"
        class="size-4 text-primary"
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
