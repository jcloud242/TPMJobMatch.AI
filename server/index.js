import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { createThrottle } from './middleware/createThrottle.js'
import { analyzeCandidateFit } from './services/geminiAnalysis.js'
import { sanitizeErrorMessage } from './utils/sanitizeError.js'

const app = express()
const port = Number(process.env.PORT || 3001)
const requestThrottle = createThrottle({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 5),
})

function validateTextInput(value, label) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return `${label} is required.`
  }

  if (normalizedValue.length > 30000) {
    return `${label} is too large for this MVP. Keep it under 30,000 characters.`
  }

  return ''
}

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_request, response) => {
  response.json({ ok: true })
})

app.post('/analyze', requestThrottle, async (request, response) => {
  const { resume, jobDescription } = request.body ?? {}
  const inputError =
    validateTextInput(resume, 'Resume') ||
    validateTextInput(jobDescription, 'Job description')

  if (inputError) {
    response.status(400).json({ error: inputError })
    return
  }

  try {
    const result = await analyzeCandidateFit({
      resume: resume.trim(),
      jobDescription: jobDescription.trim(),
    })

    response.json(result)
  } catch (error) {
    // Never log the full error object to avoid leaking sensitive data
    const message = error instanceof Error ? error.message : 'Analysis failed.'
    const isConfigError = message.includes('GEMINI_API_KEY')
    const sanitizedMessage = sanitizeErrorMessage(message)

    response.status(isConfigError ? 500 : 502).json({
      error: isConfigError
        ? 'Server is missing GEMINI_API_KEY in the local .env file.'
        : sanitizedMessage || 'Gemini Flash request failed. Check the server logs and API key configuration.',
    })
  }
})

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})