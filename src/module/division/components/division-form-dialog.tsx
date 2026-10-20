import { PERMISSION_HINTS } from '@/module/auth/constants/permission.constants'
import { usePermissions } from '@/module/auth/hooks/use-permissions'
import type {
  Division,
  DivisionStatus,
  DivisionWriteFields,
} from '@/module/division/api/division.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
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
import { LoaderCircleIcon, UploadIcon } from 'lucide-react'
import type { ChangeEvent, FormEvent } from 'react'
import { useRef, useState } from 'react'

interface DivisionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  division?: Division
  languageId: string
  pending: boolean
  onSubmit: (fields: DivisionWriteFields) => void
}

function DivisionFormDialog({
  open,
  onOpenChange,
  division,
  languageId,
  pending,
  onSubmit,
}: DivisionFormDialogProps) {
  const { t } = useI18n()
  const { canPublish } = usePermissions()
  const content = division?.contents.find(
    (item) => item.language_id === languageId,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(content?.name ?? '')
  const [abbreviation, setAbbreviation] = useState(content?.abbr ?? '')
  const [description, setDescription] = useState(content?.description ?? '')
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
      setIconError(t.division.svgOnly)
      return
    }

    try {
      const content = await file.text()
      const document = new DOMParser().parseFromString(content, 'image/svg+xml')
      const isValidSvg =
        document.getElementsByTagName('parsererror').length === 0 &&
        document.documentElement.localName === 'svg'

      if (!isValidSvg) {
        setIconError(t.division.invalidSvg)
        return
      }

      setIconSvg(content)
    } catch {
      setIconError(t.division.invalidSvg)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(undefined)

    if (iconError) return

    if (!name.trim()) {
      setFormError(t.division.requiredName)
      return
    }

    if (!abbreviation.trim()) {
      setFormError(t.division.requiredAbbreviation)
      return
    }

    onSubmit({
      language_id: languageId,
      name: name.trim(),
      abbr: abbreviation.trim(),
      description: description.trim() || null,
      icon_svg: iconSvg,
      status,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border border-b">
          <DialogTitle>
            {isEditing ? t.division.editDivision : t.division.createDivision}
          </DialogTitle>
          <DialogDescription>{t.division.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="division-name">{t.division.divisionName}</Label>
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
                {t.division.abbreviation}
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
              <Label htmlFor="division-description">
                {t.division.divisionDescription}
              </Label>
              <Textarea
                id="division-description"
                disabled={pending}
                value={description}
                onChange={(event) => setDescription(event.currentTarget.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="division-status">{t.division.status}</Label>
              <Select
                value={canPublish ? status : 'DRAFT'}
                onValueChange={(value) => setStatus(value as DivisionStatus)}
                disabled={pending || !canPublish}
              >
                <SelectTrigger id="division-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">{t.division.draft}</SelectItem>
                  <SelectItem value="PUBLISHED">
                    {t.division.published}
                  </SelectItem>
                </SelectContent>
              </Select>
              {!canPublish && (
                <p className="text-foreground/60 text-xs">
                  {PERMISSION_HINTS.draftOnly}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t.division.icon}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                aria-label={t.division.selectIcon}
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
                  {iconSvg ? t.division.changeIcon : t.division.selectIcon}
                </Button>
                {iconSvg && (
                  <Button
                    type="button"
                    variant="link"
                    disabled={pending}
                    onClick={() => setIconSvg(null)}
                  >
                    {t.division.clearIcon}
                  </Button>
                )}
              </div>
              {iconError && (
                <p role="alert" className="text-danger text-sm">
                  {iconError}
                </p>
              )}
              <p className="text-foreground/55 text-xs">{t.division.svgOnly}</p>
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
            <Button type="submit" disabled={pending}>
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
  )
}

export { DivisionFormDialog }
