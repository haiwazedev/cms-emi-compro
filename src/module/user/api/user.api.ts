import { apiClient } from '@/shared/lib/api-client'

export interface Role {
  id: number
  name: string
  description: string | null
  user_count: number
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
}

export interface Permission {
  id: number
  name: string
}

export interface RolePermission {
  role_id: number
  permission_id: number
  is_allowed: boolean
  updated_at: string | null
  updated_by: string | null
}

export interface User {
  id: number
  name: string
  email: string
  role: { id: number; name: string } | null
  is_active: boolean
  // True until the user accepts the invite and sets a password.
  is_pending: boolean
  last_signed_in: string | null
}

export interface UserListParams {
  page: number
  limit: number
  search?: string
  role_id?: number
}

export interface UserPagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface UserListResponse {
  users: User[]
  pagination: UserPagination
}

export type RoleFields = Pick<Role, 'name' | 'description'>
// is_active is update-only; new users start inactive until they accept the invite.
export type UserFields = Pick<User, 'name' | 'email'> & {
  role_id: number | null
  is_active?: boolean
}

export async function getRoles() {
  const { data } = await apiClient.get<{ roles: Role[] }>('/roles')
  return data.roles
}

export async function createRole(fields: RoleFields) {
  const { data } = await apiClient.post<{ role: Role }>('/roles', fields)
  return data.role
}

export async function updateRole(roleId: number, fields: RoleFields) {
  const { data } = await apiClient.put<{ role: Role }>(
    `/roles/${roleId}`,
    fields,
  )
  return data.role
}

export async function deleteRole(roleId: number): Promise<void> {
  await apiClient.delete(`/roles/${roleId}`)
}

export async function getPermissions() {
  const { data } = await apiClient.get<{ permissions: Permission[] }>(
    '/permissions',
  )
  return data.permissions
}

export async function getRolePermissions() {
  const { data } = await apiClient.get<{ rolePermissions: RolePermission[] }>(
    '/role_permissions',
  )
  return data.rolePermissions
}

export async function updateRolePermission(
  roleId: number,
  permissionId: number,
  isAllowed: boolean,
) {
  const { data } = await apiClient.put<{ rolePermission: RolePermission }>(
    `/role_permissions/${roleId}/${permissionId}`,
    { is_allowed: isAllowed },
  )
  return data.rolePermission
}

export async function getUsers(params: UserListParams) {
  const { data } = await apiClient.get<UserListResponse>('/users', { params })
  return data
}

// All users, pending invites included.
export async function getUserCount() {
  const { data } = await apiClient.get<{ total: number }>('/users/count')
  return data.total
}

export async function createUser(fields: UserFields) {
  const { data } = await apiClient.post<{ user: User }>('/users', fields)
  return data.user
}

export async function updateUser(userId: number, fields: UserFields) {
  const { data } = await apiClient.put<{ user: User }>(
    `/users/${userId}`,
    fields,
  )
  return data.user
}

export async function resendInvite(userId: number): Promise<void> {
  await apiClient.post(`/users/${userId}/invite`)
}

export async function deleteUser(userId: number): Promise<void> {
  await apiClient.delete(`/users/${userId}`)
}
