import { ArticleForm } from '@/module/article/components/article-form'
import { ARTICLE_LABELS } from '@/module/article/constants/article.constants'
import { ArticleLoadState } from '@/module/article/pages/edit-article-page'
import { languagesQueryOptions } from '@/module/language/queries/language.queries'
import { useQuery } from '@tanstack/react-query'

function CreateArticlePage() {
  const languagesQuery = useQuery(languagesQueryOptions())

  if (languagesQuery.isPending) {
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

  return <ArticleForm mode="create" languages={languagesQuery.data} />
}

export { CreateArticlePage }
