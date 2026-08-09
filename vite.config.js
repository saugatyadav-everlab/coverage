import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Everlab design system lives in `public/ds` and is loaded at runtime as a
// browser global (see src/ds/loadDs.js). Keeping it out of the module graph
// means Vite never has to parse the 4MB IIFE, and the DS ships as a separate
// long-cached asset instead of being inlined into the app chunk.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: { outDir: 'dist', sourcemap: true },
})
