import { useI18n } from '@/shared/lib/i18n/i18n-context'
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
  const { t } = useI18n()
  const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
    id: clientKey,
    index,
    group,
    type: group,
    accept: group,
  })
  const itemNumber = index + 1
  const isMission = group === 'about-us-missions'
  const fallbackTitle = isMission
    ? t.aboutUs.mission(itemNumber)
    : t.aboutUs.timelineItem(itemNumber)

  return (
    <article
      ref={sortableRef}
      className="border-border bg-background flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2"
    >
      <button
        ref={dragHandleRef}
        type="button"
        aria-label={
          isMission
            ? t.aboutUs.dragMission(itemNumber)
            : t.aboutUs.dragTimeline(itemNumber)
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
        <p className="text-muted truncate text-xs">{description || '—'}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          aria-label={
            isMission
              ? t.aboutUs.editMission(itemNumber)
              : t.aboutUs.editTimeline(itemNumber)
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
              ? t.aboutUs.deleteMission(itemNumber)
              : t.aboutUs.deleteTimeline(itemNumber)
          }
          title={
            canDelete
              ? undefined
              : isMission
                ? t.aboutUs.keepOneMission
                : t.aboutUs.keepOneTimeline
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
