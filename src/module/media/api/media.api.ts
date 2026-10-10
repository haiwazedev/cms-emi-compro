import { apiClient } from '@/shared/lib/api-client'

export type MediaType = 'PICTURE' | 'DOCUMENT'
export type MediaSortOrder = 'asc' | 'desc'

export interface Media {
  id: number
  filename: string
  path: string
  extension: string
  type: MediaType
  size: number
  metadata: { width: number; height: number } | null
  created_by: string
  created_at: string
}

export interface MediaListParams {
  type?: MediaType
  sort_by: 'created_at'
  sort_order: MediaSortOrder
}

interface MediaListResponse {
  media: Media[]
}

interface MediaResponse {
  media: Media
}

interface BulkDeleteMediaResponse {
  deleted_count: number
}

export async function getMedia(params: MediaListParams) {
  const { data } = await apiClient.get<MediaListResponse>('/media', { params })

  return data.media
}

export async function uploadMedia(file: File, type: MediaType) {
  const formData = new FormData()
  formData.append('type', type)
  formData.append('file', file)

  const { data } = await apiClient.post<MediaResponse>('/media', formData)

  return data.media
}

export async function bulkDeleteMedia(ids: number[]) {
  const { data } = await apiClient.post<BulkDeleteMediaResponse>(
    '/media/bulk_delete',
    { ids },
  )

  return data.deleted_count
}

export function getMediaTypeFromFilename(filename: string): MediaType | null {
  const extension = filename.split('.').at(-1)?.toLowerCase()

  if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
    return 'PICTURE'
  }

  if (extension === 'pdf') {
    return 'DOCUMENT'
  }

  return null
}

export function getMediaAssetUrl(path: string) {
  return new URL(
    path,
    apiClient.defaults.baseURL ?? window.location.origin,
  ).toString()
}
