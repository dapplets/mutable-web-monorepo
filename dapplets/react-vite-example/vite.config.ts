import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      NODE_ENV: 'production',
    },
  },
  build: {
    minify: false,
    target: 'es2024',
    lib: {
      entry: resolve(__dirname, 'lib/index.tsx'),
      fileName: 'main',
      formats: ['es'],
      cssFileName: 'main',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', '@mweb/engine'],
    },
  },
})
