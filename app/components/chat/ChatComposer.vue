<script setup lang="ts">
import type { ChatStatus } from 'ai'

const props = defineProps<{
  status?: ChatStatus
  autofocus?: boolean
  /** Example prompts typed out one after another (start screen). */
  examples?: string[]
  /** A single suggested next message (inside a conversation); shown as-is, no animation. */
  suggestion?: string
}>()
const emit = defineEmits<{ submit: [text: string], stop: [], reload: [] }>()

const input = defineModel<string>({ default: '' })

const typer = useTypewriter(props.examples ?? [])

// What Tab would fill in: the current example, or the suggested follow-up.
const completion = computed(() => props.suggestion ?? (props.examples?.length ? typer.current.value : undefined))
const placeholder = computed(() => props.suggestion ?? (props.examples?.length ? typer.text.value : 'Reply to Parley…'))
const canComplete = computed(() => !input.value && !!completion.value && (props.status ?? 'ready') === 'ready')

// Like Claude: with an empty box, Tab accepts the suggestion instead of moving focus.
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Tab' || event.shiftKey || !canComplete.value) return
  event.preventDefault()
  input.value = completion.value!
}

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
      @keydown="onKeydown"
      @submit="onSubmit"
    >
      <div class="flex items-center gap-1.5">
        <UKbd
          v-if="canComplete"
          value="Tab"
          size="sm"
          class="max-sm:hidden"
          title="Press Tab to use the suggestion"
        />
        <UChatPromptSubmit
          :status="status ?? 'ready'"
          color="primary"
          @stop="emit('stop')"
          @reload="emit('reload')"
        />
      </div>

      <template #footer>
        <slot name="footer" />
      </template>
    </UChatPrompt>
    <p class="mt-2 text-center text-xs text-dimmed">
      Parley can make mistakes. Your chats stay in this browser.
    </p>
  </div>
</template>
