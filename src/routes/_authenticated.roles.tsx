import { ROLE_LABELS } from '@/module/user/constants/user.constants'
import { RolesPage } from '@/module/user/pages/roles-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/roles')({
  component: RolesPage,
  staticData: { title: ROLE_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: ROLE_LABELS.documentTitle }],
  }),
})
