import { useEffect, useState, type ReactNode } from 'react'
import { DICTIONARIES, I18nContext, type Locale } from './i18n-context'

const STORAGE_KEY = 'locale'

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored && stored in DICTIONARIES ? (stored as Locale) : 'id'
}

function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState(getInitialLocale)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale])

  return (
    <I18nContext value={{ locale, setLocale, t: DICTIONARIES[locale] }}>
      {children}
    </I18nContext>
  )
}

export { I18nProvider }
