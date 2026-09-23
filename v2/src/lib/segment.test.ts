import { segmentWords } from './segment'

it('splits English and Japanese losslessly', () => {
  const en = 'Nine girls, one shining sea.'
  const ja = '9人の少女、ひとつの輝く海。'
  expect(segmentWords(en, 'en').join('')).toBe(en)
  expect(segmentWords(ja, 'ja').join('')).toBe(ja)
  expect(segmentWords(en, 'en').length).toBeGreaterThan(5)
  expect(segmentWords(ja, 'ja').length).toBeGreaterThan(3)
})
