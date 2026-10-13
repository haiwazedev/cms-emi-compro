import { FAQ_LABELS } from '@/module/faq/constants/faq.constants'
import { FaqsPage } from '@/module/faq/pages/faqs-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/faqs')({
  component: FaqsPage,
  staticData: { title: FAQ_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: FAQ_LABELS.documentTitle }],
  }),
})
