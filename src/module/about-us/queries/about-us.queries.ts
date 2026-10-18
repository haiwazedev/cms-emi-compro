import { queryOptions } from '@tanstack/react-query'
import { getAboutUsContent } from '../api/about-us.api'

export const aboutUsContentQueryKeys = {
  all: ['about-us-content'] as const,
  page: (languageId: string) =>
    [...aboutUsContentQueryKeys.all, 'about-us', languageId] as const,
}

export function aboutUsContentQueryOptions(languageId: string) {
  return queryOptions({
    queryKey: aboutUsContentQueryKeys.page(languageId),
    queryFn: () => getAboutUsContent(languageId),
    staleTime: 30_000,
  })
}
