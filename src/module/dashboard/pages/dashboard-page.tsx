import { DASHBOARD_LABELS } from '../constants/dashboard.constants'
import { DashboardTopbar } from '../components/dashboard-topbar'
import { NavigationSidebar } from '@/module/nav/components/navigation-sidebar'

function DashboardPage() {
  return (
    <div className="bg-primary flex min-h-screen">
      <div className="hidden lg:flex">
        <NavigationSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main aria-label={DASHBOARD_LABELS.mainContent} className="flex-1" />
      </div>
    </div>
  )
}

export { DashboardPage }
