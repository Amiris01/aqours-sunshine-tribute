import { useRef, type CSSProperties } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, m as motion } from 'motion/react'
import { members, memberAssets } from '../../content/members'
import { pick } from '../../content/types'
import { formatBirthday } from '../../lib/format'
import { useT, type Key } from '../../i18n'
import { useLang } from '../../store/lang'

interface Props {
  num: string | null
  onNavigate(num: string): void
  onClose(): void
  returnFocus(num: string): void
}

const navBtn = 'grid size-11 place-items-center rounded-full border border-white/15 transition hover:bg-white/10'

export function MemberView({ num, onNavigate, onClose, returnFocus }: Props) {
  const t = useT()
  const lang = useLang((s) => s.lang)
  const idx = num ? members.findIndex((m) => m.num === num) : -1
  const m = idx >= 0 ? members[idx] : undefined
  const lastNum = useRef<string | null>(null)
  if (num) lastNum.current = num

  const go = (d: number) => {
    if (idx < 0) return
    onNavigate(members[(idx + d + members.length) % members.length]!.num)
  }

  return (
    <Dialog.Root open={Boolean(m)} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {m && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-sea-950/85 backdrop-blur-md"
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
              className="fixed inset-0 z-50 overflow-y-auto outline-none"
            >
              {/* The content layer covers the overlay, so it handles "click outside" itself:
                  only clicks on this empty backdrop area (not its children) close. */}
              <motion.div
                data-testid="member-backdrop"
                onClick={(e) => {
                  if (e.target === e.currentTarget) onClose()
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.25 }}
                className="mx-auto grid min-h-full max-w-6xl items-center gap-8 p-4 pt-8 md:grid-cols-[1.2fr_1fr] md:p-10"
              >
                <motion.div
                  key={m.num}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="relative aspect-[16/10] overflow-hidden rounded-3xl md:aspect-auto md:h-[72vh]">
                  <img src={memberAssets(m).banner} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 shadow-[inset_0_0_120px_20px_var(--color-sea-950)]" aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--c)] shadow-[0_0_30px_var(--c)]" aria-hidden="true" />
                </motion.div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--c)]">{m.num} · {m.unit}</p>
                  <Dialog.Title className="mt-2 font-display text-4xl md:text-6xl">{m.name}</Dialog.Title>
                  <p lang="ja" className="mt-1 text-mist">{m.jp}</p>
                  <p className="mt-5 text-lg leading-relaxed">{t(`blurb.${m.num}` as Key)}</p>
                  <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {([
                      ['profile.cv', lang === 'ja' ? m.cvJp : m.cv],
                      ['profile.birthday', formatBirthday(m.birth, lang)],
                      ['profile.zodiac', pick(m.zodiac, lang)],
                      ['profile.grade', t(`grade.${m.grade}` as Key)],
                      ['profile.height', `${m.height} cm`],
                      ['profile.blood', m.blood],
                      ['profile.color', pick(m.colorName, lang)],
                      ['profile.trademark', pick(m.trademark, lang)],
                    ] as [Key, string][]).map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-[11px] uppercase tracking-[0.18em] text-mist">{t(k)}</dt>
                        <dd className="mt-0.5">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <img src={memberAssets(m).sign} alt={t('members.signature', { name: m.name })} className="mt-6 h-16 w-auto opacity-90" />
                  <div className="mt-8 flex gap-2">
                    <button type="button" className={navBtn} onClick={() => go(-1)} aria-label={t('members.prev')}>←</button>
                    <button type="button" className={navBtn} onClick={() => go(1)} aria-label={t('members.next')}>→</button>
                    <Dialog.Close className={`${navBtn} ml-auto`} aria-label={t('members.close')}>✕</Dialog.Close>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
