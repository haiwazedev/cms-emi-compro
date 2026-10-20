import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import type { Dictionary } from './shared/lib/i18n/id'

export const queryClient = new QueryClient()

export const router = createRouter({
  routeTree,
  context: { queryClient },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }

  interface StaticDataRouteOption {
    // Topbar page title, resolved with the active locale.
    title?: (t: Dictionary) => string
  }
}
