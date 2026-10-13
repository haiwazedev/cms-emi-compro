import { FAQ_LABELS } from '@/module/faq/constants/faq.constants'
import type { Faq } from '@/module/faq/api/faq.api'
import { Button } from '@/shared/components/ui/button'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { cn } from '@/shared/lib/utils'
import { useSortable } from '@dnd-kit/react/sortable'
import {
  CopyIcon,
  GripVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react'

interface SortableFaqRowProps {
  faq: Faq
  index: number
  selected: boolean
  disabled: boolean
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

function SortableFaqRow({
  faq,
  index,
  selected,
  disabled,
  onEdit,
  onDuplicate,
  onDelete,
}: SortableFaqRowProps) {
  const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
    id: `faq:${faq.id}`,
    index,
    group: 'faqs',
  })
  const published = faq.status === 'PUBLISHED'

  return (
    <TableRow
      ref={sortableRef}
      data-state={selected ? 'selected' : undefined}
      className={selected ? 'bg-primary/70' : undefined}
    >
      <TableCell className="w-12 px-2">
        <button
          ref={dragHandleRef}
          type="button"
          disabled={disabled}
          aria-label={FAQ_LABELS.dragFaq(index + 1)}
          className="text-secondary cursor-grab touch-none rounded p-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GripVerticalIcon aria-hidden="true" className="size-4" />
        </button>
      </TableCell>
      <TableCell className="w-20">{index + 1}</TableCell>
      <TableCell className="min-w-64">
        <button
          type="button"
          className="text-accent text-left font-medium"
          onClick={onEdit}
        >
          {faq.question}
        </button>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap',
            published
              ? 'bg-success/10 text-success'
              : 'bg-warning/15 text-warning',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'size-1.5 rounded-full',
              published ? 'bg-success' : 'bg-warning',
            )}
          />
          {published ? FAQ_LABELS.published : FAQ_LABELS.draft}
        </span>
      </TableCell>
      <TableCell className="min-w-32 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={disabled}
            aria-label={FAQ_LABELS.editAction(faq.question)}
            onClick={onEdit}
          >
            <PencilIcon aria-hidden="true" className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={disabled}
            aria-label={FAQ_LABELS.duplicateAction(faq.question)}
            onClick={onDuplicate}
          >
            <CopyIcon aria-hidden="true" className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={disabled}
            aria-label={FAQ_LABELS.deleteAction(faq.question)}
            onClick={onDelete}
          >
            <Trash2Icon aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export { SortableFaqRow }
