import { ArticleForm } from '@/module/article/components/article-form'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { ArticleLoadState } from '@/module/article/pages/edit-article-page'
import { findDefaultLanguage } from '@/module/language/constants/language.constants'
import { languagesQueryOptions } from '@/module/language/queries/language.queries'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

function CreateArticlePage() {
  const { t } = useI18n()
  const languagesQuery = useQuery(languagesQueryOptions())
  // Always starts on the default language; no `lang` param on create.
  const [languageId, setLanguageId] = useState<string>()

  if (languagesQuery.isPending) {
    return <ArticleLoadState message={t.article.loadingArticles} />
  }

  if (languagesQuery.isError || languagesQuery.data.length === 0) {
    return (
      <ArticleLoadState
        message={
          languagesQuery.isError
            ? t.article.languagesFailed
            : t.article.noLanguages
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
      languageId={languageId ?? findDefaultLanguage(languagesQuery.data).id}
      onLanguageChange={setLanguageId}
    />
  )
}

export { CreateArticlePage }
