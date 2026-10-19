import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
if (process.env.CORS_ORIGIN) app.use(cors({ origin: process.env.CORS_ORIGIN.split(',').map(v => v.trim()) }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: true, legacyHeaders: false }));

const aiProvider = (process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'none')).toLowerCase();
const aiConfigured = (aiProvider === 'gemini' && Boolean(process.env.GEMINI_API_KEY)) ||
  (aiProvider === 'anthropic' && Boolean(process.env.ANTHROPIC_API_KEY));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'masterstudio-ai-api', version: '0.2.0', aiConfigured, aiProvider: aiConfigured ? aiProvider : 'none' });
});

const systemPrompt = 'You are a web app generator. Return only valid JSON matching {"name":"short name","summary":"short summary","files":[{"path":"src/App.tsx","content":"complete file content"}]}. Generate a small responsive React + TypeScript website starter. Return at most 5 text files. Do not include package files, server files, secrets, or shell scripts.';

async function generateWithGemini(prompt) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: 'Build a first website implementation for this brief. Make it responsive, accessible and visually polished.\\n\\n' + prompt }] }],
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 4500, temperature: 0.3 }
    })
  });
  const data = await response.json();
  if (!response.ok) {
    console.error('Gemini provider returned status', response.status);
    throw new Error('provider_error');
  }
  const output = data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
  if (!output) throw new Error('empty_response');
  return output;
}

async function generateWithAnthropic(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
      max_tokens: 4500,
      system: systemPrompt,
      messages: [{ role: 'user', content: 'Build a first website implementation for this brief. Make it responsive, accessible and visually polished.\\n\\n' + prompt }]
    })
  });
  const data = await response.json();
  if (!response.ok) {
    console.error('Anthropic provider returned status', response.status);
    throw new Error('provider_error');
  }
  const output = data.content?.find(item => item.type === 'text')?.text;
  if (!output) throw new Error('empty_response');
  return output;
}

app.post('/api/generate', async (req, res) => {
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  if (!prompt) return res.status(400).json({ error: 'Add a project description first.' });
  if (prompt.length > 6000) return res.status(413).json({ error: 'Description must be 6,000 characters or fewer.' });
  if (!aiConfigured) {
    return res.status(503).json({ error: 'AI generation is not configured. Add GEMINI_API_KEY in the server environment, or configure another supported provider.' });
  }
  try {
    const output = aiProvider === 'gemini' ? await generateWithGemini(prompt) : await generateWithAnthropic(prompt);
    let project;
    try { project = JSON.parse(output.replace(/^```(?:json)?\\s*/i, '').replace(/\\s*```$/, '')); }
    catch { return res.status(502).json({ error: 'The AI response was not valid project JSON. Please retry.' }); }
    if (typeof project.name !== 'string' || !Array.isArray(project.files) || project.files.length > 5) {
      return res.status(502).json({ error: 'The AI response did not match the project format.' });
    }
    const files = project.files.filter(file => file && typeof file.path === 'string' && typeof file.content === 'string' &&
      file.path.length < 120 && !file.path.startsWith('/') && !file.path.split('/').includes('..') &&
      !/^(package\\.json|.*\\.(env|sh|bat|exe))$/i.test(file.path))
      .map(file => ({ path: file.path, content: file.content.slice(0, 30000) }));
    if (!files.length) return res.status(502).json({ error: 'No valid project files were returned. Please retry.' });
    return res.json({ name: project.name.slice(0, 80), summary: typeof project.summary === 'string' ? project.summary.slice(0, 500) : '', files });
  } catch (error) {
    console.error('Generation failed:', error instanceof Error ? error.message : 'unknown error');
    return res.status(502).json({ error: 'Could not complete the AI request. Check the provider key, model, and usage limits, then try again.' });
  }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

export default app;
