import { authQueryKey } from '@/module/auth/queries/auth.queries'
import { createUser, deleteUser, updateUser } from '@/module/user/api/user.api'
import type { User, UserFields } from '@/module/user/api/user.api'
import { ConfirmDeleteDialog } from '@/module/user/components/confirm-delete-dialog'
import { ListError, ListMessage } from '@/module/user/components/list-state'
import { PermissionMatrix } from '@/module/user/components/permission-matrix'
import { UserFormDialog } from '@/module/user/components/user-form-dialog'
import {
  USER_LABELS,
  formatDateTime,
  formatRelativeTime,
} from '@/module/user/constants/user.constants'
import { useCurrentUserRecord } from '@/module/user/hooks/use-current-user-record'
import {
  rolesQueryOptions,
  userQueryKeys,
  usersQueryOptions,
} from '@/module/user/queries/user.queries'
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
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const ALL_ROLES = 'ALL'

function UsersPage() {
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
    onSuccess: async () => {
      setFormOpen(false)
      setUserToEdit(undefined)
      // Role user counts change, and the header shows the signed-in user's name.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: userQueryKeys.roles() }),
        queryClient.invalidateQueries({ queryKey: authQueryKey }),
      ])
      toast.add({
        title: 'Berhasil',
        description: USER_LABELS.userSaved,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error ? error.message : USER_LABELS.userSaveFailed,
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
        title: 'Berhasil',
        description: USER_LABELS.userDeleted,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error ? error.message : USER_LABELS.userDeleteFailed,
        type: 'error',
      })
    },
  })

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
            {USER_LABELS.pageTitle}
          </h1>
          <p className="text-foreground/60 text-sm lg:text-base">
            {USER_LABELS.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/roles">{USER_LABELS.manageRoles}</Link>
          </Button>
          <Button type="button" onClick={() => openForm()}>
            <PlusIcon aria-hidden="true" className="size-4" />
            {USER_LABELS.addUser}
          </Button>
        </div>
      </header>

      {/* Registered Users */}
      <Card aria-labelledby="registered-users-title">
        <CardHeader>
          <CardTitle id="registered-users-title" className="text-base">
            {USER_LABELS.registeredUsers}
          </CardTitle>
          <span className="text-foreground/55 text-xs">
            {USER_LABELS.accountCount(pagination?.totalItems ?? 0)}
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
              aria-label={USER_LABELS.roleFilterLabel}
              className="lg:w-52"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ROLES}>{USER_LABELS.allRoles}</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {usersQuery.isPending ? (
          <ListMessage role="status" message={USER_LABELS.loading} />
        ) : usersQuery.isError ? (
          <ListError
            error={usersQuery.error}
            fallback={USER_LABELS.usersFailed}
            onRetry={() => void usersQuery.refetch()}
          />
        ) : users.length === 0 ? (
          <ListMessage message={USER_LABELS.noUsers} />
        ) : (
          <>
            <Table className="min-w-max">
              <TableHeader className="bg-primary">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16" />
                  <TableHead className="uppercase">
                    {USER_LABELS.nameAndEmail}
                  </TableHead>
                  <TableHead className="uppercase">
                    {USER_LABELS.role}
                  </TableHead>
                  <TableHead className="uppercase">
                    {USER_LABELS.status}
                  </TableHead>
                  <TableHead className="uppercase">
                    {USER_LABELS.lastLogin}
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">{USER_LABELS.actions}</span>
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
        title={USER_LABELS.deleteUserTitle}
        itemName={userToDelete?.name}
        description={
          userToDelete
            ? USER_LABELS.deleteUserDescription(userToDelete.name)
            : undefined
        }
        closeLabel={USER_LABELS.closeDeleteUserDialog}
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
  onEdit,
  onDelete,
}: {
  user: User
  isSelf: boolean
  deletePending: boolean
  onEdit: () => void
  onDelete: () => void
}) {
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
        <p className="text-foreground/55 text-xs">{user.email}</p>
      </TableCell>

      {/* Role */}
      <TableCell>
        {user.role ? (
          <span className="bg-primary text-accent rounded-full px-2.5 py-1 text-xs font-semibold">
            {user.role.name}
          </span>
        ) : (
          <span className="text-foreground/55 text-xs">
            {USER_LABELS.noRole}
          </span>
        )}
      </TableCell>

      {/* Status */}
      <TableCell>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            user.is_active
              ? 'bg-success/10 text-success'
              : 'bg-warning/15 text-warning',
          )}
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-current"
          />
          {user.is_active ? USER_LABELS.active : USER_LABELS.inactive}
        </span>
      </TableCell>

      {/* Last Login */}
      <TableCell className="text-foreground/80">
        {user.last_signed_in ? (
          <time
            dateTime={user.last_signed_in}
            title={formatDateTime(user.last_signed_in)}
          >
            {formatRelativeTime(user.last_signed_in)}
          </time>
        ) : (
          USER_LABELS.neverLoggedIn
        )}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={USER_LABELS.editUser(user.name)}
            onClick={onEdit}
          >
            <PencilIcon aria-hidden="true" className="size-4" />
          </Button>
          <span title={isSelf ? USER_LABELS.cannotDeleteSelf : undefined}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              disabled={isSelf || deletePending}
              aria-label={USER_LABELS.deleteUser(user.name)}
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
  const navigate = useNavigate({ from: '/users' })
  const [value, setValue] = useState(search ?? '')

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
        className="text-foreground/40 absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        type="search"
        aria-label={USER_LABELS.searchLabel}
        placeholder={USER_LABELS.searchPlaceholder}
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
  const start = totalItems === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, totalItems)

  return (
    <div className="border-border flex flex-col gap-4 border-t px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-foreground/60 text-sm">
        {USER_LABELS.showingEntries(start, end, totalItems)}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={USER_LABELS.previousPage}
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
          aria-label={USER_LABELS.nextPage}
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
