import { apiClient } from '@/shared/lib/api-client'

export interface HomeContentRecord {
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

export type HomeContentWriteItem =
  | {
      page: 'home'
      block_key: 'hero-carousel'
      block_type: 'carousel-slide'
      sort_order: number
      data: { title_1: string; title_2: string; subtitle: string }
      media_id: number | null
    }
  | {
      page: 'home'
      block_key: 'statistic'
      block_type: 'statistic-item'
      sort_order: number
      data: { label: string; number: string; description: string }
    }
  | {
      page: 'home'
      block_key: 'teaser'
      block_type: 'teaser-title'
      data: { title: string }
    }
  | {
      page: 'home'
      block_key: 'teaser'
      block_type: 'cta-title'
      data: { title: string }
    }
  | {
      page: 'home'
      block_key: 'teaser'
      block_type: 'teaser-content'
      data: { content: string }
    }

interface HomeContentResponse {
  contents: HomeContentRecord[]
}

export async function getHomeContent() {
  const { data } = await apiClient.get<HomeContentResponse>('/contents', {
    params: { page: 'home' },
  })

  return data.contents
}

export async function saveHomeContent(items: HomeContentWriteItem[]) {
  const { data } = await apiClient.put<HomeContentResponse>('/contents', items)

  return data.contents
}
