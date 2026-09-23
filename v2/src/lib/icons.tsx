// Small stroke/fill icons for player and dialog controls (replacing emoji glyphs,
// which render inconsistently across platforms and fonts).
import type { SVGProps } from 'react'

const base = { width: 18, height: 18, viewBox: '0 0 24 24', 'aria-hidden': true, focusable: false } as const

export const PlayIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M7 4.5v15l13-7.5z" fill="currentColor" /></svg>
)
export const PauseIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z" fill="currentColor" /></svg>
)
export const PrevIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M6 5h2.5v14H6zM20 5v14L9 12z" fill="currentColor" /></svg>
)
export const NextIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M15.5 5H18v14h-2.5zM4 5v14l11-7z" fill="currentColor" /></svg>
)
export const CloseIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" /></svg>
)
export const MinimizeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
)
export const ArrowIcon = ({ dir = 'right', ...p }: SVGProps<SVGSVGElement> & { dir?: 'left' | 'right' }) => (
  <svg {...base} {...p} style={{ transform: dir === 'left' ? 'scaleX(-1)' : undefined }}>
    <path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)
