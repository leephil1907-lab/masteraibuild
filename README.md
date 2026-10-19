# MasterStudio AI

MasterStudio AI is an AI-assisted website-building workspace. This repository is an early application scaffold, not a finished production platform.

## Current foundation

- React, TypeScript, Vite, and responsive workspace UI
- Express API with health endpoint and AI-generation endpoint
- Server-side Google Gemini API support (recommended for initial testing) and optional Anthropic support
- Basic request size limits, rate limiting, and security headers
- Browser-local storage for generated project drafts and ZIP export

## Run locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add your provider key.
3. Start frontend and backend: `npm run dev`
4. Open the Vite address shown in the terminal (usually `http://localhost:5173`).

The frontend proxies `/api` requests to Express on port 3001 during local development.

## Deploy on Vercel

1. First revoke any API key that was pasted into a chat or committed publicly, then create a replacement.
2. Open Vercel and import `leephil1907-lab/masteraibuild` from GitHub.
3. Keep the build command as `npm run build` and output directory as `dist`.
4. In Project Settings → Environment Variables, add `AI_PROVIDER=gemini` and `GEMINI_API_KEY` with your new secret key. Add them to Production and Preview as needed.
5. Deploy or redeploy after adding the environment variables.

Vercel serves the Vite build as static output and routes API requests through `api/[...path].js`. The API key stays server-side. See the official Vercel documentation for environment variables and Express deployments.

## Environment variables

- `AI_PROVIDER`: `gemini` or `anthropic`; if omitted, the server selects based on configured keys.
- `GEMINI_API_KEY`: server-only Google AI Studio key; never use a `VITE_` prefix or commit it.
- `GEMINI_MODEL`: optional Gemini model override; defaults to `gemini-2.5-flash`.
- `ANTHROPIC_API_KEY`: optional server-only alternative provider key.
- `ANTHROPIC_MODEL`: optional Anthropic model override.
- `CORS_ORIGIN`: optional comma-separated allowed origins for the API.
- `PORT`: local Express server port.

## Honest status / next milestones

The repository is an early scaffold. Account authentication, a database, durable cloud project storage, isolated build-and-preview, secure code execution, GitHub export, and automated deployment are not yet implemented. Generated files are saved to browser local storage on the device that created them. The ZIP export and Vercel deployment have not been verified yet. Treat generated code as unreviewed until tested.
