import { login } from '@/module/auth/api/auth.api'
import { authQueryKey } from '@/module/auth/queries/auth.queries'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { toast } from '@/shared/lib/toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRightIcon, LoaderCircleIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
      <div className="space-y-2">
        <Label htmlFor="email" className="text-accent">
          {t.auth.email} <span className="text-danger">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="username"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className="h-14 rounded-xl px-4 text-base"
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-danger text-sm">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-accent">
          {t.auth.password} <span className="text-danger">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'password-error' : undefined}
          className="h-14 rounded-xl px-4 text-base"
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" role="alert" className="text-danger text-sm">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <span className="text-secondary text-sm font-medium">
          {t.auth.forgotPassword}
        </span>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={loginMutation.isPending}
        className="h-14 w-full rounded-xl text-base"
      >
        {loginMutation.isPending ? (
          <>
            {t.auth.submitting}
            <LoaderCircleIcon
              aria-hidden="true"
              className="size-4 animate-spin"
            />
          </>
        ) : (
          <>
            {t.auth.submit}
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </>
        )}
      </Button>
    </form>
  )
}

export { LoginForm }
