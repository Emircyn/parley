import type { UIMessage } from 'ai'

export interface Conversation {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

const INDEX_KEY = 'parley:conversations'
const messagesKey = (id: string) => `parley:messages:${id}`
const TITLE_LENGTH = 48

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    // Quota exceeded or storage disabled: history just won't persist.
    console.warn('[parley] could not save to localStorage', error)
  }
}

function titleFrom(text: string) {
  const line = text.replace(/\s+/g, ' ').trim()
  return line.length > TITLE_LENGTH ? `${line.slice(0, TITLE_LENGTH - 1)}…` : line || 'New chat'
}

/** Chat history kept in the browser: an index of conversations plus one entry per conversation's messages. */
export function useConversations() {
  const conversations = useState<Conversation[]>('parley:conversations', () => import.meta.client ? read(INDEX_KEY, []) : [])
  // First message typed on the home page, sent by the chat page once it mounts.
  const pending = useState<Record<string, string>>('parley:pending', () => ({}))

  const sorted = computed(() => [...conversations.value].sort((a, b) => b.updatedAt - a.updatedAt))

  function persistIndex() {
    write(INDEX_KEY, conversations.value)
  }

  function create(firstMessage: string) {
    const now = Date.now()
    const conversation: Conversation = { id: crypto.randomUUID(), title: titleFrom(firstMessage), createdAt: now, updatedAt: now }
    conversations.value = [conversation, ...conversations.value]
    pending.value[conversation.id] = firstMessage
    persistIndex()
    return conversation
  }

  function takePending(id: string) {
    const { [id]: text, ...rest } = pending.value
    pending.value = rest
    return text
  }

  function find(id: string) {
    return conversations.value.find(c => c.id === id)
  }

  function loadMessages(id: string): UIMessage[] {
    return read<UIMessage[]>(messagesKey(id), [])
  }

  function saveMessages(id: string, messages: UIMessage[]) {
    if (!messages.length) return
    write(messagesKey(id), messages)

    const conversation = find(id)
    if (conversation) {
      conversation.updatedAt = Date.now()
      persistIndex()
    }
  }

  function remove(id: string) {
    conversations.value = conversations.value.filter(c => c.id !== id)
    localStorage.removeItem(messagesKey(id))
    persistIndex()
  }

  function clear() {
    for (const { id } of conversations.value) localStorage.removeItem(messagesKey(id))
    conversations.value = []
    persistIndex()
  }

  return { conversations: sorted, create, takePending, find, loadMessages, saveMessages, remove, clear }
}
