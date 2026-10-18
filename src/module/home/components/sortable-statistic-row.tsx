import { HOME_LABELS } from '@/module/home/constants/home.constants'
import type { HomeStatisticDraft } from '@/module/home/types/home.types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { useSortable } from '@dnd-kit/react/sortable'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  GripVerticalIcon,
  Trash2Icon,
} from 'lucide-react'

interface SortableStatisticRowProps {
  statistic: HomeStatisticDraft
  index: number
  total: number
  canDelete: boolean
  onChange: (
    clientKey: string,
    field: 'label' | 'number' | 'description',
    value: string,
  ) => void
  onMove: (fromIndex: number, toIndex: number) => void
  onDuplicate: (clientKey: string) => void
  onDelete: (clientKey: string) => void
}

function SortableStatisticRow({
  statistic,
  index,
  total,
  canDelete,
  onChange,
  onMove,
  onDuplicate,
  onDelete,
}: SortableStatisticRowProps) {
  const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
    id: statistic.clientKey,
    index,
    group: 'home-statistics',
    type: 'home-statistics',
    accept: 'home-statistics',
  })
  const statisticNumber = index + 1

  return (
    <TableRow ref={sortableRef}>
      <TableCell className="w-12 px-2">
        <button
          ref={dragHandleRef}
          type="button"
          aria-label={`Geser statistik ${statisticNumber}`}
          className="text-secondary cursor-grab touch-none rounded p-1 active:cursor-grabbing"
        >
          <GripVerticalIcon aria-hidden="true" className="size-4" />
        </button>
      </TableCell>
      <TableCell className="min-w-48">
        <Input
          aria-label={`${HOME_LABELS.statisticLabel} ${statisticNumber}`}
          value={statistic.label}
          onChange={(event) =>
            onChange(statistic.clientKey, 'label', event.currentTarget.value)
          }
        />
      </TableCell>
      <TableCell className="w-28">
        <Input
          aria-label={`${HOME_LABELS.statisticNumber} ${statisticNumber}`}
          value={statistic.number}
          onChange={(event) =>
            onChange(statistic.clientKey, 'number', event.currentTarget.value)
          }
        />
      </TableCell>
      <TableCell className="min-w-64">
        <Input
          aria-label={`${HOME_LABELS.statisticDescription} ${statisticNumber}`}
          value={statistic.description}
          onChange={(event) =>
            onChange(
              statistic.clientKey,
              'description',
              event.currentTarget.value,
            )
          }
        />
      </TableCell>
      <TableCell className="w-40">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={HOME_LABELS.moveStatisticUp(statisticNumber)}
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
          >
            <ChevronUpIcon aria-hidden="true" className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={HOME_LABELS.moveStatisticDown(statisticNumber)}
            disabled={index === total - 1}
            onClick={() => onMove(index, index + 1)}
          >
            <ChevronDownIcon aria-hidden="true" className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={HOME_LABELS.duplicateStatistic(statisticNumber)}
            onClick={() => onDuplicate(statistic.clientKey)}
          >
            <CopyIcon aria-hidden="true" className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={HOME_LABELS.deleteStatistic(statisticNumber)}
            title={canDelete ? undefined : HOME_LABELS.keepOneStatistic}
            disabled={!canDelete}
            onClick={() => onDelete(statistic.clientKey)}
          >
            <Trash2Icon aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export { SortableStatisticRow }
