import type { Media } from '@/module/media/api/media.api'
import {
  getMediaAssetUrl,
  hasMediaDimensions,
} from '@/module/media/api/media.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { toast } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import { FileTextIcon, LinkIcon, PencilIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

interface MediaCardProps {
  media: Media
  view: 'grid' | 'list'
  selected: boolean
  onSelectionChange: (mediaId: number, selected: boolean) => void
  onEdit?: (media: Media) => void
}

function MediaCard({
  media,
  view,
  selected,
  onSelectionChange,
  onEdit,
}: MediaCardProps) {
  const { t } = useI18n()
  const isPicture = media.type === 'PICTURE'

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(getMediaAssetUrl(media.path))
      toast.add({
        title: t.common.success,
        description: t.media.copyUrlSuccess,
        type: 'success',
      })
    } catch {
      toast.add({
        title: t.common.error,
        description: t.media.copyUrlFailed,
        type: 'error',
      })
    }
  }

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
            alt={media.alt ?? ''}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <FileTextIcon
            aria-hidden="true"
            className="text-foreground/35 size-8"
          />
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {onEdit && (
            <MediaCardAction
              aria-label={t.media.editFile(media.filename)}
              title={t.common.edit}
              onClick={() => onEdit(media)}
            >
              <PencilIcon aria-hidden="true" className="size-3.5" />
            </MediaCardAction>
          )}
          <MediaCardAction
            aria-label={t.media.copyUrl(media.filename)}
            title={t.media.copyUrl(media.filename)}
            onClick={() => void copyUrl()}
          >
            <LinkIcon aria-hidden="true" className="size-3.5" />
          </MediaCardAction>
        </div>
        <label className="absolute top-2 right-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-transparent">
          <Checkbox
            checked={selected}
            aria-label={t.media.selectFile(media.filename)}
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
          {isPicture && hasMediaDimensions(media.metadata)
            ? `${media.metadata.width} × ${media.metadata.height} · `
            : `${media.extension.toUpperCase()} · `}
          {formatFileSize(media.size)}
        </p>
      </div>
    </article>
  )
}

function MediaCardAction(props: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="bg-background/90 size-7 rounded-full"
      {...props}
    />
  )
}

function formatFileSize(sizeInKb: number) {
  return sizeInKb >= 1024
    ? `${(sizeInKb / 1024).toFixed(1)} MB`
    : `${sizeInKb} KB`
}

export { MediaCard }
