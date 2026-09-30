<script setup lang="ts">
import type { UIMessage } from 'ai'
import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/vue'
import { getTextFromMessage } from '@nuxt/ui/utils/ai'
import { useClipboard } from '@vueuse/core'

definePageMeta({ key: route => route.fullPath })

const route = useRoute()
const toast = useToast()
const { copy } = useClipboard()
const { find, loadMessages, saveMessages, takePending } = useConversations()

const id = route.params.id as string
const conversation = computed(() => find(id))

if (!conversation.value) {
  await navigateTo('/', { replace: true })
}

// Next-message guess from the server's small model, streamed after each reply (not stored).
const modelSuggestion = ref<string>()

const { messages, status, error, sendMessage, stop, regenerate, clearError } = useChat({
  id,
  messages: loadMessages(id),
  transport: new DefaultChatTransport({ api: '/api/chat', fetch: sessionFetch }),
  onData: (part) => {
    if (part.type === 'data-suggestion') modelSuggestion.value = (part.data as { text?: string }).text
  }
})

const input = ref('')

// Persist whenever a turn settles (finished, stopped or failed).
watch(status, (value) => {
  if (value === 'submitted') modelSuggestion.value = undefined
  if (value === 'ready' || value === 'error') saveMessages(id, messages.value)
})

function send(text: string) {
  clearError()
  sendMessage({ text })
  saveMessages(id, messages.value)
}

function retry() {
  clearError()
  regenerate()
}

async function copyMessage(message: UIMessage) {
  await copy(getTextFromMessage(message))
  toast.add({ title: 'Copied to clipboard', icon: 'i-lucide-clipboard-check', duration: 1500 })
}

const busy = computed(() => status.value === 'submitted' || status.value === 'streaming')

// Suggested next message for the Tab hint once the reply is done: the model's guess, else a rule-based one.
const followUp = computed(() => status.value === 'ready' ? modelSuggestion.value ?? suggestFollowUp(messages.value) : undefined)

const assistantActions = computed(() => [
  { label: 'Copy', icon: 'i-lucide-copy', onClick: (_: MouseEvent, message: UIMessage) => copyMessage(message) },
  {
    label: 'Regenerate',
    icon: 'i-lucide-rotate-ccw',
    disabled: busy.value,
    onClick: (_: MouseEvent, message: UIMessage) => {
      clearError()
      regenerate({ messageId: message.id })
    }
  }
])

defineShortcuts({
  escape: {
    usingInput: true,
    handler: () => {
      if (busy.value) stop()
    }
  },
  meta_shift_c: {
    usingInput: true,
    handler: () => {
      const last = messages.value.findLast(m => m.role === 'assistant')
      if (last) copyMessage(last)
    }
  }
})

onMounted(() => {
  const first = takePending(id)
  if (first && !messages.value.length) send(first)
})

useHead({ title: () => conversation.value ? `${conversation.value.title} · Parley` : 'Parley' })
// Chats live only in this browser; keep them out of search results.
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <UDashboardPanel
    id="chat"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <template #header>
      <UDashboardNavbar
        :title="conversation?.title"
        :ui="{ title: 'truncate text-base font-medium' }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <ModelBadge class="max-sm:hidden" />
          <SourceButton />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UContainer class="max-w-3xl flex-1 py-6">
        <UChatMessages
          :messages="messages"
          :status="status"
          :assistant="{ actions: assistantActions }"
          :user="{ variant: 'soft', side: 'right' }"
          should-auto-scroll
          :spacing-offset="160"
        >
          <template #content="{ message }">
            <ChatMessageParts :message="message" />
          </template>

          <template #indicator>
            <div class="flex items-center gap-2 py-1 text-sm">
              <ParleyLogo
                talking
                class="size-5"
              />
              <UChatShimmer
                text="Parley is thinking…"
                class="text-muted"
              />
            </div>
          </template>
        </UChatMessages>
      </UContainer>
    </template>

    <template #footer>
      <UContainer class="max-w-3xl pb-4 sm:pb-6">
        <ChatErrorAlert
          v-if="error"
          :error="error"
          class="mb-3"
          @retry="retry"
          @dismiss="clearError"
        />
        <ChatComposer
          v-model="input"
          :status="status"
          :suggestion="followUp"
          autofocus
          @submit="send"
          @stop="stop"
          @reload="retry"
        />
        <AppCredit class="mt-2" />
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
