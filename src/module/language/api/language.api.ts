import { apiClient } from '@/shared/lib/api-client'

export interface Language {
  id: number
  language: string
  abbreviated_language: string
  flag: string
  is_active: boolean
}

interface LanguagesResponse {
  languages: Language[]
}

export async function getLanguages() {
  const { data } = await apiClient.get<LanguagesResponse>('/languages')

  return data.languages
}
