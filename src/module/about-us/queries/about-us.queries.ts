import { queryOptions } from '@tanstack/react-query'
import { getAboutUsContent } from '../api/about-us.api'

export const aboutUsContentQueryKeys = {
  all: ['about-us-content'] as const,
  page: () => [...aboutUsContentQueryKeys.all, 'about-us'] as const,
}

export function aboutUsContentQueryOptions() {
  return queryOptions({
    queryKey: aboutUsContentQueryKeys.page(),
    queryFn: getAboutUsContent,
    staleTime: 30_000,
  })
}
