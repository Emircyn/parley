import { UsageModal } from '#components'

/** Opens the usage screen (limits per minute and the shared daily quota). */
export function useUsage() {
  const modal = useOverlay().create(UsageModal)
  return { openUsage: () => modal.open() }
}
