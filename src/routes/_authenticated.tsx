import { authQueryOptions } from '@/module/auth/queries/auth.queries'
import { AuthenticatedLayout } from '@/module/nav/layouts/authenticated-layout'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.query(authQueryOptions())

    if (!user) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: AuthenticatedLayout,
})
