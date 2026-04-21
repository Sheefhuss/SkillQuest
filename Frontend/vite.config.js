import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { fileURLToPath } from "url"
import path from "path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  Object.assign(process.env, env)

  return {
    logLevel: 'info', 
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL, 
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})