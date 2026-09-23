import { fmtTime, formatBirthday } from './format'

it('formats seconds as m:ss', () => {
  expect(fmtTime(0)).toBe('0:00')
  expect(fmtTime(65.9)).toBe('1:05')
  expect(fmtTime(Number.NaN)).toBe('0:00')
  expect(fmtTime(-3)).toBe('0:00')
})

it('formats birthdays per language', () => {
  expect(formatBirthday({ month: 8, day: 1 }, 'en')).toBe('August 1')
  expect(formatBirthday({ month: 8, day: 1 }, 'ja')).toBe('8月1日')
})
