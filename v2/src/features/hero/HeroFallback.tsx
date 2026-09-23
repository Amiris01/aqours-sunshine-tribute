// Static night-sea backdrop; always rendered under the canvas and alone under
// reduced motion / no WebGL / context loss.
export function HeroFallback() {
  return (
    <div data-testid="hero-fallback" className="absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#040b17_0%,#0a1f38_55%,#0f3a5c_75%,#06101f_100%)]" />
      <div className="absolute left-1/2 top-[18%] size-40 -translate-x-1/2 rounded-full bg-[#e6f6ff] opacity-90 blur-[2px] shadow-[0_0_120px_40px_rgba(191,233,255,0.35)]" />
      <div className="absolute inset-x-0 top-[62%] h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="absolute left-1/2 top-[62%] h-[38%] w-24 -translate-x-1/2 bg-gradient-to-b from-[#bfe9ff]/40 to-transparent blur-xl" />
    </div>
  )
}
