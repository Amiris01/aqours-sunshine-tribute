import { useRef, useState, type CSSProperties } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, m as motion } from 'motion/react'
import { members, memberAssets } from '../../content/members'
import { pick } from '../../content/types'
import { formatBirthday } from '../../lib/format'
import { ArrowIcon, CloseIcon } from '../../lib/icons'
import { useT, type Key } from '../../i18n'
import { useLang } from '../../store/lang'
import { DUR, EASE } from '../../motion/tokens'

interface Props {
  num: string | null
  onNavigate(num: string): void
  onClose(): void
  returnFocus(num: string): void
}

const navBtn = 'grid size-11 place-items-center rounded-[3px] border border-line text-ink transition hover:border-ink'

/** A member's page from the concert pamphlet: key art, then her profile. */
export function MemberView({ num, onNavigate, onClose, returnFocus }: Props) {
  const t = useT()
  const lang = useLang((s) => s.lang)
  const idx = num ? members.findIndex((m) => m.num === num) : -1
  const m = idx >= 0 ? members[idx] : undefined
  const lastNum = useRef<string | null>(null)
  if (num) lastNum.current = num

  // Which way the visitor is moving through the nine: 1 = next, -1 = previous, 0 = just opened.
  const [dir, setDir] = useState(0)
  if (!num && dir !== 0) setDir(0)

  const go = (d: number) => {
    if (idx < 0) return
    setDir(d)
    onNavigate(members[(idx + d + members.length) % members.length]!.num)
  }

  return (
    <Dialog.Root open={Boolean(m)} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {m && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-night"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content
              forceMount
              aria-describedby={undefined}
              data-lenis-prevent
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
                if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
              }}
              onCloseAutoFocus={(e) => {
                e.preventDefault()
                if (lastNum.current) returnFocus(lastNum.current)
              }}
              style={{ '--c': m.color } as CSSProperties}
              className="fixed inset-0 z-50 overflow-hidden outline-none"
            >
              {/* Close stays pinned to the corner so it never takes a row of the page. */}
              <Dialog.Close className={`${navBtn} absolute right-4 top-3 z-10 bg-night/80`} aria-label={t('members.close')}>
                <CloseIcon />
              </Dialog.Close>
              {/* One page, no scrolling: the art and the profile share exactly one viewport.
                  The content layer covers the overlay, so it handles "click outside" itself:
                  only clicks on this empty backdrop area (not its children) close. */}
              <motion.div
                data-testid="member-backdrop"
                onClick={(e) => {
                  if (e.target === e.currentTarget) onClose()
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: DUR.base, ease: EASE }}
                className="mx-auto grid h-dvh max-w-6xl grid-rows-[minmax(0,34fr)_minmax(0,66fr)] gap-4 p-4 pt-16 md:grid-cols-[1.05fr_1fr] md:grid-rows-1 md:items-center md:gap-10 md:px-10 md:py-8"
              >
                <div className="relative min-h-0 md:h-[min(78dvh,680px)]">
                  <motion.div
                    key={m.num}
                    data-testid="member-art"
                    data-direction={dir}
                    initial={dir === 0 ? { opacity: 0, scale: 0.96 } : { opacity: 0, x: dir * 56 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: DUR.slow, ease: EASE }}
                    className="h-full overflow-hidden rounded-[6px] border-b-4 border-[var(--c)]"
                  >
                    <img src={memberAssets(m).banner} alt="" className="h-full w-full object-cover" />
                  </motion.div>
                  {/* Outside the keyed art so they keep focus while you step through the nine. */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <button type="button" className={`${navBtn} bg-night/80`} onClick={() => go(-1)} aria-label={t('members.prev')}><ArrowIcon dir="left" /></button>
                    <button type="button" className={`${navBtn} bg-night/80`} onClick={() => go(1)} aria-label={t('members.next')}><ArrowIcon /></button>
                  </div>
                </div>
                <motion.div
                  key={`info-${m.num}`}
                  initial={dir === 0 ? { opacity: 0 } : { opacity: 0, x: dir * 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: DUR.base, ease: EASE, delay: dir === 0 ? 0.08 : 0.04 }}
                  className="flex min-h-0 flex-col justify-center"
                >
                  <p className="font-led text-lg leading-none text-[var(--c)] md:text-2xl">No.{m.num}</p>
                  <Dialog.Title className="mt-2 font-display text-[clamp(1.6rem,min(5vw,5.4dvh),3.5rem)] leading-[1.05]">{m.name}</Dialog.Title>
                  <p lang="ja" className="mt-1 text-haze md:text-lg">{m.jp}</p>
                  <p className="mt-3 max-w-[48ch] text-[15px] leading-snug md:mt-5 md:text-lg md:leading-relaxed">{t(`blurb.${m.num}` as Key)}</p>
                  <dl className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3 border-t border-line pt-4 md:mt-6 md:gap-y-4 md:pt-5">
                    {([
                      ['profile.cv', lang === 'ja' ? m.cvJp : m.cv],
                      ['profile.birthday', formatBirthday(m.birth, lang)],
                      ['profile.zodiac', pick(m.zodiac, lang)],
                      ['profile.grade', t(`grade.${m.grade}` as Key)],
                      ['profile.height', `${m.height} cm`],
                      ['profile.blood', m.blood],
                      ['profile.unit', m.unit],
                      ['profile.color', pick(m.colorName, lang)],
                      ['profile.trademark', pick(m.trademark, lang)],
                    ] as [Key, string][]).map(([k, v]) => (
                      <div key={k} className="min-w-0">
                        <dt className="text-xs text-haze md:text-sm">{t(k)}</dt>
                        <dd className="mt-0.5 text-sm font-bold leading-tight [overflow-wrap:anywhere] md:text-base">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {/* The signature is the first thing to give way on short screens. */}
                  <img
                    src={memberAssets(m).sign}
                    alt={t('members.signature', { name: m.name })}
                    className="mt-4 h-10 w-auto self-start md:mt-6 md:h-14 [@media(max-height:760px)]:hidden"
                  />
                </motion.div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
