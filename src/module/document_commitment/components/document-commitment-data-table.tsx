import { usePermissions } from '@/module/auth/hooks/use-permissions'
import type { DocumentCommitment } from '@/module/document_commitment/api/document-commitment.api'
import { getDocumentCommitmentAssetUrl } from '@/module/document_commitment/api/document-commitment.api'
import { DOCUMENT_COMMITMENT_LABELS } from '@/module/document_commitment/constants/document-commitment.constants'
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
import { cn } from '@/shared/lib/utils'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react'
import { useMemo } from 'react'

function createColumns(
  { canWrite, canDelete }: { canWrite: boolean; canDelete: boolean },
  onEdit: (document: DocumentCommitment) => void,
  onDelete: (document: DocumentCommitment) => void,
  deletePending: boolean,
): ColumnDef<DocumentCommitment>[] {
  return [
    {
      id: 'cover',
      header: DOCUMENT_COMMITMENT_LABELS.cover,
      cell: () => (
        <span className="bg-accent inline-flex h-14 w-10 flex-col items-center justify-center rounded-md text-white">
          <FileTextIcon aria-hidden="true" className="size-4" />
          <span className="text-xs font-semibold">PDF</span>
        </span>
      ),
    },
    {
      accessorKey: 'title',
      header: DOCUMENT_COMMITMENT_LABELS.title,
      cell: ({ row }) => (
        <div className="flex min-w-64 flex-col gap-1 whitespace-normal">
          <span className="text-accent font-semibold">
            {row.original.title}
          </span>
          <a
            href={getDocumentCommitmentAssetUrl(row.original.file_path)}
            target="_blank"
            rel="noreferrer"
            className="text-secondary text-sm hover:underline"
          >
            {row.original.filename}
          </a>
        </div>
      ),
    },
    {
      accessorFn: (document) => document.document_commitment_category.name,
      id: 'category',
      header: DOCUMENT_COMMITMENT_LABELS.category,
      cell: ({ row }) => (
        <span className="bg-secondary/10 text-accent inline-flex max-w-40 rounded-full px-3 py-1 text-xs font-medium whitespace-normal">
          {row.original.document_commitment_category.name}
        </span>
      ),
    },
    {
      accessorKey: 'size',
      header: DOCUMENT_COMMITMENT_LABELS.size,
      cell: ({ row }) => (
        <span className="text-foreground/70 whitespace-nowrap">
          {formatDocumentSize(row.original.size)}
        </span>
      ),
    },
    {
      accessorKey: 'uploaded_at',
      header: DOCUMENT_COMMITMENT_LABELS.uploaded,
      cell: ({ row }) => (
        <span className="text-foreground/70 whitespace-nowrap">
          {formatUploadDate(row.original.uploaded_at)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: DOCUMENT_COMMITMENT_LABELS.status,
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
            {isPublished
              ? DOCUMENT_COMMITMENT_LABELS.published
              : DOCUMENT_COMMITMENT_LABELS.draft}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: DOCUMENT_COMMITMENT_LABELS.actions,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {canWrite && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`${DOCUMENT_COMMITMENT_LABELS.edit} ${row.original.title}`}
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
              disabled={deletePending}
              aria-label={`${DOCUMENT_COMMITMENT_LABELS.delete} ${row.original.title}`}
              onClick={() => onDelete(row.original)}
            >
              <Trash2Icon aria-hidden="true" className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]
}

interface DocumentCommitmentDataTableProps {
  documents: DocumentCommitment[]
  pageIndex: number
  pageSize: number
  pageCount: number
  totalItems: number
  deletePending: boolean
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
  onEdit,
  onDelete,
  onPageIndexChange,
  onPageSizeChange,
}: DocumentCommitmentDataTableProps) {
  const { canWrite, canDelete } = usePermissions()
  const columns = useMemo(
    () =>
      createColumns({ canWrite, canDelete }, onEdit, onDelete, deletePending),
    [canDelete, canWrite, deletePending, onDelete, onEdit],
  )
  const table = useReactTable({
    data: documents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination: { pageIndex, pageSize } },
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

      <div className="border-border/10 flex flex-col gap-4 border-t px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-foreground/60 text-sm">
          {DOCUMENT_COMMITMENT_LABELS.showingEntries(start, end, totalItems)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={DOCUMENT_COMMITMENT_LABELS.previousPage}
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
            aria-label={DOCUMENT_COMMITMENT_LABELS.nextPage}
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
              aria-label={DOCUMENT_COMMITMENT_LABELS.pageSize}
              className="w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_COMMITMENT_PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {DOCUMENT_COMMITMENT_LABELS.pageSizeOption(size)}
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

function formatDocumentSize(sizeInKilobytes: number) {
  if (sizeInKilobytes < 1024) {
    return `${sizeInKilobytes.toLocaleString('id-ID')} KB`
  }

  const megabytes = sizeInKilobytes / 1024
  return `${megabytes.toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`
}

function formatUploadDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export { DocumentCommitmentDataTable }
