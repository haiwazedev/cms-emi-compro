import { z } from 'zod'

export const divisionSearchSchema = z.object({
  lang: z.string().toLowerCase().optional().catch(undefined),
})
