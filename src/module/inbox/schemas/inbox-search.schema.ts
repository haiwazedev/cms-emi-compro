import { z } from 'zod'

export const inboxSearchSchema = z.object({
  search: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional()
    .catch(undefined),
  inbox_subject_id: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .catch(undefined),
})

export type InboxSearch = z.infer<typeof inboxSearchSchema>
