/**
 * First line of defence for /api: only same-origin browser requests with a JSON body get through,
 * and API responses are never cached.
 */
export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) return

  setResponseHeader(event, 'Cache-Control', 'no-store')

  if (event.method === 'GET' || event.method === 'HEAD') return
  if (event.method !== 'POST') throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })

  // Browsers always send Origin on POST; reject other sites and anything that isn't a browser on this origin.
  const origin = getRequestHeader(event, 'origin')
  const fetchSite = getRequestHeader(event, 'sec-fetch-site')
  const sameOrigin = origin ? origin === getRequestURL(event).origin : fetchSite === 'same-origin'
  if (!sameOrigin) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const contentType = getRequestHeader(event, 'content-type') ?? ''
  if (!contentType.startsWith('application/json')) throw createError({ statusCode: 415, statusMessage: 'Unsupported media type' })

  const length = Number(getRequestHeader(event, 'content-length') ?? 0)
  if (length > MAX_BODY_BYTES) throw createError({ statusCode: 413, statusMessage: 'Payload too large' })
})
