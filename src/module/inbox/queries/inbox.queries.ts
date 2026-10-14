import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { getInboxCounts, getInboxes, getInboxSubjects } from '../api/inbox.api'
import type { InboxListParams } from '../api/inbox.api'

type InboxListFilters = Omit<InboxListParams, 'page'>

export const inboxQueryKeys = {
  all: ['inboxes'] as const,
  lists: () => [...inboxQueryKeys.all, 'list'] as const,
  list: (filters: InboxListFilters) =>
    [...inboxQueryKeys.lists(), filters] as const,
  counts: () => [...inboxQueryKeys.all, 'counts'] as const,
  subjects: () => [...inboxQueryKeys.all, 'subjects'] as const,
}

export function inboxesQueryOptions(filters: InboxListFilters) {
  return infiniteQueryOptions({
    queryKey: inboxQueryKeys.list(filters),
    queryFn: ({ pageParam }) => getInboxes({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: ({ pagination }) =>
      pagination.page < pagination.totalPages ? pagination.page + 1 : undefined,
  })
}

export function inboxCountsQueryOptions() {
  return queryOptions({
    queryKey: inboxQueryKeys.counts(),
    queryFn: getInboxCounts,
    staleTime: 30_000,
  })
}

export function inboxSubjectsQueryOptions() {
  return queryOptions({
    queryKey: inboxQueryKeys.subjects(),
    queryFn: getInboxSubjects,
    staleTime: 5 * 60_000,
  })
}
