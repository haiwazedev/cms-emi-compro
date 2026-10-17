import type { Language } from '../api/language.api'

export const DEFAULT_LANGUAGE_ID = 'id'

// Bahasa Indonesia, else the first language.
export function findDefaultLanguage(languages: Language[]) {
  return (
    languages.find((item) => item.id === DEFAULT_LANGUAGE_ID) ?? languages[0]
  )
}
