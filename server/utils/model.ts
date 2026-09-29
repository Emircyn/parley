import type { H3Event } from 'h3'
import { createWorkersAI } from 'workers-ai-provider'

/**
 * The only place that knows which provider and model Parley talks to.
 * Swap the provider here, or the model with NUXT_PUBLIC_AI_MODEL, and nothing else changes.
 */
export function getChatModel(event: H3Event) {
  const env = event.context.cloudflare?.env
  if (!env?.AI) {
    throw createError({ statusCode: 500, statusMessage: 'Workers AI binding "AI" is missing' })
  }

  const workersai = createWorkersAI({ binding: env.AI })
  return workersai(useRuntimeConfig(event).public.aiModel)
}
