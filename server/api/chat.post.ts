import type { UIMessage } from 'ai'
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, isStepCount, streamText, toUIMessageStream } from 'ai'
import { z } from 'zod'

const textPart = z.object({ type: z.literal('text'), text: z.string().max(MAX_TEXT_CHARS) })

// The client may only send what the UI produces: user text, and earlier assistant turns.
// No system messages, so nobody can rewrite Parley's instructions through the API.
const bodySchema = z.object({
  messages: z.array(z.discriminatedUnion('role', [
    z.object({ id: z.string().max(100), role: z.literal('user'), parts: z.array(textPart).min(1).max(4) }),
    z.object({ id: z.string().max(100), role: z.literal('assistant'), parts: z.array(z.looseObject({ type: z.string().max(64) })).max(40) })
  ])).min(1).max(200)
})

const instructions = (today: string) => `You are Parley, a friendly and sharp AI assistant in a chat app.
Today is ${today}.
- Answer in the language the user writes in.
- Be concise: short paragraphs, lists when they help, fenced code blocks with a language for code.
- Use the tools instead of guessing: getWeather for weather, calculate for any arithmetic, getTime for the time somewhere.
- After a tool returns, answer in one or two sentences; the app already shows the tool result as a card, so don't repeat every number.
- If a tool returns an error, say so briefly and suggest what the user can try.
- Never output raw HTML or images; use Markdown text, lists, tables and code blocks only.`

export default defineEventHandler(async (event) => {
  const sessionId = await readSession(event)
  if (!sessionId) return chatError(event, 401, 'verification_required')

  if (!await checkRateLimit(event, 'CHAT_RATE_LIMITER', [`ip:${clientIp(event)}`, `session:${sessionId}`])) {
    return chatError(event, 429, 'rate_limit')
  }

  const parsed = bodySchema.safeParse(await readBody(event).catch(() => undefined))
  if (!parsed.success) return chatError(event, 400, 'bad_request')

  const history = parsed.data.messages
  if (history.at(-1)?.role !== 'user') return chatError(event, 400, 'bad_request')

  // Only the most recent turns go to the model: keeps each reply cheap on the daily neuron budget.
  const messages = history.slice(-MAX_MESSAGES) as UIMessage[]

  const result = streamText({
    model: getChatModel(event),
    instructions: instructions(new Date().toDateString()),
    messages: await convertToModelMessages(messages, { tools: chatTools, ignoreIncompleteToolCalls: true }),
    tools: chatTools,
    stopWhen: isStepCount(4),
    maxOutputTokens: MAX_OUTPUT_TOKENS
  })

  // The usage meter is the source of truth for the per-visitor and daily limits the UI shows.
  const gate = await usageMeter(event, { op: 'message', session: sessionId })
  if (gate?.allowed === false) return chatError(event, 429, gate.reason ?? 'rate_limit')

  const onError = (error: unknown) => {
    console.error('[chat]', error)
    const code = toChatErrorCode(error)
    if (code === 'quota') recordUsage(event, { op: 'exhausted' })
    return code
  }

  const stream = createUIMessageStream({
    onError,
    execute: async ({ writer }) => {
      writer.merge(toUIMessageStream({ stream: result.stream, tools: chatTools, sendReasoning: true, onError }))

      // Once the reply is done, a small model guesses the user's next message for the Tab hint.
      // Sent as a transient data part: the client shows it but never stores it in the conversation.
      const answer = await Promise.resolve(result.text).catch(() => '')
      const usage = await Promise.resolve(result.totalUsage).catch(() => undefined)
      recordUsage(event, { op: 'neurons', amount: estimateNeurons(useRuntimeConfig(event).public.aiModel, usage) })
      if (!answer) return
      const suggestion = await suggestNextMessage(event, messages.at(-1)!, answer)
      if (suggestion) writer.write({ type: 'data-suggestion', data: { text: suggestion }, transient: true })
    }
  })

  return createUIMessageStreamResponse({ stream })
})
