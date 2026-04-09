# TPM Job Match AI

Minimal React + Node app for comparing a resume against a job description with Gemini Flash.

## What it does

- Accepts a pasted resume and job description in the React frontend
- Sends both to an Express backend at `/analyze`
- Calls Gemini Flash with a strict JSON prompt
- Returns a structured evaluation for display in the UI
- Uses an in-memory throttle to reduce the chance of burning through quota too quickly

## Stack

- React + Vite frontend
- Express backend
- `@google/genai` SDK
- Local `.env` configuration only

## Setup

1. Install dependencies:

	```bash
	npm install
	```

2. Create a local environment file:

	```bash
	cp .env.example .env
	```

3. Add your Gemini API key to `.env`:

	```env
	GEMINI_API_KEY=your_api_key_here
	```

4. Start the frontend and backend together:

	```bash
	npm run dev
	```

5. Open the Vite app and submit a resume plus job description.

## Environment variables

- `GEMINI_API_KEY`: required Gemini Developer API key
- `PORT`: optional backend port, defaults to `3001`
- `RATE_LIMIT_WINDOW_MS`: optional throttle window, defaults to `60000`
- `RATE_LIMIT_MAX_REQUESTS`: optional requests per window, defaults to `5`

## Notes

- The app is hard-coded to use `gemini-2.5-flash`
- `.env` is ignored in git so the key stays local
- No authentication and no database are included in this MVP
