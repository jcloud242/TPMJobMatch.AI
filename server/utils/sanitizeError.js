/**
 * Sanitize error messages to prevent leaking sensitive data like API keys.
 * Never log full Error objects directly—always use this function first.
 */
export function sanitizeErrorMessage(error) {
  if (!error) {
    return 'Unknown error occurred.'
  }

  const message = String(error?.message || error).trim()

  // Remove or redact common sensitive patterns
  return message
    .replace(/AIzaSy[\w-]{30,}/g, 'REDACTED_API_KEY')
    .replace(/sk-[\w-]+/g, 'REDACTED_KEY')
    .replace(/Bearer\s+[\w-]+/g, 'REDACTED_TOKEN')
    .replace(/GEMINI_API_KEY[^)]*\)/g, 'REDACTED')
}
