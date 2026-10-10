import { DASHBOARD_LABELS } from '@/module/dashboard/constants/dashboard.constants'
import { DashboardPage } from '@/module/dashboard/pages/dashboard-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: DASHBOARD_LABELS.documentTitle }],
  }),
})
