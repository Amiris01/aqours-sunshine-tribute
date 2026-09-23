import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Discography } from './Discography'
import { usePlayer } from '../../store/player'
import { useLang } from '../../store/lang'
import { releases } from '../../content/discography'

beforeEach(() => {
  useLang.getState().setLang('en')
  usePlayer.getState().close()
})

const detailTitle = () => screen.getByRole('heading', { level: 3 })

it('starts on the first release and jumps by year', async () => {
  render(<Discography />)
  expect(detailTitle()).toHaveTextContent(releases[0]!.title)
  await userEvent.click(screen.getByRole('button', { name: '2021' }))
  expect(detailTitle()).toHaveTextContent('KU-RU-KU-RU Cruller!')
  expect(screen.getByRole('button', { name: '2021' })).toHaveAttribute('aria-pressed', 'true')
})

it('moves through the shelf with arrow keys', async () => {
  const user = userEvent.setup()
  render(<Discography />)
  const first = screen.getByRole('button', { name: `${releases[0]!.title} (${releases[0]!.year})` })
  first.focus()
  await user.keyboard('{ArrowRight}')
  expect(detailTitle()).toHaveTextContent(releases[1]!.title)
  expect(screen.getByRole('button', { name: `${releases[1]!.title} (${releases[1]!.year})` })).toHaveFocus()
  await user.keyboard('{ArrowLeft}{ArrowLeft}')
  expect(detailTitle()).toHaveTextContent(releases.at(-1)!.title)
})

it('plays the selected release', async () => {
  render(<Discography />)
  await userEvent.click(screen.getByRole('button', { name: '2024' }))
  await userEvent.click(screen.getByRole('button', { name: 'Play' }))
  expect(usePlayer.getState().index).toBe(releases.findIndex((r) => r.year === 2024))
})

it('re-shows the player fallback when Play is pressed on the current release after a failure', async () => {
  render(<Discography />)
  usePlayer.getState().playAt(0)
  usePlayer.getState().fail()
  usePlayer.getState().setMinimized(true)
  await userEvent.click(screen.getByRole('button', { name: 'Play' }))
  expect(usePlayer.getState()).toMatchObject({ index: 0, status: 'error', minimized: false })
})

it('shows the verified blurb for the selected release in the current language', async () => {
  render(<Discography />)
  expect(screen.getByTestId('release-blurb')).toHaveTextContent(releases[0]!.blurb.en)
  await userEvent.click(screen.getByRole('button', { name: '2024' }))
  expect(screen.getByTestId('release-blurb')).toHaveTextContent('Oricon')
})

it('respects reduced motion: no smooth shelf scroll and the vinyl spin is motion-safe only', async () => {
  const original = window.matchMedia
  window.matchMedia = ((q: string) => ({ ...original(q), matches: q.includes('reduce') })) as typeof window.matchMedia
  try {
    render(<Discography />)
    const scroll = vi.mocked(Element.prototype.scrollIntoView)
    scroll.mockClear()
    await userEvent.click(screen.getByRole('button', { name: '2021' }))
    expect(scroll).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'auto' }))
    expect(screen.getByTestId('vinyl').className).not.toMatch(/(^|\s)animate-spin-slow/)
  } finally {
    window.matchMedia = original
  }
})
