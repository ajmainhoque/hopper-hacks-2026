import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

const SNOWFLAKE_URL =
  process.env.VITE_SNOWFLAKE_ACCOUNT_URL ||
  'https://VWOAMKM-IBC49184.snowflakecomputing.com';

// Piston API URL — set PISTON_URL to your self-hosted Droplet, e.g. http://<DROPLET_IP>:2000
const PISTON_URL = process.env.PISTON_URL || 'https://emkc.org';
const PISTON_API_BASE = PISTON_URL.includes('emkc.org')
  ? PISTON_URL + '/api/v2/piston'
  : PISTON_URL + '/api/v2';

// Proxy /api/snowflake → Snowflake Cortex
app.use(createProxyMiddleware({
  pathFilter: '/api/snowflake',
  target: SNOWFLAKE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/snowflake': '' },
  secure: true,
}));

// Proxy /api/piston → Piston code execution API
app.all('/api/piston/*', async (req, res) => {
  const subPath = req.path.replace(/^\/api\/piston/, '');
  const targetUrl = PISTON_API_BASE + subPath;

  try {
    const headers = { 'Content-Type': 'application/json' };
    const opts = { method: req.method, headers };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      opts.body = Buffer.concat(chunks);
    }

    const upstream = await fetch(targetUrl, opts);
    res.status(upstream.status);
    const body = await upstream.text();
    res.set('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.send(body);
  } catch (err) {
    res.status(502).json({ message: `Piston proxy error: ${err.message}` });
  }
});

// Serve static build output
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback — send index.html for all non-file routes
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
