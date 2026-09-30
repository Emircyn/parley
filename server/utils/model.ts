import type { H3Event } from 'h3'
import { createWorkersAI } from 'workers-ai-provider'

function workersAI(event: H3Event) {
  const env = event.context.cloudflare?.env
  if (!env?.AI) {
    throw createError({ statusCode: 500, statusMessage: 'Workers AI binding "AI" is missing' })
  }
  return createWorkersAI({ binding: env.AI })
}

/**
 * The only place that knows which provider and models Parley talks to.
 * Swap the provider here, or the models with NUXT_PUBLIC_AI_MODEL / NUXT_SUGGESTION_MODEL, and nothing else changes.
 */
export function getChatModel(event: H3Event) {
  return workersAI(event)(useRuntimeConfig(event).public.aiModel)
}

/** A small, fast model that only guesses the user's next message (a few neurons per reply). */
export function getSuggestionModel(event: H3Event) {
  return workersAI(event)(useRuntimeConfig(event).suggestionModel)
}
