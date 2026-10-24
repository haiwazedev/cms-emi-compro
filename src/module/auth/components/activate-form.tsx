import { activateAccount } from '@/module/auth/api/auth.api'
import { authQueryKey } from '@/module/auth/queries/auth.queries'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { toast } from '@/shared/lib/toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import {
  createActivateSchema,
  type ActivateFormValues,
} from '../schemas/activate.schema'
import { AuthField } from './auth-field'
import { BackToLoginLink } from './auth-layout'
import { AuthSubmitButton } from './auth-submit-button'

function ActivateForm({ token }: { token: string }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const activateMutation = useMutation({
    mutationFn: (password: string) => activateAccount(token, password),
    onSuccess: async () => {
      toast.add({
        title: t.common.success,
        description: t.auth.activateSuccess,
        type: 'success',
      })
      // The password change ends any existing session, so drop the cached user.
      queryClient.removeQueries({ queryKey: authQueryKey })
      await navigate({ to: '/auth/login' })
    },
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
  } = useForm<ActivateFormValues>({
    resolver: zodResolver(createActivateSchema(t)),
    defaultValues: { password: '', confirmPassword: '' },
  })

  return (
    <form
      className="space-y-6"
      noValidate
      onSubmit={handleSubmit(({ password }) =>
        activateMutation.mutate(password),
      )}
    >
      <AuthField
        id="password"
        type="password"
        autoComplete="new-password"
        label={t.auth.newPassword}
        hint={t.auth.passwordHint}
        error={errors.password?.message}
        {...register('password')}
      />
      <AuthField
        id="confirm-password"
        type="password"
        autoComplete="new-password"
        label={t.auth.confirmPassword}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <AuthSubmitButton
        label={t.auth.activateSubmit}
        pending={activateMutation.isPending}
      />
      <BackToLoginLink />
    </form>
  )
}

export { ActivateForm }
