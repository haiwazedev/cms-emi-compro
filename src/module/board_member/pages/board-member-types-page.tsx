import {
  createBoardMemberType,
  deleteBoardMemberType,
  updateBoardMemberType,
} from '@/module/board_member/api/board-member.api'
import type { BoardMemberType } from '@/module/board_member/api/board-member.api'
import { BoardMemberLanguageSelect } from '@/module/board_member/components/board-member-language-select'
import { BoardMemberTypeFormDialog } from '@/module/board_member/components/board-member-type-form-dialog'
import { BOARD_MEMBER_LABELS } from '@/module/board_member/constants/board-member.constants'
import {
  boardMemberQueryKeys,
  boardMemberTypesQueryOptions,
} from '@/module/board_member/queries/board-member.queries'
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
import { toast } from '@/shared/lib/toast'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PencilIcon, PlusIcon, TagIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'

const EMPTY_TYPES: BoardMemberType[] = []

function BoardMemberTypesPage() {
  const navigate = useNavigate({ from: '/board_member_types' })
  const { lang } = useSearch({ from: '/_authenticated/board_member_types' })
  const languagesQuery = useQuery(languagesQueryOptions())
  const languages = languagesQuery.data ?? []
  const urlLanguage = languages.find((item) => item.id === lang)
  const language = urlLanguage ?? findDefaultLanguage(languages)

  useEffect(() => {
    if (urlLanguage || !language) return

    void navigate({ search: { lang: language.id }, replace: true })
  }, [language, navigate, urlLanguage])

  if (languagesQuery.isPending) {
    return <TypeMessage message={BOARD_MEMBER_LABELS.languageLoading} />
  }
  if (languagesQuery.isError) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
        <p role="alert" className="text-danger text-sm">
          {BOARD_MEMBER_LABELS.languagesFailed}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void languagesQuery.refetch()}
        >
          {BOARD_MEMBER_LABELS.retry}
        </Button>
      </div>
    )
  }
  if (!language) {
    return <TypeMessage message={BOARD_MEMBER_LABELS.noLanguages} />
  }

  return (
    <BoardMemberTypesContent
      languages={languages}
      language={language}
      onLanguageChange={(languageId) => {
        const nextLanguage = languages.find((item) => item.id === languageId)
        if (!nextLanguage) return

        void navigate({ search: { lang: nextLanguage.id } })
      }}
    />
  )
}

function BoardMemberTypesContent({
  languages,
  language,
  onLanguageChange,
}: {
  languages: Language[]
  language: Language
  onLanguageChange: (languageId: string) => void
}) {
  const queryClient = useQueryClient()
  const typesQuery = useQuery(boardMemberTypesQueryOptions())
  const types = typesQuery.data ?? EMPTY_TYPES
  const localizedTypes = types.filter(
    (memberType) => memberType.language_id === language.id,
  )
  const [typeFormOpen, setTypeFormOpen] = useState(false)
  const [typeToEdit, setTypeToEdit] = useState<BoardMemberType>()
  const [typeToDelete, setTypeToDelete] = useState<BoardMemberType | null>(null)

  const saveMutation = useMutation({
    mutationFn: ({ typeId, type }: { typeId?: number; type: string }) =>
      typeId
        ? updateBoardMemberType(typeId, type)
        : createBoardMemberType(type, language.id),
    onSuccess: async () => {
      closeTypeForm()
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: boardMemberQueryKeys.types(),
        }),
        queryClient.invalidateQueries({
          queryKey: boardMemberQueryKeys.members(),
        }),
      ])
      toast.add({
        title: 'Berhasil',
        description: BOARD_MEMBER_LABELS.typeSaved,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : BOARD_MEMBER_LABELS.typeSaveFailed,
        type: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBoardMemberType,
    onSuccess: async () => {
      setTypeToDelete(null)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: boardMemberQueryKeys.types(),
        }),
        queryClient.invalidateQueries({
          queryKey: boardMemberQueryKeys.members(),
        }),
      ])
      toast.add({
        title: 'Berhasil',
        description: BOARD_MEMBER_LABELS.typeDeleted,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : BOARD_MEMBER_LABELS.typeDeleteFailed,
        type: 'error',
      })
    },
  })

  function openTypeForm(memberType?: BoardMemberType) {
    setTypeToEdit(memberType)
    setTypeFormOpen(true)
  }

  function closeTypeForm() {
    setTypeFormOpen(false)
    setTypeToEdit(undefined)
  }

  function handleFormOpenChange(open: boolean) {
    if (!open && saveMutation.isPending) return
    setTypeFormOpen(open)
    if (!open) setTypeToEdit(undefined)
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
            <Link to="/board_members" search={{ lang: language.id }}>
              {BOARD_MEMBER_LABELS.backToMembers}
            </Link>
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-accent text-2xl font-bold lg:text-3xl">
              {BOARD_MEMBER_LABELS.typesPageTitle}
            </h1>
            <p className="text-foreground/60 text-sm lg:text-base">
              {BOARD_MEMBER_LABELS.typesDescription}
            </p>
          </div>
        </div>
        <Button type="button" onClick={() => openTypeForm()}>
          <PlusIcon aria-hidden="true" className="size-4" />
          {BOARD_MEMBER_LABELS.addType}
        </Button>
      </header>

      <BoardMemberLanguageSelect
        languages={languages}
        languageId={language.id}
        onLanguageChange={onLanguageChange}
      />

      <section
        aria-label={BOARD_MEMBER_LABELS.typesPageTitle}
        className="bg-background border-border/15 overflow-hidden rounded-xl border shadow-sm"
      >
        {typesQuery.isPending ? (
          <TypeMessage
            role="status"
            message={BOARD_MEMBER_LABELS.loadingTypes}
          />
        ) : typesQuery.isError ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
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
        ) : localizedTypes.length === 0 ? (
          <TypeMessage message={BOARD_MEMBER_LABELS.noTypesList} />
        ) : (
          <ul className="divide-border/10 divide-y">
            {localizedTypes.map((memberType) => (
              <li
                key={memberType.id}
                className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="bg-secondary/10 text-accent flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <TagIcon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="text-accent font-semibold break-words">
                    {memberType.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 self-end lg:self-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`${BOARD_MEMBER_LABELS.editType} ${memberType.type}`}
                    onClick={() => openTypeForm(memberType)}
                  >
                    <PencilIcon aria-hidden="true" className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={deleteMutation.isPending}
                    aria-label={`${BOARD_MEMBER_LABELS.deleteTypeTitle} ${memberType.type}`}
                    onClick={() => setTypeToDelete(memberType)}
                  >
                    <Trash2Icon aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {typeFormOpen && (
        <BoardMemberTypeFormDialog
          key={`${typeToEdit?.id ?? 'new-type'}-${language.id}-${typeFormOpen}`}
          open
          onOpenChange={handleFormOpenChange}
          memberType={typeToEdit}
          language={language}
          pending={saveMutation.isPending}
          onSubmit={(type) =>
            saveMutation.mutate({
              ...(typeToEdit ? { typeId: typeToEdit.id } : {}),
              type,
            })
          }
        />
      )}

      <Dialog
        open={typeToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setTypeToDelete(null)
        }}
      >
        <DialogContent
          className="max-w-xl"
          closeLabel={BOARD_MEMBER_LABELS.closeDeleteTypeDialog}
        >
          <DialogHeader className="border-border/15 border-b">
            <DialogTitle>{BOARD_MEMBER_LABELS.deleteTypeTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-5 px-5 py-6">
            <span className="bg-danger/10 text-danger flex size-14 items-center justify-center rounded-full">
              <Trash2Icon aria-hidden="true" className="size-5" />
            </span>
            {typeToDelete && (
              <div className="flex flex-col gap-2">
                <p className="text-accent font-semibold break-words">
                  “{typeToDelete.type}”
                </p>
                <DialogDescription>
                  {BOARD_MEMBER_LABELS.deleteTypeDescription}
                </DialogDescription>
              </div>
            )}
          </div>
          <DialogFooter className="bg-primary">
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setTypeToDelete(null)}
            >
              {BOARD_MEMBER_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-danger/30 text-danger hover:bg-danger/5 hover:text-danger"
              disabled={!typeToDelete || deleteMutation.isPending}
              onClick={() => {
                if (typeToDelete) deleteMutation.mutate(typeToDelete.id)
              }}
            >
              {deleteMutation.isPending
                ? BOARD_MEMBER_LABELS.deletingType
                : BOARD_MEMBER_LABELS.confirmDeleteType}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TypeMessage({ message, role }: { message: string; role?: 'status' }) {
  return (
    <p
      role={role}
      className="text-foreground/60 px-4 py-12 text-center text-sm"
    >
      {message}
    </p>
  )
}

export { BoardMemberTypesPage }
