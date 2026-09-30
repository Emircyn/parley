<script setup lang="ts">
const { create } = useConversations()

const input = ref('')

const suggestions = [
  { icon: 'i-lucide-cloud-sun', label: 'Weather in Istanbul this week?' },
  { icon: 'i-lucide-calculator', label: 'What is 18% of 2,450, plus 320?' },
  { icon: 'i-lucide-clock', label: 'What time is it in Tokyo right now?' },
  { icon: 'i-lucide-code-xml', label: 'Write a Vue composable that debounces a ref' }
]

// Kept short so each one fits on a single line on phones; Tab fills in the one being typed.
const examples = [
  'Weather in Istanbul this week?',
  'What\'s 18% of 2,450 plus 320?',
  'What time is it in Tokyo?',
  'Write a Vue debounce composable'
]

function start(text: string) {
  const conversation = create(text)
  navigateTo(`/chat/${conversation.id}`)
}
</script>

<template>
  <UDashboardPanel
    id="home"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <template #header>
      <UDashboardNavbar :ui="{ root: 'border-b-0' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <ModelBadge />
          <SourceButton />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UContainer class="flex min-h-full max-w-3xl flex-col justify-center gap-8 py-10">
        <div class="flex flex-col items-center text-center">
          <ParleyLogo class="size-14" />
          <h1 class="mt-6 font-display text-4xl font-black leading-tight text-highlighted sm:text-5xl">
            What shall we <span class="text-dimmed">talk through</span>?
          </h1>
          <p class="mt-3 max-w-md text-muted">
            Streaming answers, code you can copy, and live tools for weather, maths and time.
          </p>
        </div>

        <ChatComposer
          v-model="input"
          autofocus
          :examples="examples"
          @submit="start"
        />

        <div class="flex flex-wrap justify-center gap-2">
          <UButton
            v-for="suggestion in suggestions"
            :key="suggestion.label"
            :icon="suggestion.icon"
            :label="suggestion.label"
            color="neutral"
            variant="outline"
            size="sm"
            class="rounded-full"
            @click="start(suggestion.label)"
          />
        </div>
      </UContainer>
    </template>

    <template #footer>
      <AppCredit class="pb-3 pt-1" />
    </template>
  </UDashboardPanel>
</template>
