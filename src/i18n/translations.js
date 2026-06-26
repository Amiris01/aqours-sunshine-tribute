// Translation dictionaries for the Aqours tribute page (EN / JP).
//
// Both languages share the same flat string keys. English is the source of
// truth; Japanese mirrors it. Per-member blurbs are keyed by member number
// (`blurb.01`) and sub-unit taglines by unit name so the data shape in
// `data.js` stays untouched.
//
// Lookups go through `t(key)` (see LanguageContext): current lang → en → key.

export const translations = {
  en: {
    // --- document / meta ---
    'meta.title': 'Aqours — Love Live! Sunshine!! Fan Tribute',

    // --- language switcher ---
    'lang.en': 'EN',
    'lang.ja': '日本語',
    'lang.switchTo': 'Switch language',

    // --- hero ---
    // Series wordmark image (swaps with language) + a small tribute tag beside it.
    'hero.seriesLogo': '/assets/logo/Lovelive_sunshine_en.webp',
    'hero.seriesLogoAlt': 'Love Live! Sunshine!! — School idol project',
    'hero.eyebrowTag': 'Fan Tribute',
    'hero.tagline': 'Shine with us — here, now, by the sea.',
    'hero.scrollCue': 'Scroll to dive in',

    // --- about / intro ---
    'about.eyebrow': 'School Idol Project',
    'about.h2': 'Nine girls, one shining sea.',
    'about.lead':
      "Aqours is the school idol group of Uranohoshi Girls' High School in Uchiura, Numazu, on Japan's sun-soaked Shizuoka coast. Inspired by the legendary μ's and refusing to watch their school close, nine friends chase a single radiant dream — to shine, here and now, with everything they've got.",
    'about.foot': 'Nine members, three sub-units, since 2015.',

    // --- members header ---
    'members.eyebrow': 'Meet Aqours',
    'members.h2': 'Nine hearts, nine colors.',
    'members.lead':
      'Each member shines in her own hue — every profile below is themed to her image color. Scroll through to meet all nine.',

    // --- member profile field labels ---
    'profile.cv': 'Voice (CV)',
    'profile.birthday': 'Birthday',
    'profile.zodiac': 'Zodiac',
    'profile.grade': 'Grade',
    'profile.age': 'Age',
    'profile.height': 'Height',
    'profile.blood': 'Blood Type',
    'profile.trademark': 'Trademark',

    // --- member blurbs (keyed by member num) ---
    'blurb.01': 'The boundlessly cheerful leader who turned one small wish into Aqours.',
    'blurb.02': 'A gifted pianist and composer who transferred from Tokyo and found her courage beside the sea.',
    'blurb.03': 'The warm, level-headed diver who keeps everyone steady and grounded.',
    'blurb.04': 'The dignified council president hiding a deeply idol-loving heart.',
    'blurb.05': 'Sporty and sunny — happiest on the water or stitching new costumes.',
    'blurb.06': 'A self-proclaimed fallen angel with an irresistible flair for drama.',
    'blurb.07': 'A gentle bookworm opening up to a whole new world, zura.',
    'blurb.08': 'The free-spirited school director and hotel heiress who lives loud and shines even louder.',
    'blurb.09': 'The shy youngest who blossoms brightest under the stage lights.',

    // --- sub-units ---
    'subunits.eyebrow': 'Three Sub-units',
    'subunits.h2': 'Smaller groups, same shine.',
    'subunits.lead':
      'Beyond the full nine, Aqours splits into three sub-units — each with its own sound and style.',
    'subunit.tagline.CYaRon!': 'Bright, energetic, and full of seaside sunshine.',
    'subunit.tagline.AZALEA': 'Cool, composed, and effortlessly elegant.',
    'subunit.tagline.Guilty Kiss': 'Bold, sultry, and unmistakably striking.',

    // --- discography ---
    'disc.eyebrow': 'Discography · 2015–2024',
    'disc.h2': 'Songs that shine.',
    'disc.play': 'Play {title}',

    // --- now-playing bar ---
    'np.loading': 'Loading…',
    'np.nowPlaying': 'Now playing',
    'np.prev': 'Previous track',
    'np.play': 'Play',
    'np.pause': 'Pause',
    'np.next': 'Next track',
    'np.close': 'Close player',

    // --- footer ---
    'foot.mark': 'Shine!!',
    'foot.sub': 'Aqours, forever sunshine.',
    'foot.note':
      'A fan-made tribute celebrating Aqours from Love Live! Sunshine!! Aqours, its characters, and music are the property of their respective rights holders. Made with love, by the sea.',
  },

  ja: {
    // --- document / meta ---
    'meta.title': 'Aqours — ラブライブ！サンシャイン!! ファン トリビュート',

    // --- language switcher ---
    'lang.en': 'EN',
    'lang.ja': '日本語',
    'lang.switchTo': '言語を切り替える',

    // --- hero ---
    // Series wordmark image (swaps with language) + a small tribute tag beside it.
    'hero.seriesLogo': '/assets/logo/Lovelive_sunshine_jp.png',
    'hero.seriesLogoAlt': 'ラブライブ！サンシャイン!! — スクールアイドルプロジェクト',
    'hero.eyebrowTag': 'ファン トリビュート',
    'hero.tagline': '輝こう、私たちと一緒に — 今ここ、この海辺で。',
    'hero.scrollCue': 'スクロールして飛び込もう',

    // --- about / intro ---
    'about.eyebrow': 'スクールアイドルプロジェクト',
    'about.h2': '9人の少女、ひとつの輝く海。',
    'about.lead':
      'Aqours（アクア）は、静岡県沼津市の内浦にある浦の星女学院のスクールアイドルグループです。伝説のμ’sに憧れ、閉校の危機に立ち向かいながら、9人の仲間がただひとつの輝く夢を追いかけます — 今ここで、持てるすべてを懸けて輝くために。',
    'about.foot': 'メンバー9人、サブユニット3組、2015年から。',

    // --- members header ---
    'members.eyebrow': 'Aqoursに会おう',
    'members.h2': '9つの心、9つの色。',
    'members.lead':
      'メンバーそれぞれが自分の色で輝きます — 下のプロフィールは各メンバーのイメージカラーで彩られています。スクロールして9人全員に会いましょう。',

    // --- member profile field labels ---
    'profile.cv': '声優（CV）',
    'profile.birthday': '誕生日',
    'profile.zodiac': '星座',
    'profile.grade': '学年',
    'profile.age': '年齢',
    'profile.height': '身長',
    'profile.blood': '血液型',
    'profile.trademark': '特徴',

    // --- member blurbs (keyed by member num) ---
    'blurb.01': 'ひとつの小さな願いをAqoursに変えた、果てしなく明るいリーダー。',
    'blurb.02': '東京から転校し、海辺で勇気を見つけた、才能あふれるピアニストで作曲担当。',
    'blurb.03': 'みんなを支え、地に足をつけさせる、温かく冷静なダイバー。',
    'blurb.04': 'アイドルを心から愛する気持ちを隠す、凛とした生徒会長。',
    'blurb.05': 'スポーティで陽気 — 海の上か、新しい衣装を縫っている時が一番幸せ。',
    'blurb.06': '抗いがたいドラマチックな魅力を持つ、自称堕天使。',
    'blurb.07': '新しい世界に心を開いていく、穏やかな読書家ずら。',
    'blurb.08': '声高に生き、さらに輝く、自由奔放な理事長でホテル令嬢。',
    'blurb.09': 'ステージの光の下で最も明るく花開く、内気な末っ子。',

    // --- sub-units ---
    'subunits.eyebrow': '3つのサブユニット',
    'subunits.h2': '小さなグループ、同じ輝き。',
    'subunits.lead':
      '9人全員に加え、Aqoursは3つのサブユニットに分かれます — それぞれが独自のサウンドとスタイルを持っています。',
    'subunit.tagline.CYaRon!': '明るく、元気いっぱい、海辺の陽光に満ちて。',
    'subunit.tagline.AZALEA': 'クールで、落ち着いていて、さりげなく優雅。',
    'subunit.tagline.Guilty Kiss': '大胆で、妖艶で、まぎれもなく印象的。',

    // --- discography ---
    'disc.eyebrow': 'ディスコグラフィー · 2015–2024',
    'disc.h2': '輝きを放つ歌たち。',
    'disc.play': '{title} を再生',

    // --- now-playing bar ---
    'np.loading': '読み込み中…',
    'np.nowPlaying': '再生中',
    'np.prev': '前の曲',
    'np.play': '再生',
    'np.pause': '一時停止',
    'np.next': '次の曲',
    'np.close': 'プレーヤーを閉じる',

    // --- footer ---
    'foot.mark': '輝け!!',
    'foot.sub': 'Aqours、永遠の輝き。',
    'foot.note':
      'ラブライブ！サンシャイン!! のAqoursを讃える、ファンメイドのトリビュートです。Aqours、そのキャラクター、楽曲は各権利者に帰属します。海辺で、愛を込めて。',
  },
}
