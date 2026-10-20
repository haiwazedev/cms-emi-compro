import type { ArticleListItem } from '@/module/article/api/article.api'
import { ArticleDataTable } from '@/module/article/components/article-data-table'
import { ArticleDeleteDialog } from '@/module/article/components/article-delete-dialog'
import { articlesQueryOptions } from '@/module/article/queries/article.queries'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { Button } from '@/shared/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowRightIcon } from 'lucide-react'
import { useState } from 'react'

const LATEST_ARTICLE_PARAMS = {
  page: 1,
  limit: 4,
  sort_by: 'issue_date',
  sort_order: 'desc',
} as const

function DashboardLatestArticles() {
  const { t } = useI18n()
  const articlesQuery = useQuery(articlesQueryOptions(LATEST_ARTICLE_PARAMS))
  const articles = articlesQuery.data?.articles ?? []
  const [articleToDelete, setArticleToDelete] =
    useState<ArticleListItem | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold">
          {t.dashboard.latestArticles}
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link to="/articles">
            {t.dashboard.viewAll}
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </CardHeader>

      {articlesQuery.isPending ? (
        <LatestArticlesMessage
          role="status"
          message={t.article.loadingArticles}
        />
      ) : articlesQuery.isError ? (
        <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
          <p role="alert" className="text-danger text-sm">
            {articlesQuery.error.message || t.article.articlesFailed}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void articlesQuery.refetch()}
          >
            {t.common.retry}
          </Button>
        </div>
      ) : articles.length === 0 ? (
        <LatestArticlesMessage message={t.article.noArticles} />
      ) : (
        <ArticleDataTable
          compact
          articles={articles}
          onDeleteArticle={setArticleToDelete}
        />
      )}

      <ArticleDeleteDialog
        article={articleToDelete}
        onClose={() => setArticleToDelete(null)}
      />
    </Card>
  )
}

function LatestArticlesMessage({
  message,
  role,
}: {
  message: string
  role?: 'status'
}) {
  return (
    <p
      role={role}
      className="text-foreground/60 border-border border-t px-4 py-12 text-center text-sm"
    >
      {message}
    </p>
  )
}

export { DashboardLatestArticles }
