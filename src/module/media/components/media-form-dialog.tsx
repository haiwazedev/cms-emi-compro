import {
  getMediaAssetUrl,
  getMediaTypeFromFilename,
} from '@/module/media/api/media.api'
import type {
  Media,
  MediaType,
  MediaWriteFields,
} from '@/module/media/api/media.api'
import {
  MEDIA_ACCEPTED_EXTENSIONS,
  MEDIA_DOCUMENT_MAX_SIZE,
  MEDIA_PICTURE_EXTENSIONS,
  MEDIA_PICTURE_MAX_SIZE,
} from '@/module/media/constants/media.constants'
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
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { cn } from '@/shared/lib/utils'
import {
  ArrowDownToLineIcon,
  FileTextIcon,
  LoaderCircleIcon,
} from 'lucide-react'
import type { DragEvent, FormEvent } from 'react'
import { useEffect, useState } from 'react'

const MAX_TEXT_LENGTH = 255

export interface MediaFormSubmit extends MediaWriteFields {
  file?: File
  type?: MediaType
}

interface MediaFormDialogProps {
  media?: Media
  pictureOnly?: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (fields: MediaFormSubmit) => void
}

function MediaFormDialog({
  media,
  pictureOnly = false,
  pending,
  onOpenChange,
  onSubmit,
}: MediaFormDialogProps) {
  const { t } = useI18n()
  const [file, setFile] = useState<File>()
  const [type, setType] = useState(media?.type)
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [filename, setFilename] = useState(media?.filename ?? '')
  const [alt, setAlt] = useState(media?.alt ?? '')
  const [dragging, setDragging] = useState(false)
  const [formError, setFormError] = useState<string>()

  const pictureUrl =
    type === 'PICTURE'
      ? (previewUrl ?? (media && getMediaAssetUrl(media.path)))
      : undefined

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleFile(nextFile: File | undefined) {
    if (!nextFile) return

    const nextType = getMediaTypeFromFilename(nextFile.name)
    if (!nextType || (pictureOnly && nextType !== 'PICTURE')) {
      setFormError(
        pictureOnly ? t.mediaPicker.unsupportedFile : t.media.unsupportedFile,
      )
      return
    }

    const maxSize =
      nextType === 'PICTURE' ? MEDIA_PICTURE_MAX_SIZE : MEDIA_DOCUMENT_MAX_SIZE
    if (nextFile.size > maxSize) {
      setFormError(t.media.fileTooLarge(nextType))
      return
    }

    setFormError(undefined)
    setFile(nextFile)
    setType(nextType)
    setFilename(nextFile.name.slice(0, MAX_TEXT_LENGTH))
    setPreviewUrl(
      nextType === 'PICTURE' ? URL.createObjectURL(nextFile) : undefined,
    )
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    if (!pending) handleFile(event.dataTransfer.files[0])
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!media && !file) {
      setFormError(t.media.requiredFile)
      return
    }

    if (!filename.trim()) {
      setFormError(t.media.requiredFilename)
      return
    }

    onSubmit({
      file,
      type,
      filename: filename.trim(),
      alt: type === 'PICTURE' ? alt.trim() : '',
    })
  }

  const preview = pictureUrl ? (
    <div className="bg-primary flex h-28 w-52 items-center justify-center overflow-hidden rounded-md">
      <img
        src={pictureUrl}
        alt={alt}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  ) : type === 'DOCUMENT' ? (
    <FileTextIcon aria-hidden="true" className="text-foreground/35 size-8" />
  ) : (
    <ArrowDownToLineIcon aria-hidden="true" className="text-primary size-5" />
  )

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border border-b">
          <DialogTitle>
            {media ? t.media.editTitle : t.media.uploadTitle}
          </DialogTitle>
          <DialogDescription>{t.media.formDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor={media ? undefined : 'media-file'}>
                {t.media.file} <span className="text-danger">*</span>
              </Label>
              {media ? (
                <div className="border-border flex flex-col items-center gap-2 rounded-md border px-4 py-6">
                  {preview}
                </div>
              ) : (
                <label
                  htmlFor="media-file"
                  onDragOver={(event) => {
                    event.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={cn(
                    'border-border has-focus-visible:border-secondary flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center',
                    dragging && 'border-secondary bg-secondary/5',
                    pending && 'pointer-events-none opacity-50',
                  )}
                >
                  {preview}
                  <p className="text-foreground/70 text-sm">
                    {t.media.dropFile}{' '}
                    <span className="text-secondary font-medium">
                      {t.media.pickFromDevice}
                    </span>
                  </p>
                  <p className="text-foreground/55 text-xs">
                    {pictureOnly ? t.media.pictureFileHint : t.media.fileHint}
                  </p>
                  <input
                    id="media-file"
                    type="file"
                    accept={
                      pictureOnly
                        ? MEDIA_PICTURE_EXTENSIONS
                        : MEDIA_ACCEPTED_EXTENSIONS
                    }
                    disabled={pending}
                    className="sr-only"
                    onChange={(event) => {
                      handleFile(event.currentTarget.files?.[0])
                      event.currentTarget.value = ''
                    }}
                  />
                </label>
              )}
            </div>

            <MediaTextField
              id="media-filename"
              label={t.media.filename}
              required
              value={filename}
              disabled={pending}
              onChange={setFilename}
            />

            {type === 'PICTURE' && (
              <MediaTextField
                id="media-alt"
                label={t.media.alt}
                hint={t.media.altHint}
                value={alt}
                disabled={pending}
                onChange={setAlt}
              />
            )}

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
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <LoaderCircleIcon
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                  {t.media.saving}
                </>
              ) : (
                t.common.save
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function MediaTextField({
  id,
  label,
  hint,
  required = false,
  value,
  disabled,
  onChange,
}: {
  id: string
  label: string
  hint?: string
  required?: boolean
  value: string
  disabled: boolean
  onChange: (value: string) => void
}) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-danger">*</span>}
      </Label>
      <Input
        id={id}
        required={required}
        maxLength={MAX_TEXT_LENGTH}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      <p className="text-foreground/55 text-xs">
        {hint && `${hint} · `}
        {t.common.characterCount(value.length, MAX_TEXT_LENGTH)}
      </p>
    </div>
  )
}

export { MediaFormDialog }
