import type { H3Event } from 'h3'
import type { LanguageModelUsage } from 'ai'

/** Workers AI neurons per million tokens (developers.cloudflare.com/workers-ai/platform/pricing). */
const NEURON_PRICES: Record<string, { input: number, output: number }> = {
  '@cf/zai-org/glm-4.7-flash': { input: 5_500, output: 36_400 },
  '@cf/meta/llama-3.1-8b-instruct-fp8-fast': { input: 4_119, output: 34_868 }
}

export function estimateNeurons(model: string, usage: Partial<LanguageModelUsage> | undefined) {
  const price = NEURON_PRICES[model]
  if (!price || !usage) return 0
  return ((usage.inputTokens ?? 0) * price.input + (usage.outputTokens ?? 0) * price.output) / 1_000_000
}

export type UsageOp
  = | { op: 'message', session: string }
    | { op: 'neurons', amount: number }
    | { op: 'exhausted' }
    | { op: 'read', session?: string }

/**
 * Talks to the single usage-meter Durable Object. Returns undefined where there is no Durable Object
 * (plain `nuxt dev`), so callers can carry on without usage data.
 */
export async function usageMeter(event: H3Event, op: UsageOp): Promise<UsageSnapshot | undefined> {
  const durableFetch = (event.context.cloudflare as { durableFetch?: (req: Request) => Promise<Response> } | undefined)?.durableFetch
  if (!durableFetch) return

  try {
    const response = await durableFetch(new Request('https://usage-meter.internal/api/_usage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(op)
    }))
    return response.ok ? await response.json() as UsageSnapshot : undefined
  } catch (error) {
    console.error('[usage]', error)
    return undefined
  }
}

/** Fire-and-forget recording that doesn't hold up the response. */
export function recordUsage(event: H3Event, op: UsageOp) {
  event.waitUntil(usageMeter(event, op))
}
