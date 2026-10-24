import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { Trash2Icon } from 'lucide-react'
import { useState } from 'react'

const dangerButtonClassName =
  'border-danger/30 text-danger hover:bg-danger/5 hover:text-danger'

interface BulkDeleteButtonProps {
  count: number
  pending: boolean
  onConfirm: () => Promise<unknown>
}

function BulkDeleteButton({
  count,
  pending,
  onConfirm,
}: BulkDeleteButtonProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  if (count === 0) return null

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={dangerButtonClassName}
        onClick={() => setOpen(true)}
      >
        <Trash2Icon aria-hidden="true" className="size-4" />
        {t.common.deleteSelected(count)}
      </Button>

      <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="border-border border-b">
            <DialogTitle>{t.common.bulkDeleteTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-5 px-5 py-6">
            <span className="bg-danger/10 text-danger flex size-14 items-center justify-center rounded-full">
              <Trash2Icon aria-hidden="true" className="size-5" />
            </span>
            <DialogDescription>
              {t.common.bulkDeleteDescription(count)}
            </DialogDescription>
          </div>
          <DialogFooter className="bg-primary">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              variant="outline"
              className={dangerButtonClassName}
              disabled={pending}
              onClick={() =>
                // Failures are reported by the caller; keep the dialog open to retry.
                onConfirm().then(
                  () => setOpen(false),
                  () => undefined,
                )
              }
            >
              {pending ? t.common.deleting : t.common.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { BulkDeleteButton }
