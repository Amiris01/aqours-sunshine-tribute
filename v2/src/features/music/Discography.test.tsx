import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Discography } from './Discography'
import { usePlayer } from '../../store/player'
import { useLang } from '../../store/lang'
import { releases } from '../../content/discography'

beforeEach(() => {
  useLang.getState().setLang('en')
  usePlayer.getState().close()
  usePlayer.setState({ engineFailed: false })
})

const row = (i: number) => screen.getByRole('button', { name: new RegExp(`^M0${i + 1} `) })

it('lists every release as a numbered setlist row, first one open', () => {
  render(<Discography />)
  expect(screen.getAllByRole('button', { name: /^M0\d / })).toHaveLength(releases.length)
  expect(row(0)).toHaveAttribute('aria-expanded', 'true')
  expect(row(1)).toHaveAttribute('aria-expanded', 'false')
  expect(screen.getByTestId('release-blurb')).toHaveTextContent(releases[0]!.blurb.en)
})

it('opens a row on click and shows its blurb', async () => {
  render(<Discography />)
  const cruller = releases.findIndex((r) => r.id === 'kurukuru-cruller')
  await userEvent.click(row(cruller))
  expect(row(cruller)).toHaveAttribute('aria-expanded', 'true')
  expect(row(0)).toHaveAttribute('aria-expanded', 'false')
  expect(screen.getByTestId('release-blurb')).toHaveTextContent('Monster Strike')
})

it('moves through the setlist with arrow keys', async () => {
  const user = userEvent.setup()
  render(<Discography />)
  row(0).focus()
  await user.keyboard('{ArrowDown}')
  expect(row(1)).toHaveFocus()
  expect(row(1)).toHaveAttribute('aria-expanded', 'true')
  await user.keyboard('{ArrowUp}{ArrowUp}')
  expect(row(releases.length - 1)).toHaveFocus()
})

it('plays the open release and marks its row on air', async () => {
  render(<Discography />)
  const last = releases.length - 1
  await userEvent.click(row(last))
  await userEvent.click(screen.getByRole('button', { name: `Play ${releases[last]!.title}` }))
  expect(usePlayer.getState().index).toBe(last)
  usePlayer.getState().report({ position: 3, duration: 90, paused: false, buffering: false })
  expect(await within(row(last)).findByText('On air')).toBeInTheDocument()
})

it('re-shows the player fallback when Play is pressed on the current release after a failure', async () => {
  render(<Discography />)
  usePlayer.getState().playAt(0)
  usePlayer.getState().fail()
  usePlayer.getState().setMinimized(true)
  await userEvent.click(screen.getByRole('button', { name: `Play ${releases[0]!.title}` }))
  expect(usePlayer.getState()).toMatchObject({ index: 0, status: 'error', minimized: false })
})

it('shows a cover thumbnail on every row and an equaliser on the on-air row', async () => {
  render(<Discography />)
  for (let i = 0; i < releases.length; i++) expect(row(i).querySelector('img')).not.toBeNull()
  expect(screen.queryByTestId('eq')).not.toBeInTheDocument()
  usePlayer.getState().playAt(1)
  expect(await within(row(1)).findByTestId('eq')).toBeInTheDocument()
})

it('collapses the previously open row when another opens', async () => {
  const { waitFor } = await import('@testing-library/react')
  render(<Discography />)
  await userEvent.click(row(2))
  await waitFor(() => expect(screen.getAllByTestId('release-blurb')).toHaveLength(1))
  expect(screen.getByTestId('release-blurb')).toHaveTextContent(releases[2]!.blurb.en)
})
