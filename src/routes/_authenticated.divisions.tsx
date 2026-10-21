import { DivisionsPage } from '@/module/division/pages/divisions-page'
import { divisionSearchSchema } from '@/module/division/schemas/division-search.schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/divisions')({
  validateSearch: divisionSearchSchema,
  component: DivisionsPage,
  staticData: { title: (t) => t.division.pageTitle },
})
