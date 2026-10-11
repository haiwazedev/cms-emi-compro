import type {
  Division,
  Service,
  ServiceWriteFields,
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
import { LoaderCircleIcon } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'

interface ServiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  divisions: Division[]
  selectedDivisionId?: number
  service?: Service
  pending: boolean
  onSubmit: (fields: ServiceWriteFields) => void
}

function ServiceFormDialog({
  open,
  onOpenChange,
  divisions,
  selectedDivisionId,
  service,
  pending,
  onSubmit,
}: ServiceFormDialogProps) {
  const [name, setName] = useState(service?.name ?? '')
  const [divisionId, setDivisionId] = useState<number | undefined>(
    service?.division_id ?? selectedDivisionId ?? divisions[0]?.id,
  )
  const [formError, setFormError] = useState<string>()
  const isEditing = service !== undefined

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(undefined)

    if (!name.trim()) {
      setFormError(DIVISION_LABELS.requiredName)
      return
    }

    if (divisionId === undefined) {
      setFormError(DIVISION_LABELS.requiredDivision)
      return
    }

    onSubmit({ name: name.trim(), division_id: divisionId })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border/15 border-b">
          <DialogTitle>
            {isEditing
              ? DIVISION_LABELS.editService
              : DIVISION_LABELS.createService}
          </DialogTitle>
          <DialogDescription>{DIVISION_LABELS.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <div className="flex flex-col gap-4 px-5 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="service-name">
                {DIVISION_LABELS.serviceName}
              </Label>
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
              <Label htmlFor="service-division">
                {DIVISION_LABELS.division}
              </Label>
              <Select
                value={divisionId === undefined ? '' : String(divisionId)}
                onValueChange={(value) => setDivisionId(Number(value))}
                disabled={pending}
              >
                <SelectTrigger id="service-division">
                  <SelectValue placeholder={DIVISION_LABELS.selectDivision} />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((division) => (
                    <SelectItem key={division.id} value={String(division.id)}>
                      {division.abbr} — {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={pending || divisions.length === 0}>
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

export { ServiceFormDialog }
