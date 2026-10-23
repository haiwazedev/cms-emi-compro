import { z } from 'zod'
import type { Dictionary } from '@/shared/lib/i18n/id'

export function createForgotPasswordSchema(t: Dictionary) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, { error: t.auth.emailRequired })
      .pipe(z.email({ error: t.auth.emailInvalid })),
  })
}

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>
