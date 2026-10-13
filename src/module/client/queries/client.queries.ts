import { queryOptions } from '@tanstack/react-query'
import { getClients } from '../api/client.api'

export const clientQueryKeys = {
  all: ['clients'] as const,
  list: () => [...clientQueryKeys.all, 'list'] as const,
}

export function clientsQueryOptions() {
  return queryOptions({
    queryKey: clientQueryKeys.list(),
    queryFn: getClients,
    staleTime: 30_000,
  })
}
