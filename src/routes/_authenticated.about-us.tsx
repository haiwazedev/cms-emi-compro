import { AboutUsPage } from '@/module/about-us/pages/about-us-page'
import { languageSearchSchema } from '@/module/language/schemas/language.schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/about-us')({
  validateSearch: languageSearchSchema,
  component: AboutUsPage,
  staticData: { title: (t) => t.aboutUs.pageTitle },
})
