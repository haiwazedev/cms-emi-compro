import { forgotPassword } from '@/module/auth/api/auth.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { toast } from '@/shared/lib/toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  createForgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas/forgot-password.schema'
import { AuthField } from './auth-field'
import { BackToLoginLink } from './auth-layout'
import { AuthSubmitButton } from './auth-submit-button'

function ForgotPasswordForm() {
  const { t } = useI18n()
  const forgotMutation = useMutation({
    mutationFn: forgotPassword,
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description: error.message,
        type: 'error',
      })
    },
  })
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(createForgotPasswordSchema(t)),
    defaultValues: { email: '' },
  })

  // The API answers the same whether or not the email exists.
  if (forgotMutation.isSuccess) {
    return (
      <div className="space-y-6">
        <p role="status" className="text-foreground/80 text-base">
          {t.auth.forgotSent}
        </p>
        <BackToLoginLink />
      </div>
    )
  }

  return (
    <form
      className="space-y-6"
      noValidate
      onSubmit={handleSubmit(({ email }) => forgotMutation.mutate(email))}
    >
      <AuthField
        id="email"
        type="email"
        autoComplete="username"
        label={t.auth.email}
        error={errors.email?.message}
        {...register('email')}
      />
      <AuthSubmitButton
        label={t.auth.forgotSubmit}
        pending={forgotMutation.isPending}
      />
      <BackToLoginLink />
    </form>
  )
}

export { ForgotPasswordForm }
