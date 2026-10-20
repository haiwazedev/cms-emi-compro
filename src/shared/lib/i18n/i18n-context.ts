import { createContext, useContext } from 'react'
import { en } from './en'
import { id, type Dictionary } from './id'

const DICTIONARIES = { id, en }

type Locale = keyof typeof DICTIONARIES

const LOCALES = Object.keys(DICTIONARIES) as Locale[]

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Dictionary
}

const I18nContext = createContext<I18nContextValue | null>(null)

function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}

export { DICTIONARIES, I18nContext, LOCALES, useI18n, type Locale }
