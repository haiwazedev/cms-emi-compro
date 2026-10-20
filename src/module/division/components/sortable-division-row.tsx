import { usePermissions } from '@/module/auth/hooks/use-permissions'
import type {
  Division,
  DivisionContent,
} from '@/module/division/api/division.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { Button } from '@/shared/components/ui/button'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { ArticleStatusPill } from '@/module/article/components/article-language-pills'
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
  const { t } = useI18n()
  const { canWrite, canDelete } = usePermissions()
  const name = content?.name ?? t.division.missingTranslation
  const abbreviation = content?.abbr ?? t.division.missingTranslation
  const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
    id: `division:${division.id}`,
    index,
    group: 'divisions',
    type: 'divisions',
    accept: 'divisions',
    disabled: !canWrite,
  })

  return (
    <TableRow
      ref={sortableRef}
      data-state={selected ? 'selected' : undefined}
      className={selected ? 'bg-primary/70' : undefined}
    >
      <TableCell className="w-12 px-2">
        {canWrite && (
          <button
            ref={dragHandleRef}
            type="button"
            aria-label={t.division.dragDivision(index + 1)}
            disabled={disabled}
            className="text-secondary cursor-grab touch-none rounded p-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GripVerticalIcon aria-hidden="true" className="size-4" />
          </button>
        )}
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
          <span className="text-muted text-sm">
            {content?.abbr
              ? `/layanan#${content.abbr.toLowerCase()}`
              : t.division.missingTranslation}
          </span>
        </button>
      </TableCell>
      <TableCell>
        <span className="bg-secondary/10 text-accent inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap">
          {abbreviation}
        </span>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {serviceCount === undefined ? (
          <span className="text-muted">—</span>
        ) : (
          <>
            <span className="text-accent font-semibold">{serviceCount}</span>{' '}
            layanan
          </>
        )}
      </TableCell>
      <TableCell>
        <ArticleStatusPill status={division.status} />
      </TableCell>
      <TableCell className="min-w-24 text-right">
        <div className="flex items-center justify-end gap-1">
          {canWrite && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              disabled={disabled}
              aria-label={t.division.editDivisionAction(name)}
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
              aria-label={t.division.deleteDivisionAction(name)}
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

export { SortableDivisionRow }
