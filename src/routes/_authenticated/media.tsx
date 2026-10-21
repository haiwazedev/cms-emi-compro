import { MediaPage } from '@/module/media/pages/media-page'
import { mediaSearchSchema } from '@/module/media/schemas/media-search.schema'
import { createFileRoute, stripSearchParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/media')({
  validateSearch: mediaSearchSchema,
  search: {
    middlewares: [stripSearchParams({ sort_order: 'desc' })],
  },
  component: MediaPage,
  staticData: { title: (t) => t.media.pageTitle },
})
