import { ABOUT_US_LABELS } from '@/module/about-us/constants/about-us.constants'
import { AboutUsPage } from '@/module/about-us/pages/about-us-page'
import { languageSearchSchema } from '@/module/language/schemas/language.schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/about-us')({
  validateSearch: languageSearchSchema,
  component: AboutUsPage,
  staticData: { title: ABOUT_US_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: ABOUT_US_LABELS.documentTitle }],
  }),
})
