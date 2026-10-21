import { ArticleCategoriesPage } from '@/module/article/pages/article-categories-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/article_categories')({
  component: ArticleCategoriesPage,
  staticData: { title: (t) => t.article.categoryPageTitle },
})
