import { apiClient } from '@/shared/lib/api-client'

export interface AboutUsContentRecord {
  id: number
  page: string
  block_key: string
  block_type: string
  sort_order: number
  data: Record<string, string | null> | null
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
}

export type AboutUsContentWriteItem =
  | {
      page: 'about-us'
      block_key: 'company-profile'
      block_type: 'profile-content'
      data: { content: string }
    }
  | {
      page: 'about-us'
      block_key: 'company-profile'
      block_type: 'company-picture'
      data: { media_filepath: string | null }
    }
  | {
      page: 'about-us'
      block_key: 'mission-vision'
      block_type: 'vision'
      data: { content: string }
    }
  | {
      page: 'about-us'
      block_key: 'mission-vision'
      block_type: 'mission-item'
      sort_order: number
      data: { title: string; description: string }
    }
  | {
      page: 'about-us'
      block_key: 'history_timeline'
      block_type: 'timeline-item'
      sort_order: number
      data: { period: string; title: string; description: string }
    }

interface AboutUsContentResponse {
  site_contents: { language_id: string; items: AboutUsContentRecord[] }
}

export async function getAboutUsContent(languageId: string) {
  const { data } = await apiClient.get<AboutUsContentResponse>(
    '/site_contents',
    { params: { page: 'about-us', language_id: languageId } },
  )

  return data.site_contents.items
}

export async function saveAboutUsContent({
  languageId,
  items,
}: {
  languageId: string
  items: AboutUsContentWriteItem[]
}) {
  const { data } = await apiClient.put<AboutUsContentResponse>(
    '/site_contents',
    { language_id: languageId, items },
  )

  return data.site_contents.items
}
