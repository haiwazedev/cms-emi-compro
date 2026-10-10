import { authQueryOptions } from '@/module/auth/queries/auth.queries'
import { DASHBOARD_LABELS } from '@/module/dashboard/constants/dashboard.constants'
import { DashboardPage } from '@/module/dashboard/pages/dashboard-page'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.query(authQueryOptions())

    if (!user) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: DashboardPage,
  head: () => ({
    meta: [{ title: DASHBOARD_LABELS.documentTitle }],
  }),
})
