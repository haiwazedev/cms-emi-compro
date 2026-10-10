import { queryOptions } from '@tanstack/react-query'
import { getCurrentUser } from '../api/auth.api'

export const authQueryKey = ['auth', 'current-user'] as const

export function authQueryOptions() {
  return queryOptions({
    queryKey: authQueryKey,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 0,
  })
}
