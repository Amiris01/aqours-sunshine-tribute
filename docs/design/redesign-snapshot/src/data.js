// Static content data for the Aqours tribute page.
// Ported verbatim from the design handoff (README.md + prototype).
//
// NOTE: profile facts (CV, birthday, height, etc.) are commonly cited
// Love Live! Sunshine!! character details. Treat them as fan-reference data.

const M = [
  {
    num: '01',
    name: 'Chika Takami',
    jp: '高海千歌',
    cv: 'Anju Inami (伊波杏樹)',
    birthday: 'August 1',
    zodiac: 'Leo',
    grade: '2nd Year',
    age: '16',
    height: '157 cm',
    blood: 'O',
    unit: 'CYaRon!',
    colorName: 'Mikan Orange',
    trademark: 'Mikan obsession',
    color: '#ff7d2e',
    blurb: 'The boundlessly cheerful leader who turned one small wish into Aqours.',
  },
  {
    num: '02',
    name: 'Riko Sakurauchi',
    jp: '桜内梨子',
    cv: 'Rikako Aida (逢田梨香子)',
    birthday: 'September 19',
    zodiac: 'Virgo',
    grade: '2nd Year',
    age: '16',
    height: '160 cm',
    blood: 'A',
    unit: 'Guilty Kiss',
    colorName: 'Sakura Pink',
    trademark: 'Piano & books',
    color: '#f2799f',
    blurb: 'A graceful pianist from Tokyo who found her courage beside the sea.',
  },
  {
    num: '03',
    name: 'Kanan Matsuura',
    jp: '松浦果南',
    cv: 'Nanaka Suwa (諏訪ななか)',
    birthday: 'February 10',
    zodiac: 'Aquarius',
    grade: '3rd Year',
    age: '17',
    height: '159 cm',
    blood: 'O',
    unit: 'AZALEA',
    colorName: 'Aqua Green',
    trademark: 'Scuba diving',
    color: '#16b6a8',
    blurb: 'The warm, level-headed diver who keeps everyone steady and grounded.',
  },
  {
    num: '04',
    name: 'Dia Kurosawa',
    jp: '黒澤ダイヤ',
    cv: 'Arisa Komiya (小宮有紗)',
    birthday: 'January 1',
    zodiac: 'Capricorn',
    grade: '3rd Year',
    age: '17',
    height: '162 cm',
    blood: 'A',
    unit: 'AZALEA',
    colorName: 'Crimson Red',
    trademark: 'Secret idol mania',
    color: '#e23b4b',
    blurb: 'The dignified council president hiding a deeply idol-loving heart.',
  },
  {
    num: '05',
    name: 'You Watanabe',
    jp: '渡辺曜',
    cv: 'Shuka Saito (斉藤朱夏)',
    birthday: 'April 17',
    zodiac: 'Aries',
    grade: '2nd Year',
    age: '16',
    height: '159 cm',
    blood: 'A',
    unit: 'CYaRon!',
    colorName: 'Sky Blue',
    trademark: '“Yousoro!” salute',
    color: '#36b6f0',
    blurb: 'Sporty and sunny — happiest on the water or stitching new costumes.',
  },
  {
    num: '06',
    name: 'Yoshiko Tsushima',
    jp: '津島善子',
    cv: 'Aika Kobayashi (小林愛香)',
    birthday: 'July 13',
    zodiac: 'Cancer',
    grade: '1st Year',
    age: '15',
    height: '157 cm',
    blood: 'O',
    unit: 'Guilty Kiss',
    colorName: 'Twilight Grey',
    trademark: 'Fallen angel “Yohane”',
    color: '#8e8bb5',
    blurb: 'A self-proclaimed fallen angel with an irresistible flair for drama.',
  },
  {
    num: '07',
    name: 'Hanamaru Kunikida',
    jp: '国木田花丸',
    cv: 'Kanako Takatsuki (高槻かなこ)',
    birthday: 'March 4',
    zodiac: 'Pisces',
    grade: '1st Year',
    age: '15',
    height: '154 cm',
    blood: 'B',
    unit: 'AZALEA',
    colorName: 'Sunshine Yellow',
    trademark: '“…zura”',
    color: '#f3c52b',
    blurb: 'A gentle bookworm opening up to a whole new world, zura.',
  },
  {
    num: '08',
    name: 'Mari Ohara',
    jp: '小原鞠莉',
    cv: 'Aina Suzuki (鈴木愛奈)',
    birthday: 'June 13',
    zodiac: 'Gemini',
    grade: '3rd Year',
    age: '17',
    height: '162 cm',
    blood: 'AB',
    unit: 'Guilty Kiss',
    colorName: 'Royal Purple',
    trademark: '“Shiny!”',
    color: '#a673c4',
    blurb: 'The free-spirited heiress who lives loud and shines even louder.',
  },
  {
    num: '09',
    name: 'Ruby Kurosawa',
    jp: '黒澤ルビィ',
    cv: 'Ai Furihata (降幡愛)',
    birthday: 'September 21',
    zodiac: 'Virgo',
    grade: '1st Year',
    age: '15',
    height: '150 cm',
    blood: 'O',
    unit: 'CYaRon!',
    colorName: 'Ruby Pink',
    trademark: '“Ganbaruby!”',
    color: '#ff7bb0',
    blurb: 'The shy youngest who blossoms brightest under the stage lights.',
  },
]

// Emblem filenames (in /public/assets/members/), keyed by member number.
const EMBLEMS = {
  '01': '01-chika-emblem.png',
  '02': '02-riko-emblem.png',
  '03': '03-kanan-emblem.png',
  '04': '04-dia-emblem.png',
  '05': '05-you-emblem.png',
  '06': '06-yoshiko-emblem.png',
  '07': '07-hanamaru-emblem.png',
  '08': '08-mari-emblem.png',
  '09': '09-ruby-emblem.png',
}

// Normalized portrait filenames (in /public/assets/members/), keyed by number.
const PORTRAITS = {
  '01': '01-chika.png',
  '02': '02-riko.png',
  '03': '03-kanan.png',
  '04': '04-dia.png',
  '05': '05-you.png',
  '06': '06-yoshiko.png',
  '07': '07-hanamaru.png',
  '08': '08-mari.png',
  '09': '09-ruby.png',
}

// Derived fields: zigzag flip on odd index, emblem placeholder label, asset srcs.
export const members = M.map((m, i) => ({
  ...m,
  flip: i % 2 === 1,
  logoLabel: `[ ${m.name.split(' ')[0]} · emblem ]`,
  emblem: EMBLEMS[m.num] ? `/assets/members/${EMBLEMS[m.num]}` : null,
  portrait: PORTRAITS[m.num] ? `/assets/members/${PORTRAITS[m.num]}` : null,
}))

// Sub-units, derived from the member list so membership stays in sync. Each
// unit's `members` is filled below from `members` by matching `unit`.
const SUBUNIT_META = [
  {
    name: 'CYaRon!',
    color: '#ff7d2e',
    tagline: 'Bright, energetic, and full of seaside sunshine.',
  },
  {
    name: 'AZALEA',
    color: '#16b6a8',
    tagline: 'Cool, composed, and effortlessly elegant.',
  },
  {
    name: 'Guilty Kiss',
    color: '#a673c4',
    tagline: 'Bold, sultry, and unmistakably striking.',
  },
]

export const subunits = SUBUNIT_META.map((u) => ({
  ...u,
  members: members
    .filter((m) => m.unit === u.name)
    .map((m) => ({ num: m.num, name: m.name, color: m.color, emblem: m.emblem })),
}))

// A curated "best of" spanning 2016–2025 — iconic anime themes plus standout
// later-era singles, in chronological order. `spotify` may hold a Spotify
// share/embed/URI link (added when available); cards without one render
// without a player.
export const discs = [
  {
    year: '2015',
    title: 'Kimi no Kokoro wa Kagayaiteru kai?',
    spotify: 'https://open.spotify.com/embed/album/32Tz0vbR5XjgoIaRjgbIeN',
    cover:
      'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e023c2c6695bbef83300d49dc38',
  },
  {
    year: '2016',
    title: 'Aozora Jumping Heart',
    spotify: 'https://open.spotify.com/embed/track/3qDPN5KBpu63ieMoommmVm',
    cover:
      'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02dc6f7e80659b857be8ff0a95',
  },
  {
    year: '2016',
    title: 'Yume Kataru yori Yume Utaou',
    spotify: 'https://open.spotify.com/embed/track/3ttohFhqvDwELSLXtrPtKY',
    cover:
      'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e029942a3beab0cfed34d5fdb29',
  },
  {
    year: '2016',
    title: 'Omoi yo Hitotsu ni Nare',
    spotify: 'https://open.spotify.com/embed/track/2nC3tEAC3h8y9KG1h5dFjw',
    cover:
      'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e021d931cf9f4d549a71629ed2c',
  },
  {
    year: '2017',
    title: 'MY Mai☆TONIGHT',
    spotify: 'https://open.spotify.com/embed/track/6PIx2cN6GYAQgRXgwq9fho',
    cover:
      'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e025159c00e5c1876b57ad9aa95',
  },
  {
    year: '2024',
    title: 'Eikyuu Hours',
    spotify: 'https://open.spotify.com/embed/track/0d7HxyRChgSXwmTlflrB4r',
    cover:
      'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0243ce6fe039e2dc47ae3f0e40',
  },
]
