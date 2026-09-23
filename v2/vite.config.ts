import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// V2 is served beside V1 at https://amiris01.github.io/aqours-sunshine-tribute/v2/
export default defineConfig({
  base: '/aqours-sunshine-tribute/v2/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
