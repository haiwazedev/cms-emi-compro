import { queryOptions } from '@tanstack/react-query'
import { getHomeContent } from '../api/home.api'

export const homeContentQueryKeys = {
  all: ['home-content'] as const,
  page: (languageId: string) =>
    [...homeContentQueryKeys.all, 'home', languageId] as const,
}

export function homeContentQueryOptions(languageId: string) {
  return queryOptions({
    queryKey: homeContentQueryKeys.page(languageId),
    queryFn: () => getHomeContent(languageId),
    staleTime: 30_000,
  })
}
