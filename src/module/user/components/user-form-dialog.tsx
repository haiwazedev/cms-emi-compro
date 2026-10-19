import type { Role, User, UserFields } from '@/module/user/api/user.api'
import { USER_LABELS } from '@/module/user/constants/user.constants'
import { NO_ROLE, userFormSchema } from '@/module/user/schemas/user-form.schema'
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
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
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
            {user ? USER_LABELS.editUserTitle : USER_LABELS.addUser}
          </DialogTitle>
          <DialogDescription>{USER_LABELS.formDescription}</DialogDescription>
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
              <Label htmlFor="user-name">{USER_LABELS.name}</Label>
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
              <Label htmlFor="user-email">{USER_LABELS.email}</Label>
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
              <Label htmlFor="user-role">{USER_LABELS.role}</Label>
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
                      <SelectValue placeholder={USER_LABELS.rolePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_ROLE}>
                        {USER_LABELS.noRole}
                      </SelectItem>
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
              <Label htmlFor="user-active">{USER_LABELS.status}</Label>
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
                      {field.value ? USER_LABELS.active : USER_LABELS.inactive}
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
              {USER_LABELS.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <LoaderCircleIcon
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                  {USER_LABELS.saving}
                </>
              ) : (
                USER_LABELS.save
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { UserFormDialog }
