import { usePermissions } from '@/module/auth/hooks/use-permissions'
import type { DocumentCommitment } from '@/module/document_commitment/api/document-commitment.api'
import { getDocumentCommitmentAssetUrl } from '@/module/document_commitment/api/document-commitment.api'
import type { Dictionary } from '@/shared/lib/i18n/id'
import { useI18n, type Locale } from '@/shared/lib/i18n/i18n-context'
import { DOCUMENT_COMMITMENT_PAGE_SIZES } from '@/module/document_commitment/constants/document-commitment.constants'
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
import { TableCheckbox } from '@/shared/components/ui/table-checkbox'
import { ArticleStatusPill } from '@/module/article/components/article-language-pills'
import { cn } from '@/shared/lib/utils'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  OnChangeFn,
  RowSelectionState,
} from '@tanstack/react-table'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react'
import { useMemo } from 'react'

function createColumns(
  t: Dictionary,
  locale: Locale,
  { canWrite, canDelete }: { canWrite: boolean; canDelete: boolean },
  onEdit: (document: DocumentCommitment) => void,
  onDelete: (document: DocumentCommitment) => void,
  deletePending: boolean,
): ColumnDef<DocumentCommitment>[] {
  const columns: ColumnDef<DocumentCommitment>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <TableCheckbox
          aria-label={t.documentCommitment.selectAllDocuments}
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <TableCheckbox
          aria-label={t.documentCommitment.selectDocument(row.original.title)}
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      id: 'cover',
      header: t.documentCommitment.cover,
      cell: () => (
        <span className="bg-accent inline-flex h-14 w-10 items-end rounded-md p-1 text-xs font-semibold text-white">
          PDF
        </span>
      ),
    },
    {
      accessorKey: 'title',
      header: t.documentCommitment.title,
      cell: ({ row }) => (
        <div className="flex min-w-64 flex-col gap-1 whitespace-normal">
          <span className="text-accent font-semibold">
            {row.original.title}
          </span>
          <a
            href={getDocumentCommitmentAssetUrl(row.original.file_path)}
            target="_blank"
            rel="noreferrer"
            className="text-muted text-sm hover:underline"
          >
            {row.original.filename}
          </a>
        </div>
      ),
    },
    {
      accessorFn: (document) => document.document_commitment_category.name,
      id: 'category',
      header: t.documentCommitment.category,
      cell: ({ row }) => (
        <span className="bg-secondary/10 text-accent inline-flex max-w-40 rounded-full px-3 py-1 text-xs font-semibold whitespace-normal">
          {row.original.document_commitment_category.name}
        </span>
      ),
    },
    {
      accessorKey: 'size',
      header: t.documentCommitment.size,
      cell: ({ row }) => (
        <span className="text-foreground/70 whitespace-nowrap">
          {formatDocumentSize(row.original.size, locale)}
        </span>
      ),
    },
    {
      accessorKey: 'uploaded_at',
      header: t.documentCommitment.uploaded,
      cell: ({ row }) => (
        <span className="text-foreground/70 whitespace-nowrap">
          {formatUploadDate(row.original.uploaded_at, locale)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t.documentCommitment.status,
      cell: ({ row }) => <ArticleStatusPill status={row.original.status} />,
    },
    {
      id: 'actions',
      header: () => (
        <span className="sr-only">{t.documentCommitment.actions}</span>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {canWrite && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              aria-label={`${t.common.edit} ${row.original.title}`}
              onClick={() => onEdit(row.original)}
            >
              <PencilIcon aria-hidden="true" className="size-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              disabled={deletePending}
              aria-label={`${t.common.delete} ${row.original.title}`}
              onClick={() => onDelete(row.original)}
            >
              <Trash2Icon aria-hidden="true" className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  // Selection only feeds bulk delete.
  return canDelete
    ? columns
    : columns.filter((column) => column.id !== 'select')
}

interface DocumentCommitmentDataTableProps {
  documents: DocumentCommitment[]
  pageIndex: number
  pageSize: number
  pageCount: number
  totalItems: number
  deletePending: boolean
  rowSelection: RowSelectionState
  onRowSelectionChange: OnChangeFn<RowSelectionState>
  onEdit: (document: DocumentCommitment) => void
  onDelete: (document: DocumentCommitment) => void
  onPageIndexChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
}

function DocumentCommitmentDataTable({
  documents,
  pageIndex,
  pageSize,
  pageCount,
  totalItems,
  deletePending,
  rowSelection,
  onRowSelectionChange,
  onEdit,
  onDelete,
  onPageIndexChange,
  onPageSizeChange,
}: DocumentCommitmentDataTableProps) {
  const { canWrite, canDelete } = usePermissions()
  const { locale, t } = useI18n()
  const columns = useMemo(
    () =>
      createColumns(
        t,
        locale,
        { canWrite, canDelete },
        onEdit,
        onDelete,
        deletePending,
      ),
    [t, locale, canDelete, canWrite, deletePending, onDelete, onEdit],
  )
  const table = useReactTable({
    data: documents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (document) => String(document.id),
    manualPagination: true,
    pageCount,
    state: { pagination: { pageIndex, pageSize }, rowSelection },
    onRowSelectionChange,
  })
  const start = totalItems === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalItems)
  const currentPage = pageIndex + 1
  const visiblePages = getVisiblePages(currentPage, pageCount)

  return (
    <>
      <Table className="min-w-max">
        <TableHeader className="bg-primary">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-muted font-bold uppercase"
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
            <TableRow
              key={row.id}
              className={cn(row.getIsSelected() && 'bg-secondary/5')}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={
                    cell.column.id === 'actions' ? 'min-w-28 text-right' : ''
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="border-border flex flex-col gap-4 border-t px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-muted text-sm">
          {t.documentCommitment.showingEntries(start, end, totalItems)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t.documentCommitment.previousPage}
            disabled={pageIndex === 0}
            onClick={() => onPageIndexChange(pageIndex - 1)}
          >
            <ChevronLeftIcon aria-hidden="true" className="size-4" />
          </Button>
          {visiblePages.map((page) => (
            <Button
              key={page}
              type="button"
              variant={page === currentPage ? 'default' : 'outline'}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Halaman ${page}`}
              onClick={() => onPageIndexChange(page - 1)}
            >
              {page}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t.documentCommitment.nextPage}
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
              aria-label={t.documentCommitment.pageSize}
              className="w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_COMMITMENT_PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {t.documentCommitment.pageSizeOption(size)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
}

function getVisiblePages(currentPage: number, pageCount: number) {
  const visiblePageCount = Math.min(5, pageCount)
  const firstPage = Math.max(
    1,
    Math.min(currentPage - 1, pageCount - visiblePageCount + 1),
  )

  return Array.from(
    { length: visiblePageCount },
    (_, index) => firstPage + index,
  )
}

function formatDocumentSize(sizeInKilobytes: number, locale: Locale) {
  if (sizeInKilobytes < 1024) {
    return `${sizeInKilobytes.toLocaleString(locale)} KB`
  }

  const megabytes = sizeInKilobytes / 1024
  return `${megabytes.toLocaleString(locale, { maximumFractionDigits: 1 })} MB`
}

function formatUploadDate(value: string, locale: Locale) {
  return new Date(value).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export { DocumentCommitmentDataTable }
