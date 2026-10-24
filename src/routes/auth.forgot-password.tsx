import { ForgotPasswordPage } from '@/module/auth/pages/forgot-password-page'
import { authQueryOptions } from '@/module/auth/queries/auth.queries'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/forgot-password')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.query(authQueryOptions())

    if (user) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: ForgotPasswordPage,
})
