<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { DeleteChatModal } from '#components'

const route = useRoute()
const toast = useToast()
const overlay = useOverlay()
const deleteModal = overlay.create(DeleteChatModal)
const { conversations, find, remove } = useConversations()
const { newChat, openHelp } = useChatShortcuts()

const open = ref(false)

// Verify the visitor in the background so the first message isn't delayed.
onMounted(() => {
  ensureVisitorSession().catch(() => {})
})

type ConversationItem = NavigationMenuItem & { conversationId: string }

defineShortcuts({
  'meta_shift_o': () => newChat(),
  '/': () => focusPrompt(),
  '?': () => openHelp()
})

const items = computed<NavigationMenuItem[][]>(() => {
  const groups = new Map<string, NavigationMenuItem[]>()
  for (const conversation of conversations.value) {
    const bucket = historyBucket(conversation.updatedAt)
    if (!groups.has(bucket)) groups.set(bucket, [{ label: bucket, type: 'label' }])
    groups.get(bucket)!.push({
      label: conversation.title,
      to: `/chat/${conversation.id}`,
      slot: 'conversation' as const,
      conversationId: conversation.id,
      onSelect: () => {
        open.value = false
      }
    })
  }
  return [...groups.values()]
})

async function deleteConversation(id: string) {
  const conversation = find(id)
  if (!conversation) return

  const confirmed = await deleteModal.open({ title: conversation.title })
  if (!confirmed) return

  remove(id)
  if (route.params.id === id) navigateTo('/')
  toast.add({ title: 'Chat deleted', icon: 'i-lucide-trash-2', duration: 2500 })
}
</script>

<template>
  <UDashboardGroup
    unit="rem"
    storage="local"
  >
    <UDashboardSidebar
      id="history"
      v-model:open="open"
      collapsible
      resizable
      :min-size="14"
      :default-size="17"
      :max-size="24"
      :ui="{ footer: 'border-t border-default' }"
    >
      <template #header="{ collapsed }">
        <NuxtLink
          to="/"
          class="flex items-center"
          aria-label="Parley home"
        >
          <ParleyLogo
            v-if="collapsed"
            class="size-7"
          />
          <ParleyWordmark v-else />
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UTooltip
          :text="collapsed ? 'New chat' : undefined"
          :kbds="['meta', 'shift', 'o']"
          :disabled="!collapsed"
          side="right"
        >
          <UButton
            icon="i-lucide-square-pen"
            :label="collapsed ? undefined : 'New chat'"
            :square="collapsed"
            color="neutral"
            variant="soft"
            block
            @click="newChat(); open = false"
          >
            <template
              v-if="!collapsed"
              #trailing
            >
              <span class="ms-auto hidden lg:inline-flex gap-0.5">
                <UKbd
                  value="meta"
                  size="sm"
                />
                <UKbd
                  value="shift"
                  size="sm"
                />
                <UKbd
                  value="O"
                  size="sm"
                />
              </span>
            </template>
          </UButton>
        </UTooltip>

        <UNavigationMenu
          v-if="!collapsed && items.length"
          :items="items"
          orientation="vertical"
          :ui="{ link: 'overflow-hidden pe-1', linkLabel: 'truncate' }"
        >
          <template #conversation-trailing="{ item }">
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="link"
              size="xs"
              class="-me-0.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-lg:opacity-100 text-muted hover:text-error"
              :aria-label="`Delete ${(item as ConversationItem).label}`"
              @click.stop.prevent="deleteConversation((item as ConversationItem).conversationId)"
            />
          </template>
        </UNavigationMenu>

        <p
          v-else-if="!collapsed"
          class="px-2.5 py-6 text-sm text-dimmed"
        >
          Your chats will show up here. They stay in this browser only.
        </p>
      </template>

      <template #footer="{ collapsed }">
        <div
          class="flex w-full flex-col gap-1.5"
          :class="{ 'items-center': collapsed }"
        >
          <p
            v-if="!collapsed"
            class="ps-2.5 text-xs text-dimmed"
          >
            Powered by
            <ULink
              :to="AUTHOR.website"
              target="_blank"
              class="font-medium text-toned hover:text-primary"
            >
              {{ AUTHOR.name }}
            </ULink>
          </p>
          <div
            class="flex items-center gap-0.5"
            :class="{ 'flex-col': collapsed }"
          >
            <UTooltip :text="`${AUTHOR.name} on GitHub`">
              <UButton
                icon="i-simple-icons-github"
                :to="AUTHOR.github"
                target="_blank"
                color="neutral"
                variant="ghost"
                :aria-label="`${AUTHOR.name} on GitHub`"
              />
            </UTooltip>
            <UTooltip text="emircyn.com">
              <UButton
                icon="i-lucide-globe"
                :to="AUTHOR.website"
                target="_blank"
                color="neutral"
                variant="ghost"
                aria-label="emircyn.com"
              />
            </UTooltip>
            <UTooltip
              text="Keyboard shortcuts"
              :kbds="['?']"
            >
              <UButton
                icon="i-lucide-keyboard"
                color="neutral"
                variant="ghost"
                aria-label="Keyboard shortcuts"
                @click="openHelp"
              />
            </UTooltip>
            <UColorModeButton
              color="neutral"
              variant="ghost"
            />
          </div>
        </div>
      </template>
    </UDashboardSidebar>

    <slot />

    <!-- Turnstile renders here; it stays invisible unless Cloudflare asks for an interaction. -->
    <div
      :id="TURNSTILE_CONTAINER_ID"
      class="fixed bottom-32 left-1/2 z-50 -translate-x-1/2 empty:hidden"
    />
  </UDashboardGroup>
</template>
