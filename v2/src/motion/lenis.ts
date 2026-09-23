import type Lenis from 'lenis'

let instance: Lenis | null = null
export const getLenis = () => instance
export const setLenis = (l: Lenis | null) => {
  instance = l
}
