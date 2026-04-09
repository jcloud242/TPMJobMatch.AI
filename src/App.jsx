import { useState } from 'react'
import './App.css'

const emptyForm = {
  resume: '',
  jobDescription: '',
}

function ResultList({ title, items }) {
  return (
    <section className="result-card">
      <h3>{title}</h3>
      {items.length ? (
        <ul className="result-list">
          {items.map((item) => (
            <li key={`${title}-${item}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="empty-copy">No items returned.</p>
      )}
    </section>
  )
}

function App() {
  const [form, setForm] = useState(emptyForm)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.resume.trim() || !form.jobDescription.trim()) {
      setError('Paste both a resume and a job description before analyzing.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'Analysis request failed.')
      }

      setAnalysis(payload)
    } catch (requestError) {
      setAnalysis(null)
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setForm(emptyForm)
    setAnalysis(null)
    setError('')
  }

  const hasInput = form.resume.trim() && form.jobDescription.trim()
  const result = analysis?.analysis

  return (
    <div className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">TPM Job Match AI</p>
        <h1>Compare a resume against a job description with Gemini Flash.</h1>
        <p className="lede">
          Paste both documents, send them to a local Express backend, and get a
          structured hiring-style evaluation with clear strengths, gaps, and
          interview prep areas.
        </p>
        <div className="hero-meta">
          <span>Flash-only model</span>
          <span>No auth</span>
          <span>No database</span>
          <span>JSON output</span>
        </div>
      </section>

      <div className="workspace-grid">
        <form className="analysis-form panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <p className="section-label">Input</p>
              <h2>Documents</h2>
            </div>
            <div className="button-row">
              <button className="ghost-button" type="button" onClick={resetForm}>
                Clear
              </button>
              <button className="primary-button" type="submit" disabled={!hasInput || isLoading}>
                {isLoading ? 'Analyzing...' : 'Analyze fit'}
              </button>
            </div>
          </div>

          <label className="input-card">
            <span>Resume</span>
            <textarea
              name="resume"
              value={form.resume}
              onChange={updateField}
              placeholder="Paste the candidate resume here..."
            />
          </label>

          <label className="input-card">
            <span>Job description</span>
            <textarea
              name="jobDescription"
              value={form.jobDescription}
              onChange={updateField}
              placeholder="Paste the target job description here..."
            />
          </label>
        </form>

        <section className="results-panel panel">
          <div className="panel-heading">
            <div>
              <p className="section-label">Output</p>
              <h2>Evaluation</h2>
            </div>
            {analysis ? <p className="model-pill">{analysis.model}</p> : null}
          </div>

          {error ? <div className="status-banner error">{error}</div> : null}

          {!result && !error ? (
            <div className="empty-state">
              <p>
                Submit both inputs to generate a structured assessment from the
                backend.
              </p>
              <p>
                The response includes a match score, recommendation, strengths,
                gaps, risks, and interview focus areas.
              </p>
            </div>
          ) : null}

          {result ? (
            <>
              <div className="score-strip">
                <div>
                  <p className="metric-label">Match score</p>
                  <p className="metric-value">{result.match_score}</p>
                </div>
                <div>
                  <p className="metric-label">Fit level</p>
                  <p className="metric-copy">{result.fit_level.replaceAll('_', ' ')}</p>
                </div>
                <div>
                  <p className="metric-label">Recommendation</p>
                  <p className="metric-copy">
                    {result.apply_recommendation.replaceAll('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="results-grid">
                <ResultList title="Strengths" items={result.strengths} />
                <ResultList title="Gaps" items={result.gaps} />
                <ResultList title="Risks" items={result.risks} />
                <ResultList title="Interview focus" items={result.interview_focus} />
              </div>

              <details className="json-panel">
                <summary>Raw JSON</summary>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </details>
            </>
          ) : null}
        </section>
      </div>
    </div>
  )
}

export default App
