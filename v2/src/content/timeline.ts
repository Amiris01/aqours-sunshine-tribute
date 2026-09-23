import type { Localized } from './types'

export interface Milestone {
  /** Year or year.month, shown as a dot-matrix date in both languages. */
  date: string
  text: Localized
}

// Verified milestones only (spec "Journey timeline"). Neutral about status after the finale.
export const timeline: Milestone[] = [
  { date: '2015.04', text: { en: 'Project Love Live! Sunshine!! begins.', ja: '「ラブライブ！サンシャイン!!」プロジェクト始動。' } },
  { date: '2015.10', text: { en: 'Debut single “Kimi no Kokoro wa Kagayaiteru kai?”', ja: 'デビューシングル「君のこころは輝いてるかい？」' } },
  { date: '2016.07', text: { en: 'TV anime season 1 — Uranohoshi, Uchiura, Numazu.', ja: 'TVアニメ第1期放送開始 — 沼津・内浦、浦の星女学院。' } },
  { date: '2017.10', text: { en: 'TV anime season 2.', ja: 'TVアニメ第2期放送開始。' } },
  { date: '2018.11', text: { en: '4th LoveLive! at Tokyo Dome.', ja: '東京ドームで4thライブ。' } },
  { date: '2018.12', text: { en: 'Special performance on NHK Kōhaku Uta Gassen.', ja: 'NHK紅白歌合戦に出演。' } },
  { date: '2019.01', text: { en: 'The School Idol Movie: Over the Rainbow.', ja: '劇場版『Over the Rainbow』公開。' } },
  { date: '2019', text: { en: 'First Love Live! Asia tour; 5th LoveLive! at MetLife Dome.', ja: 'シリーズ初のアジアツアー、メットライフドームで5thライブ。' } },
  { date: '2023.07', text: { en: 'Spin-off anime Yohane the Parhelion.', ja: 'スピンオフアニメ『幻日のヨハネ』放送開始。' } },
  { date: '2025.06', text: { en: 'Finale LoveLive! ~Eikyuu stage~ at Belluna Dome.', ja: 'ベルーナドームで「Finale LoveLive! ～永久stage～」。' } },
]
