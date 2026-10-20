import { NavigationSidebar } from '@/module/nav/components/navigation-sidebar'
import { NavigationTopbar } from '@/module/nav/components/navigation-topbar'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { Outlet, useMatches } from '@tanstack/react-router'

function AuthenticatedLayout() {
  const { t } = useI18n()
  const pageTitle = useMatches({
    select: (matches) => {
      const staticData = matches.at(-1)?.staticData as
        { title?: unknown } | undefined

      return typeof staticData?.title === 'string' ? staticData.title : ''
    },
  })

  return (
    <div className="bg-primary flex min-h-screen">
      <div className="sticky top-0 hidden h-screen lg:flex">
        <NavigationSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col lg:h-screen">
        <NavigationTopbar title={pageTitle} />
        <main
          aria-label={t.nav.mainContent}
          className="flex-1 lg:min-h-0 lg:overflow-y-auto"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export { AuthenticatedLayout }
