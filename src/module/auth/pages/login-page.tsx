import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { AuthLayout } from '../components/auth-layout'
import { LoginForm } from '../components/login-form'

function LoginPage() {
  const { t } = useI18n()

  return (
    <AuthLayout title={t.auth.title} description={t.auth.description}>
      <LoginForm />
    </AuthLayout>
  )
}

export { LoginPage }
