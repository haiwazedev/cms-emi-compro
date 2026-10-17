import { ArticleForm } from '@/module/article/components/article-form'
import { ARTICLE_LABELS } from '@/module/article/constants/article.constants'
import { ArticleLoadState } from '@/module/article/pages/edit-article-page'
import { languagesQueryOptions } from '@/module/language/queries/language.queries'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

function CreateArticlePage() {
  const languagesQuery = useQuery(languagesQueryOptions())
  // Always starts on the default language; no `lang` param on create.
  const [languageId, setLanguageId] = useState<number>()

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

  return (
    <ArticleForm
      // Remount per language: switching discards every unsaved edit.
      key={languageId}
      mode="create"
      languages={languagesQuery.data}
      languageId={languageId ?? languagesQuery.data[0].id}
      onLanguageChange={setLanguageId}
    />
  )
}

export { CreateArticlePage }
