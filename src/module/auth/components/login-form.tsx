import { LOGIN_LABELS } from '@/module/auth/constants/login.constants'
import { login } from '@/module/auth/api/auth.api'
import { authQueryKey } from '@/module/auth/queries/auth.queries'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { toast } from '@/shared/lib/toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRightIcon, LoaderCircleIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { loginSchema, type LoginFormValues } from '../schemas/login.schema'

function LoginForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (user) => {
      toast.add({
        title: 'Success',
        description: LOGIN_LABELS.loginSuccess,
        type: 'success',
      })
      queryClient.setQueryData(authQueryKey, user)
      await navigate({ to: '/dashboard' })
    },
    onError: (error) => {
      toast.add({
        title: 'Error',
        description:
          error instanceof Error ? error.message : LOGIN_LABELS.loginFailed,
        type: 'error',
      })
    },
  })
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
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
          {LOGIN_LABELS.email} <span className="text-danger">*</span>
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
          {LOGIN_LABELS.password} <span className="text-danger">*</span>
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
          {LOGIN_LABELS.forgotPassword}
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
            {LOGIN_LABELS.submitting}
            <LoaderCircleIcon
              aria-hidden="true"
              className="size-4 animate-spin"
            />
          </>
        ) : (
          <>
            {LOGIN_LABELS.submit}
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </>
        )}
      </Button>
    </form>
  )
}

export { LoginForm }
