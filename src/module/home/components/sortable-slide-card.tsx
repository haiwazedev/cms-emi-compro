import { getMediaAssetUrl } from '@/module/media/api/media.api'
import type { Media } from '@/module/media/api/media.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import type { HomeSlideDraft } from '@/module/home/types/home.types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSortable } from '@dnd-kit/react/sortable'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GripVerticalIcon,
  ImageIcon,
  Trash2Icon,
} from 'lucide-react'
import { useState } from 'react'

interface SortableSlideCardProps {
  slide: HomeSlideDraft
  index: number
  total: number
  media?: Media
  mediaLoading: boolean
  mediaFailed: boolean
  canDelete: boolean
  onChange: (
    clientKey: string,
    field: 'title1' | 'title2' | 'subtitle',
    value: string,
  ) => void
  onMove: (fromIndex: number, toIndex: number) => void
  onDelete: (clientKey: string) => void
  onChoosePhoto: (clientKey: string) => void
}

function SortableSlideCard({
  slide,
  index,
  total,
  media,
  mediaLoading,
  mediaFailed,
  canDelete,
  onChange,
  onMove,
  onDelete,
  onChoosePhoto,
}: SortableSlideCardProps) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(index === 0)
  const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
    id: slide.clientKey,
    index,
    group: 'home-carousel',
    type: 'home-carousel',
    accept: 'home-carousel',
  })
  const slideNumber = index + 1

  return (
    <article
      ref={sortableRef}
      className="border-border bg-background overflow-hidden rounded-lg border"
    >
      <div className="flex min-h-14 items-center gap-3 px-3 py-2">
        <button
          ref={dragHandleRef}
          type="button"
          aria-label={`Geser slide ${slideNumber}`}
          className="text-secondary cursor-grab touch-none rounded p-1 active:cursor-grabbing"
        >
          <GripVerticalIcon aria-hidden="true" className="size-4" />
        </button>

        <span className="bg-primary text-accent flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold">
          {slideNumber}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-accent truncate text-sm font-medium">
            {slide.title1 || slide.title2 ? (
              <>
                {slide.title1} <em>{slide.title2}</em>
              </>
            ) : (
              t.home.slide(slideNumber)
            )}
          </p>
          <p className="text-muted truncate text-xs">
            {slide.subtitle || media?.filename || '—'}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={t.home.moveSlideUp(slideNumber)}
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
          >
            <ArrowUpIcon aria-hidden="true" className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={t.home.moveSlideDown(slideNumber)}
            disabled={index === total - 1}
            onClick={() => onMove(index, index + 1)}
          >
            <ArrowDownIcon aria-hidden="true" className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={t.home.deleteSlide(slideNumber)}
            title={canDelete ? undefined : t.home.keepOneSlide}
            disabled={!canDelete}
            onClick={() => onDelete(slide.clientKey)}
          >
            <Trash2Icon aria-hidden="true" className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={
              expanded
                ? t.home.collapseSlide(slideNumber)
                : t.home.expandSlide(slideNumber)
            }
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? (
              <ChevronUpIcon aria-hidden="true" className="size-4" />
            ) : (
              <ChevronDownIcon aria-hidden="true" className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-border flex flex-col gap-4 border-t p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <TextField
              id={`${slide.clientKey}-title-1`}
              label={t.home.slideTitle1}
              value={slide.title1}
              onChange={(value) => onChange(slide.clientKey, 'title1', value)}
            />
            <TextField
              id={`${slide.clientKey}-title-2`}
              label={t.home.slideTitle2}
              value={slide.title2}
              onChange={(value) => onChange(slide.clientKey, 'title2', value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${slide.clientKey}-subtitle`}>
              {t.home.slideSubtitle}
            </Label>
            <Textarea
              id={`${slide.clientKey}-subtitle`}
              value={slide.subtitle}
              onChange={(event) =>
                onChange(slide.clientKey, 'subtitle', event.currentTarget.value)
              }
              className="min-h-20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              {t.home.backgroundPhoto}
              <span aria-hidden="true" className="text-danger">
                *
              </span>
            </Label>
            <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center">
              <div className="bg-primary flex h-24 w-full items-center justify-center overflow-hidden rounded-md lg:w-40">
                {media ? (
                  <img
                    src={getMediaAssetUrl(media.path)}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : mediaLoading ? (
                  <span role="status" className="text-foreground/55 text-xs">
                    {t.home.loading}
                  </span>
                ) : (
                  <div className="text-foreground/50 flex flex-col items-center gap-1 text-xs">
                    <ImageIcon aria-hidden="true" className="size-5" />
                    <span>
                      {mediaFailed ? t.home.photoUnavailable : t.home.noPhoto}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onChoosePhoto(slide.clientKey)}
                >
                  {media ? t.home.changePhoto : t.home.choosePhoto}
                </Button>
                {media && (
                  <p className="text-muted text-xs">
                    {media.filename}
                    {media.metadata
                      ? ` · ${media.metadata.width}×${media.metadata.height}`
                      : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

function TextField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </div>
  )
}

export { SortableSlideCard }
