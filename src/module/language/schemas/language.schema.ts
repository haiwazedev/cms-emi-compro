import { z } from 'zod'

// `?lang=` on per-language pages; invalid values fall back to the default language.
export const languageSearchSchema = z.object({
  lang: z.string().toLowerCase().optional().catch(undefined),
})
