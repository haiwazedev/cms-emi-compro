import { articleQueryOptions } from '@/module/article/queries/article.queries'
import { ARTICLE_LABELS } from '@/module/article/constants/article.constants'
import { ArticleForm } from '@/module/article/components/article-form'
import { languagesQueryOptions } from '@/module/language/queries/language.queries'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { ApiError } from '@/shared/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'

function EditArticlePage({ articleId: articleIdParam }: { articleId: string }) {
  const articleId = Number(articleIdParam)
  const hasValidId = Number.isSafeInteger(articleId) && articleId > 0
  const articleQuery = useQuery({
    ...articleQueryOptions(articleId),
    enabled: hasValidId,
    retry: false,
  })
  const languagesQuery = useQuery(languagesQueryOptions())
  const { lang } = useSearch({
    from: '/_authenticated/articles/$articleId/edit',
  })
  const navigate = useNavigate({ from: '/articles/$articleId/edit' })
  const article = articleQuery.data
  const languages = languagesQuery.data ?? []
  const urlLanguage = languages.find(
    (item) => item.abbreviated_language === lang,
  )
  // Fallback: the first language with content, else the first language.
  const fallbackLanguage =
    languages.find((item) =>
      article?.contents.some((content) => content.language_id === item.id),
    ) ?? languages[0]
  const language = urlLanguage ?? fallbackLanguage

  useEffect(() => {
    if (!article || urlLanguage || !fallbackLanguage) return

    void navigate({
      search: { lang: fallbackLanguage.abbreviated_language },
      replace: true,
    })
  }, [article, fallbackLanguage, navigate, urlLanguage])

  if (!hasValidId) {
    return <ArticleLoadState message={ARTICLE_LABELS.articleNotFound} />
  }

  if (articleQuery.isPending || languagesQuery.isPending) {
    return <ArticleLoadState message={ARTICLE_LABELS.loadingArticles} />
  }

  if (languagesQuery.isError || !language) {
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
      languages={languages}
      languageId={language.id}
      onLanguageChange={(id) => {
        const nextLanguage = languages.find((item) => item.id === id)
        if (!nextLanguage) return

        // The form already confirmed discarding changes.
        void navigate({
          search: { lang: nextLanguage.abbreviated_language },
          ignoreBlocker: true,
        })
      }}
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
