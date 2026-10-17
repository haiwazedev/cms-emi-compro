import { articleQueryOptions } from '@/module/article/queries/article.queries'
import { ARTICLE_LABELS } from '@/module/article/constants/article.constants'
import { ArticleForm } from '@/module/article/components/article-form'
import { languagesQueryOptions } from '@/module/language/queries/language.queries'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { ApiError } from '@/shared/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

function EditArticlePage({ articleId: articleIdParam }: { articleId: string }) {
  const articleId = Number(articleIdParam)
  const hasValidId = Number.isSafeInteger(articleId) && articleId > 0
  const articleQuery = useQuery({
    ...articleQueryOptions(articleId),
    enabled: hasValidId,
    retry: false,
  })
  const languagesQuery = useQuery(languagesQueryOptions())

  if (!hasValidId) {
    return <ArticleLoadState message={ARTICLE_LABELS.articleNotFound} />
  }

  if (articleQuery.isPending || languagesQuery.isPending) {
    return <ArticleLoadState message={ARTICLE_LABELS.loadingArticles} />
  }

  if (languagesQuery.isError || languagesQuery.data.length === 0) {
    return (
      <ArticleLoadState
        message={
          languagesQuery.isError
            ? ARTICLE_LABELS.languagesFailed
            : ARTICLE_LABELS.noLanguages
        }
      />
    )
  }

  if (articleQuery.isError) {
    const message =
      articleQuery.error instanceof ApiError &&
      articleQuery.error.status === 404
        ? ARTICLE_LABELS.articleNotFound
        : articleQuery.error instanceof Error
          ? articleQuery.error.message
          : ARTICLE_LABELS.articlesFailed

    return <ArticleLoadState message={message} />
  }

  return (
    <ArticleForm
      key={articleQuery.data.id}
      mode="edit"
      article={articleQuery.data}
      languages={languagesQuery.data}
    />
  )
}

function ArticleLoadState({ message }: { message: string }) {
  return (
    <div className="bg-primary flex min-h-full items-center justify-center p-4 lg:p-8">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <p role="status" className="text-foreground/70 text-sm">
            {message}
          </p>
          <Button asChild variant="outline">
            <Link to="/articles">{ARTICLE_LABELS.backToArticles}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export { ArticleLoadState, EditArticlePage }
