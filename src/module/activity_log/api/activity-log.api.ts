import { apiClient } from '@/shared/lib/api-client'

export interface ActivityLog {
  id: number
  name: string
  action_type: string
  action_result: string
  created_at: string
}

export interface ActivityLogListParams {
  page: number
  limit: number
}

export interface ActivityLogListResponse {
  activityLogs: ActivityLog[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export async function getActivityLogs(params: ActivityLogListParams) {
  const { data } = await apiClient.get<ActivityLogListResponse>(
    '/activity-logs',
    { params },
  )

  return data
}
