import { queryOptions } from '@tanstack/react-query'
import { getHomeContent } from '../api/home.api'

export const homeContentQueryKeys = {
  all: ['home-content'] as const,
  page: () => [...homeContentQueryKeys.all, 'home'] as const,
}

export function homeContentQueryOptions() {
  return queryOptions({
    queryKey: homeContentQueryKeys.page(),
    queryFn: getHomeContent,
    staleTime: 30_000,
  })
}
