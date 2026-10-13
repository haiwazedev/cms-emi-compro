import type { Client, ClientWriteFields } from '@/module/client/api/client.api'
import {
  CLIENT_LABELS,
  CLIENT_LOGO_ACCEPT,
  CLIENT_LOGO_MAX_SIZE,
} from '@/module/client/constants/client.constants'
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
import { cn } from '@/shared/lib/utils'
import { ArrowDownToLineIcon, LoaderCircleIcon } from 'lucide-react'
import type { DragEvent, FormEvent } from 'react'
import { useEffect, useState } from 'react'

interface ClientFormDialogProps {
  client?: Client
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (fields: ClientWriteFields) => void
}

function ClientFormDialog({
  client,
  pending,
  onOpenChange,
  onSubmit,
}: ClientFormDialogProps) {
  const [name, setName] = useState(client?.name ?? '')
  const [logoFile, setLogoFile] = useState<File>()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [dragging, setDragging] = useState(false)
  const [formError, setFormError] = useState<string>()

  const logoUrl =
    previewUrl ?? (client && getMediaAssetUrl(client.logo_filepath))

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleFile(file: File | undefined) {
    if (!file) return

    const extension = '.' + file.name.split('.').at(-1)?.toLowerCase()
    if (!CLIENT_LOGO_ACCEPT.split(',').includes(extension)) {
      setFormError(CLIENT_LABELS.unsupportedLogo)
      return
    }

    if (file.size > CLIENT_LOGO_MAX_SIZE) {
      setFormError(CLIENT_LABELS.logoTooLarge)
      return
    }

    setFormError(undefined)
    setLogoFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    if (!pending) handleFile(event.dataTransfer.files[0])
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim()) {
      setFormError(CLIENT_LABELS.requiredName)
      return
    }

    if (!logoUrl) {
      setFormError(CLIENT_LABELS.requiredLogo)
      return
    }

    onSubmit({ name: name.trim(), logo: logoFile })
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border/15 border-b">
          <DialogTitle>
            {client ? CLIENT_LABELS.editTitle : CLIENT_LABELS.createTitle}
          </DialogTitle>
          <DialogDescription>{CLIENT_LABELS.formDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="client-name">
                {CLIENT_LABELS.clientName}{' '}
                <span className="text-danger">*</span>
              </Label>
              <Input
                id="client-name"
                autoFocus
                required
                maxLength={200}
                disabled={pending}
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
              />
              <p className="text-foreground/55 text-xs">
                {name.length + ' / 200 karakter'}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="client-logo">
                {CLIENT_LABELS.logo} <span className="text-danger">*</span>
              </Label>
              <label
                htmlFor="client-logo"
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  'border-border/40 has-focus-visible:border-secondary flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center',
                  dragging && 'border-secondary bg-secondary/5',
                  pending && 'pointer-events-none opacity-50',
                )}
              >
                {logoUrl ? (
                  <div className="bg-primary flex h-28 w-52 items-center justify-center overflow-hidden rounded-md p-4">
                    <img
                      src={logoUrl}
                      alt={logoFile?.name ?? client?.logo_filename ?? ''}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <ArrowDownToLineIcon
                    aria-hidden="true"
                    className="text-primary size-5"
                  />
                )}
                <p className="text-foreground/70 text-sm">
                  {CLIENT_LABELS.dropLogo}{' '}
                  <span className="text-secondary font-medium">
                    {CLIENT_LABELS.pickFromDevice}
                  </span>
                </p>
                <p className="text-foreground/55 text-xs">
                  {CLIENT_LABELS.logoFileHint}
                </p>
                <input
                  id="client-logo"
                  type="file"
                  accept={CLIENT_LOGO_ACCEPT}
                  disabled={pending}
                  className="sr-only"
                  onChange={(event) => {
                    handleFile(event.currentTarget.files?.[0])
                    event.currentTarget.value = ''
                  }}
                />
              </label>
              <p className="text-foreground/55 text-xs">
                {CLIENT_LABELS.logoHint}
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
              {CLIENT_LABELS.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <LoaderCircleIcon
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                  {CLIENT_LABELS.saving}
                </>
              ) : (
                CLIENT_LABELS.save
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { ClientFormDialog }
