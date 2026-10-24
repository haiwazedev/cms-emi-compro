import { apiClient } from '@/shared/lib/api-client'

export type AppConfigs = Partial<
  Record<'max_users' | 'landing_site_url', string>
>

export async function getAppConfigs() {
  const { data } = await apiClient.get<{ app_configs: AppConfigs }>(
    '/app_configs',
  )
  return data.app_configs
}

// Matches the server: a missing or non-positive-integer value means no limit.
export function getMaxUsers(configs: AppConfigs) {
  const max = Number(configs.max_users)
  return Number.isInteger(max) && max > 0 ? max : null
}
