import { queryOptions } from '@tanstack/react-query'
import {
  getPermissions,
  getRolePermissions,
  getRoles,
  getUsers,
} from '../api/user.api'
import type { UserListParams } from '../api/user.api'

export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (params: UserListParams) => [...userQueryKeys.lists(), params] as const,
  roles: () => ['roles'] as const,
  permissions: () => ['permissions'] as const,
  rolePermissions: () => ['role_permissions'] as const,
}

export function usersQueryOptions(params: UserListParams) {
  return queryOptions({
    queryKey: userQueryKeys.list(params),
    queryFn: () => getUsers(params),
    staleTime: 30_000,
  })
}

export function rolesQueryOptions() {
  return queryOptions({
    queryKey: userQueryKeys.roles(),
    queryFn: getRoles,
    staleTime: 5 * 60_000,
  })
}

export function permissionsQueryOptions() {
  return queryOptions({
    queryKey: userQueryKeys.permissions(),
    queryFn: getPermissions,
    staleTime: 5 * 60_000,
  })
}

export function rolePermissionsQueryOptions() {
  return queryOptions({
    queryKey: userQueryKeys.rolePermissions(),
    queryFn: getRolePermissions,
    staleTime: 30_000,
  })
}
