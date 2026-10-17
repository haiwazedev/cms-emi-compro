import { queryOptions } from '@tanstack/react-query'
import { getLanguages } from '../api/language.api'

export const languageQueryKeys = {
  all: ['languages'] as const,
}

export function languagesQueryOptions() {
  return queryOptions({
    queryKey: languageQueryKeys.all,
    queryFn: getLanguages,
    staleTime: 5 * 60_000,
  })
}
