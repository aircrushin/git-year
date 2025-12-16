import { NextIntlClientProvider, useLocale as useNextIntlLocale } from 'next-intl'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'

import enMessages, { type AppMessages } from './messages/en'
import zhMessages from './messages/zh'

export type SupportedLocale = 'en' | 'zh'
type LocaleContextValue = {
  locale: SupportedLocale
  setLocale: Dispatch<SetStateAction<SupportedLocale>>
}

const LocaleContext = createContext<LocaleContextValue | null>(null)
const STORAGE_KEY = 'git-year-locale'
const messagesByLocale: Record<SupportedLocale, AppMessages> = {
  en: enMessages,
  zh: zhMessages,
}

function resolveInitialLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'zh'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'zh') return saved
  const navigatorLocale = window.navigator.language.toLowerCase()
  if (navigatorLocale.startsWith('zh')) return 'zh'
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<SupportedLocale>(() => resolveInitialLocale())

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale])

  const contextValue = useMemo(() => ({ locale, setLocale }), [locale])
  const messages = messagesByLocale[locale] || messagesByLocale.zh

  return (
    <LocaleContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}

export function useI18n() {
  const value = useContext(LocaleContext)
  if (!value) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return value
}

export function useCurrentLocale() {
  return useNextIntlLocale() as SupportedLocale
}
