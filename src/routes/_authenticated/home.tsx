import { HomePage } from '@/module/home/pages/home-page'
import { languageSearchSchema } from '@/module/language/schemas/language.schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/home')({
  validateSearch: languageSearchSchema,
  component: HomePage,
  staticData: { title: (t) => t.home.pageTitle },
})
