import type { UIMessage } from 'ai'
import { getToolName, isTextUIPart, isToolUIPart } from 'ai'

/**
 * Rule-based fallback for the Tab hint, used until (or if) the model's guess arrives, e.g. after a reload.
 * Instant and free: it only looks at the last tool result or the shape of the reply.
 */
export function suggestFollowUp(messages: UIMessage[]): string | undefined {
  const last = messages.at(-1)
  if (last?.role !== 'assistant') return

  for (const part of [...last.parts].reverse()) {
    if (!isToolUIPart(part) || part.state !== 'output-available') continue
    const output = part.output as Record<string, unknown> | undefined
    if (!output || 'error' in output) continue

    switch (getToolName(part)) {
      case 'getWeather':
        return `Will it rain in ${String(output.location).split(',')[0]} this weekend?`
      case 'calculate':
        return `Now add 20% VAT to ${output.formatted}`
      case 'getTime':
        return output.timeZone === 'America/New_York' ? 'What time is it in London?' : 'What time is it in New York?'
    }
  }

  const text = last.parts.filter(isTextUIPart).map(part => part.text).join('\n')
  if (text.includes('```')) return 'Explain that code step by step'
  if (text.length > 600) return 'Summarize that in three bullet points'
  return 'Tell me more'
}
