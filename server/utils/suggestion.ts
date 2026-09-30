import type { UIMessage } from 'ai'
import { generateText } from 'ai'

const MAX_CONTEXT_CHARS = 2_000

// Few-shot examples matter: without them the small model's Turkish drifts into odd phrasing.
const instructions = `You write the user's next message in a chat with an AI assistant.
Rules: one short, natural follow-up question or request the user would plausibly send next; at most 10 words;
same language as the user; fluent and grammatical; written by the user to the assistant.
Output only the message.

Examples:
User: What's the weather in Paris? / Assistant: Rainy, 19°C. → Will it clear up by the weekend?
User: İstanbul'da hava nasıl? / Assistant: Yağmurlu, 18°C. → Yarın yağmur devam edecek mi?
User: Write a debounce function / Assistant: (code) → Can you add TypeScript types to it?`

function textOf(message: UIMessage) {
  return message.parts
    .map((part) => {
      if (part.type === 'text') return part.text
      // Tool results are summarised as short hints so the guess can build on them.
      if (part.type.startsWith('tool-') && 'output' in part && part.output) {
        return `[${part.type.slice(5)} result: ${JSON.stringify(part.output).slice(0, 200)}]`
      }
      return ''
    })
    .filter(Boolean)
    .join('\n')
}

/**
 * Guesses the user's next message from the last exchange. Returns undefined on any failure;
 * the client then falls back to its own rule-based hint.
 */
export async function suggestNextMessage(event: Parameters<typeof getSuggestionModel>[0], lastUser: UIMessage, answer: string) {
  const model = useRuntimeConfig(event).suggestionModel
  try {
    const transcript = `User: ${textOf(lastUser)}\n\nAssistant: ${answer}`.slice(-MAX_CONTEXT_CHARS)
    const { text, usage } = await generateText({
      model: getSuggestionModel(event),
      instructions,
      prompt: `${transcript}\n\nThe user's next message:`,
      maxOutputTokens: 30,
      temperature: 0.4,
      abortSignal: AbortSignal.timeout(4_000)
    })

    const line = text
      .split('\n')
      .map(l => l.trim())
      .find(Boolean)
      ?.replace(/^(user|kullanıcı)\s*:\s*/i, '')
      .replace(/^["'“”‘’«»]+|["'“”‘’«»]+$/g, '')
      .trim()

    recordUsage(event, { op: 'neurons', amount: estimateNeurons(model, usage) })
    return line && line.length <= 100 ? line : undefined
  } catch (error) {
    console.error('[suggestion]', error)
    return undefined
  }
}
