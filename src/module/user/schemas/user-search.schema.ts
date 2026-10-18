import { USER_DEFAULT_PAGE_SIZE } from '../constants/user.constants'
import { z } from 'zod'

export const userSearchSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .catch(1)
    .optional()
    .transform((value) => value ?? 1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .catch(USER_DEFAULT_PAGE_SIZE)
    .optional()
    .transform((value) => value ?? USER_DEFAULT_PAGE_SIZE),
  search: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional()
    .catch(undefined),
  role_id: z.coerce.number().int().positive().optional().catch(undefined),
})

export type UserSearch = z.infer<typeof userSearchSchema>
