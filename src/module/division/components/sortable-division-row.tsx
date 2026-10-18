import type {
  Division,
  DivisionContent,
} from '@/module/division/api/division.api'
import { DIVISION_LABELS } from '@/module/division/constants/division.constants'
import { Button } from '@/shared/components/ui/button'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { cn } from '@/shared/lib/utils'
import { useSortable } from '@dnd-kit/react/sortable'
import { GripVerticalIcon, PencilIcon, Trash2Icon, ZapIcon } from 'lucide-react'

interface SortableDivisionRowProps {
  division: Division
  content?: DivisionContent
  index: number
  serviceCount?: number
  selected: boolean
  disabled: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

function SortableDivisionRow({
  division,
  content,
  index,
  serviceCount,
  selected,
  disabled,
  onSelect,
  onEdit,
  onDelete,
}: SortableDivisionRowProps) {
  const name = content?.name ?? DIVISION_LABELS.missingTranslation
  const abbreviation = content?.abbr ?? DIVISION_LABELS.missingTranslation
  const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
    id: `division:${division.id}`,
    index,
    group: 'divisions',
    type: 'divisions',
    accept: 'divisions',
  })

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
          aria-label={DIVISION_LABELS.dragDivision(index + 1)}
          disabled={disabled}
          className="text-secondary cursor-grab touch-none rounded p-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GripVerticalIcon aria-hidden="true" className="size-4" />
        </button>
      </TableCell>
      <TableCell className="w-20">
        <div className="bg-accent flex size-10 items-center justify-center overflow-hidden rounded-lg p-2 text-white">
          {division.icon_svg ? (
            <img
              src={`data:image/svg+xml,${encodeURIComponent(division.icon_svg)}`}
              alt=""
              className="size-full object-contain"
            />
          ) : (
            <ZapIcon aria-hidden="true" className="size-5" />
          )}
        </div>
      </TableCell>
      <TableCell className="min-w-64">
        <button
          type="button"
          className="flex flex-col items-start gap-1 text-left"
          aria-pressed={selected}
          onClick={onSelect}
        >
          <span className="text-accent font-semibold">{name}</span>
          <span className="text-foreground/55 text-sm">
            {content?.abbr
              ? `/layanan#${content.abbr.toLowerCase()}`
              : DIVISION_LABELS.missingTranslation}
          </span>
        </button>
      </TableCell>
      <TableCell>
        <span className="bg-secondary/10 text-accent inline-flex rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap">
          {abbreviation}
        </span>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {serviceCount === undefined ? (
          <span className="text-foreground/55">—</span>
        ) : (
          <>
            <span className="text-accent font-semibold">{serviceCount}</span>{' '}
            layanan
          </>
        )}
      </TableCell>
      <TableCell>
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap',
            division.status === 'PUBLISHED'
              ? 'bg-success/10 text-success'
              : 'bg-warning/15 text-warning',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'size-1.5 rounded-full',
              division.status === 'PUBLISHED' ? 'bg-success' : 'bg-warning',
            )}
          />
          {division.status === 'PUBLISHED'
            ? DIVISION_LABELS.published
            : DIVISION_LABELS.draft}
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
            aria-label={DIVISION_LABELS.editDivisionAction(name)}
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
            aria-label={DIVISION_LABELS.deleteDivisionAction(name)}
            onClick={onDelete}
          >
            <Trash2Icon aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export { SortableDivisionRow }
