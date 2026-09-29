import { ShortcutsModal } from '#components'

export const PROMPT_ID = 'parley-prompt'

export function focusPrompt() {
  document.getElementById(PROMPT_ID)?.focus()
}

export const SHORTCUTS = [
  { keys: ['meta', 'shift', 'O'], label: 'New chat' },
  { keys: ['/'], label: 'Focus the message box' },
  { keys: ['enter'], label: 'Send message' },
  { keys: ['shift', 'enter'], label: 'New line' },
  { keys: ['escape'], label: 'Stop the reply' },
  { keys: ['meta', 'shift', 'C'], label: 'Copy the last reply' },
  { keys: ['?'], label: 'Show shortcuts' }
] as const

export function useChatShortcuts() {
  const overlay = useOverlay()
  const help = overlay.create(ShortcutsModal)

  function openHelp() {
    help.open()
  }

  async function newChat() {
    await navigateTo('/')
    nextTick(focusPrompt)
  }

  return { openHelp, newChat }
}
