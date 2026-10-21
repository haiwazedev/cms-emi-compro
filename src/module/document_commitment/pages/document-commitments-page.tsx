import { usePermissions } from '@/module/auth/hooks/use-permissions'
import {
  deleteDocumentCommitment,
  createDocumentCommitment,
  updateDocumentCommitment,
} from '@/module/document_commitment/api/document-commitment.api'
import type {
  DocumentCommitment,
  DocumentCommitmentFields,
  DocumentCommitmentListParams,
  DocumentCommitmentStatus,
} from '@/module/document_commitment/api/document-commitment.api'
import { DocumentCommitmentDataTable } from '@/module/document_commitment/components/document-commitment-data-table'
import { DocumentCommitmentFormDialog } from '@/module/document_commitment/components/document-commitment-form-dialog'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import {
  documentCommitmentQueryKeys,
  documentCommitmentCategoriesQueryOptions,
  documentCommitmentsQueryOptions,
} from '@/module/document_commitment/queries/document-commitment.queries'
import type { DocumentCommitmentFormValues } from '@/module/document_commitment/schemas/document-commitment-form.schema'
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
import { toast } from '@/shared/lib/toast'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type StatusFilter = DocumentCommitmentStatus | 'ALL'

function DocumentCommitmentsPage() {
  const { t } = useI18n()
  const { canWrite } = usePermissions()
  const navigate = useNavigate({ from: '/document_commitments' })
  const queryClient = useQueryClient()
  const { page, limit, search, document_commitment_category_id, status } =
    useSearch({ from: '/_authenticated/document_commitments' })
  const [documentFormOpen, setDocumentFormOpen] = useState(false)
  const [documentToEdit, setDocumentToEdit] = useState<DocumentCommitment>()
  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentCommitment | null>(null)

  const documentParams = useMemo<DocumentCommitmentListParams>(
    () => ({
      page,
      limit,
      ...(search ? { search } : {}),
      ...(document_commitment_category_id
        ? { document_commitment_category_id }
        : {}),
      ...(status ? { status } : {}),
    }),
    [document_commitment_category_id, limit, page, search, status],
  )
  const documentsQuery = useQuery(
    documentCommitmentsQueryOptions(documentParams),
  )
  const categoriesQuery = useQuery(documentCommitmentCategoriesQueryOptions())
  const documents = documentsQuery.data?.documentCommitments ?? []
  const pagination = documentsQuery.data?.pagination

  const saveMutation = useMutation({
    mutationFn: ({
      documentId,
      values,
      file,
    }: {
      documentId?: number
      values: DocumentCommitmentFormValues
      file?: File
    }) => {
      const fields: DocumentCommitmentFields = values
      if (documentId) {
        return updateDocumentCommitment(documentId, fields, file)
      }
      if (!file) throw new Error(t.documentCommitment.pdfRequired)
      return createDocumentCommitment(fields, file)
    },
    onSuccess: async () => {
      setDocumentFormOpen(false)
      setDocumentToEdit(undefined)
      await queryClient.invalidateQueries({
        queryKey: documentCommitmentQueryKeys.lists(),
      })
      toast.add({
        title: t.common.success,
        description: t.documentCommitment.documentSaved,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error
            ? error.message
            : t.documentCommitment.documentSaveFailed,
        type: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDocumentCommitment,
    onSuccess: async (_data, deletedDocumentId) => {
      setDocumentToDelete(null)
      if (documents.length === 1 && page > 1) {
        await navigate({
          search: (previous) => ({ ...previous, page: page - 1 }),
        })
      }
      await queryClient.invalidateQueries({
        queryKey: documentCommitmentQueryKeys.lists(),
      })
      queryClient.removeQueries({
        queryKey: [
          ...documentCommitmentQueryKeys.all,
          'detail',
          deletedDocumentId,
        ],
        exact: true,
      })
      toast.add({
        title: t.common.success,
        description: t.documentCommitment.documentDeleted,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error
            ? error.message
            : t.documentCommitment.documentDeleteFailed,
        type: 'error',
      })
    },
  })

  function updateCategory(value: string) {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: 1,
        document_commitment_category_id:
          value === 'ALL' ? undefined : Number(value),
      }),
    })
  }

  function updateStatus(value: StatusFilter) {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: 1,
        status: value === 'ALL' ? undefined : value,
      }),
    })
  }

  function openDocumentForm(document?: DocumentCommitment) {
    setDocumentToEdit(document)
    setDocumentFormOpen(true)
  }

  function closeDocumentForm(open: boolean) {
    setDocumentFormOpen(open)
    if (!open) setDocumentToEdit(undefined)
  }

  return (
    <div className="bg-primary flex min-h-full flex-col gap-6 p-4 lg:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-accent text-2xl font-bold lg:text-3xl">
            {t.documentCommitment.pageTitle}
          </h1>
          <p className="text-muted text-sm lg:text-base">
            {t.documentCommitment.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/document_commitment_categories">
              {t.documentCommitment.manageCategories}
            </Link>
          </Button>
          {canWrite && (
            <Button type="button" onClick={() => openDocumentForm()}>
              <PlusIcon aria-hidden="true" className="size-4" />
              {t.documentCommitment.upload}
            </Button>
          )}
        </div>
      </header>

      <section
        aria-label={t.documentCommitment.pageTitle}
        className="bg-background border-border overflow-hidden rounded-xl border shadow-sm"
      >
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <DocumentSearchInput key={search ?? ''} search={search} />

          <Select
            value={document_commitment_category_id?.toString() ?? 'ALL'}
            onValueChange={updateCategory}
            disabled={categoriesQuery.isPending || categoriesQuery.isError}
          >
            <SelectTrigger
              aria-label={t.documentCommitment.categoryFilterLabel}
              className="lg:w-52"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t.documentCommitment.allCategories}
              </SelectItem>
              {categoriesQuery.data?.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status ?? 'ALL'}
            onValueChange={(value) => updateStatus(value as StatusFilter)}
          >
            <SelectTrigger
              aria-label={t.documentCommitment.statusFilterLabel}
              className="lg:w-40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t.documentCommitment.allStatuses}
              </SelectItem>
              <SelectItem value="PUBLISHED">
                {t.documentCommitment.published}
              </SelectItem>
              <SelectItem value="DRAFT">
                {t.documentCommitment.draft}
              </SelectItem>
            </SelectContent>
          </Select>

          <p className="text-muted text-sm lg:ml-auto lg:whitespace-nowrap">
            {t.documentCommitment.entryCount(pagination?.totalItems ?? 0)}
          </p>
        </div>

        {categoriesQuery.isError && (
          <p role="status" className="text-danger px-4 pb-4 text-sm">
            {t.documentCommitment.categoriesFailed}
          </p>
        )}

        {documentsQuery.isPending ? (
          <DocumentMessage
            role="status"
            message={t.documentCommitment.loadingDocuments}
          />
        ) : documentsQuery.isError ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p role="alert" className="text-danger text-sm">
              {documentsQuery.error instanceof Error
                ? documentsQuery.error.message
                : t.documentCommitment.documentsFailed}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void documentsQuery.refetch()}
            >
              {t.common.retry}
            </Button>
          </div>
        ) : documents.length === 0 ? (
          <DocumentMessage message={t.documentCommitment.noDocuments} />
        ) : (
          <DocumentCommitmentDataTable
            documents={documents}
            pageIndex={page - 1}
            pageSize={limit}
            pageCount={pagination?.totalPages ?? 0}
            totalItems={pagination?.totalItems ?? 0}
            deletePending={deleteMutation.isPending}
            onEdit={openDocumentForm}
            onDelete={setDocumentToDelete}
            onPageIndexChange={(nextPageIndex) =>
              void navigate({
                search: (previous) => ({
                  ...previous,
                  page: nextPageIndex + 1,
                }),
              })
            }
            onPageSizeChange={(nextPageSize) =>
              void navigate({
                search: (previous) => ({
                  ...previous,
                  page: 1,
                  limit: nextPageSize,
                }),
              })
            }
          />
        )}
      </section>

      <DocumentCommitmentFormDialog
        key={`${documentToEdit?.id ?? 'new'}-${documentFormOpen}`}
        open={documentFormOpen}
        onOpenChange={closeDocumentForm}
        document={documentToEdit}
        pending={saveMutation.isPending}
        onSubmit={(values, file) =>
          saveMutation.mutate({
            ...(documentToEdit ? { documentId: documentToEdit.id } : {}),
            values,
            file,
          })
        }
      />

      <Dialog
        open={documentToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setDocumentToDelete(null)
        }}
      >
        <DialogContent
          className="max-w-xl"
          closeLabel={t.documentCommitment.closeDeleteDialog}
        >
          <DialogHeader className="border-border border-b">
            <DialogTitle>
              {t.documentCommitment.deleteDocumentTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-5 px-5 py-6">
            <span className="bg-danger/10 text-danger flex size-14 items-center justify-center rounded-full">
              <Trash2Icon aria-hidden="true" className="size-5" />
            </span>
            {documentToDelete && (
              <div className="flex flex-col gap-2">
                <p className="text-accent font-semibold break-words">
                  “{documentToDelete.title}”
                </p>
                <DialogDescription>
                  {t.documentCommitment.deleteDocumentDescription}
                </DialogDescription>
              </div>
            )}
          </div>
          <DialogFooter className="bg-primary">
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setDocumentToDelete(null)}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-danger/30 text-danger hover:bg-danger/5 hover:text-danger"
              disabled={!documentToDelete || deleteMutation.isPending}
              onClick={() => {
                if (documentToDelete) {
                  deleteMutation.mutate(documentToDelete.id)
                }
              }}
            >
              {deleteMutation.isPending
                ? t.documentCommitment.deletingDocument
                : t.documentCommitment.confirmDeleteDocument}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DocumentSearchInput({ search }: { search?: string }) {
  const { t } = useI18n()
  const navigate = useNavigate({ from: '/document_commitments' })
  const [value, setValue] = useState(search ?? '')

  useEffect(() => {
    const nextSearch = value.trim() || undefined
    if (nextSearch === search) return

    const timeoutId = window.setTimeout(() => {
      void navigate({
        search: (previous) => ({ ...previous, page: 1, search: nextSearch }),
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
        aria-label={t.documentCommitment.searchLabel}
        type="search"
        placeholder={t.documentCommitment.searchPlaceholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="bg-primary border-border pl-10 text-sm"
      />
    </div>
  )
}

function DocumentMessage({
  message,
  role,
}: {
  message: string
  role?: 'status'
}) {
  return (
    <p
      role={role}
      className="text-muted border-border border-t px-4 py-12 text-center text-sm"
    >
      {message}
    </p>
  )
}

export { DocumentCommitmentsPage }
