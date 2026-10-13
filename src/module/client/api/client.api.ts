import type { Media } from '@/module/media/api/media.api'
import { apiClient } from '@/shared/lib/api-client'

export interface Client {
  id: number
  name: string
  media_id: number | null
  media: Media | null
  sort_order: number
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
}

export interface ClientWriteFields {
  name: string
  media_id: number | null
}

interface ClientsResponse {
  clients: Client[]
}

interface ClientResponse {
  client: Client
}

export async function getClients() {
  const { data } = await apiClient.get<ClientsResponse>('/clients')
  return data.clients
}

export async function createClient(fields: ClientWriteFields) {
  const { data } = await apiClient.post<ClientResponse>('/clients', fields)
  return data.client
}

export async function updateClient(
  clientId: number,
  fields: ClientWriteFields,
) {
  const { data } = await apiClient.put<ClientResponse>(
    '/clients/' + clientId,
    fields,
  )
  return data.client
}

export async function deleteClient(clientId: number) {
  await apiClient.delete<void>('/clients/' + clientId)
}

export async function reorderClients(clientIds: number[]) {
  const { data } = await apiClient.post<ClientsResponse>('/clients/reorder', {
    client_ids: clientIds,
  })
  return data.clients
}
