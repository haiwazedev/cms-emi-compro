import { usePermissions } from '@/module/auth/hooks/use-permissions'
import type { Inbox } from '@/module/inbox/api/inbox.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  CalendarIcon,
  MailIcon,
  PhoneIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react'

const FULL_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short',
}

function InboxMessageDetail({
  message,
  onToggleRead,
  onDelete,
}: {
  message: Inbox
  onToggleRead: () => void
  onDelete: () => void
}) {
  const { locale, t } = useI18n()
  const { canDelete } = usePermissions()
  const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(
    t.inbox.replyPrefix + message.inbox_subject.name,
  )}`

  return (
    <article className="flex flex-col gap-5 p-4 lg:p-8">
      <header className="border-border flex flex-col gap-2 border-b pb-4">
        <div className="text-foreground/60 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <MetaItem icon={UserIcon} className="text-accent font-medium">
            {message.name}
          </MetaItem>
          <MetaItem icon={MailIcon}>{message.email}</MetaItem>
          {message.phone && (
            <MetaItem icon={PhoneIcon}>{message.phone}</MetaItem>
          )}
          <MetaItem icon={CalendarIcon}>
            {new Intl.DateTimeFormat(locale, FULL_DATE_OPTIONS).format(
              new Date(message.created_at),
            )}
          </MetaItem>
        </div>
      </header>

      <dl className="flex flex-col gap-4 lg:flex-row">
        <DetailField label={t.inbox.company} value={message.company ?? '-'} />
        <DetailField
          label={t.inbox.subject}
          value={message.inbox_subject.name}
        />
      </dl>

      <p className="bg-primary text-foreground/80 rounded-xl p-5 text-sm leading-relaxed whitespace-pre-line">
        {message.message}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <a href={replyHref}>
            <MailIcon aria-hidden="true" className="size-4" />
            {t.inbox.replyViaEmail}
          </a>
        </Button>
        <Button type="button" variant="outline" onClick={onToggleRead}>
          {message.is_read ? t.inbox.markUnread : t.inbox.markRead}
        </Button>
        {canDelete && (
          <Button
            type="button"
            variant="outline"
            className="text-danger border-danger/40 hover:text-danger lg:ml-auto"
            onClick={onDelete}
          >
            <Trash2Icon aria-hidden="true" className="size-4" />
            {t.common.delete}
          </Button>
        )}
      </div>
    </article>
  )
}

function MetaItem({
  icon: Icon,
  className,
  children,
}: {
  icon: LucideIcon
  className?: string
  children: string
}) {
  return (
    <span className={cn('flex items-center gap-1', className)}>
      <Icon aria-hidden="true" className="size-4" />
      {children}
    </span>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <dt className="text-foreground/60 text-xs font-semibold tracking-wider uppercase">
        {label}
      </dt>
      <dd className="text-accent font-medium">{value}</dd>
    </div>
  )
}

export { InboxMessageDetail }
