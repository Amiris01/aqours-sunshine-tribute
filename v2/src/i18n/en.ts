// English is the source of truth; ja.ts must provide exactly these keys.
export const en = {
  'meta.title': 'Aqours — Love Live! Sunshine!! Fan Tribute',
  'lang.label': 'Language',

  'nav.members': 'Members',
  'nav.units': 'Units',
  'nav.music': "Setlist",
  'nav.journey': "Timeline",
  'nav.home': 'Aqours — back to top',

  'hero.seriesLogo': 'assets/logo/Lovelive_sunshine_en.webp',
  'hero.seriesLogoAlt': 'Love Live! Sunshine!! — School idol project',
  'hero.eyebrowTag': "Fan tribute",
  'hero.tagline': 'Shine with us — here, now, by the sea.',
  'hero.play': "Play from M01",
  'hero.scrollCue': 'Scroll to dive in',

  'about.h2': 'Nine girls, one shining sea.',
  'about.lead':
    "Aqours is the school idol group of Uranohoshi Girls' High School in Uchiura, Numazu, on Japan's sun-soaked Shizuoka coast. Inspired by the legendary μ's and refusing to watch their school close, nine friends chase a single radiant dream — to shine, here and now, with everything they've got.",
  'about.foot': 'Nine members, three sub-units, since 2015.',

  'members.h2': "The nine of Uranohoshi",
  'members.lead': "Choose a ticket to open her profile.",
  'members.open': 'Open {name}',
  'members.prev': 'Previous member',
  'members.next': 'Next member',
  'members.close': 'Close',
  'members.signature': "{name}'s signature",

  'profile.cv': 'Voice (CV)',
  'profile.birthday': 'Birthday',
  'profile.zodiac': 'Zodiac',
  'profile.grade': 'Grade',
  'profile.age': 'Age',
  'profile.height': 'Height',
  'profile.blood': 'Blood Type',
  'profile.color': 'Image Color',
  'profile.unit': 'Sub-unit',
  'profile.trademark': 'Trademark',
  'grade.1': '1st Year',
  'grade.2': '2nd Year',
  'grade.3': '3rd Year',

  'blurb.01': 'The boundlessly cheerful leader who turned one small wish into Aqours.',
  'blurb.02': 'A gifted pianist and composer who transferred from Tokyo and found her courage beside the sea.',
  'blurb.03': 'The warm, level-headed diver who keeps everyone steady and grounded.',
  'blurb.04': 'The dignified council president hiding a deeply idol-loving heart.',
  'blurb.05': 'Sporty and sunny — happiest on the water or stitching new costumes.',
  'blurb.06': 'A self-proclaimed fallen angel with an irresistible flair for drama.',
  'blurb.07': 'A gentle bookworm opening up to a whole new world, zura.',
  'blurb.08': 'The free-spirited school director and hotel heiress who lives loud and shines even louder.',
  'blurb.09': 'The shy youngest who blossoms brightest under the stage lights.',

  'subunits.h2': "Three units",
  'subunits.lead': 'Beyond the full nine, Aqours splits into three sub-units — each with its own sound and style.',
  'subunits.single': "Unit Single {n}",
  'subunit.tagline.CYaRon!': 'Bright, energetic, and full of seaside sunshine.',
  'subunit.tagline.AZALEA': 'Cool, composed, and effortlessly elegant.',
  'subunit.tagline.Guilty Kiss': 'Bold, sultry, and unmistakably striking.',

  'disc.h2': "Setlist",
  'disc.playThis': "Play {title}",
  'disc.cover': '{title} cover art',

  'np.region': 'Music player',
  'np.loading': 'Loading…',
  'np.nowPlaying': 'Now playing',
  'np.prev': 'Previous track',
  'np.play': 'Play',
  'np.pause': 'Pause',
  'np.next': 'Next track',
  'np.close': 'Close player',
  'np.minimize': 'Minimize player',
  'np.expand': 'Show player',
  'np.seek': 'Seek',
  'np.error': "Couldn't reach Spotify.",
  'np.openSpotify': 'Open in Spotify',
  'np.retry': 'Retry',
  'np.previewNote': 'Full tracks need a Spotify login; otherwise you hear a preview.',

  'journey.h2': 'Timeline',

  'hero.penlight': "{name}: open profile",
  'hero.penlights': "Penlights — choose a member",
  'disc.lead': "Eight Aqours songs, 2015 to 2024, in release order.",
  'np.onAir': "On air",

  'rainbow.h2': "Aqours Rainbow",
  'rainbow.caption': "At the Finale LoveLive! at Belluna Dome in June 2025, fans set their penlights to paint an Aqours Rainbow across the audience on both days.",

  'foot.mark': 'Shine!!',
  'foot.sub': 'Aqours, forever sunshine.',
  'foot.note':
    'A fan-made tribute celebrating Aqours from Love Live! Sunshine!! Aqours, its characters, and music are the property of their respective rights holders. Made with love, by the sea.',
} as const

export type Key = keyof typeof en
export type Dict = Record<Key, string>
