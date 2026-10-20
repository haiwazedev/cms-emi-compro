import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { usePermissions } from '@/module/auth/hooks/use-permissions'
import { saveAboutUsContent } from '@/module/about-us/api/about-us.api'
import type {
  AboutUsContentRecord,
  AboutUsContentWriteItem,
} from '@/module/about-us/api/about-us.api'
import { SortableAboutUsItem } from '@/module/about-us/components/sortable-about-us-item'
import type { Dictionary } from '@/shared/lib/i18n/id'
import {
  aboutUsContentQueryKeys,
  aboutUsContentQueryOptions,
} from '@/module/about-us/queries/about-us.queries'
import type {
  AboutUsDraft,
  AboutUsMissionDraft,
  AboutUsTimelineDraft,
} from '@/module/about-us/types/about-us.types'
import { ArticleStatusPill } from '@/module/article/components/article-language-pills'
import { ArticleRichTextEditor } from '@/module/article/components/article-rich-text-editor'
import type { Language } from '@/module/language/api/language.api'
import {
  DEFAULT_LANGUAGE_ID,
  findDefaultLanguage,
} from '@/module/language/constants/language.constants'
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
import { formatRelativeTime } from '@/module/user/constants/user.constants'
import { toast } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import { DragDropProvider } from '@dnd-kit/react'
import type { DragEndEvent } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  Link,
  useBlocker,
  useNavigate,
  useSearch,
} from '@tanstack/react-router'
import {
  ArrowRightIcon,
  CheckIcon,
  ImageIcon,
  LoaderCircleIcon,
  PlusIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

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
  const { t } = useI18n()
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
    return <AboutUsPageMessage message={t.aboutUs.loading} />
  }
  if (languagesQuery.isError) {
    return (
      <AboutUsPageMessage
        message={t.aboutUs.languagesFailed}
        onRetry={() => void languagesQuery.refetch()}
      />
    )
  }
  if (!language) {
    return <AboutUsPageMessage message={t.aboutUs.noLanguages} />
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
  const { locale, t } = useI18n()
  const { canWrite } = usePermissions()
  const queryClient = useQueryClient()
  const aboutUsQuery = useQuery(aboutUsContentQueryOptions(languageId))
  const translationQueries = useQueries({
    queries: languages.map((item) => aboutUsContentQueryOptions(item.id)),
  })
  const mediaQuery = useQuery(mediaQueryOptions(pictureMediaParams))
  const [draft, setDraft] = useState<AboutUsDraft | null>(null)
  const [savedDraft, setSavedDraft] = useState<AboutUsDraft | null>(null)
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false)
  const [itemDialog, setItemDialog] = useState<ItemDialogState | null>(null)
  const [addedLanguageIds, setAddedLanguageIds] = useState<string[]>([])

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
      isDirty && !window.confirm(t.aboutUs.discardChangesConfirm),
    enableBeforeUnload: () => isDirty,
  })

  function requestLanguage(id: string) {
    if (id === languageId) return
    if (isDirty && !window.confirm(t.aboutUs.discardChangesConfirm)) {
      return
    }

    onLanguageChange(id)
  }

  function hasContent(id: string) {
    const index = languages.findIndex((item) => item.id === id)
    return Boolean(translationQueries[index]?.data?.length)
  }

  // Other languages need a saved Bahasa Indonesia version first.
  function addLanguage(id: string) {
    if (!hasContent(DEFAULT_LANGUAGE_ID)) {
      toast.add({
        title: t.common.error,
        description: t.aboutUs.defaultLanguageRequired,
        type: 'error',
      })
      return
    }

    setAddedLanguageIds((ids) => [...ids, id])
  }

  function translationStatus(id: string): TranslationStatus {
    if (hasContent(id)) return 'PUBLISHED'
    if (id === languageId || addedLanguageIds.includes(id)) return 'UNSAVED'
    return 'MISSING'
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
        title: t.common.success,
        description: t.aboutUs.saveSuccess,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error ? error.message : t.aboutUs.saveFailed,
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
            : t.aboutUs.loadFailed
        }
        onRetry={() => void aboutUsQuery.refetch()}
      />
    )
  }

  if (aboutUsQuery.isPending || !editorDraft || !baselineDraft) {
    return <AboutUsPageMessage message={t.aboutUs.loading} />
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
  // ISO timestamps sort as strings; newest first.
  const latestItem = [...aboutUsQuery.data].sort((first, second) =>
    (second.updated_at ?? second.created_at).localeCompare(
      first.updated_at ?? first.created_at,
    ),
  )[0]

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="bg-primary flex min-h-full flex-col gap-4 p-4 lg:gap-6 lg:p-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-accent text-2xl font-bold lg:text-3xl">
              {t.aboutUs.pageTitle}
            </h1>
            <p className="text-muted text-sm lg:text-base">
              {t.aboutUs.description}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <Button
              type="button"
              variant="outline"
              disabled
              title={t.aboutUs.previewDisabled}
            >
              {t.aboutUs.preview}
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
                {saveMutation.isPending
                  ? t.aboutUs.saving
                  : t.aboutUs.savePublish}
              </Button>
            )}
          </div>
        </header>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          {/* Read-only without write permission. */}
          <fieldset
            disabled={!canWrite}
            className="flex min-w-0 flex-1 flex-col gap-4 lg:gap-6"
          >
            <Card aria-labelledby="about-us-profile-title">
              <CardHeader>
                <CardTitle
                  id="about-us-profile-title"
                  className="text-base font-bold"
                >
                  {t.aboutUs.companyProfile}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="about-us-profile-content">
                    {t.aboutUs.profileContent}
                    <span aria-hidden="true" className="text-danger">
                      *
                    </span>
                  </Label>
                  <div className="border-border overflow-hidden rounded-lg border">
                    <ArticleRichTextEditor
                      id="about-us-profile-content"
                      ariaLabel={t.aboutUs.profileContent}
                      content={editorDraft.profileContent}
                      onChange={changeProfileContent}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>{t.aboutUs.companyPhoto}</Label>
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
                        <span
                          role="status"
                          className="text-foreground/55 text-xs"
                        >
                          {t.aboutUs.loadingPhoto}
                        </span>
                      ) : (
                        <div className="text-foreground/50 flex flex-col items-center gap-1 text-xs">
                          <ImageIcon aria-hidden="true" className="size-5" />
                          <span>
                            {mediaQuery.isError &&
                            editorDraft.companyPictureFilepath
                              ? t.aboutUs.photoUnavailable
                              : t.aboutUs.noPhoto}
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
                          ? t.aboutUs.changePhoto
                          : t.aboutUs.choosePhoto}
                      </Button>
                      {selectedPhoto && (
                        <p className="text-muted text-xs">
                          {selectedPhoto.filename}
                          {selectedPhoto.metadata
                            ? ` · ${selectedPhoto.metadata.width}×${selectedPhoto.metadata.height}`
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
                <CardTitle
                  id="about-us-vision-mission-title"
                  className="text-base font-bold"
                >
                  {t.aboutUs.visionMission}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="about-us-vision">
                    {t.aboutUs.vision}
                    <span aria-hidden="true" className="text-danger">
                      *
                    </span>
                  </Label>
                  <Textarea
                    id="about-us-vision"
                    value={editorDraft.vision}
                    onChange={(event) =>
                      changeVision(event.currentTarget.value)
                    }
                    className="min-h-16"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>{t.aboutUs.missions}</Label>
                  {editorDraft.missions.length === 0 ? (
                    <p
                      role="status"
                      className="text-foreground/55 py-6 text-center text-sm"
                    >
                      {t.aboutUs.emptyMissions}
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
                    {t.aboutUs.addMission}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card aria-labelledby="about-us-timeline-title">
              <CardHeader>
                <CardTitle
                  id="about-us-timeline-title"
                  className="text-base font-bold"
                >
                  {t.aboutUs.timeline}
                </CardTitle>
                <span className="text-muted text-xs">
                  {t.aboutUs.timelineCount(editorDraft.timeline.length)}
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                {editorDraft.timeline.length === 0 ? (
                  <p
                    role="status"
                    className="text-foreground/55 py-6 text-center text-sm"
                  >
                    {t.aboutUs.emptyTimeline}
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
                        onEdit={() =>
                          openEditDialog('timeline', entry.clientKey)
                        }
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
                  {t.aboutUs.addTimeline}
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
          </fieldset>

          <aside className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0 lg:gap-6">
            <SidebarCard title={t.aboutUs.status}>
              <MetaRow label={t.aboutUs.status}>
                {latestItem ? (
                  <ArticleStatusPill status="PUBLISHED" />
                ) : (
                  <span className="text-muted">{t.aboutUs.missing}</span>
                )}
              </MetaRow>
              {latestItem && (
                <>
                  <MetaRow label={t.aboutUs.updated}>
                    {formatRelativeTime(
                      latestItem.updated_at ?? latestItem.created_at,
                      locale,
                    )}
                  </MetaRow>
                  <MetaRow label={t.aboutUs.updatedBy}>
                    {latestItem.updated_by ?? latestItem.created_by}
                  </MetaRow>
                </>
              )}
            </SidebarCard>

            <SidebarCard title={t.aboutUs.translation}>
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
            </SidebarCard>

            <SidebarCard title={t.aboutUs.boardMembers}>
              <p className="text-muted">{t.aboutUs.boardMembersNote}</p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/board_members">
                  {t.aboutUs.manageBoardMembers}
                  <ArrowRightIcon aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </SidebarCard>
          </aside>
        </div>
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
  const { t } = useI18n()
  const [value, setValue] = useState<ItemDialogValue>(
    initialValue ?? { primary: '', description: '' },
  )
  const primaryLabel =
    kind === 'mission' ? t.aboutUs.missionTitle : t.aboutUs.timelinePeriod
  const descriptionLabel =
    kind === 'mission'
      ? t.aboutUs.missionDescription
      : t.aboutUs.timelineDescription
  const dialogTitle = initialValue
    ? t.aboutUs.editItemTitle(kind)
    : t.aboutUs.addItemTitle(kind)

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
            {t.aboutUs.itemDialogDescription}
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
                {t.aboutUs.timelineTitle}
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
            {t.common.cancel}
          </Button>
          <Button type="button" onClick={submit}>
            {t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SidebarCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 space-y-0 text-sm">
        <h2 className="text-muted text-xs font-semibold tracking-wide uppercase">
          {title}
        </h2>
        {children}
      </CardContent>
    </Card>
  )
}

type TranslationStatus = 'PUBLISHED' | 'UNSAVED' | 'MISSING'

const TRANSLATION_STATUS_KEYS = {
  PUBLISHED: 'published',
  UNSAVED: 'unsaved',
  MISSING: 'missing',
} as const satisfies Record<TranslationStatus, keyof Dictionary['aboutUs']>

const TRANSLATION_STATUS_TONES: Record<TranslationStatus, string> = {
  PUBLISHED: 'text-success',
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
    <div className="border-border flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
      {status === 'MISSING' ? (
        <>
          <span className={TRANSLATION_STATUS_TONES.MISSING}>{name}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t.aboutUs.addTranslation(language.language)}
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
          aria-label={t.aboutUs.openTranslation(language.language)}
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
        >
          <span
            className={current ? 'text-accent font-semibold' : 'text-muted'}
          >
            {name}
          </span>
          <span className={cn('font-medium', TRANSLATION_STATUS_TONES[status])}>
            {t.aboutUs[TRANSLATION_STATUS_KEYS[status]]}
          </span>
        </button>
      )}
    </div>
  )
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-border flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <span className="text-accent text-right font-medium">{children}</span>
    </div>
  )
}

function AboutUsPageMessage({
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
