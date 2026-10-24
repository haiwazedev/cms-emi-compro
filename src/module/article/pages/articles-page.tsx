import { usePermissions } from '@/module/auth/hooks/use-permissions'
import {
  articleCategoriesQueryOptions,
  articleQueryKeys,
  articlesQueryOptions,
} from '@/module/article/queries/article.queries'
import { bulkDeleteArticles } from '@/module/article/api/article.api'
import type {
  ArticleListItem,
  ArticleListParams,
  ArticleStatus,
} from '@/module/article/api/article.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { ArticleDataTable } from '@/module/article/components/article-data-table'
import { ArticleDeleteDialog } from '@/module/article/components/article-delete-dialog'
import { ArticleLanguageLegend } from '@/module/article/components/article-language-pills'
import { BulkDeleteButton } from '@/shared/components/bulk-delete-button'
import { Button } from '@/shared/components/ui/button'
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
import type { RowSelectionState } from '@tanstack/react-table'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

type StatusFilter = ArticleStatus | 'ALL'
type SortOrder = ArticleListParams['sort_order']

function ArticlesPage() {
  const { t } = useI18n()
  const { canWrite } = usePermissions()
  const navigate = useNavigate({ from: '/articles' })
  const queryClient = useQueryClient()
  const searchParams = useSearch({ from: '/_authenticated/articles' })
  const { page, limit, search, article_category_id, status, sort_order } =
    searchParams

  const articleParams = useMemo<ArticleListParams>(
    () => ({
      page,
      limit,
      ...(search ? { search } : {}),
      ...(article_category_id ? { article_category_id } : {}),
      ...(status ? { status } : {}),
      sort_by: 'created_at',
      sort_order,
    }),
    [article_category_id, limit, page, search, sort_order, status],
  )

  const articlesQuery = useQuery(articlesQueryOptions(articleParams))
  const categoriesQuery = useQuery(articleCategoriesQueryOptions())
  const articles = articlesQuery.data?.articles ?? []
  const pagination = articlesQuery.data?.pagination
  const [articleToDelete, setArticleToDelete] =
    useState<ArticleListItem | null>(null)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const selectedIds = articles
    .filter((article) => rowSelection[article.id])
    .map((article) => article.id)

  const requestArticleDelete = useCallback((article: ArticleListItem) => {
    setArticleToDelete(article)
  }, [])

  const closeDeleteDialog = useCallback(() => setArticleToDelete(null), [])

  // Deleting every row of a page moves back one page.
  async function goToPreviousPageIfEmpty(deletedCount = 1) {
    if (deletedCount >= articles.length && page > 1) {
      await navigate({
        search: (previous) => ({ ...previous, page: page - 1 }),
      })
    }
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteArticles,
    onSuccess: async (deletedCount, deletedIds) => {
      setRowSelection({})
      for (const articleId of deletedIds) {
        queryClient.removeQueries({
          queryKey: articleQueryKeys.detail(articleId),
          exact: true,
        })
      }
      await goToPreviousPageIfEmpty(deletedIds.length)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: articleQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: articleQueryKeys.counts() }),
      ])
      toast.add({
        title: t.common.success,
        description: t.common.bulkDeleted(deletedCount),
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error ? error.message : t.common.bulkDeleteFailed,
        type: 'error',
      })
    },
  })

  function updateCategory(value: string) {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: 1,
        article_category_id: value === 'ALL' ? undefined : Number(value),
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

  function updateSortOrder(value: SortOrder) {
    void navigate({
      search: (previous) => ({ ...previous, page: 1, sort_order: value }),
    })
  }

  function updatePageIndex(nextPageIndex: number) {
    void navigate({
      search: (previous) => ({ ...previous, page: nextPageIndex + 1 }),
    })
  }

  function updatePageSize(nextPageSize: number) {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: 1,
        limit: nextPageSize,
      }),
    })
  }

  return (
    <div className="bg-primary flex min-h-full flex-col gap-6 p-4 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          {/* Title */}
          <h1 className="text-accent text-2xl font-bold lg:text-3xl">
            {t.article.pageTitle}
          </h1>

          {/* Sub-title */}
          <p className="text-muted text-sm lg:text-base">
            {t.article.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* "Kelola Kategori" button */}
          <Button asChild variant="outline">
            <Link to="/article_categories">{t.article.manageCategories}</Link>
          </Button>

          {/* "+ Buat Artikel" button */}
          {canWrite && (
            <Button asChild>
              <Link to="/articles/create">
                <PlusIcon aria-hidden="true" className="size-4" />
                {t.article.createArticle}
              </Link>
            </Button>
          )}
        </div>
      </header>

      <section
        aria-label={t.article.pageTitle}
        className="bg-background border-border overflow-hidden rounded-xl border shadow-sm"
      >
        {/* Filters */}
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <ArticleSearchInput key={search ?? ''} search={search} />

          <label className="sr-only" htmlFor="article-category-filter">
            {t.article.categoryFilterLabel}
          </label>
          <Select
            value={article_category_id?.toString() ?? 'ALL'}
            onValueChange={updateCategory}
            disabled={categoriesQuery.isPending || categoriesQuery.isError}
          >
            <SelectTrigger
              id="article-category-filter"
              aria-label={t.article.categoryFilterLabel}
              className="lg:w-40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {categoriesQuery.isPending
                  ? t.article.loadingCategories
                  : t.article.allCategories}
              </SelectItem>
              {categoriesQuery.data?.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="sr-only" htmlFor="article-status-filter">
            {t.article.statusFilterLabel}
          </label>
          <Select
            value={status ?? 'ALL'}
            onValueChange={(value) => updateStatus(value as StatusFilter)}
          >
            <SelectTrigger
              id="article-status-filter"
              aria-label={t.article.statusFilterLabel}
              className="lg:w-40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t.article.allStatuses}</SelectItem>
              <SelectItem value="PUBLISHED">{t.article.published}</SelectItem>
              <SelectItem value="DRAFT">{t.article.draft}</SelectItem>
            </SelectContent>
          </Select>

          <label className="sr-only" htmlFor="article-sort-order">
            {t.article.sortLabel}
          </label>
          <Select
            value={sort_order}
            onValueChange={(value) => updateSortOrder(value as SortOrder)}
          >
            <SelectTrigger
              id="article-sort-order"
              aria-label={t.article.sortLabel}
              className="lg:w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">{t.article.newest}</SelectItem>
              <SelectItem value="asc">{t.article.oldest}</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-3 lg:ml-auto">
            <BulkDeleteButton
              count={selectedIds.length}
              pending={bulkDeleteMutation.isPending}
              onConfirm={() => bulkDeleteMutation.mutateAsync(selectedIds)}
            />
            <p className="text-muted text-sm lg:whitespace-nowrap">
              {t.article.entryCount(pagination?.totalItems ?? 0)}
            </p>
          </div>
        </div>

        {/* Article Language Status Legend */}
        <ArticleLanguageLegend />

        {categoriesQuery.isError && (
          <p role="status" className="text-danger px-4 pb-4 text-sm">
            {t.article.categoriesFailed}
          </p>
        )}

        {/* Article Table */}
        {articlesQuery.isPending ? (
          <ArticleMessage role="status" message={t.article.loadingArticles} />
        ) : articlesQuery.isError ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p role="alert" className="text-danger text-sm">
              {articlesQuery.error instanceof Error
                ? articlesQuery.error.message
                : t.article.articlesFailed}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void articlesQuery.refetch()}
            >
              {t.common.retry}
            </Button>
          </div>
        ) : articles.length === 0 ? (
          <ArticleMessage message={t.article.noArticles} />
        ) : (
          <ArticleDataTable
            articles={articles}
            onDeleteArticle={requestArticleDelete}
            selection={{
              rowSelection,
              onRowSelectionChange: setRowSelection,
            }}
            pagination={{
              pageIndex: page - 1,
              pageSize: limit,
              pageCount: pagination?.totalPages ?? 0,
              totalItems: pagination?.totalItems ?? 0,
              onPageIndexChange: updatePageIndex,
              onPageSizeChange: updatePageSize,
            }}
          />
        )}
      </section>

      <ArticleDeleteDialog
        article={articleToDelete}
        onClose={closeDeleteDialog}
        onDeleted={goToPreviousPageIfEmpty}
      />
    </div>
  )
}

function ArticleSearchInput({ search }: { search?: string }) {
  const { t } = useI18n()
  const navigate = useNavigate({ from: '/articles' })
  const [value, setValue] = useState(search ?? '')

  useEffect(() => {
    const nextSearch = value.trim() || undefined
    if (nextSearch === search) return

    const timeoutId = window.setTimeout(() => {
      void navigate({
        search: (previous) => ({
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
    <div className="relative w-full lg:max-w-xs">
      <SearchIcon
        aria-hidden="true"
        className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        aria-label={t.article.searchLabel}
        type="search"
        placeholder={t.article.searchPlaceholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="bg-primary border-border pl-10 text-sm"
      />
    </div>
  )
}

function ArticleMessage({
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

export { ArticlesPage }
