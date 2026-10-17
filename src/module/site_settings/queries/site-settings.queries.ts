import { queryOptions } from '@tanstack/react-query'
import { getSiteSettings } from '../api/site-settings.api'

export const siteSettingsQueryKeys = {
  all: ['site-settings'] as const,
}

export function siteSettingsQueryOptions() {
  return queryOptions({
    queryKey: siteSettingsQueryKeys.all,
    queryFn: getSiteSettings,
    staleTime: 30_000,
  })
}
