import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import type { ComponentProps } from 'react'

type AuthFieldProps = ComponentProps<typeof Input> & {
  id: string
  label: string
  error?: string
  hint?: string
}

function AuthField({ id, label, error, hint, ...inputProps }: AuthFieldProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error && errorId, hint && hintId]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-accent">
        {label} <span className="text-danger">*</span>
      </Label>
      <Input
        id={id}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        className="h-14 rounded-xl px-4 text-base"
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="text-muted text-sm">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
    </div>
  )
}

export { AuthField }
