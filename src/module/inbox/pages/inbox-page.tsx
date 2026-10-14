import {
  deleteInbox,
  markAllInboxesRead,
  updateInboxRead,
} from '@/module/inbox/api/inbox.api'
import type { Inbox } from '@/module/inbox/api/inbox.api'
import { InboxMessageDetail } from '@/module/inbox/components/inbox-message-detail'
import { InboxMessageItem } from '@/module/inbox/components/inbox-message-item'
import {
  INBOX_ALL_SUBJECTS,
  INBOX_LABELS,
} from '@/module/inbox/constants/inbox.constants'
import {
  inboxCountsQueryOptions,
  inboxQueryKeys,
  inboxSubjectsQueryOptions,
  inboxesQueryOptions,
} from '@/module/inbox/queries/inbox.queries'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import { toast } from '@/shared/lib/toast'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { DownloadIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function InboxPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState(INBOX_ALL_SUBJECTS)
  const [selectedId, setSelectedId] = useState<number>()
  const [deleteTarget, setDeleteTarget] = useState<Inbox | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    )
    return () => window.clearTimeout(timeoutId)
  }, [search])

  const inboxesQuery = useInfiniteQuery(
    inboxesQueryOptions({
      search: debouncedSearch || undefined,
      inbox_subject_id:
        subjectFilter === INBOX_ALL_SUBJECTS
          ? undefined
          : Number(subjectFilter),
    }),
  )
  const countsQuery = useQuery(inboxCountsQueryOptions())
  const subjectsQuery = useQuery(inboxSubjectsQueryOptions())

  // Offset pages can repeat a row when new messages arrive mid-scroll.
  const messages = [
    ...new Map(
      inboxesQuery.data?.pages
        .flatMap((page) => page.inboxes)
        .map((message) => [message.id, message]),
    ).values(),
  ]
  const selectedMessage = messages.find((message) => message.id === selectedId)
  const unreadCount = countsQuery.data?.unreadCount ?? 0

  async function refreshInboxes() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: inboxQueryKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: inboxQueryKeys.counts() }),
    ])
  }

  function showError(error: unknown, fallback: string) {
    toast.add({
      title: INBOX_LABELS.failed,
      description: error instanceof Error ? error.message : fallback,
      type: 'error',
    })
  }

  const readMutation = useMutation({
    mutationFn: ({ id, isRead }: { id: number; isRead: boolean }) =>
      updateInboxRead(id, isRead),
    onSuccess: refreshInboxes,
    onError: (error) => showError(error, INBOX_LABELS.updateFailed),
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllInboxesRead,
    onSuccess: refreshInboxes,
    onError: (error) => showError(error, INBOX_LABELS.updateFailed),
  })

  const deleteMutation = useMutation({
    mutationFn: (message: Inbox) => deleteInbox(message.id),
    onSuccess: async (_data, message) => {
      if (selectedId === message.id) setSelectedId(undefined)
      setDeleteTarget(null)
      await refreshInboxes()
      toast.add({
        title: INBOX_LABELS.success,
        description: INBOX_LABELS.deleted,
        type: 'success',
      })
    },
    onError: (error) => showError(error, INBOX_LABELS.deleteFailed),
  })

  function selectMessage(message: Inbox) {
    setSelectedId(message.id)
    if (!message.is_read) readMutation.mutate({ id: message.id, isRead: true })
  }

  return (
    <div className="bg-primary flex min-h-full flex-col gap-4 p-4 lg:h-full lg:gap-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div className="flex flex-col gap-1">
          <h1 className="text-accent text-2xl font-bold lg:text-3xl">
            {INBOX_LABELS.pageTitle}
          </h1>
          <p className="text-foreground/60 text-sm lg:text-base">
            {INBOX_LABELS.description(unreadCount)}
          </p>
        </div>

        {/* Right Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
          >
            {INBOX_LABELS.markAllRead}
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Disabled buttons swallow hover, so the wrapper owns the tooltip. */}
              <span tabIndex={0}>
                <Button type="button" variant="outline" disabled>
                  <DownloadIcon aria-hidden="true" className="size-4" />
                  {INBOX_LABELS.exportCsv}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{INBOX_LABELS.underDevelopment}</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <Card
        aria-label={INBOX_LABELS.pageTitle}
        className="flex flex-col lg:min-h-0 lg:flex-1"
      >
        {/* Search and Filters */}
        <div className="border-border/15 flex flex-col gap-2 border-b p-4 lg:flex-row">
          <div className="relative lg:w-64">
            <SearchIcon
              aria-hidden="true"
              className="text-foreground/40 absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <Input
              type="search"
              aria-label={INBOX_LABELS.searchLabel}
              placeholder={INBOX_LABELS.searchPlaceholder}
              className="pl-9 text-sm"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger
              aria-label={INBOX_LABELS.subjectFilterLabel}
              className="lg:w-72"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={INBOX_ALL_SUBJECTS}>
                {INBOX_LABELS.allSubjects}
              </SelectItem>
              {subjectsQuery.data?.map((subject) => (
                <SelectItem key={subject.id} value={String(subject.id)}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:min-h-0 lg:flex-1 lg:flex-row">
          {/* Inbox List */}
          <div className="border-border/15 border-b lg:w-96 lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-b-0">
            {inboxesQuery.isPending ? (
              <EmptyMessage message={INBOX_LABELS.loading} />
            ) : inboxesQuery.isError ? (
              <EmptyMessage message={INBOX_LABELS.loadFailed} />
            ) : messages.length === 0 ? (
              <EmptyMessage message={INBOX_LABELS.noMessages} />
            ) : (
              <ul>
                {messages.map((message) => (
                  <InboxMessageItem
                    key={message.id}
                    message={message}
                    selected={message.id === selectedId}
                    onSelect={() => selectMessage(message)}
                  />
                ))}
                {inboxesQuery.hasNextPage && (
                  <LoadMoreTrigger
                    loading={inboxesQuery.isFetchingNextPage}
                    onVisible={() => void inboxesQuery.fetchNextPage()}
                  />
                )}
              </ul>
            )}
          </div>

          {/* Inbox Content */}
          <div className="min-w-0 flex-1 lg:overflow-y-auto">
            {selectedMessage ? (
              <InboxMessageDetail
                message={selectedMessage}
                onToggleRead={() =>
                  readMutation.mutate({
                    id: selectedMessage.id,
                    isRead: !selectedMessage.is_read,
                  })
                }
                onDelete={() => setDeleteTarget(selectedMessage)}
              />
            ) : (
              <EmptyMessage message={INBOX_LABELS.noSelection} />
            )}
          </div>
        </div>
      </Card>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent
          className="max-w-xl"
          closeLabel={INBOX_LABELS.closeDeleteDialog}
        >
          <DialogHeader className="border-border/15 border-b">
            <DialogTitle>{INBOX_LABELS.deleteTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-5 py-6">
            <span className="bg-danger/10 text-danger flex size-14 items-center justify-center rounded-full">
              <Trash2Icon aria-hidden="true" className="size-5" />
            </span>
            <p className="text-accent font-semibold break-words">
              {deleteTarget?.name} · {deleteTarget?.inbox_subject.name}
            </p>
            <DialogDescription>
              {INBOX_LABELS.deleteDescription}
            </DialogDescription>
          </div>
          <DialogFooter className="bg-primary">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              {INBOX_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) deleteMutation.mutate(deleteTarget)
              }}
            >
              {INBOX_LABELS.confirmDelete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LoadMoreTrigger({
  loading,
  onVisible,
}: {
  loading: boolean
  onVisible: () => void
}) {
  const ref = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || loading) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) onVisible()
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [loading, onVisible])

  return (
    <li
      ref={ref}
      role="status"
      className="text-foreground/55 px-4 py-4 text-center text-sm"
    >
      {loading && INBOX_LABELS.loading}
    </li>
  )
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="text-foreground/55 px-4 py-10 text-center text-sm"
    >
      {message}
    </p>
  )
}

export { InboxPage }
