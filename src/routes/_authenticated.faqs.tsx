import { FAQ_LABELS } from '@/module/faq/constants/faq.constants'
import { FaqsPage } from '@/module/faq/pages/faqs-page'
import { languageSearchSchema } from '@/module/language/schemas/language.schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/faqs')({
  validateSearch: languageSearchSchema,
  component: FaqsPage,
  staticData: { title: FAQ_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: FAQ_LABELS.documentTitle }],
  }),
})
