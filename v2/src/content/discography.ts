import type { Localized } from './types'

export interface Release {
  id: string
  year: number
  /** ISO date, only when verified. */
  date?: string
  title: string
  titleJp: string
  kind: Localized
  spotify: string
  cover: string
  /** Tint for the player / vinyl glow. */
  accent: string
}

export const releases: Release[] = [
  {
    id: 'kimi-no-kokoro', year: 2015, date: '2015-10-07',
    title: 'Kimi no Kokoro wa Kagayaiteru kai?', titleJp: '君のこころは輝いてるかい？',
    kind: { en: 'Debut single', ja: 'デビューシングル' },
    spotify: 'https://open.spotify.com/embed/album/32Tz0vbR5XjgoIaRjgbIeN',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e023c2c6695bbef83300d49dc38',
    accent: '#3FD6FF',
  },
  {
    id: 'aozora-jumping-heart', year: 2016, date: '2016-07-20',
    title: 'Aozora Jumping Heart', titleJp: '青空Jumping Heart',
    kind: { en: 'TV anime season 1 opening', ja: 'TVアニメ第1期オープニング' },
    spotify: 'https://open.spotify.com/embed/track/3qDPN5KBpu63ieMoommmVm',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02dc6f7e80659b857be8ff0a95',
    accent: '#66C0FF',
  },
  {
    id: 'yume-kataru', year: 2016, date: '2016-08-24',
    title: 'Yume Kataru yori Yume Utaou', titleJp: 'ユメ語るよりユメ歌おう',
    kind: { en: 'TV anime season 1 ending', ja: 'TVアニメ第1期エンディング' },
    spotify: 'https://open.spotify.com/embed/track/3ttohFhqvDwELSLXtrPtKY',
    cover: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e029942a3beab0cfed34d5fdb29',
    accent: '#FF9547',
  },
  {
    id: 'omoi-yo-hitotsu-ni-nare', year: 2016, date: '2016-11-09',
    title: 'Omoi yo Hitotsu ni Nare', titleJp: '想いよひとつになれ',
    kind: { en: 'TV anime season 1 insert song', ja: 'TVアニメ第1期挿入歌' },
    spotify: 'https://open.spotify.com/embed/track/2nC3tEAC3h8y9KG1h5dFjw',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e021d931cf9f4d549a71629ed2c',
    accent: '#FF9EAC',
  },
  {
    id: 'my-mai-tonight', year: 2017, date: '2017-11-29',
    title: 'MY Mai☆TONIGHT', titleJp: 'MY舞☆TONIGHT',
    kind: { en: 'TV anime season 2 insert song', ja: 'TVアニメ第2期挿入歌' },
    spotify: 'https://open.spotify.com/embed/track/6PIx2cN6GYAQgRXgwq9fho',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e025159c00e5c1876b57ad9aa95',
    accent: '#C252C6',
  },
  {
    id: 'kurukuru-cruller', year: 2021, date: '2021-09-22',
    title: 'KU-RU-KU-RU Cruller!', titleJp: 'KU-RU-KU-RU Cruller!',
    kind: { en: 'Monster Strike collaboration theme', ja: 'モンスト コラボテーマソング' },
    spotify: 'https://open.spotify.com/embed/track/5O2cVcJPeMUNFERDQQudl5',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02381bc78a1a06d67bac9fe041',
    accent: '#FFD010',
  },
  {
    id: 'genjitsu-mysterium', year: 2023, date: '2023-07-26',
    title: 'Genjitsu Mysterium', titleJp: '幻日ミステリウム',
    kind: { en: 'Yohane the Parhelion opening', ja: '『幻日のヨハネ』オープニング' },
    spotify: 'https://open.spotify.com/embed/track/1yyEOzKmdW2OdzwRLdwwnE',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02e4b07526a844677accf8a3bf',
    accent: '#8FB3FF',
  },
  {
    id: 'eikyuu-hours', year: 2024, date: '2024-12-18',
    title: 'Eikyuu hours', titleJp: '永久hours',
    kind: { en: 'Finale LoveLive! theme', ja: 'Finale LoveLive! テーマソング' },
    spotify: 'https://open.spotify.com/embed/track/0d7HxyRChgSXwmTlflrB4r',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0243ce6fe039e2dc47ae3f0e40',
    accent: '#27C1B7',
  },
]

const EMBED = /embed\/(track|album|playlist)\/([A-Za-z0-9]+)/

export function spotifyUri(embedUrl: string): string | null {
  const m = embedUrl.match(EMBED)
  return m ? `spotify:${m[1]}:${m[2]}` : null
}

export function spotifyOpenUrl(embedUrl: string): string | null {
  const m = embedUrl.match(EMBED)
  return m ? `https://open.spotify.com/${m[1]}/${m[2]}` : null
}
