import type { Inbox } from '@/module/inbox/api/inbox.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { cn } from '@/shared/lib/utils'

const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
}

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
  message: Inbox
  selected: boolean
  onSelect: () => void
}) {
  const { locale, t } = useI18n()
  return (
    <li>
      <button
        type="button"
        aria-current={selected}
        onClick={onSelect}
        className={cn(
          'border-border hover:bg-primary flex w-full gap-3 border-b border-l-4 border-l-transparent p-4 text-left',
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
              {!message.is_read && (
                <span
                  aria-label={t.inbox.unread}
                  className="bg-secondary size-2 rounded-full"
                />
              )}
            </span>
            <span className="text-foreground/50 shrink-0 text-xs">
              {new Intl.DateTimeFormat(locale, SHORT_DATE_OPTIONS).format(
                new Date(message.created_at),
              )}
            </span>
          </span>
          <span className="text-accent text-sm">
            {message.inbox_subject.name}
          </span>
          <span className="text-foreground/50 line-clamp-3 text-sm">
            {message.message}
          </span>
        </span>
      </button>
    </li>
  )
}

export { InboxMessageItem }
