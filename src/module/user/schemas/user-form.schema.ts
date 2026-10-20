import type { Dictionary } from '@/shared/lib/i18n/id'
import { z } from 'zod'

export const NO_ROLE = 'NONE'

export function createUserFormSchema(t: Dictionary) {
  return z.object({
    name: z.string().trim().min(1, t.user.nameRequired).max(100),
    email: z.string().trim().toLowerCase().email(t.user.emailInvalid),
    role: z.string(),
    is_active: z.boolean(),
  })
}

export function createRoleFormSchema(t: Dictionary) {
  return z.object({
    name: z.string().trim().min(1, t.role.titleRequired).max(100),
    description: z.string().trim().max(500),
  })
}

export type UserFormValues = z.infer<ReturnType<typeof createUserFormSchema>>
export type RoleFormValues = z.infer<ReturnType<typeof createRoleFormSchema>>
