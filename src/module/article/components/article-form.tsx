import type {
  Article,
  ArticleStatus,
  ArticleWriteFields,
} from '@/module/article/api/article.api'
import { createArticle, updateArticle } from '@/module/article/api/article.api'
import { ArticlePreviewDialog } from '@/module/article/components/article-preview-dialog'
import { ArticleRichTextEditor } from '@/module/article/components/article-rich-text-editor'
import {
  ARTICLE_LABELS,
  ARTICLE_LANGUAGES,
} from '@/module/article/constants/article.constants'
import type {
  ArticleLanguage,
  ArticleLanguageCode,
} from '@/module/article/constants/article.constants'
import { getMediaAssetUrl } from '@/module/media/api/media.api'
import type { Media } from '@/module/media/api/media.api'
import { MediaPickerDialog } from '@/module/media/components/media-picker-dialog'
import {
  articleCategoriesQueryOptions,
  articleQueryKeys,
} from '@/module/article/queries/article.queries'
import type { ArticleFormValues } from '@/module/article/schemas/article-form.schema'
import { articleFormSchema } from '@/module/article/schemas/article-form.schema'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Calendar } from '@/shared/components/ui/calendar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { ApiError } from '@/shared/lib/api-client'
import { toast } from '@/shared/lib/toast'
import { cn, slugify } from '@/shared/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  EyeIcon,
  ImageIcon,
  LoaderCircleIcon,
  PlusIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

interface ArticleFormProps {
  mode: 'create' | 'edit'
  article?: Article
}

type TranslationStatus = ArticleStatus | 'UNSAVED' | 'MISSING'

function ArticleForm({ mode, article }: ArticleFormProps) {
  const isEditing = mode === 'edit'
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const categoriesQuery = useQuery(articleCategoriesQueryOptions())
  const [previewOpen, setPreviewOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false)
  const [language, setLanguage] = useState<ArticleLanguageCode>('id')
  const [pendingLanguage, setPendingLanguage] =
    useState<ArticleLanguageCode | null>(null)
  // shortcut: per-language status is tracked locally; read it from `article_contents` once that API exists.
  const [statuses, setStatuses] = useState<
    Partial<Record<ArticleLanguageCode, ArticleStatus>>
  >(article ? { id: article.status } : {})
  const [addedLanguages, setAddedLanguages] = useState<ArticleLanguageCode[]>(
    [],
  )
  const [selectedPhoto, setSelectedPhoto] = useState<Media>()
  const [photoError, setPhotoError] = useState<string>()
  const [defaultValues] = useState(() => savedValues(article, 'id'))
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(() =>
    isSlugEdited(defaultValues),
  )

  const {
    formState: { errors, isDirty },
    control,
    getValues,
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues,
  })

  const titleValue = useWatch({ control, name: 'title' })
  const slugValue = useWatch({ control, name: 'slug' })
  const contentValue = useWatch({ control, name: 'content' })
  const categoryId = useWatch({ control, name: 'article_category_id' })
  const currentLanguage = findLanguage(language)
  const hasUnsavedChanges =
    isDirty ||
    (selectedPhoto !== undefined && selectedPhoto.id !== article?.primary_photo)
  const handleContentChange = useCallback(
    (content: string) => {
      setValue('content', content, {
        shouldDirty: true,
        shouldValidate: true,
      })
    },
    [setValue],
  )

  const articleMutation = useMutation({
    mutationFn: ({
      values,
      status,
      primaryPhotoId,
    }: {
      values: ArticleFormValues
      status: ArticleStatus
      primaryPhotoId: number
      language: ArticleLanguageCode
    }) => {
      const fields: ArticleWriteFields = {
        ...values,
        issue_date: toNullableText(values.issue_date),
        press_release_number: toNullableText(values.press_release_number),
        cp_name: toNullableText(values.cp_name),
        cp_role: toNullableText(values.cp_role),
        cp_phone_number: toNullableText(values.cp_phone_number),
        cp_email: toNullableText(values.cp_email),
        primary_photo: primaryPhotoId,
        status,
      }

      // shortcut: every language goes through the single-content API, so a non-ID save overwrites the ID content; send `language` once `article_contents` exists.
      if (isEditing && article) {
        return updateArticle(article.id, fields)
      }

      return createArticle(fields)
    },
    onSuccess: async (savedArticle, { values, status, language }) => {
      setStatuses((statuses) => ({ ...statuses, [language]: status }))
      reset(values)
      await queryClient.invalidateQueries({
        queryKey: articleQueryKeys.all,
      })
      toast.add({
        title: 'Berhasil',
        description: ARTICLE_LABELS.articleSaved,
        type: 'success',
      })

      if (!isEditing) {
        await navigate({
          to: '/articles/$articleId/edit',
          params: { articleId: String(savedArticle.id) },
          replace: true,
        })
      }
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : ARTICLE_LABELS.articleSaveFailed

      if (error instanceof ApiError && error.status === 409) {
        setError('slug', { message })
      }

      toast.add({
        title: 'Gagal',
        description: message,
        type: 'error',
      })
    },
  })

  function handleTitleChange(value: string) {
    if (slugManuallyEdited) return

    setValue('slug', slugify(value), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  function handlePhotoSelect(media: Media) {
    setSelectedPhoto(media)
    setPhotoError(undefined)
  }

  function requestLanguage(code: ArticleLanguageCode) {
    if (code === language) return
    if (hasUnsavedChanges) {
      setPendingLanguage(code)
      return
    }

    switchLanguage(code)
  }

  // Discards every unsaved edit, shared fields and photo included.
  function switchLanguage(code: ArticleLanguageCode) {
    const values = savedValues(article, code)
    reset(values)
    setSlugManuallyEdited(isSlugEdited(values))
    setSelectedPhoto(undefined)
    setPhotoError(undefined)
    setLanguage(code)
    setPendingLanguage(null)
  }

  function translationStatus(code: ArticleLanguageCode): TranslationStatus {
    const status = statuses[code]
    if (status) return status
    if (code === language || addedLanguages.includes(code)) return 'UNSAVED'
    return 'MISSING'
  }

  function submitArticle(status: ArticleStatus) {
    return handleSubmit(
      (values) => {
        const primaryPhotoId = selectedPhoto?.id ?? article?.primary_photo
        if (primaryPhotoId == null) {
          setPhotoError(ARTICLE_LABELS.photoRequired)
          return
        }

        articleMutation.mutate({ values, status, primaryPhotoId, language })
      },
      () => {
        if ((selectedPhoto?.id ?? article?.primary_photo) == null) {
          setPhotoError(ARTICLE_LABELS.photoRequired)
        }
      },
    )()
  }

  const existingPhotoUrl = article?.primary_photo_url
    ? getMediaAssetUrl(article.primary_photo_url)
    : undefined
  const previewPhotoUrl = selectedPhoto
    ? getMediaAssetUrl(selectedPhoto.path)
    : existingPhotoUrl
  const currentStatus = translationStatus(language)

  return (
    <>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submitArticle('DRAFT')
        }}
        className="bg-primary flex min-h-full flex-col gap-5 p-4 lg:p-8"
      >
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <Button
              asChild
              variant="link"
              className="text-secondary h-auto self-start px-0"
            >
              <Link to="/articles">
                <ArrowLeftIcon aria-hidden="true" className="size-4" />
                {ARTICLE_LABELS.backToArticles}
              </Link>
            </Button>
            <div className="flex flex-col gap-1">
              <h1 className="text-accent text-2xl font-bold lg:text-3xl">
                {isEditing
                  ? ARTICLE_LABELS.editPageTitle
                  : ARTICLE_LABELS.createPageTitle}
              </h1>
              {article?.updated_at && (
                <p className="text-foreground/55 text-sm">
                  Terakhir disimpan {formatMetaDate(article.updated_at)}
                  {article.updated_by ? ' oleh ' + article.updated_by : ''}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
            >
              <EyeIcon aria-hidden="true" className="size-4" />
              {ARTICLE_LABELS.preview}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={articleMutation.isPending}
              onClick={() => void submitArticle('DRAFT')}
            >
              {articleMutation.isPending ? (
                <LoaderCircleIcon
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              ) : null}
              {ARTICLE_LABELS.saveDraft}
            </Button>
            <Button
              type="button"
              disabled={articleMutation.isPending}
              onClick={() => void submitArticle('PUBLISHED')}
              className="bg-success hover:bg-success/90"
            >
              {articleMutation.isPending ? (
                <LoaderCircleIcon
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              ) : null}
              {ARTICLE_LABELS.publishArticle}
            </Button>
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{ARTICLE_LABELS.mainContent}</CardTitle>
                <Badge variant="secondary">{currentLanguage.name}</Badge>
              </CardHeader>
              {/* Remount per language so the editor loads that language's content. */}
              <CardContent key={language}>
                <FormField
                  id="article-title"
                  label={ARTICLE_LABELS.titleField}
                  required
                  error={errors.title?.message}
                  hint={titleValue.length + ' / 120 karakter'}
                >
                  <Input
                    id="article-title"
                    maxLength={120}
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={
                      errors.title ? 'article-title-error' : undefined
                    }
                    {...register('title', {
                      onChange: (event) =>
                        handleTitleChange(event.currentTarget.value),
                    })}
                  />
                </FormField>

                <FormField
                  id="article-slug"
                  label={ARTICLE_LABELS.slugField}
                  required
                  error={errors.slug?.message}
                  hint="Dibuat otomatis dari judul dan dapat diedit."
                >
                  <Input
                    id="article-slug"
                    maxLength={255}
                    aria-invalid={Boolean(errors.slug)}
                    aria-describedby={
                      errors.slug ? 'article-slug-error' : undefined
                    }
                    {...register('slug', {
                      onChange: () => setSlugManuallyEdited(true),
                    })}
                    value={slugValue}
                  />
                </FormField>

                <FormField
                  id="article-summary"
                  label={ARTICLE_LABELS.summaryField}
                  required
                  error={errors.summary?.message}
                  hint="Tampil pada kartu berita di halaman Media & Informasi."
                >
                  <Textarea
                    id="article-summary"
                    aria-invalid={Boolean(errors.summary)}
                    aria-describedby={
                      errors.summary ? 'article-summary-error' : undefined
                    }
                    {...register('summary')}
                  />
                </FormField>

                <FormField
                  id="article-content"
                  label={ARTICLE_LABELS.bodyField}
                  required
                  error={errors.content?.message}
                >
                  <div
                    className="border-border/20 overflow-hidden rounded-lg border"
                    aria-invalid={Boolean(errors.content)}
                  >
                    <ArticleRichTextEditor
                      id="article-content"
                      ariaLabel={ARTICLE_LABELS.bodyField}
                      content={getValues('content')}
                      onChange={handleContentChange}
                    />
                  </div>
                </FormField>

                <FormField
                  id="article-press-release-number"
                  label={ARTICLE_LABELS.pressReleaseNumberField}
                  error={errors.press_release_number?.message}
                >
                  {/* Shared across languages, unlike the fields above. */}
                  <Input
                    id="article-press-release-number"
                    maxLength={255}
                    aria-invalid={Boolean(errors.press_release_number)}
                    {...register('press_release_number')}
                  />
                </FormField>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{ARTICLE_LABELS.contactSection}</CardTitle>
                <span className="text-foreground/50 text-sm">Komponen</span>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-5 lg:flex-row">
                  <FormField
                    id="article-contact-name"
                    label={ARTICLE_LABELS.contactNameField}
                    error={errors.cp_name?.message}
                  >
                    <Input
                      id="article-contact-name"
                      maxLength={100}
                      aria-invalid={Boolean(errors.cp_name)}
                      {...register('cp_name')}
                    />
                  </FormField>
                  <FormField
                    id="article-contact-role"
                    label={ARTICLE_LABELS.contactRoleField}
                    error={errors.cp_role?.message}
                  >
                    <Input
                      id="article-contact-role"
                      maxLength={100}
                      aria-invalid={Boolean(errors.cp_role)}
                      {...register('cp_role')}
                    />
                  </FormField>
                </div>
                <div className="flex flex-col gap-5 lg:flex-row">
                  <FormField
                    id="article-contact-phone"
                    label={ARTICLE_LABELS.contactPhoneField}
                    error={errors.cp_phone_number?.message}
                  >
                    <Input
                      id="article-contact-phone"
                      maxLength={100}
                      aria-invalid={Boolean(errors.cp_phone_number)}
                      {...register('cp_phone_number')}
                    />
                  </FormField>
                  <FormField
                    id="article-contact-email"
                    label={ARTICLE_LABELS.contactEmailField}
                    error={errors.cp_email?.message}
                  >
                    <Input
                      id="article-contact-email"
                      type="email"
                      maxLength={100}
                      aria-invalid={Boolean(errors.cp_email)}
                      {...register('cp_email')}
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="flex w-full flex-col gap-6 lg:w-80 lg:shrink-0">
            <Card>
              <CardContent>
                <h2 className="text-foreground/60 text-xs font-semibold tracking-wide uppercase">
                  {ARTICLE_LABELS.publicationStatus}
                </h2>
                <div className="border-border/10 flex items-center justify-between border-b pb-3 text-sm">
                  <span className="text-foreground/60">Status</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      currentStatus === 'PUBLISHED' &&
                        'border-success/20 bg-success/10',
                      currentStatus === 'DRAFT' &&
                        'border-warning/20 bg-warning/10',
                      TRANSLATION_STATUS_TONES[currentStatus],
                    )}
                  >
                    {TRANSLATION_STATUS_LABELS[currentStatus]}
                  </Badge>
                </div>
                {article && (
                  <div className="flex flex-col gap-3 text-sm">
                    <MetaRow
                      label="Dibuat"
                      value={formatMetaDate(article.created_at)}
                    />
                    <MetaRow
                      label="Penulis"
                      value={article.updated_by ?? article.created_by}
                    />
                    {article.updated_at && (
                      <MetaRow
                        label="Diperbarui"
                        value={formatMetaDate(article.updated_at)}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-xs tracking-wide uppercase">
                  {ARTICLE_LABELS.primaryPhoto}
                  <span className="text-danger"> *</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {previewPhotoUrl ? (
                  <img
                    src={previewPhotoUrl}
                    alt=""
                    className="aspect-video w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="bg-primary text-foreground/40 flex aspect-video items-center justify-center rounded-lg">
                    <ImageIcon aria-hidden="true" className="size-8" />
                  </div>
                )}
                <FormField
                  id="article-primary-photo"
                  label={
                    previewPhotoUrl
                      ? ARTICLE_LABELS.photoReplace
                      : ARTICLE_LABELS.photoSelect
                  }
                  required
                  error={photoError}
                  hint={ARTICLE_LABELS.photoHelp}
                >
                  <Button
                    id="article-primary-photo"
                    type="button"
                    variant="outline"
                    aria-invalid={Boolean(photoError)}
                    aria-describedby={
                      photoError ? 'article-primary-photo-error' : undefined
                    }
                    onClick={() => setPhotoPickerOpen(true)}
                    className="w-full justify-start"
                  >
                    <ImageIcon aria-hidden="true" className="size-4" />
                    {selectedPhoto
                      ? ARTICLE_LABELS.photoReplace
                      : ARTICLE_LABELS.photoSelect}
                  </Button>
                </FormField>
                {selectedPhoto && (
                  <div className="text-foreground/55 flex min-w-0 items-center gap-1 text-xs">
                    <span className="min-w-0 flex-1 truncate">
                      {selectedPhoto.filename}
                    </span>
                    {selectedPhoto.metadata && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="shrink-0">
                          {`${selectedPhoto.metadata.width} × ${selectedPhoto.metadata.height}`}
                        </span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="shrink-0">
                      {formatMediaSize(selectedPhoto.size)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-xs tracking-wide uppercase">
                  {ARTICLE_LABELS.articleGrouping}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <FormField
                  id="article-category"
                  label={ARTICLE_LABELS.category}
                  required
                  error={errors.article_category_id?.message}
                >
                  <Select
                    value={categoryId > 0 ? String(categoryId) : undefined}
                    onValueChange={(value) =>
                      setValue('article_category_id', Number(value), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    disabled={
                      categoriesQuery.isPending || categoriesQuery.isError
                    }
                  >
                    <SelectTrigger
                      id="article-category"
                      aria-invalid={Boolean(errors.article_category_id)}
                      aria-describedby={
                        errors.article_category_id
                          ? 'article-category-error'
                          : undefined
                      }
                    >
                      <SelectValue
                        placeholder={
                          categoriesQuery.isPending
                            ? 'Memuat kategori...'
                            : ARTICLE_LABELS.chooseCategory
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesQuery.data?.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categoriesQuery.isError && (
                    <div className="flex flex-col gap-2">
                      <p role="alert" className="text-danger text-sm">
                        {ARTICLE_LABELS.categoriesFailed}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void categoriesQuery.refetch()}
                      >
                        {ARTICLE_LABELS.retry}
                      </Button>
                    </div>
                  )}
                </FormField>

                <FormField
                  id="article-issue-date"
                  label={ARTICLE_LABELS.issueDateField}
                  error={errors.issue_date?.message}
                >
                  <Controller
                    control={control}
                    name="issue_date"
                    render={({ field }) => (
                      <Popover
                        open={datePickerOpen}
                        onOpenChange={setDatePickerOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            ref={field.ref}
                            id="article-issue-date"
                            type="button"
                            variant="outline"
                            aria-invalid={Boolean(errors.issue_date)}
                            aria-describedby={
                              errors.issue_date
                                ? 'article-issue-date-error'
                                : undefined
                            }
                            onBlur={field.onBlur}
                            className="h-10 w-full justify-between font-normal"
                          >
                            <span
                              className={
                                field.value ? undefined : 'text-foreground/55'
                              }
                            >
                              {formatIssueDate(field.value) ??
                                ARTICLE_LABELS.chooseIssueDate}
                            </span>
                            <CalendarDaysIcon
                              aria-hidden="true"
                              className="size-4 opacity-60"
                            />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={parseIssueDate(field.value)}
                            onSelect={(date) => {
                              field.onChange(date ? toIssueDate(date) : '')
                              field.onBlur()
                              setDatePickerOpen(false)
                            }}
                          />
                          <div className="border-border/15 flex justify-end border-t p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={!field.value}
                              onClick={() => {
                                field.onChange('')
                                field.onBlur()
                                setDatePickerOpen(false)
                              }}
                            >
                              {ARTICLE_LABELS.clearIssueDate}
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </FormField>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-xs tracking-wide uppercase">
                  {ARTICLE_LABELS.translation}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-4 text-sm">
                {ARTICLE_LANGUAGES.map((item) => (
                  <TranslationRow
                    key={item.code}
                    language={item}
                    status={translationStatus(item.code)}
                    current={item.code === language}
                    onOpen={() => requestLanguage(item.code)}
                    onAdd={() =>
                      setAddedLanguages((codes) => [...codes, item.code])
                    }
                  />
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </form>

      <ArticlePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={titleValue}
        photoUrl={previewPhotoUrl}
        content={contentValue}
      />
      {photoPickerOpen && (
        <MediaPickerDialog
          open={photoPickerOpen}
          onOpenChange={setPhotoPickerOpen}
          selectedMediaId={
            selectedPhoto?.id ?? article?.primary_photo ?? undefined
          }
          onSelect={handlePhotoSelect}
        />
      )}
      <Dialog
        open={pendingLanguage !== null}
        onOpenChange={(open) => {
          if (!open) setPendingLanguage(null)
        }}
      >
        <DialogContent
          className="max-w-xl"
          closeLabel={ARTICLE_LABELS.closeDiscardDialog}
        >
          <DialogHeader className="border-border/15 border-b">
            <DialogTitle>{ARTICLE_LABELS.discardChangesTitle}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="px-5 py-6">
            {ARTICLE_LABELS.discardChangesDescription}
          </DialogDescription>
          <DialogFooter className="bg-primary">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingLanguage(null)}
            >
              {ARTICLE_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-danger/30 text-danger hover:bg-danger/5 hover:text-danger"
              onClick={() => {
                if (pendingLanguage) switchLanguage(pendingLanguage)
              }}
            >
              {ARTICLE_LABELS.confirmDiscardChanges}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function FormField({
  id,
  label,
  required = false,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <Label htmlFor={id} className="text-accent">
        {label}
        {required && <span className="text-danger"> *</span>}
      </Label>
      {children}
      {error && (
        <p id={id + '-error'} role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-foreground/55 text-xs">{hint}</p>}
    </div>
  )
}

const TRANSLATION_STATUS_LABELS: Record<TranslationStatus, string> = {
  PUBLISHED: ARTICLE_LABELS.published,
  DRAFT: ARTICLE_LABELS.draft,
  UNSAVED: ARTICLE_LABELS.translationUnsaved,
  MISSING: ARTICLE_LABELS.translationMissing,
}

const TRANSLATION_STATUS_TONES: Record<TranslationStatus, string> = {
  PUBLISHED: 'text-success',
  DRAFT: 'text-warning',
  UNSAVED: 'text-foreground/55',
  MISSING: 'text-foreground/40',
}

function TranslationRow({
  language,
  status,
  current,
  onOpen,
  onAdd,
}: {
  language: ArticleLanguage
  status: TranslationStatus
  current: boolean
  onOpen: () => void
  onAdd: () => void
}) {
  const name = (
    <span className="flex items-center gap-2">
      <span aria-hidden="true">{language.flag}</span>
      {language.name}
    </span>
  )

  return (
    <div className="border-border/10 flex items-center justify-between gap-3 border-b pb-2 last:border-0 last:pb-0">
      {status === 'MISSING' ? (
        <>
          <span className={TRANSLATION_STATUS_TONES.MISSING}>{name}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={ARTICLE_LABELS.addTranslation(language.name)}
            onClick={onAdd}
          >
            <PlusIcon aria-hidden="true" className="size-4" />
          </Button>
        </>
      ) : (
        <button
          type="button"
          aria-current={current || undefined}
          aria-label={ARTICLE_LABELS.openTranslation(language.name)}
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
        >
          <span
            className={
              current ? 'text-accent font-semibold' : 'text-foreground/60'
            }
          >
            {name}
          </span>
          <span className={cn('font-medium', TRANSLATION_STATUS_TONES[status])}>
            {TRANSLATION_STATUS_LABELS[status]}
          </span>
        </button>
      )}
    </div>
  )
}

function findLanguage(code: ArticleLanguageCode) {
  return ARTICLE_LANGUAGES.find((item) => item.code === code)!
}

// shortcut: the current API stores one content set, treated as Indonesian; load per language once `article_contents` exists.
function savedValues(
  article: Article | undefined,
  language: ArticleLanguageCode,
): ArticleFormValues {
  const content = language === 'id' ? article : undefined

  return {
    article_category_id: article?.article_category_id ?? 0,
    title: content?.title ?? '',
    slug: content?.slug ?? '',
    summary: content?.summary ?? '',
    content: content?.content ?? '',
    issue_date: article?.issue_date?.slice(0, 10) ?? '',
    press_release_number: article?.press_release_number ?? '',
    cp_name: article?.cp_name ?? '',
    cp_role: article?.cp_role ?? '',
    cp_phone_number: article?.cp_phone_number ?? '',
    cp_email: article?.cp_email ?? '',
  }
}

function isSlugEdited({ title, slug }: ArticleFormValues) {
  return slug !== slugify(title)
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border/10 flex items-center justify-between gap-3 border-b pb-2 last:border-0 last:pb-0">
      <span className="text-foreground/60">{label}</span>
      <span className="text-accent text-right font-medium">{value}</span>
    </div>
  )
}

function parseIssueDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return undefined

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }

  return date
}

function formatIssueDate(value: string) {
  const date = parseIssueDate(value)
  if (!date) return undefined

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${day}/${month}/${date.getFullYear()}`
}

function toIssueDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatMediaSize(sizeInKb: number) {
  return sizeInKb >= 1024
    ? `${(sizeInKb / 1024).toFixed(1)} MB`
    : `${sizeInKb} KB`
}

function toNullableText(value: string) {
  return value.trim() || null
}

function formatMetaDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export { ArticleForm }
