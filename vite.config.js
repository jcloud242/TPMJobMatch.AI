import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendPort = env.PORT || '3001'
  const backendUrl = env.BACKEND_URL || `http://localhost:${backendPort}`

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/analyze': backendUrl,
        '/health': backendUrl,
      },
    },
  }
})
