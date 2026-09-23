import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { members, memberAssetPath } from './members'
import { subunits } from './subunits'
import { releases, spotifyUri, spotifyOpenUrl } from './discography'
import { timeline } from './timeline'

const HEX = /^#[0-9A-Fa-f]{6}$/

describe('members', () => {
  it('has nine unique members in display order', () => {
    expect(members.map((m) => m.num)).toEqual(['01', '05', '02', '09', '07', '06', '04', '03', '08'])
  })
  it('uses verified profile data', () => {
    const by = Object.fromEntries(members.map((m) => [m.slug, m]))
    expect(by.chika!.blood).toBe('B')
    expect(by.you!).toMatchObject({ height: 157, blood: 'AB', color: '#66C0FF' })
    expect(by.kanan!.height).toBe(162)
    expect(by.yoshiko!).toMatchObject({ height: 156, color: '#C1CAD4' })
    expect(by.hanamaru!).toMatchObject({ height: 152, blood: 'O' })
    expect(by.mari!.height).toBe(163)
    expect(by.ruby!).toMatchObject({ height: 154, blood: 'A' })
  })
  it('has valid colors and existing asset files', () => {
    for (const m of members) {
      expect(m.color).toMatch(HEX)
      for (const kind of ['portrait', 'emblem', 'banner', 'sign'] as const) {
        expect(existsSync(resolve('public', memberAssetPath(m, kind))), `${m.slug} ${kind}`).toBe(true)
      }
    }
  })
})

describe('subunits', () => {
  it('has three units of three with AZALEA in pink', () => {
    expect(subunits.map((u) => u.name)).toEqual(['CYaRon!', 'AZALEA', 'Guilty Kiss'])
    for (const u of subunits) {
      expect(u.members).toHaveLength(3)
      expect(existsSync(resolve('public', u.logo))).toBe(true)
    }
    const azalea = subunits.find((u) => u.name === 'AZALEA')!
    expect(azalea.members.map((m) => m.slug).sort()).toEqual(['dia', 'hanamaru', 'kanan'])
    expect(azalea.color).toBe('#FF6F9F')
  })
})

describe('releases', () => {
  it('is chronological with valid data', () => {
    const years = releases.map((r) => r.year)
    expect([...years].sort((a, b) => a - b)).toEqual(years)
    for (const r of releases) {
      expect(r.title).not.toBe('')
      expect(r.accent).toMatch(HEX)
      expect(spotifyUri(r.spotify)).toMatch(/^spotify:(track|album):[A-Za-z0-9]+$/)
    }
    expect(new Set(releases.map((r) => r.id)).size).toBe(releases.length)
  })
  it('dates KU-RU-KU-RU Cruller! to 2021', () => {
    expect(releases.find((r) => r.id === 'kurukuru-cruller')).toMatchObject({ year: 2021, date: '2021-09-22' })
  })
  it('builds open.spotify.com links', () => {
    expect(spotifyOpenUrl('https://open.spotify.com/embed/track/abc123')).toBe('https://open.spotify.com/track/abc123')
    expect(spotifyUri('https://example.com/nope')).toBeNull()
  })
})

describe('timeline', () => {
  it('runs 2015 → Finale 2025', () => {
    expect(timeline[0]!.when.en).toContain('2015')
    expect(timeline.at(-1)!.text.en).toContain('Belluna Dome')
  })
})

describe('performance assets', () => {
  it('ships the hero logo as webp', () => {
    expect(existsSync(resolve('public', 'assets/logo/aqours-logo.webp'))).toBe(true)
  })
})

describe('release blurbs', () => {
  it('every release has an EN and JA blurb', () => {
    for (const r of releases) {
      expect(r.blurb.en.trim(), r.id).not.toBe('')
      expect(r.blurb.ja.trim(), r.id).not.toBe('')
    }
  })
})
