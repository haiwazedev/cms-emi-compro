import { apiClient } from '@/shared/lib/api-client'

export type MediaType = 'PICTURE' | 'DOCUMENT'
export type MediaSortOrder = 'asc' | 'desc'

export interface Media {
  id: number
  filename: string
  alt: string | null
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

export interface MediaWriteFields {
  filename: string
  alt: string
}

export async function uploadMedia(
  file: File,
  type: MediaType,
  fields: MediaWriteFields = { filename: file.name, alt: '' },
) {
  const formData = new FormData()
  formData.append('type', type)
  formData.append('file', file)
  formData.append('filename', fields.filename)
  formData.append('alt', fields.alt)

  const { data } = await apiClient.post<MediaResponse>('/media', formData)

  return data.media
}

export async function updateMedia(id: number, fields: MediaWriteFields) {
  const { data } = await apiClient.put<MediaResponse>(`/media/${id}`, fields)

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
