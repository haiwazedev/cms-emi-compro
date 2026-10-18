import type { AuthUser } from '@/module/auth/api/auth.api'
import { authQueryOptions } from '@/module/auth/queries/auth.queries'
import { useQuery } from '@tanstack/react-query'

export function getPermissions(user: AuthUser | null | undefined) {
  const has = (permission: string) =>
    user?.permissions.includes(permission) ?? false

  return {
    // publish also allows add and edit.
    canWrite: has('write') || has('publish'),
    canPublish: has('publish'),
    canDelete: has('delete'),
    canManageUsers: has('manage_users'),
  }
}

// UI hint only; the API enforces every permission.
export function usePermissions() {
  const { data: user } = useQuery(authQueryOptions())

  return getPermissions(user)
}
