import type { Localized } from './types'

export interface Milestone {
  when: Localized
  text: Localized
}

// Verified milestones only (spec "Journey timeline"). Neutral about status after the finale.
export const timeline: Milestone[] = [
  { when: { en: 'Apr 2015', ja: '2015年4月' }, text: { en: 'Project Love Live! Sunshine!! begins.', ja: '「ラブライブ！サンシャイン!!」プロジェクト始動。' } },
  { when: { en: 'Oct 2015', ja: '2015年10月' }, text: { en: 'Debut single “Kimi no Kokoro wa Kagayaiteru kai?”', ja: 'デビューシングル「君のこころは輝いてるかい？」' } },
  { when: { en: 'Jul 2016', ja: '2016年7月' }, text: { en: 'TV anime season 1 — Uranohoshi, Uchiura, Numazu.', ja: 'TVアニメ第1期放送開始 — 沼津・内浦、浦の星女学院。' } },
  { when: { en: 'Oct 2017', ja: '2017年10月' }, text: { en: 'TV anime season 2.', ja: 'TVアニメ第2期放送開始。' } },
  { when: { en: 'Nov 2018', ja: '2018年11月' }, text: { en: '4th LoveLive! at Tokyo Dome.', ja: '東京ドームで4thライブ。' } },
  { when: { en: 'Dec 2018', ja: '2018年12月' }, text: { en: 'Special performance on NHK Kōhaku Uta Gassen.', ja: 'NHK紅白歌合戦に出演。' } },
  { when: { en: 'Jan 2019', ja: '2019年1月' }, text: { en: 'The School Idol Movie: Over the Rainbow.', ja: '劇場版『Over the Rainbow』公開。' } },
  { when: { en: '2019', ja: '2019年' }, text: { en: 'First Love Live! Asia tour; 5th LoveLive! at MetLife Dome.', ja: 'シリーズ初のアジアツアー、メットライフドームで5thライブ。' } },
  { when: { en: 'Jul 2023', ja: '2023年7月' }, text: { en: 'Spin-off anime Yohane the Parhelion.', ja: 'スピンオフアニメ『幻日のヨハネ』放送開始。' } },
  { when: { en: 'Jun 2025', ja: '2025年6月' }, text: { en: 'Finale LoveLive! ~Eikyuu stage~ at Belluna Dome.', ja: 'ベルーナドームで「Finale LoveLive! ～永久stage～」。' } },
]
