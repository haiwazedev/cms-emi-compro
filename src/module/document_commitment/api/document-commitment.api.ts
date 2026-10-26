import { apiClient } from '@/shared/lib/api-client'

export type DocumentCommitmentStatus = 'DRAFT' | 'PUBLISHED'

export interface DocumentCommitmentCategoryContent {
  language_id: string
  name: string
  slug: string
}

export interface DocumentCommitmentCategorySummary {
  id: number
  name: string
  slug: string
}

export interface DocumentCommitmentCategory {
  id: number
  contents: DocumentCommitmentCategoryContent[]
}

export interface DocumentCommitmentContent {
  language_id: string
  title: string
}

interface DocumentCommitmentMetadata {
  id: number
  document_commitment_category_id: number
  file_path: string
  filename: string
  size: number
  status: DocumentCommitmentStatus
  uploaded_at: string
  uploaded_by: string
  updated_at: string | null
  updated_by: string | null
}

export interface DocumentCommitmentListItem extends DocumentCommitmentMetadata {
  title: string
  document_commitment_category: DocumentCommitmentCategorySummary
}

export interface DocumentCommitment extends DocumentCommitmentMetadata {
  contents: DocumentCommitmentContent[]
  document_commitment_category: {
    id: number
    contents: DocumentCommitmentCategoryContent[]
  }
}

export interface DocumentCommitmentListParams {
  page: number
  limit: number
  search?: string
  document_commitment_category_id?: number
  status?: DocumentCommitmentStatus
}

export interface DocumentCommitmentPagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface DocumentCommitmentListResponse {
  documentCommitments: DocumentCommitmentListItem[]
  pagination: DocumentCommitmentPagination
}

interface DocumentCommitmentSharedFields {
  document_commitment_category_id: number
  status: DocumentCommitmentStatus
}

export type DocumentCommitmentFields =
  | (DocumentCommitmentSharedFields & {
      language_id: string
      title: string
    })
  | (DocumentCommitmentSharedFields & {
      language_id?: never
      title?: never
    })

interface DocumentCommitmentCategoriesResponse {
  documentCommitmentCategories: DocumentCommitmentCategorySummary[]
}

interface DocumentCommitmentCategoryResponse {
  documentCommitmentCategory: DocumentCommitmentCategory
}

interface DocumentCommitmentResponse {
  documentCommitment: DocumentCommitment
}

export async function getDocumentCommitments(
  params: DocumentCommitmentListParams,
) {
  const { data } = await apiClient.get<DocumentCommitmentListResponse>(
    '/admin/document_commitments',
    { params },
  )

  return data
}

export async function getDocumentCommitment(documentId: number) {
  const { data } = await apiClient.get<DocumentCommitmentResponse>(
    `/admin/document_commitments/${documentId}`,
  )

  return data.documentCommitment
}

export async function getDocumentCommitmentCategories() {
  const { data } = await apiClient.get<DocumentCommitmentCategoriesResponse>(
    '/document_commitment_categories',
  )

  return data.documentCommitmentCategories
}

export async function getDocumentCommitmentCategory(categoryId: number) {
  const { data } = await apiClient.get<DocumentCommitmentCategoryResponse>(
    `/document_commitment_categories/${categoryId}`,
  )

  return data.documentCommitmentCategory
}

export async function createDocumentCommitment(
  fields: DocumentCommitmentSharedFields & {
    language_id: string
    title: string
  },
  file: File,
) {
  const formData = new FormData()
  appendDocumentCommitmentFields(formData, fields)
  formData.append('file', file)

  const { data } = await apiClient.post<DocumentCommitmentResponse>(
    '/document_commitments',
    formData,
  )

  return data.documentCommitment
}

export async function updateDocumentCommitment(
  documentId: number,
  fields: DocumentCommitmentFields,
  file?: File,
) {
  let body: FormData | DocumentCommitmentFields = fields
  if (file) {
    const formData = new FormData()
    appendDocumentCommitmentFields(formData, fields)
    formData.append('file', file)
    body = formData
  }

  const { data } = await apiClient.put<DocumentCommitmentResponse>(
    `/document_commitments/${documentId}`,
    body,
  )

  return data.documentCommitment
}

export async function deleteDocumentCommitment(documentId: number) {
  await apiClient.delete<void>(`/document_commitments/${documentId}`)
}

export async function bulkDeleteDocumentCommitments(ids: number[]) {
  const { data } = await apiClient.post<{ deleted_count: number }>(
    '/document_commitments/bulk_delete',
    { ids },
  )

  return data.deleted_count
}

export async function createDocumentCommitmentCategory(fields: {
  language_id: string
  name: string
  slug: string
}) {
  const { data } = await apiClient.post<DocumentCommitmentCategoryResponse>(
    '/document_commitment_categories',
    fields,
  )

  return data.documentCommitmentCategory
}

export async function updateDocumentCommitmentCategory(
  categoryId: number,
  fields: { language_id: string; name: string; slug: string },
) {
  const { data } = await apiClient.put<DocumentCommitmentCategoryResponse>(
    `/document_commitment_categories/${categoryId}`,
    fields,
  )

  return data.documentCommitmentCategory
}

export async function deleteDocumentCommitmentCategory(categoryId: number) {
  await apiClient.delete<void>(`/document_commitment_categories/${categoryId}`)
}

export function getDocumentCommitmentFileUrl(documentId: number) {
  return new URL(
    `/admin/document_commitments/${documentId}/file`,
    apiClient.defaults.baseURL ?? window.location.origin,
  ).toString()
}

function appendDocumentCommitmentFields(
  formData: FormData,
  fields: DocumentCommitmentFields,
) {
  formData.append(
    'document_commitment_category_id',
    String(fields.document_commitment_category_id),
  )
  if (fields.language_id && fields.title) {
    formData.append('language_id', fields.language_id)
    formData.append('title', fields.title)
  }
  formData.append('status', fields.status)
}
