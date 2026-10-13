// shortcut: in-memory mock until the server exposes `/clients` endpoints.
// Swap the function bodies for `apiClient` calls once the API is ready.

export interface Client {
  id: number
  name: string
  media_id: number | null
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

const MOCK_CLIENT_NAMES = [
  'Accenture',
  'ASTRA Otoparts',
  'Cargill',
  'H&M',
  'PT Golden Tekstil Indonesia',
  'Pupuk Iskandar Muda',
  'The Ritz-Carlton',
  'UNIQLO',
]

let mockClients: Client[] = MOCK_CLIENT_NAMES.map((name, index) => ({
  id: index + 1,
  name,
  media_id: null,
  sort_order: index + 1,
  created_at: '2026-10-13T10:30:00.000Z',
  created_by: 'Admin',
  updated_at: null,
  updated_by: null,
}))

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 300))
}

export async function getClients() {
  await delay()
  return [...mockClients]
}

export async function createClient(fields: ClientWriteFields) {
  await delay()
  const client: Client = {
    ...fields,
    id: Math.max(0, ...mockClients.map((item) => item.id)) + 1,
    sort_order: mockClients.length + 1,
    created_at: new Date().toISOString(),
    created_by: 'Admin',
    updated_at: null,
    updated_by: null,
  }
  mockClients = [...mockClients, client]
  return client
}

export async function updateClient(
  clientId: number,
  fields: ClientWriteFields,
) {
  await delay()
  const client = mockClients.find((item) => item.id === clientId)
  if (!client) throw new Error('Klien tidak ditemukan.')

  const updated: Client = {
    ...client,
    ...fields,
    updated_at: new Date().toISOString(),
    updated_by: 'Admin',
  }
  mockClients = mockClients.map((item) =>
    item.id === clientId ? updated : item,
  )
  return updated
}

export async function deleteClient(clientId: number) {
  await delay()
  mockClients = mockClients.filter((item) => item.id !== clientId)
}

export async function reorderClients(clientIds: number[]) {
  await delay()
  mockClients = clientIds.flatMap((id, index) => {
    const client = mockClients.find((item) => item.id === id)
    return client ? [{ ...client, sort_order: index + 1 }] : []
  })
  return [...mockClients]
}
