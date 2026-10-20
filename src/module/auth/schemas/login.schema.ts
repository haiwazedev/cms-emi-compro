import { z } from 'zod'
import type { Dictionary } from '@/shared/lib/i18n/id'

export function createLoginSchema(t: Dictionary) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, { error: t.auth.emailRequired })
      .pipe(z.email({ error: t.auth.emailInvalid })),
    password: z.string().min(1, { error: t.auth.passwordRequired }),
  })
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>
