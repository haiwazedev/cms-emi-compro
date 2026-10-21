import { FaqsPage } from '@/module/faq/pages/faqs-page'
import { languageSearchSchema } from '@/module/language/schemas/language.schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/faqs')({
  validateSearch: languageSearchSchema,
  component: FaqsPage,
  staticData: { title: (t) => t.faq.pageTitle },
})
