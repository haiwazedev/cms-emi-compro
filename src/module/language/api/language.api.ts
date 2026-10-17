import { apiClient } from '@/shared/lib/api-client'

export interface Language {
  // Lowercase language code, e.g. "id", "en".
  id: string
  language: string
  flag: string
  sort_order: number
  is_active: boolean
}

interface LanguagesResponse {
  languages: Language[]
}

export async function getLanguages() {
  const { data } = await apiClient.get<LanguagesResponse>('/languages')

  return data.languages
}
