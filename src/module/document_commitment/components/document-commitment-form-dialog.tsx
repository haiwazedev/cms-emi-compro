import { PERMISSION_HINTS } from '@/module/auth/constants/permission.constants'
import { usePermissions } from '@/module/auth/hooks/use-permissions'
import type {
  DocumentCommitment,
  DocumentCommitmentCategory,
} from '@/module/document_commitment/api/document-commitment.api'
import {
  DOCUMENT_COMMITMENT_LABELS,
  DOCUMENT_COMMITMENT_MAX_FILE_SIZE,
} from '@/module/document_commitment/constants/document-commitment.constants'
import type { DocumentCommitmentFormValues } from '@/module/document_commitment/schemas/document-commitment-form.schema'
import { documentCommitmentFormSchema } from '@/module/document_commitment/schemas/document-commitment-form.schema'
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
import { documentCommitmentCategoriesQueryOptions } from '@/module/document_commitment/queries/document-commitment.queries'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { DownloadIcon, LoaderCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

interface DocumentCommitmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: DocumentCommitment
  pending: boolean
  onSubmit: (values: DocumentCommitmentFormValues, file?: File) => void
}

function DocumentCommitmentFormDialog({
  open,
  onOpenChange,
  document,
  pending,
  onSubmit,
}: DocumentCommitmentFormDialogProps) {
  const { canPublish } = usePermissions()
  const isEditing = document !== undefined
  const categoriesQuery = useQuery(documentCommitmentCategoriesQueryOptions())
  const [selectedFile, setSelectedFile] = useState<File>()
  const [fileError, setFileError] = useState<string>()
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<DocumentCommitmentFormValues>({
    resolver: zodResolver(documentCommitmentFormSchema),
    defaultValues: {
      document_commitment_category_id:
        document?.document_commitment_category_id ?? 0,
      title: document?.title ?? '',
      status: document?.status ?? 'DRAFT',
    },
  })

  function handleFileChange(file: File | undefined) {
    setSelectedFile(undefined)
    setFileError(undefined)

    if (!file) return

    const isPdf =
      file.name.toLowerCase().endsWith('.pdf') &&
      (!file.type || file.type === 'application/pdf')
    if (!isPdf) {
      setFileError(DOCUMENT_COMMITMENT_LABELS.pdfInvalid)
      return
    }

    if (file.size > DOCUMENT_COMMITMENT_MAX_FILE_SIZE) {
      setFileError(DOCUMENT_COMMITMENT_LABELS.pdfTooLarge)
      return
    }

    setSelectedFile(file)
  }

  function submitForm(values: DocumentCommitmentFormValues) {
    setFileError(undefined)
    if (!isEditing && !selectedFile) {
      setFileError(DOCUMENT_COMMITMENT_LABELS.pdfRequired)
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
              ? DOCUMENT_COMMITMENT_LABELS.editTitle
              : DOCUMENT_COMMITMENT_LABELS.uploadTitle}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {DOCUMENT_COMMITMENT_LABELS.formDescription}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submitForm)}
          className="flex min-h-0 flex-col"
        >
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="document-commitment-file">
                {DOCUMENT_COMMITMENT_LABELS.pdfField}
                {!isEditing && <RequiredMark />}
              </Label>
              {document && (
                <p className="text-muted text-sm">
                  {DOCUMENT_COMMITMENT_LABELS.currentFile}: {document.filename}
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
                  {DOCUMENT_COMMITMENT_LABELS.dropzoneText}
                  <span className="text-secondary font-semibold">
                    {DOCUMENT_COMMITMENT_LABELS.dropzoneAction}
                  </span>
                </span>
                <span className="text-xs">
                  {isEditing
                    ? DOCUMENT_COMMITMENT_LABELS.keepCurrentPdf
                    : DOCUMENT_COMMITMENT_LABELS.pdfHelp}
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="document-commitment-title">
                {DOCUMENT_COMMITMENT_LABELS.titleField}
                <RequiredMark />
              </Label>
              <Input
                id="document-commitment-title"
                autoFocus
                maxLength={200}
                disabled={pending}
                aria-invalid={Boolean(errors.title)}
                {...register('title')}
              />
              {errors.title?.message && (
                <p role="alert" className="text-danger text-sm">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="document-commitment-category">
                  {DOCUMENT_COMMITMENT_LABELS.categoryField}
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
                          placeholder={
                            DOCUMENT_COMMITMENT_LABELS.chooseCategory
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesQuery.data?.map(
                          (category: DocumentCommitmentCategory) => (
                            <SelectItem
                              key={category.id}
                              value={String(category.id)}
                            >
                              {category.name}
                            </SelectItem>
                          ),
                        )}
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
                    {DOCUMENT_COMMITMENT_LABELS.categoriesFailed}
                  </p>
                )}
                {categoriesQuery.data?.length === 0 && (
                  <p className="text-muted text-sm">
                    Belum ada kategori.{' '}
                    <Link
                      to="/document_commitment_categories"
                      className="text-secondary underline"
                    >
                      {DOCUMENT_COMMITMENT_LABELS.manageCategories}
                    </Link>
                  </p>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="document-commitment-status">
                  {DOCUMENT_COMMITMENT_LABELS.statusField}
                </Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={canPublish ? field.value : 'DRAFT'}
                      onValueChange={field.onChange}
                      disabled={pending || !canPublish}
                    >
                      <SelectTrigger id="document-commitment-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLISHED">
                          {DOCUMENT_COMMITMENT_LABELS.published}
                        </SelectItem>
                        <SelectItem value="DRAFT">
                          {DOCUMENT_COMMITMENT_LABELS.draft}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {!canPublish && (
                  <p className="text-muted text-xs">
                    {PERMISSION_HINTS.draftOnly}
                  </p>
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
              {DOCUMENT_COMMITMENT_LABELS.cancel}
            </Button>
            <Button
              type="submit"
              disabled={
                pending ||
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
                  {DOCUMENT_COMMITMENT_LABELS.saving}
                </>
              ) : (
                DOCUMENT_COMMITMENT_LABELS.save
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
