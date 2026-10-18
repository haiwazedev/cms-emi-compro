import type {
  Service,
  ServiceContent,
} from '@/module/division/api/division.api'
import { DIVISION_LABELS } from '@/module/division/constants/division.constants'
import { Button } from '@/shared/components/ui/button'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { useSortable } from '@dnd-kit/react/sortable'
import { GripVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'

interface SortableServiceRowProps {
  service: Service
  content?: ServiceContent
  index: number
  divisionAbbreviation: string
  disabled: boolean
  onEdit: () => void
  onDelete: () => void
}

function SortableServiceRow({
  service,
  content,
  index,
  divisionAbbreviation,
  disabled,
  onEdit,
  onDelete,
}: SortableServiceRowProps) {
  const name = content?.name ?? DIVISION_LABELS.missingTranslation
  const group = `services-${service.division_id}`
  const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
    id: `service:${service.id}`,
    index,
    group,
    type: group,
    accept: group,
  })

  return (
    <TableRow ref={sortableRef}>
      <TableCell className="w-12 px-2">
        <button
          ref={dragHandleRef}
          type="button"
          aria-label={DIVISION_LABELS.dragService(index + 1)}
          disabled={disabled}
          className="text-secondary cursor-grab touch-none rounded p-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GripVerticalIcon aria-hidden="true" className="size-4" />
        </button>
      </TableCell>
      <TableCell className="min-w-64">
        <div className="flex flex-col gap-1">
          <span className="text-accent font-semibold">{name}</span>
          <span className="text-foreground/55 text-sm">
            {DIVISION_LABELS.serviceHint}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className="bg-secondary/10 text-accent inline-flex rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap">
          {divisionAbbreviation}
        </span>
      </TableCell>
      <TableCell className="min-w-24 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={disabled}
            aria-label={DIVISION_LABELS.editServiceAction(name)}
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
            aria-label={DIVISION_LABELS.deleteServiceAction(name)}
            onClick={onDelete}
          >
            <Trash2Icon aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export { SortableServiceRow }
