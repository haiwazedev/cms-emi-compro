import { z } from 'zod'
import { LOGIN_LABELS } from '../constants/login.constants'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { error: LOGIN_LABELS.emailRequired })
    .pipe(z.email({ error: LOGIN_LABELS.emailInvalid })),
  password: z.string().min(1, { error: LOGIN_LABELS.passwordRequired }),
  rememberMe: z.boolean(),
})

export type LoginFormValues = z.infer<typeof loginSchema>
