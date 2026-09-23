// One motion system for the whole page: a single ease-out curve and three durations.
// CSS transitions use the same values via --ease-smooth / --default-transition-* in index.css.
export const EASE = [0.22, 1, 0.36, 1] as const
export const DUR = { quick: 0.18, base: 0.32, slow: 0.6 } as const

/** easeOutExpo, for long scroll glides. */
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t))
