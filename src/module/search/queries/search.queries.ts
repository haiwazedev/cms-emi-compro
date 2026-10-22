import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { searchContent } from '../api/search.api'

export const SEARCH_MIN_LENGTH = 2

export function searchQueryOptions(q: string) {
  return queryOptions({
    queryKey: ['search', q] as const,
    queryFn: () => searchContent(q),
    enabled: q.length >= SEARCH_MIN_LENGTH,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}
