import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { members, memberAssetPath } from './members'
import { subunits } from './subunits'
import { releases, spotifyUri, spotifyOpenUrl } from './discography'
import { timeline } from './timeline'

const HEX = /^#[0-9A-Fa-f]{6}$/

describe('members', () => {
  it('lists the nine in the chosen order, numbered No.01–No.09 by position', () => {
    expect(members.map((m) => m.slug)).toEqual(['chika', 'you', 'riko', 'hanamaru', 'ruby', 'yoshiko', 'kanan', 'dia', 'mari'])
    expect(members.map((m) => m.no)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09'])
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
    expect(timeline[0]!.date).toBe('2015.04')
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

describe('added releases', () => {
  it('includes Thank you, FRIENDS!! and Brightest Melody in release order', () => {
    const ids = releases.map((r) => r.id)
    expect(releases).toHaveLength(10)
    expect(releases.find((r) => r.id === 'thank-you-friends')).toMatchObject({
      year: 2018, date: '2018-08-01', spotify: 'https://open.spotify.com/embed/track/7pWdvkEHlPs8psbYQl7oyI',
    })
    expect(releases.find((r) => r.id === 'brightest-melody')).toMatchObject({
      year: 2019, date: '2019-02-06', spotify: 'https://open.spotify.com/embed/track/5BBzwer9yZKtH89QRwxhXS',
    })
    expect(ids.indexOf('my-mai-tonight')).toBeLessThan(ids.indexOf('thank-you-friends'))
    expect(ids.indexOf('thank-you-friends')).toBeLessThan(ids.indexOf('brightest-melody'))
    expect(ids.indexOf('brightest-melody')).toBeLessThan(ids.indexOf('kurukuru-cruller'))
  })
})
