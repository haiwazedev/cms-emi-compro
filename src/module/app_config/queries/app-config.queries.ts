import { queryOptions } from '@tanstack/react-query'
import { getAppConfigs } from '../api/app-config.api'

export function appConfigsQueryOptions() {
  return queryOptions({
    queryKey: ['app_configs'] as const,
    queryFn: getAppConfigs,
    staleTime: 5 * 60_000,
  })
}
