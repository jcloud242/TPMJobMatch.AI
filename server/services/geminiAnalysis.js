import { GoogleGenAI } from '@google/genai'
import {
  buildAnalyzePrompt,
  normalizeAnalysis,
} from '../../src/prompts/analyzePrompt.js'

/**
 * Service for analyzing candidate-job fit using Gemini Flash.
 *
 * IMPORTANT: Never log error objects directly. Always use sanitizeErrorMessage()
 * from server/utils/sanitizeError.js before logging or sending to clients.
 * This prevents accidental exposure of API keys and sensitive environment data.
 */
const FLASH_MODEL = 'gemini-2.5-flash'

let aiClient

function getAiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY environment variable.')
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  }

  return aiClient
}

function parseModelJson(rawText) {
  const trimmedText = String(rawText ?? '').trim()

  if (!trimmedText) {
    throw new Error('Gemini Flash returned an empty response.')
  }

  const normalizedText = trimmedText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()

  return JSON.parse(normalizedText)
}

export async function analyzeCandidateFit({ resume, jobDescription }) {
  const ai = getAiClient()
  const response = await ai.models.generateContent({
    model: FLASH_MODEL,
    contents: buildAnalyzePrompt({ resume, jobDescription }),
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  })

  const analysis = normalizeAnalysis(parseModelJson(response.text))

  return {
    analysis,
    model: FLASH_MODEL,
    evaluatedAt: new Date().toISOString(),
  }
}