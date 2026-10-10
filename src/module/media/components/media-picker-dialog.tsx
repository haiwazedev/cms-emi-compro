import {
  getMediaAssetUrl,
  getMediaTypeFromFilename,
  uploadMedia,
} from '@/module/media/api/media.api'
import type { Media } from '@/module/media/api/media.api'
import {
  MEDIA_LABELS,
  MEDIA_PICKER_LABELS,
  MEDIA_PICTURE_MAX_SIZE,
} from '@/module/media/constants/media.constants'
import {
  mediaQueryKeys,
  mediaQueryOptions,
} from '@/module/media/queries/media.queries'
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
import { toast } from '@/shared/lib/toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckIcon,
  LoaderCircleIcon,
  SearchIcon,
  UploadIcon,
} from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useMemo, useRef, useState } from 'react'
import { cn } from '@/shared/lib/utils'

interface MediaPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedMediaId?: number
  onSelect: (media: Media) => void
}

const pictureMediaParams = {
  type: 'PICTURE',
  sort_by: 'created_at',
  sort_order: 'desc',
} as const

function MediaPickerDialog({
  open,
  onOpenChange,
  selectedMediaId,
  onSelect,
}: MediaPickerDialogProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [pendingMediaId, setPendingMediaId] = useState(selectedMediaId)
  const mediaQuery = useQuery({
    ...mediaQueryOptions(pictureMediaParams),
    enabled: open,
  })
  const visibleMedia = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()

    return (mediaQuery.data ?? []).filter((media) =>
      media.filename.toLocaleLowerCase().includes(normalizedSearch),
    )
  }, [mediaQuery.data, search])
  const pendingMedia = mediaQuery.data?.find(
    (media) => media.id === pendingMediaId,
  )

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadMedia(file, 'PICTURE'),
    onSuccess: async (media) => {
      setSearch('')
      setPendingMediaId(media.id)
      await queryClient.invalidateQueries({ queryKey: mediaQueryKeys.all })
      toast.add({
        title: 'Berhasil',
        description: MEDIA_LABELS.uploadSuccess,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error ? error.message : MEDIA_LABELS.uploadFailed,
        type: 'error',
      })
    },
  })

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''

    if (!file) return

    if (getMediaTypeFromFilename(file.name) !== 'PICTURE') {
      toast.add({
        title: 'Gagal',
        description: MEDIA_PICKER_LABELS.unsupportedFile,
        type: 'error',
      })
      return
    }

    if (file.size > MEDIA_PICTURE_MAX_SIZE) {
      toast.add({
        title: 'Gagal',
        description: MEDIA_LABELS.fileTooLarge('PICTURE'),
        type: 'error',
      })
      return
    }

    uploadMutation.mutate(file)
  }

  function useSelectedMedia() {
    if (!pendingMedia) return

    onSelect(pendingMedia)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl"
        closeLabel={MEDIA_PICKER_LABELS.close}
      >
        <DialogHeader className="border-border/15 border-b">
          <DialogTitle>{MEDIA_PICKER_LABELS.title}</DialogTitle>
          <DialogDescription>
            {MEDIA_PICKER_LABELS.description}
          </DialogDescription>
        </DialogHeader>

        <div className="border-border/15 flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">{MEDIA_PICKER_LABELS.searchLabel}</span>
            <SearchIcon
              aria-hidden="true"
              className="text-foreground/45 absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <Input
              type="search"
              aria-label={MEDIA_PICKER_LABELS.searchLabel}
              placeholder={MEDIA_PICKER_LABELS.searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              className="pl-9"
            />
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
            className="hidden"
            aria-label={MEDIA_PICKER_LABELS.upload}
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadMutation.isPending ? (
              <LoaderCircleIcon
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : (
              <UploadIcon aria-hidden="true" className="size-4" />
            )}
            {uploadMutation.isPending
              ? MEDIA_PICKER_LABELS.uploading
              : MEDIA_PICKER_LABELS.upload}
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {mediaQuery.isPending ? (
            <p
              role="status"
              className="text-foreground/55 p-8 text-center text-sm"
            >
              {MEDIA_LABELS.loading}
            </p>
          ) : mediaQuery.isError ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <p role="alert" className="text-danger text-sm">
                {MEDIA_LABELS.loadFailed}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void mediaQuery.refetch()}
              >
                {MEDIA_LABELS.retry}
              </Button>
            </div>
          ) : mediaQuery.data?.length === 0 ? (
            <p
              role="status"
              className="text-foreground/55 p-8 text-center text-sm"
            >
              {MEDIA_PICKER_LABELS.noPictures}
            </p>
          ) : visibleMedia.length === 0 ? (
            <p
              role="status"
              className="text-foreground/55 p-8 text-center text-sm"
            >
              {MEDIA_PICKER_LABELS.noSearchResults}
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {visibleMedia.map((media) => (
                <MediaPickerCard
                  key={media.id}
                  media={media}
                  selected={media.id === pendingMediaId}
                  onSelect={() => setPendingMediaId(media.id)}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="lg:items-center lg:justify-between">
          <span className="text-foreground/55 text-sm">
            {MEDIA_PICKER_LABELS.selectedCount(pendingMediaId == null ? 0 : 1)}
          </span>
          <div className="flex flex-col-reverse gap-2 lg:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {MEDIA_PICKER_LABELS.cancel}
            </Button>
            <Button
              type="button"
              disabled={!pendingMedia || uploadMutation.isPending}
              onClick={useSelectedMedia}
            >
              {MEDIA_PICKER_LABELS.useFile}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MediaPickerCard({
  media,
  selected,
  onSelect,
}: {
  media: Media
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-label={MEDIA_LABELS.selectFile(media.filename)}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'border-border/15 bg-background hover:border-accent focus-visible:ring-accent/50 flex min-w-0 flex-1 basis-40 flex-col overflow-hidden rounded-xl border text-left transition-colors focus-visible:ring-2 focus-visible:outline-none',
        selected && 'border-accent ring-accent/20 ring-2',
      )}
    >
      <span className="bg-primary relative flex aspect-video w-full items-center justify-center overflow-hidden">
        <img
          src={getMediaAssetUrl(media.path)}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
        <span
          className={cn(
            'border-background bg-background/90 absolute top-2 right-2 flex size-6 items-center justify-center rounded-full border',
            selected && 'bg-accent text-white',
          )}
        >
          {selected ? (
            <CheckIcon aria-hidden="true" className="size-4" />
          ) : null}
        </span>
      </span>
      <span className="flex w-full min-w-0 flex-col gap-1 p-3">
        <span className="text-accent truncate text-sm font-semibold">
          {media.filename}
        </span>
        <span className="text-foreground/55 text-xs">
          {media.metadata
            ? `${media.metadata.width} × ${media.metadata.height} · `
            : ''}
          {formatFileSize(media.size)}
        </span>
      </span>
    </button>
  )
}

function formatFileSize(sizeInKb: number) {
  return sizeInKb >= 1024
    ? `${(sizeInKb / 1024).toFixed(1)} MB`
    : `${sizeInKb} KB`
}

export { MediaPickerDialog }
