import { usePermissions } from '@/module/auth/hooks/use-permissions'
import type {
  Service,
  ServiceContent,
} from '@/module/division/api/division.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
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
  const { t } = useI18n()
  const { canWrite, canDelete } = usePermissions()
  const name = content?.name ?? t.division.missingTranslation
  const group = `services-${service.division_id}`
  const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
    id: `service:${service.id}`,
    index,
    group,
    type: group,
    accept: group,
    disabled: !canWrite,
  })

  return (
    <TableRow ref={sortableRef}>
      <TableCell className="w-12 px-2">
        {canWrite && (
          <button
            ref={dragHandleRef}
            type="button"
            aria-label={t.division.dragService(index + 1)}
            disabled={disabled}
            className="text-secondary cursor-grab touch-none rounded p-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GripVerticalIcon aria-hidden="true" className="size-4" />
          </button>
        )}
      </TableCell>
      <TableCell className="min-w-64">
        <div className="flex flex-col gap-1">
          <span className="text-accent font-semibold">{name}</span>
          <span className="text-muted text-sm">{t.division.serviceHint}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="bg-secondary/10 text-accent inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap">
          {divisionAbbreviation}
        </span>
      </TableCell>
      <TableCell className="text-foreground/70">{index + 1}</TableCell>
      <TableCell className="min-w-24 text-right">
        <div className="flex items-center justify-end gap-1">
          {canWrite && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              disabled={disabled}
              aria-label={t.division.editServiceAction(name)}
              onClick={onEdit}
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
              disabled={disabled}
              aria-label={t.division.deleteServiceAction(name)}
              onClick={onDelete}
            >
              <Trash2Icon aria-hidden="true" className="size-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

export { SortableServiceRow }
