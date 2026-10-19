import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

const app = express();
const port = Number(process.env.PORT || 3001);
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(v => v.trim()) : true }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'masterstudio-ai-api', version: '0.1.0', aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.post('/api/generate', async (req, res) => {
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  if (!prompt) return res.status(400).json({ error: 'Add a project description first.' });
  if (prompt.length > 6000) return res.status(413).json({ error: 'Description must be 6,000 characters or fewer.' });
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'AI generation is not configured. Add ANTHROPIC_API_KEY to the server environment.' });
  }
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
        max_tokens: 4500,
        system: 'You are a web app generator. Return only valid JSON matching {"name":"short name","summary":"short summary","files":[{"path":"src/App.tsx","content":"complete file content"}]}. Generate a small responsive React + TypeScript website starter. Return at most 5 text files. Do not include package files, server files, secrets, or shell scripts.',
        messages: [{ role: 'user', content: 'Build a first website implementation for this brief. Make it responsive, accessible and visually polished.\n\n' + prompt }]
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('AI provider returned status', response.status);
      return res.status(502).json({ error: 'The AI provider could not complete the request. Check server configuration and try again.' });
    }
    const output = data.content?.find(item => item.type === 'text')?.text;
    if (!output) return res.status(502).json({ error: 'The AI provider returned an empty response.' });
    let project;
    try { project = JSON.parse(output); } catch { return res.status(502).json({ error: 'The AI response was not valid project JSON. Please retry.' }); }
    if (typeof project.name !== 'string' || !Array.isArray(project.files) || project.files.length > 5) {
      return res.status(502).json({ error: 'The AI response did not match the project format.' });
    }
    const files = project.files.filter(file => file && typeof file.path === 'string' && typeof file.content === 'string' &&
      file.path.length < 120 && !file.path.startsWith('/') && !file.path.split('/').includes('..') &&
      !/^(package\.json|.*\.(env|sh|bat|exe))$/i.test(file.path))
      .map(file => ({ path: file.path, content: file.content.slice(0, 30000) }));
    if (!files.length) return res.status(502).json({ error: 'No valid project files were returned. Please retry.' });
    return res.json({ name: project.name.slice(0, 80), summary: typeof project.summary === 'string' ? project.summary.slice(0, 500) : '', files });
  } catch (error) {
    console.error('Generation failed:', error instanceof Error ? error.message : 'unknown error');
    return res.status(500).json({ error: 'Could not reach the AI provider. Please try again.' });
  }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

if (process.env.NODE_ENV === 'production') {
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const root = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.resolve(root, '../dist')));
  app.get('*', (_req, res) => res.sendFile(path.resolve(root, '../dist/index.html')));
}

app.listen(port, '0.0.0.0', () => console.log('MasterStudio AI API listening on port ' + port));
