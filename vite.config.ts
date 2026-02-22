import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const snowflakeUrl = env.VITE_SNOWFLAKE_ACCOUNT_URL || 'https://VWOAMKM-IBC49184.snowflakecomputing.com';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/snowflake': {
          target: snowflakeUrl,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/snowflake/, ''),
          secure: true,
        },
        '/api/piston': {
          target: 'https://emkc.org',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/piston/, '/api/v2/piston'),
          secure: true,
        },
      },
    },
  };
})
