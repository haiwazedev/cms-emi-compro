import { usePermissions } from '@/module/auth/hooks/use-permissions'
import { ARTICLE_PAGE_SIZES } from '@/module/article/constants/article.constants'
import type { Dictionary } from '@/shared/lib/i18n/id'
import { useI18n, type Locale } from '@/shared/lib/i18n/i18n-context'
import type { ArticleListItem } from '@/module/article/api/article.api'
import { Button } from '@/shared/components/ui/button'
import { TableCheckbox } from '@/shared/components/ui/table-checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  ArticleLanguagePills,
  ArticleStatusPill,
} from '@/module/article/components/article-language-pills'
import { getMediaAssetUrl } from '@/module/media/api/media.api'
import { cn } from '@/shared/lib/utils'
import { Link } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react'

function createArticleColumns(
  t: Dictionary,
  locale: Locale,
  onDeleteArticle: (article: ArticleListItem) => void,
  { canWrite, canDelete }: { canWrite: boolean; canDelete: boolean },
  compact: boolean,
): ColumnDef<ArticleListItem>[] {
  const hiddenColumns = compact ? ['select', 'category', 'languages'] : []
  const columns: ColumnDef<ArticleListItem>[] = [
    {
      // shortcut: UI-only selection, no bulk actions yet.
      id: 'select',
      header: ({ table }) => (
        <TableCheckbox
          aria-label={t.article.selectAllArticles}
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <TableCheckbox
          aria-label={t.article.selectArticle(row.original.title ?? '')}
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      id: 'photo',
      header: t.article.photo,
      cell: ({ row }) => <ArticlePhoto article={row.original} />,
    },
    {
      accessorKey: 'title',
      header: t.article.title,
      cell: ({ row }) => (
        <div className="flex min-w-64 flex-col gap-1 whitespace-normal">
          <span className="text-accent font-semibold">
            {row.original.title ?? '-'}
          </span>
          {compact ? (
            <span className="text-muted text-sm">
              {row.original.article_category.name}
            </span>
          ) : (
            row.original.slug && (
              <span className="text-muted text-sm">
                /berita/{row.original.slug}
              </span>
            )
          )}
        </div>
      ),
    },
    {
      accessorFn: (article) => article.article_category.name,
      id: 'category',
      header: t.article.category,
      cell: ({ row }) => (
        <span className="bg-secondary/10 text-accent inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap">
          {row.original.article_category.name}
        </span>
      ),
    },
    {
      accessorKey: 'issue_date',
      header: t.article.date,
      cell: ({ row }) => (
        <span className="text-foreground/70 whitespace-nowrap">
          {formatIssueDate(row.original.issue_date, locale)}
        </span>
      ),
    },
    {
      id: 'status',
      header: t.article.status,
      cell: ({ row }) => <ArticleStatusPill status={row.original.status} />,
    },
    {
      id: 'languages',
      header: t.article.languages,
      cell: ({ row }) => (
        <ArticleLanguagePills languages={row.original.languages} />
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{t.article.actions}</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {canWrite && (
            <Button
              asChild
              variant="outline"
              size="icon"
              className="size-8"
              aria-label={t.common.edit + ' ' + (row.original.title ?? '')}
            >
              <Link
                to="/articles/$articleId/edit"
                params={{ articleId: String(row.original.id) }}
              >
                <PencilIcon aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          )}
          {canDelete && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              aria-label={`${t.common.delete} ${row.original.title ?? ''}`}
              onClick={() => onDeleteArticle(row.original)}
            >
              <Trash2Icon aria-hidden="true" className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return columns.filter((column) => !hiddenColumns.includes(column.id ?? ''))
}

interface ArticleTablePagination {
  pageIndex: number
  pageSize: number
  pageCount: number
  totalItems: number
  onPageIndexChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
}

interface ArticleDataTableProps {
  articles: ArticleListItem[]
  onDeleteArticle: (article: ArticleListItem) => void
  pagination?: ArticleTablePagination
  // Dashboard layout: category under the title, status instead of category/languages.
  compact?: boolean
}

function ArticleDataTable({
  articles,
  onDeleteArticle,
  pagination,
  compact = false,
}: ArticleDataTableProps) {
  const { canWrite, canDelete } = usePermissions()
  const { locale, t } = useI18n()
  const articleColumns = useMemo(
    () =>
      createArticleColumns(
        t,
        locale,
        onDeleteArticle,
        { canWrite, canDelete },
        compact,
      ),
    [t, locale, canDelete, canWrite, compact, onDeleteArticle],
  )

  const table = useReactTable({
    data: articles,
    columns: articleColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (article) => String(article.id),
    manualPagination: true,
  })

  return (
    <>
      <Table className="min-w-max">
        <TableHeader className="bg-primary">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b-0 hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    'text-muted font-bold uppercase',
                    header.column.id === 'actions' && 'text-right',
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={
                    cell.column.id === 'actions' ? 'min-w-32 text-right' : ''
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && <ArticleTablePaginationBar {...pagination} />}
    </>
  )
}

function ArticleTablePaginationBar({
  pageIndex,
  pageSize,
  pageCount,
  totalItems,
  onPageIndexChange,
  onPageSizeChange,
}: ArticleTablePagination) {
  const { t } = useI18n()
  const start = totalItems === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalItems)

  return (
    <div className="border-border flex flex-col gap-4 border-t px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-muted text-sm">
        {t.article.showingEntries(start, end, totalItems)}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t.article.previousPage}
          disabled={pageIndex === 0}
          onClick={() => onPageIndexChange(pageIndex - 1)}
        >
          <ChevronLeftIcon aria-hidden="true" className="size-4" />
        </Button>
        <span className="bg-accent inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm text-white">
          {pageCount === 0 ? 0 : pageIndex + 1}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t.article.nextPage}
          disabled={pageIndex + 1 >= pageCount}
          onClick={() => onPageIndexChange(pageIndex + 1)}
        >
          <ChevronRightIcon aria-hidden="true" className="size-4" />
        </Button>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger aria-label={t.article.pageSize} className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ARTICLE_PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {t.article.pageSizeOption(size)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function ArticlePhoto({ article }: { article: ArticleListItem }) {
  if (!article.primary_photo_url) {
    return (
      <span className="bg-primary text-foreground/40 flex size-11 items-center justify-center rounded-md">
        <ImageIcon aria-hidden="true" className="size-5" />
      </span>
    )
  }

  return (
    <img
      src={getMediaAssetUrl(article.primary_photo_url)}
      alt=""
      className="size-11 rounded-md object-cover"
      loading="lazy"
    />
  )
}

function formatIssueDate(issueDate: string | null, locale: Locale) {
  if (!issueDate) return '-'

  const date = new Date(`${issueDate.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export { ArticleDataTable }
