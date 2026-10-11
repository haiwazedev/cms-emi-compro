import { queryOptions } from '@tanstack/react-query'
import {
  getDocumentCommitmentCategories,
  getDocumentCommitments,
} from '../api/document-commitment.api'
import type { DocumentCommitmentListParams } from '../api/document-commitment.api'

export const documentCommitmentQueryKeys = {
  all: ['documentCommitments'] as const,
  lists: () => [...documentCommitmentQueryKeys.all, 'list'] as const,
  list: (params: DocumentCommitmentListParams) =>
    [...documentCommitmentQueryKeys.lists(), params] as const,
  categories: () => [...documentCommitmentQueryKeys.all, 'categories'] as const,
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
