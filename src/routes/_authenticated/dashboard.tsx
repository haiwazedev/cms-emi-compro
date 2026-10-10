import { DASHBOARD_LABELS } from '@/module/dashboard/constants/dashboard.constants'
import { DashboardPage } from '@/module/dashboard/pages/dashboard-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
  staticData: { title: DASHBOARD_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: DASHBOARD_LABELS.documentTitle }],
  }),
})
