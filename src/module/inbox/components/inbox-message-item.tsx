import type { InboxMessage } from '@/module/inbox/constants/inbox.constants'
import { INBOX_LABELS } from '@/module/inbox/constants/inbox.constants'
import { cn } from '@/shared/lib/utils'

const shortDateFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function InboxMessageItem({
  message,
  selected,
  onSelect,
}: {
  message: InboxMessage
  selected: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        aria-current={selected}
        onClick={onSelect}
        className={cn(
          'border-border/10 hover:bg-primary flex w-full gap-3 border-b border-l-4 border-l-transparent p-4 text-left',
          selected && 'bg-primary border-l-accent',
        )}
      >
        <span className="bg-primary text-accent flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
          {getInitials(message.name)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-start justify-between gap-2">
            <span className="text-accent flex items-center gap-2 font-semibold">
              {message.name}
              {!message.read && (
                <span
                  aria-label={INBOX_LABELS.unread}
                  className="bg-secondary size-2 rounded-full"
                />
              )}
            </span>
            <span className="text-foreground/50 shrink-0 text-xs">
              {shortDateFormat.format(new Date(message.createdAt))}
            </span>
          </span>
          <span className="text-accent text-sm">{message.title}</span>
          <span className="text-foreground/50 line-clamp-3 text-sm">
            {message.message}
          </span>
        </span>
      </button>
    </li>
  )
}

export { InboxMessageItem }
