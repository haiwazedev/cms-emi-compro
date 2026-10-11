import { apiClient } from '@/shared/lib/api-client'

export type DivisionStatus = 'DRAFT' | 'PUBLISHED'

export interface Division {
  id: number
  name: string
  abbr: string
  icon_svg: string | null
  status: DivisionStatus
  sort_order: number
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
}

export interface Service {
  id: number
  division_id: number
  name: string
  sort_order: number
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
  division?: Division
}

export interface DivisionWriteFields {
  name: string
  abbr: string
  icon_svg: string | null
  status: DivisionStatus
}

export interface ServiceWriteFields {
  division_id: number
  name: string
}

interface DivisionsResponse {
  divisions: Division[]
}

interface DivisionResponse {
  division: Division
}

interface ServicesResponse {
  services: Service[]
}

interface ServiceResponse {
  service: Service
}

export async function getDivisions() {
  const { data } = await apiClient.get<DivisionsResponse>('/divisions')
  return data.divisions
}

export async function createDivision(fields: DivisionWriteFields) {
  const { data } = await apiClient.post<DivisionResponse>('/divisions', fields)
  return data.division
}

export async function updateDivision(
  divisionId: number,
  fields: DivisionWriteFields,
) {
  const { data } = await apiClient.put<DivisionResponse>(
    '/divisions/' + divisionId,
    fields,
  )
  return data.division
}

export async function deleteDivision(divisionId: number) {
  await apiClient.delete<void>('/divisions/' + divisionId)
}

export async function reorderDivisions(divisionIds: number[]) {
  const { data } = await apiClient.post<DivisionsResponse>(
    '/divisions/reorder',
    { division_ids: divisionIds },
  )
  return data.divisions
}

export async function getServices() {
  const { data } = await apiClient.get<ServicesResponse>('/services')
  return data.services
}

export async function createService(fields: ServiceWriteFields) {
  const { data } = await apiClient.post<ServiceResponse>('/services', fields)
  return data.service
}

export async function updateService(
  serviceId: number,
  fields: ServiceWriteFields,
) {
  const { data } = await apiClient.put<ServiceResponse>(
    '/services/' + serviceId,
    fields,
  )
  return data.service
}

export async function deleteService(serviceId: number) {
  await apiClient.delete<void>('/services/' + serviceId)
}

export async function reorderServices(
  divisionId: number,
  serviceIds: number[],
) {
  const { data } = await apiClient.post<ServicesResponse>('/services/reorder', {
    division_id: divisionId,
    service_ids: serviceIds,
  })
  return data.services
}
