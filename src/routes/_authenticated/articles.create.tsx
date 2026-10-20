import { CreateArticlePage } from '@/module/article/pages/create-article-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/articles/create')({
  component: CreateArticlePage,
  staticData: { title: (t) => t.article.createPageTitle },
})
