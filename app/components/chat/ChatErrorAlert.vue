<script setup lang="ts">
const props = defineProps<{ error: Error }>()
const emit = defineEmits<{ retry: [], dismiss: [] }>()

const code = computed<ChatErrorCode>(() => parseChatError(props.error))

const copy = computed(() => {
  switch (code.value) {
    case 'quota':
      return {
        icon: 'i-lucide-moon-star',
        color: 'warning' as const,
        title: 'Today\'s free quota is used up',
        description: 'Parley runs on Cloudflare\'s free tier, shared by everyone who visits. It resets at 00:00 UTC, so come back tomorrow.',
        retry: false
      }
    case 'rate_limit':
      return {
        icon: 'i-lucide-timer',
        color: 'warning' as const,
        title: 'Easy there, that\'s 5 messages a minute',
        description: 'Give it a few seconds and try again.',
        retry: true
      }
    case 'verification_required':
    case 'verification_failed':
      return {
        icon: 'i-lucide-shield-alert',
        color: 'warning' as const,
        title: 'We couldn\'t confirm you\'re a person',
        description: 'Parley checks visitors with Cloudflare Turnstile to keep bots off the free quota. Try again, or disable blockers for this site.',
        retry: true
      }
    case 'bad_request':
      return {
        icon: 'i-lucide-message-square-warning',
        color: 'error' as const,
        title: 'This chat got too long',
        description: 'Start a new chat to keep going.',
        retry: false
      }
    default:
      return {
        icon: 'i-lucide-cloud-alert',
        color: 'error' as const,
        title: 'The reply didn\'t come through',
        description: 'Check your connection and try again.',
        retry: true
      }
  }
})
</script>

<template>
  <UAlert
    :icon="copy.icon"
    color="neutral"
    variant="outline"
    :title="copy.title"
    :description="copy.description"
    :ui="{ icon: copy.color === 'warning' ? 'text-warning' : 'text-error', root: 'bg-elevated/40' }"
    :actions="copy.retry ? [{ label: 'Try again', icon: 'i-lucide-rotate-ccw', color: 'neutral', variant: 'outline', size: 'xs', onClick: () => emit('retry') }] : []"
    close
    @update:open="emit('dismiss')"
  />
</template>
