import { LOGIN_LABELS } from '@/module/auth/constants/login.constants'
import { LoginPage } from '@/module/auth/pages/login-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
  head: () => ({
    meta: [{ title: LOGIN_LABELS.pageTitle }],
  }),
})
