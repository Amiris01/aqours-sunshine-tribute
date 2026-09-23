import { contrast, onColor } from './color'
import { members } from '../content/members'

it('picks the text colour with the higher contrast on each member colour', () => {
  for (const m of members) {
    const fg = onColor(m.color)
    const other = fg === '#ffffff' ? '#07111f' : '#ffffff'
    expect(contrast(fg, m.color)).toBeGreaterThanOrEqual(contrast(other, m.color))
    expect(contrast(fg, m.color), m.slug).toBeGreaterThanOrEqual(3)
  }
})

it('computes WCAG contrast', () => {
  expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 0)
  expect(contrast('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
})
