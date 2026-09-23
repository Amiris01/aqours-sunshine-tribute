import { render, screen } from '@testing-library/react'
import { Visualizer } from './Visualizer'

const viz = () => screen.getByTestId('visualizer')

it('animates while playing, in the song colour, hidden from assistive tech', () => {
  render(<Visualizer color="#FF9547" status="playing" seed="kimi" progress={0.2} />)
  expect(viz()).toHaveAttribute('data-state', 'playing')
  expect(viz()).toHaveAttribute('data-color', '#FF9547')
  expect(viz()).toHaveAttribute('aria-hidden', 'true')
})

it('rests when paused and sweeps while loading', () => {
  const { rerender } = render(<Visualizer color="#FF9547" status="paused" seed="kimi" progress={0.2} />)
  expect(viz()).toHaveAttribute('data-state', 'resting')
  rerender(<Visualizer color="#FF9547" status="loading" seed="kimi" progress={0} />)
  expect(viz()).toHaveAttribute('data-state', 'loading')
  rerender(<Visualizer color="#FF9547" status="error" seed="kimi" progress={0} />)
  expect(viz()).toHaveAttribute('data-state', 'resting')
})

it('stays static under reduced motion', () => {
  const original = window.matchMedia
  window.matchMedia = ((q: string) => ({ ...original(q), matches: q.includes('reduce') })) as typeof window.matchMedia
  try {
    render(<Visualizer color="#FF9547" status="playing" seed="kimi" progress={0.2} />)
    expect(viz()).toHaveAttribute('data-state', 'static')
  } finally {
    window.matchMedia = original
  }
})

it('draws the real spectrum when live audio is connected, else a synthesized one', () => {
  const { rerender } = render(<Visualizer color="#FF9547" status="playing" seed="kimi" progress={0.2} bpm={182} position={10} />)
  expect(viz()).toHaveAttribute('data-mode', 'beat')
  rerender(<Visualizer color="#FF9547" status="playing" seed="cruller" progress={0.2} position={10} />)
  expect(viz()).toHaveAttribute('data-mode', 'wave')
  const analyser = {
    fftSize: 2048,
    frequencyBinCount: 1024,
    context: { sampleRate: 48000 },
    getByteFrequencyData: () => {},
  } as unknown as AnalyserNode
  rerender(<Visualizer color="#FF9547" status="playing" seed="kimi" progress={0.2} bpm={182} position={10} analyser={analyser} />)
  expect(viz()).toHaveAttribute('data-mode', 'live')
})
