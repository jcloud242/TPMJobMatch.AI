import { GoogleGenAI } from '@google/genai'
import {
  buildAnalyzePrompt,
  normalizeAnalysis,
} from '../../src/prompts/analyzePrompt.js'

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