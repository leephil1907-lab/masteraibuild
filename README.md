# MasterStudio AI

MasterStudio AI is an AI-assisted website-building workspace. This repository is an early application scaffold, not a finished production platform.

## Current foundation

- React, TypeScript, Vite, and responsive workspace UI
- Express API with health endpoint and initial AI-generation endpoint
- Server-side Anthropic API integration; the API key stays on the server
- Basic request size limits, rate limiting, and security headers
- Browser-local storage for generated project drafts

## Requirements

- Node.js 20 or newer
- An Anthropic API key to use AI generation

## Run locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add your API key.
3. Start frontend and backend: `npm run dev`
4. Open the Vite address shown in the terminal (usually `http://localhost:5173`).

The frontend proxies `/api` requests to Express on port 3001 during local development.

## Environment variables

- `ANTHROPIC_API_KEY`: server-only provider secret; never put it in a `VITE_*` variable or commit it.
- `ANTHROPIC_MODEL`: optional model override; defaults to `claude-haiku-4-5-20251001`.
- `CORS_ORIGIN`: optional comma-separated allowed origins for the API.
- `PORT`: optional server port, provided automatically by many hosting platforms.
- `NODE_ENV=production`: serves the built frontend from Express.

## Production build

```sh
npm install
npm run build
NODE_ENV=production npm start
```

For Render, use build command `npm install && npm run build` and start command `npm start`. Add `ANTHROPIC_API_KEY` in the hosting provider's environment settings. Do not commit secrets to GitHub.

## Honest status / next milestones

This early scaffold does not yet include account authentication, a database, durable cloud project storage, an isolated build-and-preview runtime, downloadable project archives, GitHub export, or automated deployment. Generated files are currently saved to browser local storage on the device that created them. Do not treat generated code as reviewed or production-ready without testing it.
