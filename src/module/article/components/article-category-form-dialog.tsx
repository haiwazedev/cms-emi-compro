import type {
  ArticleCategory,
  ArticleCategoryWriteFields,
} from '@/module/article/api/article.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import type { ArticleCategoryFormValues } from '@/module/article/schemas/article-form.schema'
import { createArticleCategoryFormSchema } from '@/module/article/schemas/article-form.schema'
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

interface ArticleCategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: ArticleCategory
  pending: boolean
  serverError?: string
  onSubmit: (fields: ArticleCategoryWriteFields) => void
}

function ArticleCategoryFormDialog({
  open,
  onOpenChange,
  category,
  pending,
  serverError,
  onSubmit,
}: ArticleCategoryFormDialogProps) {
  const { t } = useI18n()
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ArticleCategoryFormValues>({
    resolver: zodResolver(createArticleCategoryFormSchema(t)),
    defaultValues: { name: category?.name ?? '' },
  })
  const name = useWatch({ control, name: 'name' }) ?? ''
  const nameError = errors.name?.message ?? serverError

  useEffect(() => {
    if (open) reset({ name: category?.name ?? '' })
  }, [category, open, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border border-b">
          <DialogTitle>
            {category ? t.article.editCategory : t.article.addCategory}
          </DialogTitle>
          <DialogDescription>
            {t.article.categoryFormDescription}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) =>
            onSubmit({ name: values.name, slug: slugify(values.name) }),
          )}
          className="flex flex-col"
        >
          <div className="flex flex-col gap-2 px-5 py-5">
            <Label htmlFor="article-category-name">
              {t.article.categoryName}
            </Label>
            <Input
              id="article-category-name"
              autoFocus
              maxLength={100}
              disabled={pending}
              aria-invalid={Boolean(nameError)}
              aria-describedby="article-category-slug"
              {...register('name')}
            />
            <p className="text-foreground/55 text-xs">
              {name.length + ' / 100 karakter'}
            </p>
            <p
              id="article-category-slug"
              className="text-foreground/60 text-sm break-all"
            >
              {t.article.categorySlugHint(slugify(name))}
            </p>
            {nameError && (
              <p role="alert" className="text-danger text-sm">
                {nameError}
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
                  {t.article.saving}
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

export { ArticleCategoryFormDialog }
