import { NavigationSidebar } from '@/module/nav/components/navigation-sidebar'
import { NavigationTopbar } from '@/module/nav/components/navigation-topbar'
import { NAVIGATION_LABELS } from '@/module/nav/constants/navigation.constants'
import { Outlet, useMatches } from '@tanstack/react-router'

function AuthenticatedLayout() {
  const pageTitle = useMatches({
    select: (matches) => {
      const staticData = matches.at(-1)?.staticData as
        { title?: unknown } | undefined

      return typeof staticData?.title === 'string' ? staticData.title : ''
    },
  })

  return (
    <div className="bg-primary flex min-h-screen">
      <div className="hidden lg:flex">
        <NavigationSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <NavigationTopbar title={pageTitle} />
        <main aria-label={NAVIGATION_LABELS.mainContent} className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export { AuthenticatedLayout }
