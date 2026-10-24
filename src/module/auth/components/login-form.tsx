import { login } from '@/module/auth/api/auth.api'
import { authQueryKey } from '@/module/auth/queries/auth.queries'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { toast } from '@/shared/lib/toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { AuthField } from './auth-field'
import { AuthSubmitButton } from './auth-submit-button'
import {
  createLoginSchema,
  type LoginFormValues,
} from '../schemas/login.schema'

function LoginForm() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (user) => {
      toast.add({
        title: t.common.success,
        description: t.auth.loginSuccess,
        type: 'success',
      })
      queryClient.setQueryData(authQueryKey, user)
      await navigate({ to: '/dashboard' })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error ? error.message : t.auth.loginFailed,
        type: 'error',
      })
    },
  })
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  return (
    <form
      className="space-y-6"
      noValidate
      onSubmit={handleSubmit(({ email, password }) =>
        loginMutation.mutate({ email, password }),
      )}
    >
      <AuthField
        id="email"
        type="email"
        autoComplete="username"
        label={t.auth.email}
        error={errors.email?.message}
        {...register('email')}
      />

      <AuthField
        id="password"
        type="password"
        autoComplete="current-password"
        label={t.auth.password}
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="flex justify-end">
        <Link
          to="/auth/forgot-password"
          className="text-secondary text-sm font-medium hover:underline"
        >
          {t.auth.forgotPassword}
        </Link>
      </div>

      <AuthSubmitButton
        label={t.auth.submit}
        pending={loginMutation.isPending}
      />
    </form>
  )
}

export { LoginForm }
