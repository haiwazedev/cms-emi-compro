import type {
  Division,
  Service,
  ServiceWriteFields,
} from '@/module/division/api/division.api'
import { serviceQueryOptions } from '@/module/division/queries/division.queries'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { MediaPickerDialog } from '@/module/media/components/media-picker-dialog'
import type { Media } from '@/module/media/api/media.api'
import { getMediaAssetUrl } from '@/module/media/api/media.api'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { useQuery } from '@tanstack/react-query'
import { DragDropProvider } from '@dnd-kit/react'
import type { DragEndEvent } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'
import {
  GripVerticalIcon,
  ImagePlusIcon,
  LoaderCircleIcon,
  Trash2Icon,
} from 'lucide-react'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'

interface ServiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  divisions: Division[]
  selectedDivisionId?: number
  service?: Service
  languageId: string
  pending: boolean
  onSubmit: (fields: ServiceWriteFields) => void
}

function ServiceFormDialog(props: ServiceFormDialogProps) {
  const { t } = useI18n()
  const detailQuery = useQuery({
    ...serviceQueryOptions(props.service?.id ?? 0),
    enabled: props.service !== undefined,
  })

  if (props.service && detailQuery.isPending) {
    return (
      <ServiceDialogMessage
        {...props}
        message={t.division.serviceDetailsLoading}
      />
    )
  }

  if (props.service && detailQuery.isError) {
    return (
      <ServiceDialogMessage
        {...props}
        message={detailQuery.error.message || t.division.serviceDetailsFailed}
        onRetry={() => void detailQuery.refetch()}
      />
    )
  }

  return (
    <ServiceFormFields
      {...props}
      service={props.service ? detailQuery.data : undefined}
    />
  )
}

function ServiceDialogMessage({
  open,
  onOpenChange,
  service,
  message,
  onRetry,
}: ServiceFormDialogProps & { message: string; onRetry?: () => void }) {
  const { t } = useI18n()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border border-b">
          <DialogTitle>
            {service ? t.division.editService : t.division.createService}
          </DialogTitle>
          <DialogDescription>{t.division.description}</DialogDescription>
        </DialogHeader>
        <p
          role={onRetry ? 'alert' : 'status'}
          className="text-foreground/55 p-5 text-sm"
        >
          {message}
        </p>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t.common.cancel}
          </Button>
          {onRetry && (
            <Button type="button" variant="outline" onClick={onRetry}>
              {t.common.retry}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ServiceFormFields({
  open,
  onOpenChange,
  divisions,
  selectedDivisionId,
  service,
  languageId,
  pending,
  onSubmit,
}: ServiceFormDialogProps) {
  const { t } = useI18n()
  const content = service?.contents.find(
    (item) => item.language_id === languageId,
  )
  const [name, setName] = useState(content?.name ?? '')
  const [description, setDescription] = useState(content?.description ?? '')
  const [divisionId, setDivisionId] = useState<number | undefined>(
    service?.division_id ?? selectedDivisionId ?? divisions[0]?.id,
  )
  const [media, setMedia] = useState<Media[]>(service?.media ?? [])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [formError, setFormError] = useState<string>()
  const mediaIds = useMemo(() => media.map((item) => item.id), [media])
  const isEditing = service !== undefined

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(undefined)

    if (!name.trim()) {
      setFormError(t.division.requiredName)
      return
    }

    if (divisionId === undefined) {
      setFormError(t.division.requiredDivision)
      return
    }

    onSubmit({
      language_id: languageId,
      division_id: divisionId,
      name: name.trim(),
      description: description.trim() || null,
      media_ids: mediaIds,
    })
  }

  function handleGalleryDragEnd(event: DragEndEvent) {
    if (event.canceled) return

    const { source, target } = event.operation
    if (!source || !target || !isSortable(source) || !isSortable(target)) return
    if (source.initialGroup !== target.group) return
    if (source.initialIndex === target.index) return

    setMedia((current) => moveItems(current, source.initialIndex, target.index))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="border-border border-b">
            <DialogTitle>
              {isEditing ? t.division.editService : t.division.createService}
            </DialogTitle>
            <DialogDescription>{t.division.description}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
            <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="service-name">{t.division.serviceName}</Label>
                <Input
                  id="service-name"
                  autoFocus
                  required
                  maxLength={200}
                  disabled={pending}
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="service-description">
                  {t.division.serviceDescription}
                </Label>
                <Textarea
                  id="service-description"
                  disabled={pending}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.currentTarget.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="service-division">{t.division.division}</Label>
                <Select
                  value={divisionId === undefined ? '' : String(divisionId)}
                  onValueChange={(value) => setDivisionId(Number(value))}
                  disabled={pending}
                >
                  <SelectTrigger id="service-division">
                    <SelectValue placeholder={t.division.selectDivision} />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((division) => {
                      const divisionContent = division.contents.find(
                        (item) => item.language_id === languageId,
                      )
                      const label = divisionContent
                        ? `${divisionContent.abbr} — ${divisionContent.name}`
                        : `${t.division.missingTranslation} (#${division.id})`

                      return (
                        <SelectItem
                          key={division.id}
                          value={String(division.id)}
                        >
                          {label}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <Label>{t.division.serviceImages}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => setPickerOpen(true)}
                  >
                    <ImagePlusIcon aria-hidden="true" className="size-4" />
                    {t.division.addServiceImages}
                  </Button>
                </div>

                {media.length === 0 ? (
                  <p className="text-foreground/55 rounded-md border border-dashed p-5 text-center text-sm">
                    {t.division.noServiceImages}
                  </p>
                ) : (
                  <DragDropProvider onDragEnd={handleGalleryDragEnd}>
                    <div className="flex flex-wrap gap-3">
                      {media.map((item, index) => (
                        <SortableServiceImage
                          key={item.id}
                          media={item}
                          index={index}
                          disabled={pending}
                          onRemove={() =>
                            setMedia((current) =>
                              current.filter(
                                (currentItem) => currentItem.id !== item.id,
                              ),
                            )
                          }
                        />
                      ))}
                    </div>
                  </DragDropProvider>
                )}
                <p className="text-foreground/55 text-xs">
                  {t.division.dragHint}
                </p>
              </div>

              {formError && (
                <p role="alert" className="text-danger text-sm">
                  {formError}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => onOpenChange(false)}
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                disabled={pending || divisions.length === 0}
              >
                {pending ? (
                  <>
                    <LoaderCircleIcon
                      aria-hidden="true"
                      className="size-4 animate-spin"
                    />
                    {t.division.saving}
                  </>
                ) : (
                  t.common.save
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {pickerOpen && (
        <MediaPickerDialog
          open
          onOpenChange={setPickerOpen}
          selectionMode="multiple"
          selectedMediaIds={mediaIds}
          onSelectMultiple={setMedia}
        />
      )}
    </>
  )
}

function SortableServiceImage({
  media,
  index,
  disabled,
  onRemove,
}: {
  media: Media
  index: number
  disabled: boolean
  onRemove: () => void
}) {
  const { t } = useI18n()
  const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
    id: `service-media:${media.id}`,
    index,
    group: 'service-gallery',
  })

  return (
    <article
      ref={sortableRef}
      className="bg-background relative flex w-36 flex-col overflow-hidden rounded-md border"
    >
      <img
        src={getMediaAssetUrl(media.path)}
        alt={media.filename}
        className="bg-primary aspect-video w-full object-cover"
      />
      <button
        ref={dragHandleRef}
        type="button"
        aria-label={t.division.dragServiceImage(index + 1)}
        disabled={disabled}
        className="bg-background/90 text-secondary absolute top-2 left-2 cursor-grab touch-none rounded p-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GripVerticalIcon aria-hidden="true" className="size-4" />
      </button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="bg-background/90 absolute top-2 right-2 size-7"
        disabled={disabled}
        aria-label={t.division.removeServiceImage(media.filename)}
        onClick={onRemove}
      >
        <Trash2Icon aria-hidden="true" className="size-3.5" />
      </Button>
      <span className="text-foreground/70 truncate p-2 text-xs">
        {media.filename}
      </span>
    </article>
  )
}

function moveItems<T>(items: T[], fromIndex: number, toIndex: number) {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items
  }

  const reordered = [...items]
  const [movedItem] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, movedItem)
  return reordered
}

export { ServiceFormDialog }
