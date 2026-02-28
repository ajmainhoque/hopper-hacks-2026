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
const pistonRewrite = PISTON_URL.includes('emkc.org')
  ? { '^/api/piston': '/api/v2/piston' }
  : { '^/api/piston': '/api/v2' };

// Proxy /api/snowflake → Snowflake Cortex
app.use(
  '/api/snowflake',
  createProxyMiddleware({
    target: SNOWFLAKE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/snowflake': '' },
    secure: true,
  }),
);

// Proxy /api/piston → Piston code execution API
app.use(
  '/api/piston',
  createProxyMiddleware({
    target: PISTON_URL,
    changeOrigin: true,
    pathRewrite: pistonRewrite,
    secure: PISTON_URL.startsWith('https'),
  }),
);

// Serve static build output
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback — send index.html for all non-file routes
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
