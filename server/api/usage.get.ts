/** The visitor's messages this minute and the shared daily quota, for the usage screen. */
export default defineEventHandler(async (event) => {
  const session = await readSession(event)
  const usage = await usageMeter(event, { op: 'read', session })
  if (!usage) throw createError({ statusCode: 503, statusMessage: 'Usage is not available here' })
  return usage
})
