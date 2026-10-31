import { usePermissions } from '@/module/auth/hooks/use-permissions'
import {
  createDocumentCommitmentCategory,
  deleteDocumentCommitmentCategory,
  updateDocumentCommitmentCategory,
} from '@/module/document_commitment/api/document-commitment.api'
import type { DocumentCommitmentCategorySummary } from '@/module/document_commitment/api/document-commitment.api'
import { DocumentCommitmentCategoryFormDialog } from '@/module/document_commitment/components/document-commitment-category-form-dialog'
import { LanguageSelect } from '@/module/language/components/language-select'
import {
  DEFAULT_LANGUAGE_ID,
  findDefaultLanguage,
} from '@/module/language/constants/language.constants'
import { languagesQueryOptions } from '@/module/language/queries/language.queries'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import {
  documentCommitmentCategoryQueryOptions,
  documentCommitmentQueryKeys,
} from '@/module/document_commitment/queries/document-commitment.queries'
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
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { PencilIcon, PlusIcon, TagIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { documentCommitmentCategoriesQueryOptions } from '../queries/document-commitment.queries'

function DocumentCommitmentCategoriesPage() {
  const { t } = useI18n()
  const { canWrite, canDelete } = usePermissions()
  const queryClient = useQueryClient()
  const navigate = useNavigate({ from: '/document_commitment_categories' })
  const { lang } = useSearch({
    from: '/_authenticated/document_commitment_categories',
  })
  const languagesQuery = useQuery(languagesQueryOptions())
  const languages = languagesQuery.data ?? []
  const urlLanguage = languages.find((item) => item.id === lang)
  const language = urlLanguage ?? findDefaultLanguage(languages)
  const languageId = language?.id ?? DEFAULT_LANGUAGE_ID
  const categoriesQuery = useQuery(documentCommitmentCategoriesQueryOptions())
  const categories = categoriesQuery.data ?? []
  const categoryDetailQueries = useQueries({
    queries: categories.map((category) =>
      documentCommitmentCategoryQueryOptions(category.id),
    ),
  })
  const localizedCategories = categories.map((category, index) => {
    const details = categoryDetailQueries[index]?.data
    const translation = details?.contents.find(
      (content) => content.language_id === languageId,
    )
    const defaultTranslation = details?.contents.find(
      (content) => content.language_id === DEFAULT_LANGUAGE_ID,
    )

    return {
      ...category,
      name: translation?.name ?? defaultTranslation?.name ?? category.name,
      slug: translation?.slug ?? defaultTranslation?.slug ?? category.slug,
      translationMissing: Boolean(details && !translation),
    }
  })
  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] =
    useState<DocumentCommitmentCategorySummary>()
  const [categoryToDelete, setCategoryToDelete] =
    useState<DocumentCommitmentCategorySummary | null>(null)

  useEffect(() => {
    if (!language || urlLanguage) return

    void navigate({
      search: (previous) => ({ ...previous, lang: language.id }),
      replace: true,
    })
  }, [language, navigate, urlLanguage])

  const saveMutation = useMutation({
    mutationFn: ({
      categoryId,
      name,
      slug,
      description,
      languageId: selectedLanguageId,
    }: {
      categoryId?: number
      name: string
      slug: string
      description: string
      languageId: string
    }) =>
      categoryId
        ? updateDocumentCommitmentCategory(categoryId, {
            language_id: selectedLanguageId,
            name,
            slug,
            description,
          })
        : createDocumentCommitmentCategory({
            language_id: DEFAULT_LANGUAGE_ID,
            name,
            slug,
            description,
          }),
    onSuccess: async (savedCategory) => {
      setCategoryFormOpen(false)
      setCategoryToEdit(undefined)
      queryClient.setQueryData(
        documentCommitmentQueryKeys.categoryDetail(savedCategory.id),
        savedCategory,
      )
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: documentCommitmentQueryKeys.categories(),
        }),
        queryClient.invalidateQueries({
          queryKey: documentCommitmentQueryKeys.categoryDetails(),
        }),
        queryClient.invalidateQueries({
          queryKey: documentCommitmentQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: documentCommitmentQueryKeys.details(),
        }),
      ])
      toast.add({
        title: t.common.success,
        description: t.documentCommitment.categorySaved,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error
            ? error.message
            : t.documentCommitment.categorySaveFailed,
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
          queryKey: documentCommitmentQueryKeys.categoryDetails(),
        }),
        queryClient.invalidateQueries({
          queryKey: documentCommitmentQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: documentCommitmentQueryKeys.details(),
        }),
      ])
      toast.add({
        title: t.common.success,
        description: t.documentCommitment.categoryDeleted,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error
            ? error.message
            : t.documentCommitment.categoryDeleteFailed,
        type: 'error',
      })
    },
  })

  function updateLanguage(nextLanguageId: string) {
    void navigate({ search: { lang: nextLanguageId } })
  }

  function openCategoryForm(category?: DocumentCommitmentCategorySummary) {
    saveMutation.reset()
    setCategoryToEdit(category)
    setCategoryFormOpen(true)
  }

  function closeCategoryForm(open: boolean) {
    setCategoryFormOpen(open)
    if (!open) {
      saveMutation.reset()
      setCategoryToEdit(undefined)
    }
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
            <Link to="/document_commitments" search={{ lang: languageId }}>
              {t.documentCommitment.backToDocuments}
            </Link>
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-accent text-2xl font-bold lg:text-3xl">
              {t.documentCommitment.categoryPageTitle}
            </h1>
            <p className="text-foreground/60 text-sm lg:text-base">
              {t.documentCommitment.categoryDescription}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {languagesQuery.isPending ? (
            <p role="status" className="text-muted text-sm">
              {t.documentCommitment.languageLoading}
            </p>
          ) : languagesQuery.isError ? (
            <div className="flex items-center gap-2">
              <p role="alert" className="text-danger text-sm">
                {t.documentCommitment.languagesFailed}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void languagesQuery.refetch()}
              >
                {t.common.retry}
              </Button>
            </div>
          ) : language ? (
            <LanguageSelect
              label={t.documentCommitment.language}
              languages={languages}
              value={language.id}
              onChange={updateLanguage}
            />
          ) : (
            <p role="status" className="text-muted text-sm">
              {t.documentCommitment.noLanguages}
            </p>
          )}
          {canWrite && (
            <Button
              type="button"
              disabled={!language}
              onClick={() => openCategoryForm()}
            >
              <PlusIcon aria-hidden="true" className="size-4" />
              {t.documentCommitment.addCategory}
            </Button>
          )}
        </div>
      </header>

      <section
        aria-label={t.documentCommitment.categoryPageTitle}
        className="bg-background border-border overflow-hidden rounded-xl border shadow-sm"
      >
        {categoriesQuery.isPending ? (
          <CategoryMessage
            role="status"
            message={t.documentCommitment.loadingCategories}
          />
        ) : categoriesQuery.isError ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p role="alert" className="text-danger text-sm">
              {categoriesQuery.error instanceof Error
                ? categoriesQuery.error.message
                : t.documentCommitment.categoriesFailed}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void categoriesQuery.refetch()}
            >
              {t.common.retry}
            </Button>
          </div>
        ) : categoriesQuery.data?.length === 0 ? (
          <CategoryMessage message={t.documentCommitment.noCategories} />
        ) : (
          <ul className="divide-border divide-y">
            {localizedCategories.map((category) => (
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
                  {category.translationMissing && (
                    <span className="text-muted text-xs">
                      {t.documentCommitment.translationMissing}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 self-end lg:self-auto">
                  {canWrite && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`${t.common.edit} ${category.name}`}
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
                      aria-label={`${t.common.delete} ${category.name}`}
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

      <DocumentCommitmentCategoryFormDialog
        open={categoryFormOpen}
        onOpenChange={closeCategoryForm}
        category={categoryToEdit}
        languages={languages}
        languageId={categoryToEdit ? languageId : DEFAULT_LANGUAGE_ID}
        pending={saveMutation.isPending}
        slugError={getConflictMessage(saveMutation.error)}
        onSubmit={(values) =>
          saveMutation.mutate({
            ...(categoryToEdit ? { categoryId: categoryToEdit.id } : {}),
            languageId: categoryToEdit ? languageId : DEFAULT_LANGUAGE_ID,
            ...values,
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
          closeLabel={t.documentCommitment.closeDeleteCategoryDialog}
        >
          <DialogHeader className="border-border border-b">
            <DialogTitle>
              {t.documentCommitment.deleteCategoryTitle}
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
                  {t.documentCommitment.deleteCategoryDescription}
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
              {t.common.cancel}
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
                ? t.documentCommitment.deletingCategory
                : t.documentCommitment.confirmDeleteCategory}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getConflictMessage(error: unknown): string | undefined {
  return error instanceof Error && 'status' in error && error.status === 409
    ? error.message
    : undefined
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
