import { ArticleLanguagePills } from '@/module/article/components/article-language-pills'
import { FAQ_LABELS } from '@/module/faq/constants/faq.constants'
import type { FaqListItem } from '@/module/faq/api/faq.api'
import { Button } from '@/shared/components/ui/button'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { useSortable } from '@dnd-kit/react/sortable'
import { GripVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'

interface SortableFaqRowProps {
  faq: FaqListItem
  index: number
  selected: boolean
  disabled: boolean
  onEdit: () => void
  onDelete: () => void
}

function SortableFaqRow({
  faq,
  index,
  selected,
  disabled,
  onEdit,
  onDelete,
}: SortableFaqRowProps) {
  const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
    id: `faq:${faq.id}`,
    index,
    group: 'faqs',
  })
  const question = faq.question ?? ''

  return (
    <TableRow
      ref={sortableRef}
      data-state={selected ? 'selected' : undefined}
      className={selected ? 'bg-primary/70' : undefined}
    >
      {/* Draggable Button */}
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

      {/* Index */}
      <TableCell className="w-20">{index + 1}</TableCell>

      {/* Question */}
      <TableCell className="min-w-64">
        <button
          type="button"
          className="text-accent text-left font-medium"
          onClick={onEdit}
        >
          {question}
        </button>
      </TableCell>

      {/* Status per language */}
      <TableCell>
        <ArticleLanguagePills languages={faq.languages} />
      </TableCell>

      {/* Actions */}
      <TableCell className="min-w-32 text-right">
        <div className="flex items-center justify-end gap-1">
          {/* Edit Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={disabled}
            aria-label={FAQ_LABELS.editAction(question)}
            onClick={onEdit}
          >
            <PencilIcon aria-hidden="true" className="size-4" />
          </Button>

          {/* Delete Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={disabled}
            aria-label={FAQ_LABELS.deleteAction(question)}
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
