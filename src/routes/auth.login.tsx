import { LOGIN_LABELS } from '@/module/auth/constants/login.constants'
import { LoginPage } from '@/module/auth/pages/login-page'
import { authQueryOptions } from '@/module/auth/queries/auth.queries'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/login')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.query(authQueryOptions())

    if (user) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LoginPage,
  head: () => ({
    meta: [{ title: LOGIN_LABELS.pageTitle }],
  }),
})
