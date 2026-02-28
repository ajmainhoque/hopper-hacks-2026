import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const snowflakeUrl = env.VITE_SNOWFLAKE_ACCOUNT_URL || 'https://VWOAMKM-IBC49184.snowflakecomputing.com';

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            'codemirror-core': ['@uiw/react-codemirror'],
            'codemirror-langs': [
              '@codemirror/lang-cpp',
              '@codemirror/lang-java',
              '@codemirror/lang-javascript',
              '@codemirror/lang-python',
            ],
          },
        },
      },
      chunkSizeWarningLimit: 500,
    },
    server: {
      proxy: {
        '/api/snowflake': {
          target: snowflakeUrl,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/snowflake/, ''),
          secure: true,
        },
        '/api/piston': {
          target: env.PISTON_URL || 'https://emkc.org',
          changeOrigin: true,
          rewrite: (path: string) => {
            const pistonUrl = env.PISTON_URL || 'https://emkc.org';
            if (pistonUrl.includes('emkc.org')) {
              return path.replace(/^\/api\/piston/, '/api/v2/piston');
            }
            return path.replace(/^\/api\/piston/, '/api/v2');
          },
          secure: (env.PISTON_URL || 'https://emkc.org').startsWith('https'),
        },
      },
    },
  };
})
