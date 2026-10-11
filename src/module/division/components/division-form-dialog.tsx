import type {
  Division,
  DivisionStatus,
  DivisionWriteFields,
} from '@/module/division/api/division.api'
import { DIVISION_LABELS } from '@/module/division/constants/division.constants'
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
import { LoaderCircleIcon, UploadIcon } from 'lucide-react'
import type { ChangeEvent, FormEvent } from 'react'
import { useRef, useState } from 'react'

interface DivisionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  division?: Division
  pending: boolean
  onSubmit: (fields: DivisionWriteFields) => void
}

function DivisionFormDialog({
  open,
  onOpenChange,
  division,
  pending,
  onSubmit,
}: DivisionFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(division?.name ?? '')
  const [abbreviation, setAbbreviation] = useState(division?.abbr ?? '')
  const [status, setStatus] = useState<DivisionStatus>(
    division?.status ?? 'DRAFT',
  )
  const [iconSvg, setIconSvg] = useState<string | null>(
    division?.icon_svg ?? null,
  )
  const [formError, setFormError] = useState<string>()
  const [iconError, setIconError] = useState<string>()
  const isEditing = division !== undefined

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''

    if (!file) return
    setIconError(undefined)

    if (!file.name.toLocaleLowerCase().endsWith('.svg')) {
      setIconError(DIVISION_LABELS.svgOnly)
      return
    }

    try {
      const content = await file.text()
      const document = new DOMParser().parseFromString(content, 'image/svg+xml')
      const isValidSvg =
        document.getElementsByTagName('parsererror').length === 0 &&
        document.documentElement.localName === 'svg'

      if (!isValidSvg) {
        setIconError(DIVISION_LABELS.invalidSvg)
        return
      }

      setIconSvg(content)
    } catch {
      setIconError(DIVISION_LABELS.invalidSvg)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(undefined)

    if (iconError) return

    if (!name.trim()) {
      setFormError(DIVISION_LABELS.requiredName)
      return
    }

    if (!abbreviation.trim()) {
      setFormError(DIVISION_LABELS.requiredAbbreviation)
      return
    }

    onSubmit({
      name: name.trim(),
      abbr: abbreviation.trim(),
      icon_svg: iconSvg,
      status,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border/15 border-b">
          <DialogTitle>
            {isEditing
              ? DIVISION_LABELS.editDivision
              : DIVISION_LABELS.createDivision}
          </DialogTitle>
          <DialogDescription>{DIVISION_LABELS.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="division-name">
                {DIVISION_LABELS.divisionName}
              </Label>
              <Input
                id="division-name"
                autoFocus
                required
                maxLength={200}
                disabled={pending}
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="division-abbreviation">
                {DIVISION_LABELS.abbreviation}
              </Label>
              <Input
                id="division-abbreviation"
                required
                maxLength={50}
                disabled={pending}
                value={abbreviation}
                onChange={(event) => setAbbreviation(event.currentTarget.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="division-status">{DIVISION_LABELS.status}</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as DivisionStatus)}
                disabled={pending}
              >
                <SelectTrigger id="division-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">{DIVISION_LABELS.draft}</SelectItem>
                  <SelectItem value="PUBLISHED">
                    {DIVISION_LABELS.published}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{DIVISION_LABELS.icon}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                aria-label={DIVISION_LABELS.selectIcon}
                onChange={(event) => void handleFileChange(event)}
              />
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-accent flex size-14 items-center justify-center overflow-hidden rounded-md p-2">
                  {iconSvg ? (
                    <img
                      src={`data:image/svg+xml,${encodeURIComponent(iconSvg)}`}
                      alt=""
                      className="size-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-white/70">SVG</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon aria-hidden="true" className="size-4" />
                  {iconSvg
                    ? DIVISION_LABELS.changeIcon
                    : DIVISION_LABELS.selectIcon}
                </Button>
                {iconSvg && (
                  <Button
                    type="button"
                    variant="link"
                    disabled={pending}
                    onClick={() => setIconSvg(null)}
                  >
                    {DIVISION_LABELS.clearIcon}
                  </Button>
                )}
              </div>
              {iconError && (
                <p role="alert" className="text-danger text-sm">
                  {iconError}
                </p>
              )}
              <p className="text-foreground/55 text-xs">
                {DIVISION_LABELS.svgOnly}
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
              {DIVISION_LABELS.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <LoaderCircleIcon
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                  {DIVISION_LABELS.saving}
                </>
              ) : (
                DIVISION_LABELS.save
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { DivisionFormDialog }
