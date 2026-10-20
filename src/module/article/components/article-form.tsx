import { useI18n, type Locale } from '@/shared/lib/i18n/i18n-context'
import { usePermissions } from '@/module/auth/hooks/use-permissions'
import type {
  Article,
  ArticleStatus,
  ArticleWriteFields,
} from '@/module/article/api/article.api'
import { createArticle, updateArticle } from '@/module/article/api/article.api'
import { ArticleStatusPill } from '@/module/article/components/article-language-pills'
import { ArticlePreviewDialog } from '@/module/article/components/article-preview-dialog'
import { ArticleRichTextEditor } from '@/module/article/components/article-rich-text-editor'
import type { Dictionary } from '@/shared/lib/i18n/id'
import type { Language } from '@/module/language/api/language.api'
import { DEFAULT_LANGUAGE_ID } from '@/module/language/constants/language.constants'
import { getMediaAssetUrl } from '@/module/media/api/media.api'
import { formatRelativeTime } from '@/module/user/constants/user.constants'
import type { Media } from '@/module/media/api/media.api'
import { MediaPickerDialog } from '@/module/media/components/media-picker-dialog'
import {
  articleCategoriesQueryOptions,
  articleQueryKeys,
} from '@/module/article/queries/article.queries'
import type { ArticleFormValues } from '@/module/article/schemas/article-form.schema'
import { createArticleFormSchema } from '@/module/article/schemas/article-form.schema'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Calendar } from '@/shared/components/ui/calendar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
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
import { Link, useBlocker, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckIcon,
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
  languages: Language[]
  languageId: string
  onLanguageChange: (languageId: string) => void
}

type TranslationStatus = ArticleStatus | 'UNSAVED' | 'MISSING'

function ArticleForm({
  mode,
  article,
  languages,
  languageId,
  onLanguageChange,
}: ArticleFormProps) {
  const { locale, t } = useI18n()
  const isEditing = mode === 'edit'
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canWrite, canPublish } = usePermissions()
  const categoriesQuery = useQuery(articleCategoriesQueryOptions())
  const [previewOpen, setPreviewOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false)
  const [addedLanguageIds, setAddedLanguageIds] = useState<string[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Media>()
  const [photoError, setPhotoError] = useState<string>()
  const [defaultValues] = useState(() => savedValues(article, languageId))
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
    resolver: zodResolver(createArticleFormSchema(t)),
    defaultValues,
  })

  const titleValue = useWatch({ control, name: 'title' })
  const slugValue = useWatch({ control, name: 'slug' })
  const contentValue = useWatch({ control, name: 'content' })
  const categoryId = useWatch({ control, name: 'article_category_id' })
  const issueDateValue = useWatch({ control, name: 'issue_date' })
  const cpNameValue = useWatch({ control, name: 'cp_name' })
  const currentLanguage =
    languages.find((item) => item.id === languageId) ?? languages[0]
  const hasUnsavedChanges =
    isDirty ||
    (selectedPhoto !== undefined && selectedPhoto.id !== article?.primary_photo)

  // Native prompts: confirm for in-app navigation, beforeunload for refresh/close.
  useBlocker({
    shouldBlockFn: () =>
      hasUnsavedChanges && !window.confirm(t.article.discardChangesConfirm),
    enableBeforeUnload: () => hasUnsavedChanges,
  })

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
      languageId,
    }: {
      values: ArticleFormValues
      status: ArticleStatus
      primaryPhotoId: number
      languageId: string
    }) => {
      const fields: ArticleWriteFields = {
        ...values,
        language_id: languageId,
        issue_date: toNullableText(values.issue_date),
        press_release_number: toNullableText(values.press_release_number),
        cp_name: toNullableText(values.cp_name),
        cp_role: toNullableText(values.cp_role),
        cp_phone_number: toNullableText(values.cp_phone_number),
        cp_email: toNullableText(values.cp_email),
        primary_photo: primaryPhotoId,
        status,
      }

      if (isEditing && article) {
        return updateArticle(article.id, fields)
      }

      return createArticle(fields)
    },
    onSuccess: async (
      savedArticle,
      { values, languageId: savedLanguageId },
    ) => {
      // The response holds every language's content, so switching reads fresh data.
      queryClient.setQueryData(
        articleQueryKeys.detail(savedArticle.id),
        savedArticle,
      )
      reset(values)
      await queryClient.invalidateQueries({
        queryKey: articleQueryKeys.lists(),
      })
      toast.add({
        title: t.common.success,
        description: t.article.articleSaved,
        type: 'success',
      })

      if (!isEditing) {
        await navigate({
          to: '/articles/$articleId/edit',
          params: { articleId: String(savedArticle.id) },
          search: {
            lang: savedLanguageId,
          },
          replace: true,
          // Just reset; the blocker may still read the stale dirty state.
          ignoreBlocker: true,
        })
      }
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : t.article.articleSaveFailed

      if (error instanceof ApiError && error.status === 409) {
        setError('slug', { message })
      }

      toast.add({
        title: t.common.error,
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

  function requestLanguage(id: string) {
    if (id === languageId) return
    if (hasUnsavedChanges && !window.confirm(t.article.discardChangesConfirm)) {
      return
    }

    onLanguageChange(id)
  }

  // Other languages need a saved (draft or published) Bahasa Indonesia version first.
  function addLanguage(id: string) {
    if (!findContent(article, DEFAULT_LANGUAGE_ID)) {
      toast.add({
        title: t.common.error,
        description: t.article.defaultLanguageRequired,
        type: 'error',
      })
      return
    }

    setAddedLanguageIds((ids) => [...ids, id])
  }

  function translationStatus(id: string): TranslationStatus {
    const content = findContent(article, id)
    if (content) return content.status
    if (id === languageId || addedLanguageIds.includes(id)) return 'UNSAVED'
    return 'MISSING'
  }

  function submitArticle(status: ArticleStatus) {
    return handleSubmit(
      (values) => {
        const primaryPhotoId = selectedPhoto?.id ?? article?.primary_photo
        if (primaryPhotoId == null) {
          setPhotoError(t.article.photoRequired)
          return
        }

        articleMutation.mutate({ values, status, primaryPhotoId, languageId })
      },
      () => {
        if ((selectedPhoto?.id ?? article?.primary_photo) == null) {
          setPhotoError(t.article.photoRequired)
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
  const currentStatus = translationStatus(languageId)

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
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-2">
            <Button
              asChild
              variant="link"
              className="text-secondary h-auto self-start px-0"
            >
              <Link to="/articles">
                <ArrowLeftIcon aria-hidden="true" className="size-4" />
                {t.article.backToArticles}
              </Link>
            </Button>
            <div className="flex flex-col gap-1">
              <h1 className="text-accent text-2xl font-bold lg:text-3xl">
                {isEditing
                  ? t.article.editPageTitle
                  : t.article.createPageTitle}
              </h1>
              {article?.updated_at && (
                <p className="text-muted text-sm">
                  {t.article.lastSaved(
                    formatRelativeTime(article.updated_at, locale),
                    article.updated_by,
                  )}
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
              {t.article.preview}
            </Button>
            {!canPublish && canWrite && (
              <p className="text-muted w-full text-xs lg:w-auto">
                {t.auth.draftOnly}
              </p>
            )}
            {canWrite && (
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
                {t.article.saveDraft}
              </Button>
            )}
            {canPublish && (
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
                ) : (
                  <CheckIcon aria-hidden="true" className="size-4" />
                )}
                {t.article.publishArticle}
              </Button>
            )}
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">
                  {t.article.mainContent}
                </CardTitle>
                <Badge className="bg-secondary/10 text-accent border-transparent px-3 py-1 font-semibold">
                  {currentLanguage.language}
                </Badge>
              </CardHeader>
              {/* Remount per language so the editor loads that language's content. */}
              <CardContent>
                <FormField
                  id="article-title"
                  label={t.article.titleField}
                  required
                  error={errors.title?.message}
                  hint={
                    <span
                      className={
                        titleValue.length >= 120 ? 'text-danger' : undefined
                      }
                    >
                      {t.article.titleHint(titleValue.length)}
                    </span>
                  }
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
                  label={t.article.slugField}
                  required
                  error={errors.slug?.message}
                  hint={
                    <>
                      {t.article.slugHint}
                      <strong className="font-semibold">
                        {slugValue || 'slug'}
                      </strong>
                    </>
                  }
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
                  label={t.article.summaryField}
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
                  label={t.article.bodyField}
                  required
                  error={errors.content?.message}
                >
                  <div
                    className="border-border overflow-hidden rounded-lg border"
                    aria-invalid={Boolean(errors.content)}
                  >
                    <ArticleRichTextEditor
                      id="article-content"
                      ariaLabel={t.article.bodyField}
                      content={getValues('content')}
                      onChange={handleContentChange}
                    />
                  </div>
                </FormField>

                <FormField
                  id="article-press-release-number"
                  label={t.article.pressReleaseNumberField}
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
                <CardTitle className="text-base font-bold">
                  {t.article.contactSection}
                </CardTitle>
                <span className="text-muted text-sm">Komponen</span>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-5 lg:flex-row">
                  <FormField
                    id="article-contact-name"
                    label={t.article.contactNameField}
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
                    label={t.article.contactRoleField}
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
                    label={t.article.contactPhoneField}
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
                    label={t.article.contactEmailField}
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
                <h2 className="text-muted text-xs font-semibold tracking-wide uppercase">
                  {t.article.publicationStatus}
                </h2>
                <div className="border-border flex items-center justify-between border-b pb-3 text-sm">
                  <span className="text-muted">Status</span>
                  {currentStatus === 'PUBLISHED' ||
                  currentStatus === 'DRAFT' ? (
                    <ArticleStatusPill status={currentStatus} />
                  ) : (
                    <span className={TRANSLATION_STATUS_TONES[currentStatus]}>
                      {t.article[TRANSLATION_STATUS_KEYS[currentStatus]]}
                    </span>
                  )}
                </div>
                {article && (
                  <div className="flex flex-col gap-3 text-sm">
                    <MetaRow
                      label={t.article.createdAt}
                      value={formatMetaDate(article.created_at, locale, false)}
                    />
                    {article.updated_at && (
                      <MetaRow
                        label={t.article.updatedAt}
                        value={formatMetaDate(article.updated_at, locale)}
                      />
                    )}
                    <MetaRow
                      label={t.article.author}
                      value={article.updated_by ?? article.created_by}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-muted text-xs tracking-wide uppercase">
                  {t.article.primaryPhoto}
                  <span aria-hidden="true" className="text-danger">
                    {' '}
                    *
                  </span>
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
                      ? t.article.photoReplace
                      : t.article.photoSelect
                  }
                  required
                  error={photoError}
                  hint={t.article.photoHelp}
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
                      ? t.article.photoReplace
                      : t.article.photoSelect}
                  </Button>
                </FormField>
                {selectedPhoto && (
                  <div className="text-muted flex min-w-0 items-center gap-1 text-xs">
                    <span className="min-w-0 flex-1 truncate">
                      {selectedPhoto.filename}
                    </span>
                    {selectedPhoto.metadata && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="shrink-0">
                          {`${selectedPhoto.metadata.width}×${selectedPhoto.metadata.height}`}
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
                <CardTitle className="text-muted text-xs tracking-wide uppercase">
                  {t.article.articleGrouping}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <FormField
                  id="article-category"
                  label={t.article.category}
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
                            ? t.article.loadingCategories
                            : t.article.chooseCategory
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
                        {t.article.categoriesFailed}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void categoriesQuery.refetch()}
                      >
                        {t.common.retry}
                      </Button>
                    </div>
                  )}
                </FormField>

                <FormField
                  id="article-issue-date"
                  label={t.article.issueDateField}
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
                              className={field.value ? undefined : 'text-muted'}
                            >
                              {formatIssueDate(field.value) ??
                                t.article.chooseIssueDate}
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
                          <div className="border-border flex justify-end border-t p-2">
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
                              {t.article.clearIssueDate}
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
                <CardTitle className="text-muted text-xs tracking-wide uppercase">
                  {t.article.translation}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 space-y-0 p-4 text-sm">
                {languages.map((item) => (
                  <TranslationRow
                    key={item.id}
                    language={item}
                    status={translationStatus(item.id)}
                    current={item.id === languageId}
                    onOpen={() => requestLanguage(item.id)}
                    onAdd={() => addLanguage(item.id)}
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
        categoryName={
          categoriesQuery.data?.find((category) => category.id === categoryId)
            ?.name
        }
        issueDate={issueDateValue}
        author={cpNameValue.trim()}
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
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <Label htmlFor={id} className="text-accent">
        {label}
        {required && (
          <span aria-hidden="true" className="text-danger">
            {' '}
            *
          </span>
        )}
      </Label>
      {children}
      {error && (
        <p id={id + '-error'} role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-muted text-xs">{hint}</p>}
    </div>
  )
}

const TRANSLATION_STATUS_KEYS = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  UNSAVED: 'translationUnsaved',
  MISSING: 'translationMissing',
} as const satisfies Record<TranslationStatus, keyof Dictionary['article']>

const TRANSLATION_STATUS_TONES: Record<TranslationStatus, string> = {
  PUBLISHED: 'text-success',
  DRAFT: 'text-warning',
  UNSAVED: 'text-muted',
  MISSING: 'text-foreground/40',
}

function TranslationRow({
  language,
  status,
  current,
  onOpen,
  onAdd,
}: {
  language: Language
  status: TranslationStatus
  current: boolean
  onOpen: () => void
  onAdd: () => void
}) {
  const { t } = useI18n()
  const name = (
    <span className="flex items-center gap-2">
      <span aria-hidden="true">{language.flag}</span>
      {language.language}
    </span>
  )

  return (
    <div className="border-border flex items-center justify-between gap-3 border-b pb-2 last:border-0 last:pb-0">
      {status === 'MISSING' ? (
        <>
          <span className={TRANSLATION_STATUS_TONES.MISSING}>{name}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t.article.addTranslation(language.language)}
            onClick={onAdd}
            className="size-6"
          >
            <PlusIcon aria-hidden="true" className="size-3.5" />
          </Button>
        </>
      ) : (
        <button
          type="button"
          aria-current={current || undefined}
          aria-label={t.article.openTranslation(language.language)}
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
        >
          <span
            className={current ? 'text-accent font-semibold' : 'text-muted'}
          >
            {name}
          </span>
          <span className={cn('font-medium', TRANSLATION_STATUS_TONES[status])}>
            {t.article[TRANSLATION_STATUS_KEYS[status]]}
          </span>
        </button>
      )}
    </div>
  )
}

function findContent(article: Article | undefined, languageId: string) {
  return article?.contents.find((item) => item.language_id === languageId)
}

function savedValues(
  article: Article | undefined,
  languageId: string,
): ArticleFormValues {
  const content = findContent(article, languageId)

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
    <div className="border-border flex items-center justify-between gap-3 border-b pb-2 last:border-0 last:pb-0">
      <span className="text-muted">{label}</span>
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

function formatMetaDate(value: string, locale: Locale, withTime = true) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' } : {}),
  }).format(date)
}

export { ArticleForm }
