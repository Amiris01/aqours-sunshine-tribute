import { useId } from 'react'

/**
 * A Love Live! Blade–style penlight: frosted translucent blade with a bright LED
 * core and rounded tip, a metal collar, then a dark ribbed handle with the colour
 * button and a wrist strap. Glow strength comes from CSS vars (--glow-near, --glow-far,
 * --core) so a parent can brighten it on hover/focus without re-rendering.
 */
export function Blade({ color, className = '' }: { color: string; className?: string }) {
  const id = useId()
  const halo = `drop-shadow(0 0 var(--glow-near, 9px) ${color}) drop-shadow(0 0 var(--glow-far, 14px) ${color})`
  return (
    <svg
      data-testid="blade"
      viewBox="0 0 28 150"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Frosted tube: brighter along the centre line, like light through acrylic. */}
        <linearGradient id={`${id}-tube`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={color} stopOpacity="0.55" />
          <stop offset="0.5" stopColor={color} stopOpacity="0.95" />
          <stop offset="1" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${id}-grip`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#0c1016" />
          <stop offset="0.45" stopColor="#2a313d" />
          <stop offset="1" stopColor="#0c1016" />
        </linearGradient>
      </defs>
      <g style={{ filter: halo }}>
        <rect x="6" y="2" width="16" height="94" rx="8" fill={`url(#${id}-tube)`} />
        {/* LED core */}
        <rect x="11.5" y="8" width="5" height="84" rx="2.5" fill="#ffffff" style={{ opacity: 'var(--core, 0.6)' }} />
      </g>
      {/* Collar */}
      <rect x="5" y="95" width="18" height="6" rx="1.5" fill="#8b95a5" />
      <g data-testid="blade-handle">
        <rect x="6" y="101" width="16" height="38" rx="3" fill={`url(#${id}-grip)`} />
        {[108, 112, 116, 120, 124, 128].map((y) => (
          <line key={y} x1="7.5" x2="20.5" y1={y} y2={y} stroke="#05070b" strokeWidth="1" opacity="0.7" />
        ))}
        {/* Colour-switch button */}
        <circle cx="14" cy="104.5" r="2.2" fill={color} opacity="0.9" />
        {/* Wrist strap */}
        <path d="M11 139 q3 11 6 0" fill="none" stroke="#2a313d" strokeWidth="1.6" />
      </g>
    </svg>
  )
}
