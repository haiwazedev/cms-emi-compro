import { apiClient } from '@/shared/lib/api-client'

export interface InboxSubject {
  id: number
  name: string
}

export interface Inbox {
  id: number
  name: string
  email: string
  company: string | null
  phone: string | null
  message: string
  is_read: boolean
  inbox_subject: InboxSubject
  created_at: string
}

export interface InboxListParams {
  page: number
  search?: string
  inbox_subject_id?: number
}

export interface InboxCounts {
  unreadCount: number
  readCount: number
}

export interface InboxesResponse {
  inboxes: Inbox[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export async function getInboxes(params: InboxListParams) {
  const { data } = await apiClient.get<InboxesResponse>('/inboxes', {
    params,
  })
  return data
}

export async function getInboxCounts() {
  const { data } = await apiClient.get<InboxCounts>('/inboxes/counts')
  return data
}

export async function getInboxSubjects() {
  const { data } = await apiClient.get<{ inbox_subjects: InboxSubject[] }>(
    '/inbox-subjects',
  )
  return data.inbox_subjects
}

export async function updateInboxRead(inboxId: number, isRead: boolean) {
  const { data } = await apiClient.put<{ inbox: Inbox }>(
    '/inboxes/' + inboxId,
    { is_read: isRead },
  )
  return data.inbox
}

export async function markAllInboxesRead() {
  await apiClient.post<void>('/inboxes/read-all')
}

export async function deleteInbox(inboxId: number) {
  await apiClient.delete<void>('/inboxes/' + inboxId)
}
