const fitLevels = ['strong_fit', 'moderate_fit', 'stretch', 'weak_fit']
const recommendations = ['apply', 'consider', 'skip']

function toStringList(value) {
	if (!Array.isArray(value)) {
		return []
	}

	return value
		.map((item) => String(item ?? '').trim())
		.filter(Boolean)
		.slice(0, 6)
}

function toBoundedScore(value) {
	const numericValue = Number(value)

	if (!Number.isFinite(numericValue)) {
		return 0
	}

	return Math.max(0, Math.min(100, Math.round(numericValue)))
}

export function normalizeAnalysis(value) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new Error('Gemini Flash returned an invalid analysis payload.')
	}

	return {
		match_score: toBoundedScore(value.match_score),
		fit_level: fitLevels.includes(value.fit_level) ? value.fit_level : 'stretch',
		strengths: toStringList(value.strengths),
		gaps: toStringList(value.gaps),
		risks: toStringList(value.risks),
		apply_recommendation: recommendations.includes(value.apply_recommendation)
			? value.apply_recommendation
			: 'consider',
		interview_focus: toStringList(value.interview_focus),
	}
}

export function buildAnalyzePrompt({ resume, jobDescription }) {
	return `You are a senior technical hiring manager evaluating a candidate for a competitive role.

Compare the resume against the job description and return a realistic evaluation.
Do not inflate the candidate's fit.

Return only valid JSON matching this exact shape:
{
	"match_score": 0,
	"fit_level": "strong_fit | moderate_fit | stretch | weak_fit",
	"strengths": ["specific strengths tied to the job"],
	"gaps": ["missing or weak requirements"],
	"risks": ["where the candidate may struggle in the interview or role"],
	"apply_recommendation": "apply | consider | skip",
	"interview_focus": ["what the candidate should prepare before interviews"]
}

Evaluation rules:
- Be direct, specific, and grounded in the provided text.
- Assume the role is competitive and compare against the stated requirements.
- Keep each list concise and useful.
- Do not include markdown, code fences, or commentary outside the JSON object.

Resume:
${resume}

Job Description:
${jobDescription}`
}

