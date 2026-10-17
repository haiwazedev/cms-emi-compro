import { queryOptions } from '@tanstack/react-query'
import { getSiteSettings } from '../api/site-settings.api'

export const siteSettingsQueryKeys = {
  all: ['site-settings'] as const,
  detail: (languageId: number) =>
    [...siteSettingsQueryKeys.all, languageId] as const,
}

export function siteSettingsQueryOptions(languageId: number) {
  return queryOptions({
    queryKey: siteSettingsQueryKeys.detail(languageId),
    queryFn: () => getSiteSettings(languageId),
    staleTime: 30_000,
  })
}
