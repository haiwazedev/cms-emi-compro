import { articleCountsQueryOptions } from '@/module/article/queries/article.queries'
import { DashboardStatCard } from '@/module/dashboard/components/dashboard-stat-card'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { NewspaperIcon } from 'lucide-react'

function DashboardArticleStatCard() {
  const { t } = useI18n()
  const countsQuery = useQuery(articleCountsQueryOptions())

  return (
    <DashboardStatCard
      label={t.dashboard.articles}
      icon={NewspaperIcon}
      iconClassName="bg-secondary/10 text-secondary"
      value={
        countsQuery.data ? (
          countsQuery.data.total
        ) : countsQuery.isError ? (
          '-'
        ) : (
          <Skeleton className="my-1 h-7 w-10" />
        )
      }
      note={
        countsQuery.data ? (
          <ul className="flex flex-col gap-1">
            {countsQuery.data.languages.map((language) => (
              <li key={language.id}>
                <span aria-hidden="true">{language.flag}</span>{' '}
                {t.dashboard.languageCount(
                  language.id,
                  language.count.published,
                  language.count.draft,
                )}
              </li>
            ))}
          </ul>
        ) : countsQuery.isError ? (
          <p role="alert" className="text-danger">
            {countsQuery.error instanceof Error
              ? countsQuery.error.message
              : t.dashboard.articleCountsFailed}
          </p>
        ) : (
          <div role="status" className="flex flex-col gap-1">
            <span className="sr-only">{t.dashboard.loadingArticleCounts}</span>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
          </div>
        )
      }
    />
  )
}

export { DashboardArticleStatCard }
