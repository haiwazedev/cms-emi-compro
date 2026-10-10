import { EditArticlePage } from '@/module/article/pages/edit-article-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/articles/$articleId/edit',
)({
  component: EditArticleRoute,
  staticData: { title: 'Ubah Artikel' },
  head: () => ({
    meta: [{ title: 'Ubah Artikel | PLN EMI Admin' }],
  }),
})

function EditArticleRoute() {
  const { articleId } = Route.useParams()
  return <EditArticlePage articleId={articleId} />
}
