import { asset } from '../lib/asset'
import type { Localized } from './types'

// Verified against official profiles (see spec "Content — verified data").
// V1 had several wrong heights/blood types/colors; do not copy from V1.

export type UnitName = 'CYaRon!' | 'AZALEA' | 'Guilty Kiss'
export type Blood = 'A' | 'B' | 'O' | 'AB'

export interface Member {
  /** Internal id: asset filenames, blurb keys, profile links. Not shown. */
  num: string
  slug: string
  name: string
  jp: string
  cv: string
  cvJp: string
  birth: { month: number; day: number }
  zodiac: Localized
  grade: 1 | 2 | 3
  age: number
  height: number
  blood: Blood
  unit: UnitName
  color: string
  colorName: Localized
  trademark: Localized
}

const RAW: Member[] = [
  {
    num: '01', slug: 'chika', name: 'Chika Takami', jp: '高海千歌',
    cv: 'Anju Inami', cvJp: '伊波杏樹', birth: { month: 8, day: 1 },
    zodiac: { en: 'Leo', ja: '獅子座' }, grade: 2, age: 16, height: 157, blood: 'B',
    unit: 'CYaRon!', color: '#FF9547', colorName: { en: 'Mikan Orange', ja: 'みかん色' },
    trademark: { en: 'Mikan obsession', ja: 'みかんが大好き' },
  },
  {
    num: '02', slug: 'riko', name: 'Riko Sakurauchi', jp: '桜内梨子',
    cv: 'Rikako Aida', cvJp: '逢田梨香子', birth: { month: 9, day: 19 },
    zodiac: { en: 'Virgo', ja: '乙女座' }, grade: 2, age: 16, height: 160, blood: 'A',
    unit: 'Guilty Kiss', color: '#FF9EAC', colorName: { en: 'Sakura Pink', ja: 'サクラピンク' },
    trademark: { en: 'Piano & books', ja: 'ピアノと読書' },
  },
  {
    num: '03', slug: 'kanan', name: 'Kanan Matsuura', jp: '松浦果南',
    cv: 'Nanaka Suwa', cvJp: '諏訪ななか', birth: { month: 2, day: 10 },
    zodiac: { en: 'Aquarius', ja: '水瓶座' }, grade: 3, age: 17, height: 162, blood: 'O',
    unit: 'AZALEA', color: '#27C1B7', colorName: { en: 'Emerald Green', ja: 'エメラルドグリーン' },
    trademark: { en: 'Scuba diving', ja: 'スキューバダイビング' },
  },
  {
    num: '04', slug: 'dia', name: 'Dia Kurosawa', jp: '黒澤ダイヤ',
    cv: 'Arisa Komiya', cvJp: '小宮有紗', birth: { month: 1, day: 1 },
    zodiac: { en: 'Capricorn', ja: '山羊座' }, grade: 3, age: 17, height: 162, blood: 'A',
    unit: 'AZALEA', color: '#DB0839', colorName: { en: 'Red', ja: 'レッド' },
    trademark: { en: 'Secret idol mania', ja: '隠れアイドルマニア' },
  },
  {
    num: '05', slug: 'you', name: 'You Watanabe', jp: '渡辺曜',
    cv: 'Shuka Saito', cvJp: '斉藤朱夏', birth: { month: 4, day: 17 },
    zodiac: { en: 'Aries', ja: '牡羊座' }, grade: 2, age: 16, height: 157, blood: 'AB',
    unit: 'CYaRon!', color: '#66C0FF', colorName: { en: 'Light Blue', ja: 'ライトブルー' },
    trademark: { en: '“Yousoro!” salute', ja: '「ヨーソロー！」の敬礼' },
  },
  {
    num: '06', slug: 'yoshiko', name: 'Yoshiko Tsushima', jp: '津島善子',
    cv: 'Aika Kobayashi', cvJp: '小林愛香', birth: { month: 7, day: 13 },
    zodiac: { en: 'Cancer', ja: '蟹座' }, grade: 1, age: 15, height: 156, blood: 'O',
    unit: 'Guilty Kiss', color: '#C1CAD4', colorName: { en: 'White', ja: 'ホワイト' },
    trademark: { en: 'Fallen angel “Yohane”', ja: '堕天使「ヨハネ」' },
  },
  {
    num: '07', slug: 'hanamaru', name: 'Hanamaru Kunikida', jp: '国木田花丸',
    cv: 'Kanako Takatsuki', cvJp: '高槻かなこ', birth: { month: 3, day: 4 },
    zodiac: { en: 'Pisces', ja: '魚座' }, grade: 1, age: 15, height: 152, blood: 'O',
    unit: 'AZALEA', color: '#FFD010', colorName: { en: 'Yellow', ja: 'イエロー' },
    trademark: { en: '“…zura”', ja: '「〜ずら」' },
  },
  {
    num: '08', slug: 'mari', name: 'Mari Ohara', jp: '小原鞠莉',
    cv: 'Aina Suzuki', cvJp: '鈴木愛奈', birth: { month: 6, day: 13 },
    zodiac: { en: 'Gemini', ja: '双子座' }, grade: 3, age: 17, height: 163, blood: 'AB',
    unit: 'Guilty Kiss', color: '#C252C6', colorName: { en: 'Violet', ja: 'ヴァイオレット' },
    trademark: { en: '“Shiny!”', ja: '「シャイニー！」' },
  },
  {
    num: '09', slug: 'ruby', name: 'Ruby Kurosawa', jp: '黒澤ルビィ',
    cv: 'Ai Furihata', cvJp: '降幡愛', birth: { month: 9, day: 21 },
    zodiac: { en: 'Virgo', ja: '乙女座' }, grade: 1, age: 15, height: 154, blood: 'A',
    unit: 'CYaRon!', color: '#FF6FBE', colorName: { en: 'Pink', ja: 'ピンク' },
    trademark: { en: '“Ganbaruby!”', ja: '「がんばルビィ！」' },
  },
]

// Page order, by grade: 2nd years, 1st years, 3rd years (ids refer to RAW above).
export const DISPLAY_ORDER = ['01', '05', '02', '07', '09', '06', '03', '04', '08'] as const

/** A member as shown on the page; `no` is her displayed number, i.e. her position. */
export type ShownMember = Member & { no: string }

export const members: ShownMember[] = DISPLAY_ORDER.map((num, i) => {
  const m = RAW.find((x) => x.num === num)
  if (!m) throw new Error(`Unknown member ${num}`)
  return { ...m, no: String(i + 1).padStart(2, '0') }
})

type AssetKind = 'portrait' | 'emblem' | 'banner' | 'sign'

/** Path relative to public/ (no base) — used by tests to check files exist. */
export function memberAssetPath(m: Member, kind: AssetKind): string {
  const id = `${m.num}-${m.slug}`
  switch (kind) {
    case 'portrait': return `assets/members/${id}.webp`
    case 'emblem': return `assets/members/${id}-emblem.png`
    case 'banner': return `assets/banner/${id}.webp`
    case 'sign': return `assets/sign/${id}-sign.webp`
  }
}

export function memberAssets(m: Member) {
  return {
    portrait: asset(memberAssetPath(m, 'portrait')),
    emblem: asset(memberAssetPath(m, 'emblem')),
    banner: asset(memberAssetPath(m, 'banner')),
    sign: asset(memberAssetPath(m, 'sign')),
  }
}
