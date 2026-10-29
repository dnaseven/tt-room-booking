import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const fromSrc = (dir: string) => fileURLToPath(new URL(`./src/${dir}`, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@client': fromSrc('client'),
      '@server': fromSrc('server'),
      '@domain': fromSrc('domain'),
    },
  },
})
