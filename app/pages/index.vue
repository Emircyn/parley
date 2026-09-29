<script setup lang="ts">
const { create } = useConversations()

const input = ref('')

const suggestions = [
  { icon: 'i-lucide-cloud-sun', label: 'Weather in Istanbul this week?', accent: 'text-(--accent-cyan)' },
  { icon: 'i-lucide-calculator', label: 'What is 18% of 2,450, plus 320?', accent: 'text-(--accent-magenta)' },
  { icon: 'i-lucide-clock', label: 'What time is it in Tokyo right now?', accent: 'text-(--accent-lime)' },
  { icon: 'i-lucide-code-xml', label: 'Write a Vue composable that debounces a ref', accent: 'text-(--accent-violet)' }
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
          <h1 class="mt-5 text-4xl font-semibold tracking-tighter text-highlighted sm:text-5xl">
            What shall we <span class="text-gradient">talk through</span>?
          </h1>
          <p class="mt-3 max-w-md text-muted">
            Streaming answers, code you can copy, and live tools for weather, maths and time.
          </p>
        </div>

        <ChatComposer
          v-model="input"
          autofocus
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
            :ui="{ leadingIcon: suggestion.accent }"
            @click="start(suggestion.label)"
          />
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
