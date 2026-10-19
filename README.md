# MasterStudio AI

MasterStudio AI is an AI-assisted website-building workspace. This repository is an early application scaffold, not a finished production platform.

## Current foundation

- React, TypeScript, Vite, and responsive workspace UI
- Express API with health endpoint and AI-generation endpoint
- Server-side Google Gemini API support (recommended for initial testing) and optional Anthropic support
- Basic request size limits, rate limiting, and security headers
- Browser-local storage for generated project drafts and ZIP export

## Requirements

- Node.js 20 or newer
- A supported AI provider API key for generation. Google AI Studio offers a free tier for eligible models, subject to quotas and its data-use terms.

## Run locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add your provider key.
3. Start frontend and backend: `npm run dev`
4. Open the Vite address shown in the terminal (usually `http://localhost:5173`).

The frontend proxies `/api` requests to Express on port 3001 during local development.

## Environment variables

- `AI_PROVIDER`: `gemini` or `anthropic`; if omitted, the server selects a provider based on which key is configured.
- `GEMINI_API_KEY`: server-only Google AI Studio key; never put it in a `VITE_*` variable or commit it.
- `GEMINI_MODEL`: optional Gemini model override; defaults to `gemini-2.5-flash`.
- `ANTHROPIC_API_KEY`: optional server-only alternative provider key.
- `ANTHROPIC_MODEL`: optional Anthropic model override.
- `CORS_ORIGIN`: optional comma-separated allowed origins for the API.
- `PORT`: optional server port, provided automatically by many hosting platforms.
- `NODE_ENV=production`: serves the built frontend from Express.

## Production build

```sh
npm install
npm run build
NODE_ENV=production npm start
```

For Render, use build command `npm install && npm run build` and start command `npm start`. Add `GEMINI_API_KEY` and `AI_PROVIDER=gemini` in the hosting provider's environment settings. Do not commit secrets to GitHub.

## Honest status / next milestones

The repository is an early scaffold. Account authentication, a database, durable cloud project storage, isolated build-and-preview, secure code execution, GitHub export, and automated deployment are not yet implemented. Generated files are saved to browser local storage on the device that created them and ZIP export has not yet been build-tested. Treat generated code as unreviewed until it has been tested.
