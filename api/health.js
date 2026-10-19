import app from '../server/index.js';

// Vercel may pass a function-relative URL. Normalize it so Express routes
// behave identically in local development and production.
export default function healthHandler(req, res) {
  req.url = '/api/health';
  return app(req, res);
}
