import { createRole, deleteRole, updateRole } from '@/module/user/api/user.api'
import type { Role, RoleFields } from '@/module/user/api/user.api'
import { ConfirmDeleteDialog } from '@/module/user/components/confirm-delete-dialog'
import { ListError, ListMessage } from '@/module/user/components/list-state'
import { RoleFormDialog } from '@/module/user/components/role-form-dialog'
import {
  ROLE_LABELS,
  USER_LABELS,
} from '@/module/user/constants/user.constants'
import { useCurrentUserRecord } from '@/module/user/hooks/use-current-user-record'
import {
  rolesQueryOptions,
  userQueryKeys,
} from '@/module/user/queries/user.queries'
import { Button } from '@/shared/components/ui/button'
import { ApiError } from '@/shared/lib/api-client'
import { toast } from '@/shared/lib/toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { KeyRoundIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

function RolesPage() {
  const queryClient = useQueryClient()
  const rolesQuery = useQuery(rolesQueryOptions())
  const currentUser = useCurrentUserRecord()
  const [formOpen, setFormOpen] = useState(false)
  const [roleToEdit, setRoleToEdit] = useState<Role>()
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  const saveMutation = useMutation({
    mutationFn: ({
      roleId,
      fields,
    }: {
      roleId?: number
      fields: RoleFields
    }) => (roleId ? updateRole(roleId, fields) : createRole(fields)),
    onSuccess: async () => {
      setFormOpen(false)
      setRoleToEdit(undefined)
      // User rows and the permission matrix show role names.
      await invalidateUserAccess()
      toast.add({
        title: 'Berhasil',
        description: ROLE_LABELS.roleSaved,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error ? error.message : ROLE_LABELS.roleSaveFailed,
        type: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: async () => {
      setRoleToDelete(null)
      // The role's users are deleted too.
      await invalidateUserAccess()
      toast.add({
        title: 'Berhasil',
        description: ROLE_LABELS.roleDeleted,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error ? error.message : ROLE_LABELS.roleDeleteFailed,
        type: 'error',
      })
    },
  })

  const nameConflict =
    saveMutation.error instanceof ApiError && saveMutation.error.status === 409
      ? saveMutation.error.message
      : undefined

  function invalidateUserAccess() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: userQueryKeys.roles() }),
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all }),
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.rolePermissions(),
      }),
    ])
  }

  function openForm(role?: Role) {
    saveMutation.reset()
    setRoleToEdit(role)
    setFormOpen(true)
  }

  return (
    <div className="bg-primary flex min-h-full flex-col gap-6 p-4 lg:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <Button
            asChild
            variant="link"
            className="text-secondary h-auto self-start px-0"
          >
            <Link to="/users">{ROLE_LABELS.backToUsers}</Link>
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-accent text-2xl font-bold lg:text-3xl">
              {ROLE_LABELS.pageTitle}
            </h1>
            <p className="text-muted text-sm lg:text-base">
              {ROLE_LABELS.description}
            </p>
          </div>
        </div>
        <Button
          type="button"
          className="self-start lg:self-auto"
          onClick={() => openForm()}
        >
          <PlusIcon aria-hidden="true" className="size-4" />
          {ROLE_LABELS.addRole}
        </Button>
      </header>

      <section
        aria-label={ROLE_LABELS.pageTitle}
        className="bg-background border-border overflow-hidden rounded-xl border shadow-sm"
      >
        {rolesQuery.isPending ? (
          <ListMessage role="status" message={USER_LABELS.loading} />
        ) : rolesQuery.isError ? (
          <ListError
            error={rolesQuery.error}
            fallback={ROLE_LABELS.rolesFailed}
            onRetry={() => void rolesQuery.refetch()}
          />
        ) : rolesQuery.data.length === 0 ? (
          <ListMessage message={ROLE_LABELS.noRoles} />
        ) : (
          <ul className="divide-border divide-y">
            {rolesQuery.data.map((role) => {
              const isOwnRole = currentUser?.role?.id === role.id

              return (
                <li
                  key={role.id}
                  className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="bg-secondary/10 text-accent flex size-10 shrink-0 items-center justify-center rounded-lg">
                      <KeyRoundIcon aria-hidden="true" className="size-4" />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-accent font-semibold break-words">
                        {role.name}
                      </span>
                      {role.description && (
                        <span className="text-muted text-sm">
                          {role.description}
                        </span>
                      )}
                      <span className="text-muted text-xs">
                        {ROLE_LABELS.userCount(role.user_count)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end lg:self-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={ROLE_LABELS.editRole(role.name)}
                      onClick={() => openForm(role)}
                    >
                      <PencilIcon aria-hidden="true" className="size-4" />
                    </Button>
                    <span
                      title={
                        isOwnRole ? ROLE_LABELS.cannotDeleteOwnRole : undefined
                      }
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={isOwnRole || deleteMutation.isPending}
                        aria-label={ROLE_LABELS.deleteRole(role.name)}
                        onClick={() => setRoleToDelete(role)}
                      >
                        <Trash2Icon aria-hidden="true" className="size-4" />
                      </Button>
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <RoleFormDialog
        key={`${roleToEdit?.id ?? 'new'}-${formOpen}`}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setRoleToEdit(undefined)
        }}
        role={roleToEdit}
        pending={saveMutation.isPending}
        serverError={nameConflict}
        onSubmit={(fields) =>
          saveMutation.mutate({ roleId: roleToEdit?.id, fields })
        }
      />

      <ConfirmDeleteDialog
        open={roleToDelete !== null}
        title={ROLE_LABELS.deleteRoleTitle}
        itemName={roleToDelete?.name}
        description={
          roleToDelete
            ? ROLE_LABELS.deleteRoleDescription(
                roleToDelete.name,
                roleToDelete.user_count,
              )
            : undefined
        }
        closeLabel={ROLE_LABELS.closeDeleteRoleDialog}
        pending={deleteMutation.isPending}
        onCancel={() => setRoleToDelete(null)}
        onConfirm={() => {
          if (roleToDelete) deleteMutation.mutate(roleToDelete.id)
        }}
      />
    </div>
  )
}

export { RolesPage }
