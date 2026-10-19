# MasterStudio AI

MasterStudio AI is a workspace for turning natural-language instructions into real, editable web projects. The initial milestone is a functional AI website-builder MVP; agent studio, templates, marketplace, and one-click deployment are later milestones.

## Product principles

- Build a multi-page application, not a static landing page.
- Prioritize working project creation, file editing, preview, and export over decorative UI.
- Keep model API keys on the server; never expose secrets in browser code or commit them to Git.
- Clearly distinguish implemented features from planned integrations.
- Validate generated code in an isolated environment before enabling execution or preview.

## Planned stack

- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL (introduced with authentication and persistence)
- AI: provider adapter on the server, configured with environment variables
- Deployment: Render for the API and Vercel or Render for the frontend

## MVP milestones

1. Establish the app shell, responsive dashboard, and project workspace.
2. Add project CRUD and persistent storage.
3. Add secure server-side AI generation and iterative edit requests.
4. Add file tree, code editor, preview sandbox, and ZIP export.
5. Add authentication, GitHub integration, and deployment workflows.

## Local development

Setup instructions will be added as the application scaffold lands. Never commit `.env` files or API keys. Use `.env.example` for variable names only.

## Status

Repository initialized. Features should be marked complete only after they are implemented and tested.
