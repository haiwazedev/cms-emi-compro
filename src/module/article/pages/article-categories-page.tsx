import { usePermissions } from '@/module/auth/hooks/use-permissions'
import {
  createArticleCategory,
  deleteArticleCategory,
  updateArticleCategory,
} from '@/module/article/api/article.api'
import type {
  ArticleCategory,
  ArticleCategoryWriteFields,
} from '@/module/article/api/article.api'
import { ArticleCategoryFormDialog } from '@/module/article/components/article-category-form-dialog'
import { ARTICLE_LABELS } from '@/module/article/constants/article.constants'
import {
  articleCategoriesQueryOptions,
  articleQueryKeys,
} from '@/module/article/queries/article.queries'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { ApiError } from '@/shared/lib/api-client'
import { toast } from '@/shared/lib/toast'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PencilIcon, PlusIcon, TagIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

function ArticleCategoriesPage() {
  const { canWrite, canDelete } = usePermissions()
  const queryClient = useQueryClient()
  const categoriesQuery = useQuery(articleCategoriesQueryOptions())
  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<ArticleCategory>()
  const [categoryToDelete, setCategoryToDelete] =
    useState<ArticleCategory | null>(null)

  const saveMutation = useMutation({
    mutationFn: ({
      categoryId,
      fields,
    }: {
      categoryId?: number
      fields: ArticleCategoryWriteFields
    }) =>
      categoryId
        ? updateArticleCategory(categoryId, fields)
        : createArticleCategory(fields),
    onSuccess: async () => {
      setCategoryFormOpen(false)
      setCategoryToEdit(undefined)
      // Article lists and details embed the category name.
      await queryClient.invalidateQueries({ queryKey: articleQueryKeys.all })
      toast.add({
        title: 'Berhasil',
        description: ARTICLE_LABELS.categorySaved,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : ARTICLE_LABELS.categorySaveFailed,
        type: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteArticleCategory,
    onSuccess: async () => {
      setCategoryToDelete(null)
      await queryClient.invalidateQueries({ queryKey: articleQueryKeys.all })
      toast.add({
        title: 'Berhasil',
        description: ARTICLE_LABELS.categoryDeleted,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : ARTICLE_LABELS.categoryDeleteFailed,
        type: 'error',
      })
    },
  })

  const slugConflict =
    saveMutation.error instanceof ApiError && saveMutation.error.status === 409
      ? saveMutation.error.message
      : undefined

  function openCategoryForm(category?: ArticleCategory) {
    saveMutation.reset()
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
            <Link to="/articles">{ARTICLE_LABELS.backToArticles}</Link>
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-accent text-2xl font-bold lg:text-3xl">
              {ARTICLE_LABELS.categoryPageTitle}
            </h1>
            <p className="text-foreground/60 text-sm lg:text-base">
              {ARTICLE_LABELS.categoryDescription}
            </p>
          </div>
        </div>
        {canWrite && (
          <Button
            type="button"
            className="self-start lg:self-auto"
            onClick={() => openCategoryForm()}
          >
            <PlusIcon aria-hidden="true" className="size-4" />
            {ARTICLE_LABELS.addCategory}
          </Button>
        )}
      </header>

      <section
        aria-label={ARTICLE_LABELS.categoryPageTitle}
        className="bg-background border-border/15 overflow-hidden rounded-xl border shadow-sm"
      >
        {categoriesQuery.isPending ? (
          <CategoryMessage
            role="status"
            message={ARTICLE_LABELS.loadingCategories}
          />
        ) : categoriesQuery.isError ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p role="alert" className="text-danger text-sm">
              {categoriesQuery.error instanceof Error
                ? categoriesQuery.error.message
                : ARTICLE_LABELS.categoriesFailed}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void categoriesQuery.refetch()}
            >
              {ARTICLE_LABELS.retry}
            </Button>
          </div>
        ) : categoriesQuery.data.length === 0 ? (
          <CategoryMessage message={ARTICLE_LABELS.noCategories} />
        ) : (
          <ul className="divide-border/10 divide-y">
            {categoriesQuery.data.map((category) => (
              <li
                key={category.id}
                className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="bg-secondary/10 text-accent flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <TagIcon aria-hidden="true" className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-accent font-semibold break-words">
                      {category.name}
                    </span>
                    <span className="text-foreground/60 text-sm break-all">
                      {category.slug}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end lg:self-auto">
                  {canWrite && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`${ARTICLE_LABELS.edit} ${category.name}`}
                      onClick={() => openCategoryForm(category)}
                    >
                      <PencilIcon aria-hidden="true" className="size-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={deleteMutation.isPending}
                      aria-label={`${ARTICLE_LABELS.delete} ${category.name}`}
                      onClick={() => setCategoryToDelete(category)}
                    >
                      <Trash2Icon aria-hidden="true" className="size-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ArticleCategoryFormDialog
        open={categoryFormOpen}
        onOpenChange={closeCategoryForm}
        category={categoryToEdit}
        pending={saveMutation.isPending}
        serverError={slugConflict}
        onSubmit={(fields) =>
          saveMutation.mutate({ categoryId: categoryToEdit?.id, fields })
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
          closeLabel={ARTICLE_LABELS.closeDeleteCategoryDialog}
        >
          <DialogHeader className="border-border/15 border-b">
            <DialogTitle>{ARTICLE_LABELS.deleteCategoryTitle}</DialogTitle>
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
                  {ARTICLE_LABELS.deleteCategoryDescription}
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
              {ARTICLE_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-danger/30 text-danger hover:bg-danger/5 hover:text-danger"
              disabled={!categoryToDelete || deleteMutation.isPending}
              onClick={() => {
                if (categoryToDelete) deleteMutation.mutate(categoryToDelete.id)
              }}
            >
              {deleteMutation.isPending
                ? ARTICLE_LABELS.deletingCategory
                : ARTICLE_LABELS.confirmDeleteCategory}
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

export { ArticleCategoriesPage }
