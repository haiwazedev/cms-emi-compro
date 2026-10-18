import { usePermissions } from '@/module/auth/hooks/use-permissions'
import {
  articleCategoriesQueryOptions,
  articlesQueryOptions,
} from '@/module/article/queries/article.queries'
import type {
  ArticleListItem,
  ArticleListParams,
  ArticleStatus,
} from '@/module/article/api/article.api'
import { ARTICLE_LABELS } from '@/module/article/constants/article.constants'
import { ArticleDataTable } from '@/module/article/components/article-data-table'
import { ArticleDeleteDialog } from '@/module/article/components/article-delete-dialog'
import { ArticleLanguageLegend } from '@/module/article/components/article-language-pills'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

type StatusFilter = ArticleStatus | 'ALL'
type SortOrder = ArticleListParams['sort_order']

function ArticlesPage() {
  const { canWrite } = usePermissions()
  const navigate = useNavigate({ from: '/articles' })
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

  const requestArticleDelete = useCallback((article: ArticleListItem) => {
    setArticleToDelete(article)
  }, [])

  const closeDeleteDialog = useCallback(() => setArticleToDelete(null), [])

  // Deleting the last row of a page moves back one page.
  async function goToPreviousPageIfEmpty() {
    if (articles.length === 1 && page > 1) {
      await navigate({
        search: (previous) => ({ ...previous, page: page - 1 }),
      })
    }
  }

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
            {ARTICLE_LABELS.pageTitle}
          </h1>

          {/* Sub-title */}
          <p className="text-foreground/60 text-sm lg:text-base">
            {ARTICLE_LABELS.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* "Kelola Kategori" button */}
          <Button asChild variant="outline">
            <Link to="/article_categories">
              {ARTICLE_LABELS.manageCategories}
            </Link>
          </Button>

          {/* "+ Buat Artikel" button */}
          {canWrite && (
            <Button asChild>
              <Link to="/articles/create">
                <PlusIcon aria-hidden="true" className="size-4" />
                {ARTICLE_LABELS.createArticle}
              </Link>
            </Button>
          )}
        </div>
      </header>

      <section
        aria-label={ARTICLE_LABELS.pageTitle}
        className="bg-background border-border/15 overflow-hidden rounded-xl border shadow-sm"
      >
        {/* Filters */}
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <ArticleSearchInput key={search ?? ''} search={search} />

          <label className="sr-only" htmlFor="article-category-filter">
            {ARTICLE_LABELS.categoryFilterLabel}
          </label>
          <Select
            value={article_category_id?.toString() ?? 'ALL'}
            onValueChange={updateCategory}
            disabled={categoriesQuery.isPending || categoriesQuery.isError}
          >
            <SelectTrigger
              id="article-category-filter"
              aria-label={ARTICLE_LABELS.categoryFilterLabel}
              className="lg:w-40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {categoriesQuery.isPending
                  ? ARTICLE_LABELS.loadingCategories
                  : ARTICLE_LABELS.allCategories}
              </SelectItem>
              {categoriesQuery.data?.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="sr-only" htmlFor="article-status-filter">
            {ARTICLE_LABELS.statusFilterLabel}
          </label>
          <Select
            value={status ?? 'ALL'}
            onValueChange={(value) => updateStatus(value as StatusFilter)}
          >
            <SelectTrigger
              id="article-status-filter"
              aria-label={ARTICLE_LABELS.statusFilterLabel}
              className="lg:w-40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{ARTICLE_LABELS.allStatuses}</SelectItem>
              <SelectItem value="PUBLISHED">
                {ARTICLE_LABELS.published}
              </SelectItem>
              <SelectItem value="DRAFT">{ARTICLE_LABELS.draft}</SelectItem>
            </SelectContent>
          </Select>

          <label className="sr-only" htmlFor="article-sort-order">
            {ARTICLE_LABELS.sortLabel}
          </label>
          <Select
            value={sort_order}
            onValueChange={(value) => updateSortOrder(value as SortOrder)}
          >
            <SelectTrigger
              id="article-sort-order"
              aria-label={ARTICLE_LABELS.sortLabel}
              className="lg:w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">{ARTICLE_LABELS.newest}</SelectItem>
              <SelectItem value="asc">{ARTICLE_LABELS.oldest}</SelectItem>
            </SelectContent>
          </Select>

          <p className="text-foreground/55 text-sm lg:ml-auto lg:whitespace-nowrap">
            {ARTICLE_LABELS.entryCount(pagination?.totalItems ?? 0)}
          </p>
        </div>

        {/* Article Language Status Legend */}
        <ArticleLanguageLegend />

        {categoriesQuery.isError && (
          <p role="status" className="text-danger px-4 pb-4 text-sm">
            {ARTICLE_LABELS.categoriesFailed}
          </p>
        )}

        {/* Article Table */}
        {articlesQuery.isPending ? (
          <ArticleMessage
            role="status"
            message={ARTICLE_LABELS.loadingArticles}
          />
        ) : articlesQuery.isError ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p role="alert" className="text-danger text-sm">
              {articlesQuery.error instanceof Error
                ? articlesQuery.error.message
                : ARTICLE_LABELS.articlesFailed}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void articlesQuery.refetch()}
            >
              {ARTICLE_LABELS.retry}
            </Button>
          </div>
        ) : articles.length === 0 ? (
          <ArticleMessage message={ARTICLE_LABELS.noArticles} />
        ) : (
          <ArticleDataTable
            articles={articles}
            onDeleteArticle={requestArticleDelete}
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
        className="text-foreground/45 absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        aria-label={ARTICLE_LABELS.searchLabel}
        type="search"
        placeholder={ARTICLE_LABELS.searchPlaceholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="bg-primary border-border/15 pl-10 text-sm"
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
      className="text-foreground/60 border-border/10 border-t px-4 py-12 text-center text-sm"
    >
      {message}
    </p>
  )
}

export { ArticlesPage }
