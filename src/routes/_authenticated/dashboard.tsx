import { DashboardPage } from '@/module/dashboard/pages/dashboard-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
  staticData: { title: (t) => t.nav.dashboard },
})
