import { apiClient } from '@/shared/lib/api-client'

export type DocumentCommitmentStatus = 'DRAFT' | 'PUBLISHED'

export interface DocumentCommitmentCategory {
  id: number
  name: string
}

export interface DocumentCommitment {
  id: number
  document_commitment_category_id: number
  title: string
  file_path: string
  filename: string
  size: number
  status: DocumentCommitmentStatus
  uploaded_at: string
  uploaded_by: string
  updated_at: string | null
  updated_by: string | null
  document_commitment_category: DocumentCommitmentCategory
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
  documentCommitments: DocumentCommitment[]
  pagination: DocumentCommitmentPagination
}

export interface DocumentCommitmentFields {
  document_commitment_category_id: number
  title: string
  status: DocumentCommitmentStatus
}

interface DocumentCommitmentCategoriesResponse {
  documentCommitmentCategories: DocumentCommitmentCategory[]
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

export async function getDocumentCommitmentCategories() {
  const { data } = await apiClient.get<DocumentCommitmentCategoriesResponse>(
    '/document_commitment_categories',
  )

  return data.documentCommitmentCategories
}

export async function createDocumentCommitment(
  fields: DocumentCommitmentFields,
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

export async function createDocumentCommitmentCategory(name: string) {
  const { data } = await apiClient.post<DocumentCommitmentCategoryResponse>(
    '/document_commitment_categories',
    { name },
  )

  return data.documentCommitmentCategory
}

export async function updateDocumentCommitmentCategory(
  categoryId: number,
  name: string,
) {
  const { data } = await apiClient.put<DocumentCommitmentCategoryResponse>(
    `/document_commitment_categories/${categoryId}`,
    { name },
  )

  return data.documentCommitmentCategory
}

export async function deleteDocumentCommitmentCategory(categoryId: number) {
  await apiClient.delete<void>(`/document_commitment_categories/${categoryId}`)
}

export function getDocumentCommitmentAssetUrl(path: string) {
  return new URL(
    path,
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
  formData.append('title', fields.title)
  formData.append('status', fields.status)
}
