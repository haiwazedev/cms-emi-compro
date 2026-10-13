import type { Client } from '@/module/client/api/client.api'
import { CLIENT_LABELS } from '@/module/client/constants/client.constants'
import { getMediaAssetUrl } from '@/module/media/api/media.api'
import type { Media } from '@/module/media/api/media.api'
import { Button } from '@/shared/components/ui/button'
import { useSortable } from '@dnd-kit/react/sortable'
import { GripVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'

interface SortableClientCardProps {
  client: Client
  media?: Media
  index: number
  disabled: boolean
  onEdit: () => void
  onDelete: () => void
}

function SortableClientCard({
  client,
  media,
  index,
  disabled,
  onEdit,
  onDelete,
}: SortableClientCardProps) {
  const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
    id: `client:${client.id}`,
    index,
    group: 'clients',
  })

  return (
    <article
      ref={sortableRef}
      className="group border-border/15 bg-background flex flex-col overflow-hidden rounded-lg border"
    >
      <div className="bg-primary relative flex h-28 items-center justify-center p-4">
        {media ? (
          <img
            src={getMediaAssetUrl(media.path)}
            alt={client.name}
            className="max-h-full max-w-full object-contain grayscale transition group-hover:grayscale-0"
          />
        ) : (
          <span className="text-secondary/70 text-center font-semibold">
            {client.name}
          </span>
        )}

        <button
          ref={dragHandleRef}
          type="button"
          disabled={disabled}
          aria-label={CLIENT_LABELS.dragClient(client.name)}
          className="bg-background/80 text-secondary absolute top-2 left-2 cursor-grab touch-none rounded p-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GripVerticalIcon aria-hidden="true" className="size-4" />
        </button>

        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7"
            disabled={disabled}
            aria-label={CLIENT_LABELS.editAction(client.name)}
            onClick={onEdit}
          >
            <PencilIcon aria-hidden="true" className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7"
            disabled={disabled}
            aria-label={CLIENT_LABELS.deleteAction(client.name)}
            onClick={onDelete}
          >
            <Trash2Icon aria-hidden="true" className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1 px-3 py-3">
        <button
          type="button"
          className="text-accent truncate text-left text-sm font-medium"
          onClick={onEdit}
        >
          {client.name}
        </button>
        <p className="text-foreground/55 truncate text-xs">
          {media?.filename ?? CLIENT_LABELS.noLogo}
        </p>
      </div>
    </article>
  )
}

export { SortableClientCard }
