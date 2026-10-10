import { ABOUT_US_LABELS } from '@/module/about-us/constants/about-us.constants'
import { Button } from '@/shared/components/ui/button'
import { useSortable } from '@dnd-kit/react/sortable'
import { GripVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'

type SortableGroup = 'about-us-missions' | 'about-us-timeline'

interface SortableAboutUsItemProps {
  clientKey: string
  index: number
  group: SortableGroup
  title: string
  description: string
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}

function SortableAboutUsItem({
  clientKey,
  index,
  group,
  title,
  description,
  canDelete,
  onEdit,
  onDelete,
}: SortableAboutUsItemProps) {
  const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
    id: clientKey,
    index,
    group,
  })
  const itemNumber = index + 1
  const isMission = group === 'about-us-missions'
  const fallbackTitle = isMission
    ? ABOUT_US_LABELS.mission(itemNumber)
    : ABOUT_US_LABELS.timelineItem(itemNumber)

  return (
    <article
      ref={sortableRef}
      className="border-border/20 bg-background flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2"
    >
      <button
        ref={dragHandleRef}
        type="button"
        aria-label={
          isMission
            ? ABOUT_US_LABELS.dragMission(itemNumber)
            : ABOUT_US_LABELS.dragTimeline(itemNumber)
        }
        className="text-secondary cursor-grab touch-none rounded p-1 active:cursor-grabbing"
      >
        <GripVerticalIcon aria-hidden="true" className="size-4" />
      </button>

      <span className="bg-primary text-accent flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold">
        {itemNumber}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-accent truncate text-sm font-medium">
          {title || fallbackTitle}
        </p>
        <p className="text-foreground/55 truncate text-xs">
          {description || '—'}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          aria-label={
            isMission
              ? ABOUT_US_LABELS.editMission(itemNumber)
              : ABOUT_US_LABELS.editTimeline(itemNumber)
          }
          onClick={onEdit}
        >
          <PencilIcon aria-hidden="true" className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          aria-label={
            isMission
              ? ABOUT_US_LABELS.deleteMission(itemNumber)
              : ABOUT_US_LABELS.deleteTimeline(itemNumber)
          }
          title={
            canDelete
              ? undefined
              : isMission
                ? ABOUT_US_LABELS.keepOneMission
                : ABOUT_US_LABELS.keepOneTimeline
          }
          disabled={!canDelete}
          onClick={onDelete}
        >
          <Trash2Icon aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </article>
  )
}

export { SortableAboutUsItem }
