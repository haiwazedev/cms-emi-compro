import { useI18n } from '@/shared/lib/i18n/i18n-context'
import type { Client, ClientWriteFields } from '@/module/client/api/client.api'
import {
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
  const { t } = useI18n()
  const [name, setName] = useState(client?.name ?? '')
  const [logoFile, setLogoFile] = useState<File>()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [dragging, setDragging] = useState(false)
  const [formError, setFormError] = useState<string>()
  const [logoError, setLogoError] = useState<string>()

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
    setFormError(undefined)

    if (!CLIENT_LOGO_ACCEPT.split(',').includes(extension)) {
      setLogoError(t.client.unsupportedLogo)
      return
    }

    if (file.size > CLIENT_LOGO_MAX_SIZE) {
      setLogoError(t.client.logoTooLarge)
      return
    }

    setLogoError(undefined)
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
      setFormError(t.client.requiredName)
      return
    }

    setFormError(undefined)

    // A rejected file stays explained instead of turning into "required".
    if (logoError) return

    if (!logoUrl) {
      setFormError(t.client.requiredLogo)
      return
    }

    onSubmit({ name: name.trim(), logo: logoFile })
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border border-b">
          <DialogTitle>
            {client ? t.client.editTitle : t.client.createTitle}
          </DialogTitle>
          <DialogDescription>{t.client.formDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="client-name">
                {t.client.clientName} <span className="text-danger">*</span>
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
                {t.common.characterCount(name.length, 200)}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="client-logo">
                {t.client.logo} <span className="text-danger">*</span>
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
                  'border-border has-focus-visible:border-secondary flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center',
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
                  {t.client.dropLogo}{' '}
                  <span className="text-secondary font-medium">
                    {t.client.pickFromDevice}
                  </span>
                </p>
                <p className="text-foreground/55 text-xs">
                  {t.client.logoFileHint}
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
              <p className="text-foreground/55 text-xs">{t.client.logoHint}</p>
            </div>

            {(formError ?? logoError) && (
              <p role="alert" className="text-danger text-sm">
                {formError ?? logoError}
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
                  {t.client.saving}
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

export { ClientFormDialog }
