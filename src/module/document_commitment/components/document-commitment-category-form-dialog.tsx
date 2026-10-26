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
import { slugify } from '@/shared/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircleIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

interface DocumentCommitmentCategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: DocumentCommitmentCategory
  pending: boolean
  slugError?: string
  onSubmit: (values: DocumentCommitmentCategoryFormValues) => void
}

function DocumentCommitmentCategoryFormDialog({
  open,
  onOpenChange,
  category,
  pending,
  slugError,
  onSubmit,
}: DocumentCommitmentCategoryFormDialogProps) {
  const { t } = useI18n()
  const {
    control,
    formState: { dirtyFields, errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<DocumentCommitmentCategoryFormValues>({
    resolver: zodResolver(createDocumentCommitmentCategoryFormSchema(t)),
    defaultValues: { name: category?.name ?? '', slug: category?.slug ?? '' },
  })
  const nameValue = useWatch({ control, name: 'name' })

  useEffect(() => {
    if (open) {
      reset({ name: category?.name ?? '', slug: category?.slug ?? '' })
    }
  }, [category, open, reset])

  useEffect(() => {
    if (!category && !dirtyFields.slug) {
      setValue('slug', slugify(nameValue), { shouldValidate: true })
    }
  }, [category, dirtyFields.slug, nameValue, setValue])

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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
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
              {t.common.characterCount(nameValue.length, 100)}
            </p>
            {errors.name?.message && (
              <p role="alert" className="text-danger text-sm">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 px-5 pb-5">
            <Label htmlFor="document-commitment-category-slug">
              {t.documentCommitment.categorySlug}
            </Label>
            <Input
              id="document-commitment-category-slug"
              maxLength={100}
              disabled={pending}
              aria-invalid={Boolean(errors.slug)}
              {...register('slug')}
            />
            {errors.slug?.message && (
              <p role="alert" className="text-danger text-sm">
                {errors.slug.message}
              </p>
            )}
            {slugError && (
              <p role="alert" className="text-danger text-sm">
                {slugError}
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
