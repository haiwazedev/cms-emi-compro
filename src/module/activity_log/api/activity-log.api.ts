import { apiClient } from '@/shared/lib/api-client'

export type ActivityAction =
  'CREATE' | 'UPDATE' | 'DELETE' | 'REORDER' | 'RESEND_INVITE'

export type ActivityResource =
  | 'ARTICLE'
  | 'ARTICLE_CATEGORY'
  | 'BOARD_MEMBER'
  | 'BOARD_MEMBER_TYPE'
  | 'CLIENT'
  | 'DIVISION'
  | 'DOCUMENT_COMMITMENT'
  | 'DOCUMENT_COMMITMENT_CATEGORY'
  | 'FAQ'
  | 'MEDIA'
  | 'ROLE'
  | 'ROLE_PERMISSION'
  | 'SERVICE'
  | 'SITE_CONTENT'
  | 'SITE_SETTING'
  | 'USER'

export interface ActivityLog {
  id: number
  name: string
  action: ActivityAction
  resource: ActivityResource
  // The affected item's name, shown as is.
  action_result: string | null
  // Set instead of action_result for bulk actions.
  item_count: number | null
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
