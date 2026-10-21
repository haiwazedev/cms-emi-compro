import { usePermissions } from '@/module/auth/hooks/use-permissions'
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
import { BoardMemberLanguageSelect } from '@/module/board_member/components/board-member-language-select'
import { BoardMemberFormDialog } from '@/module/board_member/components/board-member-form-dialog'
import { SortableBoardMemberRow } from '@/module/board_member/components/sortable-board-member-row'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import {
  boardMemberQueryKeys,
  boardMemberTypesQueryOptions,
  boardMembersQueryOptions,
} from '@/module/board_member/queries/board-member.queries'
import type { BoardMemberSearch } from '@/module/board_member/schemas/board-member-search.schema'
import type { Language } from '@/module/language/api/language.api'
import { findDefaultLanguage } from '@/module/language/constants/language.constants'
import { languagesQueryOptions } from '@/module/language/queries/language.queries'
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
  const { t } = useI18n()
  const navigate = useNavigate({ from: '/board_members' })
  const { lang } = useSearch({ from: '/_authenticated/board_members' })
  const languagesQuery = useQuery(languagesQueryOptions())
  const languages = languagesQuery.data ?? []
  const urlLanguage = languages.find((item) => item.id === lang)
  const language = urlLanguage ?? findDefaultLanguage(languages)

  useEffect(() => {
    if (urlLanguage || !language) return

    void navigate({
      search: (previous) => ({
        ...previous,
        lang: language.id,
        board_member_type_id: undefined,
      }),
      replace: true,
    })
  }, [language, navigate, urlLanguage])

  if (languagesQuery.isPending) {
    return <BoardMemberMessage message={t.boardMember.languageLoading} />
  }
  if (languagesQuery.isError) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
        <p role="alert" className="text-danger text-sm">
          {t.boardMember.languagesFailed}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void languagesQuery.refetch()}
        >
          {t.common.retry}
        </Button>
      </div>
    )
  }
  if (!language) {
    return <BoardMemberMessage message={t.boardMember.noLanguages} />
  }

  return (
    <BoardMembersContent
      languages={languages}
      language={language}
      onLanguageChange={(languageId) => {
        const nextLanguage = languages.find((item) => item.id === languageId)
        if (!nextLanguage) return

        void navigate({
          search: (previous) => ({
            ...previous,
            lang: nextLanguage.id,
            board_member_type_id: undefined,
          }),
        })
      }}
    />
  )
}

function BoardMembersContent({
  languages,
  language,
  onLanguageChange,
}: {
  languages: Language[]
  language: Language
  onLanguageChange: (languageId: string) => void
}) {
  const { t } = useI18n()
  const { canWrite } = usePermissions()
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
  const localizedTypes = types.filter(
    (type) => type.language_id === language.id,
  )
  const orderedMembers = useMemo(
    () =>
      [...members].sort(
        (first, second) =>
          first.sort_order - second.sort_order || first.id - second.id,
      ),
    [members],
  )

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
        title: t.common.success,
        description: t.boardMember.memberSaved,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error
            ? error.message
            : t.boardMember.memberSaveFailed,
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
        title: t.common.success,
        description: t.boardMember.memberDeleted,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error
            ? error.message
            : t.boardMember.memberDeleteFailed,
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
        title: t.common.error,
        description:
          error instanceof Error
            ? error.message
            : t.boardMember.memberOrderFailed,
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
    if (
      event.canceled ||
      search ||
      board_member_type_id ||
      reorderMutation.isPending
    )
      return

    const { source, target } = event.operation
    if (!source || !target || !isSortable(source) || !isSortable(target)) return
    if (source.initialGroup !== target.group) return
    if (source.initialIndex === target.index) return

    const memberId = Number(String(source.id).replace('board-member:', ''))
    if (!Number.isInteger(memberId) || memberId <= 0) return

    reorderMutation.mutate({ memberId, sortOrder: target.index + 1 })
  }

  const canAddMember = typesQuery.isSuccess && localizedTypes.length > 0
  const isReorderDisabled =
    Boolean(search || board_member_type_id) || reorderMutation.isPending

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="bg-primary flex min-h-full flex-col gap-4 p-4 lg:gap-6 lg:p-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-accent text-2xl font-bold lg:text-3xl">
              {t.boardMember.pageTitle}
            </h1>
            <p className="text-muted text-sm lg:text-base">
              {t.boardMember.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <Button asChild variant="outline">
              <Link to="/board_member_types" search={{ lang: language.id }}>
                {t.boardMember.manageTypes}
              </Link>
            </Button>
            {canWrite && (
              <Button
                type="button"
                disabled={!canAddMember}
                onClick={() => openMemberForm()}
              >
                <PlusIcon aria-hidden="true" className="size-4" />
                {t.boardMember.addMember}
              </Button>
            )}
          </div>
        </header>

        <BoardMemberLanguageSelect
          languages={languages}
          languageId={language.id}
          onLanguageChange={onLanguageChange}
        />

        <section
          aria-label={t.boardMember.pageTitle}
          className="bg-background border-border overflow-hidden rounded-xl border shadow-sm"
        >
          <div className="border-border flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
            <BoardMemberSearchInput search={search} />
            <Select
              value={board_member_type_id?.toString() ?? 'ALL'}
              onValueChange={updateTypeFilter}
              disabled={typesQuery.isPending || typesQuery.isError}
            >
              <SelectTrigger
                aria-label={t.boardMember.typeFilterLabel}
                className="w-full lg:w-52"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t.boardMember.allTypes}</SelectItem>
                {localizedTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted text-xs lg:ml-auto">
              {membersQuery.isSuccess
                ? t.boardMember.entryCount(members.length)
                : t.boardMember.loadingMembers}
            </span>
          </div>

          {typesQuery.isError && (
            <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
              <p role="alert" className="text-danger text-sm">
                {typesQuery.error instanceof Error
                  ? typesQuery.error.message
                  : t.boardMember.typesFailed}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void typesQuery.refetch()}
              >
                {t.common.retry}
              </Button>
            </div>
          )}

          {membersQuery.isPending ? (
            <BoardMemberMessage
              role="status"
              message={t.boardMember.loadingMembers}
            />
          ) : membersQuery.isError ? (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
              <p role="alert" className="text-danger text-sm">
                {membersQuery.error instanceof Error
                  ? membersQuery.error.message
                  : t.boardMember.membersFailed}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void membersQuery.refetch()}
              >
                {t.common.retry}
              </Button>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
              <BoardMemberMessage
                message={
                  localizedTypes.length === 0
                    ? t.boardMember.noTypes
                    : search || board_member_type_id
                      ? t.boardMember.noSearchResults
                      : t.boardMember.noMembers
                }
              />
              {localizedTypes.length === 0 && typesQuery.isSuccess && (
                <Button asChild variant="outline">
                  <Link to="/board_member_types" search={{ lang: language.id }}>
                    {t.boardMember.manageTypes}
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
                    <TableHead className="text-muted font-bold uppercase">
                      {t.boardMember.photo}
                    </TableHead>
                    <TableHead className="text-muted font-bold uppercase">
                      {t.boardMember.nameAndRole}
                    </TableHead>
                    <TableHead className="text-muted font-bold uppercase">
                      {t.boardMember.type}
                    </TableHead>
                    <TableHead className="text-muted font-bold uppercase">
                      {t.boardMember.order}
                    </TableHead>
                    <TableHead className="text-muted font-bold uppercase">
                      {t.boardMember.officialPhoto}
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">{t.boardMember.actions}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderedMembers.map((member, index) => (
                    <SortableBoardMemberRow
                      key={member.id}
                      member={member}
                      content={member.contents.find(
                        (item) => item.language_id === language.id,
                      )}
                      index={index}
                      group="board-members"
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

        <p className="text-muted text-xs italic">{t.boardMember.orderHint}</p>

        {memberFormOpen && (
          <BoardMemberFormDialog
            key={`${memberToEdit?.id ?? 'new-member'}-${language.id}-${memberFormOpen}`}
            open
            onOpenChange={handleFormOpenChange}
            member={memberToEdit}
            language={language}
            types={localizedTypes}
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
            closeLabel={t.boardMember.closeDeleteMemberDialog}
          >
            <DialogHeader className="border-border border-b">
              <DialogTitle>{t.boardMember.deleteMemberTitle}</DialogTitle>
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
                    {t.boardMember.deleteMemberDescription}
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
                {t.common.cancel}
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
                  ? t.boardMember.deletingMember
                  : t.boardMember.confirmDeleteMember}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DragDropProvider>
  )
}

function BoardMemberSearchInput({ search }: { search?: string }) {
  const { t } = useI18n()
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
        className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        aria-label={t.boardMember.searchLabel}
        type="search"
        placeholder={t.boardMember.searchPlaceholder}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        className="bg-primary border-border pl-10 text-sm"
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
    <p role={role} className="text-muted px-4 py-12 text-center text-sm">
      {message}
    </p>
  )
}

export { BoardMembersPage }
