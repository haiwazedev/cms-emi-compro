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
import { Trash2Icon } from 'lucide-react'

interface ConfirmDeleteDialogProps {
  open: boolean
  title: string
  itemName?: string
  description?: string
  closeLabel: string
  pending: boolean
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmDeleteDialog({
  open,
  title,
  itemName,
  description,
  closeLabel,
  pending,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const { t } = useI18n()
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel()
      }}
    >
      <DialogContent className="max-w-xl" closeLabel={closeLabel}>
        <DialogHeader className="border-border border-b">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5 px-5 py-6">
          <span className="bg-danger/10 text-danger flex size-14 items-center justify-center rounded-full">
            <Trash2Icon aria-hidden="true" className="size-5" />
          </span>
          {itemName && (
            <div className="flex flex-col gap-2">
              <p className="text-accent font-semibold break-words">
                “{itemName}”
              </p>
              <DialogDescription>{description}</DialogDescription>
            </div>
          )}
        </div>
        <DialogFooter className="bg-primary">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={onCancel}
          >
            {t.common.cancel}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-danger/30 text-danger hover:bg-danger/5 hover:text-danger"
            disabled={!itemName || pending}
            onClick={onConfirm}
          >
            {pending ? t.user.deleting : t.common.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ConfirmDeleteDialog }
