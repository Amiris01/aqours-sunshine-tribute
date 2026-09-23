// Night sky + moon; always rendered beneath the (transparent) 3D canvas.
// `sea` draws a static horizon + moon path for reduced motion / no WebGL / context loss.
export function HeroFallback({ sea = true }: { sea?: boolean }) {
  return (
    <div data-testid="hero-fallback" className="absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#030814_0%,#071a31_40%,#0f3a5c_57%,#07111f_100%)]" />
      <div className="absolute left-1/2 top-[2%] grid size-[26rem] -translate-x-1/2 place-items-center rounded-full bg-[radial-gradient(circle,rgba(191,233,255,0.28)_0%,rgba(191,233,255,0.08)_35%,transparent_70%)]">
        <div className="size-24 rounded-full bg-[radial-gradient(circle_at_40%_35%,#ffffff_0%,#eaf7ff_55%,#cfe9f7_100%)] shadow-[0_0_60px_18px_rgba(214,241,255,0.45)] md:size-28" />
      </div>
      {sea && (
        <>
          <div className="absolute inset-x-0 top-[57%] bottom-0 bg-[linear-gradient(180deg,#0f3a5c_0%,#071a31_40%,#07111f_100%)]" />
          <div className="absolute inset-x-0 top-[57%] h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="absolute left-1/2 top-[57%] h-[43%] w-24 -translate-x-1/2 bg-gradient-to-b from-[#d6f1ff]/45 to-transparent blur-xl" />
        </>
      )}
    </div>
  )
}
