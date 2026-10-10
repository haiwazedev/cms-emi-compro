import { CreateArticlePage } from '@/module/article/pages/create-article-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/articles/create')({
  component: CreateArticlePage,
  staticData: { title: 'Buat Artikel' },
  head: () => ({
    meta: [{ title: 'Buat Artikel | PLN EMI Admin' }],
  }),
})
