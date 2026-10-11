import {
  createDocumentCommitmentCategory,
  deleteDocumentCommitmentCategory,
  updateDocumentCommitmentCategory,
} from '@/module/document_commitment/api/document-commitment.api'
import type { DocumentCommitmentCategory } from '@/module/document_commitment/api/document-commitment.api'
import { DocumentCommitmentCategoryFormDialog } from '@/module/document_commitment/components/document-commitment-category-form-dialog'
import { DOCUMENT_COMMITMENT_LABELS } from '@/module/document_commitment/constants/document-commitment.constants'
import { documentCommitmentQueryKeys } from '@/module/document_commitment/queries/document-commitment.queries'
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
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PencilIcon, PlusIcon, TagIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { documentCommitmentCategoriesQueryOptions } from '../queries/document-commitment.queries'

function DocumentCommitmentCategoriesPage() {
  const queryClient = useQueryClient()
  const categoriesQuery = useQuery(documentCommitmentCategoriesQueryOptions())
  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] =
    useState<DocumentCommitmentCategory>()
  const [categoryToDelete, setCategoryToDelete] =
    useState<DocumentCommitmentCategory | null>(null)

  const saveMutation = useMutation({
    mutationFn: ({
      categoryId,
      name,
    }: {
      categoryId?: number
      name: string
    }) =>
      categoryId
        ? updateDocumentCommitmentCategory(categoryId, name)
        : createDocumentCommitmentCategory(name),
    onSuccess: async () => {
      setCategoryFormOpen(false)
      setCategoryToEdit(undefined)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: documentCommitmentQueryKeys.categories(),
        }),
        queryClient.invalidateQueries({
          queryKey: documentCommitmentQueryKeys.lists(),
        }),
      ])
      toast.add({
        title: 'Berhasil',
        description: DOCUMENT_COMMITMENT_LABELS.categorySaved,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : DOCUMENT_COMMITMENT_LABELS.categorySaveFailed,
        type: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDocumentCommitmentCategory,
    onSuccess: async () => {
      setCategoryToDelete(null)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: documentCommitmentQueryKeys.categories(),
        }),
        queryClient.invalidateQueries({
          queryKey: documentCommitmentQueryKeys.lists(),
        }),
      ])
      toast.add({
        title: 'Berhasil',
        description: DOCUMENT_COMMITMENT_LABELS.categoryDeleted,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : DOCUMENT_COMMITMENT_LABELS.categoryDeleteFailed,
        type: 'error',
      })
    },
  })

  function openCategoryForm(category?: DocumentCommitmentCategory) {
    setCategoryToEdit(category)
    setCategoryFormOpen(true)
  }

  function closeCategoryForm(open: boolean) {
    setCategoryFormOpen(open)
    if (!open) setCategoryToEdit(undefined)
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
            <Link to="/document_commitments">
              {DOCUMENT_COMMITMENT_LABELS.backToDocuments}
            </Link>
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-accent text-2xl font-bold lg:text-3xl">
              {DOCUMENT_COMMITMENT_LABELS.categoryPageTitle}
            </h1>
            <p className="text-foreground/60 text-sm lg:text-base">
              {DOCUMENT_COMMITMENT_LABELS.categoryDescription}
            </p>
          </div>
        </div>
        <Button type="button" onClick={() => openCategoryForm()}>
          <PlusIcon aria-hidden="true" className="size-4" />
          {DOCUMENT_COMMITMENT_LABELS.addCategory}
        </Button>
      </header>

      <section
        aria-label={DOCUMENT_COMMITMENT_LABELS.categoryPageTitle}
        className="bg-background border-border/15 overflow-hidden rounded-xl border shadow-sm"
      >
        {categoriesQuery.isPending ? (
          <CategoryMessage
            role="status"
            message={DOCUMENT_COMMITMENT_LABELS.loadingCategories}
          />
        ) : categoriesQuery.isError ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p role="alert" className="text-danger text-sm">
              {categoriesQuery.error instanceof Error
                ? categoriesQuery.error.message
                : DOCUMENT_COMMITMENT_LABELS.categoriesFailed}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void categoriesQuery.refetch()}
            >
              {DOCUMENT_COMMITMENT_LABELS.retry}
            </Button>
          </div>
        ) : categoriesQuery.data?.length === 0 ? (
          <CategoryMessage message={DOCUMENT_COMMITMENT_LABELS.noCategories} />
        ) : (
          <ul className="divide-border/10 divide-y">
            {categoriesQuery.data?.map((category) => (
              <li
                key={category.id}
                className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="bg-secondary/10 text-accent flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <TagIcon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="text-accent font-semibold break-words">
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 self-end lg:self-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`${DOCUMENT_COMMITMENT_LABELS.edit} ${category.name}`}
                    onClick={() => openCategoryForm(category)}
                  >
                    <PencilIcon aria-hidden="true" className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={deleteMutation.isPending}
                    aria-label={`${DOCUMENT_COMMITMENT_LABELS.delete} ${category.name}`}
                    onClick={() => setCategoryToDelete(category)}
                  >
                    <Trash2Icon aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DocumentCommitmentCategoryFormDialog
        open={categoryFormOpen}
        onOpenChange={closeCategoryForm}
        category={categoryToEdit}
        pending={saveMutation.isPending}
        onSubmit={(name) =>
          saveMutation.mutate({
            ...(categoryToEdit ? { categoryId: categoryToEdit.id } : {}),
            name,
          })
        }
      />

      <Dialog
        open={categoryToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null)
        }}
      >
        <DialogContent
          className="max-w-xl"
          closeLabel={DOCUMENT_COMMITMENT_LABELS.closeDeleteCategoryDialog}
        >
          <DialogHeader className="border-border/15 border-b">
            <DialogTitle>
              {DOCUMENT_COMMITMENT_LABELS.deleteCategoryTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-5 px-5 py-6">
            <span className="bg-danger/10 text-danger flex size-14 items-center justify-center rounded-full">
              <Trash2Icon aria-hidden="true" className="size-5" />
            </span>
            {categoryToDelete && (
              <div className="flex flex-col gap-2">
                <p className="text-accent font-semibold break-words">
                  “{categoryToDelete.name}”
                </p>
                <DialogDescription>
                  {DOCUMENT_COMMITMENT_LABELS.deleteCategoryDescription}
                </DialogDescription>
              </div>
            )}
          </div>
          <DialogFooter className="bg-primary">
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setCategoryToDelete(null)}
            >
              {DOCUMENT_COMMITMENT_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-danger/30 text-danger hover:bg-danger/5 hover:text-danger"
              disabled={!categoryToDelete || deleteMutation.isPending}
              onClick={() => {
                if (categoryToDelete) {
                  deleteMutation.mutate(categoryToDelete.id)
                }
              }}
            >
              {deleteMutation.isPending
                ? DOCUMENT_COMMITMENT_LABELS.deletingCategory
                : DOCUMENT_COMMITMENT_LABELS.confirmDeleteCategory}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CategoryMessage({
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

export { DocumentCommitmentCategoriesPage }
