// Resolve a path under public/ against Vite's `base` ('/aqours-sunshine-tribute/v2/').
// Hardcoded '/assets/...' would 404 once deployed under the subpath.
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\/+/, '')
}
