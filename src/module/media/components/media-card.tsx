import type { Media } from '@/module/media/api/media.api'
import { getMediaAssetUrl } from '@/module/media/api/media.api'
import { MEDIA_LABELS } from '@/module/media/constants/media.constants'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { cn } from '@/shared/lib/utils'
import { FileTextIcon } from 'lucide-react'

interface MediaCardProps {
  media: Media
  view: 'grid' | 'list'
  selected: boolean
  onSelectionChange: (mediaId: number, selected: boolean) => void
}

function MediaCard({
  media,
  view,
  selected,
  onSelectionChange,
}: MediaCardProps) {
  const isPicture = media.type === 'PICTURE'

  return (
    <article
      className={cn(
        'border-border bg-background overflow-hidden rounded-xl border transition-colors',
        selected && 'border-accent ring-accent/20 ring-2',
        view === 'list' && 'flex items-center gap-3 p-3',
      )}
    >
      <div
        className={cn(
          'bg-primary relative flex items-center justify-center overflow-hidden',
          view === 'grid'
            ? 'aspect-video'
            : 'aspect-video w-32 shrink-0 rounded-md',
        )}
      >
        {isPicture ? (
          <img
            src={getMediaAssetUrl(media.path)}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <FileTextIcon
            aria-hidden="true"
            className="text-foreground/35 size-8"
          />
        )}
        <label className="absolute top-2 right-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-transparent">
          <Checkbox
            checked={selected}
            aria-label={MEDIA_LABELS.selectFile(media.filename)}
            onChange={(event) =>
              onSelectionChange(media.id, event.currentTarget.checked)
            }
          />
        </label>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
        <p className="text-accent truncate text-sm font-semibold">
          {media.filename}
        </p>
        <p className="text-foreground/55 text-xs">
          {isPicture && media.metadata
            ? `${media.metadata.width} × ${media.metadata.height} · `
            : `${media.extension.toUpperCase()} · `}
          {formatFileSize(media.size)}
        </p>
      </div>
    </article>
  )
}

function formatFileSize(sizeInKb: number) {
  return sizeInKb >= 1024
    ? `${(sizeInKb / 1024).toFixed(1)} MB`
    : `${sizeInKb} KB`
}

export { MediaCard }
