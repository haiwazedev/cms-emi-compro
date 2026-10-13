import { InboxMessageDetail } from '@/module/inbox/components/inbox-message-detail'
import { InboxMessageItem } from '@/module/inbox/components/inbox-message-item'
import type {
  InboxMessage,
  InboxReadFilter,
} from '@/module/inbox/constants/inbox.constants'
import {
  INBOX_ALL_SUBJECTS,
  INBOX_LABELS,
  INBOX_MOCK_MESSAGES,
  INBOX_READ_FILTERS,
} from '@/module/inbox/constants/inbox.constants'
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
import { DownloadIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

const CSV_COLUMNS = [
  'name',
  'email',
  'phone',
  'company',
  'subject',
  'title',
  'message',
  'createdAt',
] as const

function exportCsv(messages: InboxMessage[]) {
  const rows = messages.map((message) =>
    CSV_COLUMNS.map(
      (column) => `"${String(message[column]).replaceAll('"', '""')}"`,
    ).join(','),
  )
  const csv = [CSV_COLUMNS.join(','), ...rows].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = INBOX_LABELS.csvFileName
  link.click()
  URL.revokeObjectURL(url)
}

function InboxPage() {
  const [messages, setMessages] = useState<InboxMessage[]>([
    ...INBOX_MOCK_MESSAGES,
  ])
  const [selectedId, setSelectedId] = useState<number | undefined>(
    messages[0]?.id,
  )
  const [search, setSearch] = useState('')
  const [readFilter, setReadFilter] = useState<InboxReadFilter>('all')
  const [subjectFilter, setSubjectFilter] = useState(INBOX_ALL_SUBJECTS)
  const [deleteTarget, setDeleteTarget] = useState<InboxMessage | null>(null)

  const unreadCount = messages.filter((message) => !message.read).length
  const subjects = [...new Set(messages.map((message) => message.subject))]
  const keyword = search.trim().toLowerCase()
  const filteredMessages = messages.filter(
    (message) =>
      (readFilter === 'all' || message.read === (readFilter === 'read')) &&
      (subjectFilter === INBOX_ALL_SUBJECTS ||
        message.subject === subjectFilter) &&
      (message.name.toLowerCase().includes(keyword) ||
        message.title.toLowerCase().includes(keyword)),
  )
  const selectedMessage = messages.find((message) => message.id === selectedId)

  function setRead(id: number, read: boolean) {
    setMessages((current) =>
      current.map((message) =>
        message.id === id ? { ...message, read } : message,
      ),
    )
  }

  function selectMessage(id: number) {
    setSelectedId(id)
    setRead(id, true)
  }

  function markAllRead() {
    setMessages((current) =>
      current.map((message) => ({ ...message, read: true })),
    )
  }

  function deleteMessage(id: number) {
    setMessages((current) => current.filter((message) => message.id !== id))
    if (selectedId === id) setSelectedId(undefined)
    setDeleteTarget(null)
  }

  return (
    <div className="bg-primary flex min-h-full flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-accent text-2xl font-bold lg:text-3xl">
            {INBOX_LABELS.pageTitle}
          </h1>
          <p className="text-foreground/60 text-sm lg:text-base">
            {INBOX_LABELS.description(unreadCount)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={unreadCount === 0}
            onClick={markAllRead}
          >
            {INBOX_LABELS.markAllRead}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={filteredMessages.length === 0}
            onClick={() => exportCsv(filteredMessages)}
          >
            <DownloadIcon aria-hidden="true" className="size-4" />
            {INBOX_LABELS.exportCsv}
          </Button>
        </div>
      </header>

      <Card aria-label={INBOX_LABELS.pageTitle} className="flex flex-col">
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
          <Select
            value={readFilter}
            onValueChange={(value) => setReadFilter(value as InboxReadFilter)}
          >
            <SelectTrigger
              aria-label={INBOX_LABELS.readFilterLabel}
              className="lg:w-40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INBOX_READ_FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="border-border/15 border-b lg:w-96 lg:shrink-0 lg:border-r lg:border-b-0">
            {filteredMessages.length === 0 ? (
              <EmptyMessage message={INBOX_LABELS.noMessages} />
            ) : (
              <ul>
                {filteredMessages.map((message) => (
                  <InboxMessageItem
                    key={message.id}
                    message={message}
                    selected={message.id === selectedId}
                    onSelect={() => selectMessage(message.id)}
                  />
                ))}
              </ul>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {selectedMessage ? (
              <InboxMessageDetail
                message={selectedMessage}
                onToggleRead={() =>
                  setRead(selectedMessage.id, !selectedMessage.read)
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
              “{deleteTarget?.title}”
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
              onClick={() => {
                if (deleteTarget) deleteMessage(deleteTarget.id)
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
