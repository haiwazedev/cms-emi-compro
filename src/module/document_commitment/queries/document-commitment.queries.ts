import { queryOptions } from '@tanstack/react-query'
import {
  getDocumentCommitment,
  getDocumentCommitmentCategory,
  getDocumentCommitmentCategories,
  getDocumentCommitments,
} from '../api/document-commitment.api'
import type { DocumentCommitmentListParams } from '../api/document-commitment.api'

export const documentCommitmentQueryKeys = {
  all: ['documentCommitments'] as const,
  lists: () => [...documentCommitmentQueryKeys.all, 'list'] as const,
  list: (params: DocumentCommitmentListParams) =>
    [...documentCommitmentQueryKeys.lists(), params] as const,
  details: () => [...documentCommitmentQueryKeys.all, 'detail'] as const,
  categories: () => [...documentCommitmentQueryKeys.all, 'categories'] as const,
  detail: (documentId: number) =>
    [...documentCommitmentQueryKeys.details(), documentId] as const,
  categoryDetail: (categoryId: number) =>
    [...documentCommitmentQueryKeys.all, 'categoryDetail', categoryId] as const,
  categoryDetails: () =>
    [...documentCommitmentQueryKeys.all, 'categoryDetail'] as const,
}

export function documentCommitmentsQueryOptions(
  params: DocumentCommitmentListParams,
) {
  return queryOptions({
    queryKey: documentCommitmentQueryKeys.list(params),
    queryFn: () => getDocumentCommitments(params),
    staleTime: 30_000,
  })
}

export function documentCommitmentCategoriesQueryOptions() {
  return queryOptions({
    queryKey: documentCommitmentQueryKeys.categories(),
    queryFn: getDocumentCommitmentCategories,
    staleTime: 5 * 60_000,
  })
}

export function documentCommitmentQueryOptions(documentId: number) {
  return queryOptions({
    queryKey: documentCommitmentQueryKeys.detail(documentId),
    queryFn: () => getDocumentCommitment(documentId),
    staleTime: 30_000,
  })
}

export function documentCommitmentCategoryQueryOptions(categoryId: number) {
  return queryOptions({
    queryKey: documentCommitmentQueryKeys.categoryDetail(categoryId),
    queryFn: () => getDocumentCommitmentCategory(categoryId),
    staleTime: 5 * 60_000,
  })
}
