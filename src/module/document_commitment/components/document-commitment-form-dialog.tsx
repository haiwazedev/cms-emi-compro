import { usePermissions } from '@/module/auth/hooks/use-permissions'
import type { DocumentCommitmentListItem } from '@/module/document_commitment/api/document-commitment.api'
import { DOCUMENT_COMMITMENT_MAX_FILE_SIZE } from '@/module/document_commitment/constants/document-commitment.constants'
import type { Language } from '@/module/language/api/language.api'
import { DEFAULT_LANGUAGE_ID } from '@/module/language/constants/language.constants'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import type { DocumentCommitmentFormValues } from '@/module/document_commitment/schemas/document-commitment-form.schema'
import { createDocumentCommitmentFormSchema } from '@/module/document_commitment/schemas/document-commitment-form.schema'
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
import {
  documentCommitmentCategoriesQueryOptions,
  documentCommitmentCategoryQueryOptions,
  documentCommitmentQueryOptions,
} from '@/module/document_commitment/queries/document-commitment.queries'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueries, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { DownloadIcon, LoaderCircleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

interface DocumentCommitmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: DocumentCommitmentListItem
  languages: Language[]
  languageId: string
  pending: boolean
  onSubmit: (values: DocumentCommitmentFormValues, file?: File) => void
}

function DocumentCommitmentFormDialog({
  open,
  onOpenChange,
  document,
  languages,
  languageId,
  pending,
  onSubmit,
}: DocumentCommitmentFormDialogProps) {
  const { t } = useI18n()
  const { canPublish } = usePermissions()
  const isEditing = document !== undefined
  const categoriesQuery = useQuery(documentCommitmentCategoriesQueryOptions())
  const documentQuery = useQuery({
    ...documentCommitmentQueryOptions(document?.id ?? 0),
    enabled: document !== undefined,
  })
  const categorySummaries = categoriesQuery.data ?? []
  const categoryDetailQueries = useQueries({
    queries: categorySummaries.map((category) =>
      documentCommitmentCategoryQueryOptions(category.id),
    ),
  })
  const localizedCategories = categorySummaries.map((category, index) => {
    const details = categoryDetailQueries[index]?.data
    const translation = details?.contents.find(
      (content) => content.language_id === languageId,
    )
    const defaultTranslation = details?.contents.find(
      (content) => content.language_id === DEFAULT_LANGUAGE_ID,
    )

    return {
      ...category,
      name: translation?.name ?? defaultTranslation?.name ?? category.name,
      translationMissing: Boolean(details && !translation),
    }
  })
  const [selectedFile, setSelectedFile] = useState<File>()
  const [fileError, setFileError] = useState<string>()
  const selectedLanguage =
    languages.find((item) => item.id === languageId) ?? languages[0]
  const selectedContent = documentQuery.data?.contents.find(
    (content) => content.language_id === languageId,
  )
  const titleRequired = !isEditing || selectedContent !== undefined
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<DocumentCommitmentFormValues>({
    resolver: zodResolver(createDocumentCommitmentFormSchema(t, titleRequired)),
    defaultValues: {
      document_commitment_category_id:
        document?.document_commitment_category_id ?? 0,
      title: '',
      status: document?.status ?? 'DRAFT',
    },
  })
  const titleValue = useWatch({ control, name: 'title' })
  const categoryValue = useWatch({
    control,
    name: 'document_commitment_category_id',
  })
  const statusValue = useWatch({ control, name: 'status' })
  const documentDetailReady = !isEditing || documentQuery.data !== undefined
  const hasChangesInMissingTranslation = Boolean(
    titleValue.trim() ||
    selectedFile ||
    (document &&
      (categoryValue !== document.document_commitment_category_id ||
        statusValue !== document.status)),
  )
  const cannotSaveEmptyTranslation =
    isEditing && !selectedContent && !hasChangesInMissingTranslation

  useEffect(() => {
    if (!open || isDirty || (document && !documentQuery.data)) return

    reset({
      document_commitment_category_id:
        document?.document_commitment_category_id ?? 0,
      title:
        documentQuery.data?.contents.find(
          (content) => content.language_id === languageId,
        )?.title ?? '',
      status: document?.status ?? 'DRAFT',
    })
  }, [document, documentQuery.data, isDirty, languageId, open, reset])

  function handleFileChange(file: File | undefined) {
    setSelectedFile(undefined)
    setFileError(undefined)

    if (!file) return

    const isPdf =
      file.name.toLowerCase().endsWith('.pdf') &&
      (!file.type || file.type === 'application/pdf')
    if (!isPdf) {
      setFileError(t.documentCommitment.pdfInvalid)
      return
    }

    if (file.size > DOCUMENT_COMMITMENT_MAX_FILE_SIZE) {
      setFileError(t.documentCommitment.pdfTooLarge)
      return
    }

    setSelectedFile(file)
  }

  function submitForm(values: DocumentCommitmentFormValues) {
    // A rejected file stays explained instead of turning into "required".
    if (fileError) return

    if (!isEditing && !selectedFile) {
      setFileError(t.documentCommitment.pdfRequired)
      return
    }

    onSubmit(values, selectedFile)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border border-b">
          <DialogTitle>
            {isEditing
              ? t.documentCommitment.editTitle
              : t.documentCommitment.uploadTitle}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t.documentCommitment.formDescription}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submitForm)}
          className="flex min-h-0 flex-col"
        >
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="document-commitment-file">
                {t.documentCommitment.pdfField}
                {!isEditing && <RequiredMark />}
              </Label>
              {document && (
                <p className="text-muted text-sm">
                  {t.documentCommitment.currentFile}: {document.filename}
                </p>
              )}
              <label
                htmlFor="document-commitment-file"
                className="border-border bg-primary text-muted flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center text-sm"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  if (!pending) handleFileChange(event.dataTransfer.files[0])
                }}
              >
                <DownloadIcon
                  aria-hidden="true"
                  className="text-accent size-5"
                />
                <span>
                  {t.documentCommitment.dropzoneText}
                  <span className="text-secondary font-semibold">
                    {t.documentCommitment.dropzoneAction}
                  </span>
                </span>
                <span className="text-xs">
                  {isEditing
                    ? t.documentCommitment.keepCurrentPdf
                    : t.documentCommitment.pdfHelp}
                </span>
                {selectedFile && (
                  <span className="text-accent font-semibold">
                    {selectedFile.name}
                  </span>
                )}
              </label>
              <input
                id="document-commitment-file"
                type="file"
                accept="application/pdf,.pdf"
                disabled={pending}
                onChange={(event) =>
                  handleFileChange(event.currentTarget.files?.[0])
                }
                className="sr-only"
              />
              {fileError && (
                <p role="alert" className="text-danger text-sm">
                  {fileError}
                </p>
              )}
            </div>

            {documentQuery.isError && (
              <div className="flex items-center gap-2">
                <p role="alert" className="text-danger text-sm">
                  {t.documentCommitment.documentDetailFailed}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => void documentQuery.refetch()}
                >
                  {t.common.retry}
                </Button>
              </div>
            )}
            {documentQuery.isPending && document && (
              <p role="status" className="text-muted text-sm">
                {t.documentCommitment.translationLoading}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="document-commitment-title">
                  {t.documentCommitment.titleField}
                  {titleRequired && <RequiredMark />}
                </Label>
                {selectedLanguage && (
                  <span className="bg-secondary/10 text-accent rounded-full px-2 py-1 text-xs font-medium">
                    <span aria-hidden="true">{selectedLanguage.flag}</span>{' '}
                    {selectedLanguage.language}
                  </span>
                )}
              </div>
              <Input
                id="document-commitment-title"
                autoFocus
                maxLength={200}
                disabled={pending || !documentDetailReady}
                aria-invalid={Boolean(errors.title)}
                {...register('title')}
              />
              {isEditing && !selectedContent && (
                <p className="text-muted text-xs">
                  {t.documentCommitment.translationTitleOptional}
                </p>
              )}
              <p className="text-foreground/55 text-xs">
                {t.common.characterCount(titleValue.length, 200)}
              </p>
              {errors.title?.message && (
                <p role="alert" className="text-danger text-sm">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="document-commitment-category">
                  {t.documentCommitment.categoryField}
                  <RequiredMark />
                </Label>
                <Controller
                  control={control}
                  name="document_commitment_category_id"
                  render={({ field }) => (
                    <Select
                      value={field.value > 0 ? String(field.value) : ''}
                      onValueChange={(value) => field.onChange(Number(value))}
                      disabled={
                        pending ||
                        !documentDetailReady ||
                        categoriesQuery.isPending ||
                        categoriesQuery.isError
                      }
                    >
                      <SelectTrigger
                        id="document-commitment-category"
                        aria-invalid={Boolean(
                          errors.document_commitment_category_id,
                        )}
                      >
                        <SelectValue
                          placeholder={t.documentCommitment.chooseCategory}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {localizedCategories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.translationMissing
                              ? `${category.name} · ${t.documentCommitment.translationMissing}`
                              : category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.document_commitment_category_id?.message && (
                  <p role="alert" className="text-danger text-sm">
                    {errors.document_commitment_category_id.message}
                  </p>
                )}
                {categoriesQuery.isError && (
                  <p role="alert" className="text-danger text-sm">
                    {t.documentCommitment.categoriesFailed}
                  </p>
                )}
                {categoriesQuery.data?.length === 0 && (
                  <p className="text-muted text-sm">
                    Belum ada kategori.{' '}
                    <Link
                      to="/document_commitment_categories"
                      className="text-secondary underline"
                    >
                      {t.documentCommitment.manageCategories}
                    </Link>
                  </p>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="document-commitment-status">
                  {t.documentCommitment.statusField}
                </Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={canPublish ? field.value : 'DRAFT'}
                      onValueChange={field.onChange}
                      disabled={pending || !documentDetailReady || !canPublish}
                    >
                      <SelectTrigger id="document-commitment-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLISHED">
                          {t.documentCommitment.published}
                        </SelectItem>
                        <SelectItem value="DRAFT">
                          {t.documentCommitment.draft}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {!canPublish && (
                  <p className="text-muted text-xs">{t.auth.draftOnly}</p>
                )}
              </div>
            </div>
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
                pending ||
                !documentDetailReady ||
                cannotSaveEmptyTranslation ||
                categoriesQuery.isPending ||
                categoriesQuery.isError ||
                categoriesQuery.data?.length === 0
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

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-danger ml-0.5">
      *
    </span>
  )
}

export { DocumentCommitmentFormDialog }
