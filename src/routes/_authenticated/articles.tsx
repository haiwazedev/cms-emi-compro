import { ArticlesPage } from '@/module/article/pages/articles-page'
import { articleSearchSchema } from '@/module/article/schemas/article-search.schema'
import {
  createFileRoute,
  Outlet,
  stripSearchParams,
  useLocation,
} from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/articles')({
  validateSearch: articleSearchSchema,
  search: {
    middlewares: [
      stripSearchParams({ page: 1, limit: 10, sort_order: 'desc' }),
    ],
  },
  component: ArticlesRoute,
  staticData: { title: (t) => t.article.pageTitle },
})

function ArticlesRoute() {
  const { pathname } = useLocation()

  return pathname === '/articles' ? <ArticlesPage /> : <Outlet />
}
