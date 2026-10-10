import { z } from 'zod'

export const mediaSearchSchema = z.object({
  search: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional()
    .catch(undefined),
  type: z.enum(['PICTURE', 'DOCUMENT']).optional().catch(undefined),
  sort_order: z
    .enum(['asc', 'desc'])
    .catch('desc')
    .optional()
    .transform((value) => value ?? 'desc'),
})

export type MediaSearch = z.infer<typeof mediaSearchSchema>
