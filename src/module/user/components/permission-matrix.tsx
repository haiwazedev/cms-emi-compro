import { updateRolePermission } from '@/module/user/api/user.api'
import type { RolePermission } from '@/module/user/api/user.api'
import { ListError, ListMessage } from '@/module/user/components/list-state'
import {
  PERMISSION_LABELS,
  USER_LABELS,
} from '@/module/user/constants/user.constants'
import {
  permissionsQueryOptions,
  rolePermissionsQueryOptions,
  rolesQueryOptions,
  userQueryKeys,
} from '@/module/user/queries/user.queries'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Switch } from '@/shared/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { toast } from '@/shared/lib/toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

const pairKey = (roleId: number, permissionId: number) =>
  `${roleId}:${permissionId}`

function PermissionMatrix() {
  const queryClient = useQueryClient()
  const rolesQuery = useQuery(rolesQueryOptions())
  const permissionsQuery = useQuery(permissionsQueryOptions())
  const rolePermissionsQuery = useQuery(rolePermissionsQueryOptions())
  // Each switch saves on its own, so track pending pairs instead of one flag.
  const [pendingKeys, setPendingKeys] = useState<ReadonlySet<string>>(new Set())

  const toggleMutation = useMutation({
    mutationFn: ({
      roleId,
      permissionId,
      isAllowed,
    }: {
      roleId: number
      permissionId: number
      isAllowed: boolean
    }) => updateRolePermission(roleId, permissionId, isAllowed),
    onMutate: ({ roleId, permissionId }) =>
      setPendingKeys((keys) =>
        new Set(keys).add(pairKey(roleId, permissionId)),
      ),
    onSuccess: (saved) => {
      queryClient.setQueryData<RolePermission[]>(
        userQueryKeys.rolePermissions(),
        (rows) =>
          rows?.map((row) =>
            row.role_id === saved.role_id &&
            row.permission_id === saved.permission_id
              ? saved
              : row,
          ),
      )
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : USER_LABELS.permissionSaveFailed,
        type: 'error',
      })
    },
    onSettled: (_data, _error, { roleId, permissionId }) =>
      setPendingKeys((keys) => {
        const next = new Set(keys)
        next.delete(pairKey(roleId, permissionId))
        return next
      }),
  })

  const queries = [rolesQuery, permissionsQuery, rolePermissionsQuery]
  const failedQuery = queries.find((query) => query.isError)
  const allowed = new Map(
    rolePermissionsQuery.data?.map((row) => [
      pairKey(row.role_id, row.permission_id),
      row.is_allowed,
    ]),
  )

  return (
    <Card aria-labelledby="roles-title">
      <CardHeader>
        <CardTitle id="roles-title" className="text-base">
          {USER_LABELS.rolesAndPermissions}
        </CardTitle>
      </CardHeader>

      {failedQuery ? (
        <ListError
          error={failedQuery.error}
          fallback={USER_LABELS.permissionsFailed}
          onRetry={() =>
            queries.forEach((query) => {
              if (query.isError) void query.refetch()
            })
          }
        />
      ) : !rolesQuery.data ||
        !permissionsQuery.data ||
        !rolePermissionsQuery.data ? (
        <ListMessage role="status" message={USER_LABELS.loading} />
      ) : rolesQuery.data.length === 0 ? (
        <ListMessage message={USER_LABELS.noRoles} />
      ) : (
        <Table className="min-w-max">
          <TableHeader className="bg-primary">
            <TableRow className="hover:bg-transparent">
              <TableHead className="uppercase">{USER_LABELS.role}</TableHead>
              {permissionsQuery.data.map((permission) => (
                <TableHead
                  key={permission.id}
                  className="w-28 whitespace-normal uppercase"
                >
                  {PERMISSION_LABELS[permission.name] ?? permission.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rolesQuery.data.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="min-w-64">
                  <p className="text-accent font-medium">{role.name}</p>
                  {role.description && (
                    <p className="text-foreground/55 text-xs">
                      {role.description}
                    </p>
                  )}
                </TableCell>
                {permissionsQuery.data.map((permission) => {
                  const key = pairKey(role.id, permission.id)

                  return (
                    <TableCell key={permission.id}>
                      <Switch
                        checked={allowed.get(key) ?? false}
                        disabled={!allowed.has(key) || pendingKeys.has(key)}
                        aria-label={USER_LABELS.permissionToggle(
                          role.name,
                          PERMISSION_LABELS[permission.name] ?? permission.name,
                        )}
                        onCheckedChange={(isAllowed) =>
                          toggleMutation.mutate({
                            roleId: role.id,
                            permissionId: permission.id,
                            isAllowed,
                          })
                        }
                      />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}

export { PermissionMatrix }
