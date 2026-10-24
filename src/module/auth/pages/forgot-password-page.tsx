import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { AuthLayout } from '../components/auth-layout'
import { ForgotPasswordForm } from '../components/forgot-password-form'

function ForgotPasswordPage() {
  const { t } = useI18n()

  return (
    <AuthLayout
      title={t.auth.forgotTitle}
      description={t.auth.forgotDescription}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}

export { ForgotPasswordPage }
