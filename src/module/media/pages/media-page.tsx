import { usePermissions } from '@/module/auth/hooks/use-permissions'
import {
  bulkDeleteMedia,
  updateMedia,
  uploadMedia,
} from '@/module/media/api/media.api'
import type {
  Media,
  MediaSortOrder,
  MediaType,
} from '@/module/media/api/media.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { MediaCard } from '@/module/media/components/media-card'
import { MediaFormDialog } from '@/module/media/components/media-form-dialog'
import type { MediaFormSubmit } from '@/module/media/components/media-form-dialog'
import {
  mediaQueryKeys,
  mediaQueryOptions,
} from '@/module/media/queries/media.queries'
import type { MediaSearch } from '@/module/media/schemas/media-search.schema'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { toast } from '@/shared/lib/toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Grid2X2Icon,
  ListIcon,
  SearchIcon,
  Trash2Icon,
  UploadIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type TypeFilter = 'ALL' | MediaType
type ViewMode = 'grid' | 'list'

function MediaPage() {
  const { t } = useI18n()
  const { canWrite, canDelete } = usePermissions()
  const navigate = useNavigate({ from: '/media' })
  const {
    search,
    type,
    sort_order: sortOrder,
  } = useSearch({
    from: '/_authenticated/media',
  })
  const queryClient = useQueryClient()
  const [formMedia, setFormMedia] = useState<{ media?: Media }>()
  const [view, setView] = useState<ViewMode>('grid')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const mediaParams = useMemo(
    () => ({
      ...(type ? { type } : {}),
      sort_by: 'created_at' as const,
      sort_order: sortOrder,
    }),
    [sortOrder, type],
  )
  const mediaQuery = useQuery(mediaQueryOptions(mediaParams))
  const visibleMedia = useMemo(() => {
    const media = mediaQuery.data ?? []
    const normalizedSearch = search?.trim().toLowerCase() ?? ''

    return normalizedSearch
      ? media.filter((item) =>
          item.filename.toLowerCase().includes(normalizedSearch),
        )
      : media
  }, [mediaQuery.data, search])
  const pictures = visibleMedia.filter((item) => item.type === 'PICTURE')
  const documents = visibleMedia.filter((item) => item.type === 'DOCUMENT')

  const editing = Boolean(formMedia?.media)
  const saveMutation = useMutation({
    mutationFn: ({ file, type, ...fields }: MediaFormSubmit) =>
      formMedia?.media
        ? updateMedia(formMedia.media.id, fields)
        : uploadMedia(file as File, type as MediaType, fields),
    onSuccess: async () => {
      setFormMedia(undefined)
      await queryClient.invalidateQueries({ queryKey: mediaQueryKeys.all })
      toast.add({
        title: t.common.success,
        description: editing ? t.media.updateSuccess : t.media.uploadSuccess,
        type: 'success',
      })
    },
    onError: (error) => {
      const fallback = editing ? t.media.updateFailed : t.media.uploadFailed
      showError(error instanceof Error ? error.message : fallback)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: bulkDeleteMedia,
    onSuccess: async (deletedCount) => {
      setSelectedIds(new Set())
      setDeleteDialogOpen(false)
      await queryClient.invalidateQueries({ queryKey: mediaQueryKeys.all })
      toast.add({
        title: t.common.success,
        description: t.media.deleteSuccess(deletedCount),
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error ? error.message : t.media.deleteFailed,
        type: 'error',
      })
    },
  })

  function updateTypeFilter(value: TypeFilter) {
    setSelectedIds(new Set())
    void navigate({
      search: (previous) => ({
        ...previous,
        type: value === 'ALL' ? undefined : value,
      }),
    })
  }

  function updateSelection(mediaId: number, selected: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (selected) next.add(mediaId)
      else next.delete(mediaId)
      return next
    })
  }

  function showError(description: string) {
    toast.add({ title: t.common.error, description, type: 'error' })
  }

  const selectedCount = selectedIds.size
  const totalSize = visibleMedia.reduce((total, item) => total + item.size, 0)

  return (
    <div className="bg-primary flex min-h-full flex-col gap-6 p-4 lg:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-accent text-2xl font-bold lg:text-3xl">
            {t.media.pageTitle}
          </h1>
          <p className="text-foreground/60 text-sm lg:text-base">
            {t.media.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canDelete && selectedCount > 0 && (
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2Icon aria-hidden="true" className="size-4" />
              {t.media.deleteSelected(selectedCount)}
            </Button>
          )}
          {canWrite && (
            <Button type="button" onClick={() => setFormMedia({})}>
              <UploadIcon aria-hidden="true" className="size-4" />
              {t.media.upload}
            </Button>
          )}
        </div>
      </header>

      <section
        aria-label={t.media.pageTitle}
        className="bg-background border-border overflow-hidden rounded-xl border shadow-sm"
      >
        <div className="border-border flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
          <MediaSearchInput
            key={search ?? ''}
            search={search}
            onValueChange={() => setSelectedIds(new Set())}
          />

          <Select
            value={type ?? 'ALL'}
            onValueChange={(value) => updateTypeFilter(value as TypeFilter)}
          >
            <SelectTrigger
              aria-label={t.media.typeFilterLabel}
              className="lg:w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t.media.allTypes}</SelectItem>
              <SelectItem value="PICTURE">{t.media.pictures}</SelectItem>
              <SelectItem value="DOCUMENT">{t.media.documents}</SelectItem>
            </SelectContent>
          </Select>

          <label className="sr-only" htmlFor="media-sort-order">
            {t.media.sortLabel}
          </label>
          <Select
            value={sortOrder}
            onValueChange={(value) =>
              void navigate({
                search: (previous) => ({
                  ...previous,
                  sort_order: value as MediaSortOrder,
                }),
              })
            }
          >
            <SelectTrigger id="media-sort-order" className="lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">{t.media.newest}</SelectItem>
              <SelectItem value="asc">{t.media.oldest}</SelectItem>
            </SelectContent>
          </Select>

          <div
            aria-label={t.media.viewMode}
            className="flex items-center gap-1 lg:ml-auto"
            role="group"
          >
            <Button
              type="button"
              variant={view === 'grid' ? 'default' : 'outline'}
              size="icon"
              aria-label={t.media.gridView}
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
            >
              <Grid2X2Icon aria-hidden="true" className="size-4" />
            </Button>
            <Button
              type="button"
              variant={view === 'list' ? 'default' : 'outline'}
              size="icon"
              aria-label={t.media.listView}
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              <ListIcon aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>

        {mediaQuery.isPending ? (
          <MediaMessage role="status" message={t.media.loading} />
        ) : mediaQuery.isError ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <p role="alert" className="text-danger text-sm">
              {t.media.loadFailed}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void mediaQuery.refetch()}
            >
              {t.common.retry}
            </Button>
          </div>
        ) : visibleMedia.length === 0 ? (
          <MediaMessage
            message={search ? t.media.noSearchResults : t.media.empty}
          />
        ) : (
          <div className="flex flex-col gap-8 p-4 lg:p-5">
            {pictures.length > 0 && (
              <MediaGroup
                title={t.media.pictureType}
                items={pictures}
                view={view}
                selectedIds={selectedIds}
                onSelectionChange={updateSelection}
                onEdit={
                  canWrite ? (media) => setFormMedia({ media }) : undefined
                }
              />
            )}
            {documents.length > 0 && (
              <MediaGroup
                title={t.media.documentType}
                items={documents}
                view={view}
                selectedIds={selectedIds}
                onSelectionChange={updateSelection}
                onEdit={
                  canWrite ? (media) => setFormMedia({ media }) : undefined
                }
              />
            )}
          </div>
        )}

        <footer className="border-border text-foreground/55 border-t px-4 py-3 text-sm">
          {t.media.summary(visibleMedia.length, formatTotalSize(totalSize))}
        </footer>
      </section>

      {formMedia && (
        <MediaFormDialog
          media={formMedia.media}
          pending={saveMutation.isPending}
          onOpenChange={(open) => {
            if (!open && !saveMutation.isPending) setFormMedia(undefined)
          }}
          onSubmit={(fields) => saveMutation.mutate(fields)}
        />
      )}

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending) setDeleteDialogOpen(open)
        }}
      >
        <DialogContent
          className="max-w-xl"
          closeLabel={t.media.closeDeleteDialog}
        >
          <DialogHeader className="border-border border-b">
            <DialogTitle>{t.media.deleteTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-5 py-6">
            <span className="bg-danger/10 text-danger flex size-14 items-center justify-center rounded-full">
              <Trash2Icon aria-hidden="true" className="size-5" />
            </span>
            <DialogDescription>
              {t.media.deleteDescription(selectedCount)}
            </DialogDescription>
          </div>
          <DialogFooter className="bg-primary">
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={selectedCount === 0 || deleteMutation.isPending}
              onClick={() => deleteMutation.mutate([...selectedIds])}
            >
              {deleteMutation.isPending
                ? t.media.deleting
                : t.media.confirmDelete(selectedCount)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MediaGroup({
  title,
  items,
  view,
  selectedIds,
  onSelectionChange,
  onEdit,
}: {
  title: string
  items: Media[]
  view: ViewMode
  selectedIds: Set<number>
  onSelectionChange: (mediaId: number, selected: boolean) => void
  onEdit?: (media: Media) => void
}) {
  const { t } = useI18n()
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="text-secondary text-xs font-semibold tracking-widest">
        {title} · {t.media.fileCount(items.length)}
      </h2>
      <div
        className={
          view === 'grid'
            ? 'grid grid-cols-1 gap-4 lg:grid-cols-5'
            : 'flex flex-col gap-3'
        }
      >
        {items.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            view={view}
            selected={selectedIds.has(item.id)}
            onSelectionChange={onSelectionChange}
            onEdit={onEdit}
          />
        ))}
      </div>
    </section>
  )
}

function MediaMessage({ message, role }: { message: string; role?: 'status' }) {
  return (
    <p role={role} className="text-foreground/55 p-10 text-center text-sm">
      {message}
    </p>
  )
}

function MediaSearchInput({
  search,
  onValueChange,
}: {
  search: MediaSearch['search']
  onValueChange: () => void
}) {
  const { t } = useI18n()
  const navigate = useNavigate({ from: '/media' })
  const [value, setValue] = useState(search ?? '')

  useEffect(() => {
    const nextSearch = value.trim() || undefined
    if (nextSearch === search) return

    const timeoutId = window.setTimeout(() => {
      void navigate({
        search: (previous) => ({ ...previous, search: nextSearch }),
        replace: true,
      })
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [navigate, search, value])

  return (
    <label className="relative flex-1 lg:max-w-64">
      <SearchIcon
        aria-hidden="true"
        className="text-foreground/45 absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        type="search"
        aria-label={t.media.searchLabel}
        placeholder={t.media.searchPlaceholder}
        value={value}
        onChange={(event) => {
          setValue(event.currentTarget.value)
          onValueChange()
        }}
        className="pl-9"
      />
    </label>
  )
}

function formatTotalSize(sizeInKb: number) {
  return sizeInKb >= 1024
    ? `${(sizeInKb / 1024).toFixed(1)} MB`
    : `${sizeInKb} KB`
}

export { MediaPage }
