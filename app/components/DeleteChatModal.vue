<script setup lang="ts">
defineProps<{ title: string }>()
const emit = defineEmits<{ close: [confirmed: boolean] }>()
</script>

<template>
  <UModal
    title="Delete this chat?"
    :description="`“${title}” will be removed from this browser. This can't be undone.`"
    :ui="{ content: 'max-w-md', footer: 'justify-end' }"
    :close="false"
  >
    <template #footer>
      <UButton
        label="Cancel"
        color="neutral"
        variant="outline"
        @click="emit('close', false)"
      />
      <UButton
        label="Delete"
        color="error"
        icon="i-lucide-trash-2"
        @click="emit('close', true)"
      />
    </template>
  </UModal>
</template>
