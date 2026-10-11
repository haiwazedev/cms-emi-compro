import { queryOptions } from '@tanstack/react-query'
import { getDivisions, getServices } from '../api/division.api'

export const divisionQueryKeys = {
  all: ['divisions'] as const,
  list: () => [...divisionQueryKeys.all, 'list'] as const,
}

export const serviceQueryKeys = {
  all: ['services'] as const,
  list: () => [...serviceQueryKeys.all, 'list'] as const,
}

export function divisionsQueryOptions() {
  return queryOptions({
    queryKey: divisionQueryKeys.list(),
    queryFn: getDivisions,
    staleTime: 30_000,
  })
}

export function servicesQueryOptions() {
  return queryOptions({
    queryKey: serviceQueryKeys.list(),
    queryFn: getServices,
    staleTime: 30_000,
  })
}
