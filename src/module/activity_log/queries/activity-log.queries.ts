import { queryOptions } from '@tanstack/react-query'
import { getActivityLogs } from '../api/activity-log.api'
import type { ActivityLogListParams } from '../api/activity-log.api'

export const activityLogQueryKeys = {
  all: ['activityLogs'] as const,
  list: (params: ActivityLogListParams) =>
    [...activityLogQueryKeys.all, 'list', params] as const,
}

// No staleTime: the dashboard refetches on every visit.
export function activityLogsQueryOptions(params: ActivityLogListParams) {
  return queryOptions({
    queryKey: activityLogQueryKeys.list(params),
    queryFn: () => getActivityLogs(params),
  })
}
