import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { authQueryKey } from '@/module/auth/queries/auth.queries'
import {
  createUser,
  deleteUser,
  resendInvite,
  updateUser,
} from '@/module/user/api/user.api'
import type { User, UserFields } from '@/module/user/api/user.api'
import { ConfirmDeleteDialog } from '@/module/user/components/confirm-delete-dialog'
import { ListError, ListMessage } from '@/module/user/components/list-state'
import { PermissionMatrix } from '@/module/user/components/permission-matrix'
import { UserFormDialog } from '@/module/user/components/user-form-dialog'
import {
  formatDateTime,
  formatRelativeTime,
} from '@/module/user/constants/user.constants'
import { useCurrentUserRecord } from '@/module/user/hooks/use-current-user-record'
import {
  rolesQueryOptions,
  userCountQueryOptions,
  userQueryKeys,
  usersQueryOptions,
} from '@/module/user/queries/user.queries'
import { getMaxUsers } from '@/module/app_config/api/app-config.api'
import { appConfigsQueryOptions } from '@/module/app_config/queries/app-config.queries'
import type { UserSearch } from '@/module/user/schemas/user-search.schema'
import { Button } from '@/shared/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { ApiError } from '@/shared/lib/api-client'
import { toast } from '@/shared/lib/toast'
import { cn, getInitials } from '@/shared/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MailIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const ALL_ROLES = 'ALL'

function UsersPage() {
  const { t } = useI18n()
  const navigate = useNavigate({ from: '/users' })
  const queryClient = useQueryClient()
  const { page, limit, search, role_id } = useSearch({
    from: '/_authenticated/users',
  })
  const usersQuery = useQuery(
    usersQueryOptions({
      page,
      limit,
      ...(search ? { search } : {}),
      ...(role_id ? { role_id } : {}),
    }),
  )
  const rolesQuery = useQuery(rolesQueryOptions())
  const { data: userCount } = useQuery(userCountQueryOptions())
  const { data: maxUsers = null } = useQuery({
    ...appConfigsQueryOptions(),
    select: getMaxUsers,
  })
  const limitReached =
    maxUsers !== null && userCount !== undefined && userCount >= maxUsers
  const currentUser = useCurrentUserRecord()
  const [formOpen, setFormOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User>()
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const users = usersQuery.data?.users ?? []
  const pagination = usersQuery.data?.pagination
  const roles = rolesQuery.data ?? []

  const saveMutation = useMutation({
    mutationFn: ({
      userId,
      fields,
    }: {
      userId?: number
      fields: UserFields
    }) => (userId ? updateUser(userId, fields) : createUser(fields)),
    onSuccess: async (_user, { userId }) => {
      await closeFormAndRefresh()
      toast.add({
        title: t.common.success,
        description: userId ? t.user.userSaved : t.user.inviteSent,
        type: 'success',
      })
    },
    onError: async (error) => {
      // 502: the user was created but the invite email failed; it can be resent from the list.
      if (error instanceof ApiError && error.status === 502) {
        await closeFormAndRefresh()
      }

      toast.add({
        title: t.common.error,
        description:
          error instanceof Error ? error.message : t.user.userSaveFailed,
        type: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      setUserToDelete(null)
      if (users.length === 1 && page > 1) {
        await navigate({
          search: (previous) => ({ ...previous, page: page - 1 }),
        })
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: userQueryKeys.roles() }),
      ])
      toast.add({
        title: t.common.success,
        description: t.user.userDeleted,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error ? error.message : t.user.userDeleteFailed,
        type: 'error',
      })
    },
  })

  const resendInviteMutation = useMutation({
    mutationFn: resendInvite,
    onSuccess: () => {
      toast.add({
        title: t.common.success,
        description: t.user.inviteResent,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description: error.message,
        type: 'error',
      })
    },
  })

  async function closeFormAndRefresh() {
    setFormOpen(false)
    setUserToEdit(undefined)
    // Role user counts change, and the header shows the signed-in user's name.
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: userQueryKeys.roles() }),
      queryClient.invalidateQueries({ queryKey: authQueryKey }),
    ])
  }

  const emailConflict =
    saveMutation.error instanceof ApiError && saveMutation.error.status === 409
      ? saveMutation.error.message
      : undefined

  function openForm(user?: User) {
    saveMutation.reset()
    setUserToEdit(user)
    setFormOpen(true)
  }

  return (
    <div className="bg-primary flex min-h-full flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      {/* Page Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-accent text-2xl font-bold lg:text-3xl">
            {t.user.pageTitle}
          </h1>
          <p className="text-muted text-sm lg:text-base">
            {t.user.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {maxUsers !== null && userCount !== undefined && (
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold',
                limitReached
                  ? 'bg-danger/10 text-danger'
                  : 'bg-secondary/10 text-accent',
              )}
            >
              {t.user.userQuota(userCount, maxUsers)}
            </span>
          )}
          <Button asChild variant="outline">
            <Link to="/roles">{t.user.manageRoles}</Link>
          </Button>
          <span
            title={
              limitReached && maxUsers !== null
                ? t.user.userLimitReached(maxUsers)
                : undefined
            }
          >
            <Button
              type="button"
              disabled={limitReached}
              onClick={() => openForm()}
            >
              <PlusIcon aria-hidden="true" className="size-4" />
              {t.user.addUser}
            </Button>
          </span>
        </div>
      </header>

      {/* Registered Users */}
      <Card aria-labelledby="registered-users-title">
        <CardHeader>
          <CardTitle id="registered-users-title" className="text-base">
            {t.user.registeredUsers}
          </CardTitle>
          <span className="text-muted text-xs">
            {t.user.accountCount(pagination?.totalItems ?? 0)}
          </span>
        </CardHeader>

        {/* Search and Filters */}
        <div className="border-border flex flex-col gap-2 border-b p-4 lg:flex-row">
          <UserSearchInput search={search} />
          <Select
            value={role_id ? String(role_id) : ALL_ROLES}
            onValueChange={(value) =>
              void navigate({
                search: (previous) => ({
                  ...previous,
                  page: 1,
                  role_id: value === ALL_ROLES ? undefined : Number(value),
                }),
              })
            }
          >
            <SelectTrigger
              aria-label={t.user.roleFilterLabel}
              className="lg:w-52"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ROLES}>{t.user.allRoles}</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {usersQuery.isPending ? (
          <ListMessage role="status" message={t.user.loading} />
        ) : usersQuery.isError ? (
          <ListError
            error={usersQuery.error}
            fallback={t.user.usersFailed}
            onRetry={() => void usersQuery.refetch()}
          />
        ) : users.length === 0 ? (
          <ListMessage message={t.user.noUsers} />
        ) : (
          <>
            <Table className="min-w-max">
              <TableHeader className="bg-primary">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16" />
                  <TableHead className="text-muted font-bold uppercase">
                    {t.user.nameAndEmail}
                  </TableHead>
                  <TableHead className="text-muted font-bold uppercase">
                    {t.user.role}
                  </TableHead>
                  <TableHead className="text-muted font-bold uppercase">
                    {t.user.status}
                  </TableHead>
                  <TableHead className="text-muted font-bold uppercase">
                    {t.user.lastLogin}
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">{t.user.actions}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isSelf={user.id === currentUser?.id}
                    deletePending={deleteMutation.isPending}
                    resendPending={resendInviteMutation.isPending}
                    onResendInvite={() => resendInviteMutation.mutate(user.id)}
                    onEdit={() => openForm(user)}
                    onDelete={() => setUserToDelete(user)}
                  />
                ))}
              </TableBody>
            </Table>

            {pagination && (
              <UserPaginationFooter
                page={page}
                limit={limit}
                totalItems={pagination.totalItems}
                totalPages={pagination.totalPages}
                onPageChange={(nextPage) =>
                  void navigate({
                    search: (previous) => ({ ...previous, page: nextPage }),
                  })
                }
              />
            )}
          </>
        )}
      </Card>

      {/* Roles & Permissions */}
      <PermissionMatrix />

      <UserFormDialog
        key={`${userToEdit?.id ?? 'new'}-${formOpen}`}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setUserToEdit(undefined)
        }}
        user={userToEdit}
        roles={roles}
        pending={saveMutation.isPending}
        emailError={emailConflict}
        onSubmit={(fields) =>
          saveMutation.mutate({ userId: userToEdit?.id, fields })
        }
      />

      <ConfirmDeleteDialog
        open={userToDelete !== null}
        title={t.user.deleteUserTitle}
        itemName={userToDelete?.name}
        description={
          userToDelete
            ? t.user.deleteUserDescription(userToDelete.name)
            : undefined
        }
        closeLabel={t.user.closeDeleteUserDialog}
        pending={deleteMutation.isPending}
        onCancel={() => setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) deleteMutation.mutate(userToDelete.id)
        }}
      />
    </div>
  )
}

function UserRow({
  user,
  isSelf,
  deletePending,
  resendPending,
  onResendInvite,
  onEdit,
  onDelete,
}: {
  user: User
  isSelf: boolean
  deletePending: boolean
  resendPending: boolean
  onResendInvite: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { locale, t } = useI18n()
  return (
    <TableRow>
      {/* Avatar */}
      <TableCell className="w-16">
        <span
          aria-hidden="true"
          className="bg-secondary flex size-9 items-center justify-center rounded-full text-xs font-semibold text-white"
        >
          {getInitials(user.name)}
        </span>
      </TableCell>

      {/* Name & Email */}
      <TableCell className="min-w-64">
        <p className="text-accent font-medium">{user.name}</p>
        <p className="text-muted text-xs">{user.email}</p>
      </TableCell>

      {/* Role */}
      <TableCell>
        {user.role ? (
          <span className="bg-secondary/10 text-accent rounded-full px-2.5 py-1 text-xs font-semibold">
            {user.role.name}
          </span>
        ) : (
          <span className="text-muted text-xs">{t.user.noRole}</span>
        )}
      </TableCell>

      {/* Status */}
      <TableCell>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            user.is_pending
              ? 'bg-secondary/10 text-secondary'
              : user.is_active
                ? 'bg-success/10 text-success'
                : 'bg-warning/15 text-warning',
          )}
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-current"
          />
          {user.is_pending
            ? t.user.pending
            : user.is_active
              ? t.user.active
              : t.user.inactive}
        </span>
      </TableCell>

      {/* Last Login */}
      <TableCell className="text-foreground/80">
        {user.last_signed_in ? (
          <time
            dateTime={user.last_signed_in}
            title={formatDateTime(user.last_signed_in, locale)}
          >
            {formatRelativeTime(user.last_signed_in, locale)}
          </time>
        ) : (
          t.user.neverLoggedIn
        )}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          {user.is_pending && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              disabled={resendPending}
              aria-label={t.user.resendInvite(user.name)}
              title={t.user.resendInvite(user.name)}
              onClick={onResendInvite}
            >
              <MailIcon aria-hidden="true" className="size-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={t.user.editUser(user.name)}
            onClick={onEdit}
          >
            <PencilIcon aria-hidden="true" className="size-4" />
          </Button>
          <span title={isSelf ? t.user.cannotDeleteSelf : undefined}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              disabled={isSelf || deletePending}
              aria-label={t.user.deleteUser(user.name)}
              onClick={onDelete}
            >
              <Trash2Icon aria-hidden="true" className="size-4" />
            </Button>
          </span>
        </div>
      </TableCell>
    </TableRow>
  )
}

function UserSearchInput({ search }: { search?: string }) {
  const { t } = useI18n()
  const navigate = useNavigate({ from: '/users' })
  const [value, setValue] = useState(search ?? '')
  const [syncedSearch, setSyncedSearch] = useState(search)

  // The URL can change from outside (navbar search); show its value.
  if (search !== syncedSearch) {
    setSyncedSearch(search)
    if (search !== (value.trim() || undefined)) setValue(search ?? '')
  }

  useEffect(() => {
    const nextSearch = value.trim() || undefined
    if (nextSearch === search) return

    const timeoutId = window.setTimeout(() => {
      void navigate({
        search: (previous: UserSearch) => ({
          ...previous,
          page: 1,
          search: nextSearch,
        }),
        replace: true,
      })
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [navigate, search, value])

  return (
    <div className="relative lg:w-64">
      <SearchIcon
        aria-hidden="true"
        className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        type="search"
        aria-label={t.user.searchLabel}
        placeholder={t.user.searchPlaceholder}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        className="pl-9 text-sm"
      />
    </div>
  )
}

function UserPaginationFooter({
  page,
  limit,
  totalItems,
  totalPages,
  onPageChange,
}: {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const { t } = useI18n()
  const start = totalItems === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, totalItems)

  return (
    <div className="border-border flex flex-col gap-4 border-t px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-muted text-sm">
        {t.user.showingEntries(start, end, totalItems)}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t.user.previousPage}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon aria-hidden="true" className="size-4" />
        </Button>
        {getVisiblePages(page, totalPages).map((visiblePage) => (
          <Button
            key={visiblePage}
            type="button"
            variant={visiblePage === page ? 'default' : 'outline'}
            aria-current={visiblePage === page ? 'page' : undefined}
            aria-label={`Halaman ${visiblePage}`}
            onClick={() => onPageChange(visiblePage)}
          >
            {visiblePage}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t.user.nextPage}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRightIcon aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function getVisiblePages(currentPage: number, pageCount: number) {
  const visiblePageCount = Math.min(5, pageCount)
  const firstPage = Math.max(
    1,
    Math.min(currentPage - 1, pageCount - visiblePageCount + 1),
  )

  return Array.from(
    { length: visiblePageCount },
    (_, index) => firstPage + index,
  )
}

export { UsersPage }
