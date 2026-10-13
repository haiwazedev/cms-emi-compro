import type { Client, ClientWriteFields } from '@/module/client/api/client.api'
import { CLIENT_LABELS } from '@/module/client/constants/client.constants'
import { getMediaAssetUrl } from '@/module/media/api/media.api'
import { MediaPickerDialog } from '@/module/media/components/media-picker-dialog'
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
import { ImageIcon, LoaderCircleIcon } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'

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
  const [logo, setLogo] = useState(client?.media ?? undefined)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [formError, setFormError] = useState<string>()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim()) {
      setFormError(CLIENT_LABELS.requiredName)
      return
    }

    onSubmit({ name: name.trim(), media_id: logo?.id ?? null })
  }

  return (
    <>
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="border-border/15 border-b">
            <DialogTitle>
              {client ? CLIENT_LABELS.editTitle : CLIENT_LABELS.createTitle}
            </DialogTitle>
            <DialogDescription>
              {CLIENT_LABELS.formDescription}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
            <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="client-name">{CLIENT_LABELS.clientName}</Label>
                <Input
                  id="client-name"
                  autoFocus
                  required
                  maxLength={200}
                  disabled={pending}
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>{CLIENT_LABELS.logo}</Label>
                <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center">
                  <div className="bg-primary flex h-28 w-full items-center justify-center overflow-hidden rounded-md p-4 lg:w-52">
                    {logo ? (
                      <img
                        src={getMediaAssetUrl(logo.path)}
                        alt={logo.filename}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-foreground/50 flex flex-col items-center gap-1 text-xs">
                        <ImageIcon aria-hidden="true" className="size-5" />
                        <span>{CLIENT_LABELS.noLogo}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={pending}
                      onClick={() => setPickerOpen(true)}
                    >
                      {logo
                        ? CLIENT_LABELS.changeLogo
                        : CLIENT_LABELS.chooseLogo}
                    </Button>
                    {logo && (
                      <Button
                        type="button"
                        variant="link"
                        disabled={pending}
                        onClick={() => setLogo(undefined)}
                      >
                        {CLIENT_LABELS.clearLogo}
                      </Button>
                    )}
                  </div>
                </div>
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

      {pickerOpen && (
        <MediaPickerDialog
          open
          onOpenChange={setPickerOpen}
          selectedMediaId={logo?.id}
          onSelect={setLogo}
        />
      )}
    </>
  )
}

export { ClientFormDialog }
