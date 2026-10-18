import { DashboardStatCard } from '@/module/dashboard/components/dashboard-stat-card'
import { DASHBOARD_LABELS } from '@/module/dashboard/constants/dashboard.constants'
import {
  divisionsQueryOptions,
  servicesQueryOptions,
} from '@/module/division/queries/division.queries'
import {
  documentCommitmentCategoriesQueryOptions,
  documentCommitmentsQueryOptions,
} from '@/module/document_commitment/queries/document-commitment.queries'
import { inboxCountsQueryOptions } from '@/module/inbox/queries/inbox.queries'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { FileTextIcon, MailIcon, ZapIcon, type LucideIcon } from 'lucide-react'

interface CountStatCardProps {
  label: string
  icon: LucideIcon
  iconClassName: string
  value: number | undefined
  note: string | undefined
  error: Error | null
}

function CountStatCard({ value, note, error, ...props }: CountStatCardProps) {
  if (error) {
    return (
      <DashboardStatCard
        {...props}
        value="-"
        note={
          <p role="alert" className="text-danger">
            {error.message || DASHBOARD_LABELS.countFailed}
          </p>
        }
      />
    )
  }

  if (value === undefined || note === undefined) {
    return (
      <DashboardStatCard
        {...props}
        value={<Skeleton className="my-1 h-7 w-10" />}
        note={
          <div role="status">
            <span className="sr-only">{DASHBOARD_LABELS.loadingCount}</span>
            <Skeleton className="h-4 w-24" />
          </div>
        }
      />
    )
  }

  return <DashboardStatCard {...props} value={value} note={note} />
}

function DashboardDocumentStatCard() {
  // limit 1: only pagination.totalItems is needed.
  const documentsQuery = useQuery(
    documentCommitmentsQueryOptions({ page: 1, limit: 1 }),
  )
  const categoriesQuery = useQuery(documentCommitmentCategoriesQueryOptions())

  return (
    <CountStatCard
      label={DASHBOARD_LABELS.documents}
      icon={FileTextIcon}
      iconClassName="bg-success/10 text-success"
      value={documentsQuery.data?.pagination.totalItems}
      note={
        categoriesQuery.data &&
        DASHBOARD_LABELS.categoryCount(categoriesQuery.data.length)
      }
      error={documentsQuery.error ?? categoriesQuery.error}
    />
  )
}

function DashboardServiceStatCard() {
  const servicesQuery = useQuery(servicesQueryOptions())
  const divisionsQuery = useQuery(divisionsQueryOptions())

  return (
    <CountStatCard
      label={DASHBOARD_LABELS.services}
      icon={ZapIcon}
      iconClassName="bg-warning/10 text-warning"
      value={servicesQuery.data?.length}
      note={
        divisionsQuery.data &&
        DASHBOARD_LABELS.divisionCount(divisionsQuery.data.length)
      }
      error={servicesQuery.error ?? divisionsQuery.error}
    />
  )
}

function DashboardInboxStatCard() {
  const countsQuery = useQuery(inboxCountsQueryOptions())

  return (
    <CountStatCard
      label={DASHBOARD_LABELS.inbox}
      icon={MailIcon}
      iconClassName="bg-danger/10 text-danger"
      value={countsQuery.data?.unreadCount}
      note={countsQuery.data && DASHBOARD_LABELS.unread}
      error={countsQuery.error}
    />
  )
}

export {
  DashboardDocumentStatCard,
  DashboardInboxStatCard,
  DashboardServiceStatCard,
}
