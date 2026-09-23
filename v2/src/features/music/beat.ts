/**
 * Where we are in the beat, from the song's tempo and the playback position.
 * `pulse` is 1 exactly on a beat and decays quickly before the next one;
 * `downbeat` marks the first beat of each group of four.
 */
export function beatPulse(positionS: number, bpm: number, offsetS = 0) {
  const t = positionS - offsetS
  if (t < 0 || bpm <= 0) return { pulse: 0, downbeat: false, beat: -1 }
  const beats = (t * bpm) / 60
  const beat = Math.floor(beats + 1e-6)
  const frac = beats - beat
  return { pulse: Math.exp(-frac * 7), downbeat: beat % 4 === 0, beat }
}
