import type { DocumentCommitmentCategorySummary } from '@/module/document_commitment/api/document-commitment.api'
import type { Language } from '@/module/language/api/language.api'
import { DEFAULT_LANGUAGE_ID } from '@/module/language/constants/language.constants'
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
import { Textarea } from '@/shared/components/ui/textarea'
import { slugify } from '@/shared/lib/utils'
import { documentCommitmentCategoryQueryOptions } from '@/module/document_commitment/queries/document-commitment.queries'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { LoaderCircleIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

interface DocumentCommitmentCategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: DocumentCommitmentCategorySummary
  languages: Language[]
  languageId: string
  pending: boolean
  slugError?: string
  onSubmit: (values: DocumentCommitmentCategoryFormValues) => void
}

function DocumentCommitmentCategoryFormDialog({
  open,
  onOpenChange,
  category,
  languages,
  languageId,
  pending,
  slugError,
  onSubmit,
}: DocumentCommitmentCategoryFormDialogProps) {
  const { t } = useI18n()
  const formLanguageId = category ? languageId : DEFAULT_LANGUAGE_ID
  const detailQuery = useQuery({
    ...documentCommitmentCategoryQueryOptions(category?.id ?? 0),
    enabled: category !== undefined,
  })
  const selectedLanguage =
    languages.find((item) => item.id === formLanguageId) ?? languages[0]
  const selectedContent = detailQuery.data?.contents.find(
    (content) => content.language_id === formLanguageId,
  )
  const isNewTranslation = Boolean(
    category && detailQuery.data && !selectedContent,
  )
  const {
    control,
    formState: { dirtyFields, errors, isDirty },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<DocumentCommitmentCategoryFormValues>({
    resolver: zodResolver(createDocumentCommitmentCategoryFormSchema(t)),
    defaultValues: { name: '', slug: '', description: '' },
  })
  const nameValue = useWatch({ control, name: 'name' })

  useEffect(() => {
    if (!open) {
      reset({ name: '', slug: '', description: '' })
      return
    }

    if (isDirty || (category && !detailQuery.data)) return

    reset({
      name: selectedContent?.name ?? '',
      slug: selectedContent?.slug ?? '',
      description: selectedContent?.description ?? '',
    })
  }, [category, detailQuery.data, isDirty, open, reset, selectedContent])

  useEffect(() => {
    if ((!category || isNewTranslation) && !dirtyFields.slug) {
      setValue('slug', slugify(nameValue), { shouldValidate: true })
    }
  }, [category, dirtyFields.slug, isNewTranslation, nameValue, setValue])

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
          {selectedLanguage && (
            <span className="text-muted text-sm">
              {t.documentCommitment.language}: {selectedLanguage.flag}{' '}
              {selectedLanguage.language}
            </span>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          {detailQuery.isPending && category && (
            <p role="status" className="text-muted px-5 pt-4 text-sm">
              {t.documentCommitment.translationLoading}
            </p>
          )}
          {detailQuery.isError && (
            <div className="flex items-center gap-2 px-5 pt-4">
              <p role="alert" className="text-danger text-sm">
                {t.documentCommitment.categoryDetailFailed}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => void detailQuery.refetch()}
              >
                {t.common.retry}
              </Button>
            </div>
          )}
          <div className="flex flex-col gap-2 px-5 py-5">
            <Label htmlFor="document-commitment-category-name">
              {t.documentCommitment.categoryName}
            </Label>
            <Input
              id="document-commitment-category-name"
              autoFocus
              maxLength={100}
              disabled={
                pending || (category !== undefined && !detailQuery.data)
              }
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
              disabled={
                pending || (category !== undefined && !detailQuery.data)
              }
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

          <div className="flex flex-col gap-2 px-5 pb-5">
            <Label htmlFor="document-commitment-category-description">
              {t.documentCommitment.categoryDescriptionField}
            </Label>
            <Textarea
              id="document-commitment-category-description"
              disabled={
                pending || (category !== undefined && !detailQuery.data)
              }
              aria-invalid={Boolean(errors.description)}
              {...register('description')}
            />
            {errors.description?.message && (
              <p role="alert" className="text-danger text-sm">
                {errors.description.message}
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
            <Button
              type="submit"
              disabled={
                pending || (category !== undefined && !detailQuery.data)
              }
            >
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
