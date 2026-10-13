import { z } from 'zod'

export const boardMemberSearchSchema = z.object({
  search: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional()
    .catch(undefined),
  board_member_type_id: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .catch(undefined),
})

export type BoardMemberSearch = z.infer<typeof boardMemberSearchSchema>
