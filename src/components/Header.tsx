import { Link } from '@tanstack/react-router'
import { Github } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { useI18n } from '../i18n/I18nProvider'

export default function Header() {
  const t = useTranslations('header')

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-cyan-500/20">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="text-white">
          <div className="text-xl font-bold font-mono text-cyan-400">
            <span className="text-cyan-500">{'>'}</span> {t('title')}
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-cyan-500/30 text-sm font-medium text-cyan-300 hover:border-cyan-400 hover:text-cyan-200 transition-all duration-200"
          >
            <Github className="h-4 w-4" />
            {t('github')}
          </a>
        </div>
      </div>
    </header>
  )
}

function LocaleSwitcher() {
  const { locale, setLocale } = useI18n()
  const t = useTranslations('header')
  const nextLocale = locale === 'zh' ? 'en' : 'zh'
  const nextLabel = nextLocale === 'zh' ? t('switchToZh') : t('switchToEn')

  return (
    <button
      type="button"
      aria-label={nextLabel}
      onClick={() => setLocale(nextLocale)}
      className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-slate-900 px-3 py-2 text-sm font-medium text-cyan-200 hover:border-cyan-400 transition-colors"
    >
      <span className="text-cyan-400 font-mono text-xs">{t('switchLabel')}</span>
      <span className="rounded px-2 py-1 text-white bg-cyan-600/30 border border-cyan-500/40 font-semibold">
        {nextLocale === 'zh' ? '中文' : 'EN'}
      </span>
    </button>
  )
}
