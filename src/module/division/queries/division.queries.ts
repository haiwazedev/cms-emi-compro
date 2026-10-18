import { queryOptions } from '@tanstack/react-query'
import { getDivisions, getService, getServices } from '../api/division.api'

export const divisionQueryKeys = {
  all: ['divisions'] as const,
  list: () => [...divisionQueryKeys.all, 'list'] as const,
}

export const serviceQueryKeys = {
  all: ['services'] as const,
  list: () => [...serviceQueryKeys.all, 'list'] as const,
  detail: (serviceId: number) => [...serviceQueryKeys.all, serviceId] as const,
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

export function serviceQueryOptions(serviceId: number) {
  return queryOptions({
    queryKey: serviceQueryKeys.detail(serviceId),
    queryFn: () => getService(serviceId),
    staleTime: 30_000,
  })
}
