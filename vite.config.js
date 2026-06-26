import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'

// Vite copies all of public/ into dist/. We keep raw, unedited assets in
// public/assets/_sources/ (and pristine banner backups in banner/_orig/) for
// reference only — strip them from the build so they don't bloat production.
function stripSources() {
  const dirs = ['dist/assets/_sources', 'dist/assets/banner/_orig']
  return {
    name: 'strip-asset-sources',
    apply: 'build',
    async closeBundle() {
      for (const d of dirs) {
        await rm(resolve(__dirname, d), { recursive: true, force: true })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/aqours-sunshine-tribute/, so assets
  // must resolve under that subpath. Use '/' for a custom domain or a
  // <user>.github.io root repo.
  base: '/aqours-sunshine-tribute/',
  plugins: [react(), stripSources()],
})
