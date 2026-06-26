// Resolve a path under public/ to a URL that respects Vite's configured `base`.
// In dev `base` is '/', in the GitHub Pages build it's '/aqours-sunshine-tribute/',
// so hardcoding '/assets/...' would 404 in production. Always route public asset
// paths through this helper.
//
// Pass a path relative to public/, with or without a leading slash:
//   asset('assets/logo/aqours-logo.png')  ->  '/aqours-sunshine-tribute/assets/logo/aqours-logo.png'
export function asset(path) {
  if (!path) return path
  const base = import.meta.env.BASE_URL // always has a trailing slash
  return base + String(path).replace(/^\/+/, '')
}
