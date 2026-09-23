/** Live check of the OS/browser reduced-motion setting (not cached, unlike Motion's hook). */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
