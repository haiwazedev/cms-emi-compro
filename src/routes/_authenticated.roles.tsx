import { ROLE_LABELS } from '@/module/user/constants/user.constants'
import { RolesPage } from '@/module/user/pages/roles-page'
import { authQueryOptions } from '@/module/auth/queries/auth.queries'
import { getPermissions } from '@/module/auth/hooks/use-permissions'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/roles')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.query(authQueryOptions())

    if (!getPermissions(user).canManageUsers) {
      throw redirect({ to: '/home' })
    }
  },
  component: RolesPage,
  staticData: { title: ROLE_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: ROLE_LABELS.documentTitle }],
  }),
})
