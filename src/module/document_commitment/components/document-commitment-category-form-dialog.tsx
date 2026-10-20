import type { DocumentCommitmentCategory } from '@/module/document_commitment/api/document-commitment.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import type { DocumentCommitmentCategoryFormValues } from '@/module/document_commitment/schemas/document-commitment-form.schema'
import { createDocumentCommitmentCategoryFormSchema } from '@/module/document_commitment/schemas/document-commitment-form.schema'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircleIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

interface DocumentCommitmentCategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: DocumentCommitmentCategory
  pending: boolean
  onSubmit: (name: string) => void
}

function DocumentCommitmentCategoryFormDialog({
  open,
  onOpenChange,
  category,
  pending,
  onSubmit,
}: DocumentCommitmentCategoryFormDialogProps) {
  const { t } = useI18n()
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<DocumentCommitmentCategoryFormValues>({
    resolver: zodResolver(createDocumentCommitmentCategoryFormSchema(t)),
    defaultValues: { name: category?.name ?? '' },
  })
  const nameValue = useWatch({ control, name: 'name' })

  useEffect(() => {
    if (open) reset({ name: category?.name ?? '' })
  }, [category, open, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border border-b">
          <DialogTitle>
            {category
              ? t.documentCommitment.editCategory
              : t.documentCommitment.createCategory}
          </DialogTitle>
          <DialogDescription>
            {t.documentCommitment.categoryFormDescription}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => onSubmit(values.name))}
          className="flex flex-col"
        >
          <div className="flex flex-col gap-2 px-5 py-5">
            <Label htmlFor="document-commitment-category-name">
              {t.documentCommitment.categoryName}
            </Label>
            <Input
              id="document-commitment-category-name"
              autoFocus
              maxLength={100}
              disabled={pending}
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            <p className="text-foreground/55 text-xs">
              {nameValue.length + ' / 100 karakter'}
            </p>
            {errors.name?.message && (
              <p role="alert" className="text-danger text-sm">
                {errors.name.message}
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
                  {t.documentCommitment.saving}
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

export { DocumentCommitmentCategoryFormDialog }
