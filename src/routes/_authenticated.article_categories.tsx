import { ARTICLE_LABELS } from '@/module/article/constants/article.constants'
import { ArticleCategoriesPage } from '@/module/article/pages/article-categories-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/article_categories')({
  component: ArticleCategoriesPage,
  staticData: { title: ARTICLE_LABELS.categoryPageTitle },
  head: () => ({
    meta: [{ title: ARTICLE_LABELS.categoryDocumentTitle }],
  }),
})
