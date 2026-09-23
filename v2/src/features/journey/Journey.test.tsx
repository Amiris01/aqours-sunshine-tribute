import { act, render, screen } from '@testing-library/react'
import { Journey } from './Journey'
import { timeline } from '../../content/timeline'
import { useLang } from '../../store/lang'

it('lists every milestone with a dot-matrix date, in the current language', () => {
  useLang.getState().setLang('en')
  render(<Journey />)
  const items = screen.getAllByRole('listitem')
  expect(items).toHaveLength(timeline.length)
  expect(items[0]).toHaveTextContent('2015.04')
  expect(items.at(-1)).toHaveTextContent('2025.06')
  expect(items.at(-1)).toHaveTextContent('Belluna Dome')
  act(() => useLang.getState().setLang('ja'))
  expect(screen.getAllByRole('listitem').at(-1)).toHaveTextContent('ベルーナドーム')
})
