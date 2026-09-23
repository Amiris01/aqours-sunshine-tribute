import { asset } from './asset'

describe('asset', () => {
  it('prefixes the Vite base and strips leading slashes', () => {
    const base = import.meta.env.BASE_URL
    expect(base.endsWith('/')).toBe(true)
    expect(asset('/assets/logo/aqours-logo.png')).toBe(`${base}assets/logo/aqours-logo.png`)
    expect(asset('assets/logo/aqours-logo.png')).toBe(`${base}assets/logo/aqours-logo.png`)
  })
})
