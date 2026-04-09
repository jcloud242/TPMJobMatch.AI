export function createThrottle({ windowMs = 60000, maxRequests = 5 } = {}) {
  const requestLog = new Map()

  return function throttleMiddleware(request, response, next) {
    const clientKey = request.ip || request.headers['x-forwarded-for'] || 'local'
    const now = Date.now()
    const windowStart = now - windowMs
    const recentRequests = (requestLog.get(clientKey) || []).filter(
      (timestamp) => timestamp > windowStart,
    )

    if (recentRequests.length >= maxRequests) {
      response.status(429).json({
        error: 'Rate limit reached. Please wait before sending another analysis request.',
      })
      return
    }

    recentRequests.push(now)
    requestLog.set(clientKey, recentRequests)

    if (requestLog.size > 500) {
      for (const [key, timestamps] of requestLog.entries()) {
        if (!timestamps.some((timestamp) => timestamp > windowStart)) {
          requestLog.delete(key)
        }
      }
    }

    next()
  }
}