import { z } from 'zod'
import type { Dictionary } from '@/shared/lib/i18n/id'

// Mirrors the backend rule so users see each failure before submitting.
export function createActivateSchema(t: Dictionary) {
  return z
    .object({
      password: z
        .string()
        .min(8, { error: t.auth.passwordMinLength })
        .max(128, { error: t.auth.passwordMaxLength })
        .regex(/[A-Z]/, { error: t.auth.passwordUppercase })
        .regex(/[0-9]/, { error: t.auth.passwordNumber })
        .regex(/[^A-Za-z0-9]/, { error: t.auth.passwordSymbol }),
      confirmPassword: z.string(),
    })
    .refine((values) => values.password === values.confirmPassword, {
      error: t.auth.passwordMismatch,
      path: ['confirmPassword'],
    })
}

export type ActivateFormValues = z.infer<
  ReturnType<typeof createActivateSchema>
>
