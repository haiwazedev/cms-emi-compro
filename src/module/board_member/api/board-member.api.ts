import { apiClient } from '@/shared/lib/api-client'

export interface BoardMemberType {
  id: number
  type: string
  language_id: string
}

export interface BoardMemberContent {
  language_id: string
  role: string
  board_member_type_id: number
  description: string | null
  board_member_type: BoardMemberType
}

export interface BoardMember {
  id: number
  name: string
  company_name: string | null
  photo: string | null
  sort_order: number
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
  contents: BoardMemberContent[]
}

export interface BoardMemberListParams {
  search?: string
  board_member_type_id?: number
}

export interface BoardMemberFields {
  name: string
  company_name?: string | null
  language_id: string
  role: string
  board_member_type_id: number
  description?: string | null
  sort_order?: number
}

export type BoardMemberUpdateFields =
  | (Partial<Pick<BoardMemberFields, 'name' | 'company_name' | 'sort_order'>> &
      Pick<BoardMemberFields, 'language_id'> &
      Partial<
        Pick<BoardMemberFields, 'role' | 'board_member_type_id' | 'description'>
      >)
  | Partial<Pick<BoardMemberFields, 'name' | 'company_name' | 'sort_order'>>

interface BoardMembersResponse {
  board_members: BoardMember[]
}

interface BoardMemberTypesResponse {
  board_member_types: BoardMemberType[]
}

interface BoardMemberResponse {
  board_member: BoardMember
}

interface BoardMemberTypeResponse {
  board_member_type: BoardMemberType
}

export async function getBoardMembers(params: BoardMemberListParams = {}) {
  const { data } = await apiClient.get<BoardMembersResponse>('/board_members', {
    params,
  })

  return data.board_members
}

export async function getBoardMemberTypes() {
  const { data } = await apiClient.get<BoardMemberTypesResponse>(
    '/board_member_types',
  )

  return data.board_member_types
}

export async function createBoardMember(
  fields: BoardMemberFields,
  photo?: File,
) {
  const body = photo ? toBoardMemberFormData(fields, photo) : fields
  const { data } = await apiClient.post<BoardMemberResponse>(
    '/board_members',
    body,
  )

  return data.board_member
}

export async function updateBoardMember(
  memberId: number,
  fields: BoardMemberUpdateFields,
  photo?: File,
) {
  const body = photo ? toBoardMemberFormData(fields, photo) : fields
  const { data } = await apiClient.put<BoardMemberResponse>(
    `/board_members/${memberId}`,
    body,
  )

  return data.board_member
}

export async function deleteBoardMember(memberId: number) {
  await apiClient.delete<void>(`/board_members/${memberId}`)
}

export async function createBoardMemberType(type: string, languageId: string) {
  const { data } = await apiClient.post<BoardMemberTypeResponse>(
    '/board_member_types',
    { type, language_id: languageId },
  )

  return data.board_member_type
}

export async function updateBoardMemberType(typeId: number, type: string) {
  const { data } = await apiClient.put<BoardMemberTypeResponse>(
    `/board_member_types/${typeId}`,
    { type },
  )

  return data.board_member_type
}

export async function deleteBoardMemberType(typeId: number) {
  await apiClient.delete<void>(`/board_member_types/${typeId}`)
}

export function getBoardMemberAssetUrl(path: string, version?: string) {
  const url = new URL(
    path,
    apiClient.defaults.baseURL ?? window.location.origin,
  )
  if (version !== undefined) url.searchParams.set('v', version)

  return url.toString()
}

function toBoardMemberFormData(fields: BoardMemberUpdateFields, photo: File) {
  const formData = new FormData()

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      const serializedValue =
        key === 'company_name' && value === null ? '' : String(value)
      formData.append(key, serializedValue)
    }
  }
  formData.append('photo', photo)

  return formData
}
