import { LOGIN_LABELS } from '@/module/auth/constants/login.constants'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRightIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { loginSchema, type LoginFormValues } from '../schemas/login.schema'

function LoginForm() {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  })

  return (
    <form
      className="space-y-6"
      noValidate
      onSubmit={handleSubmit(() => undefined)}
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Checkbox id="remember-me" {...register('rememberMe')} />
          <Label htmlFor="remember-me" className="text-secondary">
            {LOGIN_LABELS.rememberMe}
          </Label>
        </div>
        <span className="text-secondary text-sm font-medium">
          {LOGIN_LABELS.forgotPassword}
        </span>
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-14 w-full rounded-xl text-base"
      >
        {LOGIN_LABELS.submit}
        <ArrowRightIcon aria-hidden="true" className="size-4" />
      </Button>
    </form>
  )
}

export { LoginForm }
