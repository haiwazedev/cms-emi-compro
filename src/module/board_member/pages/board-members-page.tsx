import {
  createBoardMember,
  deleteBoardMember,
  updateBoardMember,
} from '@/module/board_member/api/board-member.api'
import type {
  BoardMember,
  BoardMemberFields,
  BoardMemberType,
} from '@/module/board_member/api/board-member.api'
import { BoardMemberFormDialog } from '@/module/board_member/components/board-member-form-dialog'
import { SortableBoardMemberRow } from '@/module/board_member/components/sortable-board-member-row'
import { BOARD_MEMBER_LABELS } from '@/module/board_member/constants/board-member.constants'
import {
  boardMemberQueryKeys,
  boardMemberTypesQueryOptions,
  boardMembersQueryOptions,
} from '@/module/board_member/queries/board-member.queries'
import type { BoardMemberSearch } from '@/module/board_member/schemas/board-member-search.schema'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
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
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { toast } from '@/shared/lib/toast'
import { DragDropProvider } from '@dnd-kit/react'
import type { DragEndEvent } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const EMPTY_MEMBERS: BoardMember[] = []
const EMPTY_TYPES: BoardMemberType[] = []

function BoardMembersPage() {
  const navigate = useNavigate({ from: '/board_members' })
  const queryClient = useQueryClient()
  const { search, board_member_type_id } = useSearch({
    from: '/_authenticated/board_members',
  })
  const [memberFormOpen, setMemberFormOpen] = useState(false)
  const [memberToEdit, setMemberToEdit] = useState<BoardMember>()
  const [memberToDelete, setMemberToDelete] = useState<BoardMember | null>(null)

  const memberParams = useMemo(
    () => ({
      ...(search ? { search } : {}),
      ...(board_member_type_id ? { board_member_type_id } : {}),
    }),
    [board_member_type_id, search],
  )
  const membersQuery = useQuery(boardMembersQueryOptions(memberParams))
  const typesQuery = useQuery(boardMemberTypesQueryOptions())
  const members = membersQuery.data ?? EMPTY_MEMBERS
  const types = typesQuery.data ?? EMPTY_TYPES

  const groupedMembers = useMemo(() => {
    const buckets = new Map<number, BoardMember[]>()
    for (const member of members) {
      const group = buckets.get(member.board_member_type_id) ?? []
      group.push(member)
      buckets.set(member.board_member_type_id, group)
    }

    const typeById = new Map(types.map((type) => [type.id, type]))
    const orderedTypeIds = [
      ...types.map((type) => type.id).filter((typeId) => buckets.has(typeId)),
      ...[...buckets.keys()].filter((typeId) => !typeById.has(typeId)),
    ]

    return orderedTypeIds.flatMap((typeId) =>
      (buckets.get(typeId) ?? []).map((member, index) => ({
        member,
        index,
        group: `board-members-${typeId}`,
      })),
    )
  }, [members, types])

  const saveMutation = useMutation({
    mutationFn: ({
      memberId,
      fields,
      photo,
    }: {
      memberId?: number
      fields: BoardMemberFields
      photo?: File
    }) =>
      memberId
        ? updateBoardMember(memberId, fields, photo)
        : createBoardMember(fields, photo),
    onSuccess: async () => {
      closeMemberForm()
      await queryClient.invalidateQueries({
        queryKey: boardMemberQueryKeys.members(),
      })
      toast.add({
        title: 'Berhasil',
        description: BOARD_MEMBER_LABELS.memberSaved,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : BOARD_MEMBER_LABELS.memberSaveFailed,
        type: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBoardMember,
    onSuccess: async () => {
      setMemberToDelete(null)
      await queryClient.invalidateQueries({
        queryKey: boardMemberQueryKeys.members(),
      })
      toast.add({
        title: 'Berhasil',
        description: BOARD_MEMBER_LABELS.memberDeleted,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : BOARD_MEMBER_LABELS.memberDeleteFailed,
        type: 'error',
      })
    },
  })

  const reorderMutation = useMutation({
    mutationFn: ({
      memberId,
      sortOrder,
    }: {
      memberId: number
      sortOrder: number
    }) => updateBoardMember(memberId, { sort_order: sortOrder }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: boardMemberQueryKeys.members(),
      })
    },
    onError: (error) => {
      void queryClient.invalidateQueries({
        queryKey: boardMemberQueryKeys.members(),
      })
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : BOARD_MEMBER_LABELS.memberOrderFailed,
        type: 'error',
      })
    },
  })

  function openMemberForm(member?: BoardMember) {
    setMemberToEdit(member)
    setMemberFormOpen(true)
  }

  function closeMemberForm() {
    setMemberFormOpen(false)
    setMemberToEdit(undefined)
  }

  function handleFormOpenChange(open: boolean) {
    if (!open && saveMutation.isPending) return
    setMemberFormOpen(open)
    if (!open) setMemberToEdit(undefined)
  }

  function updateTypeFilter(value: string) {
    void navigate({
      search: (previous) => ({
        ...previous,
        board_member_type_id: value === 'ALL' ? undefined : Number(value),
      }),
      replace: true,
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled || search || reorderMutation.isPending) return

    const { source, target } = event.operation
    if (!source || !target || !isSortable(source) || !isSortable(target)) return
    if (source.initialGroup !== target.group) return
    if (source.initialIndex === target.index) return

    const memberId = Number(String(source.id).replace('board-member:', ''))
    if (!Number.isInteger(memberId) || memberId <= 0) return

    reorderMutation.mutate({ memberId, sortOrder: target.index + 1 })
  }

  const canAddMember = typesQuery.isSuccess && types.length > 0
  const isReorderDisabled = Boolean(search) || reorderMutation.isPending

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="bg-primary flex min-h-full flex-col gap-4 p-4 lg:gap-6 lg:p-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-accent text-2xl font-bold lg:text-3xl">
              {BOARD_MEMBER_LABELS.pageTitle}
            </h1>
            <p className="text-foreground/60 text-sm lg:text-base">
              {BOARD_MEMBER_LABELS.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <Button asChild variant="outline">
              <Link to="/board_member_types">
                {BOARD_MEMBER_LABELS.manageTypes}
              </Link>
            </Button>
            <Button
              type="button"
              disabled={!canAddMember}
              onClick={() => openMemberForm()}
            >
              <PlusIcon aria-hidden="true" className="size-4" />
              {BOARD_MEMBER_LABELS.addMember}
            </Button>
          </div>
        </header>

        <section
          aria-label={BOARD_MEMBER_LABELS.pageTitle}
          className="bg-background border-border/15 overflow-hidden rounded-xl border shadow-sm"
        >
          <div className="border-border/15 flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
            <BoardMemberSearchInput search={search} />
            <Select
              value={board_member_type_id?.toString() ?? 'ALL'}
              onValueChange={updateTypeFilter}
              disabled={typesQuery.isPending || typesQuery.isError}
            >
              <SelectTrigger
                aria-label={BOARD_MEMBER_LABELS.typeFilterLabel}
                className="w-full lg:w-52"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  {BOARD_MEMBER_LABELS.allTypes}
                </SelectItem>
                {types.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-foreground/55 text-xs lg:ml-auto">
              {membersQuery.isSuccess
                ? BOARD_MEMBER_LABELS.entryCount(members.length)
                : BOARD_MEMBER_LABELS.loadingMembers}
            </span>
          </div>

          {typesQuery.isError && (
            <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
              <p role="alert" className="text-danger text-sm">
                {typesQuery.error instanceof Error
                  ? typesQuery.error.message
                  : BOARD_MEMBER_LABELS.typesFailed}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void typesQuery.refetch()}
              >
                {BOARD_MEMBER_LABELS.retry}
              </Button>
            </div>
          )}

          {membersQuery.isPending ? (
            <BoardMemberMessage
              role="status"
              message={BOARD_MEMBER_LABELS.loadingMembers}
            />
          ) : membersQuery.isError ? (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
              <p role="alert" className="text-danger text-sm">
                {membersQuery.error instanceof Error
                  ? membersQuery.error.message
                  : BOARD_MEMBER_LABELS.membersFailed}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void membersQuery.refetch()}
              >
                {BOARD_MEMBER_LABELS.retry}
              </Button>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
              <BoardMemberMessage
                message={
                  types.length === 0
                    ? BOARD_MEMBER_LABELS.noTypes
                    : search || board_member_type_id
                      ? BOARD_MEMBER_LABELS.noSearchResults
                      : BOARD_MEMBER_LABELS.noMembers
                }
              />
              {types.length === 0 && (
                <Button asChild variant="outline">
                  <Link to="/board_member_types">
                    {BOARD_MEMBER_LABELS.manageTypes}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-max">
                <TableHeader className="bg-primary">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 px-2" />
                    <TableHead>{BOARD_MEMBER_LABELS.photo}</TableHead>
                    <TableHead>{BOARD_MEMBER_LABELS.nameAndRole}</TableHead>
                    <TableHead>{BOARD_MEMBER_LABELS.type}</TableHead>
                    <TableHead>{BOARD_MEMBER_LABELS.order}</TableHead>
                    <TableHead>{BOARD_MEMBER_LABELS.officialPhoto}</TableHead>
                    <TableHead className="text-right">
                      {BOARD_MEMBER_LABELS.actions}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedMembers.map(({ member, index, group }) => (
                    <SortableBoardMemberRow
                      key={member.id}
                      member={member}
                      index={index}
                      group={group}
                      disabled={isReorderDisabled}
                      onEdit={() => openMemberForm(member)}
                      onDelete={() => setMemberToDelete(member)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        <p className="text-foreground/55 text-xs italic">
          {BOARD_MEMBER_LABELS.orderHint}
        </p>

        {memberFormOpen && (
          <BoardMemberFormDialog
            key={`${memberToEdit?.id ?? 'new-member'}-${memberFormOpen}`}
            open
            onOpenChange={handleFormOpenChange}
            member={memberToEdit}
            types={types}
            pending={saveMutation.isPending}
            onSubmit={(fields, photo) =>
              saveMutation.mutate({
                ...(memberToEdit ? { memberId: memberToEdit.id } : {}),
                fields,
                photo,
              })
            }
          />
        )}

        <Dialog
          open={memberToDelete !== null}
          onOpenChange={(open) => {
            if (!open && !deleteMutation.isPending) setMemberToDelete(null)
          }}
        >
          <DialogContent
            className="max-w-xl"
            closeLabel={BOARD_MEMBER_LABELS.closeDeleteMemberDialog}
          >
            <DialogHeader className="border-border/15 border-b">
              <DialogTitle>{BOARD_MEMBER_LABELS.deleteMemberTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-5 px-5 py-6">
              <span className="bg-danger/10 text-danger flex size-14 items-center justify-center rounded-full">
                <Trash2Icon aria-hidden="true" className="size-5" />
              </span>
              {memberToDelete && (
                <div className="flex flex-col gap-2">
                  <p className="text-accent font-semibold break-words">
                    “{memberToDelete.name}”
                  </p>
                  <DialogDescription>
                    {BOARD_MEMBER_LABELS.deleteMemberDescription}
                  </DialogDescription>
                </div>
              )}
            </div>
            <DialogFooter className="bg-primary">
              <Button
                type="button"
                variant="outline"
                disabled={deleteMutation.isPending}
                onClick={() => setMemberToDelete(null)}
              >
                {BOARD_MEMBER_LABELS.cancel}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-danger/30 text-danger hover:bg-danger/5 hover:text-danger"
                disabled={!memberToDelete || deleteMutation.isPending}
                onClick={() => {
                  if (memberToDelete) deleteMutation.mutate(memberToDelete.id)
                }}
              >
                {deleteMutation.isPending
                  ? BOARD_MEMBER_LABELS.deletingMember
                  : BOARD_MEMBER_LABELS.confirmDeleteMember}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DragDropProvider>
  )
}

function BoardMemberSearchInput({ search }: { search?: string }) {
  const navigate = useNavigate({ from: '/board_members' })
  const [value, setValue] = useState(search ?? '')

  useEffect(() => {
    const nextSearch = value.trim() || undefined
    if (nextSearch === search) return

    const timeoutId = window.setTimeout(() => {
      void navigate({
        search: (previous: BoardMemberSearch) => ({
          ...previous,
          search: nextSearch,
        }),
        replace: true,
      })
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [navigate, search, value])

  return (
    <div className="relative w-full lg:max-w-xs">
      <SearchIcon
        aria-hidden="true"
        className="text-foreground/45 absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        aria-label={BOARD_MEMBER_LABELS.searchLabel}
        type="search"
        placeholder={BOARD_MEMBER_LABELS.searchPlaceholder}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        className="bg-primary border-border/15 pl-10 text-sm"
      />
    </div>
  )
}

function BoardMemberMessage({
  message,
  role,
}: {
  message: string
  role?: 'status'
}) {
  return (
    <p
      role={role}
      className="text-foreground/60 px-4 py-12 text-center text-sm"
    >
      {message}
    </p>
  )
}

export { BoardMembersPage }
