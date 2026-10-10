import { apiClient } from '@/shared/lib/api-client'

export interface AboutUsContentRecord {
  id: number
  page: string
  block_key: string
  block_type: string
  sort_order: number
  data: Record<string, string> | null
  media_id: number | null
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
      data: null
      media_id: number | null
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
      data: { period: string; description: string }
    }

interface AboutUsContentResponse {
  contents: AboutUsContentRecord[]
}

export async function getAboutUsContent() {
  const { data } = await apiClient.get<AboutUsContentResponse>('/contents', {
    params: { page: 'about-us' },
  })

  return data.contents
}

export async function saveAboutUsContent(items: AboutUsContentWriteItem[]) {
  const { data } = await apiClient.put<AboutUsContentResponse>(
    '/contents',
    items,
  )

  return data.contents
}
