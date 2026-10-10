import {
  ARTICLE_LABELS,
  ARTICLE_PAGE_SIZES,
} from '@/module/article/constants/article.constants'
import type { Article } from '@/module/article/api/article.api'
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
  onDeleteArticle: (article: Article) => void,
  deletePending: boolean,
): ColumnDef<Article>[] {
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
            {row.original.title}
          </span>
          <span className="text-foreground/55 text-sm">
            /berita/{row.original.slug}
          </span>
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
      accessorKey: 'status',
      header: ARTICLE_LABELS.status,
      cell: ({ row }) => {
        const isPublished = row.original.status === 'PUBLISHED'

        return (
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap',
              isPublished
                ? 'bg-success/10 text-success'
                : 'bg-warning/15 text-warning',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'size-1.5 rounded-full',
                isPublished ? 'bg-success' : 'bg-warning',
              )}
            />
            {isPublished ? ARTICLE_LABELS.published : ARTICLE_LABELS.draft}
          </span>
        )
      },
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
            aria-label={ARTICLE_LABELS.edit + ' ' + row.original.title}
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
            aria-label={`${ARTICLE_LABELS.delete} ${row.original.title}`}
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
  articles: Article[]
  pageIndex: number
  pageSize: number
  pageCount: number
  totalItems: number
  deletePending: boolean
  onDeleteArticle: (article: Article) => void
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

function ArticlePhoto({ article }: { article: Article }) {
  if (!article.primary_photo_url) {
    return (
      <span className="bg-primary text-foreground/40 flex size-11 items-center justify-center rounded-md">
        <ImageIcon aria-hidden="true" className="size-5" />
      </span>
    )
  }

  const baseUrl = apiBaseUrl()
  const photoUrl = /^https?:\/\//.test(article.primary_photo_url)
    ? article.primary_photo_url
    : new URL(article.primary_photo_url, `${baseUrl}/`).toString()

  return (
    <img
      src={photoUrl}
      alt=""
      className="size-11 rounded-md object-cover"
      loading="lazy"
    />
  )
}

function apiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(
    /\/+$/,
    '',
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

export { ArticleDataTable }
