import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Members } from './Members'
import { useLang } from '../../store/lang'

beforeEach(() => useLang.getState().setLang('en'))

it('renders nine member cards in display order', () => {
  render(<Members />)
  const cards = screen.getAllByRole('button', { name: /^Open / })
  expect(cards).toHaveLength(9)
  expect(cards[0]).toHaveAccessibleName('Open Chika Takami')
  expect(cards[1]).toHaveAccessibleName('Open You Watanabe')
})

it('opens a member, shows verified profile, navigates, and returns focus on close', async () => {
  const user = userEvent.setup()
  render(<Members />)
  await user.click(screen.getByRole('button', { name: 'Open Chika Takami' }))
  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByRole('heading', { name: 'Chika Takami' })).toBeInTheDocument()
  expect(dialog).toHaveTextContent('August 1')
  expect(dialog).toHaveTextContent('157 cm')

  await user.keyboard('{ArrowRight}')
  expect(within(screen.getByRole('dialog')).getByRole('heading', { name: 'You Watanabe' })).toBeInTheDocument()
  expect(screen.getByRole('dialog')).toHaveTextContent('AB')

  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  await waitFor(() => expect(screen.getByRole('button', { name: 'Open You Watanabe' })).toHaveFocus())
})

it('switches language while open without closing', async () => {
  render(<Members />)
  await userEvent.click(screen.getByRole('button', { name: 'Open Chika Takami' }))
  const dialog = await screen.findByRole('dialog')
  expect(dialog).toHaveTextContent('Birthday')
  act(() => useLang.getState().setLang('ja'))
  expect(screen.getByRole('dialog')).toHaveTextContent('誕生日')
  expect(screen.getByRole('dialog')).toHaveTextContent('8月1日')
  expect(within(screen.getByRole('dialog')).getByRole('heading', { name: 'Chika Takami' })).toBeInTheDocument()
})

it('lets the member view scroll itself instead of the page behind (Lenis)', async () => {
  render(<Members />)
  await userEvent.click(screen.getByRole('button', { name: 'Open Chika Takami' }))
  expect(await screen.findByRole('dialog')).toHaveAttribute('data-lenis-prevent')
})

it('closes when clicking the backdrop outside the content', async () => {
  render(<Members />)
  await userEvent.click(screen.getByRole('button', { name: 'Open Chika Takami' }))
  await screen.findByRole('dialog')
  await userEvent.click(screen.getByTestId('member-backdrop'))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})
