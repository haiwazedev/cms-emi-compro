import {
  ARTICLE_LABELS,
  ARTICLE_PAGE_SIZES,
} from '@/module/article/constants/article.constants'
import type {
  ArticleListItem,
  ArticleStatus,
} from '@/module/article/api/article.api'
import { Button } from '@/shared/components/ui/button'
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
import type { ComponentProps } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react'

function createArticleColumns(
  onDeleteArticle: (article: ArticleListItem) => void,
  deletePending: boolean,
): ColumnDef<ArticleListItem>[] {
  return [
    {
      id: 'photo',
      header: ARTICLE_LABELS.photo,
      cell: ({ row }) => <ArticlePhoto article={row.original} />,
    },
    {
      accessorKey: 'title',
      header: ARTICLE_LABELS.title,
      cell: ({ row }) => (
        <div className="flex min-w-64 flex-col gap-1 whitespace-normal">
          <span className="text-accent font-semibold">
            {row.original.title ?? '-'}
          </span>
          {row.original.slug && (
            <span className="text-foreground/55 text-sm">
              /articles/{row.original.slug}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorFn: (article) => article.article_category.name,
      id: 'category',
      header: ARTICLE_LABELS.category,
      cell: ({ row }) => (
        <span className="bg-secondary/10 text-accent inline-flex rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap">
          {row.original.article_category.name}
        </span>
      ),
    },
    {
      accessorKey: 'issue_date',
      header: ARTICLE_LABELS.date,
      cell: ({ row }) => (
        <span className="text-foreground/70 whitespace-nowrap">
          {formatIssueDate(row.original.issue_date)}
        </span>
      ),
    },
    {
      id: 'languages',
      header: ARTICLE_LABELS.languages,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.languages.map((language) => {
            const status = language.status ?? 'MISSING'
            const label = ARTICLE_LABELS.languageStatus(
              language.abbreviated_language,
              LANGUAGE_PILLS[status].label,
            )

            return (
              <LanguagePill
                key={language.language_id}
                status={status}
                title={label}
                aria-label={label}
              >
                {language.abbreviated_language}
              </LanguagePill>
            )
          })}
        </div>
      ),
    },
    {
      id: 'actions',
      header: ARTICLE_LABELS.actions,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            asChild
            variant="outline"
            size="icon"
            aria-label={ARTICLE_LABELS.edit + ' ' + (row.original.title ?? '')}
          >
            <Link
              to="/articles/$articleId/edit"
              params={{ articleId: String(row.original.id) }}
            >
              <PencilIcon aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={deletePending}
            aria-label={`${ARTICLE_LABELS.delete} ${row.original.title ?? ''}`}
            onClick={() => onDeleteArticle(row.original)}
          >
            <Trash2Icon aria-hidden="true" className="size-4" />
          </Button>
        </div>
      ),
    },
  ]
}

interface ArticleDataTableProps {
  articles: ArticleListItem[]
  pageIndex: number
  pageSize: number
  pageCount: number
  totalItems: number
  deletePending: boolean
  onDeleteArticle: (article: ArticleListItem) => void
  onPageIndexChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
}

function ArticleDataTable({
  articles,
  pageIndex,
  pageSize,
  pageCount,
  totalItems,
  deletePending,
  onDeleteArticle,
  onPageIndexChange,
  onPageSizeChange,
}: ArticleDataTableProps) {
  const articleColumns = useMemo(
    () => createArticleColumns(onDeleteArticle, deletePending),
    [deletePending, onDeleteArticle],
  )

  const table = useReactTable({
    data: articles,
    columns: articleColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination: { pageIndex, pageSize } },
  })

  const start = totalItems === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalItems)

  return (
    <>
      <Table className="min-w-max">
        <TableHeader className="bg-primary">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={
                    header.column.id === 'actions' ? 'text-right' : undefined
                  }
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

      <div className="border-border/10 flex flex-col gap-4 border-t px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-foreground/60 text-sm">
          {ARTICLE_LABELS.showingEntries(start, end, totalItems)}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={ARTICLE_LABELS.previousPage}
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
            aria-label={ARTICLE_LABELS.nextPage}
            disabled={pageIndex + 1 >= pageCount}
            onClick={() => onPageIndexChange(pageIndex + 1)}
          >
            <ChevronRightIcon aria-hidden="true" className="size-4" />
          </Button>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger
              aria-label={ARTICLE_LABELS.pageSize}
              className="h-9 w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ARTICLE_PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {ARTICLE_LABELS.pageSizeOption(size)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
}

type LanguagePillStatus = ArticleStatus | 'MISSING'

const LANGUAGE_PILLS: Record<
  LanguagePillStatus,
  { label: string; className: string }
> = {
  PUBLISHED: {
    label: ARTICLE_LABELS.published,
    className: 'bg-success/10 text-success',
  },
  DRAFT: {
    label: ARTICLE_LABELS.draft,
    className: 'bg-warning/15 text-warning',
  },
  MISSING: {
    label: ARTICLE_LABELS.translationMissing,
    className: 'bg-foreground/10 text-foreground/50',
  },
}

function LanguagePill({
  status,
  className,
  ...props
}: ComponentProps<'span'> & { status: LanguagePillStatus }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium',
        LANGUAGE_PILLS[status].className,
        className,
      )}
      {...props}
    />
  )
}

function ArticleLanguageLegend() {
  return (
    <div className="text-foreground/55 flex flex-wrap items-center gap-2 px-4 pb-4 text-xs">
      <span>{ARTICLE_LABELS.languageLegend}</span>
      {(Object.keys(LANGUAGE_PILLS) as LanguagePillStatus[]).map((status) => (
        <LanguagePill key={status} status={status}>
          {LANGUAGE_PILLS[status].label}
        </LanguagePill>
      ))}
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

function formatIssueDate(issueDate: string | null) {
  if (!issueDate) return '-'

  const date = new Date(`${issueDate.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export { ArticleDataTable, ArticleLanguageLegend }
