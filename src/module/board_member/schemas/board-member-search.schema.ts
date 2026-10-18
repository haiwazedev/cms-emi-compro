import { z } from 'zod'

const languageSearch = z.string().toLowerCase().optional().catch(undefined)

export const boardMemberSearchSchema = z.object({
  lang: languageSearch,
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

export const boardMemberTypeSearchSchema = z.object({
  lang: languageSearch,
})

export type BoardMemberSearch = z.infer<typeof boardMemberSearchSchema>
