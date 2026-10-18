import { saveAboutUsContent } from '@/module/about-us/api/about-us.api'
import type {
  AboutUsContentRecord,
  AboutUsContentWriteItem,
} from '@/module/about-us/api/about-us.api'
import { SortableAboutUsItem } from '@/module/about-us/components/sortable-about-us-item'
import { ABOUT_US_LABELS } from '@/module/about-us/constants/about-us.constants'
import {
  aboutUsContentQueryKeys,
  aboutUsContentQueryOptions,
} from '@/module/about-us/queries/about-us.queries'
import type {
  AboutUsDraft,
  AboutUsMissionDraft,
  AboutUsTimelineDraft,
} from '@/module/about-us/types/about-us.types'
import { ArticleRichTextEditor } from '@/module/article/components/article-rich-text-editor'
import type { Language } from '@/module/language/api/language.api'
import { LanguageSelect } from '@/module/language/components/language-select'
import { findDefaultLanguage } from '@/module/language/constants/language.constants'
import { languagesQueryOptions } from '@/module/language/queries/language.queries'
import { getMediaAssetUrl } from '@/module/media/api/media.api'
import type { Media } from '@/module/media/api/media.api'
import { MediaPickerDialog } from '@/module/media/components/media-picker-dialog'
import { mediaQueryOptions } from '@/module/media/queries/media.queries'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { toast } from '@/shared/lib/toast'
import { DragDropProvider } from '@dnd-kit/react'
import type { DragEndEvent } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useBlocker, useNavigate, useSearch } from '@tanstack/react-router'
import { CheckIcon, ImageIcon, LoaderCircleIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const pictureMediaParams = {
  type: 'PICTURE',
  sort_by: 'created_at',
  sort_order: 'desc',
} as const

const emptyAboutUsDraft: AboutUsDraft = {
  profileContent: '',
  companyPictureFilepath: null,
  vision: '',
  missions: [],
  timeline: [],
}

type ItemDialogKind = 'mission' | 'timeline'

interface ItemDialogState {
  kind: ItemDialogKind
  clientKey?: string
}

interface ItemDialogValue {
  primary: string
  // Timeline entries only.
  title?: string
  description: string
}

function AboutUsPage() {
  const { lang } = useSearch({ from: '/_authenticated/about-us' })
  const navigate = useNavigate({ from: '/about-us' })
  const languagesQuery = useQuery(languagesQueryOptions())
  const languages = languagesQuery.data ?? []
  const urlLanguage = languages.find((item) => item.id === lang)
  const language = urlLanguage ?? findDefaultLanguage(languages)

  useEffect(() => {
    if (urlLanguage || !language) return

    void navigate({ search: { lang: language.id }, replace: true })
  }, [language, navigate, urlLanguage])

  if (languagesQuery.isPending) {
    return <AboutUsPageMessage message={ABOUT_US_LABELS.loading} />
  }
  if (languagesQuery.isError) {
    return (
      <AboutUsPageMessage
        message={ABOUT_US_LABELS.languagesFailed}
        onRetry={() => void languagesQuery.refetch()}
      />
    )
  }
  if (!language) {
    return <AboutUsPageMessage message={ABOUT_US_LABELS.noLanguages} />
  }

  return (
    <AboutUsEditor
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

function AboutUsEditor({
  languages,
  languageId,
  onLanguageChange,
}: {
  languages: Language[]
  languageId: string
  onLanguageChange: (languageId: string) => void
}) {
  const queryClient = useQueryClient()
  const aboutUsQuery = useQuery(aboutUsContentQueryOptions(languageId))
  const mediaQuery = useQuery(mediaQueryOptions(pictureMediaParams))
  const [draft, setDraft] = useState<AboutUsDraft | null>(null)
  const [savedDraft, setSavedDraft] = useState<AboutUsDraft | null>(null)
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false)
  const [itemDialog, setItemDialog] = useState<ItemDialogState | null>(null)

  const apiDraft = useMemo(
    () => (aboutUsQuery.data ? mapAboutUsContents(aboutUsQuery.data) : null),
    [aboutUsQuery.data],
  )
  const editorDraft = draft ?? apiDraft
  const baselineDraft = savedDraft ?? apiDraft
  const mediaByPath = useMemo(
    () => new Map((mediaQuery.data ?? []).map((media) => [media.path, media])),
    [mediaQuery.data],
  )
  const selectedPhoto = editorDraft?.companyPictureFilepath
    ? mediaByPath.get(editorDraft.companyPictureFilepath)
    : undefined
  const isDirty = Boolean(
    editorDraft &&
    baselineDraft &&
    JSON.stringify(buildAboutUsContentPayload(editorDraft)) !==
      JSON.stringify(buildAboutUsContentPayload(baselineDraft)),
  )

  // Native prompts: confirm for in-app navigation, beforeunload for refresh/close.
  useBlocker({
    shouldBlockFn: () =>
      isDirty && !window.confirm(ABOUT_US_LABELS.discardChangesConfirm),
    enableBeforeUnload: () => isDirty,
  })

  function requestLanguage(id: string) {
    if (id === languageId) return
    if (isDirty && !window.confirm(ABOUT_US_LABELS.discardChangesConfirm)) {
      return
    }

    onLanguageChange(id)
  }

  const saveMutation = useMutation({
    mutationFn: saveAboutUsContent,
    onSuccess: (contents) => {
      queryClient.setQueryData(
        aboutUsContentQueryKeys.page(languageId),
        contents,
      )
      setSavedDraft(mapAboutUsContents(contents))
      toast.add({
        title: 'Berhasil',
        description: ABOUT_US_LABELS.saveSuccess,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error ? error.message : ABOUT_US_LABELS.saveFailed,
        type: 'error',
      })
    },
  })

  function updateDraft(updater: (current: AboutUsDraft) => AboutUsDraft) {
    setDraft((current) => updater(current ?? apiDraft ?? emptyAboutUsDraft))
  }

  function changeProfileContent(profileContent: string) {
    updateDraft((current) => ({ ...current, profileContent }))
  }

  function changeVision(vision: string) {
    updateDraft((current) => ({ ...current, vision }))
  }

  function changeCompanyPhoto(media: Media) {
    updateDraft((current) => ({
      ...current,
      companyPictureFilepath: media.path,
    }))
  }

  function openAddDialog(kind: ItemDialogKind) {
    setItemDialog({ kind })
  }

  function openEditDialog(kind: ItemDialogKind, clientKey: string) {
    setItemDialog({ kind, clientKey })
  }

  function saveItem(value: ItemDialogValue) {
    if (!itemDialog) return

    if (itemDialog.kind === 'mission') {
      const clientKey = itemDialog.clientKey ?? createClientKey('mission')
      updateDraft((current) => ({
        ...current,
        missions: itemDialog.clientKey
          ? current.missions.map((mission) =>
              mission.clientKey === clientKey
                ? {
                    ...mission,
                    title: value.primary,
                    description: value.description,
                  }
                : mission,
            )
          : [
              ...current.missions,
              {
                clientKey,
                title: value.primary,
                description: value.description,
              },
            ],
      }))
    } else {
      const clientKey = itemDialog.clientKey ?? createClientKey('timeline')
      updateDraft((current) => ({
        ...current,
        timeline: itemDialog.clientKey
          ? current.timeline.map((entry) =>
              entry.clientKey === clientKey
                ? {
                    ...entry,
                    period: value.primary,
                    title: value.title ?? '',
                    description: value.description,
                  }
                : entry,
            )
          : [
              ...current.timeline,
              {
                clientKey,
                period: value.primary,
                title: value.title ?? '',
                description: value.description,
              },
            ],
      }))
    }

    setItemDialog(null)
  }

  function deleteMission(clientKey: string) {
    updateDraft((current) => ({
      ...current,
      missions: current.missions.filter(
        (mission) => mission.clientKey !== clientKey,
      ),
    }))
  }

  function deleteTimeline(clientKey: string) {
    updateDraft((current) => ({
      ...current,
      timeline: current.timeline.filter(
        (entry) => entry.clientKey !== clientKey,
      ),
    }))
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) return

    const { source, target } = event.operation
    if (!source || !target || !isSortable(source) || !isSortable(target)) return
    if (source.initialGroup !== target.group) return

    if (source.initialGroup === 'about-us-missions') {
      updateDraft((current) => ({
        ...current,
        missions: moveItems(
          current.missions,
          source.initialIndex,
          target.index,
        ),
      }))
    } else if (source.initialGroup === 'about-us-timeline') {
      updateDraft((current) => ({
        ...current,
        timeline: moveItems(
          current.timeline,
          source.initialIndex,
          target.index,
        ),
      }))
    }
  }

  function saveDraft() {
    if (!editorDraft || !isDirty || saveMutation.isPending) return
    saveMutation.mutate({
      languageId,
      items: buildAboutUsContentPayload(editorDraft),
    })
  }

  if (aboutUsQuery.isError && !aboutUsQuery.data) {
    return (
      <AboutUsPageMessage
        message={
          aboutUsQuery.error instanceof Error
            ? aboutUsQuery.error.message
            : ABOUT_US_LABELS.loadFailed
        }
        onRetry={() => void aboutUsQuery.refetch()}
      />
    )
  }

  if (aboutUsQuery.isPending || !editorDraft || !baselineDraft) {
    return <AboutUsPageMessage message={ABOUT_US_LABELS.loading} />
  }

  const canDeleteMission =
    editorDraft.missions.length > 1 || baselineDraft.missions.length === 0
  const canDeleteTimeline =
    editorDraft.timeline.length > 1 || baselineDraft.timeline.length === 0
  const dialogEntry = itemDialog?.clientKey
    ? itemDialog.kind === 'mission'
      ? editorDraft.missions.find(
          (mission) => mission.clientKey === itemDialog.clientKey,
        )
      : editorDraft.timeline.find(
          (entry) => entry.clientKey === itemDialog.clientKey,
        )
    : undefined
  const dialogInitialValue = dialogEntry
    ? itemDialog?.kind === 'mission'
      ? {
          primary: (dialogEntry as AboutUsMissionDraft).title,
          description: dialogEntry.description,
        }
      : {
          primary: (dialogEntry as AboutUsTimelineDraft).period,
          title: (dialogEntry as AboutUsTimelineDraft).title,
          description: dialogEntry.description,
        }
    : undefined

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="bg-primary flex min-h-full flex-col gap-4 p-4 lg:gap-6 lg:p-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-accent text-2xl font-bold lg:text-3xl">
              {ABOUT_US_LABELS.pageTitle}
            </h1>
            <p className="text-foreground/60 text-sm lg:text-base">
              {ABOUT_US_LABELS.description}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <Button
              type="button"
              variant="outline"
              disabled
              title={ABOUT_US_LABELS.previewDisabled}
            >
              {ABOUT_US_LABELS.preview}
            </Button>
            <Button
              type="button"
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
              {saveMutation.isPending
                ? ABOUT_US_LABELS.saving
                : ABOUT_US_LABELS.savePublish}
            </Button>
          </div>
        </header>

        {/* Controlled by the URL: a cancelled discard keeps the current language. */}
        <LanguageSelect
          label={ABOUT_US_LABELS.language}
          languages={languages}
          value={languageId}
          onChange={requestLanguage}
        />

        <Card aria-labelledby="about-us-profile-title">
          <CardHeader>
            <CardTitle id="about-us-profile-title" className="text-base">
              {ABOUT_US_LABELS.companyProfile}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="about-us-profile-content">
                {ABOUT_US_LABELS.profileContent}
                <span className="text-danger"> *</span>
              </Label>
              <div className="border-border/20 overflow-hidden rounded-lg border">
                <ArticleRichTextEditor
                  id="about-us-profile-content"
                  ariaLabel={ABOUT_US_LABELS.profileContent}
                  content={editorDraft.profileContent}
                  onChange={changeProfileContent}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{ABOUT_US_LABELS.companyPhoto}</Label>
              <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center">
                <div className="bg-primary flex h-36 w-full items-center justify-center overflow-hidden rounded-md lg:h-32 lg:w-52">
                  {selectedPhoto ? (
                    <img
                      src={getMediaAssetUrl(selectedPhoto.path)}
                      alt={selectedPhoto.filename}
                      className="size-full object-cover"
                    />
                  ) : mediaQuery.isPending &&
                    editorDraft.companyPictureFilepath ? (
                    <span role="status" className="text-foreground/55 text-xs">
                      {ABOUT_US_LABELS.loadingPhoto}
                    </span>
                  ) : (
                    <div className="text-foreground/50 flex flex-col items-center gap-1 text-xs">
                      <ImageIcon aria-hidden="true" className="size-5" />
                      <span>
                        {mediaQuery.isError &&
                        editorDraft.companyPictureFilepath
                          ? ABOUT_US_LABELS.photoUnavailable
                          : ABOUT_US_LABELS.noPhoto}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPhotoPickerOpen(true)}
                  >
                    {editorDraft.companyPictureFilepath
                      ? ABOUT_US_LABELS.changePhoto
                      : ABOUT_US_LABELS.choosePhoto}
                  </Button>
                  {selectedPhoto && (
                    <p className="text-foreground/55 text-xs">
                      {selectedPhoto.filename}
                      {selectedPhoto.metadata
                        ? ` · ${selectedPhoto.metadata.width} × ${selectedPhoto.metadata.height}`
                        : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card aria-labelledby="about-us-vision-mission-title">
          <CardHeader>
            <CardTitle id="about-us-vision-mission-title" className="text-base">
              {ABOUT_US_LABELS.visionMission}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="about-us-vision">
                {ABOUT_US_LABELS.vision}
                <span className="text-danger"> *</span>
              </Label>
              <Textarea
                id="about-us-vision"
                value={editorDraft.vision}
                onChange={(event) => changeVision(event.currentTarget.value)}
                className="min-h-16"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{ABOUT_US_LABELS.missions}</Label>
              {editorDraft.missions.length === 0 ? (
                <p
                  role="status"
                  className="text-foreground/55 py-6 text-center text-sm"
                >
                  {ABOUT_US_LABELS.emptyMissions}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {editorDraft.missions.map((mission, index) => (
                    <SortableAboutUsItem
                      key={mission.clientKey}
                      clientKey={mission.clientKey}
                      index={index}
                      group="about-us-missions"
                      title={mission.title}
                      description={mission.description}
                      canDelete={canDeleteMission}
                      onEdit={() =>
                        openEditDialog('mission', mission.clientKey)
                      }
                      onDelete={() => deleteMission(mission.clientKey)}
                    />
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="bg-primary text-secondary hover:bg-primary/80 w-full border-dashed"
                onClick={() => openAddDialog('mission')}
              >
                {ABOUT_US_LABELS.addMission}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card aria-labelledby="about-us-timeline-title">
          <CardHeader>
            <CardTitle id="about-us-timeline-title" className="text-base">
              {ABOUT_US_LABELS.timeline}
            </CardTitle>
            <span className="text-foreground/55 text-xs">
              {ABOUT_US_LABELS.timelineCount(editorDraft.timeline.length)}
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            {editorDraft.timeline.length === 0 ? (
              <p
                role="status"
                className="text-foreground/55 py-6 text-center text-sm"
              >
                {ABOUT_US_LABELS.emptyTimeline}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {editorDraft.timeline.map((entry, index) => (
                  <SortableAboutUsItem
                    key={entry.clientKey}
                    clientKey={entry.clientKey}
                    index={index}
                    group="about-us-timeline"
                    title={[entry.period, entry.title]
                      .filter(Boolean)
                      .join(' · ')}
                    description={entry.description}
                    canDelete={canDeleteTimeline}
                    onEdit={() => openEditDialog('timeline', entry.clientKey)}
                    onDelete={() => deleteTimeline(entry.clientKey)}
                  />
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              className="bg-primary text-secondary hover:bg-primary/80 w-full border-dashed"
              onClick={() => openAddDialog('timeline')}
            >
              {ABOUT_US_LABELS.addTimeline}
            </Button>
          </CardContent>
        </Card>

        {photoPickerOpen && (
          <MediaPickerDialog
            open
            onOpenChange={setPhotoPickerOpen}
            selectedMediaId={selectedPhoto?.id}
            onSelect={changeCompanyPhoto}
          />
        )}

        {itemDialog && (
          <AboutUsItemDialog
            key={`${itemDialog.kind}-${itemDialog.clientKey ?? 'new'}`}
            kind={itemDialog.kind}
            initialValue={dialogInitialValue}
            onOpenChange={(open) => {
              if (!open) setItemDialog(null)
            }}
            onSave={saveItem}
          />
        )}
      </div>
    </DragDropProvider>
  )
}

function AboutUsItemDialog({
  kind,
  initialValue,
  onOpenChange,
  onSave,
}: {
  kind: ItemDialogKind
  initialValue?: ItemDialogValue
  onOpenChange: (open: boolean) => void
  onSave: (value: ItemDialogValue) => void
}) {
  const [value, setValue] = useState<ItemDialogValue>(
    initialValue ?? { primary: '', description: '' },
  )
  const primaryLabel =
    kind === 'mission'
      ? ABOUT_US_LABELS.missionTitle
      : ABOUT_US_LABELS.timelinePeriod
  const descriptionLabel =
    kind === 'mission'
      ? ABOUT_US_LABELS.missionDescription
      : ABOUT_US_LABELS.timelineDescription
  const dialogTitle = initialValue
    ? ABOUT_US_LABELS.editItemTitle(kind)
    : ABOUT_US_LABELS.addItemTitle(kind)

  function submit() {
    onSave(value)
    onOpenChange(false)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <p className="text-foreground/65 text-sm">
            {ABOUT_US_LABELS.itemDialogDescription}
          </p>
        </DialogHeader>
        <div className="flex flex-col gap-4 p-5 pt-0">
          <div className="flex flex-col gap-2">
            <Label htmlFor="about-us-item-primary">{primaryLabel}</Label>
            <Input
              id="about-us-item-primary"
              value={value.primary}
              onChange={(event) => {
                const primary = event.currentTarget.value
                setValue((current) => ({
                  ...current,
                  primary,
                }))
              }}
            />
          </div>
          {kind === 'timeline' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="about-us-item-title">
                {ABOUT_US_LABELS.timelineTitle}
              </Label>
              <Input
                id="about-us-item-title"
                value={value.title ?? ''}
                onChange={(event) => {
                  const title = event.currentTarget.value
                  setValue((current) => ({
                    ...current,
                    title,
                  }))
                }}
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="about-us-item-description">
              {descriptionLabel}
            </Label>
            <Textarea
              id="about-us-item-description"
              value={value.description}
              onChange={(event) => {
                const description = event.currentTarget.value
                setValue((current) => ({
                  ...current,
                  description,
                }))
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {ABOUT_US_LABELS.cancel}
          </Button>
          <Button type="button" onClick={submit}>
            {ABOUT_US_LABELS.saveItem}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AboutUsPageMessage({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
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
              {ABOUT_US_LABELS.retry}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function mapAboutUsContents(contents: AboutUsContentRecord[]): AboutUsDraft {
  const profileContent = contents.find(
    (content) =>
      content.block_key === 'company-profile' &&
      content.block_type === 'profile-content',
  )
  const companyPicture = contents.find(
    (content) =>
      content.block_key === 'company-profile' &&
      content.block_type === 'company-picture',
  )
  const vision = contents.find(
    (content) =>
      content.block_key === 'mission-vision' && content.block_type === 'vision',
  )
  const missions = contents
    .filter(
      (content) =>
        content.block_key === 'mission-vision' &&
        content.block_type === 'mission-item',
    )
    .sort((first, second) => first.sort_order - second.sort_order)
    .map<AboutUsMissionDraft>((content) => ({
      clientKey: `mission-${content.id}`,
      title: content.data?.title ?? '',
      description: content.data?.description ?? '',
    }))
  const timeline = contents
    .filter(
      (content) =>
        content.block_key === 'history_timeline' &&
        content.block_type === 'timeline-item',
    )
    .sort((first, second) => first.sort_order - second.sort_order)
    .map<AboutUsTimelineDraft>((content) => ({
      clientKey: `timeline-${content.id}`,
      period: content.data?.period ?? '',
      title: content.data?.title ?? '',
      description: content.data?.description ?? '',
    }))

  return {
    ...emptyAboutUsDraft,
    profileContent: profileContent?.data?.content ?? '',
    companyPictureFilepath: companyPicture?.data?.media_filepath ?? null,
    vision: vision?.data?.content ?? '',
    missions,
    timeline,
  }
}

function buildAboutUsContentPayload(
  draft: AboutUsDraft,
): AboutUsContentWriteItem[] {
  const items: AboutUsContentWriteItem[] = [
    {
      page: 'about-us',
      block_key: 'company-profile',
      block_type: 'profile-content',
      data: { content: draft.profileContent },
    },
    {
      page: 'about-us',
      block_key: 'company-profile',
      block_type: 'company-picture',
      data: { media_filepath: draft.companyPictureFilepath },
    },
    {
      page: 'about-us',
      block_key: 'mission-vision',
      block_type: 'vision',
      data: { content: draft.vision },
    },
  ]

  draft.missions.forEach((mission, index) => {
    items.push({
      page: 'about-us',
      block_key: 'mission-vision',
      block_type: 'mission-item',
      sort_order: index + 1,
      data: {
        title: mission.title,
        description: mission.description,
      },
    })
  })

  draft.timeline.forEach((entry, index) => {
    items.push({
      page: 'about-us',
      block_key: 'history_timeline',
      block_type: 'timeline-item',
      sort_order: index + 1,
      data: {
        period: entry.period,
        title: entry.title,
        description: entry.description,
      },
    })
  })

  return items
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

function createClientKey(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export { AboutUsPage }
