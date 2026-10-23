import { usePermissions } from '@/module/auth/hooks/use-permissions'
import { saveHomeContent } from '@/module/home/api/home.api'
import type {
  HomeContentRecord,
  HomeContentWriteItem,
} from '@/module/home/api/home.api'
import { HomePreviewDialog } from '@/module/home/components/home-preview-dialog'
import { SortableSlideCard } from '@/module/home/components/sortable-slide-card'
import { SortableStatisticRow } from '@/module/home/components/sortable-statistic-row'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import {
  homeContentQueryKeys,
  homeContentQueryOptions,
} from '@/module/home/queries/home.queries'
import type {
  HomeDraft,
  HomeSlideDraft,
  HomeStatisticDraft,
} from '@/module/home/types/home.types'
import type { Language } from '@/module/language/api/language.api'
import { LanguageSelect } from '@/module/language/components/language-select'
import { findDefaultLanguage } from '@/module/language/constants/language.constants'
import { languagesQueryOptions } from '@/module/language/queries/language.queries'
import { MediaPickerDialog } from '@/module/media/components/media-picker-dialog'
import type { Media } from '@/module/media/api/media.api'
import { mediaQueryOptions } from '@/module/media/queries/media.queries'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Textarea } from '@/shared/components/ui/textarea'
import { toast } from '@/shared/lib/toast'
import { DragDropProvider } from '@dnd-kit/react'
import type { DragEndEvent } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useBlocker, useNavigate, useSearch } from '@tanstack/react-router'
import { CheckIcon, InfoIcon, LoaderCircleIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const pictureMediaParams = {
  type: 'PICTURE',
  sort_by: 'created_at',
  sort_order: 'desc',
} as const

const emptyHomeDraft: HomeDraft = {
  slides: [],
  statistics: [],
  teaserTitle: '',
  ctaTitle: '',
  teaserContent: '',
}

function HomePage() {
  const { t } = useI18n()
  const { lang } = useSearch({ from: '/_authenticated/home' })
  const navigate = useNavigate({ from: '/home' })
  const languagesQuery = useQuery(languagesQueryOptions())
  const languages = languagesQuery.data ?? []
  const urlLanguage = languages.find((item) => item.id === lang)
  const language = urlLanguage ?? findDefaultLanguage(languages)

  useEffect(() => {
    if (urlLanguage || !language) return

    void navigate({ search: { lang: language.id }, replace: true })
  }, [language, navigate, urlLanguage])

  if (languagesQuery.isPending) {
    return <HomePageMessage message={t.home.loading} />
  }
  if (languagesQuery.isError) {
    return (
      <HomePageMessage
        message={t.home.languagesFailed}
        onRetry={() => void languagesQuery.refetch()}
      />
    )
  }
  if (!language) {
    return <HomePageMessage message={t.home.noLanguages} />
  }

  return (
    <HomeEditor
      // Remount per language: switching discards every unsaved edit.
      key={language.id}
      languages={languages}
      languageId={language.id}
      onLanguageChange={(id) =>
        // The editor already confirmed discarding changes.
        void navigate({ search: { lang: id }, ignoreBlocker: true })
      }
    />
  )
}

function HomeEditor({
  languages,
  languageId,
  onLanguageChange,
}: {
  languages: Language[]
  languageId: string
  onLanguageChange: (languageId: string) => void
}) {
  const { t } = useI18n()
  const { canWrite } = usePermissions()
  const queryClient = useQueryClient()
  const homeQuery = useQuery(homeContentQueryOptions(languageId))
  const mediaQuery = useQuery(mediaQueryOptions(pictureMediaParams))
  const [draft, setDraft] = useState<HomeDraft | null>(null)
  const [savedDraft, setSavedDraft] = useState<HomeDraft | null>(null)
  const [photoPickerKey, setPhotoPickerKey] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const apiDraft = useMemo(
    () => (homeQuery.data ? mapHomeContents(homeQuery.data) : null),
    [homeQuery.data],
  )
  const editorDraft = draft ?? apiDraft
  const baselineDraft = savedDraft ?? apiDraft
  const mediaByPath = useMemo(
    () => new Map((mediaQuery.data ?? []).map((media) => [media.path, media])),
    [mediaQuery.data],
  )
  const selectedSlide = editorDraft?.slides.find(
    (slide) => slide.clientKey === photoPickerKey,
  )
  const isDirty = Boolean(
    editorDraft &&
    baselineDraft &&
    JSON.stringify(buildHomeContentPayload(editorDraft)) !==
      JSON.stringify(buildHomeContentPayload(baselineDraft)),
  )

  // Native prompts: confirm for in-app navigation, beforeunload for refresh/close.
  useBlocker({
    shouldBlockFn: () =>
      isDirty && !window.confirm(t.home.discardChangesConfirm),
    enableBeforeUnload: () => isDirty,
  })

  function requestLanguage(id: string) {
    if (id === languageId) return
    if (isDirty && !window.confirm(t.home.discardChangesConfirm)) return

    onLanguageChange(id)
  }

  const saveMutation = useMutation({
    mutationFn: saveHomeContent,
    onSuccess: (contents) => {
      queryClient.setQueryData(homeContentQueryKeys.page(languageId), contents)
      setSavedDraft(mapHomeContents(contents))
      toast.add({
        title: t.common.success,
        description: t.home.saveSuccess,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description: error instanceof Error ? error.message : t.home.saveFailed,
        type: 'error',
      })
    },
  })

  function updateDraft(updater: (current: HomeDraft) => HomeDraft) {
    setDraft((current) => updater(current ?? apiDraft ?? emptyHomeDraft))
  }

  function changeSlide(
    clientKey: string,
    field: 'title1' | 'title2' | 'subtitle',
    value: string,
  ) {
    updateDraft((current) => ({
      ...current,
      slides: current.slides.map((slide) =>
        slide.clientKey === clientKey ? { ...slide, [field]: value } : slide,
      ),
    }))
  }

  function changeSlideMedia(clientKey: string, media: Media) {
    updateDraft((current) => ({
      ...current,
      slides: current.slides.map((slide) =>
        slide.clientKey === clientKey
          ? { ...slide, mediaFilepath: media.path }
          : slide,
      ),
    }))
  }

  function changeStatistic(
    clientKey: string,
    field: 'label' | 'number' | 'description',
    value: string,
  ) {
    updateDraft((current) => ({
      ...current,
      statistics: current.statistics.map((statistic) =>
        statistic.clientKey === clientKey
          ? { ...statistic, [field]: value }
          : statistic,
      ),
    }))
  }

  function moveItems<T>(items: T[], fromIndex: number, toIndex: number) {
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= items.length ||
      toIndex >= items.length ||
      fromIndex === toIndex
    ) {
      return items
    }

    const nextItems = [...items]
    const [item] = nextItems.splice(fromIndex, 1)
    nextItems.splice(toIndex, 0, item)
    return nextItems
  }

  function moveSlides(fromIndex: number, toIndex: number) {
    updateDraft((current) => ({
      ...current,
      slides: moveItems(current.slides, fromIndex, toIndex),
    }))
  }

  function moveStatistics(fromIndex: number, toIndex: number) {
    updateDraft((current) => ({
      ...current,
      statistics: moveItems(current.statistics, fromIndex, toIndex),
    }))
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) return

    const { source, target } = event.operation
    if (!source || !target || !isSortable(source) || !isSortable(target)) return
    if (source.initialGroup !== target.group) return

    if (source.initialGroup === 'home-carousel') {
      moveSlides(source.initialIndex, target.index)
    } else if (source.initialGroup === 'home-statistics') {
      moveStatistics(source.initialIndex, target.index)
    }
  }

  function addSlide() {
    updateDraft((current) => ({
      ...current,
      slides: [
        ...current.slides,
        {
          clientKey: createClientKey('slide'),
          title1: '',
          title2: '',
          subtitle: '',
          mediaFilepath: null,
        },
      ],
    }))
  }

  function deleteSlide(clientKey: string) {
    updateDraft((current) => ({
      ...current,
      slides: current.slides.filter((slide) => slide.clientKey !== clientKey),
    }))
    setPhotoPickerKey((current) => (current === clientKey ? null : current))
  }

  function addStatistic() {
    updateDraft((current) => ({
      ...current,
      statistics: [
        ...current.statistics,
        {
          clientKey: createClientKey('statistic'),
          label: '',
          number: '',
          description: '',
        },
      ],
    }))
  }

  function duplicateStatistic(clientKey: string) {
    updateDraft((current) => {
      const index = current.statistics.findIndex(
        (statistic) => statistic.clientKey === clientKey,
      )
      if (index < 0) return current

      const copy = {
        ...current.statistics[index],
        clientKey: createClientKey('statistic'),
      }
      const statistics = [...current.statistics]
      statistics.splice(index + 1, 0, copy)
      return { ...current, statistics }
    })
  }

  function deleteStatistic(clientKey: string) {
    updateDraft((current) => ({
      ...current,
      statistics: current.statistics.filter(
        (statistic) => statistic.clientKey !== clientKey,
      ),
    }))
  }

  function changeTeaser(
    field: 'teaserTitle' | 'ctaTitle' | 'teaserContent',
    value: string,
  ) {
    updateDraft((current) => ({ ...current, [field]: value }))
  }

  function saveDraft() {
    if (!editorDraft || !isDirty || saveMutation.isPending) return
    saveMutation.mutate({
      languageId,
      items: buildHomeContentPayload(editorDraft),
    })
  }

  if (homeQuery.isError && !homeQuery.data) {
    return (
      <HomePageMessage
        message={
          homeQuery.error instanceof Error
            ? homeQuery.error.message
            : t.home.loadFailed
        }
        onRetry={() => void homeQuery.refetch()}
      />
    )
  }

  if (homeQuery.isPending || !editorDraft || !baselineDraft) {
    return <HomePageMessage message={t.home.loading} />
  }

  const canDeleteSlide =
    editorDraft.slides.length > 1 || baselineDraft.slides.length === 0
  const canDeleteStatistic =
    editorDraft.statistics.length > 1 || baselineDraft.statistics.length === 0

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="bg-primary flex min-h-full flex-col gap-4 p-4 lg:gap-6 lg:p-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-accent text-2xl font-bold lg:text-3xl">
              {t.home.pageTitle}
            </h1>
            <p className="text-muted text-sm lg:text-base">
              {t.home.description}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
            >
              {t.home.preview}
            </Button>
            {canWrite && (
              <Button
                type="button"
                className="bg-success hover:bg-success/90"
                disabled={!isDirty || saveMutation.isPending}
                onClick={saveDraft}
              >
                {saveMutation.isPending ? (
                  <LoaderCircleIcon
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                ) : (
                  <CheckIcon aria-hidden="true" className="size-4" />
                )}
                {saveMutation.isPending ? t.home.saving : t.home.savePublish}
              </Button>
            )}
          </div>
        </header>

        {/* Controlled by the URL: a cancelled discard keeps the current language. */}
        <LanguageSelect
          label={t.home.language}
          languages={languages}
          value={languageId}
          onChange={requestLanguage}
        />
        {/* Read-only without write permission. */}
        <fieldset disabled={!canWrite} className="contents">
          <Card aria-labelledby="home-carousel-title">
            <CardHeader>
              <CardTitle
                id="home-carousel-title"
                className="text-base font-bold"
              >
                {t.home.carousel}
              </CardTitle>
              <span className="text-muted text-xs">
                {t.home.slideCount(editorDraft.slides.length)}
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="bg-secondary/10 text-accent border-secondary/20 flex items-start gap-2 rounded-lg border p-3 text-xs">
                <InfoIcon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
                <p>{t.home.carouselHint}</p>
              </div>

              {editorDraft.slides.length === 0 ? (
                <p
                  role="status"
                  className="text-foreground/55 py-6 text-center text-sm"
                >
                  {t.home.emptySlides}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {editorDraft.slides.map((slide, index) => (
                    <SortableSlideCard
                      key={slide.clientKey}
                      slide={slide}
                      index={index}
                      total={editorDraft.slides.length}
                      media={
                        slide.mediaFilepath == null
                          ? undefined
                          : mediaByPath.get(slide.mediaFilepath)
                      }
                      mediaLoading={mediaQuery.isPending}
                      mediaFailed={mediaQuery.isError}
                      canDelete={canDeleteSlide}
                      onChange={changeSlide}
                      onMove={moveSlides}
                      onDelete={deleteSlide}
                      onChoosePhoto={setPhotoPickerKey}
                    />
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="bg-primary text-secondary hover:bg-primary/80 w-full border-dashed"
                onClick={addSlide}
              >
                {t.home.addSlide}
              </Button>
            </CardContent>
          </Card>

          <Card aria-labelledby="home-statistics-title">
            <CardHeader>
              <CardTitle
                id="home-statistics-title"
                className="text-base font-bold"
              >
                {t.home.statistics}
              </CardTitle>
              <span className="text-muted text-xs">
                {t.home.statisticCount(editorDraft.statistics.length)}
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              {editorDraft.statistics.length === 0 ? (
                <p
                  role="status"
                  className="text-foreground/55 py-6 text-center text-sm"
                >
                  {t.home.emptyStatistics}
                </p>
              ) : (
                <div className="border-border overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader className="bg-primary">
                      <TableRow className="border-b-0 hover:bg-transparent">
                        <TableHead className="w-12 px-2" />
                        <StatisticHead>{t.home.statisticLabel}</StatisticHead>
                        <StatisticHead>{t.home.statisticNumber}</StatisticHead>
                        <StatisticHead>
                          {t.home.statisticDescription}
                        </StatisticHead>
                        <TableHead>
                          <span className="sr-only">{t.home.actions}</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editorDraft.statistics.map((statistic, index) => (
                        <SortableStatisticRow
                          key={statistic.clientKey}
                          statistic={statistic}
                          index={index}
                          total={editorDraft.statistics.length}
                          canDelete={canDeleteStatistic}
                          onChange={changeStatistic}
                          onMove={moveStatistics}
                          onDuplicate={duplicateStatistic}
                          onDelete={deleteStatistic}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="bg-primary text-secondary hover:bg-primary/80 w-full border-dashed"
                onClick={addStatistic}
              >
                {t.home.addStatistic}
              </Button>
            </CardContent>
          </Card>

          <Card aria-labelledby="home-teaser-title">
            <CardHeader>
              <CardTitle id="home-teaser-title" className="text-base font-bold">
                {t.home.teaser}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <HomeTextField
                    id="home-teaser-heading"
                    label={t.home.teaserTitle}
                    value={editorDraft.teaserTitle}
                    onChange={(value) => changeTeaser('teaserTitle', value)}
                  />
                  <HomeTextField
                    id="home-teaser-cta"
                    label={t.home.ctaTitle}
                    value={editorDraft.ctaTitle}
                    onChange={(value) => changeTeaser('ctaTitle', value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="home-teaser-content">
                    {t.home.teaserContent}
                  </Label>
                  <Textarea
                    id="home-teaser-content"
                    value={editorDraft.teaserContent}
                    onChange={(event) =>
                      changeTeaser('teaserContent', event.currentTarget.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedSlide && (
            <MediaPickerDialog
              key={`${selectedSlide.clientKey}-${selectedSlide.mediaFilepath ?? 'none'}`}
              open
              onOpenChange={(open) => {
                if (!open) setPhotoPickerKey(null)
              }}
              selectedMediaId={
                selectedSlide.mediaFilepath == null
                  ? undefined
                  : mediaByPath.get(selectedSlide.mediaFilepath)?.id
              }
              onSelect={(media) =>
                changeSlideMedia(selectedSlide.clientKey, media)
              }
            />
          )}
        </fieldset>
        {previewOpen && (
          <HomePreviewDialog
            onOpenChange={setPreviewOpen}
            draft={editorDraft}
            languageId={languageId}
          />
        )}
      </div>
    </DragDropProvider>
  )
}

function HomeTextField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </div>
  )
}

function StatisticHead({ children }: { children: string }) {
  return (
    <TableHead className="text-muted font-bold uppercase">{children}</TableHead>
  )
}

function HomePageMessage({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="bg-primary flex min-h-full items-center justify-center p-4 lg:p-8">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <p
            role={onRetry ? 'alert' : 'status'}
            className="text-foreground/70 text-sm"
          >
            {message}
          </p>
          {onRetry && (
            <Button type="button" variant="outline" onClick={onRetry}>
              {t.common.retry}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function mapHomeContents(contents: HomeContentRecord[]): HomeDraft {
  const slides = contents
    .filter(
      (content) =>
        content.block_key === 'hero-carousel' &&
        content.block_type === 'carousel-slide',
    )
    .sort((first, second) => first.sort_order - second.sort_order)
    .map<HomeSlideDraft>((content) => ({
      clientKey: `slide-${content.id}`,
      title1: content.data?.title_1 ?? '',
      title2: content.data?.title_2 ?? '',
      subtitle: content.data?.subtitle ?? '',
      mediaFilepath: content.data?.media_filepath ?? null,
    }))

  const statistics = contents
    .filter(
      (content) =>
        content.block_key === 'statistic' &&
        content.block_type === 'statistic-item',
    )
    .sort((first, second) => first.sort_order - second.sort_order)
    .map<HomeStatisticDraft>((content) => ({
      clientKey: `statistic-${content.id}`,
      label: content.data?.label ?? '',
      number: content.data?.number ?? '',
      description: content.data?.description ?? '',
    }))

  const teaserTitle = contents.find(
    (content) =>
      content.block_key === 'teaser' && content.block_type === 'teaser-title',
  )
  const ctaTitle = contents.find(
    (content) =>
      content.block_key === 'teaser' && content.block_type === 'cta-title',
  )
  const teaserContent = contents.find(
    (content) =>
      content.block_key === 'teaser' && content.block_type === 'teaser-content',
  )

  return {
    ...emptyHomeDraft,
    slides,
    statistics,
    teaserTitle: teaserTitle?.data?.title ?? '',
    ctaTitle: ctaTitle?.data?.title ?? '',
    teaserContent: teaserContent?.data?.content ?? '',
  }
}

function buildHomeContentPayload(draft: HomeDraft): HomeContentWriteItem[] {
  const items: HomeContentWriteItem[] = []

  draft.slides.forEach((slide, index) => {
    items.push({
      page: 'home',
      block_key: 'hero-carousel',
      block_type: 'carousel-slide',
      sort_order: index + 1,
      data: {
        title_1: slide.title1,
        title_2: slide.title2,
        subtitle: slide.subtitle,
        media_filepath: slide.mediaFilepath,
      },
    })
  })

  draft.statistics.forEach((statistic, index) => {
    items.push({
      page: 'home',
      block_key: 'statistic',
      block_type: 'statistic-item',
      sort_order: index + 1,
      data: {
        label: statistic.label,
        number: statistic.number,
        description: statistic.description,
      },
    })
  })

  items.push(
    {
      page: 'home',
      block_key: 'teaser',
      block_type: 'teaser-title',
      data: { title: draft.teaserTitle },
    },
    {
      page: 'home',
      block_key: 'teaser',
      block_type: 'cta-title',
      data: { title: draft.ctaTitle },
    },
    {
      page: 'home',
      block_key: 'teaser',
      block_type: 'teaser-content',
      data: { content: draft.teaserContent },
    },
  )

  return items
}

function createClientKey(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export { HomePage }
