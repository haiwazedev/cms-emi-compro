import type { Role, RoleFields } from '@/module/user/api/user.api'
import {
  ROLE_LABELS,
  USER_LABELS,
} from '@/module/user/constants/user.constants'
import { roleFormSchema } from '@/module/user/schemas/user-form.schema'
import type { RoleFormValues } from '@/module/user/schemas/user-form.schema'
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
import { Textarea } from '@/shared/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircleIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role
  pending: boolean
  serverError?: string
  onSubmit: (fields: RoleFields) => void
}

// Remount per open (key) so the form starts from the role's current values.
function RoleFormDialog({
  open,
  onOpenChange,
  role,
  pending,
  serverError,
  onSubmit,
}: RoleFormDialogProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name ?? '',
      description: role?.description ?? '',
    },
  })
  const nameError = errors.name?.message ?? serverError

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border/15 border-b">
          <DialogTitle>
            {role ? ROLE_LABELS.editRoleTitle : ROLE_LABELS.addRole}
          </DialogTitle>
          <DialogDescription>{ROLE_LABELS.formDescription}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) =>
            onSubmit({
              name: values.name,
              description: values.description || null,
            }),
          )}
          className="flex flex-col"
        >
          <div className="flex flex-col gap-4 px-5 py-5">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="role-title">{ROLE_LABELS.title}</Label>
              <Input
                id="role-title"
                autoFocus
                maxLength={100}
                disabled={pending}
                aria-invalid={Boolean(nameError)}
                {...register('name')}
              />
              {nameError && (
                <p role="alert" className="text-danger text-sm">
                  {nameError}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="role-description">
                {ROLE_LABELS.roleDescription}
              </Label>
              <Textarea
                id="role-description"
                maxLength={500}
                disabled={pending}
                aria-invalid={Boolean(errors.description)}
                {...register('description')}
              />
              {errors.description && (
                <p role="alert" className="text-danger text-sm">
                  {errors.description.message}
                </p>
              )}
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

export { RoleFormDialog }
