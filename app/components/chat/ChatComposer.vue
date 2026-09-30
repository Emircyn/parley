<script setup lang="ts">
import type { ChatStatus } from 'ai'

defineProps<{ status?: ChatStatus, autofocus?: boolean }>()
const emit = defineEmits<{ submit: [text: string], stop: [], reload: [] }>()

const input = defineModel<string>({ default: '' })

// Kept short so each one fits on a single line on phones.
const placeholder = useTypewriter([
  'Ask anything…',
  'Weather in Istanbul this week?',
  'What\'s 18% of 2,450 plus 320?',
  'What time is it in Tokyo?',
  'Write a Vue debounce composable'
])

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
      :placeholder="placeholder"
      aria-label="Message Parley"
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
