import { DIVISION_LABELS } from '@/module/division/constants/division.constants'
import { DivisionsPage } from '@/module/division/pages/divisions-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/divisions')({
  component: DivisionsPage,
  staticData: { title: DIVISION_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: DIVISION_LABELS.documentTitle }],
  }),
})
