import type { SiteSettingsFormValues } from '@/module/site_settings/schemas/site-settings.schema'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import type { ComponentProps } from 'react'
import { useFormContext } from 'react-hook-form'

type TextFieldName = {
  [
    Key in keyof SiteSettingsFormValues
  ]: SiteSettingsFormValues[Key] extends string ? Key : never
}[keyof SiteSettingsFormValues]

interface SiteSettingsTextFieldProps extends Omit<
  ComponentProps<'input'>,
  'name'
> {
  name: TextFieldName
  label: string
}

function SiteSettingsTextField({
  name,
  label,
  required,
  ...props
}: SiteSettingsTextFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<SiteSettingsFormValues>()
  const id = `site-settings-${name}`
  const error = errors[name]?.message

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-danger">*</span>}
      </Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        {...props}
        {...register(name)}
      />
      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
    </div>
  )
}

export { SiteSettingsTextField }
