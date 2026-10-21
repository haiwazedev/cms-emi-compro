import { apiClient } from '@/shared/lib/api-client'

export interface SearchItem {
  id: number
  title: string
  language_id?: string
}

export interface SearchResponse {
  articles: SearchItem[]
  document_commitments: SearchItem[]
  divisions: SearchItem[]
  services: SearchItem[]
  board_members: SearchItem[]
  faqs: SearchItem[]
  // Empty unless the current user has `manage_users`.
  users: SearchItem[]
  inboxes: SearchItem[]
}

export async function searchContent(q: string) {
  const { data } = await apiClient.get<SearchResponse>('/admin/search', {
    params: { q },
  })

  return data
}
