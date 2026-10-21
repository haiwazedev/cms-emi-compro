import type { Role, User, UserFields } from '@/module/user/api/user.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import {
  NO_ROLE,
  createUserFormSchema,
} from '@/module/user/schemas/user-form.schema'
import type { UserFormValues } from '@/module/user/schemas/user-form.schema'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircleIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User
  roles: Role[]
  pending: boolean
  emailError?: string
  onSubmit: (fields: UserFields) => void
}

// Remount per open (key) so the form starts from the user's current values.
function UserFormDialog({
  open,
  onOpenChange,
  user,
  roles,
  pending,
  emailError,
  onSubmit,
}: UserFormDialogProps) {
  const { t } = useI18n()
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<UserFormValues>({
    resolver: zodResolver(createUserFormSchema(t)),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      role: user?.role ? String(user.role.id) : NO_ROLE,
      is_active: user?.is_active ?? true,
    },
  })
  const emailMessage = errors.email?.message ?? emailError

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border border-b">
          <DialogTitle>
            {user ? t.user.editUserTitle : t.user.addUser}
          </DialogTitle>
          <DialogDescription>{t.user.formDescription}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(({ role, ...values }) =>
            onSubmit({
              ...values,
              role_id: role === NO_ROLE ? null : Number(role),
            }),
          )}
          className="flex flex-col"
        >
          <div className="flex flex-col gap-4 px-5 py-5">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-name">{t.user.name}</Label>
              <Input
                id="user-name"
                autoFocus
                maxLength={100}
                disabled={pending}
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
              {errors.name && (
                <p role="alert" className="text-danger text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-email">{t.user.email}</Label>
              <Input
                id="user-email"
                type="email"
                disabled={pending}
                aria-invalid={Boolean(emailMessage)}
                {...register('email')}
              />
              {emailMessage && (
                <p role="alert" className="text-danger text-sm">
                  {emailMessage}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-role">{t.user.role}</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={pending}
                  >
                    <SelectTrigger id="user-role">
                      <SelectValue placeholder={t.user.rolePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_ROLE}>{t.user.noRole}</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-active">{t.user.status}</Label>
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <Switch
                      id="user-active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={pending}
                    />
                    <span className="text-sm">
                      {field.value ? t.user.active : t.user.inactive}
                    </span>
                  </div>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <LoaderCircleIcon
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                  {t.user.saving}
                </>
              ) : (
                t.common.save
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { UserFormDialog }
