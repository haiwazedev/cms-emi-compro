import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { activityLogsQueryOptions } from '@/module/activity_log/queries/activity-log.queries'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatRelativeTime } from '@/shared/lib/format-relative-time'
import { useQuery } from '@tanstack/react-query'

const RECENT_ACTIVITY_PARAMS = { page: 1, limit: 3 }

function DashboardRecentActivity() {
  const { locale, t } = useI18n()
  const activityQuery = useQuery(
    activityLogsQueryOptions(RECENT_ACTIVITY_PARAMS),
  )
  const activityLogs = activityQuery.data?.activityLogs ?? []

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 space-y-0">
        <h2 className="text-muted text-xs font-semibold tracking-wider uppercase">
          {t.dashboard.recentActivity}
        </h2>

        {activityQuery.isPending ? (
          <div role="status" className="flex flex-col gap-4">
            <span className="sr-only">{t.dashboard.loadingActivity}</span>
            {Array.from(
              { length: RECENT_ACTIVITY_PARAMS.limit },
              (_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="size-8 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ),
            )}
          </div>
        ) : activityQuery.isError ? (
          <p role="alert" className="text-danger text-sm">
            {activityQuery.error.message || t.dashboard.activityFailed}
          </p>
        ) : activityLogs.length === 0 ? (
          <p className="text-foreground/60 text-sm">{t.dashboard.noActivity}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {activityLogs.map((activity) => (
              <li key={activity.id} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="bg-secondary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                >
                  {getInitials(activity.name)}
                </span>
                <div className="flex min-w-0 flex-col gap-0.5 text-sm">
                  <p className="text-foreground/70 break-words">
                    <span className="text-accent font-semibold">
                      {activity.name}
                    </span>{' '}
                    {activity.action_type}{' '}
                    <span className="text-accent font-semibold">
                      {activity.action_result}
                    </span>
                  </p>
                  <time
                    dateTime={activity.created_at}
                    className="text-foreground/55 text-xs"
                  >
                    {formatRelativeTime(activity.created_at, locale)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// "Neni A." → "NA"; a single word uses its first two letters.
function getInitials(name: string) {
  const words = name.trim().split(/\s+/)
  const initials =
    words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)

  return initials.toUpperCase()
}

export { DashboardRecentActivity }
