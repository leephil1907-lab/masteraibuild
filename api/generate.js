import app from '../server/index.js';

// Keep the AI endpoint explicit on Vercel and normalize the path before
// forwarding the request to the shared Express application.
export default function generateHandler(req, res) {
  req.url = '/api/generate';
  return app(req, res);
}
