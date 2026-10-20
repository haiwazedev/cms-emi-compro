import type { Role, RoleFields } from '@/module/user/api/user.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { createRoleFormSchema } from '@/module/user/schemas/user-form.schema'
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
import { useForm, useWatch } from 'react-hook-form'

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
  const { t } = useI18n()
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<RoleFormValues>({
    resolver: zodResolver(createRoleFormSchema(t)),
    defaultValues: {
      name: role?.name ?? '',
      description: role?.description ?? '',
    },
  })
  const nameError = errors.name?.message ?? serverError
  const nameValue = useWatch({ control, name: 'name' })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border border-b">
          <DialogTitle>
            {role ? t.role.editRoleTitle : t.role.addRole}
          </DialogTitle>
          <DialogDescription>{t.role.formDescription}</DialogDescription>
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
              <Label htmlFor="role-title">{t.role.title}</Label>
              <Input
                id="role-title"
                autoFocus
                maxLength={100}
                disabled={pending}
                aria-invalid={Boolean(nameError)}
                {...register('name')}
              />
              <p className="text-foreground/55 text-xs">
                {t.common.characterCount(nameValue.length, 100)}
              </p>
              {nameError && (
                <p role="alert" className="text-danger text-sm">
                  {nameError}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="role-description">{t.role.roleDescription}</Label>
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

export { RoleFormDialog }
