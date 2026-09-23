import { act, render, screen } from '@testing-library/react'
import { Journey } from './Journey'
import { timeline } from '../../content/timeline'
import { useLang } from '../../store/lang'

it('groups milestones by year and marks the big live moments', () => {
  useLang.getState().setLang('en')
  render(<Journey />)
  const years = [...new Set(timeline.map((m) => m.date.slice(0, 4)))]
  expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(years)
  const items = screen.getAllByRole('listitem')
  expect(items).toHaveLength(timeline.length)
  const live = items.filter((li) => li.dataset.live === 'true').map((li) => li.textContent)
  expect(live).toHaveLength(4)
  expect(live.join(' ')).toMatch(/Tokyo Dome/)
  expect(live.join(' ')).toMatch(/Belluna Dome/)
  act(() => useLang.getState().setLang('ja'))
  expect(screen.getAllByRole('listitem').at(-1)).toHaveTextContent('ベルーナドーム')
})
