interface TypewriterOptions {
  typeMs?: number
  deleteMs?: number
  holdMs?: number
  pauseMs?: number
}

/**
 * Cycles through phrases like someone typing them: type, hold, delete, next.
 * `text` is what's on screen; `current` is the whole phrase being typed, so Tab can accept it early.
 * Shows the first phrase when the visitor prefers reduced motion, and idles while the tab is hidden.
 */
export function useTypewriter(phrases: string[], { typeMs = 60, deleteMs = 28, holdMs = 4000, pauseMs = 600 }: TypewriterOptions = {}) {
  const text = ref(phrases[0] ?? '')
  const index = ref(0)
  const current = computed(() => phrases[index.value] ?? '')
  let timer: ReturnType<typeof setTimeout> | undefined

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || phrases.length < 2) return

    let length = 0
    let deleting = false
    text.value = ''

    const tick = () => {
      if (document.hidden) {
        timer = setTimeout(tick, 500)
        return
      }

      const phrase = current.value
      if (!deleting) {
        length++
        text.value = phrase.slice(0, length)
        if (length === phrase.length) {
          deleting = true
          timer = setTimeout(tick, holdMs)
          return
        }
        timer = setTimeout(tick, typeMs)
        return
      }

      length--
      text.value = phrase.slice(0, length)
      if (length === 0) {
        deleting = false
        index.value = (index.value + 1) % phrases.length
        timer = setTimeout(tick, pauseMs)
        return
      }
      timer = setTimeout(tick, deleteMs)
    }

    timer = setTimeout(tick, pauseMs)
  })

  onBeforeUnmount(() => clearTimeout(timer))

  return { text, current }
}
