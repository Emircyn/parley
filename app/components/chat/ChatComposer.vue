<script setup lang="ts">
import type { ChatStatus } from 'ai'

defineProps<{ status?: ChatStatus, autofocus?: boolean }>()
const emit = defineEmits<{ submit: [text: string], stop: [], reload: [] }>()

const input = defineModel<string>({ default: '' })

function onSubmit() {
  const text = input.value.trim()
  if (!text) return
  emit('submit', text)
  input.value = ''
}
</script>

<template>
  <div>
    <UChatPrompt
      :id="PROMPT_ID"
      v-model="input"
      placeholder="Ask anything, or try the weather in your city…"
      variant="subtle"
      :autofocus="autofocus"
      :maxrows="8"
      class="[view-transition-name:chat-prompt]"
      @submit="onSubmit"
    >
      <UChatPromptSubmit
        :status="status ?? 'ready'"
        color="primary"
        @stop="emit('stop')"
        @reload="emit('reload')"
      />

      <template #footer>
        <slot name="footer" />
      </template>
    </UChatPrompt>
    <p class="mt-2 text-center text-xs text-dimmed">
      Parley can make mistakes. Your chats stay in this browser.
    </p>
  </div>
</template>
