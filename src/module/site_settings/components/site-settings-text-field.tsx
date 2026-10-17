import { SITE_SETTINGS_LABELS } from '@/module/site_settings/constants/site-settings.constants'
import type { SiteSettingsFormValues } from '@/module/site_settings/schemas/site-settings.schema'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import type { ComponentProps } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

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
  notConfigured?: boolean
}

function SiteSettingsTextField({
  name,
  label,
  required,
  maxLength,
  notConfigured = false,
  ...props
}: SiteSettingsTextFieldProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<SiteSettingsFormValues>()
  const value = useWatch({ control, name })
  const id = `site-settings-${name}`
  const error = notConfigured
    ? SITE_SETTINGS_LABELS.notConfigured
    : errors[name]?.message

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-danger">*</span>}
      </Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        maxLength={maxLength}
        {...props}
        {...register(name)}
        disabled={notConfigured}
      />
      {maxLength && (
        <p className="text-foreground/55 text-xs">
          {value.length + ` / ${maxLength} karakter`}
        </p>
      )}
      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
    </div>
  )
}

export { SiteSettingsTextField }
