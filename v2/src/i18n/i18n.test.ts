import { en } from './en'
import { ja } from './ja'
import { format } from './index'

it('has identical key sets in EN and JA with no empty strings', () => {
  expect(Object.keys(ja).sort()).toEqual(Object.keys(en).sort())
  for (const v of [...Object.values(en), ...Object.values(ja)]) expect(v.trim()).not.toBe('')
})

it('interpolates variables', () => {
  expect(format('Open {name}', { name: 'Chika' })).toBe('Open Chika')
  expect(format('No vars')).toBe('No vars')
})
