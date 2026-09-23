import { useT } from '../../i18n'

export function Footer() {
  const t = useT()
  return (
    <footer className="relative overflow-hidden border-t border-white/5 px-4 pb-40 pt-24 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-aqua/10 to-transparent" aria-hidden="true" />
      <p className="font-display text-5xl font-semibold text-aqua md:text-7xl">{t('foot.mark')}</p>
      <p className="mt-3 text-lg">{t('foot.sub')}</p>
      <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-mist">{t('foot.note')}</p>
    </footer>
  )
}
